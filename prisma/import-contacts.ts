// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import XLSX from 'xlsx';

const prisma = new PrismaClient();

// Parse name into first and last name
function parseName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim();
  const parts = trimmed.split(' ');

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }

  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ');

  return { firstName, lastName };
}

// Normalize phone number
function normalizePhone(phone: string | undefined): string | undefined {
  if (!phone) return undefined;

  // Skip non-phone entries like "facebook"
  if (phone.toLowerCase().includes('facebook')) return undefined;

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // Return if we have a valid phone number
  return digits.length >= 10 ? phone : undefined;
}

async function importContacts() {
  try {
    console.log('Reading Excel file...');
    const workbook = XLSX.readFile('C:\\Users\\jspen\\Downloads\\PennForce-INITIAL-DATA.xlsx');
    const worksheet = workbook.Sheets['CRM'];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`Found ${data.length} contacts to import\n`);

    // Get the demo organization and user
    const organization = await prisma.organization.findUnique({
      where: { id: 'demo-org-001' }
    });

    if (!organization) {
      throw new Error('Demo organization not found');
    }

    const user = await prisma.user.findFirst({
      where: { organizationId: organization.id }
    });

    if (!user) {
      throw new Error('No user found in demo organization');
    }

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const row of data as any[]) {
      try {
        const { firstName, lastName } = parseName(row.Name);
        const email = row.Email?.trim().toLowerCase();
        const phone = normalizePhone(row.number);

        // Skip if we don't have at least a name
        if (!firstName) {
          skipped++;
          continue;
        }

        // Check if contact already exists (by email or full name)
        const existing = await prisma.contact.findFirst({
          where: {
            organizationId: organization.id,
            OR: [
              email ? { email } : {},
              {
                AND: [
                  { firstName },
                  { lastName }
                ]
              }
            ].filter(condition => Object.keys(condition).length > 0)
          }
        });

        if (existing) {
          console.log(`⏭️  Skipping ${firstName} ${lastName} - already exists`);
          skipped++;
          continue;
        }

        // Create the contact
        await prisma.contact.create({
          data: {
            firstName,
            lastName,
            email: email || undefined,
            phone: phone || undefined,
            organizationId: organization.id,
            ownerId: user.id,
          }
        });

        console.log(`✅ Imported: ${firstName} ${lastName}`);
        imported++;
      } catch (error: any) {
        const name = row.Name || 'Unknown';
        console.log(`❌ Error importing ${name}: ${error.message}`);
        errors.push(`${name}: ${error.message}`);
      }
    }

    console.log(`\n=== Import Complete ===`);
    console.log(`✅ Successfully imported: ${imported} contacts`);
    console.log(`⏭️  Skipped (duplicates): ${skipped} contacts`);
    if (errors.length > 0) {
      console.log(`❌ Errors: ${errors.length}`);
      errors.forEach(err => console.log(`   - ${err}`));
    }

  } catch (error) {
    console.error('Error during import:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

importContacts()
  .then(() => {
    console.log('\n✨ Import process completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Import failed:', error);
    process.exit(1);
  });
