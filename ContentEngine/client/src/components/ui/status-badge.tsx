import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ready':
        return {
          label: 'Ready',
          icon: 'fas fa-check',
          className: 'bg-success text-white',
        };
      case 'queued':
        return {
          label: 'Queued',
          icon: 'fas fa-clock',
          className: 'bg-warning text-white',
        };
      case 'processing':
        return {
          label: 'Processing',
          icon: 'fas fa-cog fa-spin',
          className: 'bg-yellow-500 text-white',
        };
      case 'published':
        return {
          label: 'Published',
          icon: 'fas fa-check-circle',
          className: 'bg-success text-white',
        };
      case 'failed':
      case 'error':
        return {
          label: 'Error',
          icon: 'fas fa-exclamation',
          className: 'bg-danger text-white',
        };
      case 'draft':
        return {
          label: 'Draft',
          icon: 'fas fa-edit',
          className: 'bg-gray-500 text-white',
        };
      default:
        return {
          label: status,
          icon: 'fas fa-circle',
          className: 'bg-gray-400 text-white',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge className={cn('inline-flex items-center text-xs', config.className, className)}>
      <i className={`${config.icon} mr-1`}></i>
      {config.label}
    </Badge>
  );
}
