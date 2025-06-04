import { Navigation } from '@/components/Navigation';
import { Page } from '@/components/PageLayout';
import { ProfileCompletionDrawer } from '@/components/ProfileCompletion/ProfileCompletionDrawer';
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

export default async function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();

  console.log('🛡️ Protected layout - Session check:', {
    hasUser: !!user,
    hasUserId: !!user?.id,
    userId: user?.id
  });

  // If the user is not authenticated, redirect to the login page
  if (!user) {
    console.log('❌ Protected layout: Not authenticated - redirecting to login');
    redirect('/');
  }

  console.log('✅ Protected layout: Session valid, rendering children');

  return (
    <Page>
      {children}
      <Page.Footer className="px-0 fixed bottom-0 w-full bg-white">
        <Navigation />
      </Page.Footer>
      
      {/* Global Profile Completion Drawer */}
      <ProfileCompletionDrawer />
    </Page>
  );
}
