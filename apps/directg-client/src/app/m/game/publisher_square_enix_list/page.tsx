import { makeMobilePublisherPage } from "@screens/mobile-game-publisher";

// legacy mobile publisher_square_enix_list.html — publisher_code 36.
const page = makeMobilePublisherPage({
  publisherCode: "36",
  basePath: "/game/publisher_square_enix",
  viewType: "list",
});

export const viewport = page.viewport;
export const generateMetadata = page.generateMetadata;
export default page.Page;
