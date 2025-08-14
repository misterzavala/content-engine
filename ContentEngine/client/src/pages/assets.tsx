import { useState } from "react";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import AssetTable from "@/components/assets/asset-table";
import AssetModal from "@/components/assets/asset-modal";
import CreateAssetModal from "@/components/assets/create-asset-modal";
import { useRealtimeUpdates } from "@/hooks/use-websocket";
import { useSidebar } from "@/contexts/sidebar-context";
import { cn } from "@/lib/utils";

export default function AssetsPage() {
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { isConnected } = useRealtimeUpdates();
  const { isOpen, isMobile } = useSidebar();

  return (
    <div className="min-h-screen bg-fb-gray">
      <Header 
        onCreateAsset={() => setShowCreateModal(true)}
        onBulkUpload={() => console.log('Bulk upload clicked')}
      />
      
      <div className="flex pt-14">
        <Sidebar />
        
        <main className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          !isMobile && isOpen ? "md:ml-48" : "ml-0"
        )}>
          <div className="bg-white border-b border-fb-border p-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold">Asset Management</h1>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success' : 'bg-danger'}`} />
                <span className="text-xs text-gray-500">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white">
            <AssetTable onAssetSelect={setSelectedAssetId} />
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
    </div>
  );
}