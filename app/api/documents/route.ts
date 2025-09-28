import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const documents = await prisma.document.findMany({
      where: {
        userId: session.user.id,
        organizationId: session.user.organizationId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform the data to match the existing interface
    const transformedDocuments = documents.map((doc) => ({
      id: doc.id,
      label: doc.label,
      fileName: doc.fileName,
      fileType: doc.fileType,
      fileSize: doc.fileSize,
      uploadedAt: doc.createdAt.toISOString(),
      category: doc.category,
      tags: doc.tags,
      filePath: doc.filePath,
      relatedTo: doc.relatedTo && doc.relatedId ? {
        type: doc.relatedTo,
        id: doc.relatedId,
        name: `${doc.relatedTo} ${doc.relatedId}`, // This would need to be resolved with actual data
      } : undefined,
    }));

    return NextResponse.json(transformedDocuments);
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}