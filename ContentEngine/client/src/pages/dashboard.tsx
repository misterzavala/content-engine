import { useState } from "react";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import KpiCards from "@/components/dashboard/kpi-cards";
import AssetTable from "@/components/assets/asset-table";
import AssetModal from "@/components/assets/asset-modal";
import CreateAssetModal from "@/components/assets/create-asset-modal";
import BulkUploadModal from "@/components/assets/bulk-upload-modal";
import { useRealtimeUpdates } from "@/hooks/use-websocket";
import { useSidebar } from "@/contexts/sidebar-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const { isConnected } = useRealtimeUpdates();
  const { isOpen, isMobile } = useSidebar();

  return (
    <div className="min-h-screen bg-fb-gray">
      <Header 
        onCreateAsset={() => setShowCreateModal(true)}
        onBulkUpload={() => setShowBulkUpload(true)}
      />
      
      <div className="flex pt-14">
        <Sidebar />
        
        <main className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          !isMobile && isOpen ? "md:ml-48" : "ml-0"
        )}>
          {/* Dashboard Header with KPIs */}
          <div className="bg-white border-b border-fb-border p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-3 sm:space-y-0">
              <h1 className="text-lg sm:text-xl font-semibold">Content Pipeline Dashboard</h1>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success' : 'bg-danger'}`} />
                  <span className="text-xs text-gray-500">
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <select className="text-xs sm:text-sm border border-fb-border rounded px-2 py-1">
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Custom range</option>
                  </select>
                  <button className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-gray-100 rounded hover:bg-gray-200">
                    <i className="fas fa-download mr-1"></i><span className="hidden sm:inline">Export</span>
                  </button>
                </div>
              </div>
            </div>

            <KpiCards />
          </div>

          {/* Content Tabs */}
          <div className="bg-white border-b border-fb-border">
            <Tabs defaultValue="assets" className="w-full">
              <TabsList className="flex overflow-x-auto space-x-4 sm:space-x-6 px-3 sm:px-4 bg-transparent h-auto scrollbar-hide">
                <TabsTrigger 
                  value="assets" 
                  className="py-3 px-1 text-sm sm:text-base border-b-2 border-transparent data-[state=active]:border-fb-blue data-[state=active]:text-fb-blue bg-transparent whitespace-nowrap"
                >
                  Active Assets
                </TabsTrigger>
                <TabsTrigger 
                  value="queue" 
                  className="py-3 px-1 text-sm sm:text-base border-b-2 border-transparent data-[state=active]:border-fb-blue data-[state=active]:text-fb-blue bg-transparent whitespace-nowrap"
                >
                  Publishing Queue
                </TabsTrigger>
                <TabsTrigger 
                  value="activity" 
                  className="py-3 px-1 text-sm sm:text-base border-b-2 border-transparent data-[state=active]:border-fb-blue data-[state=active]:text-fb-blue bg-transparent whitespace-nowrap"
                >
                  Recent Activity
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="py-3 px-1 text-sm sm:text-base border-b-2 border-transparent data-[state=active]:border-fb-blue data-[state=active]:text-fb-blue bg-transparent whitespace-nowrap"
                >
                  Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="assets" className="mt-0">
                <AssetTable onAssetSelect={setSelectedAssetId} />
              </TabsContent>
              
              <TabsContent value="queue" className="mt-0">
                <div className="p-8 text-center text-gray-500">
                  Queue management coming soon...
                </div>
              </TabsContent>
              
              <TabsContent value="activity" className="mt-0">
                <div className="p-8 text-center text-gray-500">
                  Activity feed coming soon...
                </div>
              </TabsContent>
              
              <TabsContent value="analytics" className="mt-0">
                <div className="p-8 text-center text-gray-500">
                  Analytics dashboard coming soon...
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Asset Modal */}
      {selectedAssetId && (
        <AssetModal 
          assetId={selectedAssetId} 
          isOpen={!!selectedAssetId}
          onClose={() => setSelectedAssetId(null)}
        />
      )}

      {/* Create Asset Modal */}
      <CreateAssetModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Bulk Upload Modal */}
      <BulkUploadModal 
        isOpen={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
      />

      {/* Quick Actions */}
      <div className="fixed bottom-6 right-6 space-y-3">
        <button 
          className="w-12 h-12 bg-fb-blue text-white rounded-full shadow-lg hover:bg-blue-600 flex items-center justify-center"
          title="Create New Asset"
          onClick={() => setShowCreateModal(true)}
          data-testid="button-create-asset"
        >
          <i className="fas fa-plus"></i>
        </button>
        <button 
          className="w-12 h-12 bg-success text-white rounded-full shadow-lg hover:bg-green-600 flex items-center justify-center"
          title="Bulk Operations"
          data-testid="button-bulk-operations"
        >
          <i className="fas fa-list"></i>
        </button>
        <button 
          className="w-12 h-12 bg-warning text-white rounded-full shadow-lg hover:bg-yellow-600 flex items-center justify-center"
          title="Analytics"
          data-testid="button-analytics"
        >
          <i className="fas fa-chart-bar"></i>
        </button>
      </div>
    </div>
  );
}
