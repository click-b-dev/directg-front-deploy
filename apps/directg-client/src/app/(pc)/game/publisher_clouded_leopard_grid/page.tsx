import { makePublisherPage } from "@screens/game-publisher";

// legacy `pc/game/publisher_clouded_leopard_grid.html` — publisher_code 132.
const page = makePublisherPage({
  publisherCode: "132",
  basePath: "/game/publisher_clouded_leopard",
  viewType: "grid",
});

export const viewport = page.viewport;
export const generateMetadata = page.generateMetadata;
export default page.Page;
