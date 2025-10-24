'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Recipient {
  id: string;
  email: string;
  status: string;
  sentAt: string | null;
  errorMessage: string | null;
  contact: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Campaign {
  id: string;
  name: string;
  subject: string;
  body: string;
  status: string;
  scheduledFor: string | null;
  sentAt: string | null;
  fromEmail: string;
  fromName: string;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  createdAt: string;
  creator: {
    name: string | null;
    email: string;
  };
  mailingList: {
    name: string;
  } | null;
  recipients: Recipient[];
}

export default function CampaignDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBody, setShowBody] = useState(false);

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  const fetchCampaign = async () => {
    try {
      const res = await fetch(`/api/email-campaigns/${id}`);
      if (res.ok) {
        const data = await res.json();
        setCampaign(data);
      }
    } catch (error) {
      console.error('Error fetching campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!confirm('Send this campaign now?')) return;

    try {
      const res = await fetch(`/api/email-campaigns/${id}/send`, {
        method: 'POST',
      });

      if (res.ok) {
        alert('Campaign is being sent!');
        fetchCampaign();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to send campaign');
      }
    } catch (error) {
      console.error('Error sending campaign:', error);
      alert('Failed to send campaign');
    }
  };

  const handleCancelSchedule = async () => {
    if (!confirm('Cancel the scheduled send?')) return;

    try {
      const res = await fetch(`/api/email-campaigns/${id}/schedule`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('Schedule cancelled');
        fetchCampaign();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to cancel schedule');
      }
    } catch (error) {
      console.error('Error cancelling schedule:', error);
      alert('Failed to cancel schedule');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: 'bg-gray-200 text-gray-800',
      SCHEDULED: 'bg-blue-200 text-blue-800',
      SENDING: 'bg-yellow-200 text-yellow-800',
      SENT: 'bg-green-200 text-green-800',
      FAILED: 'bg-red-200 text-red-800',
      CANCELLED: 'bg-gray-300 text-gray-700',
      PENDING: 'bg-gray-200 text-gray-700',
      BOUNCED: 'bg-orange-200 text-orange-800',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status] || styles.PENDING}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-8">
        <div className="text-center">Campaign not found</div>
      </div>
    );
  }

  const successRate =
    campaign.totalRecipients > 0
      ? Math.round((campaign.sentCount / campaign.totalRecipients) * 100)
      : 0;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.push('/email-campaigns')}
            className="text-blue-600 hover:underline mb-4"
          >
            ← Back to Campaigns
          </button>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{campaign.name}</h1>
                {getStatusBadge(campaign.status)}
              </div>
              <p className="text-gray-600">{campaign.subject}</p>
              <div className="flex gap-4 mt-2 text-sm text-gray-500">
                <span>
                  Created by {campaign.creator.name || campaign.creator.email}
                </span>
                <span>•</span>
                <span>{new Date(campaign.createdAt).toLocaleString()}</span>
              </div>
            </div>
            <div className="flex gap-2">
              {campaign.status === 'DRAFT' && (
                <button
                  onClick={handleSend}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Send Now
                </button>
              )}
              {campaign.status === 'SCHEDULED' && (
                <>
                  <button
                    onClick={handleSend}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Send Now
                  </button>
                  <button
                    onClick={handleCancelSchedule}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Cancel Schedule
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600">Total Recipients</div>
            <div className="text-2xl font-bold">{campaign.totalRecipients}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600">Sent</div>
            <div className="text-2xl font-bold text-green-600">
              {campaign.sentCount}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600">Failed</div>
            <div className="text-2xl font-bold text-red-600">
              {campaign.failedCount}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600">Success Rate</div>
            <div className="text-2xl font-bold">{successRate}%</div>
          </div>
        </div>

        {/* Campaign Details */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-lg font-semibold mb-4">Campaign Details</h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600">From</div>
                <div className="font-medium">
                  {campaign.fromName} &lt;{campaign.fromEmail}&gt;
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Subject</div>
                <div className="font-medium">{campaign.subject}</div>
              </div>
              {campaign.mailingList && (
                <div>
                  <div className="text-sm text-gray-600">Mailing List</div>
                  <div className="font-medium">{campaign.mailingList.name}</div>
                </div>
              )}
              {campaign.scheduledFor && (
                <div>
                  <div className="text-sm text-gray-600">Scheduled For</div>
                  <div className="font-medium">
                    {new Date(campaign.scheduledFor).toLocaleString()}
                  </div>
                </div>
              )}
              {campaign.sentAt && (
                <div>
                  <div className="text-sm text-gray-600">Sent At</div>
                  <div className="font-medium">
                    {new Date(campaign.sentAt).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Email Body</h2>
              <button
                onClick={() => setShowBody(!showBody)}
                className="text-blue-600 text-sm hover:underline"
              >
                {showBody ? 'Hide' : 'Show'} HTML
              </button>
            </div>
            {showBody ? (
              <pre className="text-xs bg-gray-50 p-4 rounded overflow-x-auto max-h-64">
                {campaign.body}
              </pre>
            ) : (
              <div
                className="prose max-w-none max-h-64 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: campaign.body }}
              />
            )}
          </div>
        </div>

        {/* Recipients Table */}
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Recipients</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Contact</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Sent At</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {campaign.recipients.map((recipient) => (
                  <tr key={recipient.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {recipient.contact.firstName} {recipient.contact.lastName}
                    </td>
                    <td className="px-4 py-3">{recipient.email}</td>
                    <td className="px-4 py-3">{getStatusBadge(recipient.status)}</td>
                    <td className="px-4 py-3">
                      {recipient.sentAt
                        ? new Date(recipient.sentAt).toLocaleString()
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-red-600 text-sm">
                      {recipient.errorMessage || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
