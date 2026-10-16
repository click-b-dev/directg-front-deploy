import { makeMobilePublisherPage } from "@screens/mobile-game-publisher";

// legacy mobile publisher_sega_thumb.html — publisher_code 93.
const page = makeMobilePublisherPage({
  publisherCode: "93",
  basePath: "/game/publisher_sega",
  viewType: "thumb",
});

export const viewport = page.viewport;
export const generateMetadata = page.generateMetadata;
export default page.Page;
