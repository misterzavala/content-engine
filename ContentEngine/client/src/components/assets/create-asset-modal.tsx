import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface CreateAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateAssetModal({ isOpen, onClose }: CreateAssetModalProps) {
  const [type, setType] = useState<string>("");
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const { toast } = useToast();

  const createAssetMutation = useMutation({
    mutationFn: async () => {
      if (!type || !title) {
        throw new Error("Type and title are required");
      }

      return apiRequest('POST', '/api/assets', {
        type,
        title,
        caption,
        mediaUrl: mediaUrl || undefined,
        thumbnailUrl: thumbnailUrl || undefined,
        status: 'draft',
      });
    },
    onSuccess: () => {
      toast({
        title: "Asset Created",
        description: "New asset has been added to the pipeline.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      resetForm();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create asset.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setType("");
    setTitle("");
    setCaption("");
    setMediaUrl("");
    setThumbnailUrl("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Asset</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type" className="text-sm font-medium mb-2 block">
                Asset Type *
              </Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger data-testid="select-asset-type">
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reel">Reel</SelectItem>
                  <SelectItem value="carousel">Carousel</SelectItem>
                  <SelectItem value="post">Post</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title" className="text-sm font-medium mb-2 block">
                Title *
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter asset title..."
                data-testid="input-asset-title"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="caption" className="text-sm font-medium mb-2 block">
              Caption
            </Label>
            <Textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Enter caption text..."
              rows={3}
              data-testid="textarea-asset-caption"
            />
          </div>

          <div>
            <Label htmlFor="mediaUrl" className="text-sm font-medium mb-2 block">
              Media URL
            </Label>
            <Input
              id="mediaUrl"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://example.com/media.mp4"
              data-testid="input-media-url"
            />
          </div>

          <div>
            <Label htmlFor="thumbnailUrl" className="text-sm font-medium mb-2 block">
              Thumbnail URL
            </Label>
            <Input
              id="thumbnailUrl"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://example.com/thumbnail.jpg"
              data-testid="input-thumbnail-url"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={createAssetMutation.isPending}
              className="flex-1"
              data-testid="button-cancel-create"
            >
              Cancel
            </Button>
            <Button
              onClick={() => createAssetMutation.mutate()}
              disabled={createAssetMutation.isPending || !type || !title}
              className="flex-1 bg-fb-blue text-white hover:bg-blue-600"
              data-testid="button-create-asset"
            >
              {createAssetMutation.isPending ? (
                <i className="fas fa-spinner fa-spin mr-2"></i>
              ) : (
                <i className="fas fa-plus mr-2"></i>
              )}
              Create Asset
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}