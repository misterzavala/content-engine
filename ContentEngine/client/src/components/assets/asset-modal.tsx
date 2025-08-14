import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import StatusBadge from "@/components/ui/status-badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { AssetWithDestinations } from "@shared/schema";

interface AssetModalProps {
  assetId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function AssetModal({ assetId, isOpen, onClose }: AssetModalProps) {
  const [caption, setCaption] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const { toast } = useToast();

  const { data: asset, isLoading } = useQuery<AssetWithDestinations>({
    queryKey: ['/api/assets', assetId],
    enabled: isOpen && !!assetId,
  });

  const publishNowMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/webhook/n8n', {
        type: 'publish_now',
        assetId,
        payload: {
          caption,
          publishNow: true,
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "Publishing Started",
        description: "Asset is being published now.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
      onClose();
    },
    onError: () => {
      toast({
        title: "Publishing Failed",
        description: "Failed to start publishing process.",
        variant: "destructive",
      });
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: async () => {
      const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`);
      
      // Update asset with scheduled time
      await apiRequest('PATCH', `/api/assets/${assetId}`, {
        caption,
        scheduledAt: scheduledAt.toISOString(),
      });

      // Trigger scheduling workflow
      return apiRequest('POST', '/api/webhook/n8n', {
        type: 'schedule',
        assetId,
        payload: {
          caption,
          scheduledAt: scheduledAt.toISOString(),
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "Asset Scheduled",
        description: "Asset has been scheduled for publishing.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
      onClose();
    },
    onError: () => {
      toast({
        title: "Scheduling Failed",
        description: "Failed to schedule asset.",
        variant: "destructive",
      });
    },
  });

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'reel':
        return 'fas fa-play';
      case 'carousel':
        return 'fas fa-images';
      case 'post':
        return 'fas fa-image';
      default:
        return 'fas fa-file';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return 'fab fa-instagram';
      case 'tiktok':
        return 'fab fa-tiktok';
      case 'linkedin':
        return 'fab fa-linkedin';
      case 'facebook':
        return 'fab fa-facebook';
      default:
        return 'fas fa-share-alt';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return 'bg-gradient-to-r from-purple-400 to-pink-400';
      case 'tiktok':
        return 'bg-black';
      case 'linkedin':
        return 'bg-fb-blue';
      case 'facebook':
        return 'bg-fb-blue';
      default:
        return 'bg-gray-500';
    }
  };

  // Initialize form when asset loads
  useEffect(() => {
    if (asset) {
      setCaption(asset.caption || "");
      if (asset.scheduledAt) {
        const date = new Date(asset.scheduledAt);
        setScheduledDate(date.toISOString().split('T')[0]);
        setScheduledTime(date.toTimeString().slice(0, 5));
      }
    }
  }, [asset]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Asset Details - {asset?.serial || assetId}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fb-blue mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading asset details...</p>
          </div>
        ) : asset ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {/* Media Preview */}
            <div>
              <div className="aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden">
                {asset.mediaUrl ? (
                  <img
                    src={asset.mediaUrl}
                    alt={`${asset.type} preview`}
                    className="w-full h-full object-cover"
                    data-testid="asset-media-preview"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <i className={`${getTypeIcon(asset.type)} text-4xl`}></i>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Label className="text-sm font-medium">Type:</Label>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    <i className={`${getTypeIcon(asset.type)} mr-1`}></i>
                    {asset.type}
                  </span>
                </div>
                
                {asset.duration && (
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm font-medium">Duration:</Label>
                    <span className="text-sm text-gray-600">{formatDuration(asset.duration)}</span>
                  </div>
                )}
                
                {asset.fileSize && (
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm font-medium">Size:</Label>
                    <span className="text-sm text-gray-600">{formatFileSize(asset.fileSize)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Details & Actions */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="caption" className="text-sm font-medium mb-1 block">
                  Caption
                </Label>
                <Textarea
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full p-3 border border-fb-border rounded-md text-sm resize-none"
                  rows={4}
                  placeholder="Enter caption..."
                  data-testid="textarea-caption"
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Publishing Status</Label>
                <div className="space-y-2">
                  {asset.destinations.map((dest) => (
                    <div
                      key={dest.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      data-testid={`destination-status-${dest.id}`}
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-6 h-6 rounded text-white text-xs flex items-center justify-center ${getPlatformColor(dest.destination.platform)}`}
                        >
                          <i className={getPlatformIcon(dest.destination.platform)}></i>
                        </div>
                        <span className="text-sm">{dest.destination.accountHandle}</span>
                      </div>
                      <StatusBadge status={dest.status} />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Scheduling</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full p-2 border border-fb-border rounded text-sm"
                      data-testid="input-scheduled-date"
                    />
                  </div>
                  <div>
                    <Input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full p-2 border border-fb-border rounded text-sm"
                      data-testid="input-scheduled-time"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  className="flex-1 bg-fb-blue text-white hover:bg-blue-600"
                  onClick={() => publishNowMutation.mutate()}
                  disabled={publishNowMutation.isPending}
                  data-testid="button-publish-now"
                >
                  {publishNowMutation.isPending ? (
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                  ) : (
                    <i className="fas fa-rocket mr-2"></i>
                  )}
                  Publish Now
                </Button>
                
                <Button
                  className="flex-1 bg-warning text-white hover:bg-yellow-600"
                  onClick={() => scheduleMutation.mutate()}
                  disabled={scheduleMutation.isPending || !scheduledDate || !scheduledTime}
                  data-testid="button-schedule"
                >
                  {scheduleMutation.isPending ? (
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                  ) : (
                    <i className="fas fa-clock mr-2"></i>
                  )}
                  Schedule
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            Asset not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
