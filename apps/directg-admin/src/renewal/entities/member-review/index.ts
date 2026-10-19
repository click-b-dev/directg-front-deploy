import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@shared/api/client";

// 회원 상세 > 리뷰 내역 (Figma 회원_회원내역_상세_리뷰내역, 기획 AD-Member-Detail-04)
// legacy에 없는 신규 API 계약이다 — docs/renewal/AD-Member-Detail-Reviews.md 참조.
export type MemberReviewItem = {
  review_id: string;
  reg_date: string;
  /** 상품 카테고리(예: 게임) */
  category: string;
  product_name: string;
  /** 텍스트 리뷰 본문. 없으면 빈 문자열(표에서 노출하지 않는다) */
  content: string;
  /** 평가 항목 태그 */
  tags: string[];
  /** 공감 수 */
  like_cnt: number;
  /** 신고 수 */
  report_cnt: number;
  /** 상태 표시 문구(정상 등) */
  status_label: string;
};

export type MemberReviewListResponse = {
  items: MemberReviewItem[];
  pagination: { current_page: number; total_results: number; total_pages: number };
};

export const fetchMemberReviews = (m_no: string, page: number) =>
  apiClient.get<MemberReviewListResponse>("/admin/member/reviews", {
    searchParams: { m_no, page: String(page) },
  });

export const useMemberReviews = (m_no: string, page: number) =>
  useQuery({
    queryKey: ["admin", "member", "reviews", m_no, page] as const,
    queryFn: () => fetchMemberReviews(m_no, page),
  });
