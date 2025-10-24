# ClickFunnels Webhook Integration

## Overview
This CRM includes a secure webhook endpoint to automatically capture leads from ClickFunnels, including full UTM tracking for marketing attribution.

## Features
- ✅ Automatic lead capture from ClickFunnels
- ✅ Duplicate prevention (by email or externalId)
- ✅ UTM parameter tracking (source, medium, campaign, term, content)
- ✅ Secure webhook verification
- ✅ Idempotent lead creation/updates
- ✅ Funnel tracking with funnelId

## Database Schema

The Lead model includes these ClickFunnels-specific fields:

```typescript
{
  // Basic lead info
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  company?: string
  title?: string

  // ClickFunnels integration
  source: string              // Default: "clickfunnels"
  funnelId?: string          // ClickFunnels funnel identifier
  externalId?: string        // ClickFunnels contact ID

  // UTM tracking
  utmSource?: string         // e.g., "facebook", "google"
  utmMedium?: string         // e.g., "cpc", "email"
  utmCampaign?: string       // e.g., "spring-sale"
  utmTerm?: string           // Keyword
  utmContent?: string        // Ad content identifier

  // Status tracking
  status: LeadStatus         // NEW, CONTACTED, QUALIFIED, DISQUALIFIED, etc.
  assignedToId?: string      // Sales team member
}
```

## Webhook Endpoint

**URL:** `https://your-domain.com/api/webhooks/clickfunnels`

**Method:** POST

**Authentication:** Shared secret (query param or header)

### Location
`app/api/webhooks/clickfunnels/route.ts`

## Configuration

### 1. Environment Variables

Add to your `.env` file:

```bash
CLICKFUNNELS_WEBHOOK_SECRET=your-super-long-random-secret-here
```

**Important:** Generate a strong random secret for production!

```bash
# Generate a random secret (Linux/Mac):
openssl rand -hex 32

# Or use Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. ClickFunnels Setup

#### Option 1: Query Parameter Authentication
Configure webhook URL in ClickFunnels:
```
https://your-domain.com/api/webhooks/clickfunnels?secret=YOUR_SECRET
```

#### Option 2: Header Authentication
Configure webhook URL:
```
https://your-domain.com/api/webhooks/clickfunnels
```

Add custom header:
```
x-webhook-secret: YOUR_SECRET
```

### 3. Field Mapping

Map these ClickFunnels fields to the webhook payload:

| ClickFunnels Field | Webhook Field | Required |
|-------------------|---------------|----------|
| First Name | `firstName` | No |
| Last Name | `lastName` | No |
| Email | `email` | Recommended |
| Phone | `phone` | No |
| Funnel ID | `funnelId` | Recommended |
| Contact ID | `externalId` | Recommended |
| UTM Source | `utm_source` | No |
| UTM Medium | `utm_medium` | No |
| UTM Campaign | `utm_campaign` | No |
| UTM Term | `utm_term` | No |
| UTM Content | `utm_content` | No |

**Note:** At least one of `email` or `externalId` should be provided for duplicate detection.

## Testing

### Local Testing with cURL

```bash
curl -X POST "http://localhost:3001/api/webhooks/clickfunnels?secret=YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1 (555) 123-4567",
    "funnelId": "fun_123456",
    "externalId": "cf_contact_789",
    "utm_source": "facebook",
    "utm_medium": "cpc",
    "utm_campaign": "spring-2025-sale",
    "utm_term": "private-jet",
    "utm_content": "ad-variant-a"
  }'
```

Expected success response:
```json
{
  "ok": true,
  "id": "clxxx..."
}
```

For existing lead (upsert):
```json
{
  "ok": true,
  "id": "clxxx...",
  "updated": true
}
```

### Test Cases

1. **New Lead Creation**
   - Send payload with unique email
   - Verify lead appears in `/leads` page
   - Check UTM fields are populated

2. **Duplicate Prevention**
   - Send same email twice
   - Verify only one lead exists
   - Confirm fields are updated if improved

3. **Minimal Payload**
   ```json
   {
     "email": "minimal@test.com"
   }
   ```

4. **ClickFunnels Wrapped Payload**
   ```json
   {
     "event": "contact.created",
     "data": {
       "firstName": "Jane",
       "email": "jane@example.com"
     }
   }
   ```
   The webhook automatically handles both formats.

## Error Handling

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```
**Solution:** Check your webhook secret matches in both .env and ClickFunnels

