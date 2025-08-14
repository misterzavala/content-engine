import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/contexts/sidebar-context";
import { useEffect } from "react";

const navigationItems = [
  { name: "Dashboard", href: "/", icon: "fas fa-tachometer-alt" },
  { name: "Assets", href: "/assets", icon: "fas fa-folder" },
  { name: "Queue", href: "/queue", icon: "fas fa-clock" },
  { name: "Accounts", href: "/accounts", icon: "fas fa-users" },
  { name: "Analytics", href: "/analytics", icon: "fas fa-chart-line" },
];

const automationItems = [
  { name: "Workflows", href: "/workflows", icon: "fas fa-cogs" },
  { name: "Scheduling", href: "/scheduling", icon: "fas fa-calendar" },
  { name: "Errors", href: "/errors", icon: "fas fa-exclamation-triangle" },
];

const settingsItems = [
  { name: "Preferences", href: "/preferences", icon: "fas fa-sliders-h" },
  { name: "Notifications", href: "/notifications", icon: "fas fa-bell" },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { isOpen, isMobile, close } = useSidebar();

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (!isMobile || !isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('aside') && !target.closest('[data-testid="button-menu-toggle"]')) {
        close();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen, isMobile, close]);

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={close}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-white border-r border-fb-border fixed left-0 top-14 bottom-0 overflow-y-auto z-50 transition-transform duration-300 ease-in-out",
          "w-64 md:w-48",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="p-2">
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer",
                  location === item.href
                    ? "bg-fb-blue text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
                data-testid={`nav-${item.name.toLowerCase()}`}
                onClick={isMobile ? close : undefined}
              >
                <i className={`${item.icon} mr-3 w-4`}></i>
                {item.name}
              </div>
            </Link>
          ))}
        </div>
        
        <div className="mt-6">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Automation
          </h3>
          <div className="mt-2 space-y-1">
            {automationItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 cursor-pointer",
                    location === item.href && "bg-fb-blue text-white"
                  )}
                  data-testid={`nav-${item.name.toLowerCase()}`}
                  onClick={isMobile ? close : undefined}
                >
                  <i className={`${item.icon} mr-3 w-4`}></i>
                  {item.name}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Settings
          </h3>
          <div className="mt-2 space-y-1">
            {settingsItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 cursor-pointer",
                    location === item.href && "bg-fb-blue text-white"
                  )}
                  data-testid={`nav-${item.name.toLowerCase()}`}
                  onClick={isMobile ? close : undefined}
                >
                  <i className={`${item.icon} mr-3 w-4`}></i>
                  {item.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </aside>
    </>
  );
}
