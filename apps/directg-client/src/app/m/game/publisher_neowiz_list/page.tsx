import { makeMobilePublisherPage } from "@screens/mobile-game-publisher";

// legacy mobile publisher_neowiz_list.html — publisher_code 117.
const page = makeMobilePublisherPage({
  publisherCode: "117",
  basePath: "/game/publisher_neowiz",
  viewType: "list",
});

export const viewport = page.viewport;
export const generateMetadata = page.generateMetadata;
export default page.Page;
