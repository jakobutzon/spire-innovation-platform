"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Play, Sprout } from "lucide-react";
import { Button } from "@/components/ui";
import { useAuth } from "@/components/AuthProvider";
import { cn } from "@/lib/utils";

type Fane = "login" | "opret";

export default function LoginPage() {
  const router = useRouter();
  const { erGodkendt, indlaeser, harKonfig, signIn, signUp, startGaest } =
    useAuth();

  const [fane, setFane] = useState<Fane>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visningsnavn, setVisningsnavn] = useState("");
  const [travl, setTravl] = useState(false);
  const [fejl, setFejl] = useState("");
  const [info, setInfo] = useState("");

  // Allerede logget ind / gæst → ind i appen.
  useEffect(() => {
    if (!indlaeser && erGodkendt) router.replace("/");
  }, [indlaeser, erGodkendt, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFejl("");
    setInfo("");
    if (!email.trim() || !password) return;
    setTravl(true);
    if (fane === "login") {
      const { fejl } = await signIn(email.trim(), password);
      if (fejl) setFejl(oversaetFejl(fejl));
      else router.replace("/");
    } else {
      const { fejl, bekraeftMail } = await signUp(
        email.trim(),
        password,
        visningsnavn.trim() || undefined,
      );
      if (fejl) setFejl(oversaetFejl(fejl));
      else if (bekraeftMail)
        setInfo(
          "Tjek din mail for at bekræfte kontoen, og log derefter ind.",
        );
      else router.replace("/");
    }
    setTravl(false);
  }

  function gaest() {
    startGaest();
    router.replace("/");
  }

  const felt =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-brand-600 via-brand-600 to-accent-600 p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-6 flex flex-col items-center text-center text-white">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/30">
            <Sprout size={28} />
          </span>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">Spire</h1>
          <p className="mt-1 text-sm text-white/80">
            Fra idé til effekt — dansk platform til innovationsstyring.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-xl">
          {/* Faner */}
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
            {(["login", "opret"] as Fane[]).map((f) => (
              <button
                key={f}
                onClick={() => {
                  setFane(f);
                  setFejl("");
                  setInfo("");
                }}
                className={cn(
                  "rounded-lg py-2 text-sm font-medium transition-colors",
                  fane === f
                    ? "bg-white text-brand-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700",
                )}
              >
                {f === "login" ? "Log ind" : "Opret konto"}
              </button>
            ))}
          </div>

          {!harKonfig && (
            <p className="mb-4 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
              Login er ikke konfigureret i dette miljø — brug gæste-adgangen
              nedenfor for at udforske demoen.
            </p>
          )}

          <form onSubmit={submit} className="space-y-3">
            {fane === "opret" && (
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Visningsnavn{" "}
                  <span className="font-normal text-muted">(valgfrit)</span>
                </label>
                <input
                  className={felt}
                  value={visningsnavn}
                  onChange={(e) => setVisningsnavn(e.target.value)}
                  placeholder="Dit navn"
                />
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input
                type="email"
                className={felt}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dig@firma.dk"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Adgangskode
              </label>
              <input
                type="password"
                className={felt}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mindst 6 tegn"
                autoComplete={
                  fane === "login" ? "current-password" : "new-password"
                }
              />
            </div>

            {fejl && <p className="text-sm text-rose-600">{fejl}</p>}
            {info && <p className="text-sm text-emerald-600">{info}</p>}

            <Button
              type="submit"
              className="w-full"
              disabled={travl || !harKonfig || !email.trim() || !password}
            >
              {travl ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ArrowRight size={16} />
              )}
              {fane === "login" ? "Log ind" : "Opret konto"}
            </Button>
          </form>

          {/* Gæste-adgang */}
          <div className="my-5 flex items-center gap-3 text-xs text-muted">
            <div className="h-px flex-1 bg-slate-200" />
            eller
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <Button
            variant="secondary"
            className="w-full"
            onClick={gaest}
            type="button"
          >
            <Play size={15} /> Prøv demoen som gæst
          </Button>
          <p className="mt-2 text-center text-xs text-muted">
            Ingen tilmelding — se hele platformen med det samme.
          </p>
        </div>
      </div>
    </div>
  );
}

/** Oversæt de mest almindelige Supabase-fejl til dansk. */
function oversaetFejl(besked: string): string {
  const b = besked.toLowerCase();
  if (b.includes("invalid login")) return "Forkert email eller adgangskode.";
  if (b.includes("already registered") || b.includes("already been registered"))
    return "Der findes allerede en konto med denne email.";
  if (b.includes("password should be"))
    return "Adgangskoden skal være mindst 6 tegn.";
  if (b.includes("email") && b.includes("invalid"))
    return "Ugyldig email-adresse.";
  return besked;
}
