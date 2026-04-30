"use client";

import Link from "next/link";
import { event as pixelEvent } from "@/lib/fpixel";

interface HeroCTAProps {
  href: string;
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export default function HeroCTA({ href, className, children, style }: HeroCTAProps) {
  function handleClick() {
    pixelEvent("Lead", { content_name: "hero_cta" });
  }

  return (
    <Link href={href} className={className} style={style} onClick={handleClick}>
      {children}
    </Link>
  );
}
