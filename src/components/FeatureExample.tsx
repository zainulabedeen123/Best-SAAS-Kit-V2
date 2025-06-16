'use client'

import { useAuth } from '@clerk/nextjs'
import { Protect } from '@clerk/nextjs'

export function FeatureExample() {
  const { has, isLoaded } = useAuth()

  // Don't render until auth is loaded
  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground">
          Feature-Based Access Control Examples
        </h3>
        <div className="text-center py-8">
          <p className="text-foreground/70">Loading...</p>
        </div>
      </div>
    )
  }

  // Check if user has specific features (with null safety)
  const hasAdvancedAnalytics = has ? has({ feature: 'advanced-analytics' }) : false
  const hasPrioritySupport = has ? has({ feature: 'priority-support' }) : false

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">
        Feature-Based Access Control Examples
      </h3>
      
      {/* Using has() method for conditional rendering */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h4 className="font-medium text-foreground mb-2">Advanced Analytics</h4>
          {hasAdvancedAnalytics ? (
            <div className="text-green-600 dark:text-green-400">
              ✅ Feature available - You can access advanced analytics
            </div>
          ) : (
            <div className="text-gray-500">
              🔒 Feature not available in your current plan
            </div>
          )}
        </div>

        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h4 className="font-medium text-foreground mb-2">Priority Support</h4>
          {hasPrioritySupport ? (
            <div className="text-green-600 dark:text-green-400">
              ✅ Feature available - You have priority support access
            </div>
          ) : (
            <div className="text-gray-500">
              🔒 Feature not available in your current plan
            </div>
          )}
        </div>
      </div>

      {/* Using Protect component for feature protection */}
      <div className="space-y-4">
        <Protect
          feature="custom-branding"
          fallback={
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400">
                Custom branding is only available in Pro and Premium plans.
              </p>
            </div>
          }
        >
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
              🎨 Custom Branding Settings
            </h4>
            <p className="text-blue-700 dark:text-blue-300">
              Customize your brand colors, logo, and styling options.
            </p>
          </div>
        </Protect>

        <Protect
          feature="api-access"
          fallback={
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400">
                API access requires a Premium subscription.
              </p>
            </div>
          }
        >
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
            <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">
              🔌 API Access
            </h4>
            <p className="text-purple-700 dark:text-purple-300">
              Full API access with rate limiting based on your plan.
            </p>
          </div>
        </Protect>
      </div>
    </div>
  )
}
