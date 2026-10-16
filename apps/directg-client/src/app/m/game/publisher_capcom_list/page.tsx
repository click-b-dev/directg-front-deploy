import { makeMobilePublisherPage } from "@screens/mobile-game-publisher";

// legacy mobile publisher_capcom_list.html — publisher_code 34.
const page = makeMobilePublisherPage({
  publisherCode: "34",
  basePath: "/game/publisher_capcom",
  viewType: "list",
});

export const viewport = page.viewport;
export const generateMetadata = page.generateMetadata;
export default page.Page;
