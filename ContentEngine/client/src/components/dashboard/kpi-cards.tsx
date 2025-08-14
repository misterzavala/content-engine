import { useQuery } from "@tanstack/react-query";

export default function KpiCards() {
  const { data: stats, isLoading } = useQuery<{
    totalAssets: number;
    inQueue: number;
    published: number;
    processing: number;
    failed: number;
    successRate: number;
  }>({
    queryKey: ['/api/dashboard/stats'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-fb-gray p-3 rounded-lg animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded mb-1"></div>
            <div className="h-3 bg-gray-300 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center text-gray-500 py-8">
        Unable to load dashboard statistics
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      <div className="bg-fb-gray p-2 sm:p-3 rounded-lg" data-testid="kpi-total-assets">
        <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalAssets}</div>
        <div className="text-xs text-gray-500">Total Assets</div>
        <div className="text-xs text-success mt-1">Active pipeline</div>
      </div>
      
      <div className="bg-fb-gray p-2 sm:p-3 rounded-lg" data-testid="kpi-in-queue">
        <div className="text-xl sm:text-2xl font-bold text-fb-blue">{stats.inQueue}</div>
        <div className="text-xs text-gray-500">In Queue</div>
        <div className="text-xs text-gray-500 mt-1">Scheduled</div>
      </div>
      
      <div className="bg-fb-gray p-2 sm:p-3 rounded-lg" data-testid="kpi-published">
        <div className="text-xl sm:text-2xl font-bold text-success">{stats.published}</div>
        <div className="text-xs text-gray-500">Published</div>
        <div className="text-xs text-success mt-1">Completed</div>
      </div>
      
      <div className="bg-fb-gray p-2 sm:p-3 rounded-lg" data-testid="kpi-processing">
        <div className="text-xl sm:text-2xl font-bold text-warning">{stats.processing}</div>
        <div className="text-xs text-gray-500">Processing</div>
        <div className="text-xs text-gray-500 mt-1">In progress</div>
      </div>
      
      <div className="bg-fb-gray p-2 sm:p-3 rounded-lg" data-testid="kpi-failed">
        <div className="text-xl sm:text-2xl font-bold text-danger">{stats.failed}</div>
        <div className="text-xs text-gray-500">Failed</div>
        <div className="text-xs text-danger mt-1">Needs attention</div>
      </div>
      
      <div className="bg-fb-gray p-2 sm:p-3 rounded-lg" data-testid="kpi-success-rate">
        <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.successRate}%</div>
        <div className="text-xs text-gray-500">Success Rate</div>
        <div className="text-xs text-success mt-1">Pipeline health</div>
      </div>
    </div>
  );
}
