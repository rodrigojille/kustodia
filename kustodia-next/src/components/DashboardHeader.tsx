"use client";
import AutomationStatus from "./AutomationStatus";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  showAutomation?: boolean;
}

export default function DashboardHeader({ 
  title, 
  subtitle, 
  showAutomation = true 
}: DashboardHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
            )}
          </div>
          
          {showAutomation && (
            <div className="lg:max-w-md">
              <AutomationStatus showDetails={true} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
