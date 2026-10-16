// server-only fetcher(getMypageQna, next/headers)는 배럴에서 제외 — page가 deep path로 import.
export type { QnaRow, QnaListResponse, QnaRegisterResponse } from "./model/types";
export { postMypageQnaView } from "./api/post-mypage-qna-view";
export { postMypageQnaRegister } from "./api/post-mypage-qna-register";
