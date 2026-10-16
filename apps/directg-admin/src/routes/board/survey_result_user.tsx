import { createFileRoute } from "@tanstack/react-router";
import { SurveyResultUserScreen } from "@screens/survey-result-user";
import type { SurveyUserResultSearch } from "@entities/survey";

// legacy pc/_Admin_/board/survey_result_user.php → /board/survey_result_user
const str = (value: unknown) => (typeof value === "string" ? value : "");

const SurveyResultUserRoute = () => {
  const search = Route.useSearch();
  return <SurveyResultUserScreen {...search} />;
};

export const Route = createFileRoute("/board/survey_result_user")({
  validateSearch: (search: Record<string, unknown>): SurveyUserResultSearch => ({
    idx: Number(search.idx) || 0,
    page: Number(search.page) || 1,
    search_value: str(search.search_value),
  }),
  component: SurveyResultUserRoute,
});
