import { makeMobilePublisherPage } from "@screens/mobile-game-publisher";

// legacy mobile publisher_gmode_list.html — publisher_code 372.
const page = makeMobilePublisherPage({
  publisherCode: "372",
  basePath: "/game/publisher_gmode",
  viewType: "list",
});

export const viewport = page.viewport;
export const generateMetadata = page.generateMetadata;
export default page.Page;
