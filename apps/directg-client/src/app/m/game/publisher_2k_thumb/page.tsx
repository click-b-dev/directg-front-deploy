import { makeMobilePublisherPage } from "@screens/mobile-game-publisher";

// legacy mobile publisher_2k_thumb.html — publisher_code 12.
const page = makeMobilePublisherPage({
  publisherCode: "12",
  basePath: "/game/publisher_2k",
  viewType: "thumb",
});

export const viewport = page.viewport;
export const generateMetadata = page.generateMetadata;
export default page.Page;
