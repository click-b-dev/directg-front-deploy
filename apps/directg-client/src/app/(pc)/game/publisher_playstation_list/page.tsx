import { makePublisherPage } from "@screens/game-publisher";

// legacy `pc/game/publisher_playstation_list.html` — publisher_code 162.
const page = makePublisherPage({
  publisherCode: "162",
  basePath: "/game/publisher_playstation",
  viewType: "list",
});

export const viewport = page.viewport;
export const generateMetadata = page.generateMetadata;
export default page.Page;
