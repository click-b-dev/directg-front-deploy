import { makePublisherPage } from "@screens/game-publisher";

// legacy `pc/game/publisher_505_games_thumb.html` — publisher_code 46.
const page = makePublisherPage({
  publisherCode: "46",
  basePath: "/game/publisher_505_games",
  viewType: "thumb",
});

export const viewport = page.viewport;
export const generateMetadata = page.generateMetadata;
export default page.Page;
