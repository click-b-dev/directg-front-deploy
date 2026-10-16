import { makeMobilePublisherPage } from "@screens/mobile-game-publisher";

// legacy mobile publisher_thq_list.html — publisher_code 23.
const page = makeMobilePublisherPage({
  publisherCode: "23",
  basePath: "/game/publisher_thq",
  viewType: "list",
});

export const viewport = page.viewport;
export const generateMetadata = page.generateMetadata;
export default page.Page;
