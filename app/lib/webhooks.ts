// Webhook System for Integrations

export interface WebhookPayload {
  event: string;
  objectType: string;
  objectId: string;
  action: 'created' | 'updated' | 'deleted';
  data: any;
  timestamp: string;
  organizationId: string;
}

export async function triggerWebhook(
  url: string,
  payload: WebhookPayload,
  retries = 3
): Promise<boolean> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': generateSignature(payload),
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        return true;
      }

      // If not successful and not last attempt, wait before retry
      if (attempt < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
      }
    } catch (error) {
      console.error(`Webhook attempt ${attempt + 1} failed:`, error);
      if (attempt === retries - 1) {
        return false;
      }
    }
  }

  return false;
}

function generateSignature(payload: WebhookPayload): string {
  // In production, use HMAC with a secret key
  // For now, using a simple hash
  const data = JSON.stringify(payload);
  return Buffer.from(data).toString('base64').slice(0, 32);
}

export async function sendWebhookForEvent(
  event: string,
  objectType: string,
  objectId: string,
  action: 'created' | 'updated' | 'deleted',
  data: any,
  organizationId: string,
  webhookUrls: string[]
): Promise<void> {
  const payload: WebhookPayload = {
    event,
    objectType,
    objectId,
    action,
    data,
    timestamp: new Date().toISOString(),
    organizationId,
  };

  // Send webhooks in parallel
  const webhookPromises = webhookUrls.map((url) => triggerWebhook(url, payload));

  await Promise.allSettled(webhookPromises);
}
