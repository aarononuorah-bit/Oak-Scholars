/**
 * DashboardSkeleton — reusable loading skeleton for all role dashboards.
 * Shows a header, stat cards row, and a content card.
 */
export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#F9F7F2] animate-pulse">
      {/* Fake navbar */}
      <div className="h-16 bg-[#281A39]" />

      <div className="container py-24 space-y-8">
        {/* Page title */}
        <div className="h-8 w-64 bg-gray-200 rounded-lg" />

        {/* Tab bar */}
        <div className="flex gap-2">
          {[120, 100, 110, 90].map((w, i) => (
            <div key={i} className="h-9 rounded-xl bg-gray-200" style={{ width: w }} />
          ))}
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-5 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main content card */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <div className="h-5 bg-gray-200 rounded w-40" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-200" />
                <div className="space-y-1.5">
                  <div className="h-3.5 bg-gray-200 rounded w-36" />
                  <div className="h-3 bg-gray-100 rounded w-24" />
                </div>
              </div>
              <div className="h-6 w-16 bg-gray-200 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
