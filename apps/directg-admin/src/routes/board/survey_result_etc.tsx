import { createFileRoute } from "@tanstack/react-router";
import { SurveyResultEtcScreen, type SurveyResultEtcSearch } from "@screens/survey-result-etc";

// legacy pc/_Admin_/board/survey_result_etc.php → /board/survey_result_etc
const SurveyResultEtcRoute = () => {
  const search = Route.useSearch();
  return <SurveyResultEtcScreen {...search} />;
};

export const Route = createFileRoute("/board/survey_result_etc")({
  validateSearch: (search: Record<string, unknown>): SurveyResultEtcSearch => ({
    idx: Number(search.idx) || 0,
    page: Number(search.page) || 1,
  }),
  component: SurveyResultEtcRoute,
});
