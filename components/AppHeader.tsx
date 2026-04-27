import Link from "next/link";
import { logout } from "@/app/auth/actions";

interface AppHeaderProps {
  userEmail?: string;
}

export default function AppHeader({ userEmail }: AppHeaderProps) {
  return (
    <nav className="px-6 md:px-12 py-6 flex items-center justify-between border-b border-sand-dark">
      <Link
        href="/dashboard"
        className="font-display text-2xl font-medium tracking-tight text-brown-dark"
      >
        Voya<span className="text-terracotta">.</span>
      </Link>
      <div className="flex items-center gap-4">
        {userEmail && (
          <span className="hidden md:inline text-sm text-brown-soft">
            {userEmail}
          </span>
        )}
        <form action={logout}>
          <button type="submit" className="btn-ghost text-sm">
            Cerrar sesión
          </button>
        </form>
      </div>
    </nav>
  );
}
