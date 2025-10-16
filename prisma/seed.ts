// PennForce CRM - Seed Script
// Creates sample organization with aviation data

import { PrismaClient } from '../app/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Organization
  const org = await prisma.organization.upsert({
    where: { id: 'demo-org-001' },
    update: {},
    create: {
      id: 'demo-org-001',
      name: 'SkyTech Aviation',
    },
  });
  console.log(`✓ Created organization: ${org.name}`);

  // Create Admin User with proper password hash
  const adminPasswordHash = await bcrypt.hash('admin123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'admin@pennjets.com' },
    update: {},
    create: {
      email: 'admin@pennjets.com',
      name: 'John Pilot',
      phone: '+1-555-0100',
      role: 'admin',
      passwordHash: adminPasswordHash,
      isActive: true,
      organizationId: org.id,
    },
  });
  console.log(`✓ Created user: ${user.name} (${user.email})`);

  // Create Team
  const team = await prisma.team.create({
    data: {
      name: 'Sales Team',
      organizationId: org.id,
      members: {
        create: {
          userId: user.id,
          role: 'lead',
        },
      },
    },
  });
  console.log(`✓ Created team: ${team.name}`);

  // Create Accounts
  const ownerAccount = await prisma.account.create({
    data: {
      name: 'Elite Jets LLC',
      type: 'OWNER',
      website: 'https://elitejets.example',
      phone: '+1-555-0200',
      email: 'info@elitejets.example',
      billingAddr: '1234 Aviation Way, Miami, FL 33131',
      ownerId: user.id,
      organizationId: org.id,
    },
  });
  console.log(`✓ Created account: ${ownerAccount.name} (${ownerAccount.type})`);

  const operatorAccount = await prisma.account.create({
    data: {
      name: 'Global Charter Operations',
      type: 'OPERATOR',
      website: 'https://globalcharter.example',
      phone: '+1-555-0300',
      email: 'ops@globalcharter.example',
      billingAddr: '5678 Airport Rd, Fort Lauderdale, FL 33315',
      ownerId: user.id,
      organizationId: org.id,
    },
  });
  console.log(`✓ Created account: ${operatorAccount.name} (${operatorAccount.type})`);

  const mroAccount = await prisma.account.create({
    data: {
      name: 'Precision Aero Maintenance',
      type: 'MRO',
      phone: '+1-555-0400',
      email: 'service@precisionaero.example',
      billingAddr: '9012 Hangar Blvd, Orlando, FL 32827',
      organizationId: org.id,
    },
  });
  console.log(`✓ Created account: ${mroAccount.name} (${mroAccount.type})`);

  // Create Contacts
  const contact1 = await prisma.contact.create({
    data: {
      firstName: 'Sarah',
      lastName: 'Mitchell',
      email: 'sarah.mitchell@elitejets.example',
      phone: '+1-555-0201',
      title: 'Director of Operations',
      accountId: ownerAccount.id,
      ownerId: user.id,
      organizationId: org.id,
    },
  });
  console.log(`✓ Created contact: ${contact1.firstName} ${contact1.lastName}`);

  const contact2 = await prisma.contact.create({
    data: {
      firstName: 'Mike',
      lastName: 'Rodriguez',
      email: 'mike.rodriguez@globalcharter.example',
      phone: '+1-555-0301',
      title: 'Fleet Manager',
      accountId: operatorAccount.id,
      ownerId: user.id,
      organizationId: org.id,
    },
  });
  console.log(`✓ Created contact: ${contact2.firstName} ${contact2.lastName}`);

  // Create Aircraft
  const aircraft1 = await prisma.aircraft.create({
    data: {
      make: 'Gulfstream',
      model: 'G550',
      variant: null,
      year: 2018,
      serialNumber: '5487',
      tailNumber: 'N550GX',
      status: 'ACTIVE',
      locationIcao: 'KFXE',
      totalTimeHrs: 2450.5,
      cycles: 1823,
      enginesJson: {
        left: { model: 'BR710-C4-11', serialNumber: 'PCE-HL0025', tsmoh: 1200 },
        right: { model: 'BR710-C4-11', serialNumber: 'PCE-HL0026', tsmoh: 1205 },
      },
      avionicsJson: {
        suite: 'PlaneView II',
        adsb: true,
        waas: true,
      },
      ownerAccountId: ownerAccount.id,
      operatorAccountId: operatorAccount.id,
      organizationId: org.id,
    },
  });
  console.log(`✓ Created aircraft: ${aircraft1.make} ${aircraft1.model} (${aircraft1.tailNumber})`);

  const aircraft2 = await prisma.aircraft.create({
    data: {
      make: 'Bombardier',
      model: 'Global 6000',
      variant: null,
      year: 2020,
      serialNumber: '9876',
      tailNumber: 'N600BD',
      status: 'FOR_SALE',
      locationIcao: 'KOPF',
      totalTimeHrs: 890.0,
      cycles: 412,
      enginesJson: {
        left: { model: 'BR710A2-20', serialNumber: 'PCE-KL0087', tsmoh: 890 },
        right: { model: 'BR710A2-20', serialNumber: 'PCE-KL0088', tsmoh: 890 },
      },
      avionicsJson: {
        suite: 'Vision Flight Deck',
        adsb: true,
        waas: true,
        satcom: 'SwiftBroadband',
      },
      ownerAccountId: ownerAccount.id,
      organizationId: org.id,
    },
  });
  console.log(`✓ Created aircraft: ${aircraft2.make} ${aircraft2.model} (${aircraft2.tailNumber})`);

  // Create Opportunities
  const opp1 = await prisma.opportunity.create({
    data: {
      name: 'Global 6000 Sale - Elite Jets',
      stage: 'PROPOSAL',
      amount: '15500000',
      currency: 'USD',
      closeDate: new Date('2025-12-15'),
      probability: 60,
      pipeline: 'AIRCRAFT_SALE',
      description: 'Sale of N600BD Global 6000 to interested buyer. Aircraft in excellent condition.',
      nextStep: 'Schedule pre-purchase inspection',
      kanbanIndex: 2,
      source: 'Website Inquiry',
      accountId: ownerAccount.id,
      contactId: contact1.id,
      aircraftId: aircraft2.id,
      ownerId: user.id,
      organizationId: org.id,
    },
  });
  console.log(`✓ Created opportunity: ${opp1.name} ($${opp1.amount})`);

  const opp2 = await prisma.opportunity.create({
    data: {
      name: 'Charter Contract - Q2 2025',
      stage: 'NEGOTIATION',
      amount: '450000',
      currency: 'USD',
      closeDate: new Date('2025-11-30'),
      probability: 75,
      pipeline: 'CHARTER_SERVICES',
      description: '90-day charter block for corporate travel',
      nextStep: 'Review contract terms',
      kanbanIndex: 1,
      accountId: operatorAccount.id,
      contactId: contact2.id,
      ownerId: user.id,
      organizationId: org.id,
    },
  });
  console.log(`✓ Created opportunity: ${opp2.name} ($${opp2.amount})`);

  // Create Tasks
  const task1 = await prisma.task.create({
    data: {
      title: 'Follow up on pre-purchase inspection',
      status: 'OPEN',
      dueDate: new Date('2025-10-20'),
      ownerId: user.id,
      accountId: ownerAccount.id,
      contactId: contact1.id,
      opportunityId: opp1.id,
      organizationId: org.id,
    },
  });
  console.log(`✓ Created task: ${task1.title}`);

  const task2 = await prisma.task.create({
    data: {
      title: 'Prepare charter contract amendments',
      status: 'IN_PROGRESS',
      dueDate: new Date('2025-10-18'),
      ownerId: user.id,
      accountId: operatorAccount.id,
      opportunityId: opp2.id,
      organizationId: org.id,
    },
  });
  console.log(`✓ Created task: ${task2.title}`);

  // Create Activities
  await prisma.activity.create({
    data: {
      type: 'CALL',
      subject: 'Initial discussion re: Global 6000',
      content: 'Spoke with Sarah about potential sale. Very interested. Discussed specs, logs, and condition.',
      userId: user.id,
      accountId: ownerAccount.id,
      contactId: contact1.id,
      opportunityId: opp1.id,
      aircraftId: aircraft2.id,
      organizationId: org.id,
    },
  });
  console.log('✓ Created activity: Call log');

  await prisma.activity.create({
    data: {
      type: 'EMAIL',
      subject: 'Sent charter proposal',
      content: 'Emailed comprehensive charter package to Mike. Includes rates, availability, and sample itinerary.',
      userId: user.id,
      accountId: operatorAccount.id,
      contactId: contact2.id,
      opportunityId: opp2.id,
      organizationId: org.id,
    },
  });
  console.log('✓ Created activity: Email log');

  // Create Trips
  await prisma.trip.create({
    data: {
      date: new Date('2025-10-10T14:30:00Z'),
      fromIcao: 'KFXE',
      toIcao: 'KTEB',
      paxCount: 8,
      purpose: 'Revenue Charter',
      revenue: '42500',
      cost: '18200',
      aircraftId: aircraft1.id,
      accountId: operatorAccount.id,
      organizationId: org.id,
    },
  });
  console.log('✓ Created trip: KFXE → KTEB');

  await prisma.trip.create({
    data: {
      date: new Date('2025-10-12T10:15:00Z'),
      fromIcao: 'KTEB',
      toIcao: 'KFXE',
      paxCount: 6,
      purpose: 'Repositioning',
      cost: '15800',
      aircraftId: aircraft1.id,
      organizationId: org.id,
    },
  });
  console.log('✓ Created trip: KTEB → KFXE (repo)');

  // Create Work Orders
  await prisma.workOrder.create({
    data: {
      title: '500hr Inspection - N550GX',
      description: 'Scheduled 500-hour maintenance inspection including engine borescope',
      status: 'OPEN',
      dueDate: new Date('2025-11-05'),
      aircraftId: aircraft1.id,
      vendorAccountId: mroAccount.id,
      organizationId: org.id,
    },
  });
  console.log('✓ Created work order: 500hr Inspection');

  // Create Documents
  await prisma.document.create({
    data: {
      label: 'Aircraft Registration',
      url: 'https://docs.example.com/N550GX-registration.pdf',
      aircraftId: aircraft1.id,
      organizationId: org.id,
    },
  });
  console.log('✓ Created document: Aircraft Registration');

  await prisma.document.create({
    data: {
      label: 'Insurance Certificate',
      url: 'https://docs.example.com/elitejets-insurance-cert.pdf',
      accountId: ownerAccount.id,
      organizationId: org.id,
    },
  });
  console.log('✓ Created document: Insurance Certificate');

  // Create List Views
  await prisma.listView.create({
    data: {
      objectName: 'Opportunity',
      name: 'High Value Deals',
      filterJson: {
        conditions: [
          { field: 'amount', operator: 'gte', value: 1000000 },
          { field: 'stage', operator: 'in', value: ['PROPOSAL', 'NEGOTIATION'] },
        ],
      },
      isPublic: true,
      ownerId: user.id,
      organizationId: org.id,
    },
  });
  console.log('✓ Created list view: High Value Deals');

  await prisma.listView.create({
    data: {
      objectName: 'Aircraft',
      name: 'Available For Sale',
      filterJson: {
        conditions: [{ field: 'status', operator: 'eq', value: 'FOR_SALE' }],
      },
      isPublic: true,
      organizationId: org.id,
    },
  });
  console.log('✓ Created list view: Available For Sale');

  // Create Object Layout
  await prisma.objectLayout.create({
    data: {
      objectName: 'Aircraft',
      layoutJson: {
        sections: [
          {
            title: 'Aircraft Information',
            columns: 2,
            fields: ['make', 'model', 'variant', 'year', 'serialNumber', 'tailNumber'],
          },
          {
            title: 'Status & Location',
            columns: 2,
            fields: ['status', 'locationIcao', 'ownerAccountId', 'operatorAccountId'],
          },
          {
            title: 'Technical Details',
            columns: 2,
            fields: ['totalTimeHrs', 'cycles', 'enginesJson', 'avionicsJson'],
          },
        ],
      },
      organizationId: org.id,
    },
  });
  console.log('✓ Created object layout: Aircraft');

  console.log('\n✅ Seeding completed successfully!');
  console.log('\n═══════════════════════════════════');
  console.log('   Demo Login Credentials');
  console.log('═══════════════════════════════════');
  console.log('Email:    admin@pennjets.com');
  console.log('Password: admin123');
  console.log('═══════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
