'use client';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  username: string;
  profilePictureUrl: string;
  worldIdVerified: boolean;
}

interface UserInfoProps {
  user: User;
}

/**
 * UserInfo component with logout functionality
 */
export const UserInfo = ({ user }: UserInfoProps) => {
  const router = useRouter();
  
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border flex justify-between items-center">
      <div>
        <h2 className="text-lg font-bold">Welcome back!</h2>
        <p className="text-gray-600">Username: {user.username}</p>
        <p className="text-gray-600">User ID: {user.id}</p>
        {user.worldIdVerified && (
          <span className="text-green-600">✅ Verified</span>
        )}
      </div>
      
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
      >
        Logout
      </button>
    </div>
  );
};
