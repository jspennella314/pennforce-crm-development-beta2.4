import AppLayout from '../../components/AppLayout';
import AccountForm from '../../components/AccountForm';

export default function NewAccountPage() {
  return (
    <AppLayout>
      <div className="p-8 max-w-4xl mx-auto">
        <AccountForm />
      </div>
    </AppLayout>
  );
}
