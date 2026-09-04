import { ReactNode, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { SidebarContent } from "./SidebarContent";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* Desktop: fixed sidebar */}
      {!isMobile && <AppSidebar />}
      
      {/* Mobile: Sheet sidebar */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-[272px] border-sidebar-border bg-sidebar p-0">
            <SidebarContent onNavigate={() => setSidebarOpen(false)} />
          </SheetContent>
        </Sheet>
      )}

      <div className={cn("min-h-screen min-w-0", !isMobile && "pl-[272px]")}>
        <TopBar
          onMenuClick={() => setSidebarOpen(true)}
          showMenu={isMobile}
        />
        <main className="px-5 pb-20 pt-8 sm:px-8 md:px-12 md:pt-12 lg:px-14">{children}</main>
      </div>
    </div>
  );
}
