import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function requireSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Response("Unauthorized", { status: 401 });
  }

  return session;
}

export async function getOptionalSession() {
  const session = await getServerSession(authOptions);
  return session;
}