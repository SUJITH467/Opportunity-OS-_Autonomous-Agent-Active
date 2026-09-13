import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { OpportunityStoreProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "OpportunityOS — Autonomous AI Agent for Student Opportunities",
  description: "Personal opportunity manager for students discovering scholarships, internships, hackathons, and fellowships automatically.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 font-sans min-h-screen flex antialiased">
        <OpportunityStoreProvider>
          <div className="flex w-full min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <Header />
              <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
            </div>
          </div>
        </OpportunityStoreProvider>
      </body>
    </html>
  );
}
