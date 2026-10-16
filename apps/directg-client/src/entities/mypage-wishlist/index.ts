// server-only fetcher(getMypageWishlist, next/headers)는 배럴에서 제외 — page가 deep path로 import.
export type {
  WishlistItem,
  WishlistResponse,
  WishlistActionRequest,
  WishlistActionResponse,
} from "./model/types";
export { postWishlistAction } from "./api/post-wishlist-action";
