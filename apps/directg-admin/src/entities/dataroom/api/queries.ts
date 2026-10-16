import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchDataroomList,
  fetchDataroomDetail,
  createDataroom,
  updateDataroom,
  fetchDataroomDownloadList,
} from "./fetcher";
import type {
  DataroomListSearch,
  DataroomSaveRequest,
  DataroomDownloadSearch,
} from "../model/types";

const DATAROOM_KEY = ["admin", "board", "dataroom"] as const;

export const dataroomListQueryKey = (query: DataroomListSearch) =>
  [...DATAROOM_KEY, query] as const;

// legacy board/dataroom_file.php — 자료실 파일현황.
export const useDataroomList = (query: DataroomListSearch) =>
  useQuery({
    queryKey: dataroomListQueryKey(query),
    queryFn: () => fetchDataroomList(query),
  });

export const dataroomDetailQueryKey = (idx: number) => [...DATAROOM_KEY, "detail", idx] as const;

// legacy dataroom_register.php(modify 로드) · dataroom_view.php — 상세.
export const useDataroomDetail = (idx: number, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: dataroomDetailQueryKey(idx),
    queryFn: () => fetchDataroomDetail(idx),
    enabled: options?.enabled ?? true,
  });

// legacy dataroom_ps.php mode=register → dataroom_file 리다이렉트 = 목록 invalidate.
export const useCreateDataroom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (p: DataroomSaveRequest) => createDataroom(p),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DATAROOM_KEY }),
  });
};

// legacy dataroom_ps.php mode=modify → dataroom_view 리다이렉트 = invalidate.
export const useUpdateDataroom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idx, payload }: { idx: number; payload: DataroomSaveRequest }) =>
      updateDataroom(idx, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DATAROOM_KEY }),
  });
};

export const dataroomDownloadListQueryKey = (query: DataroomDownloadSearch) =>
  [...DATAROOM_KEY, "downloads", query] as const;

// legacy dataroom_download.php — 자료실 다운로드현황.
export const useDataroomDownloadList = (query: DataroomDownloadSearch) =>
  useQuery({
    queryKey: dataroomDownloadListQueryKey(query),
    queryFn: () => fetchDataroomDownloadList(query),
  });
