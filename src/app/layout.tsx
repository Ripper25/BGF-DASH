import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import RealTimeNotifications from "@/components/notifications/NotificationProvider";

export const metadata: Metadata = {
  title: "Bridging Gaps Foundation Dashboard",
  description: "Administrative dashboard for the Bridging Gaps Foundation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <NotificationProvider>
            {children}
            <RealTimeNotifications />
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
