"use client";

import { cn, initialer } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

/* ---------------- Card ---------------- */
export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/70 bg-surface shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardBody({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("p-5", className)}>{children}</div>;
}

/* ---------------- Button ---------------- */
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const buttonStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 shadow-sm shadow-brand-600/20",
  secondary:
    "bg-white text-ink border border-slate-200 hover:bg-slate-50",
  ghost: "text-slate-600 hover:bg-slate-100",
  danger: "bg-rose-600 text-white hover:bg-rose-700",
};

export function Button({
  variant = "primary",
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        buttonStyles[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ---------------- Badge ---------------- */
type Tone =
  | "brand"
  | "slate"
  | "green"
  | "amber"
  | "rose"
  | "sky"
  | "violet";

const toneStyles: Record<Tone, string> = {
  brand: "bg-brand-50 text-brand-700",
  slate: "bg-slate-100 text-slate-600",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  rose: "bg-rose-50 text-rose-700",
  sky: "bg-sky-50 text-sky-700",
  violet: "bg-violet-50 text-violet-700",
};

export function Pill({
  tone = "slate",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneStyles[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ---------------- StatTile ---------------- */
const toneGradients: Record<Tone, string> = {
  brand: "from-brand-500 to-indigo-600",
  slate: "from-slate-400 to-slate-500",
  green: "from-emerald-500 to-teal-600",
  amber: "from-amber-500 to-orange-600",
  rose: "from-rose-500 to-pink-600",
  sky: "from-sky-500 to-blue-600",
  violet: "from-violet-500 to-fuchsia-600",
};

export function StatTile({
  label,
  value,
  hint,
  icon,
  tone = "brand",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: Tone;
}) {
  return (
    <Card>
      <CardBody className="flex items-center gap-4">
        {icon && (
          <span
            className={cn(
              "grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-sm",
              toneGradients[tone],
            )}
          >
            {icon}
          </span>
        )}
        <div className="min-w-0 flex-1 leading-tight">
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          <p className="text-sm font-medium text-slate-600">{label}</p>
          {hint && <div className="mt-0.5 text-xs text-muted">{hint}</div>}
        </div>
      </CardBody>
    </Card>
  );
}

/* ---------------- ProgressBar ---------------- */
export function ProgressBar({
  value,
  className,
  tone = "brand",
}: {
  value: number;
  className?: string;
  tone?: "brand" | "green" | "amber" | "rose";
}) {
  const fill = {
    brand: "bg-brand-500",
    green: "bg-emerald-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
  }[tone];
  return (
    <div className={cn("h-2 w-full rounded-full bg-slate-100", className)}>
      <div
        className={cn("h-2 rounded-full transition-all", fill)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

/* ---------------- Avatar ---------------- */
export function Avatar({
  navn,
  farve,
  size = "md",
  niveau,
  billedeUrl,
}: {
  navn: string;
  farve: string;
  size?: "sm" | "md" | "lg" | "xl";
  /** Vises som et lille badge på avataren — synligt for alle. */
  niveau?: number;
  /** Profilbillede; vises i stedet for initialer når sat. */
  billedeUrl?: string;
}) {
  const dim = {
    sm: "h-7 w-7 text-[11px]",
    md: "h-9 w-9 text-xs",
    lg: "h-12 w-12 text-sm",
    xl: "h-16 w-16 text-lg",
  }[size];
  const badgeDim = {
    sm: "h-3.5 min-w-3.5 text-[8px]",
    md: "h-4 min-w-4 text-[9px]",
    lg: "h-5 min-w-5 text-[10px]",
    xl: "h-6 min-w-6 text-xs",
  }[size];
  return (
    <span className="relative inline-grid shrink-0 place-items-center">
      {billedeUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={billedeUrl}
          alt={navn}
          title={navn}
          className={cn("rounded-full object-cover ring-2 ring-white", dim)}
        />
      ) : (
        <span
          className={cn(
            "grid place-items-center rounded-full font-semibold text-white ring-2 ring-white",
            farve,
            dim,
          )}
          title={navn}
        >
          {initialer(navn)}
        </span>
      )}
      {niveau != null && (
        <span
          className={cn(
            "absolute -bottom-1 -right-1 grid place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 px-1 font-bold text-white ring-2 ring-white",
            badgeDim,
          )}
          title={`Niveau ${niveau}`}
        >
          {niveau}
        </span>
      )}
    </span>
  );
}

/* ---------------- EmptyState ---------------- */
export function EmptyState({
  icon,
  titel,
  tekst,
}: {
  icon?: ReactNode;
  titel: string;
  tekst?: string;
}) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-slate-200 bg-white/50 px-6 py-14 text-center">
      {icon && <div className="mb-3 text-slate-300">{icon}</div>}
      <p className="font-medium text-slate-700">{titel}</p>
      {tekst && <p className="mt-1 max-w-sm text-sm text-muted">{tekst}</p>}
    </div>
  );
}

/* ---------------- SectionHeader ---------------- */
export function SectionHeader({
  titel,
  beskrivelse,
  action,
}: {
  titel: string;
  beskrivelse?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{titel}</h1>
        {beskrivelse && (
          <p className="mt-1 max-w-2xl text-sm text-muted">{beskrivelse}</p>
        )}
      </div>
      {action}
    </div>
  );
}
