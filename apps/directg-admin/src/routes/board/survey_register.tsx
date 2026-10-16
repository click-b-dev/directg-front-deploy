import { createFileRoute } from "@tanstack/react-router";
import { SurveyRegisterScreen, type SurveyRegisterSearch } from "@screens/survey-register";

// legacy pc/_Admin_/board/survey_register.php → /board/survey_register
const str = (value: unknown) => (typeof value === "string" ? value : "");

const SurveyRegisterRoute = () => {
  const search = Route.useSearch();
  return <SurveyRegisterScreen {...search} />;
};

export const Route = createFileRoute("/board/survey_register")({
  validateSearch: (search: Record<string, unknown>): SurveyRegisterSearch => ({
    mode: str(search.mode),
    idx: Number(search.idx) || 0,
    search_type: str(search.search_type),
    search_value: str(search.search_value),
    page: Number(search.page) || 1,
  }),
  component: SurveyRegisterRoute,
});
