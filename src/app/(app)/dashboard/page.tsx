"use client";

import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CheckCircle2,
  Clock,
  Lightbulb,
  Lock,
  Rocket,
  Users,
} from "lucide-react";
import { Button, Card, CardBody, EmptyState, SectionHeader, StatTile } from "@/components/ui";
import { ProjektStatusPill, UdfaldBadge } from "@/components/shared";
import { kanStyre, useStore } from "@/lib/store";
import { getUser } from "@/lib/data/users";
import {
  deltagelsePrMaaned,
  ideerPrMaaned,
  samletNoegletal,
  tragt,
} from "@/lib/data/portfolio";
import { tal } from "@/lib/utils";

const BRAND = "#6366f1";
const ACCENT = "#a855f7";

export default function DashboardPage() {
  const { rolle, ideas, projects, stadier } = useStore();

  if (!kanStyre(rolle)) {
    return (
      <div className="animate-fade-in">
        <SectionHeader titel="Innovationsdashboard" />
        <EmptyState
          icon={<Lock size={40} />}
          titel="Dette dashboard er for ledere"
          tekst="Overblikket over innovationens udvikling er forbeholdt ledere og administratorer. Skift til rollen Leder i toppen for at se det — eller gå tilbage og bidrag med en idé."
        />
        <div className="mt-5 flex justify-center">
          <Link href="/ideer">
            <Button variant="secondary">
              <Lightbulb size={16} /> Se idéerne
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const godkendte = ideas.filter(
    (i) => i.status === "godkendt" || i.status === "i-projekt",
  ).length;

  const stadieData = stadier.map((s) => ({
    navn: s.navn,
    antal: projects.filter((p) => p.status === s.id).length,
  }));

  // Aktivitet pr. afdeling (hvor kommer idéerne fra)
  const perAfdeling = new Map<string, number>();
  for (const idea of ideas) {
    const afd = getUser(idea.forfatterId)?.afdeling ?? "Ukendt";
    perAfdeling.set(afd, (perAfdeling.get(afd) ?? 0) + 1);
  }
  const afdelingData = [...perAfdeling.entries()]
    .map(([navn, antal]) => ({ navn, antal }))
    .sort((a, b) => b.antal - a.antal);

  return (
    <div className="animate-fade-in">
      <SectionHeader
        titel="Innovationsdashboard"
        beskrivelse="Ledelsens overblik over, hvordan innovationskulturen udvikler sig — idéer, engagement og eksekvering. Ingen regneark, kun momentum."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Idéer i alt"
          value={tal(ideas.length)}
          hint="Indsendt på platformen"
          icon={<Lightbulb size={18} />}
          tone="brand"
        />
        <StatTile
          label="Godkendte idéer"
          value={godkendte}
          hint="Klar til eller i eksekvering"
          icon={<CheckCircle2 size={18} />}
          tone="green"
        />
        <StatTile
          label="Aktive projekter"
          value={projects.length}
          hint={`${samletNoegletal.implementerede} implementeret i alt`}
          icon={<Rocket size={18} />}
          tone="violet"
        />
        <StatTile
          label="Deltagelsesgrad"
          value={`${Math.round(samletNoegletal.deltagelsesgrad * 100)}%`}
          hint={`${tal(samletNoegletal.aktiveDeltagere)} aktive deltagere`}
          icon={<Users size={18} />}
          tone="amber"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardBody>
            <h2 className="mb-1 font-semibold">Idéstrøm pr. måned</h2>
            <p className="mb-4 text-sm text-muted">Indsendte vs. godkendte idéer</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ideerPrMaaned} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef0f5" />
                  <XAxis dataKey="maaned" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip cursor={{ fill: "#f6f7fb" }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="indsendt" name="Indsendt" fill={BRAND} radius={[6, 6, 0, 0]} />
                  <Bar dataKey="godkendt" name="Godkendt" fill={ACCENT} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h2 className="mb-1 font-semibold">Medarbejderengagement</h2>
            <p className="mb-4 text-sm text-muted">Aktive deltagere over tid</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={deltagelsePrMaaned}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef0f5" />
                  <XAxis dataKey="maaned" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip cursor={{ stroke: "#e2e4ec" }} />
                  <Line
                    type="monotone"
                    dataKey="aktive"
                    name="Aktive deltagere"
                    stroke={BRAND}
                    strokeWidth={3}
                    dot={{ r: 3, fill: BRAND }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardBody>
            <h2 className="mb-4 font-semibold">Innovationstragten</h2>
            <div className="space-y-3">
              {tragt.map((t, i) => {
                const pct = Math.round((t.antal / tragt[0].antal) * 100);
                return (
                  <div key={t.trin}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-slate-600">{t.trin}</span>
                      <span className="font-medium">
                        {t.antal} <span className="text-muted">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-3 rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: `linear-gradient(90deg, ${BRAND}, ${ACCENT})`,
                          opacity: 1 - i * 0.12,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 flex items-center gap-1.5 text-xs text-muted">
              <Clock size={13} /> Gennemsnitlig tid fra idé til projekt:{" "}
              <span className="font-medium text-slate-600">
                {samletNoegletal.gnsTidIdeTilProjektUger} uger
              </span>
            </p>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardBody>
            <h2 className="mb-4 font-semibold">Projekter pr. stadie</h2>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stadieData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eef0f5" />
                  <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="navn"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    width={110}
                  />
                  <Tooltip cursor={{ fill: "#f6f7fb" }} />
                  <Bar dataKey="antal" name="Projekter" radius={[0, 6, 6, 0]}>
                    {stadieData.map((_, i) => (
                      <Cell key={i} fill={i % 2 === 0 ? BRAND : ACCENT} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6">
        <CardBody>
          <h2 className="mb-1 font-semibold">Hvor kommer idéerne fra?</h2>
          <p className="mb-4 text-sm text-muted">
            Idéer pr. afdeling — brug det til at se, hvor innovationskulturen
            spirer, og hvor der er brug for et skub.
          </p>
          <div className="space-y-2.5">
            {afdelingData.map((a) => {
              const pct = Math.round((a.antal / afdelingData[0].antal) * 100);
              return (
                <div key={a.navn} className="flex items-center gap-3">
                  <span className="w-40 shrink-0 truncate text-sm text-slate-600">
                    {a.navn}
                  </span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-2.5 rounded-full bg-brand-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm font-medium">
                    {a.antal}
                  </span>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      <Card className="mt-6">
        <CardBody>
          <h2 className="mb-4 font-semibold">Igangværende projekter</h2>
          <div className="space-y-3">
            {projects.map((p) => {
              const lead = getUser(p.leadId);
              const forslag = p.ideId
                ? getUser(ideas.find((i) => i.id === p.ideId)?.forfatterId ?? "")
                : undefined;
              const erPaaMaalLinjen = stadier[stadier.length - 1]?.id === p.status;
              return (
                <Link key={p.id} href={`/teams/${p.id}`}>
                  <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-100 p-3.5 hover:bg-slate-50">
                    <div className="min-w-[180px] flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{p.navn}</p>
                        <ProjektStatusPill status={p.status} />
                        {erPaaMaalLinjen && <UdfaldBadge udfald={p.udfald} />}
                      </div>
                      <p className="text-xs text-muted">
                        Lead: {lead?.navn}
                        {forslag && (
                          <>
                            {" · "}Idé af{" "}
                            <span className="font-medium text-brand-700">
                              {forslag.navn}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
