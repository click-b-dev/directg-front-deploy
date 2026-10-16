import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchNoticeList,
  deleteNotice,
  fetchNoticeDetail,
  createNotice,
  updateNotice,
} from "./fetcher";
import type { NoticeListSearch, NoticeSaveRequest } from "../model/types";

const NOTICE_KEY = ["admin", "board", "notice"] as const;

export const noticeListQueryKey = (query: NoticeListSearch) => [...NOTICE_KEY, query] as const;

// legacy board/notice_list.php — 공지사항 목록.
export const useNoticeList = (query: NoticeListSearch) =>
  useQuery({
    queryKey: noticeListQueryKey(query),
    queryFn: () => fetchNoticeList(query),
  });

export const noticeDetailQueryKey = (idx: number) => [...NOTICE_KEY, "detail", idx] as const;

// legacy notice_register.php(modify 로드) · notice_view.php — 상세.
export const useNoticeDetail = (idx: number, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: noticeDetailQueryKey(idx),
    queryFn: () => fetchNoticeDetail(idx),
    enabled: options?.enabled ?? true,
  });

// legacy notice_ps.php mode=regitster → notice_list 리다이렉트 = 목록 invalidate.
export const useCreateNotice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (p: NoticeSaveRequest) => createNotice(p),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTICE_KEY }),
  });
};

// legacy notice_ps.php mode=modify → notice_list 리다이렉트 = 목록 invalidate.
export const useUpdateNotice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idx, payload }: { idx: number; payload: NoticeSaveRequest }) =>
      updateNotice(idx, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTICE_KEY }),
  });
};

// legacy notice_ps.php mode=delete → location.reload() = 목록 invalidate.
export const useDeleteNotice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (idx: number) => deleteNotice(idx),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTICE_KEY }),
  });
};
