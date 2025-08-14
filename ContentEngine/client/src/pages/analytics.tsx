import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { useRealtimeUpdates } from "@/hooks/use-websocket";
import { useSidebar } from "@/contexts/sidebar-context";
import { cn } from "@/lib/utils";

export default function AnalyticsPage() {
  const { isConnected } = useRealtimeUpdates();
  const { isOpen, isMobile } = useSidebar();

  return (
    <div className="min-h-screen bg-fb-gray">
      <Header />
      
      <div className="flex pt-14">
        <Sidebar />
        
        <main className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          !isMobile && isOpen ? "md:ml-48" : "ml-0"
        )}>
          <div className="bg-white border-b border-fb-border p-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold">Analytics & Performance</h1>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success' : 'bg-danger'}`} />
                <span className="text-xs text-gray-500">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 text-center">
            <div className="text-gray-400 mb-4">
              <i className="fas fa-chart-line text-4xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance Analytics</h3>
            <p className="text-gray-600 mb-4">Track engagement, reach, and performance across all platforms.</p>
            <div className="text-sm text-gray-500">Coming soon...</div>
          </div>
        </main>
      </div>
    </div>
  );
}