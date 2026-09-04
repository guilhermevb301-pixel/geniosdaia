import { MentorshipCard } from "@/components/dashboard/MentorshipCard";
import { NextLiveCard } from "@/components/dashboard/NextLiveCard";
import { NextStepCard } from "@/components/dashboard/NextStepCard";

export function DashboardGrid() {
  return (
    <section
      aria-label="Próximos passos"
      data-testid="dashboard-grid"
      className="grid gap-4 lg:grid-cols-12 lg:grid-rows-2"
    >
      <div
        data-testid="dashboard-learning-region"
        className="lg:col-span-8 lg:row-span-2 [&>*]:h-full"
      >
        <NextStepCard />
      </div>

      <div
        data-testid="dashboard-secondary-region"
        className="grid gap-4 lg:col-span-4 lg:row-span-2 lg:grid-rows-2"
      >
        <NextLiveCard />
        <MentorshipCard />
      </div>
    </section>
  );
}
