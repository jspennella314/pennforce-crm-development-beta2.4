import AppLayout from '../../components/AppLayout';
import ContactForm from '../../components/ContactForm';

export default function NewContactPage() {
  return (
    <AppLayout>
      <div className="p-8 max-w-4xl mx-auto">
        <ContactForm />
      </div>
    </AppLayout>
  );
}
