// Reached only through the middleware, when the Accept header rules out every
// representation this site can produce. RFC 9110 §15.5.7 asks the body to list
// what is available so the client can retry with a usable Accept.
export default function handler(req, res) {
  res.statusCode = 406;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Vary', 'Accept');
  res.setHeader('Cache-Control', 'no-store');
  res.end(
    [
      'Not Acceptable',
      '',
      'This resource is available in:',
      '- text/html',
      '- text/markdown',
      '',
    ].join('\n')
  );
}
