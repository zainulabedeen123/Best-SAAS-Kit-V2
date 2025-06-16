import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export default async function MigratePage() {
  try {
    console.log('=== Database Migration Started ===');
    
    const user = await currentUser();
    if (!user) {
      return <div>No user found - please log in first</div>;
    }

    console.log('User found:', user.id);

    let migrationResults: any = {};

    // Create ai_conversations table
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS ai_conversations (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          title TEXT NOT NULL,
          model TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      migrationResults.ai_conversations = 'Success';
      console.log('✓ ai_conversations table created/verified');
    } catch (error) {
      migrationResults.ai_conversations = error;
      console.error('✗ ai_conversations table creation failed:', error);
    }

    // Create ai_messages table
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS ai_messages (
          id TEXT PRIMARY KEY,
          conversation_id TEXT NOT NULL,
          role TEXT NOT NULL,
          content TEXT NOT NULL,
          tokens_used INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (conversation_id) REFERENCES ai_conversations(id) ON DELETE CASCADE
        )
      `);
      migrationResults.ai_messages = 'Success';
      console.log('✓ ai_messages table created/verified');
    } catch (error) {
      migrationResults.ai_messages = error;
      console.error('✗ ai_messages table creation failed:', error);
    }

    // Create ai_usage table
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS ai_usage (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          conversation_id TEXT,
          tokens_used INTEGER NOT NULL,
          model TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (conversation_id) REFERENCES ai_conversations(id) ON DELETE SET NULL
        )
      `);
      migrationResults.ai_usage = 'Success';
      console.log('✓ ai_usage table created/verified');
    } catch (error) {
      migrationResults.ai_usage = error;
      console.error('✗ ai_usage table creation failed:', error);
    }

    // Create indexes for better performance
    try {
      await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id)`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_ai_conversations_updated_at ON ai_conversations(updated_at)`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON ai_messages(conversation_id)`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_ai_messages_created_at ON ai_messages(created_at)`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_ai_usage_user_id ON ai_usage(user_id)`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_ai_usage_created_at ON ai_usage(created_at)`);
      migrationResults.indexes = 'Success';
      console.log('✓ Indexes created/verified');
    } catch (error) {
      migrationResults.indexes = error;
      console.error('✗ Index creation failed:', error);
    }

    console.log('=== Database Migration Completed ===');

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
            Database Migration Results
          </h1>
          
          <div className="grid gap-6">
            {/* Migration Results */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Migration Status
              </h2>
              <div className="space-y-3">
                {Object.entries(migrationResults).map(([item, result]) => (
                  <div key={item} className="flex justify-between items-center">
                    <span className="font-medium">{item}:</span>
                    {result === 'Success' ? (
                      <span className="text-green-600">✅ Success</span>
                    ) : (
                      <span className="text-red-600">❌ Failed</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Error Details */}
            {Object.values(migrationResults).some(result => result !== 'Success') && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-red-200 dark:border-red-800">
                <h2 className="text-xl font-semibold text-red-900 dark:text-red-100 mb-4">
                  Error Details
                </h2>
                <div className="space-y-3">
                  {Object.entries(migrationResults).map(([item, result]) => {
                    if (result !== 'Success') {
                      return (
                        <div key={item}>
                          <h3 className="font-medium text-red-800 dark:text-red-200">{item}:</h3>
                          <p className="text-sm text-red-600 dark:text-red-300 ml-4">
                            {result instanceof Error ? result.message : 'Unknown error'}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            )}

            {/* Success Message */}
            {Object.values(migrationResults).every(result => result === 'Success') && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
                <h2 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-4">
                  🎉 Migration Successful!
                </h2>
                <p className="text-green-800 dark:text-green-200">
                  All AI database tables have been created successfully. You can now use the AI features.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Next Steps
              </h2>
              <div className="space-y-3">
                <a
                  href="/db-test"
                  className="block w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-center"
                >
                  Test Database Tables
                </a>
                <a
                  href="/test-ai"
                  className="block w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-center"
                >
                  Test AI Functions
                </a>
                <a
                  href="/ai"
                  className="block w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-center"
                >
                  Try AI Chat
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Migration failed:', error);
    
    return (
      <div className="min-h-screen bg-red-50 dark:bg-red-900/20 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-red-900 dark:text-red-100 mb-8">
            Migration Failed
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
