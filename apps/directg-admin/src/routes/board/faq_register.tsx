import { createFileRoute } from "@tanstack/react-router";
import { FaqRegisterScreen, type FaqRegisterSearch } from "@screens/faq-register";

// legacy pc/_Admin_/board/faq_register.php → /board/faq_register
const str = (value: unknown) => (typeof value === "string" ? value : "");

const FaqRegisterRoute = () => {
  const search = Route.useSearch();
  return <FaqRegisterScreen {...search} />;
};

export const Route = createFileRoute("/board/faq_register")({
  validateSearch: (search: Record<string, unknown>): FaqRegisterSearch => ({
    mode: str(search.mode),
    idx: Number(search.idx) || 0,
  }),
  component: FaqRegisterRoute,
});
