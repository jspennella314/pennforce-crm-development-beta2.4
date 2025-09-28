// app/api/opportunities/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-server";

export async function GET() {
  try {
    const user = await requireAuth();

    // Organization scoping: only return opportunities where account owner belongs to same organization
    const opportunities = await prisma.opportunity.findMany({
      where: {
        account: {
          owner: {
            organizationId: user.organizationId
          }
        }
      },
      orderBy: { createdAt: "desc" },
      include: {
        account: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        aircraft: {
          select: {
            id: true,
            make: true,
            model: true,
            tailNumber: true
          }
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
    });

    return NextResponse.json(opportunities);
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

    // Validate that account belongs to the same organization
    if (body.accountId) {
      const account = await prisma.account.findFirst({
        where: {
          id: body.accountId,
          owner: {
            organizationId: user.organizationId
          }
        }
      });

      if (!account) {
        return NextResponse.json(
          { error: "Account not found or not accessible" },
          { status: 403 }
        );
      }
    }

    const opportunity = await prisma.opportunity.create({
      data: {
        ...body,
        ownerId: user.id // Set the current user as owner
      }
    });

    return NextResponse.json(opportunity, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }
}