import { makePublisherPage } from "@screens/game-publisher";

// legacy `pc/game/publisher_thq_list.html` — publisher_code 23.
const page = makePublisherPage({
  publisherCode: "23",
  basePath: "/game/publisher_thq",
  viewType: "list",
});

export const viewport = page.viewport;
export const generateMetadata = page.generateMetadata;
export default page.Page;
