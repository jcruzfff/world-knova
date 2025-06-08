import { Navigation } from '@/components/Navigation';
import { Page } from '@/components/PageLayout';
import { ProfileCompletionDrawer } from '@/components/ProfileCompletion/ProfileCompletionDrawer';

export default async function MarketsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Page>
      {children}
      <Page.Footer className="px-0 fixed bottom-0 w-full bg-white">
        <Navigation />
      </Page.Footer>
      
      {/* Global Profile Completion Drawer - only shows for authenticated users */}
      <ProfileCompletionDrawer />
    </Page>
  );
} 