import { makePublisherPage } from "@screens/game-publisher";

// legacy `pc/game/publisher_neowiz_grid.html` — publisher_code 117.
const page = makePublisherPage({
  publisherCode: "117",
  basePath: "/game/publisher_neowiz",
  viewType: "grid",
});

export const viewport = page.viewport;
export const generateMetadata = page.generateMetadata;
export default page.Page;
