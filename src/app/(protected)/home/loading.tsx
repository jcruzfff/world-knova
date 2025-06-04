export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-0 min-h-screen">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-gray-600">Loading your profile...</p>
      </div>
    </div>
  );
} 