import { ReactNode } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { cn } from "@/lib/utils";

interface AuthShellProps {
  eyebrow: string;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  className,
}: AuthShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#090b0d] text-foreground">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(52,211,153,0.12),transparent_30%),radial-gradient(circle_at_86%_78%,rgba(90,129,255,0.12),transparent_28%)]"
      />

      <section className="relative grid min-h-screen lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.72fr)]">
        <aside className="relative hidden overflow-hidden border-r border-white/10 bg-[#0c0f12] lg:block">
          <img
            src="/brand/gui-login.webp"
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-[50%_38%]"
            {...({ fetchpriority: "high" } as Record<string, string>)}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,7,8,0.18),rgba(5,7,8,0.72)),linear-gradient(0deg,rgba(5,7,8,0.86),rgba(5,7,8,0.04)_48%,rgba(5,7,8,0.42))]" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-[linear-gradient(0deg,rgba(52,211,153,0.16),transparent)]" />
          <BrandLogo className="absolute left-10 top-10" size="md" />

        </aside>

        <div className="relative flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 lg:px-12">
          <BrandLogo className="absolute left-5 top-5 lg:hidden" size="sm" />

          <div
            className={cn(
              "w-full max-w-[420px] rounded-lg border border-white/10 bg-[#101214]/88 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.34)] backdrop-blur sm:p-8 lg:bg-[#101214]/72",
              className,
            )}
          >
            <div>
              <p className="micro-label text-primary">{eyebrow}</p>
              <h1 className="mt-4 text-[2.15rem] font-semibold leading-[0.98] tracking-[-0.04em] text-foreground sm:text-[2.55rem]">
                {title ?? "RealFrame IA"}
              </h1>
              {description && (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              )}
            </div>

            {children}
          </div>
        </div>
      </section>
    </main>
  );
}
