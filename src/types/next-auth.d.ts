/**
 * NextAuth.js Type Extensions
 * 
 * Extends NextAuth types to include custom properties
 */

import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    address?: string;
  }

  interface Session {
    user: {
      id: string;
      address?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    address?: string;
  }
}
