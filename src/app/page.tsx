import Image from "next/image";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <Image
              className="dark:invert"
              src="/next.svg"
              alt="Next.js logo"
              width={180}
              height={38}
              priority
            />
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Welcome to Your SaaS Platform
          </h1>
          <p className="text-xl text-foreground/70 mb-8 max-w-3xl mx-auto">
            Experience the power of Clerk authentication with integrated billing.
            Manage subscriptions, protect content, and scale your business seamlessly.
          </p>

          <div className="flex gap-4 items-center justify-center flex-col sm:flex-row">
            <SignedOut>
              <Link
                href="/pricing"
                className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
              >
                View Pricing Plans
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
              >
                Go to Dashboard
              </Link>
            </SignedIn>
            <Link
              href="/pricing"
              className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            >
              Explore Plans
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-3xl mb-4">🔐</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Secure Authentication
            </h3>
            <p className="text-foreground/70">
              Powered by Clerk with social logins, MFA, and enterprise-grade security.
            </p>
          </div>

          <div className="text-center p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-3xl mb-4">💳</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Integrated Billing
            </h3>
            <p className="text-foreground/70">
              Seamless subscription management with Stripe integration and plan-based access control.
            </p>
          </div>

          <div className="text-center p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Next.js App Router
            </h3>
            <p className="text-foreground/70">
              Built with the latest Next.js features for optimal performance and developer experience.
            </p>
          </div>
        </div>

        {/* Getting Started Section */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-8 mb-16">
          <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">
            Getting Started
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-foreground mb-2">For New Users:</h3>
              <ol className="list-decimal list-inside text-foreground/70 space-y-1">
                <li>Sign up for a free account</li>
                <li>Explore our pricing plans</li>
                <li>Choose a subscription that fits your needs</li>
                <li>Access premium features and content</li>
              </ol>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">For Developers:</h3>
              <ol className="list-decimal list-inside text-foreground/70 space-y-1">
                <li>Check out the authentication setup</li>
                <li>Explore billing integration examples</li>
                <li>See plan-based access control in action</li>
                <li>Customize for your use case</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center border-t border-gray-200 dark:border-gray-700 pt-8">
          <div className="flex gap-6 flex-wrap items-center justify-center mb-4">
            <a
              className="flex items-center gap-2 hover:underline hover:underline-offset-4 text-foreground/70 hover:text-foreground transition-colors"
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                aria-hidden
                src="/file.svg"
                alt="File icon"
                width={16}
                height={16}
              />
              Learn Next.js
            </a>
            <a
              className="flex items-center gap-2 hover:underline hover:underline-offset-4 text-foreground/70 hover:text-foreground transition-colors"
              href="https://clerk.com/docs"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                aria-hidden
                src="/window.svg"
                alt="Window icon"
                width={16}
                height={16}
              />
              Clerk Docs
            </a>
            <a
              className="flex items-center gap-2 hover:underline hover:underline-offset-4 text-foreground/70 hover:text-foreground transition-colors"
              href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                aria-hidden
                src="/globe.svg"
                alt="Globe icon"
                width={16}
                height={16}
              />
              Next.js →
            </a>
          </div>
          <p className="text-foreground/50 text-sm">
            Built with Next.js, Clerk Authentication, and Integrated Billing
          </p>
        </footer>
      </div>
    </div>
  );
}
