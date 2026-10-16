import { makePublisherPage } from "@screens/game-publisher";

// legacy `pc/game/publisher_hooded_horse_grid.html` — publisher_code 277.
const page = makePublisherPage({
  publisherCode: "277",
  basePath: "/game/publisher_hooded_horse",
  viewType: "grid",
});

export const viewport = page.viewport;
export const generateMetadata = page.generateMetadata;
export default page.Page;
