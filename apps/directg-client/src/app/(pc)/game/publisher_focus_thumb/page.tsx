import { makePublisherPage } from "@screens/game-publisher";

// legacy `pc/game/publisher_focus_thumb.html` — publisher_code 22.
const page = makePublisherPage({
  publisherCode: "22",
  basePath: "/game/publisher_focus",
  viewType: "thumb",
});

export const viewport = page.viewport;
export const generateMetadata = page.generateMetadata;
export default page.Page;
