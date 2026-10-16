import { makeMobilePublisherPage } from "@screens/mobile-game-publisher";

// legacy mobile publisher_marvelous_thumb.html — publisher_code 314.
const page = makeMobilePublisherPage({
  publisherCode: "314",
  basePath: "/game/publisher_marvelous",
  viewType: "thumb",
});

export const viewport = page.viewport;
export const generateMetadata = page.generateMetadata;
export default page.Page;
