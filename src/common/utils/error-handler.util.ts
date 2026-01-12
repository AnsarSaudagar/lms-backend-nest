import { UAParser } from "ua-parser-js";

export function buildRequestPayload(req: any) {
    return {
        body: sanitizeBody(req.body),
        query: req.query,
        params: req.params,
        headers: sanitizeHeaders(req.headers),
    }
}

function sanitizeHeaders(headers: any) {
    const clone = { ...headers };

    delete clone.authorization;
    delete clone.cookie;

    return clone;
}

export function sanitizeBody(body: any) {
    if (!body || typeof body !== 'object') return body;

    const cloned = { ...body };
    const sensitiveKeys = ['password', 'confirmPassword', 'token'];

    sensitiveKeys.forEach((key) => {
        if (cloned[key]) cloned[key] = '***';
    });

    return cloned;
}

export function extractErrorType(exception: unknown): string {
    // 1️⃣ Native JS Error
    if (exception instanceof Error) {
        return exception.name;
    }

    // 2️⃣ Nest HttpException
    if (
        typeof exception === 'object' &&
        exception?.constructor?.name
    ) {
        return exception.constructor.name;
    }

    // 3️⃣ Fallback
    return 'UnknownError';
}

export function extractBrowserShort(userAgent?: string): string {
    if (!userAgent) return 'Unknown';

    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    const browser = result.browser.name ?? 'Unknown';
    const version = result.browser.major ?? '';

    return version ? `${browser} ${version}` : browser;
}