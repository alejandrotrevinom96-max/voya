"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`landing-nav ${scrolled ? "scrolled" : ""}`}>
      <Link href="/" className="nav-logo">
        Voya<span>.</span>
      </Link>
      <div className="nav-links">
        <a href="#como-funciona" className="nav-link">
          Cómo funciona
        </a>
        <a href="#destinos" className="nav-link">
          Destinos
        </a>
        <Link href="/auth/login" className="nav-link">
          Iniciar sesión
        </Link>
        <Link href="/auth/signup" className="btn-nav">
          Empezar gratis →
        </Link>
      </div>
    </nav>
  );
}
