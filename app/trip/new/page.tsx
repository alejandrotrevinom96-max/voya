import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import NewTripWizard from "./NewTripWizard";

export default async function NewTripPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen">
      <AppHeader userEmail={user?.email} />
      <main className="px-6 md:px-12 py-12 max-w-2xl mx-auto">
        <div className="card-base">
          <NewTripWizard />
        </div>
      </main>
    </div>
  );
}
