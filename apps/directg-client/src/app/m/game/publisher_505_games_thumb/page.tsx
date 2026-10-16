import { makeMobilePublisherPage } from "@screens/mobile-game-publisher";

// legacy mobile publisher_505_games_thumb.html — publisher_code 46.
const page = makeMobilePublisherPage({
  publisherCode: "46",
  basePath: "/game/publisher_505_games",
  viewType: "thumb",
});

export const viewport = page.viewport;
export const generateMetadata = page.generateMetadata;
export default page.Page;
