import { createFileRoute } from "@tanstack/react-router";
import { SurveyResultScreen, type SurveyResultSearch } from "@screens/survey-result";

// legacy pc/_Admin_/board/survey_result.php → /board/survey_result
const SurveyResultRoute = () => {
  const search = Route.useSearch();
  return <SurveyResultScreen {...search} />;
};

export const Route = createFileRoute("/board/survey_result")({
  validateSearch: (search: Record<string, unknown>): SurveyResultSearch => ({
    idx: Number(search.idx) || 0,
  }),
  component: SurveyResultRoute,
});
