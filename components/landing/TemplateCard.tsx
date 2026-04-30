"use client";

import Link from "next/link";
import { event as pixelEvent } from "@/lib/fpixel";

interface TemplateCardProps {
  href: string;
  tag: string;
  emoji: string;
  title: string;
  description: string;
  price: string;
  contentName: string;
}

export default function TemplateCard({
  href,
  tag,
  emoji,
  title,
  description,
  price,
  contentName,
}: TemplateCardProps) {
  function handleClick() {
    pixelEvent("ViewContent", {
      content_name: contentName,
      content_category: "travel_template",
    });
  }

  return (
    <Link href={href} className="template-card" onClick={handleClick}>
      <span className="template-tag">{tag}</span>
      <div className="template-emoji">{emoji}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="template-price">{price}</div>
      <span className="template-cta">Planear →</span>
    </Link>
  );
}
