import { makeMobilePublisherPage } from "@screens/mobile-game-publisher";

// legacy mobile publisher_focus_thumb.html — publisher_code 22.
const page = makeMobilePublisherPage({
  publisherCode: "22",
  basePath: "/game/publisher_focus",
  viewType: "thumb",
});

export const viewport = page.viewport;
export const generateMetadata = page.generateMetadata;
export default page.Page;
