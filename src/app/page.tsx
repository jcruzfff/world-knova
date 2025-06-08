import { redirect } from 'next/navigation';

export default async function Home() {
  // Always redirect to markets page (the new home)
  redirect('/markets');
}
