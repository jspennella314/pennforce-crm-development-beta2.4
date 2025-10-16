'use client';

import { useState, useEffect } from 'react';
import AppLayout from '../../components/AppLayout';
import EmailComposer from '../../components/EmailComposer';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ContactDetailClientPage() {
  const params = useParams();
  const contactId = params.id as string;

  const [contact, setContact] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEmailComposer, setShowEmailComposer] = useState(false);

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
        <div className="p-8">
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-500">Loading contact...</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!contact) {
    return (
      <AppLayout>
        <div className="p-8">
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-500">Contact not found</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Link href="/contacts" className="hover:text-gray-900">Contacts</Link>
            <span>→</span>
            <span>{contact.firstName} {contact.lastName}</span>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {contact.firstName} {contact.lastName}
              </h1>
              {contact.title && (
                <p className="text-lg text-gray-600 mt-2">{contact.title}</p>
              )}
            </div>
            <button
              onClick={() => setShowEmailComposer(true)}
              disabled={!contact.email}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              title={!contact.email ? 'No email address' : 'Send email'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Send Email
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Details */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>
              </div>
              <div className="p-6 grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <div className="mt-1 text-gray-900">
                    {contact.email ? (
                      <a href={`mailto:${contact.email}`} className="text-blue-600 hover:text-blue-800">
                        {contact.email}
                      </a>
                    ) : '—'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <div className="mt-1 text-gray-900">
                    {contact.phone ? (
                      <a href={`tel:${contact.phone}`} className="text-blue-600 hover:text-blue-800">
                        {contact.phone}
                      </a>
                    ) : '—'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Account</label>
                  <div className="mt-1">
                    {contact.account ? (
                      <Link
                        href={`/accounts/${contact.account.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {contact.account.name}
                      </Link>
                    ) : '—'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Contact Owner</label>
                  <div className="mt-1 text-gray-900">{contact.owner?.name || '—'}</div>
                </div>
              </div>
            </div>

            {/* Related Opportunities */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Opportunities ({contact.opportunities?.length || 0})
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {contact.opportunities?.map((opp: any) => (
                  <Link
                    key={opp.id}
                    href={`/opportunities/${opp.id}`}
                    className="p-4 hover:bg-gray-50 block"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{opp.name}</div>
                        <div className="text-sm text-gray-600 mt-1">{opp.pipeline}</div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="font-semibold text-gray-900">
                          ${(parseFloat(opp.amount) / 1000000).toFixed(1)}M
                        </div>
                        <div className={`
                          inline-block px-2 py-1 rounded text-xs font-medium mt-1
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
                {(!contact.opportunities || contact.opportunities.length === 0) && (
                  <div className="p-8 text-center text-gray-500">No opportunities yet</div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Activity Timeline */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
              </div>
              <div className="p-6 space-y-4">
                {contact.activities?.slice(0, 10).map((activity: any) => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs">
                        {activity.type === 'CALL' ? '📞' :
                         activity.type === 'EMAIL' ? '📧' :
                         activity.type === 'MEETING' ? '👥' : '📝'}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">
                        {activity.subject || activity.type}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{activity.content}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(activity.loggedAt).toLocaleString()} • {activity.user?.name}
                      </div>
                    </div>
                  </div>
                ))}
                {(!contact.activities || contact.activities.length === 0) && (
                  <div className="text-center text-gray-500">No activity yet</div>
                )}
              </div>
            </div>

            {/* Open Tasks */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Open Tasks</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {contact.tasks?.map((task: any) => (
                  <div key={task.id} className="p-4">
                    <div className="font-medium text-gray-900">{task.title}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {task.dueDate && new Date(task.dueDate).toLocaleDateString()}
                    </div>
                    <div className={`
                      inline-block px-2 py-1 rounded text-xs font-medium mt-2
                      ${task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                        task.status === 'BLOCKED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'}
                    `}>
                      {task.status.replace('_', ' ')}
                    </div>
                  </div>
                ))}
                {(!contact.tasks || contact.tasks.length === 0) && (
                  <div className="p-8 text-center text-gray-500">No open tasks</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Email Composer */}
        <EmailComposer
          isOpen={showEmailComposer}
          onClose={() => setShowEmailComposer(false)}
          relatedTo={{
            type: 'contact',
            id: contact.id,
            name: `${contact.firstName} ${contact.lastName}`,
            email: contact.email,
          }}
          organizationId={contact.organizationId}
          onSuccess={fetchContact}
        />
      </div>
    </AppLayout>
  );
}
