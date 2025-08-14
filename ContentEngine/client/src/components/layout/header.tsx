import { Search, Bell, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/contexts/sidebar-context";

interface HeaderProps {
  onCreateAsset?: () => void;
  onBulkUpload?: () => void;
}

export default function Header({ onCreateAsset, onBulkUpload }: HeaderProps) {
  const { toggle, isMobile } = useSidebar();
  
  return (
    <nav className="bg-white border-b border-fb-border fixed top-0 left-0 right-0 z-50 h-14">
      <div className="flex items-center justify-between px-4 h-full">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggle}
              className="p-2"
              data-testid="button-menu-toggle"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <div className="w-8 h-8 bg-fb-blue rounded flex items-center justify-center">
              <i className="fas fa-rocket text-white text-sm"></i>
            </div>
            <span className="font-semibold text-lg">Content Pipeline</span>
          </div>
          <div className="hidden md:flex items-center space-x-1">
            <Button 
              size="sm" 
              className="bg-fb-blue text-white hover:bg-blue-600"
              onClick={onCreateAsset}
              data-testid="button-create-asset-header"
            >
              <i className="fas fa-plus mr-1"></i>Create Asset
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onBulkUpload}
              data-testid="button-bulk-upload"
            >
              <i className="fas fa-upload mr-1"></i>Bulk Upload
            </Button>
          </div>
          
          {/* Mobile Action Button */}
          <div className="md:hidden">
            <Button 
              size="sm" 
              className="bg-fb-blue text-white hover:bg-blue-600"
              onClick={onCreateAsset}
              data-testid="button-create-asset-mobile"
            >
              <i className="fas fa-plus"></i>
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative hidden sm:block">
            <Input
              type="text"
              placeholder="Search assets..."
              className="w-32 sm:w-64 px-3 py-1 text-sm border border-fb-border focus:border-fb-blue"
              data-testid="input-search"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="sm:hidden"
            data-testid="button-search-mobile"
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="relative"
            data-testid="button-notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-danger rounded-full text-xs"></span>
          </Button>
          <div className="w-8 h-8 bg-gray-300 rounded-full" data-testid="avatar-user"></div>
        </div>
      </div>
    </nav>
  );
}
