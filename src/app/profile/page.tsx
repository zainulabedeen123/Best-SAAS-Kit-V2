import { currentUser } from '@clerk/nextjs/server';
import { getUserProfileWithDefaults, getUserActivity } from '@/lib/queries';
import { updateUserPreferences } from '@/lib/actions';
import Link from 'next/link';
import Image from 'next/image';

export default async function ProfilePage() {
  const user = await currentUser();
  
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-foreground/70">Please sign in to access your profile.</p>
        </div>
      </div>
    );
  }

  const [userProfile, recentActivity] = await Promise.all([
    getUserProfileWithDefaults(),
    getUserActivity(10),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Profile Settings</h1>
          <p className="text-foreground/70">
            Manage your account information and preferences.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-foreground mb-4">Profile Information</h2>
              
              <div className="flex items-center space-x-4 mb-6">
                {userProfile.imageUrl && (
                  <Image
                    src={userProfile.imageUrl}
                    alt="Profile"
                    width={80}
                    height={80}
                    className="rounded-full"
                  />
                )}
                <div>
                  <h3 className="text-lg font-medium text-foreground">
                    {userProfile.firstName} {userProfile.lastName}
                  </h3>
                  <p className="text-foreground/70">{userProfile.email}</p>
                  <p className="text-sm text-foreground/50">
                    Member since {userProfile.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={userProfile.firstName || ''}
                    disabled
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={userProfile.lastName || ''}
                    disabled
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-foreground"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={userProfile.email}
                    disabled
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-foreground"
                  />
                </div>
              </div>

              <p className="text-sm text-foreground/60 mt-4">
                Profile information is managed through Clerk. To update your details, use the user menu.
              </p>
            </div>

            {/* Preferences Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-foreground mb-4">Preferences</h2>
              
              <form action={updateUserPreferences} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Theme Preference
                  </label>
                  <select
                    name="theme"
                    defaultValue={userProfile.preferences?.theme || 'light'}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-foreground"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="notifications"
                      name="notifications"
                      defaultChecked={userProfile.preferences?.notifications ?? true}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="notifications" className="ml-2 text-sm text-foreground">
                      Enable notifications
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="newsletter"
                      name="newsletter"
                      defaultChecked={userProfile.preferences?.newsletter ?? false}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="newsletter" className="ml-2 text-sm text-foreground">
                      Subscribe to newsletter
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Save Preferences
                </button>
              </form>
            </div>
          </div>

          {/* Activity Sidebar */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
              
              {recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="text-sm">
                      <p className="font-medium text-foreground capitalize">
                        {activity.action.replace('_', ' ')}
                      </p>
                      <p className="text-foreground/60">
                        {activity.created_at.toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-foreground/70 text-sm">No recent activity.</p>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Link
                  href="/dashboard"
                  className="block w-full px-4 py-2 text-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-foreground rounded-lg transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/pricing"
                  className="block w-full px-4 py-2 text-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-foreground rounded-lg transition-colors"
                >
                  View Plans
                </Link>
                <Link
                  href="/premium"
                  className="block w-full px-4 py-2 text-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-foreground rounded-lg transition-colors"
                >
                  Premium Content
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
