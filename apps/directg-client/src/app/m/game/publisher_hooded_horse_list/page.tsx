import { makeMobilePublisherPage } from "@screens/mobile-game-publisher";

// legacy mobile publisher_hooded_horse_list.html — publisher_code 277.
const page = makeMobilePublisherPage({
  publisherCode: "277",
  basePath: "/game/publisher_hooded_horse",
  viewType: "list",
});

export const viewport = page.viewport;
export const generateMetadata = page.generateMetadata;
export default page.Page;
