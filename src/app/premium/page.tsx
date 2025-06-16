import { auth } from '@clerk/nextjs/server'
import { Protect } from '@clerk/nextjs'
import Link from 'next/link'
import { FeatureExample } from '@/components/FeatureExample'

export default async function PremiumPage() {
  // Use auth() helper to access the has() method
  const { has } = await auth()

  // Check if user has premium access (you can replace 'premium' with your actual plan name)
  const hasPremiumAccess = has({ plan: 'premium' })
  const hasProAccess = has({ plan: 'pro' })

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-foreground mb-8">
          Premium Content
        </h1>

        {/* Example using the has() method */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Plan-Based Access Control
          </h2>
          
          {hasPremiumAccess ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-green-800 dark:text-green-200 mb-2">
                🎉 Welcome, Premium Member!
              </h3>
              <p className="text-green-700 dark:text-green-300">
                You have access to all premium features and content.
              </p>
            </div>
          ) : hasProAccess ? (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-2">
                ⭐ Pro Member Access
              </h3>
              <p className="text-blue-700 dark:text-blue-300">
                You have Pro access. Upgrade to Premium for additional features.
              </p>
            </div>
          ) : (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                🔒 Premium Access Required
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300 mb-4">
                This content is only available to Premium subscribers.
              </p>
              <Link 
                href="/pricing"
                className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                View Pricing Plans
              </Link>
            </div>
          )}
        </div>

        {/* Example using the Protect component */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Protected Content Examples
          </h2>
          
          <div className="space-y-6">
            {/* Premium Plan Protection */}
            <Protect
              plan="premium"
              fallback={
                <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    This premium content is only available to Premium subscribers.
                  </p>
                  <Link 
                    href="/pricing"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Upgrade to Premium
                  </Link>
                </div>
              }
            >
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
                <h3 className="text-lg font-medium text-purple-800 dark:text-purple-200 mb-2">
                  🚀 Premium Feature: Advanced Analytics
                </h3>
                <p className="text-purple-700 dark:text-purple-300">
                  Access detailed analytics, custom reports, and advanced insights about your data.
                </p>
              </div>
            </Protect>

            {/* Pro Plan Protection */}
            <Protect
              plan="pro"
              fallback={
                <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    This content requires a Pro subscription or higher.
                  </p>
                  <Link 
                    href="/pricing"
                    className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Upgrade to Pro
                  </Link>
                </div>
              }
            >
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <h3 className="text-lg font-medium text-green-800 dark:text-green-200 mb-2">
                  ⚡ Pro Feature: Priority Support
                </h3>
                <p className="text-green-700 dark:text-green-300">
                  Get priority customer support and faster response times.
                </p>
              </div>
            </Protect>

            {/* Feature-based Protection Example */}
            <Protect
              feature="advanced-widgets"
              fallback={
                <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Advanced widgets are not included in your current plan.
                  </p>
                  <Link 
                    href="/pricing"
                    className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Upgrade Your Plan
                  </Link>
                </div>
              }
            >
              <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
                <h3 className="text-lg font-medium text-orange-800 dark:text-orange-200 mb-2">
                  🎛️ Feature: Advanced Widgets
                </h3>
                <p className="text-orange-700 dark:text-orange-300">
                  Access to advanced widget configurations and customizations.
                </p>
              </div>
            </Protect>
          </div>
        </div>

        {/* Client-side Feature Examples */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Client-Side Feature Detection
          </h2>
          <FeatureExample />
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
