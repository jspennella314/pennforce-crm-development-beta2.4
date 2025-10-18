'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createTask(data: {
  contactId: string;
  subject: string;
  organizationId: string;
}) {
  try {
    const task = await prisma.task.create({
      data: {
        subject: data.subject,
        status: 'Not Started',
        priority: 'Normal',
        contactId: data.contactId,
        organizationId: data.organizationId,
      },
    });

    revalidatePath(`/records/contacts/${data.contactId}`);
    return { success: true, task };
  } catch (error) {
    console.error('Failed to create task:', error);
    return { success: false, error: 'Failed to create task' };
  }
}

export async function logCall(data: {
  contactId: string;
  subject: string;
  notes?: string;
  organizationId: string;
}) {
  try {
    // Create a completed task with type "Call"
    const call = await prisma.task.create({
      data: {
        subject: data.subject,
        description: data.notes || '',
        status: 'Completed',
        priority: 'Normal',
        taskType: 'Call',
        contactId: data.contactId,
        organizationId: data.organizationId,
        completedDate: new Date(),
      },
    });

    revalidatePath(`/records/contacts/${data.contactId}`);
    return { success: true, call };
  } catch (error) {
    console.error('Failed to log call:', error);
    return { success: false, error: 'Failed to log call' };
  }
}

export async function createEvent(data: {
  contactId: string;
  subject: string;
  organizationId: string;
}) {
  try {
    // Create an event/meeting (using Task model with type "Meeting")
    const event = await prisma.task.create({
      data: {
        subject: data.subject,
        status: 'Not Started',
        priority: 'Normal',
        taskType: 'Meeting',
        contactId: data.contactId,
        organizationId: data.organizationId,
      },
    });

    revalidatePath(`/records/contacts/${data.contactId}`);
    return { success: true, event };
  } catch (error) {
    console.error('Failed to create event:', error);
    return { success: false, error: 'Failed to create event' };
  }
}
