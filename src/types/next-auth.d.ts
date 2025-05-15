import 'next-auth';
import { JWT } from 'next-auth/jwt';
import { DefaultSession } from 'next-auth';
import NextAuth from "next-auth";

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    firebaseToken?: string;
  }

  interface User {
    id: string;
    email: string;
    name: string;
    image?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    sub: string;
    accessToken?: string;
    refreshToken?: string;
  }
} 