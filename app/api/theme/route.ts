export async function POST(req: Request) {
  const body = await req.json();
  const token = req.headers.get('authorization');
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/theme`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: token } : {}) },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  return Response.json(json, { status: res.status });
}

export async function GET(req: Request) {
  const token = req.headers.get('authorization');
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/theme`, {
    headers: { ...(token ? { Authorization: token } : {}) },
  });
  const json = await res.json();
  return Response.json(json, { status: res.status });
}
