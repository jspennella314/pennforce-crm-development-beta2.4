// Import script for PennForce CRM initial data
const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');

const prisma = new PrismaClient();

async function importInitialData() {
  console.log('📊 Starting initial data import...');

  try {
    // Read the Excel file
    const workbook = XLSX.readFile('C:\\Users\\jspen\\Downloads\\PennForce-INITIAL-DATA.xlsx');
    console.log('📑 Sheets found:', workbook.SheetNames);

    // Get or create organization
    let organization = await prisma.organization.findFirst();
    if (!organization) {
      organization = await prisma.organization.create({
        data: {
          name: 'PennForce Aviation',
        },
      });
      console.log('✅ Created organization:', organization.name);
    }

    // Get or create default user
    let user = await prisma.user.findFirst({
      where: { organizationId: organization.id }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'admin@pennforce.com',
          name: 'Admin User',
          role: 'ADMIN',
          organizationId: organization.id,
        },
      });
      console.log('✅ Created default user:', user.email);
    }

    // Process CRM sheet - import as contacts
    const crmSheet = workbook.Sheets['CRM'];
    if (crmSheet) {
      const data = XLSX.utils.sheet_to_json(crmSheet);
      console.log(`\n📄 Processing CRM sheet: ${data.length} rows`);

      let created = 0, updated = 0, skipped = 0;

      for (const row of data) {
        try {
          const name = row.Name || row.name || '';
          const email = (row.Email || row.email || '').toLowerCase().trim();
          const phone = row.number || row.Number || row.phone || row.Phone;

          // Skip if no name or email
          if (!name && !email) {
            skipped++;
            continue;
          }

          // Split name into first and last
          const nameParts = name.split(' ');
          const firstName = nameParts[0] || 'Unknown';
          const lastName = nameParts.slice(1).join(' ') || '';

          // Check if contact exists
          const existing = email ? await prisma.contact.findFirst({
            where: { email, organizationId: organization.id },
          }) : null;

          if (existing) {
            await prisma.contact.update({
              where: { id: existing.id },
              data: {
                firstName: firstName || existing.firstName,
                lastName: lastName || existing.lastName,
                phone: phone || existing.phone,
              },
            });
            updated++;
          } else {
            await prisma.contact.create({
              data: {
                firstName,
                lastName,
                email: email || undefined,
                phone: phone || undefined,
                organizationId: organization.id,
                ownerId: user.id,
              },
            });
            created++;
          }
        } catch (error) {
          console.error('Error importing row:', error.message);
          skipped++;
        }
      }

      console.log(`✅ Contacts: ${created} created, ${updated} updated, ${skipped} skipped`);
    }

    console.log('\n✅ Import completed successfully!');
  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importInitialData()
  .then(() => {
    console.log('\n🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
