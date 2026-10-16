import { cache } from "react";

import { apiClient } from "@shared/api/client";
import type { NoticeView } from "../model/types";

/**
 * 공지사항 상세 조회 (public). `GET /api/board/notices/:idx` — legacy `Board::getNoticeView`.
 * `cache()`로 요청당 1회만 호출(generateMetadata·page 공유 → hit++ 중복 증가 방지).
 * 조회 시 hit 증가·마크다운 렌더는 백엔드 책임.
 */
export const getBoardNoticeView = cache(
  async (idx: number): Promise<NoticeView> => apiClient.get<NoticeView>(`board/notices/${idx}`),
);
