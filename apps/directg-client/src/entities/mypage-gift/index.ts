// server-only fetcher(getMypageGift, next/headers)는 배럴에서 제외 — page가 deep path로 import.
export type {
  GiftItem,
  GiftListResponse,
  GiftClaimRequest,
  GiftClaimResponse,
  GiftLicenceResponse,
} from "./model/types";
export { postGiftClaim } from "./api/post-gift-claim";
export { postGiftLicence } from "./api/post-gift-licence";
