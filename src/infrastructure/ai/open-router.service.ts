import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const OPEN_ROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Free-tier catalog shifts constantly (models get delisted/rate-limited).
 * These ride along after whatever OPEN_ROUTER_MODEL is configured, so
 * OpenRouter's own `models` fallback tries the next one automatically.
 * OpenRouter caps this array at 3 entries total, so keep only 2 fallbacks here.
 */
const FALLBACK_FREE_MODELS = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'openai/gpt-oss-20b:free',
];

@Injectable()
export class OpenRouterService {
  private readonly apiKey: string;
  private readonly models: string[];

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPEN_ROUTER_API_KEY');
    if (!apiKey) throw new Error('OPEN_ROUTER_API_KEY is missing');

    this.apiKey = apiKey;

    const primary = this.configService.get<string>('OPEN_ROUTER_MODEL')!;
    this.models = [primary, ...FALLBACK_FREE_MODELS.filter((m) => m !== primary)].slice(0, 3);
  }

  /** The primary model this instance was configured with (first in the fallback chain). */
  get primaryModel(): string {
    return this.models[0];
  }

  /**
   * Sends a system + user prompt pair to OpenRouter and returns the raw text reply
   * plus which model in the fallback chain actually answered (lets callers detect
   * when OpenRouter silently switched away from the primary model).
   * Passes a `models` fallback chain — if the primary model is unavailable or
   * rate-limited, OpenRouter itself tries the next one in the list before erroring.
   * A local 429 retry loop sits on top for when the whole chain is briefly saturated.
   */
  async chat(
    systemPrompt: string,
    userPrompt: string,
    opts: { maxTokens?: number; retries?: number; label?: string } = {},
  ): Promise<{ content: string; model: string }> {
    const retries = opts.retries ?? 2;
    const label = opts.label ?? 'request';
    let maxTokens = opts.maxTokens ?? 4000;
    // openrouter/free draws a random model per call, including weaker/smaller
    // ones — allow doubling twice (not just once) before giving up.
    const maxTokensCeiling = maxTokens * 4;

    for (let attempt = 0; ; attempt++) {
      const response = await fetch(OPEN_ROUTER_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://lms-start.local',
          'X-Title': 'LMS Content Generator',
        },
        body: JSON.stringify({
          models: this.models,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.4,
          max_tokens: maxTokens,
          // Forces the model to emit a JSON object — without this, a random
          // draw from openrouter/free's pool (e.g. a safety/moderation model)
          // can reply with plain text instead of the JSON we asked for.
          response_format: { type: 'json_object' },
          // Venice's free-tier capacity is frequently exhausted across
          // multiple :free models — route around it so fallbacks actually help.
          provider: { ignore: ['Venice'] },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content;
        const finishReason = data?.choices?.[0]?.finish_reason;
        const model = data?.model ?? this.models[0];

        if (!content || typeof content !== 'string') {
          throw new InternalServerErrorException(`OpenRouter returned an empty response for ${label}`);
        }
        if (finishReason === 'length') {
          if (maxTokens < maxTokensCeiling) {
            maxTokens *= 2;
            continue;
          }
          throw new InternalServerErrorException(
            `AI response for ${label} was cut off before finishing, even after raising the token limit to ${maxTokens}. Try a narrower topic or fewer steps.`,
          );
        }
        return { content, model };
      }

      const body = await response.text();

      // Account-wide daily quota, not a per-request/per-model rate limit —
      // retrying or falling back to another model can't help until it resets.
      if (response.status === 429 && /free-models-per-day/i.test(body)) {
        throw new InternalServerErrorException(
          `OpenRouter free-tier daily quota exhausted for ${label}. Wait for the daily reset or add credits at https://openrouter.ai/settings/credits to raise the limit.`,
        );
      }

      if (response.status === 429 && attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, this.getRetryDelayMs(response, body)));
        continue;
      }

      throw new InternalServerErrorException(
        `OpenRouter request failed for ${label} (${response.status}): ${body}`,
      );
    }
  }

  /**
   * The gateway's own Retry-After header is often absent on 429s from this
   * provider — the real delay lives in the JSON body's error metadata instead.
   */
  private getRetryDelayMs(response: Response, body: string): number {
    const header = Number(response.headers.get('Retry-After'));
    if (header > 0) return header * 1000;

    try {
      const parsed = JSON.parse(body);
      const fromBody = Number(parsed?.error?.metadata?.retry_after_seconds);
      if (fromBody > 0) return fromBody * 1000;
    } catch {
      // fall through to default
    }

    return 5000;
  }
}
