import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchMemberList,
  leaveMember,
  fetchMemberView,
  resetMemberAuth,
  fetchMemberReadyList,
  applyMember,
  deleteMember,
  fetchMemberSnsList,
  fetchMemberPointList,
  fetchMemberPointTarget,
  submitMemberPoint,
  fetchDirectSendRemaining,
  fetchDirectSendMailLog,
} from "./fetcher";
import type {
  MemberListSearch,
  MemberReadyListSearch,
  MemberSnsListSearch,
  SnsProvider,
  MemberPointListSearch,
  MemberPointSubmitRequest,
  DirectSendMailLogSearch,
} from "../model/types";

const MEMBER_KEY = ["admin", "member"] as const;

export const useMemberList = (search: MemberListSearch) =>
  useQuery({
    queryKey: [...MEMBER_KEY, "list", search] as const,
    queryFn: () => fetchMemberList(search),
  });

// legacy member_proc.php mode=leave 성공 → location.reload() = 목록 invalidate.
export const useLeaveMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (m_no: number) => leaveMember(m_no),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MEMBER_KEY }),
  });
};

export const useMemberView = (m_no: string) =>
  useQuery({
    queryKey: [...MEMBER_KEY, "view", m_no] as const,
    queryFn: () => fetchMemberView(m_no),
  });

// legacy member_proc.php mode=authReset 성공 → location.reload() = 상세 invalidate.
export const useResetMemberAuth = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (m_no: number) => resetMemberAuth(m_no),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MEMBER_KEY }),
  });
};

export const useMemberReadyList = (search: MemberReadyListSearch) =>
  useQuery({
    queryKey: [...MEMBER_KEY, "ready", search] as const,
    queryFn: () => fetchMemberReadyList(search),
  });

// legacy member_proc.php mode=apply 성공 → location.reload() = 목록 invalidate.
export const useApplyMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (m_no: number) => applyMember(m_no),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MEMBER_KEY }),
  });
};

// legacy member_proc.php mode=delete 성공 → location.reload() = 목록 invalidate.
export const useDeleteMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (m_no: number) => deleteMember(m_no),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MEMBER_KEY }),
  });
};

export const useMemberSnsList = (provider: SnsProvider, search: MemberSnsListSearch) =>
  useQuery({
    queryKey: [...MEMBER_KEY, "sns", provider, search] as const,
    queryFn: () => fetchMemberSnsList(provider, search),
  });

export const useMemberPointList = (search: MemberPointListSearch) =>
  useQuery({
    queryKey: [...MEMBER_KEY, "point", "list", search] as const,
    queryFn: () => fetchMemberPointList(search),
  });

// legacy: search_value 있을 때만 회원 조회.
export const useMemberPointTarget = (search_value: string) =>
  useQuery({
    queryKey: [...MEMBER_KEY, "point", "target", search_value] as const,
    queryFn: () => fetchMemberPointTarget(search_value),
    enabled: search_value !== "",
  });

// legacy member_point_proc 성공 → location.reload() = 대상 invalidate(포인트 갱신).
export const useSubmitMemberPoint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MemberPointSubmitRequest) => submitMemberPoint(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MEMBER_KEY }),
  });
};

export const useDirectSendRemaining = () =>
  useQuery({
    queryKey: [...MEMBER_KEY, "directsend", "remaining"] as const,
    queryFn: fetchDirectSendRemaining,
  });

export const useDirectSendMailLog = (search: DirectSendMailLogSearch) =>
  useQuery({
    queryKey: [...MEMBER_KEY, "directsend", "mail-log", search] as const,
    queryFn: () => fetchDirectSendMailLog(search),
  });
