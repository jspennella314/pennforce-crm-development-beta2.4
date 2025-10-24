declare namespace NodeJS {
  interface ProcessEnv {
    NEXTAUTH_URL?: string;
    NEXTAUTH_SECRET?: string;
    CLICKFUNNELS_WEBHOOK_SECRET: string; // shared secret for inbound webhook
    DATABASE_URL: string;
    LEAD_ASSIGN_USER_IDS?: string; // comma-separated user IDs for round-robin, e.g. "u1,u2,u3"
  }
}
