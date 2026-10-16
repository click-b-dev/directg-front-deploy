// server-only fetcher(getMemberAddress, next/headers)는 배럴에서 제외 — page가 deep path로 import.
export type { MemberAddress, AddressSaveResponse } from "./model/types";
export { postMemberAddress } from "./api/post-member-address";
