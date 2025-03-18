import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user }: { user: { email?: string | null } }) {
      const allowedEmails = (process.env.ADMIN_EMAILS as string).split(",");

      if (!user.email || !allowedEmails.includes(user.email)) {
        return false;
      }

      return true;
    },
    async session({ session }) {
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET as string,
  pages: {
    error: "/admin/error", // Custom error page route
  },
};