import { currentUser } from '@clerk/nextjs/server';
import { getUserMessage, getUserProfileWithDefaults, getUserActivity, getDatabaseStats, testDatabaseConnection } from '@/lib/queries';
import { createUserMessage, updateUserMessage, deleteUserMessage, createOrUpdateUserProfile } from '@/lib/actions';
import Link from 'next/link';

export default async function DashboardPage() {
  const user = await currentUser();
  
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-foreground/70">Please sign in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  // Ensure user profile exists
  await createOrUpdateUserProfile();

  // Fetch data
  const [existingMessage, userProfile, recentActivity, dbStats, dbConnection] = await Promise.all([
    getUserMessage(),
    getUserProfileWithDefaults(),
    getUserActivity(5),
    getDatabaseStats(),
    testDatabaseConnection(),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {userProfile.firstName || user.firstName || 'User'}!
          </h1>
          <p className="text-foreground/70">
            Manage your profile, messages, and view your activity.
          </p>
        </div>

        {/* Database Connection Status */}
        <div className="mb-8">
          <div className={`p-4 rounded-lg border ${
            dbConnection.success 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}>
            <h3 className={`font-medium mb-2 ${
              dbConnection.success 
                ? 'text-green-800 dark:text-green-200' 
                : 'text-red-800 dark:text-red-200'
            }`}>
              Database Connection: {dbConnection.success ? 'Connected' : 'Failed'}
            </h3>
            <p className={`text-sm ${
              dbConnection.success 
                ? 'text-green-700 dark:text-green-300' 
                : 'text-red-700 dark:text-red-300'
            }`}>
              {dbConnection.success ? `PostgreSQL Version: ${dbConnection.version}` : `Error: ${dbConnection.error}`}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-foreground mb-2">Messages</h3>
            <p className="text-3xl font-bold text-blue-600">{dbStats.messageCount}</p>
            <p className="text-sm text-foreground/70">Total messages saved</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-foreground mb-2">Activity</h3>
            <p className="text-3xl font-bold text-green-600">{dbStats.activityCount}</p>
            <p className="text-sm text-foreground/70">Actions logged</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-foreground mb-2">Profile</h3>
            <p className="text-3xl font-bold text-purple-600">✓</p>
            <p className="text-sm text-foreground/70">Profile synced</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Message Management */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-foreground mb-4">Your Message</h2>
            
            {existingMessage ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-foreground italic">"{existingMessage.message}"</p>
                  <p className="text-sm text-foreground/70 mt-2">
                    Saved on {existingMessage.createTs.toLocaleDateString()}
                  </p>
                </div>
                
                <form action={updateUserMessage} className="space-y-4">
                  <input
                    type="text"
                    name="message"
                    defaultValue={existingMessage.message}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-foreground"
                    placeholder="Update your message..."
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Update Message
                    </button>
                    <form action={deleteUserMessage} className="inline">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </form>
              </div>
            ) : (
              <form action={createUserMessage} className="space-y-4">
                <input
                  type="text"
                  name="message"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-foreground"
                  placeholder="Save an inspiring quote or message..."
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Save Message
                </button>
              </form>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-foreground mb-4">Recent Activity</h2>
            
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-foreground capitalize">
                          {activity.action.replace('_', ' ')}
                        </p>
                        {activity.details && Object.keys(activity.details).length > 0 && (
                          <p className="text-sm text-foreground/70 mt-1">
                            {JSON.stringify(activity.details, null, 2).slice(0, 100)}...
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-foreground/50">
                        {activity.created_at.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-foreground/70">No recent activity found.</p>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <div className="mt-8 flex gap-4 justify-center">
          <Link
            href="/profile"
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            View Profile
          </Link>
          <Link
            href="/pricing"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            View Pricing
          </Link>
          <Link
            href="/premium"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Premium Content
          </Link>
        </div>
      </div>
    </div>
  );
}
