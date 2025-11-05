import ContactForm from './ContactForm';

export default async function ContactPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string }>;
}) {
  const params = (await searchParams) || {};
  const success = params.success === '1';
  const error = params.error;

  return <ContactForm success={success} error={error} />;
}

