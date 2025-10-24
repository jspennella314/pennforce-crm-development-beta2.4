import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Export data to CSV/JSON format
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { objectType, format, filters } = await request.json();

    let data: any[] = [];

    // Fetch data based on object type
    switch (objectType) {
      case 'accounts':
        data = await prisma.account.findMany({
          where: { organizationId: session.user.organizationId },
          include: { owner: { select: { name: true } } },
        });
        break;
      case 'contacts':
        data = await prisma.contact.findMany({
          where: { organizationId: session.user.organizationId },
          include: {
            account: { select: { name: true } },
            owner: { select: { name: true } },
          },
        });
        break;
      case 'opportunities':
        data = await prisma.opportunity.findMany({
          where: { organizationId: session.user.organizationId },
          include: {
            account: { select: { name: true } },
            owner: { select: { name: true } },
          },
        });
        break;
      case 'aircraft':
        data = await prisma.aircraft.findMany({
          where: { organizationId: session.user.organizationId },
        });
        break;
      case 'tasks':
        data = await prisma.task.findMany({
          where: { organizationId: session.user.organizationId },
          include: { owner: { select: { name: true } } },
        });
        break;
      default:
        return NextResponse.json({ error: 'Invalid object type' }, { status: 400 });
    }

    if (format === 'csv') {
      const csv = convertToCSV(data);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${objectType}_export_${Date.now()}.csv"`,
        },
      });
    } else {
      // JSON format
      const json = JSON.stringify(data, null, 2);
      return new NextResponse(json, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${objectType}_export_${Date.now()}.json"`,
        },
      });
    }
  } catch (error: any) {
    console.error('Error exporting data:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}

function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';

  // Get all keys from first object
  const keys = Object.keys(data[0]);

  // Create header row
  const header = keys.join(',');

  // Create data rows
  const rows = data.map((row) =>
    keys
      .map((key) => {
        const value = row[key];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return `"${String(value).replace(/"/g, '""')}"`;
      })
      .join(',')
  );

  return [header, ...rows].join('\n');
}
