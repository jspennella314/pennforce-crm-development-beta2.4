// app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-server";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const searchTerm = `%${query}%`;

    // Search across multiple models with organization scoping
    const [accounts, aircraft, opportunities, contacts] = await Promise.all([
      // Search Accounts
      prisma.account.findMany({
        where: {
          AND: [
            {
              owner: {
                organizationId: user.organizationId
              }
            },
            {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
                { phone: { contains: query, mode: 'insensitive' } }
              ]
            }
          ]
        },
        select: {
          id: true,
          name: true,
          type: true,
          email: true,
          phone: true
        },
        take: 5
      }),

      // Search Aircraft
      prisma.aircraft.findMany({
        where: {
          AND: [
            {
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
            {
              OR: [
                { make: { contains: query, mode: 'insensitive' } },
                { model: { contains: query, mode: 'insensitive' } },
                { tailNumber: { contains: query, mode: 'insensitive' } },
                { serialNumber: { contains: query, mode: 'insensitive' } }
              ]
            }
          ]
        },
        select: {
          id: true,
          make: true,
          model: true,
          year: true,
          tailNumber: true,
          status: true
        },
        take: 5
      }),

      // Search Opportunities
      prisma.opportunity.findMany({
        where: {
          AND: [
            {
              account: {
                owner: {
                  organizationId: user.organizationId
                }
              }
            },
            {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { source: { contains: query, mode: 'insensitive' } }
              ]
            }
          ]
        },
        select: {
          id: true,
          name: true,
          stage: true,
          amount: true,
          currency: true,
          account: {
            select: {
              name: true
            }
          }
        },
        take: 5
      }),

      // Search Contacts
      prisma.contact.findMany({
        where: {
          AND: [
            {
              account: {
                owner: {
                  organizationId: user.organizationId
                }
              }
            },
            {
              OR: [
                { firstName: { contains: query, mode: 'insensitive' } },
                { lastName: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
                { phone: { contains: query, mode: 'insensitive' } },
                { title: { contains: query, mode: 'insensitive' } }
              ]
            }
          ]
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          title: true,
          account: {
            select: {
              name: true
            }
          }
        },
        take: 5
      })
    ]);

    // Format results for frontend
    const results = [
      ...accounts.map(item => ({
        id: item.id,
        type: 'account',
        title: item.name,
        subtitle: `${item.type} • ${item.email || item.phone || ''}`,
        url: `/records/accounts/${item.id}`
      })),
      ...aircraft.map(item => ({
        id: item.id,
        type: 'aircraft',
        title: `${item.make} ${item.model}`,
        subtitle: `${item.tailNumber} • ${item.year} • ${item.status}`,
        url: `/records/aircraft/${item.id}`
      })),
      ...opportunities.map(item => ({
        id: item.id,
        type: 'opportunity',
        title: item.name,
        subtitle: `${item.stage} • $${item.amount?.toLocaleString()} ${item.currency} • ${item.account.name}`,
        url: `/records/opportunities/${item.id}`
      })),
      ...contacts.map(item => ({
        id: item.id,
        type: 'contact',
        title: `${item.firstName} ${item.lastName}`,
        subtitle: `${item.title || ''} • ${item.account.name}`,
        url: `/records/contacts/${item.id}`
      }))
    ];

    return NextResponse.json({
      results: results.slice(0, 15), // Limit total results
      query
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }
}