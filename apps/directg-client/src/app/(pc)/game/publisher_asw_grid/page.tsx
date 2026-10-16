import { makePublisherPage } from "@screens/game-publisher";

// legacy `pc/game/publisher_asw_grid.html` — publisher_code 47.
const page = makePublisherPage({
  publisherCode: "47",
  basePath: "/game/publisher_asw",
  viewType: "grid",
});

export const viewport = page.viewport;
export const generateMetadata = page.generateMetadata;
export default page.Page;
