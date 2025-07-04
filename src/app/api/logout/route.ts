import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    console.log('🧹 Clearing all session data...');
    
    // List all current cookies for debugging
    const allCookies = cookieStore.getAll();
    console.log('📋 Current cookies:', allCookies.map(c => c.name));
    
    // Clear the user session cookie that contains the old malformed ID
    cookieStore.delete('user-session');
    
    // Clear any other session-related cookies
    cookieStore.delete('session-token');
    cookieStore.delete('auth-token');
    cookieStore.delete('wallet-session');
    cookieStore.delete('world-id-session');
    
    // Clear cookies with different path configurations
    cookieStore.set('user-session', '', { expires: new Date(0), path: '/' });
    cookieStore.set('session-token', '', { expires: new Date(0), path: '/' });
    
    console.log('✅ All session cookies cleared');
    
    return NextResponse.json({ 
      success: true, 
      message: 'All session data cleared successfully',
      clearedCookies: allCookies.map(c => c.name)
    });
  } catch (error) {
    console.error('❌ Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'Logout failed' },
      { status: 500 }
    );
  }
}

// GET endpoint returns HTML page that clears ALL browser storage
export async function GET() {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Clearing Session Data...</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        .success { color: green; }
        .info { color: blue; }
    </style>
</head>
<body>
    <h2>🧹 Clearing All Session Data</h2>
    <div id="status">Working...</div>
    
    <script>
        async function clearAllStorage() {
            const status = document.getElementById('status');
            
            try {
                // Clear localStorage
                localStorage.clear();
                console.log('✅ LocalStorage cleared');
                
                // Clear sessionStorage
                sessionStorage.clear();
                console.log('✅ SessionStorage cleared');
                
                // Clear all cookies
                document.cookie.split(";").forEach(function(c) { 
                    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
                });
                console.log('✅ All cookies cleared');
                
                // Clear any cached data
                if ('caches' in window) {
                    const cacheNames = await caches.keys();
                    await Promise.all(cacheNames.map(name => caches.delete(name)));
                    console.log('✅ Browser caches cleared');
                }
                
                // Clear IndexedDB if any
                if ('indexedDB' in window) {
                    try {
                        const databases = await indexedDB.databases();
                        await Promise.all(databases.map(db => {
                            return new Promise((resolve) => {
                                const deleteReq = indexedDB.deleteDatabase(db.name);
                                deleteReq.onsuccess = () => resolve();
                                deleteReq.onerror = () => resolve();
                            });
                        }));
                        console.log('✅ IndexedDB cleared');
                    } catch (e) {
                        console.log('⚠️ IndexedDB clear skipped');
                    }
                }
                
                status.innerHTML = '<div class="success">✅ All session data cleared successfully!</div><br><div class="info">You can now close this tab and refresh your app.</div>';
                
                // Automatically redirect back to home after 3 seconds
                setTimeout(() => {
                    window.close();
                    window.location.href = '/';
                }, 3000);
                
            } catch (error) {
                console.error('❌ Storage clearing error:', error);
                status.innerHTML = '<div style="color: red;">❌ Error clearing storage. Please manually clear your browser cache.</div>';
            }
        }
        
        clearAllStorage();
    </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
} 