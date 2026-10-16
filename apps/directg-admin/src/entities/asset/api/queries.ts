import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAssetList,
  fetchAssetReserveList,
  fetchAssetDownloadList,
  registerAssetDownload,
  finishAssetDownload,
  fetchAssetCodeGroup,
  registerAssetCode,
  modifyAssetCode,
  deleteAssetCode,
  fetchAssetItemList,
  cancelAssetReserve,
  fetchAssetCodes,
  fetchAssetDetail,
  modifyAsset,
  createAsset,
  deleteAsset,
  registerAssetKeys,
  registerAssetInventory,
} from "./fetcher";
import type {
  AssetSearch,
  AssetReserveSearch,
  AssetDownloadSearch,
  AssetDownloadRegisterRequest,
  AssetCreateRequest,
  AssetModifyRequest,
  AssetItemSearch,
} from "../model/types";

const ASSET_KEY = ["admin", "goods", "asset"] as const;

const assetListQueryKey = (query: AssetSearch) => [...ASSET_KEY, "list", query] as const;

export const useAssetList = (query: AssetSearch) =>
  useQuery({
    queryKey: assetListQueryKey(query),
    queryFn: () => fetchAssetList(query),
  });

const assetReserveListQueryKey = (query: AssetReserveSearch) =>
  [...ASSET_KEY, "reserves", query] as const;

export const useAssetReserveList = (query: AssetReserveSearch) =>
  useQuery({
    queryKey: assetReserveListQueryKey(query),
    queryFn: () => fetchAssetReserveList(query),
  });

const assetDownloadListQueryKey = (query: AssetDownloadSearch) =>
  [...ASSET_KEY, "downloads", query] as const;

export const useAssetDownloadList = (query: AssetDownloadSearch) =>
  useQuery({
    queryKey: assetDownloadListQueryKey(query),
    queryFn: () => fetchAssetDownloadList(query),
  });

// 다운로드 등록 — 성공(po)/실패(message)는 호출부에서 분기(legacy msg).
export const useRegisterAssetDownload = () =>
  useMutation({
    mutationFn: (payload: AssetDownloadRegisterRequest) => registerAssetDownload(payload),
  });

// 다운로드 키 삭제(finish) — 성공 시 목록 invalidate(legacy reload).
export const useFinishAssetDownload = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (po: string) => finishAssetDownload(po),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ASSET_KEY }),
  });
};

const assetCodeGroupQueryKey = (groupId: string) => [...ASSET_KEY, "code-group", groupId] as const;

export const useAssetCodeGroup = (groupId: string) =>
  useQuery({
    queryKey: assetCodeGroupQueryKey(groupId),
    queryFn: () => fetchAssetCodeGroup(groupId),
  });

// 코드 등록 — 성공(id)/실패(message)는 호출부에서 분기(legacy msg).
export const useRegisterAssetCode = () =>
  useMutation({
    mutationFn: ({ group_id, name }: { group_id: string; name: string }) =>
      registerAssetCode(group_id, name),
  });

// 코드 수정 — 성공(id) 시 그룹 목록 invalidate.
export const useModifyAssetCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ code_id, name }: { code_id: string; name: string }) =>
      modifyAssetCode(code_id, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ASSET_KEY }),
  });
};

// 코드 삭제 — 성공(id) 시 그룹 목록 invalidate.
export const useDeleteAssetCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code_id: string) => deleteAssetCode(code_id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ASSET_KEY }),
  });
};

// 등록/수정 폼 드롭다운 코드 4종.
export const useAssetCodes = () =>
  useQuery({
    queryKey: [...ASSET_KEY, "codes"] as const,
    queryFn: fetchAssetCodes,
  });

// Asset 등록 — 성공(id)/실패(message)는 호출부에서 분기.
export const useCreateAsset = () =>
  useMutation({
    mutationFn: (payload: AssetCreateRequest) => createAsset(payload),
  });

// Asset 키(Item) 현황 — asset_id 있을 때만.
const assetItemListQueryKey = (query: AssetItemSearch) => [...ASSET_KEY, "items", query] as const;

export const useAssetItemList = (query: AssetItemSearch) =>
  useQuery({
    queryKey: assetItemListQueryKey(query),
    queryFn: () => fetchAssetItemList(query),
    enabled: query.asset_id !== "",
  });

// 예약(키 할당) 취소 — 성공 시 목록 invalidate(legacy 재조회).
export const useCancelAssetReserve = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reserve_id: string) => cancelAssetReserve(reserve_id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ASSET_KEY }),
  });
};

// Asset 수정 진입 — 프리필 상세(asset_id 있을 때만).
export const useAssetDetail = (assetId: string) =>
  useQuery({
    queryKey: [...ASSET_KEY, "detail", assetId] as const,
    queryFn: () => fetchAssetDetail(assetId),
    enabled: assetId !== "",
  });

// Asset 수정 — 성공(id)/실패(message)는 호출부에서 분기.
export const useModifyAsset = () =>
  useMutation({
    mutationFn: (payload: AssetModifyRequest) => modifyAsset(payload),
  });

// Asset 삭제 — 성공 시 목록 invalidate(legacy reload).
export const useDeleteAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (asset_id: string) => deleteAsset(asset_id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ASSET_KEY }),
  });
};

// 기초정보 등록 — 성공 시 목록 invalidate(legacy reload).
export const useRegisterAssetInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ asset_id, reg_date }: { asset_id: string; reg_date: string }) =>
      registerAssetInventory(asset_id, reg_date),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ASSET_KEY }),
  });
};

// 키 등록 — legacy는 등록 후 새로고침 없음(모달 유지) → invalidate 안 함.
export const useRegisterAssetKeys = () =>
  useMutation({
    mutationFn: ({ asset_id, asset_item }: { asset_id: string; asset_item: string }) =>
      registerAssetKeys(asset_id, asset_item),
  });
