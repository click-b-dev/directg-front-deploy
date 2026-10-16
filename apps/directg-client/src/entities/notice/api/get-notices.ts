import { apiClient } from "@shared/api/client";
import type { Notice } from "../model/types";

/** 메인 공지 목록 (기본 5건). `GET /api/main/notices` (백엔드 부재 시 MSW mock). legacy `getNoticeMain(5)`. */
export async function getNotices(limit = 5): Promise<Notice[]> {
  const { notices } = await apiClient.get<{ notices: Notice[] }>(`main/notices?limit=${limit}`);
  return notices;
}
