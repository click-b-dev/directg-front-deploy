import { makePublisherPage } from "@screens/game-publisher";

// legacy `pc/game/publisher_asw_thumb.html` — publisher_code 47.
const page = makePublisherPage({
  publisherCode: "47",
  basePath: "/game/publisher_asw",
  viewType: "thumb",
});

export const viewport = page.viewport;
export const generateMetadata = page.generateMetadata;
export default page.Page;
