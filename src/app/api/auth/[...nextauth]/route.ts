// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    // 1. Google Login
    GoogleProvider({
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string,
    }),
    
    // 2. Custom Username & Password Login
    CredentialsProvider({
      name: "Username",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const client = await clientPromise;
        const db = client.db("trakr");
        
        // Find user in your MongoDB 'users' collection
        const user = await db.collection("users").findOne({ username: credentials.username });

        if (user) {
          // Compare hashed password
          const isValid = bcrypt.compareSync(credentials.password, user.password);
          if (isValid) {
            return { id: user._id.toString(), name: user.username, email: user.email };
          }
        }
        
        // If login fails, return null
        return null;
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login', 
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          const client = await clientPromise;
          const db = client.db('trakr');
          
          // Check if user exists, if not create basic record
          const existing = await db.collection('users').findOne({ email: user.email });
          if (!existing) {
            await db.collection('users').insertOne({
              name: user.name,
              email: user.email,
              image: user.image,
              username: '',
              phone: '',
              createdAt: new Date()
            });
          }
        } catch (error) {
          console.error('Error saving Google user to DB:', error);
        }
      }
      return true;
    },
    async session({ session, token }) {
      // Ensure the email is passed to the session for your profile queries
      if (token && session.user) {
        session.user.email = token.email as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
      }
      return token;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };