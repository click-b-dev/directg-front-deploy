import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@shared/api/client";
import { applyMember } from "@entities/member";

// 이메일 인증(가입 승인) 상태. legacy는 별도 컬럼이 아니라 `tbl_member.status`로 표현한다.
//   5 = 승인대기(인증메일 [인증완료]를 아직 누르지 않음, 로그인 불가) / 0 = 승인 완료(정상)
// 수동 승인은 기존 `POST /admin/member/apply`(legacy member_proc mode=apply → status=0)를 그대로 쓴다.
export type MemberStatus = 0 | 5;

export const isEmailVerified = (status: MemberStatus) => status === 0;

type StatusResponse = { statuses: Record<string, MemberStatus> };

const STATUS_KEY = ["admin", "member", "status"] as const;

// 실제 API에서는 회원 목록/상세 응답에 `status`가 포함되는 편이 자연스럽다.
// 그 응답이 준비되기 전까지 임시로 회원 번호 목록의 상태를 따로 조회한다(신규 계약).
export const fetchMemberStatuses = (m_nos: number[]) =>
  apiClient.get<StatusResponse>("/admin/member/status", {
    searchParams: { m_no: m_nos.join(",") },
  });

export const useMemberStatuses = (m_nos: number[]) =>
  useQuery({
    queryKey: [...STATUS_KEY, m_nos.join(",")] as const,
    queryFn: () => fetchMemberStatuses(m_nos),
    enabled: m_nos.length > 0,
    select: (data) => data.statuses,
  });

// 수동 승인 — 성공하면 상태를 다시 조회해 목록·상세가 같은 값을 본다.
export const useApproveMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (m_no: number) => applyMember(m_no),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STATUS_KEY }),
  });
};
