import { createFileRoute } from "@tanstack/react-router";
import { SurveyListScreen } from "@screens/survey-list";
import type { SurveyListSearch } from "@entities/survey";

// legacy pc/_Admin_/board/survey_list.php → /board/survey_list
const str = (value: unknown) => (typeof value === "string" ? value : "");

const SurveyListRoute = () => {
  const search = Route.useSearch();
  return <SurveyListScreen {...search} />;
};

export const Route = createFileRoute("/board/survey_list")({
  validateSearch: (search: Record<string, unknown>): SurveyListSearch => ({
    page: Number(search.page) || 1,
    search_type: str(search.search_type),
    search_value: str(search.search_value),
  }),
  component: SurveyListRoute,
});
