import { makeMobilePublisherPage } from "@screens/mobile-game-publisher";

// legacy mobile publisher_paradox_thumb.html — publisher_code 30.
const page = makeMobilePublisherPage({
  publisherCode: "30",
  basePath: "/game/publisher_paradox",
  viewType: "thumb",
});

export const viewport = page.viewport;
export const generateMetadata = page.generateMetadata;
export default page.Page;