### 400 Invalid JSON
```json
{
  "error": "Invalid JSON"
}
```
**Solution:** Ensure Content-Type is application/json and payload is valid JSON

### 400 Invalid Payload
```json
{
  "error": "Invalid payload",
  "details": { ... }
}
```
**Solution:** Check field mapping against schema. The `details` field shows which fields failed validation.

## Security Best Practices

1. **Use Strong Secrets**
   - Minimum 32 characters
   - Random, not predictable
   - Different for each environment

2. **HTTPS Only in Production**
   - Never use HTTP for webhooks in production
   - ClickFunnels will warn if using HTTP

3. **Monitor Failed Requests**
   - Set up logging/alerting for 401/400 errors
   - Check logs regularly: `app/api/webhooks/clickfunnels/route.ts`

4. **Rate Limiting (Future)**
   - Consider adding rate limiting for production
   - Use Vercel's built-in DDoS protection

## Viewing Captured Leads

1. Navigate to `http://localhost:3001/leads` (or your domain)
2. Leads appear with:
   - Status badge (NEW by default)
   - Source shown as "clickfunnels"
   - All UTM parameters visible in detail panel
   - Marketing Attribution section when UTM data exists

## Lead Management Features

- **Status Updates**: NEW → CONTACTED → QUALIFIED → CONVERTED
- **Assignment**: Assign leads to sales team members
- **Filtering**: Filter by status, search by name/email/phone
- **Detail View**: Click any lead to see full information including UTM tracking
- **Bulk Actions**: Select multiple leads for bulk operations

## API Routes

All lead operations are available through REST API:

- `GET /api/leads` - List all leads
- `GET /api/leads/:id` - Get specific lead
- `POST /api/leads` - Create lead manually
- `PATCH /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead

## ClickFunnels Webhook Events

The webhook currently handles all contact creation events. You can extend it to handle:

- `contact.updated` - Update existing lead data
- `contact.deleted` - Archive or mark lead as inactive
- `funnel.completed` - Mark lead as qualified
- `purchase.created` - Convert lead to customer

## Troubleshooting

### Webhooks Not Arriving
1. Check ClickFunnels webhook configuration
2. Verify URL is correct and accessible
3. Test with cURL to rule out ClickFunnels issues
4. Check server logs for errors

### Leads Not Appearing
1. Check webhook is returning 200 OK
2. Verify database connection
3. Check browser console for frontend errors
4. Refresh `/leads` page

### Duplicates Being Created
1. Ensure email or externalId is being sent
2. Check the duplicate detection logic
3. Review Prisma logs for query errors

## Production Deployment

### Vercel
```bash
# Set environment variable
vercel env add CLICKFUNNELS_WEBHOOK_SECRET

# Deploy
vercel --prod
```

### Other Platforms
Ensure these environment variables are set:
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `CLICKFUNNELS_WEBHOOK_SECRET`

## Monitoring

Set up monitoring for:
- Webhook success rate
- Lead creation rate
- Failed authentication attempts
- Database errors

Example tools:
- Vercel Analytics
- Sentry for error tracking
- Custom dashboard for lead metrics

## Future Enhancements

- [ ] Support for multiple funnel sources
- [ ] Custom field mapping per funnel
- [ ] Webhook retry mechanism
- [ ] Lead scoring based on UTM parameters
- [ ] Automatic lead assignment rules
- [ ] Email notifications for new qualified leads
- [ ] Integration with other funnel platforms (e.g., Leadpages, Unbounce)

## Support

For issues or questions:
1. Check this documentation
2. Review the code in `app/api/webhooks/clickfunnels/route.ts`
3. Test with cURL to isolate the issue
4. Check Prisma logs for database issues

## Code References

- Webhook endpoint: `app/api/webhooks/clickfunnels/route.ts`
- Validation schema: `lib/zod/lead.ts`
- Database schema: `prisma/schema.prisma` (Lead model)
- Leads page: `app/leads/page.tsx`
- API routes: `app/api/leads/route.ts`
