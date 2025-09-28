// app/api/aircraft/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-server";

export async function GET() {
  try {
    const user = await requireAuth();

    // Organization scoping: only return aircraft where owner or operator accounts belong to same organization
    const aircraft = await prisma.aircraft.findMany({
      where: {
        OR: [
          {
            ownerAccount: {
              owner: {
                organizationId: user.organizationId
              }
            }
          },
          {
            operatorAccount: {
              owner: {
                organizationId: user.organizationId
              }
            }
          }
        ]
      },
      orderBy: { updatedAt: "desc" },
      include: {
        ownerAccount: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        operatorAccount: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(aircraft);
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

    // Validate that owner/operator accounts belong to the same organization
    if (body.ownerAccountId) {
      const ownerAccount = await prisma.account.findFirst({
        where: {
          id: body.ownerAccountId,
          owner: {
            organizationId: user.organizationId
          }
        }
      });

      if (!ownerAccount) {
        return NextResponse.json(
          { error: "Owner account not found or not accessible" },
          { status: 403 }
        );
      }
    }

    if (body.operatorAccountId) {
      const operatorAccount = await prisma.account.findFirst({
        where: {
          id: body.operatorAccountId,
          owner: {
            organizationId: user.organizationId
          }
        }
      });

      if (!operatorAccount) {
        return NextResponse.json(
          { error: "Operator account not found or not accessible" },
          { status: 403 }
        );
      }
    }

    const aircraft = await prisma.aircraft.create({ data: body });
    return NextResponse.json(aircraft, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }
}