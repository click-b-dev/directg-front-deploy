/**
 * 자료실 (legacy `tbl_dataroom` — Dataroom::getDataroomList / setDataroomLog).
 * 계약: `GET /api/board/dataroom`, `POST /api/board/dataroom/download`.
 * 문서: docs/migration/storefront/board/dataroom.md
 */
export interface DataroomItem {
  idx: number;
  file_name: string;
  file_url: string;
  thumbnail: string;
  /** legacy raw echo(HTML 가능). */
  contents: string;
  deploy_date: string;
}

export interface DataroomListResponse {
  list: DataroomItem[];
}

/** 다운로드 요청 응답 (legacy dataroom_ps.php). */
export interface DataroomDownloadResponse {
  status: "success" | "error";
  file_url?: string;
  error_msg?: string;
  m_id?: string;
}
