import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { logEnvironmentInfo } from '@/lib/env-check';

export default async function HealthPage() {
  try {
    console.log('=== Health Check Started ===');
    logEnvironmentInfo();

    // Check Clerk
    const user = await currentUser();
    console.log('Clerk user check:', user ? 'Success' : 'No user');

    // Check Database
    let dbStatus = 'Unknown';
    try {
      // Simple query to test database connection
      const result = await db.execute(sql`SELECT 1 as test`);
      dbStatus = 'Connected';
      console.log('Database check: Success');
    } catch (dbError) {
      dbStatus = 'Failed';
      console.error('Database check failed:', dbError);
    }

    console.log('=== Health Check Completed ===');

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
            System Health Check
          </h1>
          
          <div className="grid gap-6">
            {/* Environment Variables */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Environment Variables
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>NODE_ENV:</span>
                  <span className="font-mono">{process.env.NODE_ENV}</span>
                </div>
                <div className="flex justify-between">
                  <span>DATABASE_URL:</span>
                  <span className={`font-mono ${process.env.DATABASE_URL ? 'text-green-600' : 'text-red-600'}`}>
                    {process.env.DATABASE_URL ? '✓ Set' : '✗ Missing'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>CLERK_SECRET_KEY:</span>
                  <span className={`font-mono ${process.env.CLERK_SECRET_KEY ? 'text-green-600' : 'text-red-600'}`}>
                    {process.env.CLERK_SECRET_KEY ? '✓ Set' : '✗ Missing'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>OPENROUTER_API_KEY:</span>
                  <span className={`font-mono ${process.env.OPENROUTER_API_KEY ? 'text-green-600' : 'text-red-600'}`}>
                    {process.env.OPENROUTER_API_KEY ? '✓ Set' : '✗ Missing'}
                  </span>
                </div>
              </div>
            </div>

            {/* Services Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Services Status
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Clerk Authentication:</span>
                  <span className={`font-mono ${user ? 'text-green-600' : 'text-yellow-600'}`}>
                    {user ? '✓ User Authenticated' : '⚠ No User (Expected if not logged in)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Database Connection:</span>
                  <span className={`font-mono ${dbStatus === 'Connected' ? 'text-green-600' : 'text-red-600'}`}>
                    {dbStatus === 'Connected' ? '✓ Connected' : '✗ Failed'}
                  </span>
                </div>
              </div>
            </div>

            {/* User Info */}
            {user && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  User Information
                </h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>User ID:</span>
                    <span className="font-mono">{user.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span className="font-mono">{user.emailAddresses[0]?.emailAddress || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <a
                  href="/ai"
                  className="block w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-center"
                >
                  Go to AI Chat
                </a>
                <a
                  href="/dashboard"
                  className="block w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg transition-colors text-center"
                >
                  Go to Dashboard
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Health check failed:', error);
    
    return (
      <div className="min-h-screen bg-red-50 dark:bg-red-900/20 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-red-900 dark:text-red-100 mb-8">
            System Health Check Failed
          </h1>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-red-200 dark:border-red-800">
            <h2 className="text-xl font-semibold text-red-900 dark:text-red-100 mb-4">
              Error Details
            </h2>
            <pre className="text-sm text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-900/30 p-4 rounded overflow-auto">
              {error instanceof Error ? error.message : 'Unknown error'}
            </pre>
          </div>
        </div>
      </div>
    );
  }
}
