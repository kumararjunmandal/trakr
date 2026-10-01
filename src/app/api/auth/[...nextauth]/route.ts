// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

const handler = NextAuth({
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
            return { id: user._id.toString(), name: user.username };
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
    signIn: '/login', // We will build this custom page next
  }
});

export { handler as GET, handler as POST };