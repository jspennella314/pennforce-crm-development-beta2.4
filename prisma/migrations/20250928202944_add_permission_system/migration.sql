-- CreateTable
CREATE TABLE "ListView" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "objectName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" TEXT NOT NULL,
    "filtersJson" JSONB NOT NULL,
    "columnsJson" JSONB,
    "organizationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ListView_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ListView_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PermissionSet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "isStandard" BOOLEAN NOT NULL DEFAULT false,
    "organizationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PermissionSet_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PermissionAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "permissionSetId" TEXT NOT NULL,
    "assignedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PermissionAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PermissionAssignment_permissionSetId_fkey" FOREIGN KEY ("permissionSetId") REFERENCES "PermissionSet" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ObjectPermission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "objectName" TEXT NOT NULL,
    "canCreate" BOOLEAN NOT NULL DEFAULT false,
    "canRead" BOOLEAN NOT NULL DEFAULT false,
    "canEdit" BOOLEAN NOT NULL DEFAULT false,
    "canDelete" BOOLEAN NOT NULL DEFAULT false,
    "canViewAll" BOOLEAN NOT NULL DEFAULT false,
    "canModifyAll" BOOLEAN NOT NULL DEFAULT false,
    "permissionSetId" TEXT NOT NULL,
    CONSTRAINT "ObjectPermission_permissionSetId_fkey" FOREIGN KEY ("permissionSetId") REFERENCES "PermissionSet" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FieldPermission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "objectName" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "canRead" BOOLEAN NOT NULL DEFAULT false,
    "canEdit" BOOLEAN NOT NULL DEFAULT false,
    "permissionSetId" TEXT NOT NULL,
    CONSTRAINT "FieldPermission_permissionSetId_fkey" FOREIGN KEY ("permissionSetId") REFERENCES "PermissionSet" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ListView_organizationId_objectName_name_key" ON "ListView"("organizationId", "objectName", "name");

-- CreateIndex
CREATE UNIQUE INDEX "PermissionSet_organizationId_name_key" ON "PermissionSet"("organizationId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "PermissionAssignment_userId_permissionSetId_key" ON "PermissionAssignment"("userId", "permissionSetId");

-- CreateIndex
CREATE UNIQUE INDEX "ObjectPermission_permissionSetId_objectName_key" ON "ObjectPermission"("permissionSetId", "objectName");

-- CreateIndex
CREATE UNIQUE INDEX "FieldPermission_permissionSetId_objectName_fieldName_key" ON "FieldPermission"("permissionSetId", "objectName", "fieldName");
