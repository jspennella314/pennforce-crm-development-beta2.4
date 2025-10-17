'use client';

import AppLayout from '../../../components/AppLayout';
import ContactForm from '../../../components/ContactForm';
import { useParams, useRouter } from 'next/navigation';

export default function EditContactPage() {
  const params = useParams();
  const router = useRouter();
  const contactId = params.id as string;

  return (
    <AppLayout>
      <div className="p-8 max-w-4xl">
        <ContactForm
          contactId={contactId}
          onSuccess={() => router.push(`/contacts/${contactId}`)}
          onCancel={() => router.back()}
        />
      </div>
    </AppLayout>
  );
}
