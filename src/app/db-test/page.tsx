import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export default async function DbTestPage() {
  try {
    console.log('=== Database Test Started ===');
    
    const user = await currentUser();
    if (!user) {
      return <div>No user found</div>;
    }

    console.log('User found:', user.id);

    // Test basic database connection
    let basicConnectionTest = false;
    let basicConnectionError = null;
    try {
      await db.execute(sql`SELECT 1 as test`);
      basicConnectionTest = true;
      console.log('✓ Basic database connection works');
    } catch (error) {
      basicConnectionError = error;
      console.error('✗ Basic database connection failed:', error);
    }

    // Test if AI tables exist
    let tablesExist = {
      ai_conversations: false,
      ai_messages: false,
      ai_usage: false,
    };
    let tableErrors: any = {};

    // Check ai_conversations table
    try {
      await db.execute(sql`SELECT COUNT(*) FROM ai_conversations LIMIT 1`);
      tablesExist.ai_conversations = true;
      console.log('✓ ai_conversations table exists');
    } catch (error) {
      tableErrors.ai_conversations = error;
      console.error('✗ ai_conversations table check failed:', error);
    }

    // Check ai_messages table
    try {
      await db.execute(sql`SELECT COUNT(*) FROM ai_messages LIMIT 1`);
      tablesExist.ai_messages = true;
      console.log('✓ ai_messages table exists');
    } catch (error) {
      tableErrors.ai_messages = error;
      console.error('✗ ai_messages table check failed:', error);
    }

    // Check ai_usage table
    try {
      await db.execute(sql`SELECT COUNT(*) FROM ai_usage LIMIT 1`);
      tablesExist.ai_usage = true;
      console.log('✓ ai_usage table exists');
    } catch (error) {
      tableErrors.ai_usage = error;
      console.error('✗ ai_usage table check failed:', error);
    }

    console.log('=== Database Test Completed ===');

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
            Database Tables Test
          </h1>
          
          <div className="grid gap-6">
            {/* Basic Connection */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Basic Database Connection
              </h2>
              {basicConnectionError ? (
                <div className="text-red-600">
                  <p>❌ Error: {basicConnectionError instanceof Error ? basicConnectionError.message : 'Unknown error'}</p>
                </div>
              ) : (
                <div className="text-green-600">
                  <p>✅ Success: Database connection working</p>
                </div>
              )}
            </div>

            {/* Tables Check */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                AI Tables Status
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>ai_conversations:</span>
                  {tablesExist.ai_conversations ? (
                    <span className="text-green-600">✅ Exists</span>
                  ) : (
                    <span className="text-red-600">❌ Missing</span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span>ai_messages:</span>
                  {tablesExist.ai_messages ? (
                    <span className="text-green-600">✅ Exists</span>
                  ) : (
                    <span className="text-red-600">❌ Missing</span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span>ai_usage:</span>
                  {tablesExist.ai_usage ? (
                    <span className="text-green-600">✅ Exists</span>
                  ) : (
                    <span className="text-red-600">❌ Missing</span>
                  )}
                </div>
              </div>
            </div>

            {/* Table Errors */}
            {Object.keys(tableErrors).length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-red-200 dark:border-red-800">
                <h2 className="text-xl font-semibold text-red-900 dark:text-red-100 mb-4">
                  Table Errors
                </h2>
                <div className="space-y-3">
                  {Object.entries(tableErrors).map(([table, error]) => (
                    <div key={table}>
                      <h3 className="font-medium text-red-800 dark:text-red-200">{table}:</h3>
                      <p className="text-sm text-red-600 dark:text-red-300 ml-4">
                        {error instanceof Error ? error.message : 'Unknown error'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
              <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
                Recommendations
              </h2>
              <div className="space-y-2 text-blue-800 dark:text-blue-200">
                {!tablesExist.ai_conversations && (
                  <p>• The ai_conversations table is missing. You may need to run database migrations.</p>
                )}
                {!tablesExist.ai_messages && (
                  <p>• The ai_messages table is missing. You may need to run database migrations.</p>
                )}
                {!tablesExist.ai_usage && (
                  <p>• The ai_usage table is missing. You may need to run database migrations.</p>
                )}
                {tablesExist.ai_conversations && tablesExist.ai_messages && tablesExist.ai_usage && (
                  <p>• All tables exist! The issue might be in the query logic or imports.</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <a
                  href="/test-ai"
                  className="block w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-center"
                >
                  Test AI Functions
                </a>
                <a
                  href="/health"
                  className="block w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg transition-colors text-center"
                >
                  Health Check
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Database test failed:', error);
    
    return (
      <div className="min-h-screen bg-red-50 dark:bg-red-900/20 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-red-900 dark:text-red-100 mb-8">
            Database Test Failed
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
