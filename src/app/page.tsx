import { Page } from '@/components/PageLayout';
import { AuthButton } from '../components/AuthButton';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

async function getSession() {
  try {
    const cookieStore = await cookies();
    const userSession = cookieStore.get('user-session')?.value;
    
    if (!userSession) {
      return null;
    }
    
    return JSON.parse(userSession);
  } catch (error) {
    console.error('Error fetching session:', error);
    return null;
  }
}

export default async function Home() {
  const user = await getSession();

  console.log('Main page - Session state:', {
    hasUser: !!user,
    hasUserId: !!user?.id,
    userId: user?.id
  });

  // If user is already authenticated, redirect to home
  if (user?.id) {
    console.log('✅ User already authenticated, redirecting to /home');
    redirect('/home');
  }

  return (
    <Page>
      <Page.Main className="flex flex-col items-center justify-center">
        {user?.id ? (
          <div className="text-center">
            <p className="mb-4">✅ You are logged in as: {user.username}</p>
            <a href="/home" className="bg-blue-500 text-white px-4 py-2 rounded">
              Go to Home
            </a>
          </div>
        ) : (
          <AuthButton />
        )}
      </Page.Main>
    </Page>
  );
}
