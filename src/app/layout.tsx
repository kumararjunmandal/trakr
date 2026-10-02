// src/app/layout.tsx
'use client'; 

import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";

// THIS COMPONENT AUTO-APPLIES THE THEME GLOBALLY
function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const fetchUserTheme = async () => {
      try {
        const res = await fetch('/api/user');
        if (res.ok) {
          const userData = await res.json();
          if (userData.theme) {
            document.documentElement.setAttribute('data-theme', userData.theme);
          }
        }
      } catch (error) {
        console.error('Failed to fetch global theme:', error);
      }
    };
    fetchUserTheme();
  }, []);

  return <>{children}</>;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased text-[#FAFAFA] bg-[#000000]">
        <SessionProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}