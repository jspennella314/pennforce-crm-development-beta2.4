"use server";
import { signIn } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function demoSignIn() {
  // Replace with your seeded demo user
  await signIn("credentials", {
    email: "admin@pennforce.local",
    password: "admin123",
    redirectTo: "/dashboard",
  });
  redirect("/dashboard");
}
