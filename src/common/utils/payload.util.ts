export function buildRequestPayload(req: any){
    return {
        body: sanitize(req.body),
        query: req.query,
        params: req.params,
        headers: sanitizeHeaders(req.headers),
    }
}


function sanitize(data: any) {
  if (!data || typeof data !== 'object') return data;

  const clone = { ...data };
  const blockedKeys = ['password', 'confirmPassword', 'token', 'authorization'];

  blockedKeys.forEach((key) => {
    if (clone[key]) clone[key] = '***';
  });

  return clone;
}

function sanitizeHeaders(headers: any) {
  const clone = { ...headers };

  delete clone.authorization;
  delete clone.cookie;

  return clone;
}