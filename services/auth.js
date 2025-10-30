/**
 * Authentication Service
 * NextAuth.js configuration for OAuth2 with Google
 */

export const authConfig = {
  providers: [
    {
      id: 'google',
      name: 'Google',
      type: 'oauth',
      wellKnown: 'https://accounts.google.com/.well-known/openid-configuration',
      authorization: { params: { scope: 'openid email profile' } },
      idToken: true,
      checks: ['pkce', 'state'],
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    },
  ],
  pages: {
    signIn: '/auth/signin',
    callback: '/auth/callback',
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      if (profile) {
        token.name = profile.name;
        token.email = profile.email;
        token.picture = profile.picture;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.sub;
      session.user.accessToken = token.accessToken;
      return session;
    },
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('User signed in:', user.email);
    },
  },
};

/**
 * Usage in Next.js API route:
 * 
 * // app/api/auth/[...nextauth]/route.ts
 * import NextAuth from 'next-auth';
 * import { authConfig } from '@/lib/auth';
 * 
 * const handler = NextAuth(authConfig);
 * export { handler as GET, handler as POST };
 */

/**
 * Usage in components:
 * 
 * import { signIn, signOut, useSession } from 'next-auth/react';
 * import { SessionProvider } from 'next-auth/react';
 * 
 * function MyComponent() {
 *   const { data: session } = useSession();
 *   
 *   if (!session) {
 *     return <button onClick={() => signIn('google')}>Sign in</button>;
 *   }
 *   
 *   return (
 *     <div>
 *       Welcome {session.user.name}!
 *       <button onClick={() => signOut()}>Sign out</button>
 *     </div>
 *   );
 * }
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <SessionProvider>
 *       {children}
 *     </SessionProvider>
 *   );
 * }
 */

/**
 * Environment Variables Required:
 * 
 * NEXTAUTH_URL=http://localhost:3000
 * NEXTAUTH_SECRET=your-secret-key-here
 * GOOGLE_CLIENT_ID=your-google-client-id
 * GOOGLE_CLIENT_SECRET=your-google-client-secret
 * 
 * To get Google OAuth credentials:
 * 1. Go to https://console.cloud.google.com/
 * 2. Create new project
 * 3. Enable Google+ API
 * 4. Create OAuth 2.0 credentials (Web application)
 * 5. Add http://localhost:3000/api/auth/callback/google as authorized redirect
 * 6. Copy Client ID and Secret
 */
