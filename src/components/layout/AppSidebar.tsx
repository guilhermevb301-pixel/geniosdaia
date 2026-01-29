import { SidebarContent } from "./SidebarContent";

export function AppSidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar">
      <SidebarContent />
    </aside>
  );
}
