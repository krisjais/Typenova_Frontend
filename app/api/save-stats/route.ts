export async function POST(req: Request) {
  const body = await req.json();
  const token = req.headers.get('authorization');
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stats/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: token } : {}) },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  return Response.json(json, { status: res.status });
}
