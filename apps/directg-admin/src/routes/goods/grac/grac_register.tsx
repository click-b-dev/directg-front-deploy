import { createFileRoute } from "@tanstack/react-router";
import { GoodsGracRegisterScreen } from "@screens/goods-grac-register";

// legacy pc/_Admin_/goods/grac/grac_register.php → /goods/grac/grac_register
type GracRegisterSearch = { rateno: string };

const str = (value: unknown) => (typeof value === "string" ? value : "");

const GracRegisterRoute = () => {
  const { rateno } = Route.useSearch();
  return <GoodsGracRegisterScreen rateno={rateno} />;
};

export const Route = createFileRoute("/goods/grac/grac_register")({
  validateSearch: (search: Record<string, unknown>): GracRegisterSearch => ({
    rateno: str(search.rateno),
  }),
  component: GracRegisterRoute,
});
