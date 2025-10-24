'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Edit2 } from 'lucide-react';
import Link from 'next/link';
import AppLayout from '../../components/AppLayout';
import RecordHeader, { RecordHeaderButton, RecordHeaderDropdown } from '../../components/records/RecordHeader';
import RecordTabs from '../../components/records/RecordTabs';
import ActivityPanel from '../../components/activity/ActivityPanel';
import ActivityTimeline from '../../components/activity/ActivityTimeline';

export default function ContactDetailClientPage() {
  const params = useParams();
  const router = useRouter();
  const contactId = params.id as string;

  const [contact, setContact] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContact();
  }, [contactId]);

  const fetchContact = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/contacts/${contactId}`);
      if (!response.ok) {
        throw new Error('Contact not found');
      }
      const data = await response.json();
      setContact(data);
    } catch (error) {
      console.error('Error fetching contact:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">Loading contact...</div>
        </div>
      </AppLayout>
    );
  }

  if (!contact) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">Contact not found</div>
        </div>
      </AppLayout>
    );
  }

  const chips = [
    { label: 'Account', value: contact.account?.name || '—' },
    { label: 'Phone', value: contact.phone || '—' },
    { label: 'Email', value: contact.email || '—' },
  ];

  const detailsContent = (
    <div className="p-6">
      <div className="max-w-4xl">
        {/* Contact Details Card */}
        <div className="bg-white rounded border border-gray-200 mb-6">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900">Contact Information</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Contact Owner */}
              <div className="flex items-start justify-between group">
                <div className="flex-1">
                  <label className="text-xs font-medium text-gray-600">Contact Owner</label>
                  <div className="text-sm text-gray-900 mt-1">
                    {contact.owner?.name || '—'}
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/contacts/${contactId}/edit`)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                >
                  <Edit2 className="w-3 h-3 text-gray-500" />
                </button>
              </div>

              {/* Name */}
              <div className="flex items-start justify-between group">
                <div className="flex-1">
                  <label className="text-xs font-medium text-gray-600">Name</label>
                  <div className="text-sm text-gray-900 mt-1">
                    {contact.firstName} {contact.lastName}
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/contacts/${contactId}/edit`)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                >
                  <Edit2 className="w-3 h-3 text-gray-500" />
                </button>
              </div>

              {/* Account Name */}
              <div className="flex items-start justify-between group">
                <div className="flex-1">
                  <label className="text-xs font-medium text-gray-600">Account Name</label>
                  <div className="text-sm mt-1">
                    {contact.account ? (
                      <Link
                        href={`/accounts/${contact.account.id}`}
                        className="text-[#0176d3] hover:underline"
                      >
                        {contact.account.name}
                      </Link>
                    ) : (
                      <span className="text-gray-900">—</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/contacts/${contactId}/edit`)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                >
                  <Edit2 className="w-3 h-3 text-gray-500" />
                </button>
              </div>

              {/* Title */}
              <div className="flex items-start justify-between group">
                <div className="flex-1">
                  <label className="text-xs font-medium text-gray-600">Title</label>
                  <div className="text-sm text-gray-900 mt-1">
                    {contact.title || '—'}
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/contacts/${contactId}/edit`)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                >
                  <Edit2 className="w-3 h-3 text-gray-500" />
                </button>
              </div>

              {/* Phone */}
              <div className="flex items-start justify-between group">
                <div className="flex-1">
                  <label className="text-xs font-medium text-gray-600">Phone</label>
                  <div className="text-sm mt-1">
                    {contact.phone ? (
                      <a href={`tel:${contact.phone}`} className="text-[#0176d3] hover:underline">
                        {contact.phone}
                      </a>
                    ) : (
                      <span className="text-gray-900">—</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/contacts/${contactId}/edit`)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                >
                  <Edit2 className="w-3 h-3 text-gray-500" />
                </button>
              </div>

              {/* Email */}
              <div className="flex items-start justify-between group">
                <div className="flex-1">
                  <label className="text-xs font-medium text-gray-600">Email</label>
                  <div className="text-sm mt-1">
                    {contact.email ? (
                      <a href={`mailto:${contact.email}`} className="text-[#0176d3] hover:underline">
                        {contact.email}
                      </a>
                    ) : (
                      <span className="text-gray-900">—</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/contacts/${contactId}/edit`)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                >
                  <Edit2 className="w-3 h-3 text-gray-500" />
                </button>
              </div>

              {/* Do Not Call */}
              <div className="flex items-start justify-between group">
                <div className="flex-1">
                  <label className="text-xs font-medium text-gray-600">Do Not Call</label>
                  <div className="text-sm text-gray-900 mt-1">
                    {contact.doNotCall ? 'Yes' : 'No'}
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/contacts/${contactId}/edit`)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                >
                  <Edit2 className="w-3 h-3 text-gray-500" />
                </button>
              </div>

              {/* Email Opt Out */}
              <div className="flex items-start justify-between group">
                <div className="flex-1">
                  <label className="text-xs font-medium text-gray-600">Email Opt Out</label>
                  <div className="text-sm text-gray-900 mt-1">
                    {contact.emailOptOut ? 'Yes' : 'No'}
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/contacts/${contactId}/edit`)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                >
                  <Edit2 className="w-3 h-3 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const relatedContent = (
    <div className="p-6">
      <div className="max-w-4xl">
        {/* Opportunities */}
        <div className="bg-white rounded border border-gray-200 mb-6">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">
              Opportunities ({contact.opportunities?.length || 0})
            </h3>
            <button className="text-xs text-[#0176d3] hover:underline font-medium">
              New
            </button>
          </div>
          <div>
            {contact.opportunities && contact.opportunities.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {contact.opportunities.map((opp: any) => (
                  <Link
                    key={opp.id}
                    href={`/opportunities/${opp.id}`}
                    className="p-4 hover:bg-gray-50 block"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-[#0176d3] hover:underline">
                          {opp.name}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">{opp.pipeline}</div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-sm font-semibold text-gray-900">
                          ${(parseFloat(opp.amount) / 1000000).toFixed(1)}M
                        </div>
                        <div className={`
                          inline-block px-2 py-0.5 rounded text-xs font-medium mt-1
                          ${opp.stage === 'WON' ? 'bg-green-100 text-green-800' :
                            opp.stage === 'LOST' ? 'bg-red-100 text-red-800' :
                            opp.stage === 'NEGOTIATION' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'}
                        `}>
                          {opp.stage}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-gray-500">
                No opportunities yet
              </div>
            )}
          </div>
        </div>

        {/* Open Tasks */}
        <div className="bg-white rounded border border-gray-200 mb-6">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">
              Open Tasks ({contact.tasks?.filter((t: any) => t.status !== 'Completed').length || 0})
            </h3>
            <button className="text-xs text-[#0176d3] hover:underline font-medium">
              New
            </button>
          </div>
          <div>
            {contact.tasks && contact.tasks.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {contact.tasks
                  .filter((task: any) => task.status !== 'Completed')
                  .map((task: any) => (
                    <div key={task.id} className="p-4 hover:bg-gray-50">
                      <div className="text-sm font-medium text-gray-900">{task.subject}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {task.dueDate && new Date(task.dueDate).toLocaleDateString()}
                      </div>
                      <div className={`
                        inline-block px-2 py-0.5 rounded text-xs font-medium mt-2
                        ${task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          task.status === 'Blocked' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'}
                      `}>
                        {task.status}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-gray-500">
                No open tasks
              </div>
            )}
          </div>
        </div>

        {/* Activity Timeline */}
        <ActivityTimeline
          activities={contact.activities || []}
          onRefresh={fetchContact}
        />
      </div>
    </div>
  );

  const chatterContent = (
    <div className="p-6">
      <div className="max-w-4xl">
        <div className="bg-white rounded border border-gray-200 p-8 text-center">
          <div className="text-sm text-gray-500">Chatter feed coming soon...</div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'details', label: 'Details', content: detailsContent },
    { id: 'related', label: 'Related', content: relatedContent },
    { id: 'chatter', label: 'Chatter', content: chatterContent },
  ];

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Record Header */}
        <RecordHeader
          title={`${contact.firstName} ${contact.lastName}`}
          subtitle={contact.title}
          chips={chips}
          actions={
            <>
              <RecordHeaderButton onClick={() => console.log('Follow')}>
                Follow
              </RecordHeaderButton>
              <RecordHeaderDropdown label="New Case">
                <div className="py-1">
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    New Case
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    New Note
                  </button>
                </div>
              </RecordHeaderDropdown>
            </>
          }
        />

        {/* Two-Column Layout: Tabs on left, Activity on right */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Record Tabs */}
          <div className="flex-1 overflow-hidden">
            <RecordTabs tabs={tabs} defaultTab="details" />
          </div>

          {/* Right: Activity Panel */}
          <div className="w-96 border-l border-gray-200 overflow-auto bg-[#f3f3f3] p-4">
            <ActivityPanel recordId={contactId} recordType="contact" />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
