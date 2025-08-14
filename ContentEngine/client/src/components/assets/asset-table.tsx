import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import type { AssetWithDestinations } from "@shared/schema";

interface AssetTableProps {
  onAssetSelect: (assetId: string) => void;
}

export default function AssetTable({ onAssetSelect }: AssetTableProps) {
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const limit = 25;

  const { data: assets, isLoading, error } = useQuery<AssetWithDestinations[]>({
    queryKey: ['/api/assets', limit, page * limit],
    queryFn: async () => {
      const response = await fetch(`/api/assets?limit=${limit}&offset=${page * limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch assets');
      }
      return response.json();
    },
  });

  const toggleAssetSelection = (assetId: string) => {
    const newSelection = new Set(selectedAssets);
    if (newSelection.has(assetId)) {
      newSelection.delete(assetId);
    } else {
      newSelection.add(assetId);
    }
    setSelectedAssets(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedAssets.size === assets?.length) {
      setSelectedAssets(new Set());
    } else {
      setSelectedAssets(new Set(assets?.map(asset => asset.id) || []));
    }
  };

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

  if (isLoading) {
    return (
      <div className="bg-white">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fb-blue mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading assets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-8 text-center">
        <div className="text-danger mb-4">
          <i className="fas fa-exclamation-triangle text-2xl"></i>
        </div>
        <p className="text-gray-600">Failed to load assets. Please try again.</p>
      </div>
    );
  }

  if (!assets || assets.length === 0) {
    return (
      <div className="bg-white p-8 text-center">
        <div className="text-gray-400 mb-4">
          <i className="fas fa-folder-open text-4xl"></i>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No assets found</h3>
        <p className="text-gray-600 mb-4">Get started by creating your first content asset.</p>
        <Button className="bg-fb-blue text-white hover:bg-blue-600">
          <i className="fas fa-plus mr-2"></i>Create Asset
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Table Controls */}
      <div className="px-4 py-3 border-b border-fb-border flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="text-xs bg-gray-100">
            <i className="fas fa-filter mr-1"></i>All Status
          </Button>
          <Button variant="ghost" size="sm" className="text-xs">
            Type: All
          </Button>
          <Button variant="ghost" size="sm" className="text-xs">
            Platform: All
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">
            Showing {page * limit + 1}-{Math.min((page + 1) * limit, assets.length)} of {assets.length}
          </span>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              data-testid="button-prev-page"
            >
              <i className="fas fa-chevron-left"></i>
            </Button>
            <Button
              variant="outline" 
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={assets.length < limit}
              data-testid="button-next-page"
            >
              <i className="fas fa-chevron-right"></i>
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-fb-gray">
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedAssets.size === assets.length && assets.length > 0}
                  onCheckedChange={toggleSelectAll}
                  data-testid="checkbox-select-all"
                />
              </TableHead>
              <TableHead>Serial</TableHead>
              <TableHead>Preview</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Destinations</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => (
              <TableRow
                key={asset.id}
                className="border-b border-fb-border hover:bg-gray-50 cursor-pointer"
                onClick={() => onAssetSelect(asset.id)}
                data-testid={`row-asset-${asset.id}`}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedAssets.has(asset.id)}
                    onCheckedChange={() => toggleAssetSelection(asset.id)}
                    data-testid={`checkbox-asset-${asset.id}`}
                  />
                </TableCell>
                <TableCell>
                  <span className="font-mono text-fb-blue font-medium" data-testid={`serial-${asset.id}`}>
                    {asset.serial}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                    {asset.thumbnailUrl ? (
                      <img
                        src={asset.thumbnailUrl}
                        alt={`${asset.type} preview`}
                        className="w-full h-full object-cover"
                        data-testid={`thumbnail-${asset.id}`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <i className={getTypeIcon(asset.type)}></i>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    <i className={`${getTypeIcon(asset.type)} mr-1`}></i>
                    {asset.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <StatusBadge status={asset.status} />
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    {asset.destinations.map((dest) => (
                      <div
                        key={dest.id}
                        className={`w-6 h-6 rounded text-white text-xs flex items-center justify-center ${getPlatformColor(dest.destination.platform)}`}
                        title={`${dest.destination.platform}: ${dest.destination.accountHandle}`}
                        data-testid={`destination-${dest.id}`}
                      >
                        <i className={getPlatformIcon(dest.destination.platform)}></i>
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {asset.scheduledAt ? (
                    <div className="text-xs">
                      <div>{new Date(asset.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      <div className="text-gray-400">{new Date(asset.scheduledAt).toLocaleDateString()}</div>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">Not scheduled</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-gray-600 text-sm" data-testid={`owner-${asset.id}`}>
                    {asset.owner?.username || 'Unknown'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="text-gray-500 text-xs" data-testid={`updated-${asset.id}`}>
                    {asset.updatedAt ? new Date(asset.updatedAt).toLocaleString() : 'N/A'}
                  </div>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 text-gray-400 hover:text-fb-blue"
                      title="Edit"
                      data-testid={`button-edit-${asset.id}`}
                    >
                      <i className="fas fa-edit"></i>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 text-gray-400 hover:text-success"
                      title="Queue"
                      data-testid={`button-queue-${asset.id}`}
                    >
                      <i className="fas fa-clock"></i>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 text-gray-400 hover:text-danger"
                      title="Delete"
                      data-testid={`button-delete-${asset.id}`}
                    >
                      <i className="fas fa-trash"></i>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
