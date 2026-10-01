// src/proxy.ts
import authMiddleware from "next-auth/middleware";

// Explicitly declaring it as a function satisfies the Next.js static analyzer
export default function proxy(req: any, event: any) {
  return authMiddleware(req, event);
}

export const config = {
  matcher: ["/"],
};