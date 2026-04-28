import AppHeader from "@/components/AppHeader";
import Spinner from "@/components/ui/Spinner";

export default function TripLoading() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="px-6 md:px-12 py-12 max-w-6xl mx-auto">
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" className="text-terracotta mb-4" />
          <p className="text-brown-soft text-sm">Cargando tu viaje...</p>
        </div>
      </main>
    </div>
  );
}
