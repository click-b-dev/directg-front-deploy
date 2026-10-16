import { apiClient } from "@shared/api/client";
import type {
  DataroomListSearch,
  DataroomListResponse,
  DataroomDetail,
  DataroomSaveRequest,
  DataroomActionResult,
  DataroomDownloadSearch,
  DataroomDownloadResponse,
} from "../model/types";

// legacy board/dataroom_file.php — 자료실 파일현황(deploy_date desc, 30/page).
export const fetchDataroomList = (query: DataroomListSearch) => {
  const searchParams: Record<string, string> = { page: String(query.page) };
  return apiClient.get<DataroomListResponse>("/admin/board/datarooms", { searchParams });
};

// legacy dataroom_register.php(modify 로드) · dataroom_view.php — 상세.
export const fetchDataroomDetail = (idx: number) =>
  apiClient.get<DataroomDetail>(`/admin/board/datarooms/${idx}`);

// legacy dataroom_ps.php mode=register — 등록.
export const createDataroom = (payload: DataroomSaveRequest) =>
  apiClient.post<DataroomActionResult>("/admin/board/datarooms", payload);

// legacy dataroom_ps.php mode=modify — 수정.
export const updateDataroom = (idx: number, payload: DataroomSaveRequest) =>
  apiClient.put<DataroomActionResult>(`/admin/board/datarooms/${idx}`, payload);

// legacy dataroom_download.php — 자료실 다운로드현황(b.idx desc, 30/page).
export const fetchDataroomDownloadList = (query: DataroomDownloadSearch) => {
  const searchParams: Record<string, string> = { page: String(query.page) };
  if (query.search_title_name !== "") {
    searchParams.search_title_name = query.search_title_name;
  }
  return apiClient.get<DataroomDownloadResponse>("/admin/board/dataroom-downloads", {
    searchParams,
  });
};
