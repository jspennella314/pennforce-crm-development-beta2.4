// @ts-nocheck
import { PrismaClient } from '../app/generated/prisma/index.js';
import XLSX from 'xlsx';

const prisma = new PrismaClient();

async function importInitialData() {
  console.log('📊 Starting initial data import...');

  // Explicitly connect to the database
  await prisma.$connect();
  console.log('✅ Connected to database');

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
          settings: {},
        },
      });
      console.log('✅ Created organization:', organization.name);
    }

    // Get or create default user
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'admin@pennforce.com',
          name: 'Admin User',
          role: 'ADMIN',
        },
      });
      console.log('✅ Created default user:', user.email);
    }

    // Link user to organization if not already linked
    const existingMembership = await prisma.organizationMember.findFirst({
      where: {
        userId: user.id,
        organizationId: organization.id,
      },
    });

    if (!existingMembership) {
      await prisma.organizationMember.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: 'ADMIN',
        },
      });
      console.log('✅ Linked user to organization');
    }

    // Process each sheet
    for (const sheetName of workbook.SheetNames) {
      console.log(`\n📄 Processing sheet: ${sheetName}`);
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);

      console.log(`   Found ${data.length} rows`);

      if (data.length === 0) {
        console.log('   ⚠️  No data in sheet, skipping...');
        continue;
      }

      // Show sample of first row to understand structure
      console.log('   Sample row:', JSON.stringify(data[0], null, 2));

      // Import based on sheet name
      const sheetLower = sheetName.toLowerCase();

      if (sheetLower.includes('contact')) {
        await importContacts(data, organization.id, user.id);
      } else if (sheetLower.includes('account')) {
        await importAccounts(data, organization.id, user.id);
      } else if (sheetLower.includes('lead')) {
        await importLeads(data, organization.id, user.id);
      } else if (sheetLower.includes('aircraft')) {
        await importAircraft(data, organization.id);
      } else if (sheetLower.includes('opportunity') || sheetLower.includes('opport')) {
        await importOpportunities(data, organization.id, user.id);
      } else {
        console.log(`   ⚠️  Unknown sheet type: ${sheetName}, skipping...`);
      }
    }

    console.log('\n✅ Import completed successfully!');
  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function importContacts(data: any[], organizationId: string, userId: string) {
  let created = 0, updated = 0, skipped = 0;

  for (const row of data) {
    try {
      const email = row.Email || row.email || row.EMAIL;
      const firstName = row.FirstName || row.firstName || row['First Name'] || row.Name?.split(' ')[0] || 'Unknown';
      const lastName = row.LastName || row.lastName || row['Last Name'] || row.Name?.split(' ').slice(1).join(' ') || '';
      const phone = row.Phone || row.phone || row.PHONE;
      const title = row.Title || row.title || row.TITLE;
      const company = row.Company || row.company || row.COMPANY || row.Account;

      if (!firstName && !email) {
        skipped++;
        continue;
      }

      // Try to find or create account if company is specified
      let accountId = null;
      if (company) {
        let account = await prisma.account.findFirst({
          where: { name: company, organizationId },
        });

        if (!account) {
          account = await prisma.account.create({
            data: {
              name: company,
              type: 'PROSPECT',
              organizationId,
              ownerId: userId,
            },
          });
        }
        accountId = account.id;
      }

      const existing = email ? await prisma.contact.findFirst({
        where: { email, organizationId },
      }) : null;

      if (existing) {
        await prisma.contact.update({
          where: { id: existing.id },
          data: {
            firstName: firstName || existing.firstName,
            lastName: lastName || existing.lastName,
            phone: phone || existing.phone,
            title: title || existing.title,
            accountId: accountId || existing.accountId,
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
            title: title || undefined,
            accountId,
            organizationId,
            ownerId: userId,
          },
        });
        created++;
      }
    } catch (error) {
      console.error('   Error importing contact:', error.message);
      skipped++;
    }
  }

  console.log(`   ✅ Contacts: ${created} created, ${updated} updated, ${skipped} skipped`);
}

async function importAccounts(data: any[], organizationId: string, userId: string) {
  let created = 0, updated = 0, skipped = 0;

  for (const row of data) {
    try {
      const name = row.Name || row.name || row.AccountName || row['Account Name'] || row.Company;
      const type = row.Type || row.type || row.AccountType || 'PROSPECT';
      const phone = row.Phone || row.phone;
      const email = row.Email || row.email;
      const website = row.Website || row.website;

      if (!name) {
        skipped++;
        continue;
      }

      const existing = await prisma.account.findFirst({
        where: { name, organizationId },
      });

      if (existing) {
        await prisma.account.update({
          where: { id: existing.id },
          data: {
            phone: phone || existing.phone,
            email: email || existing.email,
            website: website || existing.website,
          },
        });
        updated++;
      } else {
        await prisma.account.create({
          data: {
            name,
            type: type.toUpperCase() || 'PROSPECT',
            phone: phone || undefined,
            email: email || undefined,
            website: website || undefined,
            organizationId,
            ownerId: userId,
          },
        });
        created++;
      }
    } catch (error) {
      console.error('   Error importing account:', error.message);
      skipped++;
    }
  }

  console.log(`   ✅ Accounts: ${created} created, ${updated} updated, ${skipped} skipped`);
}

