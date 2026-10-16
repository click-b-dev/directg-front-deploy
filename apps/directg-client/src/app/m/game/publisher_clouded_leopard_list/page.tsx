import { makeMobilePublisherPage } from "@screens/mobile-game-publisher";

// legacy mobile publisher_clouded_leopard_list.html — publisher_code 132.
const page = makeMobilePublisherPage({
  publisherCode: "132",
  basePath: "/game/publisher_clouded_leopard",
  viewType: "list",
});

export const viewport = page.viewport;
export const generateMetadata = page.generateMetadata;
export default page.Page;
