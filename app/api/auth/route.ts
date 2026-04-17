// Proxy to backend — or use this as a standalone Next.js API route
export async function POST(req: Request) {
  const body = await req.json();
  const { action, ...data } = body;
  const endpoint = action === 'signup' ? '/api/auth/signup' : '/api/auth/login';
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  return Response.json(json, { status: res.status });
}
