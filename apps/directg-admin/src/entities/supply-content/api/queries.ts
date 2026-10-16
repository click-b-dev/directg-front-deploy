import { useQuery } from "@tanstack/react-query";
import { fetchSupplyContentList, fetchSupplyContentMember, fetchPatchDownloadLog } from "./fetcher";
import type {
  SupplyContentSearch,
  SupplyContentMemberSearch,
  PatchDownloadSearch,
} from "../model/types";

const SUPPLY_CONTENT_KEY = ["admin", "goods", "supply-contents"] as const;

export const supplyContentListQueryKey = (query: SupplyContentSearch) =>
  [...SUPPLY_CONTENT_KEY, query] as const;

// legacy supply_content.php — 제공컨텐츠 현황.
export const useSupplyContentList = (query: SupplyContentSearch) =>
  useQuery({
    queryKey: supplyContentListQueryKey(query),
    queryFn: () => fetchSupplyContentList(query),
  });

export const supplyContentMemberQueryKey = (query: SupplyContentMemberSearch) =>
  [...SUPPLY_CONTENT_KEY, "member", query] as const;

// legacy supply_content_member.php — 회원별 제공컨텐츠 조회. 검색어 있을 때만 조회(검색 전 빈 목록).
export const useSupplyContentMember = (query: SupplyContentMemberSearch) =>
  useQuery({
    queryKey: supplyContentMemberQueryKey(query),
    queryFn: () => fetchSupplyContentMember(query),
    enabled: query.search_value !== "",
  });

export const patchDownloadLogQueryKey = (query: PatchDownloadSearch) =>
  [...SUPPLY_CONTENT_KEY, "download-log", query] as const;

// legacy supply_content_download.php — 제공컨텐츠 다운로드 현황(검색 없어도 전체 표시).
export const usePatchDownloadLog = (query: PatchDownloadSearch) =>
  useQuery({
    queryKey: patchDownloadLogQueryKey(query),
    queryFn: () => fetchPatchDownloadLog(query),
  });
