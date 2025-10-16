import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const aircraftId = searchParams.get('aircraftId');
    const opportunityId = searchParams.get('opportunityId');

    const where: any = {};
    if (accountId) where.accountId = accountId;
    if (aircraftId) where.aircraftId = aircraftId;
    if (opportunityId) where.opportunityId = opportunityId;

    const documents = await prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        account: { select: { id: true, name: true } },
        aircraft: { select: { id: true, tailNumber: true, make: true, model: true } },
        opportunity: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const accountId = formData.get('accountId') as string;
    const aircraftId = formData.get('aircraftId') as string;
    const opportunityId = formData.get('opportunityId') as string;
    const organizationId = formData.get('organizationId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', organizationId);
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${sanitizedFileName}`;
    const filePath = path.join(uploadsDir, fileName);

    // Write file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Create database record
    const document = await prisma.document.create({
      data: {
        name: name || file.name,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        url: `/uploads/${organizationId}/${fileName}`,
        description: description || null,
        organizationId,
        accountId: accountId || null,
        aircraftId: aircraftId || null,
        opportunityId: opportunityId || null,
      },
      include: {
        account: { select: { id: true, name: true } },
        aircraft: { select: { id: true, tailNumber: true } },
        opportunity: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}
