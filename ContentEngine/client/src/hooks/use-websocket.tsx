import { useEffect } from "react";
import { useWebSocket } from "@/lib/websocket";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export function useRealtimeUpdates() {
  const { addMessageListener, isConnected } = useWebSocket('/ws');
  const { toast } = useToast();

  useEffect(() => {
    const removeAssetCreatedListener = addMessageListener('asset_created', (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "New Asset Created",
        description: `Asset ${data.serial} has been created.`,
      });
    });

    const removeAssetUpdatedListener = addMessageListener('asset_updated', (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/assets', data.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    });

    const removeAssetDeletedListener = addMessageListener('asset_deleted', (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Asset Deleted",
        description: "Asset has been removed from the pipeline.",
      });
    });

    const removeWorkflowStartedListener = addMessageListener('workflow_started', (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
      toast({
        title: "Workflow Started",
        description: `${data.workflowType} workflow initiated for asset.`,
      });
    });

    const removeWorkflowCompletedListener = addMessageListener('workflow_completed', (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      
      const status = data.status === 'completed' ? 'default' : 'destructive';
      const title = data.status === 'completed' ? 'Workflow Completed' : 'Workflow Failed';
      const description = data.status === 'completed' 
        ? 'Asset processing completed successfully.'
        : 'Asset processing failed. Check the workflow details.';

      toast({
        title,
        description,
        variant: status,
      });
    });

    return () => {
      removeAssetCreatedListener();
      removeAssetUpdatedListener();
      removeAssetDeletedListener();
      removeWorkflowStartedListener();
      removeWorkflowCompletedListener();
    };
  }, [addMessageListener, toast]);

  return { isConnected };
}
