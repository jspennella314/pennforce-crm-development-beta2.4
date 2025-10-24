/**
 * Secret Masking Utilities
 *
 * Security best practices for handling sensitive data:
 * - Never return secrets in API responses
 * - Mask secrets in UI forms (show ******** for existing values)
 * - Only accept new values when user explicitly changes them
 */

const MASK_VALUE = "********";
const MASK_LENGTH = 8;

/**
 * Mask a secret string for display in UI
 * Returns "********" for non-empty values, empty string for null/undefined
 */
export function maskSecret(value: string | null | undefined): string {
  if (!value) return "";
  return MASK_VALUE;
}

/**
 * Mask an email or sensitive string, showing only first/last chars
 * Example: "user@example.com" => "u***@e***.com"
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email) return "";

  const [local, domain] = email.split("@");
  if (!domain) return `${email[0]}${"*".repeat(Math.max(0, email.length - 2))}${email[email.length - 1] || ""}`;

  const maskedLocal = local.length > 2
    ? `${local[0]}${"*".repeat(local.length - 1)}`
    : local;

  const domainParts = domain.split(".");
  const maskedDomain = domainParts.map((part, i) =>
    i === domainParts.length - 1
      ? part // Keep TLD visible
      : part.length > 2
        ? `${part[0]}${"*".repeat(part.length - 1)}`
        : part
  ).join(".");

  return `${maskedLocal}@${maskedDomain}`;
}

/**
 * Mask API key, showing only last 4 characters
 * Example: "sk_live_abc123def456" => "************f456"
 */
export function maskApiKey(key: string | null | undefined, visibleChars: number = 4): string {
  if (!key) return "";
  if (key.length <= visibleChars) return "*".repeat(key.length);

  const masked = "*".repeat(Math.max(8, key.length - visibleChars));
  const visible = key.slice(-visibleChars);
  return `${masked}${visible}`;
}

/**
 * Mask a URL's query parameters or sensitive parts
 * Example: "https://example.com/webhook?secret=abc123" => "https://example.com/webhook?secret=********"
 */
export function maskUrlParams(url: string | null | undefined, sensitiveParams: string[] = ["secret", "key", "token", "password"]): string {
  if (!url) return "";

  try {
    const urlObj = new URL(url);
    sensitiveParams.forEach(param => {
      if (urlObj.searchParams.has(param)) {
        urlObj.searchParams.set(param, MASK_VALUE);
      }
    });
    return urlObj.toString();
  } catch {
    // If URL parsing fails, just return masked value
    return url.includes("?") ? url.split("?")[0] + "?***" : url;
  }
}

/**
 * Check if a value is the masked placeholder
 * Used to determine if user actually changed a secret field
 */
export function isMaskedValue(value: string | null | undefined): boolean {
  return value === MASK_VALUE;
}

/**
 * Process form input for secrets:
 * - If value is masked placeholder, return undefined (no change)
 * - If value is empty, return null (clear secret)
 * - Otherwise return the new value
 */
export function processSecretInput(
  input: string | null | undefined,
  existingValue: string | null | undefined
): string | null | undefined {
  // If input is the masked placeholder, don't update (user didn't change it)
  if (isMaskedValue(input)) {
    return undefined; // Signal: no change
  }

  // If input is empty/null, clear the secret
  if (!input || input.trim() === "") {
    return null;
  }

  // Otherwise, use the new value
  return input.trim();
}

/**
 * Sanitize an object for API responses, removing sensitive fields
 */
export function sanitizeForResponse<T extends Record<string, any>>(
  obj: T,
  sensitiveFields: (keyof T)[] = []
): Partial<T> {
  const sanitized = { ...obj };

  // Always remove these fields
  const alwaysSensitive = [
    "password",
    "passwordHash",
    "apiKey",
    "privateKey",
    "secret",
    "webhookSecret",
    "accessToken",
    "refreshToken"
  ];

  [...alwaysSensitive, ...sensitiveFields].forEach(field => {
    if (field in sanitized) {
      delete sanitized[field as keyof typeof sanitized];
    }
  });

  return sanitized;
}

/**
 * Example usage in a form component:
 *
 * ```tsx
 * import { maskSecret, isMaskedValue, processSecretInput } from '@/lib/secrets';
 *
 * const [webhookUrl, setWebhookUrl] = useState(maskSecret(initialValue));
 *
 * <input
 *   type="text"
 *   value={webhookUrl}
 *   onChange={(e) => setWebhookUrl(e.target.value)}
 *   onFocus={(e) => {
 *     if (isMaskedValue(e.target.value)) {
 *       e.target.value = "";
 *     }
 *   }}
 *   placeholder="https://example.com/webhook?secret=..."
 * />
 *
 * // When submitting:
 * const newValue = processSecretInput(webhookUrl, currentWebhookUrl);
 * if (newValue !== undefined) {
 *   await updateSettings({ webhookUrl: newValue });
 * }
 * ```
 */
