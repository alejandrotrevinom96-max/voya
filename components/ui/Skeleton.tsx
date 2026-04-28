export default function TripCardSkeleton() {
  return (
    <div className="card-base animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="w-14 h-14 rounded-2xl bg-cream-warm" />
        <div className="h-6 w-20 rounded-full bg-cream-warm" />
      </div>
      <div className="h-7 w-3/4 rounded bg-cream-warm mb-2" />
      <div className="h-4 w-1/2 rounded bg-cream-warm mb-4" />
      <div className="border-t border-border pt-4">
        <div className="h-4 w-1/3 rounded bg-cream-warm" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <TripCardSkeleton key={i} />
      ))}
    </div>
  );
}
