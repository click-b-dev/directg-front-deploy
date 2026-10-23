import { apiClient } from "@shared/api/client";
import { toApiErrorMessage, unwrapEnvelope, type AppResponse } from "@shared/api/envelope";
import {
  ASSET_CREATE_ERRORS,
  ASSET_LIST_ERRORS,
  CODE_CREATE_ERRORS,
  CODE_DELETE_ERRORS,
  CODE_LIST_ERRORS,
  CODE_UPDATE_ERRORS,
} from "../lib/error-messages";
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
  AssetPageDto,
  AssetCreateDto,
  CodeGroupDto,
  CodeListDto,
  CodeCreateDto,
  CodeMessageDto,
} from "../model/types";

// swagger GET /api/admin/assets — page/assetId/name/*Cd 필터, 30/page. (필터 드롭다운 코드는 useAssetCodes)
export const fetchAssetList = async (query: AssetSearch): Promise<AssetListResponse> => {
  const searchParams: Record<string, string> = {};
  const set = (key: string, value: string | number | undefined) => {
    if (value !== undefined && value !== "") {
      searchParams[key] = String(value);
    }
  };
  set("page", query.page);
  set("name", query.searchValue);
  set("assetId", query.searchID);
  set("publisherCd", query.publisherCd);
  set("productTypeCd", query.productTypeCd);
  set("assetTypeCd", query.assetTypeCd);
  set("platformCd", query.platformCd);

  const page = await unwrapEnvelope(
    apiClient.get<AppResponse<AssetPageDto>>("/admin/assets", { searchParams }),
    ASSET_LIST_ERRORS,
  );
  return {
    content: page.content.map(({ isRegistered, id, ...rest }) => ({
      ...rest,
      id: String(id),
      is_registered: isRegistered,
    })),
    totalElements: page.totalElements,
    totalPages: page.totalPages,
  };
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

// swagger GET /api/codes — 전체 코드를 groupId별로 그룹핑해 내려준다(PDTP/ASTP/PLFM/PUBL).
export const fetchCodeGroups = async () =>
  (await unwrapEnvelope(apiClient.get<AppResponse<CodeListDto>>("/codes"), CODE_LIST_ERRORS))
    .groups;

// 변경 API 결과를 legacy 화면 계약({id} 성공 / {message} 실패)으로 변환. 메시지는 code→프론트 문구.
const toMutationResult = async (run: () => Promise<string>): Promise<AssetCodeMutationResponse> => {
  try {
    return { id: await run() };
  } catch (error) {
    return { message: toApiErrorMessage(error) };
  }
};

// legacy asset_code_list — 그룹별 코드 목록(페이징 없음).
export const toAssetCodeGroupResponse = (
  groups: CodeGroupDto[],
  group_id: string,
): AssetCodeGroupResponse => ({
  content: (groups.find((g) => g.groupId === group_id)?.codes ?? []).map((c) => ({
    id: c.id,
    groupId: c.groupId,
    subId: String(c.subId),
    name: c.name,
  })),
});

export const fetchAssetCodeGroup = async (group_id: string) =>
  toAssetCodeGroupResponse(await fetchCodeGroups(), group_id);

// swagger POST /api/codes {groupId, name}
export const registerAssetCode = (group_id: string, name: string) =>
  toMutationResult(
    async () =>
      (
        await unwrapEnvelope(
          apiClient.post<AppResponse<CodeCreateDto>>("/codes", { groupId: group_id, name }),
          CODE_CREATE_ERRORS,
        )
      ).id,
  );

// swagger PUT /api/codes/{codeId} {name} — 코드명만 변경
export const modifyAssetCode = (code_id: string, name: string) =>
  toMutationResult(
    async () =>
      (
        await unwrapEnvelope(
          apiClient.put<AppResponse<CodeMessageDto>>(`/codes/${encodeURIComponent(code_id)}`, {
            name,
          }),
          CODE_UPDATE_ERRORS,
        )
      ).id,
  );

// swagger DELETE /api/codes/{codeId}
export const deleteAssetCode = (code_id: string) =>
  toMutationResult(
    async () =>
      (
        await unwrapEnvelope(
          apiClient.del<AppResponse<CodeMessageDto>>(`/codes/${encodeURIComponent(code_id)}`),
          CODE_DELETE_ERRORS,
        )
      ).id,
  );

// 등록/수정/목록 필터 드롭다운 코드 4종 — 코드 그룹에서 groupId로 추출.
export const toAssetCodes = (groups: CodeGroupDto[]): AssetCodes => {
  const pick = (groupId: string) =>
    (groups.find((g) => g.groupId === groupId)?.codes ?? []).map((c) => ({
      code_id: c.id,
      name: c.name,
    }));
  return {
    publisher: pick("PUBL"),
    product_type: pick("PDTP"),
    asset_type: pick("ASTP"),
    platform: pick("PLFM"),
  };
};

export const fetchAssetCodes = async () => toAssetCodes(await fetchCodeGroups());

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

// swagger POST /api/admin/assets — asset_name → title. 성공 시 id, 실패 시 message.
export const createAsset = async (payload: AssetCreateRequest): Promise<AssetCreateResponse> => {
  try {
    const { asset_name, ...rest } = payload;
    const created = await unwrapEnvelope(
      apiClient.post<AppResponse<AssetCreateDto>>("/admin/assets", { title: asset_name, ...rest }),
      ASSET_CREATE_ERRORS,
    );
    return { id: String(created.id) };
  } catch (error) {
    return { message: toApiErrorMessage(error) };
  }
};

// legacy assets_delete — 하위 Item 존재 시 거부 메시지.
export const deleteAsset = (asset_id: string) =>
  apiClient.post<AssetDeleteResponse>("/admin/goods/asset/delete", { asset_id });

// legacy asset_item_register — 키 일괄 등록(textarea) → 등록된 키 수.
export const registerAssetKeys = (asset_id: string, asset_item: string) =>
  apiClient.post<AssetKeysResponse>("/admin/goods/asset/keys", { asset_id, asset_item });

// legacy asset_inventory_qty — tbl_asset 기초행 upsert.
export const registerAssetInventory = (asset_id: string, reg_date: string) =>
  apiClient.post<{ success: boolean }>("/admin/goods/asset/inventory", { asset_id, reg_date });
