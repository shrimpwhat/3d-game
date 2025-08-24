export default async function verifyToken() {
  const response = await fetch("/verifyToken", { credentials: "include" });
}
