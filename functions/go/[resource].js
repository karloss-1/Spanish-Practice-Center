const DESTINATIONS = Object.freeze({
  flashcards: 'https://karloss-1.github.io/Mexican-Spanish/',
  conjugation: 'https://karloss-1.github.io/Conjuflow/',
  writing: 'https://chatgpt.com/g/g-6978e9457bf081918eab1b87cda5cf94-spanish-writing-trainer',
  conversation: 'https://chatgpt.com/g/g-697ee7ce5c748191a327590755eee86e-conversation-trainer'
});

export function onRequest({ request, params }) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });
  const destination = DESTINATIONS[params.resource];
  if (!destination) return new Response('Not found', { status: 404, headers: { 'X-Robots-Tag': 'noindex, nofollow' } });
  return new Response(null, { status: 302, headers: { Location: destination, 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow', 'Referrer-Policy': 'no-referrer' } });
}
