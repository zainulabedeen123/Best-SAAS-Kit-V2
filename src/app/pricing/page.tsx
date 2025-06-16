import { PricingTable } from '@clerk/nextjs'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Select the perfect plan for your needs. Upgrade or downgrade at any time.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <PricingTable />
        </div>
        
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-left">
              <h3 className="font-medium text-foreground mb-2">
                Can I change my plan at any time?
              </h3>
              <p className="text-foreground/70">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </div>
            <div className="text-left">
              <h3 className="font-medium text-foreground mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-foreground/70">
                We accept all major credit cards through our secure Stripe integration.
              </p>
            </div>
            <div className="text-left">
              <h3 className="font-medium text-foreground mb-2">
                Is there a free trial?
              </h3>
              <p className="text-foreground/70">
                Yes, all plans come with a free trial period so you can test our features before committing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
