import { makePublisherLandingPage } from "@screens/mobile-publisher-landing";

// legacy mobile publisher_paradox.html — 퍼블리셔 랜딩(무접미).
const page = makePublisherLandingPage("paradox");

export const viewport = page.viewport;
export const metadata = page.metadata;
export default page.Page;
