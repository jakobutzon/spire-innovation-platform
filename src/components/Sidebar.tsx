"use client";

import { cn } from "@/lib/utils";
import { kanStyre, useStore } from "@/lib/store";
import {
  BarChart3,
  Lightbulb,
  LayoutDashboard,
  MessageSquareHeart,
  Settings,
  Trophy,
  User,
  Users,
  Sprout,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Sidens primære indgang — får en stærkere ikon-farve + svag animation, så den skiller sig ud. */
  fremhaevet?: boolean;
}

// Kun for ledere — de træffer beslutninger frem for at dele meninger.
const LEDER_NAV: NavItem[] = [
  { href: "/overblik", label: "Overblik", icon: LayoutDashboard, fremhaevet: true },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/indstillinger", label: "Indstillinger", icon: Settings },
];

// For alle — her deler man og bidrager.
const FAELLES_NAV: NavItem[] = [
  { href: "/", label: "Del din mening", icon: MessageSquareHeart, fremhaevet: true },
  { href: "/ideer", label: "Idéer", icon: Lightbulb },
  { href: "/teams", label: "Projekter", icon: Users },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/min-profil", label: "Min profil", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const { rolle } = useStore();
  const erLeder = kanStyre(rolle);

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
      <div className="flex items-center gap-2.5 px-6 py-5">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-600 text-white shadow-sm">
          <Sprout size={20} />
        </span>
        <div className="leading-tight">
          <p className="text-base font-semibold tracking-tight">Spire</p>
          <p className="text-[11px] text-muted">Innovationsplatform</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {erLeder && (
          <>
            {LEDER_NAV.map((item) => (
              <NavLink key={item.href} item={item} pathname={pathname} />
            ))}
            <div className="my-2 border-t border-slate-100" />
          </>
        )}
        {FAELLES_NAV.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}
      </nav>

      <div className="m-3 rounded-2xl bg-gradient-to-br from-brand-600 to-accent-600 p-4 text-white">
        <p className="text-sm font-semibold">Fra idé til effekt</p>
        <p className="mt-1 text-xs text-white/80">
          Spire samler hele innovationsrejsen ét sted — struktureret, skalerbar og målbar.
        </p>
      </div>
    </aside>
  );
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const aktiv =
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        aktiv ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50",
      )}
    >
      <Icon
        size={18}
        className={cn(
          aktiv
            ? "text-brand-600"
            : item.fremhaevet
              ? "animate-pulse text-accent-500 [animation-duration:2.4s] motion-reduce:animate-none"
              : "text-slate-400",
        )}
      />
      {item.label}
    </Link>
  );
}
