"use client";
import { useState } from "react";
import Sidebar from "./Sidebar";
import FintechDashboardHeader from "./FintechDashboardHeader";
import FintechDashboardCards from "./FintechDashboardCards";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Fixed sidebar for desktop */}
      <div className="hidden md:block fixed inset-y-0 left-0 w-64 z-40">
        <Sidebar />
      </div>
      {/* Overlay sidebar for mobile */}
      <div className="md:hidden">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>
      {/* Main content with left margin on desktop */}
      <div className="md:ml-64 flex flex-col min-h-screen">
        {/* Only use FintechDashboardHeader for all breakpoints */}
        <FintechDashboardHeader onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 p-2 sm:p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