async function importLeads(data: any[], organizationId: string, userId: string) {
  let created = 0, updated = 0, skipped = 0;

  for (const row of data) {
    try {
      const firstName = row.FirstName || row.firstName || row['First Name'] || row.Name?.split(' ')[0];
      const lastName = row.LastName || row.lastName || row['Last Name'] || row.Name?.split(' ').slice(1).join(' ');
      const email = row.Email || row.email;
      const phone = row.Phone || row.phone;
      const company = row.Company || row.company;
      const source = row.Source || row.source || 'import';
      const status = row.Status || row.status || 'NEW';

      const name = [firstName, lastName].filter(Boolean).join(' ') || email || 'Unknown Lead';

      if (!email && !firstName) {
        skipped++;
        continue;
      }

      const existing = email ? await prisma.lead.findFirst({
        where: { email, organizationId },
      }) : null;

      if (existing) {
        await prisma.lead.update({
          where: { id: existing.id },
          data: {
            firstName: firstName || existing.firstName,
            lastName: lastName || existing.lastName,
            phone: phone || existing.phone,
            company: company || existing.company,
          },
        });
        updated++;
      } else {
        await prisma.lead.create({
          data: {
            name,
            firstName: firstName || undefined,
            lastName: lastName || undefined,
            email: email || undefined,
            phone: phone || undefined,
            company: company || undefined,
            source,
            status: status.toUpperCase(),
            organizationId,
            ownerId: userId,
          },
        });
        created++;
      }
    } catch (error) {
      console.error('   Error importing lead:', error.message);
      skipped++;
    }
  }

  console.log(`   ✅ Leads: ${created} created, ${updated} updated, ${skipped} skipped`);
}

async function importAircraft(data: any[], organizationId: string) {
  let created = 0, updated = 0, skipped = 0;

  for (const row of data) {
    try {
      const make = row.Make || row.make || row.Manufacturer;
      const model = row.Model || row.model;
      const tailNumber = row.TailNumber || row['Tail Number'] || row.Registration;
      const year = row.Year || row.year;
      const serialNumber = row.SerialNumber || row['Serial Number'] || row.SN;

      if (!make || !model) {
        skipped++;
        continue;
      }

      const existing = tailNumber ? await prisma.aircraft.findFirst({
        where: { tailNumber, organizationId },
      }) : null;

      if (existing) {
        updated++;
      } else {
        await prisma.aircraft.create({
          data: {
            make,
            model,
            tailNumber: tailNumber || undefined,
            year: year ? parseInt(year) : undefined,
            serialNumber: serialNumber || undefined,
            status: 'AVAILABLE',
            organizationId,
          },
        });
        created++;
      }
    } catch (error) {
      console.error('   Error importing aircraft:', error.message);
      skipped++;
    }
  }

  console.log(`   ✅ Aircraft: ${created} created, ${updated} updated, ${skipped} skipped`);
}

async function importOpportunities(data: any[], organizationId: string, userId: string) {
  let created = 0, skipped = 0;

  for (const row of data) {
    try {
      const name = row.Name || row.name || row.OpportunityName || 'Untitled Opportunity';
      const accountName = row.Account || row.account || row.AccountName;
      const amount = row.Amount || row.amount || row.Value;
      const stage = row.Stage || row.stage || 'PROSPECT';
      const closeDate = row.CloseDate || row['Close Date'] || row.closeDate;

      // Find or skip if account is required
      let accountId = null;
      if (accountName) {
        const account = await prisma.account.findFirst({
          where: { name: accountName, organizationId },
        });
        if (account) {
          accountId = account.id;
        } else {
          // Create account
          const newAccount = await prisma.account.create({
            data: {
              name: accountName,
              type: 'PROSPECT',
              organizationId,
              ownerId: userId,
            },
          });
          accountId = newAccount.id;
        }
      }

      if (!accountId) {
        skipped++;
        continue;
      }

      await prisma.opportunity.create({
        data: {
          name,
          accountId,
          stage: stage.toUpperCase(),
          amount: amount ? parseFloat(amount) : null,
          closeDate: closeDate ? new Date(closeDate) : null,
          position: 0,
          organizationId,
          ownerId: userId,
        },
      });
      created++;
    } catch (error) {
      console.error('   Error importing opportunity:', error.message);
      skipped++;
    }
  }

  console.log(`   ✅ Opportunities: ${created} created, ${skipped} skipped`);
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
