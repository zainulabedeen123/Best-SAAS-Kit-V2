import { currentUser } from '@clerk/nextjs/server';
import { getUserAiConversations, getAiUsageStats, checkAiUsageLimits } from '@/lib/ai-queries';

export default async function TestAiPage() {
  try {
    console.log('=== AI Test Page Started ===');
    
    const user = await currentUser();
    if (!user) {
      return <div>No user found</div>;
    }

    console.log('User found:', user.id);

    // Test each function individually
    let conversations: any = null;
    let usageStats: any = null;
    let usageLimits: any = null;
    let conversationsError: any = null;
    let usageStatsError: any = null;
    let usageLimitsError: any = null;

    // Test conversations
    try {
      console.log('Testing getUserAiConversations...');
      conversations = await getUserAiConversations(20);
      console.log('✓ Conversations loaded successfully');
    } catch (error) {
      conversationsError = error;
      console.error('✗ Conversations failed:', error);
    }

    // Test usage stats
    try {
      console.log('Testing getAiUsageStats...');
      usageStats = await getAiUsageStats();
      console.log('✓ Usage stats loaded successfully');
    } catch (error) {
      usageStatsError = error;
      console.error('✗ Usage stats failed:', error);
    }

    // Test usage limits
    try {
      console.log('Testing checkAiUsageLimits...');
      usageLimits = await checkAiUsageLimits('free');
      console.log('✓ Usage limits loaded successfully');
    } catch (error) {
      usageLimitsError = error;
      console.error('✗ Usage limits failed:', error);
    }

    console.log('=== AI Test Page Completed ===');

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
            AI Functions Test
          </h1>
          
          <div className="grid gap-6">
            {/* User Info */}
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

            {/* Conversations Test */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Conversations Test
              </h2>
              {conversationsError ? (
                <div className="text-red-600">
                  <p>❌ Error: {conversationsError instanceof Error ? conversationsError.message : 'Unknown error'}</p>
                </div>
              ) : (
                <div className="text-green-600">
                  <p>✅ Success: Found {conversations?.length || 0} conversations</p>
                </div>
              )}
            </div>

            {/* Usage Stats Test */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Usage Stats Test
              </h2>
              {usageStatsError ? (
                <div className="text-red-600">
                  <p>❌ Error: {usageStatsError instanceof Error ? usageStatsError.message : 'Unknown error'}</p>
                </div>
              ) : (
                <div className="text-green-600">
                  <p>✅ Success: {JSON.stringify(usageStats, null, 2)}</p>
                </div>
              )}
            </div>

            {/* Usage Limits Test */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Usage Limits Test
              </h2>
              {usageLimitsError ? (
                <div className="text-red-600">
                  <p>❌ Error: {usageLimitsError instanceof Error ? usageLimitsError.message : 'Unknown error'}</p>
                </div>
              ) : (
                <div className="text-green-600">
                  <p>✅ Success: {JSON.stringify(usageLimits, null, 2)}</p>
                </div>
              )}
            </div>

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
                  Try AI Page Again
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
    console.error('Test page failed:', error);
    
    return (
      <div className="min-h-screen bg-red-50 dark:bg-red-900/20 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-red-900 dark:text-red-100 mb-8">
            AI Test Failed
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
