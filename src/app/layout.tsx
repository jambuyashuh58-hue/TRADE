import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "TradePulse — Your Trading Brain",
  description: "Unified Indian trading dashboard",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "TradePulse" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#060b0f",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="overflow-hidden h-screen bg-[#060b0f]">
        <AppShell>{children}</AppShell>
        <Toaster
          position="top-center"
          toastOptions={{
            style: { background: "#0c1117", color: "#e2e8f0", border: "1px solid #243040", fontSize: "13px", borderRadius: "10px" },
            success: { iconTheme: { primary: "#00d97e", secondary: "#0c1117" } },
            error:   { iconTheme: { primary: "#ff4560", secondary: "#0c1117" } },
          }}
        />
      </body>
    </html>
  );
}
