import {
  BarChart3,
  Bot,
  ChevronDown,
  ChevronRight,
  FilePlus2,
  Files,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  UserCircle2
} from "lucide-react";
import type { ComponentType } from "react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/state/auth";

const navItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: BarChart3
  }
];

const excelAgentNavItems = [
  {
    label: "Transactions",
    path: "/transactions",
    icon: Files
  },
  {
    label: "New Process",
    path: "/process/new",
    icon: FilePlus2
  }
];

export function AppLayout() {
  const navigate = useNavigate();
  const { auth, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDesktop, setIsDesktop] = useState(true);
  const [openGroups, setOpenGroups] = useState({
    excelAgent: true,
    overview: true
  });
  const initials =
    auth?.user.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    function syncSidebar(event: MediaQueryList | MediaQueryListEvent) {
      setIsDesktop(event.matches);
      setIsSidebarOpen(event.matches);
    }

    syncSidebar(mediaQuery);
    mediaQuery.addEventListener("change", syncSidebar);

    return () => mediaQuery.removeEventListener("change", syncSidebar);
  }, []);

  function handleNavigate(path: string) {
    navigate(path);
    if (!isDesktop) setIsSidebarOpen(false);
  }

  function toggleGroup(group: keyof typeof openGroups) {
    setOpenGroups((current) => ({
      ...current,
      [group]: !current[group]
    }));
  }

  return (
    <div className="h-screen overflow-hidden">
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="h-9 w-9 px-0"
              aria-label={isSidebarOpen ? "Hide side panel" : "Show side panel"}
              onClick={() => setIsSidebarOpen((current) => !current)}
            >
              {isSidebarOpen ? (
                <PanelLeftClose className="h-5 w-5" />
              ) : (
                <PanelLeftOpen className="h-5 w-5" />
              )}
            </Button>
            <button
              className="flex items-center gap-3 text-left"
              onClick={() => navigate("/dashboard")}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Bot className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold">AI Excel Q&A Agent</span>
                <span className="block text-xs text-muted-foreground">
                  Workbook questions and answers
                </span>
              </span>
            </button>
          </div>

          <span className="hidden text-sm text-muted-foreground sm:block">
            {auth?.user.name}
          </span>
        </div>
      </header>

      <div
        className={cn(
          "relative grid h-[calc(100vh-4rem)] overflow-hidden",
          isSidebarOpen && "lg:grid-cols-[17rem_minmax(0,1fr)]"
        )}
      >
        {isSidebarOpen && (
        <aside className="fixed bottom-0 left-0 top-16 z-40 w-[17rem] border-r bg-card shadow-xl lg:sticky lg:top-0 lg:h-full lg:w-auto lg:shadow-none">
          <div className="flex h-full flex-col">
            <nav className="grid flex-1 content-start gap-1 overflow-y-auto p-3">
              <SidebarGroup
                isOpen={openGroups.overview}
                items={navItems}
                label="Overview"
                onNavigate={handleNavigate}
                onToggle={() => toggleGroup("overview")}
              />
              <SidebarGroup
                isOpen={openGroups.excelAgent}
                items={excelAgentNavItems}
                label="Excel Agent"
                onNavigate={handleNavigate}
                onToggle={() => toggleGroup("excelAgent")}
              />
            </nav>

            <div className="flex shrink-0 items-center gap-3 border-t p-3">
              <button
                className="flex min-w-0 flex-1 items-center gap-3 rounded-md p-1 text-left transition-colors hover:bg-secondary"
                onClick={() => handleNavigate("/profile")}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-sm font-semibold">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <UserCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="truncate">{auth?.user.name}</span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {auth?.user.email}
                  </p>
                </div>
              </button>
              <Button
                variant="ghost"
                className="h-9 w-9 shrink-0 px-0"
                aria-label="Logout"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </aside>
        )}

        {isSidebarOpen && !isDesktop && (
          <button
            className="fixed inset-x-0 bottom-0 top-16 z-30 bg-foreground/20"
            aria-label="Close side panel"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <main className="min-w-0 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

type SidebarItem = {
  icon: ComponentType<{ className?: string }>;
  label: string;
  path: string;
};

type SidebarGroupProps = {
  isOpen: boolean;
  items: SidebarItem[];
  label: string;
  onNavigate: (path: string) => void;
  onToggle: () => void;
};

function SidebarGroup({
  isOpen,
  items,
  label,
  onNavigate,
  onToggle
}: SidebarGroupProps) {
  return (
    <div className="grid gap-1">
      <button
        className="mt-2 flex h-9 items-center justify-between rounded-md px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:bg-secondary"
        onClick={onToggle}
      >
        <span>{label}</span>
        {isOpen ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>
      {isOpen &&
        items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => onNavigate(item.path)}
            className={({ isActive }) =>
              cn(
                "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                "hover:bg-secondary hover:text-secondary-foreground",
                isActive
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
    </div>
  );
}
