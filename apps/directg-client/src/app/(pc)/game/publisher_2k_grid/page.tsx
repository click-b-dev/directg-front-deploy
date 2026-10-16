import { makePublisherPage } from "@screens/game-publisher";

// legacy `pc/game/publisher_2k_grid.html` — publisher_code 12.
const page = makePublisherPage({
  publisherCode: "12",
  basePath: "/game/publisher_2k",
  viewType: "grid",
});

export const viewport = page.viewport;
export const generateMetadata = page.generateMetadata;
export default page.Page;
