import { createFileRoute } from "@tanstack/react-router";
import { PointNexusBookConfirmScreen } from "@screens/pointnexus-book-confirm";
import type { PnBookConfirmSearch } from "@entities/pointnexus";

// legacy pc/_Admin_/goods/pointnexus/pointnexus_book_confirm.php → /goods/pointnexus/pointnexus_book_confirm
const str = (value: unknown) => (typeof value === "string" ? value : "");
const normPage = (v: unknown) => {
  const n = Number(v);
  return !n || n < 1 ? 1 : n;
};
// mode: '' | 'test' | 'prod' (전체 허용)
const normMode = (v: unknown) => (v === "test" || v === "prod" ? v : "");

const PointNexusBookConfirmRoute = () => {
  const search = Route.useSearch();
  return <PointNexusBookConfirmScreen {...search} />;
};

export const Route = createFileRoute("/goods/pointnexus/pointnexus_book_confirm")({
  validateSearch: (search: Record<string, unknown>): PnBookConfirmSearch => ({
    mode: normMode(search.mode),
    ordno: str(search.ordno),
    m_id: str(search.m_id),
    page: normPage(search.page),
  }),
  component: PointNexusBookConfirmRoute,
});
