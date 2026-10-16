import type { PartnerReportRawItem } from "@entities/partner";

// legacy report_register.php 정산 계산식(PHP 렌더 로직 그대로 재현).
// PHP round(x,0)=상용 반올림 → Math.round. (int)=정수부 truncate → Math.trunc.

export type ReportFees = {
  account: number;
  card: number;
  mobile: number;
};

export type ReportRow = {
  item: PartnerReportRawItem;
  productName: string;
  rate: string; // 표시/전송용(정수 문자열)
  textClass: string; // 환불행 text-danger
  grossInVat: number;
  grossExVat: number;
  paymentFee: number;
  netSales: number;
  revenueShare: number;
};

export type ReportTotals = {
  cc: number;
  grossInVat: number;
  grossExVat: number;
  paymentFee: number;
  netSales: number;
  revenueShare: number;
};

const feeBySettleKind = (settlekind: string, fees: ReportFees): number => {
  switch (settlekind) {
    case "Account":
      return fees.account;
    case "Credit":
      return fees.card;
    case "Mobile":
      return fees.mobile;
    default:
      return 0;
  }
};

// legacy foreach: product_srp<=0 && !=order_srp인 행은 rate/product_name 미할당 →
// 이전 반복 값 유지(PHP 변수 스코프 quirk). prev 추적으로 재현.
export const computeReportRows = (items: PartnerReportRawItem[], fees: ReportFees): ReportRow[] => {
  let prevName = "";
  let prevRate = "";

  return items.map((item) => {
    const fee = feeBySettleKind(item.settlekind, fees);

    const grossInVat = item.sum_settleprice;
    const grossExVat = Math.round(grossInVat / 1.1);
    const paymentFee = Math.round((grossExVat / 100) * fee);
    const netSales = grossExVat - paymentFee;

    let productName = prevName;
    let rate = prevRate;
    if (item.product_srp === item.order_srp) {
      productName = item.product_name_en;
      rate = "0";
    } else if (item.product_srp > 0) {
      rate = String(Math.round(((item.product_srp - item.order_srp) * 100) / item.product_srp));
      productName = `${item.product_name_en}_${rate}`;
    }
    prevName = productName;
    prevRate = rate;

    const textClass = item.status === "9" ? "text-danger" : "";

    let revenueShare: number;
    if (item.product_rs === "0") {
      revenueShare = item.cc * Math.trunc(item.product_ppr) * (1 - Math.trunc(Number(rate)) / 100);
    } else {
      revenueShare = Math.round((netSales / 100) * Number(item.product_rs));
    }

    return {
      item,
      productName,
      rate,
      textClass,
      grossInVat,
      grossExVat,
      paymentFee,
      netSales,
      revenueShare,
    };
  });
};

export const sumReportTotals = (rows: ReportRow[]): ReportTotals =>
  rows.reduce<ReportTotals>(
    (acc, r) => ({
      cc: acc.cc + r.item.cc,
      grossInVat: acc.grossInVat + r.grossInVat,
      grossExVat: acc.grossExVat + r.grossExVat,
      paymentFee: acc.paymentFee + r.paymentFee,
      netSales: acc.netSales + r.netSales,
      revenueShare: acc.revenueShare + r.revenueShare,
    }),
    { cc: 0, grossInVat: 0, grossExVat: 0, paymentFee: 0, netSales: 0, revenueShare: 0 },
  );
