import Explorer from "@/components/Explorer";
import { getStore } from "@/lib/db/store";

// Spot/quality data refreshes via cron at most monthly — hourly ISR is generous.
export const revalidate = 3600;

export default async function HomePage() {
  const store = await getStore();
  const spots = await store.getSpotsWithData();

  return (
    <div className="h-full w-full">
      <Explorer spots={spots} />
    </div>
  );
}
