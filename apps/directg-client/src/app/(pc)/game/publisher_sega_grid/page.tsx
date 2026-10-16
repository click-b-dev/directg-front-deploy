import { makePublisherPage } from "@screens/game-publisher";

// legacy `pc/game/publisher_sega_grid.html` — publisher_code 93.
const page = makePublisherPage({
  publisherCode: "93",
  basePath: "/game/publisher_sega",
  viewType: "grid",
});

export const viewport = page.viewport;
export const generateMetadata = page.generateMetadata;
export default page.Page;
