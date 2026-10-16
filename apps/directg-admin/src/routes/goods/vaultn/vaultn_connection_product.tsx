import { createFileRoute } from "@tanstack/react-router";
import { VaultnConnectionProductScreen } from "@screens/vaultn-connection-product";

// legacy pc/_Admin_/goods/vaultn/vaultn_connection_product.php → /goods/vaultn/vaultn_connection_product
const str = (value: unknown) => (typeof value === "string" ? value : "");
const normPage = (v: unknown) => {
  const n = Number(v);
  return !n || n < 1 ? 1 : n;
};

const VaultnConnectionProductRoute = () => {
  const { connectionGuid, page } = Route.useSearch();
  return <VaultnConnectionProductScreen connectionGuid={connectionGuid} page={page} />;
};

export const Route = createFileRoute("/goods/vaultn/vaultn_connection_product")({
  validateSearch: (search: Record<string, unknown>): { connectionGuid: string; page: number } => ({
    connectionGuid: str(search.connectionGuid),
    page: normPage(search.page),
  }),
  component: VaultnConnectionProductRoute,
});
