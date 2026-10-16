/**
 * settle_kind → PG 매핑 (legacy `pc/order/settle.html` switch, L57~116).
 * pay_method/site_cd 등은 legacy client-visible 상수. settle_no = prefix + getSettleNo(백엔드 시퀀스).
 */
export interface SettleKindMapping {
  label: string;
  pg_provider: string;
  /** settle_no 접두(N/P/K/T). 미일치 시 빈값 → DG0000 fallback. */
  prefix: string;
  pay_method?: string;
  site_cd?: string;
  /** "Y" | "N" (escrow). */
  escw_used?: string;
  deli_term?: string;
}

export function getSettleKindMapping(settleKind: string): SettleKindMapping {
  switch (settleKind) {
    case "naverpay":
      return { label: "네이버페이", pg_provider: "naverpay", prefix: "N" };
    case "payco":
      return { label: "페이코", pg_provider: "payco", prefix: "P" };
    case "SC0010":
      return {
        label: "신용/체크카드 결제",
        pg_provider: "kcp",
        prefix: "K",
        pay_method: "100000000000",
        site_cd: "AKPV0",
        escw_used: "N",
      };
    case "SC0030":
      return {
        label: "실시간계좌이체 결제",
        pg_provider: "kcp",
        prefix: "K",
        pay_method: "010000000000",
        site_cd: "AKPV0",
        escw_used: "Y",
        deli_term: "3",
      };
    case "SC0040":
      return {
        label: "가상계좌(무통장입금) 결제",
        pg_provider: "kcp",
        prefix: "K",
        pay_method: "001000000000",
        site_cd: "AKPV0",
        escw_used: "Y",
      };
    case "SC0060":
      return {
        label: "휴대폰 결제",
        pg_provider: "kcp",
        prefix: "K",
        pay_method: "000010000000",
        site_cd: "AKPV0",
        escw_used: "N",
      };
    case "toss_bank":
      return {
        label: "퀵계좌이체 결제",
        pg_provider: "toss",
        prefix: "T",
        pay_method: "010000000000",
        site_cd: "directg",
        escw_used: "Y",
        deli_term: "3",
      };
    case "toss":
      return { label: "일반결제", pg_provider: "toss", prefix: "T", site_cd: "directg" };
    default:
      return { label: "", pg_provider: "", prefix: "" };
  }
}

/** KCP good_info 항목 문자열 (legacy chr(31)/chr(30) 조립). */
export function buildKcpGoodInfo(
  items: { product_name: string; price: number }[],
  settleNo: string,
): string {
  const US = String.fromCharCode(31);
  const RS = String.fromCharCode(30);
  return items
    .map((it, k) =>
      [
        `seq=${k + 1}`,
        `ordr_numb=${settleNo}_${k + 1}`,
        `good_name=${it.product_name}`,
        `good_cntx=1`,
        `good_amtx=${it.price}`,
      ].join(US),
    )
    .join(RS);
}
