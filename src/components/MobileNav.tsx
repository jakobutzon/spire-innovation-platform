"use client";

import { cn } from "@/lib/utils";
import { kanStyre, useStore } from "@/lib/store";
import {
  BarChart3,
  LayoutDashboard,
  Lightbulb,
  MessageSquareHeart,
  Settings,
  Trophy,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/overblik", label: "Overblik", icon: LayoutDashboard, kunLeder: true },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3, kunLeder: true },
  { href: "/indstillinger", label: "Indstil.", icon: Settings, kunLeder: true },
  { href: "/", label: "Del mening", icon: MessageSquareHeart },
  { href: "/ideer", label: "Idéer", icon: Lightbulb },
  { href: "/teams", label: "Projekter", icon: Users },
  { href: "/leaderboard", label: "Rangliste", icon: Trophy },
  { href: "/min-profil", label: "Profil", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();
  const { rolle } = useStore();
  const items = ITEMS.filter((item) => !item.kunLeder || kanStyre(rolle));
  return (
    <nav className="sticky bottom-0 z-30 flex justify-between border-t border-slate-200 bg-white/95 px-1 py-1 backdrop-blur lg:hidden">
      {items.map((item) => {
        const aktiv =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[10px] font-medium",
              aktiv ? "text-brand-700" : "text-slate-500",
            )}
          >
            <Icon size={20} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
