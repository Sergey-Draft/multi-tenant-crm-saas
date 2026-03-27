"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SLIDES = [
  {
    src: "/images/landing/leads.png",
    caption: "Канбан лидов",
    alt: "Интерфейс канбана лидов Draft CRM",
  },
  {
    src: "/images/landing/table.png",
    caption: "Таблицы",
    alt: "Таблица данных в Draft CRM",
  },
] as const;

export function LandingHeroPreview() {
  const [index, setIndex] = useState(0);
  const [glowY, setGlowY] = useState(0);

  useEffect(() => {
    const onScroll = () => setGlowY(window.scrollY);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const slide = SLIDES[index];

  const go = (delta: number) => {
    setIndex((i) => (i + delta + SLIDES.length) % SLIDES.length);
  };

  return (
    <div className="mt-16 relative">
      <div
        className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/20 to-accent/20 blur-xl opacity-80 will-change-transform z-0"
        style={{ transform: `translateY(${glowY * 0.05}px)` }}
        aria-hidden
      />
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center gap-2 border-b border-border bg-secondary/50 px-4 py-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500/70" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
            <div className="h-3 w-3 rounded-full bg-green-500/70" />
          </div>
          <span className="ml-2 text-xs text-muted-foreground">
            dashboard.draft-crm.com
          </span>
          <div className="ml-auto flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="h-8 w-8"
              onClick={() => go(-1)}
              aria-label="Предыдущий слайд"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="h-8 w-8"
              onClick={() => go(1)}
              aria-label="Следующий слайд"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="relative aspect-[16/10] w-full max-h-[min(360px,55vh)] bg-muted/30">
          <Image
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            fill
            className="object-cover object-top"
            sizes="(max-width: 768px) 100vw, 1152px"
            priority
            unoptimized={slide.src.endsWith(".svg")}
          />
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border bg-card/80 px-4 py-2.5">
          <p className="text-sm text-muted-foreground">{slide.caption}</p>
          <div className="flex gap-1.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                className={cn(
                  "h-2 w-2 rounded-full transition-colors",
                  i === index
                    ? "bg-primary"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                onClick={() => setIndex(i)}
                aria-label={`Слайд ${i + 1}`}
                aria-current={i === index}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
