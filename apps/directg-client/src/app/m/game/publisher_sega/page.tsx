import { makePublisherLandingPage } from "@screens/mobile-publisher-landing";

// legacy mobile publisher_sega.html — 퍼블리셔 랜딩(무접미).
const page = makePublisherLandingPage("sega");

export const viewport = page.viewport;
export const metadata = page.metadata;
export default page.Page;
