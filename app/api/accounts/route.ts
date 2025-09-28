// app/api/accounts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-server";

export async function GET() {
  try {
    const user = await requireAuth();

    // Organization scoping: only return accounts where owner belongs to same organization
    const accounts = await prisma.account.findMany({
      where: {
        owner: {
          organizationId: user.organizationId
        }
      },
      orderBy: { createdAt: "desc" },
      include: {
        contacts: true,
        aircraft: true,
        operatedAircraft: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
    });

    return NextResponse.json(accounts);
  } catch (error) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    // Ensure the owner is set to a user from the same organization
    const account = await prisma.account.create({
      data: {
        ...body,
        ownerId: user.id // Set the current user as owner
      }
    });

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }
}