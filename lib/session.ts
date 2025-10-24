import { auth } from "@/lib/auth";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user;
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  if (session.user.role !== "ADMIN") throw new Error("Forbidden: Admin access required");
  return session.user;
}

export async function requireRole(role: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  if (session.user.role !== role) throw new Error(`Forbidden: ${role} access required`);
  return session.user;
}

export async function checkPermission(requiredRole: "ADMIN" | "USER") {
  const session = await auth();
  if (!session?.user?.id) return false;

  // ADMIN has access to everything
  if (session.user.role === "ADMIN") return true;

  // Check if user has the required role
  return session.user.role === requiredRole;
}

export async function getOptionalUser() {
  const session = await auth();
  return session?.user ?? null;
}
