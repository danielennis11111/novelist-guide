'use client';

import { signIn } from 'next-auth/react';
import Image from 'next/image';

interface SignInFormProps {
  providers: Record<string, any> | null;
}

export default function SignInForm({ providers }: SignInFormProps) {
  return (
    <div className="mt-8 space-y-6">
      <div>
        <button
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm"
        >
          <span className="absolute left-0 inset-y-0 flex items-center pl-3">
            <Image
              src="/google-logo.svg"
              alt="Google Logo"
              width={20}
              height={20}
              className="h-5 w-5"
            />
          </span>
          Continue with Google
        </button>
      </div>
    </div>
  );
} 