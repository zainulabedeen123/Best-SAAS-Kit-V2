import { currentUser } from '@clerk/nextjs/server';
import { createNewConversation } from '@/lib/ai-actions';

export default async function TestCreateConversationPage() {
  const user = await currentUser();

  if (!user) {
    return <div>Please sign in</div>;
  }

  async function testCreateConversation() {
    'use server';
    try {
      console.log('Testing conversation creation...');
      await createNewConversation();
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Test Create Conversation</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
            <h2 className="font-semibold mb-2">User Information</h2>
            <p>User ID: {user.id}</p>
            <p>Email: {user.emailAddresses[0]?.emailAddress}</p>
          </div>

          <form action={testCreateConversation}>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Test Create New Conversation
            </button>
          </form>

          <div className="space-y-2">
            <a
              href="/ai"
              className="block w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-center"
            >
              Go to AI Page
            </a>
            <a
              href="/test-ai"
              className="block w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-center"
            >
              Test AI Functions
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
