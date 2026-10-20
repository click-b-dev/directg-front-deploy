import type { MemberOrderItem } from "@entities/member";

// Figma 탭(Tab/Line). 혜택 내역은 열 정의가 확정되지 않아 비활성이다.
export type DetailTab = "orders" | "level" | "benefit" | "review";

export const TABS: Array<{ value: DetailTab; label: string; disabled?: boolean }> = [
  { value: "orders", label: "주문 내역" },
  { value: "level", label: "회원 등급 변동" },
  { value: "benefit", label: "혜택 내역", disabled: true },
  { value: "review", label: "리뷰 내역" },
];

export type OrderFilter = "all" | "done" | "cancel";

export const ORDER_FILTERS: Array<{ value: OrderFilter; label: string }> = [
  { value: "all", label: "전체" },
  { value: "done", label: "주문완료" },
  { value: "cancel", label: "주문취소" },
];

// legacy getOrderStatus: 2~6=주문완료(주문완료·배송준비·배송중·배송완료·구매확정), 8=취소요청, 9=취소완료
const DONE_STATUS = new Set([2, 3, 4, 5, 6]);
const CANCEL_STATUS = new Set([8, 9]);

export const filterOrders = (orders: MemberOrderItem[], filter: OrderFilter) => {
  if (filter === "done") return orders.filter((order) => DONE_STATUS.has(order.status));
  if (filter === "cancel") return orders.filter((order) => CANCEL_STATUS.has(order.status));
  return orders;
};

// legacy 생년월일: YYMMDD(6)는 현재 연도(2자리)보다 작으면 2000년대, 아니면 1900년대. 8자리는 YYYYMMDD.
export const formatBirthDay = (birthDay: string) => {
  if (birthDay.length === 8) {
    return `${birthDay.slice(0, 4)}-${birthDay.slice(4, 6)}-${birthDay.slice(6, 8)}`;
  }
  if (birthDay.length === 6) {
    const yy = Number(birthDay.slice(0, 2));
    const year = new Date().getFullYear() % 100 > yy ? 2000 + yy : 1900 + yy;
    return `${year}-${birthDay.slice(2, 4)}-${birthDay.slice(4, 6)}`;
  }
  return "-";
};

export const formatPrice = (value: number) => `${value.toLocaleString("ko-KR")}원`;
