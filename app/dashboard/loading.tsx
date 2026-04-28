import AppHeader from "@/components/AppHeader";
import { DashboardSkeleton } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="px-6 md:px-12 lg:px-20 py-12 max-w-7xl mx-auto">
        <div className="mb-10">
          <div className="h-12 w-64 rounded bg-cream-warm animate-pulse mb-3" />
          <div className="h-5 w-48 rounded bg-cream-warm animate-pulse" />
        </div>
        <DashboardSkeleton />
      </main>
    </div>
  );
}
