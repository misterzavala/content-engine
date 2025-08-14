import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BulkUploadModal({ isOpen, onClose }: BulkUploadModalProps) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  const handleUpload = async () => {
    if (!files || files.length === 0) return;

    setUploading(true);
    // TODO: Implement actual bulk upload logic
    setTimeout(() => {
      setUploading(false);
      onClose();
      setFiles(null);
    }, 2000);
  };

  const resetAndClose = () => {
    setFiles(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Upload Assets</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-6">
          <div className="text-center">
            <div className="text-gray-400 mb-4">
              <i className="fas fa-cloud-upload-alt text-6xl"></i>
            </div>
            <h3 className="text-lg font-semibold mb-2">Upload Multiple Assets</h3>
            <p className="text-gray-600 text-sm mb-4">
              Select multiple video or image files to upload to your content pipeline.
            </p>
          </div>

          <div>
            <Label htmlFor="bulk-files" className="text-sm font-medium mb-2 block">
              Select Files
            </Label>
            <Input
              id="bulk-files"
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="w-full"
              data-testid="input-bulk-files"
            />
            {files && files.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                Selected {files.length} file{files.length > 1 ? 's' : ''}
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <i className="fas fa-info-circle text-blue-500 mt-0.5"></i>
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Supported formats:</p>
                <p>• Images: JPG, PNG, GIF, WebP</p>
                <p>• Videos: MP4, MOV, AVI, WebM</p>
                <p>• Maximum file size: 100MB per file</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={resetAndClose}
              disabled={uploading}
              className="flex-1"
              data-testid="button-cancel-bulk-upload"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploading || !files || files.length === 0}
              className="flex-1 bg-fb-blue text-white hover:bg-blue-600"
              data-testid="button-start-bulk-upload"
            >
              {uploading ? (
                <i className="fas fa-spinner fa-spin mr-2"></i>
              ) : (
                <i className="fas fa-upload mr-2"></i>
              )}
              {uploading ? 'Uploading...' : 'Upload Files'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}