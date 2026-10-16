import { makePublisherPage } from "@screens/game-publisher";

// legacy `pc/game/publisher_capcom_grid.html` — publisher_code 34.
const page = makePublisherPage({
  publisherCode: "34",
  basePath: "/game/publisher_capcom",
  viewType: "grid",
});

export const viewport = page.viewport;
export const generateMetadata = page.generateMetadata;
export default page.Page;
