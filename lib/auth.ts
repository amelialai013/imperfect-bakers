export function checkAdminToken(req: Request): boolean {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.replace("Bearer ", "").trim();
  const expected = process.env.ADMIN_PASSWORD ?? "";
  return expected.length > 0 && token === expected;
}
