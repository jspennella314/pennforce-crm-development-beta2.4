import AppLayout from '../../components/AppLayout';
import AircraftForm from '../../components/AircraftForm';

export default function NewAircraftPage() {
  return (
    <AppLayout>
      <div className="p-8 max-w-4xl mx-auto">
        <AircraftForm />
      </div>
    </AppLayout>
  );
}
