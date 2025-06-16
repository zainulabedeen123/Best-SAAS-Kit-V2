# Clerk Billing Integration Setup

This project demonstrates how to integrate Clerk's B2C SaaS billing into a Next.js App Router application.

## Features Implemented

### 🔐 Authentication
- Clerk authentication with social logins
- User management and profiles
- Secure middleware protection

### 💳 Billing Integration
- Pricing table with subscription plans
- Plan-based access control
- Feature-based access control
- Protected content examples

### 🎨 UI Components
- Responsive pricing page
- Protected content demonstrations
- Navigation with authentication states
- Modern Tailwind CSS styling

## Pages Created

### `/pricing`
- Displays Clerk's `<PricingTable />` component
- Shows available subscription plans
- Includes FAQ section
- Responsive design with Tailwind CSS

### `/premium`
- Demonstrates plan-based access control using `auth().has()`
- Shows feature-based protection with `<Protect>` component
- Examples of both server-side and client-side access control
- Fallback content for non-subscribers

### `/` (Home)
- Updated landing page showcasing the SaaS platform
- Conditional navigation based on authentication state
- Feature highlights and getting started guide

## Access Control Examples

### Server-Side Access Control
```typescript
import { auth } from '@clerk/nextjs/server'

export default async function Page() {
  const { has } = await auth()
  
  // Check for specific plans
  const hasPremiumAccess = has({ plan: 'premium' })
  const hasProAccess = has({ plan: 'pro' })
  
  // Check for specific features
  const hasAdvancedAnalytics = has({ feature: 'advanced-analytics' })
  
  if (!hasPremiumAccess) {
    return <div>Premium access required</div>
  }
  
  return <div>Premium content here</div>
}
```

### Client-Side Access Control
```typescript
'use client'
import { useAuth } from '@clerk/nextjs'

export function FeatureComponent() {
  const { has } = useAuth()
  
  const hasFeature = has({ feature: 'custom-branding' })
  
  return (
    <div>
      {hasFeature ? (
        <div>Feature available!</div>
      ) : (
        <div>Upgrade to access this feature</div>
      )}
    </div>
  )
}
```

### Using the Protect Component
```typescript
import { Protect } from '@clerk/nextjs'

export function ProtectedContent() {
  return (
    <Protect
      plan="premium"
      fallback={<div>Premium subscription required</div>}
    >
      <div>Premium content here</div>
    </Protect>
  )
}
```

## Setup Instructions

### 1. Enable Billing in Clerk Dashboard
1. Navigate to the Billing Settings page in your Clerk Dashboard
2. Enable billing for your application
3. Choose your payment gateway (Clerk development gateway for testing, or your own Stripe account)

### 2. Create Plans
1. Go to the Plans page in the Clerk Dashboard
2. Select "Plans for Users" tab
3. Create your subscription plans (e.g., Basic, Pro, Premium)
4. Add features to each plan as needed

### 3. Configure Features
Add features to your plans that you want to use for access control:
- `advanced-analytics`
- `priority-support`
- `custom-branding`
- `api-access`
- etc.

### 4. Environment Variables
The following environment variables are already configured:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_cG9saXRlLWRvdmUtMC5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_COcbWNFYuKdYNcjTPVE31NJkSKKyoNpVPHOqAlnxyP
```

## Testing the Integration

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Test the flow:**
   - Visit the home page
   - Sign up for a new account
   - Navigate to `/pricing` to see available plans
   - Subscribe to a plan
   - Visit `/premium` to see access control in action

3. **Test access control:**
   - Try accessing premium content without a subscription
   - Subscribe to different plans and see how access changes
   - Test both plan-based and feature-based protection

## Key Components

### PricingTable
- Automatically displays plans configured in Clerk Dashboard
- Handles subscription flow
- Responsive design

### Access Control Methods
- `auth().has()` - Server-side access checking
- `useAuth().has()` - Client-side access checking
- `<Protect>` - Component-based protection

### Navigation
- Conditional rendering based on authentication state
- Links to pricing and premium content
- User profile management

## Billing Costs
- Clerk billing: 0.7% per transaction
- Stripe fees: Paid directly to Stripe
- No additional setup fees

## Next Steps

1. **Customize Plans:** Create your own subscription plans in the Clerk Dashboard
2. **Add Features:** Define features that match your application's needs
3. **Customize UI:** Modify the pricing page and protected content to match your brand
4. **Add More Protection:** Implement access control throughout your application
5. **Production Setup:** Configure your own Stripe account for production use

## Resources

- [Clerk Billing Documentation](https://clerk.com/docs/billing)
- [Next.js App Router Guide](https://nextjs.org/docs/app)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
