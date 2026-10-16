import { createFileRoute, redirect } from "@tanstack/react-router";
import { PointNexusCatalogueMapScreen } from "@screens/pointnexus-catalogue-map";
import { normalizePnMode, type PnMode } from "@entities/pointnexus";

// legacy pc/_Admin_/goods/pointnexus/pointnexus_catalogue_map.php → /goods/pointnexus/pointnexus_catalogue_map
const str = (value: unknown) => (typeof value === "string" ? value : "");

const PointNexusCatalogueMapRoute = () => {
  const { mode, productID } = Route.useSearch();
  return <PointNexusCatalogueMapScreen mode={mode} productID={productID} />;
};

export const Route = createFileRoute("/goods/pointnexus/pointnexus_catalogue_map")({
  validateSearch: (search: Record<string, unknown>): { mode: PnMode; productID: string } => ({
    mode: normalizePnMode(search.mode),
    productID: str(search.productID),
  }),
  // legacy: productID 없으면 카탈로그 목록으로 redirect
  beforeLoad: ({ search }) => {
    if (!search.productID) {
      throw redirect({
        to: "/goods/pointnexus/pointnexus_catalogue",
        search: {
          mode: "prod",
          keyword: "",
          publisher: "",
          platform: "",
          preorder: "",
          mapping: "",
          stale: "",
          page: 1,
          limit: 50,
        },
      });
    }
  },
  component: PointNexusCatalogueMapRoute,
});
