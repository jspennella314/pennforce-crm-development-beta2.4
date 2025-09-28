// app/api/activities/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-server";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId");
    const opportunityId = searchParams.get("opportunityId");
    const contactId = searchParams.get("contactId");
    const aircraftId = searchParams.get("aircraftId");

    // Build the where clause based on provided parameters
    const whereClause: any = {
      user: {
        organizationId: user.organizationId
      }
    };

    if (accountId) whereClause.accountId = accountId;
    if (opportunityId) whereClause.opportunityId = opportunityId;
    if (contactId) whereClause.contactId = contactId;
    if (aircraftId) whereClause.aircraftId = aircraftId;

    const activities = await prisma.activity.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        account: {
          select: {
            id: true,
            name: true
          }
        },
        opportunity: {
          select: {
            id: true,
            name: true
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
        }
      },
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Activities fetch error:', error);
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

    // Validate that related records belong to the same organization
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

    if (body.opportunityId) {
      const opportunity = await prisma.opportunity.findFirst({
        where: {
          id: body.opportunityId,
          account: {
            owner: {
              organizationId: user.organizationId
            }
          }
        }
      });

      if (!opportunity) {
        return NextResponse.json(
          { error: "Opportunity not found or not accessible" },
          { status: 403 }
        );
      }
    }

    const activity = await prisma.activity.create({
      data: {
        ...body,
        userId: user.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error('Activity creation error:', error);
    return NextResponse.json(
      { error: "Failed to create activity" },
      { status: 500 }
    );
  }
}