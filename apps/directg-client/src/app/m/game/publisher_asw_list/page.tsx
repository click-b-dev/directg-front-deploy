import { makeMobilePublisherPage } from "@screens/mobile-game-publisher";

// legacy mobile publisher_asw_list.html — publisher_code 47.
const page = makeMobilePublisherPage({
  publisherCode: "47",
  basePath: "/game/publisher_asw",
  viewType: "list",
});

export const viewport = page.viewport;
export const generateMetadata = page.generateMetadata;
export default page.Page;
