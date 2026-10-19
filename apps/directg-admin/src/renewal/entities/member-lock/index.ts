import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@shared/api/client";

// 회원 계정 잠금 (Figma 회원_회원내역_상세 "계정 잠금" 스위치 + 알럿)
// legacy에 없는 신규 API 계약이다 — docs/renewal/AD-Member-Detail-Lock.md 참조.
export type MemberLockState = { locked: boolean };

const lockKey = (m_no: string) => ["admin", "member", "lock", m_no] as const;

// 실제 API에서는 회원 상세(member view) 응답에 `locked`가 포함되는 편이 자연스럽다.
export const fetchMemberLock = (m_no: string) =>
  apiClient.get<MemberLockState>("/admin/member/lock", { searchParams: { m_no } });

export const setMemberLock = (m_no: string, locked: boolean) =>
  apiClient.post<MemberLockState>("/admin/member/lock", { m_no, locked });

export const useMemberLock = (m_no: string) =>
  useQuery({ queryKey: lockKey(m_no), queryFn: () => fetchMemberLock(m_no) });

export const useSetMemberLock = (m_no: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (locked: boolean) => setMemberLock(m_no, locked),
    onSuccess: (state) => queryClient.setQueryData(lockKey(m_no), state),
  });
};
