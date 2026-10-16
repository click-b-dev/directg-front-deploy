import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { RENEWAL_ENABLED } from "@/renewal/config/flag";

export const Route = createFileRoute("/renewal")({
  beforeLoad: () => {
    if (!RENEWAL_ENABLED) throw notFound();
  },
  component: Outlet,
});
