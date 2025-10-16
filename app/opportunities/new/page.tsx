import AppLayout from '../../components/AppLayout';
import OpportunityForm from '../../components/OpportunityForm';

export default function NewOpportunityPage() {
  return (
    <AppLayout>
      <div className="p-8 max-w-4xl mx-auto">
        <OpportunityForm />
      </div>
    </AppLayout>
  );
}
