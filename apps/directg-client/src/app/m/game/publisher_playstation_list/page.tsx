import { makeMobilePublisherPage } from "@screens/mobile-game-publisher";

// legacy mobile publisher_playstation_list.html — publisher_code 162.
const page = makeMobilePublisherPage({
  publisherCode: "162",
  basePath: "/game/publisher_playstation",
  viewType: "list",
});

export const viewport = page.viewport;
export const generateMetadata = page.generateMetadata;
export default page.Page;
