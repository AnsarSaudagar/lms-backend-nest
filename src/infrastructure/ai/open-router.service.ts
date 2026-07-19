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

  /**
   * Sends a system + user prompt pair to OpenRouter and returns the raw text reply.
   * Passes a `models` fallback chain — if the primary model is unavailable or
   * rate-limited, OpenRouter itself tries the next one in the list before erroring.
   * A local 429 retry loop sits on top for when the whole chain is briefly saturated.
   */
  async chat(
    systemPrompt: string,
    userPrompt: string,
    opts: { maxTokens?: number; retries?: number } = {},
  ): Promise<string> {
    const maxTokens = opts.maxTokens ?? 4000;
    const retries = opts.retries ?? 2;

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
          // Venice's free-tier capacity is frequently exhausted across
          // multiple :free models — route around it so fallbacks actually help.
          provider: { ignore: ['Venice'] },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content;
        const finishReason = data?.choices?.[0]?.finish_reason;

        if (!content || typeof content !== 'string') {
          throw new InternalServerErrorException('OpenRouter returned an empty response');
        }
        if (finishReason === 'length') {
          throw new InternalServerErrorException(
            'AI response was cut off before finishing (hit the token limit). Try a narrower topic or fewer steps.',
          );
        }
        return content;
      }

      const body = await response.text();

      if (response.status === 429 && attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, this.getRetryDelayMs(response, body)));
        continue;
      }

      throw new InternalServerErrorException(
        `OpenRouter request failed (${response.status}): ${body}`,
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
