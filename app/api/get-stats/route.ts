export async function GET(req: Request) {
  const token = req.headers.get('authorization');
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stats`, {
    headers: { ...(token ? { Authorization: token } : {}) },
  });
  const json = await res.json();
  return Response.json(json, { status: res.status });
}
