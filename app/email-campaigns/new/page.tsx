'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface MailingList {
  id: string;
  name: string;
  _count: {
    contacts: number;
  };
}

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  account: {
    name: string;
  } | null;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export default function NewCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [mailingLists, setMailingLists] = useState<MailingList[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    fromEmail: 'info@pennjets.com',
    fromName: 'PennJets',
    recipientType: 'list' as 'list' | 'contacts',
    mailingListId: '',
    contactIds: [] as string[],
    templateId: '',
    sendType: 'immediate' as 'immediate' | 'scheduled',
    scheduledFor: '',
  });

  useEffect(() => {
    fetchMailingLists();
    fetchContacts();
    fetchTemplates();
  }, []);

  const fetchMailingLists = async () => {
    try {
      const res = await fetch('/api/mailing-lists');
      if (res.ok) {
        const data = await res.json();
        setMailingLists(data);
      }
    } catch (error) {
      console.error('Error fetching mailing lists:', error);
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await fetch('/api/contacts');
      if (res.ok) {
        const data = await res.json();
        setContacts(data.filter((c: Contact) => c.email)); // Only contacts with emails
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/email-templates');
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setFormData({
        ...formData,
        templateId,
        subject: template.subject,
        body: template.body,
      });
    }
  };

  const toggleContact = (contactId: string) => {
    setFormData({
      ...formData,
      contactIds: formData.contactIds.includes(contactId)
        ? formData.contactIds.filter((id) => id !== contactId)
        : [...formData.contactIds, contactId],
    });
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Create campaign
      const createRes = await fetch('/api/email-campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          subject: formData.subject,
          body: formData.body,
          fromEmail: formData.fromEmail,
          fromName: formData.fromName,
          templateId: formData.templateId || null,
          mailingListId: formData.recipientType === 'list' ? formData.mailingListId : null,
          contactIds: formData.recipientType === 'contacts' ? formData.contactIds : null,
        }),
      });

      if (!createRes.ok) {
        const error = await createRes.json();
        alert(error.error || 'Failed to create campaign');
        setLoading(false);
        return;
      }

      const campaign = await createRes.json();

      // Send or schedule
      if (formData.sendType === 'immediate') {
        const sendRes = await fetch(`/api/email-campaigns/${campaign.id}/send`, {
          method: 'POST',
        });

        if (!sendRes.ok) {
          const error = await sendRes.json();
          alert(error.error || 'Failed to send campaign');
          setLoading(false);
          return;
        }

        alert('Campaign is being sent!');
      } else {
        const scheduleRes = await fetch(`/api/email-campaigns/${campaign.id}/schedule`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scheduledFor: formData.scheduledFor }),
        });

        if (!scheduleRes.ok) {
          const error = await scheduleRes.json();
          alert(error.error || 'Failed to schedule campaign');
          setLoading(false);
          return;
        }

        alert('Campaign scheduled successfully!');
      }

      router.push('/email-campaigns');
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 1) {
      return formData.name && formData.subject && formData.body;
    }
    if (step === 2) {
      if (formData.recipientType === 'list') {
        return formData.mailingListId;
      }
      return formData.contactIds.length > 0;
    }
    if (step === 3) {
      if (formData.sendType === 'scheduled') {
        return formData.scheduledFor;
      }
      return true;
    }
    return false;
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.push('/email-campaigns')}
            className="text-blue-600 hover:underline mb-4"
          >
            ← Back to Campaigns
          </button>
          <h1 className="text-3xl font-bold">Create Email Campaign</h1>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 flex items-center justify-center">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`w-24 h-1 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg border p-6">
          {/* Step 1: Content */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Step 1: Email Content</h2>

              {templates.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Use Template (Optional)
                  </label>
                  <select
                    value={formData.templateId}
                    onChange={(e) => handleTemplateSelect(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">-- No Template --</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Q4 2024 Newsletter"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Subject Line *
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Hello {{firstName}}, check out our latest updates"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use variables: {'{{firstName}}'}, {'{{lastName}}'}, {'{{name}}'}, {'{{accountName}}'}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Email Body (HTML) *
                </label>
                <textarea
                  value={formData.body}
                  onChange={(e) =>
                    setFormData({ ...formData, body: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md font-mono text-sm"
                  rows={12}
                  placeholder="<p>Hi {{firstName}},</p><p>Your content here...</p>"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    From Name
                  </label>
                  <input
                    type="text"
                    value={formData.fromName}
                    onChange={(e) =>
                      setFormData({ ...formData, fromName: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    From Email
                  </label>
                  <input
                    type="email"
                    value={formData.fromEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, fromEmail: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Recipients */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Step 2: Select Recipients</h2>

              <div className="mb-4">
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={formData.recipientType === 'list'}
                      onChange={() =>
                        setFormData({ ...formData, recipientType: 'list' })
                      }
                      className="mr-2"
                    />
                    Use Mailing List
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={formData.recipientType === 'contacts'}
                      onChange={() =>
                        setFormData({ ...formData, recipientType: 'contacts' })
                      }
                      className="mr-2"
                    />
                    Select Individual Contacts
                  </label>
                </div>
              </div>

              {formData.recipientType === 'list' ? (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Mailing List *
                  </label>
                  <select
                    value={formData.mailingListId}
                    onChange={(e) =>
                      setFormData({ ...formData, mailingListId: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">-- Select a List --</option>
                    {mailingLists.map((list) => (
                      <option key={list.id} value={list.id}>
                        {list.name} ({list._count.contacts} contacts)
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-3">
                    Select contacts to receive this campaign ({formData.contactIds.length} selected)
                  </p>
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {contacts.map((contact) => (
                      <label
                        key={contact.id}
                        className="flex items-center p-3 border rounded hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.contactIds.includes(contact.id)}
                          onChange={() => toggleContact(contact.id)}
                          className="mr-3"
                        />
                        <div className="flex-1">
                          <div className="font-medium">
                            {contact.firstName} {contact.lastName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {contact.email}
                            {contact.account && ` • ${contact.account.name}`}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Schedule */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Step 3: Send or Schedule</h2>

              <div className="mb-4">
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={formData.sendType === 'immediate'}
                      onChange={() =>
                        setFormData({ ...formData, sendType: 'immediate' })
                      }
                      className="mr-2"
                    />
                    Send Immediately
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={formData.sendType === 'scheduled'}
                      onChange={() =>
                        setFormData({ ...formData, sendType: 'scheduled' })
                      }
                      className="mr-2"
                    />
                    Schedule for Later
                  </label>
                </div>
              </div>

              {formData.sendType === 'scheduled' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Schedule Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledFor}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduledFor: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              )}

              {/* Review */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Campaign Summary</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {formData.name}
                  </div>
                  <div>
                    <span className="font-medium">Subject:</span> {formData.subject}
                  </div>
                  <div>
                    <span className="font-medium">From:</span> {formData.fromName} &lt;
                    {formData.fromEmail}&gt;
                  </div>
                  <div>
                    <span className="font-medium">Recipients:</span>{' '}
                    {formData.recipientType === 'list'
                      ? mailingLists.find((l) => l.id === formData.mailingListId)
                          ?.name || 'None'
                      : `${formData.contactIds.length} contacts`}
                  </div>
                  <div>
                    <span className="font-medium">Send:</span>{' '}
                    {formData.sendType === 'immediate'
                      ? 'Immediately'
                      : formData.scheduledFor
                      ? new Date(formData.scheduledFor).toLocaleString()
                      : 'Not set'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6 pt-4 border-t">
            <div>
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                  disabled={loading}
                >
                  Back
                </button>
              )}
            </div>
            <div>
              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  disabled={!canProceed()}
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  disabled={!canProceed() || loading}
                >
                  {loading
                    ? 'Creating...'
                    : formData.sendType === 'immediate'
                    ? 'Create & Send'
                    : 'Create & Schedule'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
