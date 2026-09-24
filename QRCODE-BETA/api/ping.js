export async function GET() {
  return Response.json({
    ok: true,
    route: '/api/ping',
    message: 'Vercel Function aktif',
    time: new Date().toISOString()
  }, {
    headers: { 'Cache-Control': 'no-store' }
  });
}
