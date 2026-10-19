import { http, HttpResponse } from "msw";
import { env } from "@shared/config/env";
import type { MemberReviewItem } from "@/renewal/entities/member-review";

// 리뉴얼 회원 상세 > 리뷰 내역용 mock. Figma 디자인의 예시 행을 포함한다.
const PER_PAGE = 20;

const reviews: MemberReviewItem[] = [
  {
    review_id: "RV000004",
    reg_date: "2026-08-01 14:00:00",
    category: "게임",
    product_name: "마블 스파이더맨 2",
    content:
      "농장을 꾸미고 마을 주민들과 이야기를 나누는 시간이 좋았어요. 계절마다 달라지는 풍경도 예쁘고, 매일 조금씩 할 일이 생겨서 오래 즐길 수 있었어요. 다음 업데이트도 기대돼요. 친구에게도 추천하고 싶은 게임이에요.",
    tags: ["추천해요", "디테일이 좋아요", "그래픽이 좋아요"],
    like_cnt: 10,
    report_cnt: 0,
    status_label: "정상",
  },
  {
    review_id: "RV000003",
    reg_date: "2026-07-28 10:12:45",
    category: "게임",
    product_name: "페르소나4 리바이벌",
    content: "",
    tags: ["추천해요", "재밌어요", "스토리가 좋아요"],
    like_cnt: 0,
    report_cnt: 1,
    status_label: "정상",
  },
  {
    review_id: "RV000002",
    reg_date: "2026-07-02 21:03:10",
    category: "기프트카드",
    product_name: "스팀 월렛 코드 50,000원",
    content: "충전이 바로 되어서 편했습니다.",
    tags: ["배송이 빨라요"],
    like_cnt: 3,
    report_cnt: 0,
    status_label: "정상",
  },
];

export const memberReviewHandlers = [
  http.get(`${env.apiBaseUrl}/admin/member/reviews`, ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
    const start = (page - 1) * PER_PAGE;
    return HttpResponse.json({
      items: reviews.slice(start, start + PER_PAGE),
      pagination: {
        current_page: page,
        total_results: reviews.length,
        total_pages: Math.max(1, Math.ceil(reviews.length / PER_PAGE)),
      },
    });
  }),
];
