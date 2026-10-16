import { createFileRoute } from "@tanstack/react-router";
import { TitleScreenshotScreen } from "@screens/title-screenshot";

// legacy pc/_Admin_/goods/title_screenshot_register.php?title_id= → /goods/title_screenshot_register
type Search = { title_id: number };

const TitleScreenshotRoute = () => {
  const { title_id } = Route.useSearch();
  return <TitleScreenshotScreen titleId={title_id} />;
};

export const Route = createFileRoute("/goods/title_screenshot_register")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    title_id: Number(search.title_id) || 0,
  }),
  component: TitleScreenshotRoute,
});
