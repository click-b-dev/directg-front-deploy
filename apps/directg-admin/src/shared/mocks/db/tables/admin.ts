import { createTable } from "../table";

// legacy tbl_admin(dgkr) 도출 — docs/migration/admin/auth/login.md 계약 기준.
// FSD: shared 레이어이므로 entities의 계약 타입을 import하지 않고 여기서 자체 정의한다.
export type AdminRow = {
  admin_id: string;
  admin_pwd: string;
  admin_name: string;
  admin_level: string;
  /** 승인 상태. "y" = 승인, "n" = 미승인 */
  status: "y" | "n";
};

// 대표 시드 — legacy 로그인 분기(승인/미승인/권한레벨)를 재현하기 위한 최소 집합.
const seed: readonly AdminRow[] = [
  {
    admin_id: "admin@directg.net",
    admin_pwd: "1234",
    admin_name: "운영자",
    admin_level: "99",
    status: "y",
  },
  {
    admin_id: "viewer@directg.net",
    admin_pwd: "1234",
    admin_name: "상품뷰어",
    admin_level: "1",
    status: "y",
  },
  {
    admin_id: "pending@directg.net",
    admin_pwd: "1234",
    admin_name: "미승인",
    admin_level: "9",
    status: "n",
  },
];

export const adminTable = createTable(seed);
