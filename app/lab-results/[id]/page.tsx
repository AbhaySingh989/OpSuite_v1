import { redirect } from 'next/navigation';

export default function LabEntryPage({ params }: { params: { id: string } }) {
  redirect(`/dashboard/lab-results/${params.id}`);
}
