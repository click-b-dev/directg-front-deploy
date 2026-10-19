import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { RENEWAL_ENABLED } from "@/renewal/config/flag";
import { RenewalLayout } from "@/renewal/widgets/renewal-layout";
import "@/renewal/styles/renewal.css";

export const Route = createFileRoute("/renewal")({
  beforeLoad: () => {
    if (!RENEWAL_ENABLED) throw notFound();
  },
  component: () => (
    <RenewalLayout>
      <Outlet />
    </RenewalLayout>
  ),
});
