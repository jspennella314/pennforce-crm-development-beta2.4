'use client';

import AppLayout from '../../../components/AppLayout';
import AccountForm from '../../../components/AccountForm';
import { useParams, useRouter } from 'next/navigation';

export default function EditAccountPage() {
  const params = useParams();
  const router = useRouter();
  const accountId = params.id as string;

  return (
    <AppLayout>
      <div className="p-8 max-w-4xl">
        <AccountForm
          accountId={accountId}
          onSuccess={() => router.push(`/accounts/${accountId}`)}
          onCancel={() => router.back()}
        />
      </div>
    </AppLayout>
  );
}
