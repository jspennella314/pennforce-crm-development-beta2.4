'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { TaskStatus } from '@prisma/client';

export async function createTask(data: {
  contactId: string;
  subject: string;
  organizationId: string;
  ownerId: string;
}) {
  try {
    const task = await prisma.task.create({
      data: {
        title: data.subject,
        status: TaskStatus.OPEN,
        contactId: data.contactId,
        organizationId: data.organizationId,
        ownerId: data.ownerId,
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
  ownerId: string;
}) {
  try {
    // Create a completed task representing a call
    const call = await prisma.task.create({
      data: {
        title: data.subject,
        status: TaskStatus.DONE,
        contactId: data.contactId,
        organizationId: data.organizationId,
        ownerId: data.ownerId,
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
  ownerId: string;
}) {
  try {
    // Create an event/meeting task
    const event = await prisma.task.create({
      data: {
        title: data.subject,
        status: TaskStatus.OPEN,
        contactId: data.contactId,
        organizationId: data.organizationId,
        ownerId: data.ownerId,
      },
    });

    revalidatePath(`/records/contacts/${data.contactId}`);
    return { success: true, event };
  } catch (error) {
    console.error('Failed to create event:', error);
    return { success: false, error: 'Failed to create event' };
  }
}
