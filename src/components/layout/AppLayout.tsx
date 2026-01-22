import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { SupportWidget } from "@/components/SupportWidget";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="pl-64">
        <TopBar />
        <main className="p-6">{children}</main>
      </div>
      <SupportWidget />
    </div>
  );
}
