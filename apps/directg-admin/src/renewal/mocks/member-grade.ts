import { http, HttpResponse } from "msw";
import { env } from "@shared/config/env";
import type { MemberGrade } from "@/renewal/entities/member-grade";

// 회원 등급 설정 mock — Figma 디자인의 예시 데이터. 삭제는 새로고침 전까지 메모리에 유지한다(흐름 확인용).
let grades: MemberGrade[] = [
  {
    id: "grade-3",
    rank: 3,
    name: "일반회원",
    min_amount: 0,
    max_amount: 5000,
    benefits: [],
  },
  {
    id: "grade-2",
    rank: 2,
    name: "정회원",
    min_amount: 5000,
    max_amount: 200000,
    benefits: [
      {
        kind: "point",
        label: "포인트 적립",
        description: "상품 구매 시 주문 금액의 1% 포인트 적립",
      },
    ],
  },
  {
    id: "grade-1",
    rank: 1,
    name: "VIP",
    min_amount: 200000,
    max_amount: null,
    benefits: [
      {
        kind: "point",
        label: "포인트 적립",
        description: "상품 구매 시 주문 금액의 1% 포인트 적립",
      },
      {
        kind: "coupon",
        label: "할인쿠폰 지급",
        description: "승급 시 1% 할인 쿠폰 지급",
        detail: "최소 주문 금액 : 설정 안 함  |  최대 할인 금액 : 설정 안 함",
      },
      {
        kind: "coupon",
        label: "할인쿠폰 지급",
        description: "등급 산정일마다 1,000원 할인 쿠폰 지급",
        detail: "최소 주문 금액 : 5,000원  |  최대 할인 금액 : 50,000원",
      },
      {
        kind: "discount",
        label: "상시 할인",
        description: "상품 구매 시 주문 금액의 5% 할인",
      },
    ],
  },
];

export const memberGradeHandlers = [
  http.get(`${env.apiBaseUrl}/admin/member/grades`, () =>
    HttpResponse.json({ items: grades, next_calc_date: "2026-10-01" }),
  ),
  http.post(`${env.apiBaseUrl}/admin/member/grades/delete`, async ({ request }) => {
    const { id } = (await request.json()) as { id: string };
    grades = grades.filter((grade) => grade.id !== id);
    return HttpResponse.json({ success: true });
  }),
];
