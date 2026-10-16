import { createFileRoute } from "@tanstack/react-router";
import { TitleRegisterScreen } from "@screens/title-register";

// legacy pc/_Admin_/goods/title_register.php (?product_code=) → /goods/title_register
type TitleRegisterSearch = { product_code: string };

const TitleRegisterRoute = () => {
  const { product_code } = Route.useSearch();
  return <TitleRegisterScreen productCode={product_code} />;
};

export const Route = createFileRoute("/goods/title_register")({
  validateSearch: (search: Record<string, unknown>): TitleRegisterSearch => ({
    product_code: typeof search.product_code === "string" ? search.product_code : "",
  }),
  component: TitleRegisterRoute,
});
