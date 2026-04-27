import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import EditTripForm from "./EditTripForm";

interface EditTripPageProps {
  params: { id: string };
}

export default async function EditTripPage({ params }: EditTripPageProps) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: trip } = await supabase
    .from("trips")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user!.id)
    .single();

  if (!trip) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <AppHeader userEmail={user?.email} />
      <main className="px-6 md:px-12 py-12 max-w-2xl mx-auto">
        <div className="card-base">
          <EditTripForm trip={trip} />
        </div>
      </main>
    </div>
  );
}
