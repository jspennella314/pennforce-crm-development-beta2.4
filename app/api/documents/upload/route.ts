import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const category = formData.get("category") as string;
    const label = formData.get("label") as string;
    const tags = formData.get("tags") as string;
    const relatedType = formData.get("relatedType") as string;
    const relatedId = formData.get("relatedId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "documents");
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = path.extname(file.name);
    const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = path.join(uploadsDir, fileName);

    // Write file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Save document record to database
    const document = await prisma.document.create({
      data: {
        label: label || file.name,
        fileName: file.name,
        filePath: `/uploads/documents/${fileName}`,
        fileType: fileExtension.substring(1).toLowerCase(),
        fileSize: file.size,
        category: category || "Personal",
        tags: tags ? tags.split(",").map(tag => tag.trim()) : [],
        userId: session.user.id,
        organizationId: session.user.organizationId,
        ...(relatedType && relatedId ? {
          relatedTo: relatedType as "account" | "aircraft" | "opportunity",
          relatedId: relatedId
        } : {})
      },
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error("Failed to upload document:", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
}