import { apiClient } from "@shared/api/client";
import type {
  NoticeListSearch,
  NoticeListResponse,
  NoticeActionResult,
  NoticeDetail,
  NoticeSaveRequest,
} from "../model/types";

// legacy board/notice_list.php — 공지사항 목록(deploy_date desc, 30/page).
export const fetchNoticeList = (query: NoticeListSearch) => {
  const searchParams: Record<string, string> = {};
  const set = (key: keyof NoticeListSearch, value: string | number | undefined) => {
    if (value !== undefined && value !== "") {
      searchParams[key] = String(value);
    }
  };
  set("page", query.page);
  set("search_title", query.search_title);
  set("search_notice_type", query.search_notice_type);
  return apiClient.get<NoticeListResponse>("/admin/board/notices", { searchParams });
};

// legacy notice_ps.php mode=delete — 하드 삭제.
export const deleteNotice = (idx: number) =>
  apiClient.del<NoticeActionResult>(`/admin/board/notices/${idx}`);

// legacy notice_register.php(modify 로드) · notice_view.php — 상세.
export const fetchNoticeDetail = (idx: number) =>
  apiClient.get<NoticeDetail>(`/admin/board/notices/${idx}`);

// legacy notice_ps.php mode=regitster — 등록.
export const createNotice = (payload: NoticeSaveRequest) =>
  apiClient.post<NoticeActionResult>("/admin/board/notices", payload);

// legacy notice_ps.php mode=modify — 수정.
export const updateNotice = (idx: number, payload: NoticeSaveRequest) =>
  apiClient.put<NoticeActionResult>(`/admin/board/notices/${idx}`, payload);
