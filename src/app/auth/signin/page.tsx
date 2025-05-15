import { getProviders } from 'next-auth/react';
import SignInForm from '@/components/auth/SignInForm';

export default async function SignIn() {
  const providers = await getProviders();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Novelist Guide
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Connect with Google to sync your novels with Google Drive
          </p>
        </div>
        <SignInForm providers={providers} />
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            By signing in, you agree to our{' '}
            <a href="/terms" className="font-medium text-indigo-600 hover:text-indigo-500">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="font-medium text-indigo-600 hover:text-indigo-500">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 