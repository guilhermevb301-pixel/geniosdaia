import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="pl-64">
        <TopBar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
