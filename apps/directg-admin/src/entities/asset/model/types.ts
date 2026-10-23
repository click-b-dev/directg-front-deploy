// legacy goods/asset/* — Asset 서버 관리(실시간 API). asset_ps.php 공유.
// docs/migration/admin/asset/asset-list.md.

export type AssetSearch = {
  page: number;
  searchValue: string; // Asset 이름
  searchID: string; // Asset ID(이름보다 우선)
  publisherCd: string;
  productTypeCd: string;
  assetTypeCd: string;
  platformCd: string;
};

// runAssetList/runAssetDetail content 항목 + is_registered(로컬 존재여부).
export type AssetListItem = {
  id: string;
  title: string;
  productType: string;
  assetType: string;
  platform: string;
  publisher: string;
  is_registered: boolean;
  regDt: string;
};

export type AssetCodeOption = {
  code_id: string;
  name: string;
};

// getAssetCodeList 4종(등록/수정/목록 필터 공용).
export type AssetCodes = {
  publisher: AssetCodeOption[]; // 'PUBL'
  product_type: AssetCodeOption[]; // 'PDTP'
  asset_type: AssetCodeOption[]; // 'ASTP'
  platform: AssetCodeOption[]; // 'PLFM'
};

export type AssetListResponse = {
  content: AssetListItem[];
  totalElements: number;
  totalPages: number;
};

// assets_delete → message(하위 Item 존재 시 거부 메시지).
export type AssetDeleteResponse = { message: string };

// asset_item_register → count(등록된 키 수).
export type AssetKeysResponse = { count: number };

// asset_register 폼 payload(Cd=code_id, publisherCd만 선택).
export type AssetCreateRequest = {
  asset_name: string;
  productTypeCd: string;
  assetTypeCd: string;
  platformCd: string;
  publisherCd: string;
};

// runAssetRegister 결과 — 성공 시 id, 실패 시 message.
export type AssetCreateResponse = { id?: string; message?: string };

// asset_reserve_list — 예약현황 검색(cancelled: all|0|1).
export type AssetReserveSearch = {
  page: number;
  ordno: string;
  owner: string;
  cancelled: string;
};

// runReserveList content + po→settle_no/m_no 매핑(링크용).
export type AssetReserveItem = {
  id: string; // Reserve ID
  assetId: string;
  title: string;
  po: string; // 주문번호
  owner: string; // 소유자(M/{m_id})
  reserveDt: string;
  cancelled: boolean;
  cancelDt: string;
  canceller: string;
  settle_no: string; // 있으면 order_view 링크
  m_no: string; // 있으면 member_view 링크
};

export type AssetReserveListResponse = {
  content: AssetReserveItem[];
  totalElements: number;
  totalPages: number;
};

// asset_download_list — 다운로드(반품출고) 검색.
export type AssetDownloadSearch = {
  page: number;
  owner: string;
};

// getAssetDownloadList content(tbl_asset_download_log ⋈ tbl_asset).
export type AssetDownloadItem = {
  no: string;
  po: string;
  asset_id: string;
  asset_name: string;
  owner: string;
  qty: string;
  pin: string;
  downloadLimit: string; // 남은횟수
  download_date: string; // 없으면 미다운로드
  expired_dt: string;
  reg_date: string;
  is_finish: string; // "Y"면 삭제완료
  finish_date: string;
};

export type AssetDownloadListResponse = {
  content: AssetDownloadItem[];
  totalElements: number;
  totalPages: number;
};

// asset_download_register 폼 payload(download_type=RETURN 고정).
export type AssetDownloadRegisterRequest = {
  asset_id: string;
  owner: string;
  qty: string;
  pin: string;
  download_limit: string;
  download_expired_day: string;
};

// register → 성공 po/count, 실패 message.
export type AssetDownloadRegisterResponse = { po?: string; count?: number; message?: string };

// finish → 성공 id/count, 실패 message.
export type AssetDownloadFinishResponse = { id?: string; count?: number; message?: string };

// asset_code_list — 그룹별 코드(id 예: PLFM0001 → groupId 4자리 + subId 시퀀스).
export type AssetCodeGroupItem = {
  id: string;
  groupId?: string;
  subId?: string;
  name: string;
};

export type AssetCodeGroupResponse = {
  content: AssetCodeGroupItem[];
};

// asset_code_modify/delete → 성공 id, 실패 message.
export type AssetCodeMutationResponse = { id?: string; message?: string };

// asset_modify 폼 프리필(실시간 API 상세, 코드명→code_id 역매핑). found=false면 조회 실패.
export type AssetDetail = {
  asset_id: string;
  asset_name: string;
  productTypeCd: string;
  assetTypeCd: string;
  platformCd: string;
  publisherCd: string;
  found: boolean;
};

// asset_modify 폼 payload.
export type AssetModifyRequest = {
  asset_id: string;
  asset_name: string;
  productTypeCd: string;
  assetTypeCd: string;
  platformCd: string;
  publisherCd: string;
};

// runAssetModify 결과 — 성공 id, 실패 message.
export type AssetModifyResponse = { id?: string; message?: string };

// asset_item_list — Asset 키 현황 검색.
export type AssetItemSearch = {
  page: number;
  asset_id: string;
};

// runAssetItemListFilter content(키 1건).
export type AssetItem = {
  id: string;
  title: string;
  regDt: string;
  owner: string;
  po: string;
  reserved: boolean;
  reserveDt: string;
  reserveId: string;
  activated: boolean;
  activatedDt: string;
  key: string;
};

// 목록 + 컨텍스트 헤더(runAssetDetail).
export type AssetItemListResponse = {
  asset_id: string;
  asset_name: string;
  platform: string;
  publisher: string;
  content: AssetItem[];
  totalElements: number;
  totalPages: number;
};

// asset_reserve_cancel → 성공 id, 실패 message.
export type AssetReserveCancelResponse = { id?: string; message?: string };

// ── swagger DTO (https://directg-classic-api.clickb.co.kr) — fetcher에서 위 화면용 타입으로 변환 ──
export type AssetItemDto = {
  id: number;
  title: string;
  productType: string;
  assetType: string;
  platform: string;
  publisher: string;
  regDt: string;
  isRegistered: boolean;
};

export type AssetPageDto = {
  content: AssetItemDto[];
  totalElements: number;
  totalPages: number;
};

export type AssetCreateDto = { id: number };

export type CodeItemDto = { id: string; groupId: string; subId: number; name: string };
export type CodeGroupDto = { groupId: string; groupName: string; codes: CodeItemDto[] };
export type CodeListDto = { groups: CodeGroupDto[] };
export type CodeCreateDto = { id: string };
export type CodeMessageDto = { id: string; message: string };
