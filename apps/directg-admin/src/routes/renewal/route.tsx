import { createFileRoute, notFound, Outlet, useLocation } from "@tanstack/react-router";
import { RENEWAL_ENABLED } from "@/renewal/config/flag";
import { RenewalLayout } from "@/renewal/widgets/renewal-layout";
import "@/renewal/styles/renewal.css";

const RenewalRoot = () => {
  const { pathname } = useLocation();
  // 로그인 화면은 SNB/GNB 없이 독립 화면으로 그린다.
  if (pathname.startsWith("/renewal/login")) {
    return (
      <div className="rn-root">
        <Outlet />
      </div>
    );
  }
  return (
    <RenewalLayout>
      <Outlet />
    </RenewalLayout>
  );
};

export const Route = createFileRoute("/renewal")({
  beforeLoad: () => {
    if (!RENEWAL_ENABLED) throw notFound();
  },
  component: RenewalRoot,
});
