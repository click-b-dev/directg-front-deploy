import { apiClient } from "@shared/api/client";
import type {
  AssetSearch,
  AssetListResponse,
  AssetDeleteResponse,
  AssetKeysResponse,
  AssetCodes,
  AssetCreateRequest,
  AssetCreateResponse,
  AssetReserveSearch,
  AssetReserveListResponse,
  AssetDownloadSearch,
  AssetDownloadListResponse,
  AssetDownloadRegisterRequest,
  AssetDownloadRegisterResponse,
  AssetDownloadFinishResponse,
  AssetCodeGroupResponse,
  AssetCodeMutationResponse,
  AssetDetail,
  AssetModifyRequest,
  AssetModifyResponse,
  AssetItemSearch,
  AssetItemListResponse,
  AssetReserveCancelResponse,
} from "../model/types";

// legacy asset_ps.php asset_list/asset_search — searchID 있으면 단건 상세, else 목록(30/page).
// 실시간 Asset 서버 API + is_registered(로컬 존재)·코드목록 4종은 백엔드.
export const fetchAssetList = (query: AssetSearch) => {
  const searchParams: Record<string, string> = {};
  const set = (key: keyof AssetSearch, value: string | number | undefined) => {
    if (value !== undefined && value !== "") {
      searchParams[key] = String(value);
    }
  };
  set("page", query.page);
  set("searchValue", query.searchValue);
  set("searchID", query.searchID);
  set("publisherCd", query.publisherCd);
  set("productTypeCd", query.productTypeCd);
  set("assetTypeCd", query.assetTypeCd);
  set("platformCd", query.platformCd);
  return apiClient.get<AssetListResponse>("/admin/goods/asset", { searchParams });
};

// legacy assets_reserve_list — 예약현황(owner M/ 보정·po→settle_no/m_no 매핑은 백엔드, 30/page).
export const fetchAssetReserveList = (query: AssetReserveSearch) => {
  const searchParams: Record<string, string> = {};
  const set = (key: keyof AssetReserveSearch, value: string | number | undefined) => {
    if (value !== undefined && value !== "") {
      searchParams[key] = String(value);
    }
  };
  set("page", query.page);
  set("ordno", query.ordno);
  set("owner", query.owner);
  set("cancelled", query.cancelled);
  return apiClient.get<AssetReserveListResponse>("/admin/goods/asset/reserves", { searchParams });
};

// legacy asset_download_list — 다운로드(반품출고) 목록(owner LIKE·no desc·30/page).
export const fetchAssetDownloadList = (query: AssetDownloadSearch) => {
  const searchParams: Record<string, string> = {};
  if (query.page) {
    searchParams.page = String(query.page);
  }
  if (query.owner) {
    searchParams.owner = query.owner;
  }
  return apiClient.get<AssetDownloadListResponse>("/admin/goods/asset/downloads", { searchParams });
};

// legacy asset_download_register — runDownloadReserveRegister(RETURN 고정) → 성공 po/count, 실패 message.
export const registerAssetDownload = (payload: AssetDownloadRegisterRequest) =>
  apiClient.post<AssetDownloadRegisterResponse>("/admin/goods/asset/downloads", payload);

// legacy asset_download_finish — 다운로드 키 삭제(finish) → 성공 id/count, 실패 message.
export const finishAssetDownload = (po: string) =>
  apiClient.post<AssetDownloadFinishResponse>("/admin/goods/asset/downloads/finish", { po });

// legacy asset_code_list — 그룹별 코드 목록(PDTP/ASTP/PLFM/PUBL, 페이징 없음).
export const fetchAssetCodeGroup = (group_id: string) =>
  apiClient.get<AssetCodeGroupResponse>("/admin/goods/asset/code-list", {
    searchParams: { group_id },
  });

// legacy asset_code_register — runAssetCodeRegister(group_id, name) → 성공 id, 실패 message.
export const registerAssetCode = (group_id: string, name: string) =>
  apiClient.post<AssetCodeMutationResponse>("/admin/goods/asset/code-register", {
    group_id,
    name,
  });

// legacy asset_code_modify — 코드명만 변경 → 성공 id, 실패 message.
export const modifyAssetCode = (code_id: string, name: string) =>
  apiClient.post<AssetCodeMutationResponse>("/admin/goods/asset/code-modify", { code_id, name });

// legacy asset_code_delete — 코드 삭제 → 성공 id, 실패 message.
export const deleteAssetCode = (code_id: string) =>
  apiClient.post<AssetCodeMutationResponse>("/admin/goods/asset/code-delete", { code_id });

// legacy getAssetCodeList 4종(등록/수정 폼 드롭다운).
export const fetchAssetCodes = () => apiClient.get<AssetCodes>("/admin/goods/asset/codes");

// legacy asset_item_list — Asset 키 목록 + 컨텍스트 헤더(size 100 고정).
export const fetchAssetItemList = (query: AssetItemSearch) =>
  apiClient.get<AssetItemListResponse>("/admin/goods/asset/items", {
    searchParams: { asset_id: query.asset_id, page: String(query.page || 1) },
  });

// legacy asset_reserve_cancel — 예약(키 할당) 취소 → 성공 id, 실패 message.
export const cancelAssetReserve = (reserve_id: string) =>
  apiClient.post<AssetReserveCancelResponse>("/admin/goods/asset/reserve-cancel", { reserve_id });

// legacy asset_modify 진입 — runAssetDetail 프리필(실시간 API·code_id 역매핑).
export const fetchAssetDetail = (asset_id: string) =>
  apiClient.get<AssetDetail>("/admin/goods/asset/detail", { searchParams: { asset_id } });

// legacy asset_modify — runAssetModify → 성공 id, 실패 message.
export const modifyAsset = (payload: AssetModifyRequest) =>
  apiClient.post<AssetModifyResponse>("/admin/goods/asset/modify", payload);

// legacy asset_register — runAssetRegister → 성공 시 id, 실패 시 message.
export const createAsset = (payload: AssetCreateRequest) =>
  apiClient.post<AssetCreateResponse>("/admin/goods/asset/register", payload);

// legacy assets_delete — 하위 Item 존재 시 거부 메시지.
export const deleteAsset = (asset_id: string) =>
  apiClient.post<AssetDeleteResponse>("/admin/goods/asset/delete", { asset_id });

// legacy asset_item_register — 키 일괄 등록(textarea) → 등록된 키 수.
export const registerAssetKeys = (asset_id: string, asset_item: string) =>
  apiClient.post<AssetKeysResponse>("/admin/goods/asset/keys", { asset_id, asset_item });

// legacy asset_inventory_qty — tbl_asset 기초행 upsert.
export const registerAssetInventory = (asset_id: string, reg_date: string) =>
  apiClient.post<{ success: boolean }>("/admin/goods/asset/inventory", { asset_id, reg_date });
