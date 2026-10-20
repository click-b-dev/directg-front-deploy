import type { RequestHandler } from "msw";
import { adminAuthHandlers } from "./handlers/admin-auth";
import { mainBannerHandlers } from "./handlers/main-banner";
import { mainRecommandHandlers } from "./handlers/main-recommand";
import { searchRecommandHandlers } from "./handlers/search-recommand";
import { goodsTitleHandlers } from "./handlers/goods-title";
import { goodsDashboardHandlers } from "./handlers/goods-dashboard";
import { stockDashboardHandlers } from "./handlers/stock-dashboard";
import { assetStockHandlers } from "./handlers/asset-stock";
import { goodsOptionStockHandlers } from "./handlers/goods-option-stock";
import { goodsPromotionStockHandlers } from "./handlers/goods-promotion-stock";
import { assetStockRandomHandlers } from "./handlers/asset-stock-random";
import { genbaAvailabilityLogHandlers } from "./handlers/genba-availability-log";
import { assetHandlers } from "./handlers/asset";
import { titleOptionHandlers } from "./handlers/title-option";
import { goodsOptionHandlers } from "./handlers/goods-option";
import { supplyContentHandlers } from "./handlers/supply-content";
import { koreanPatchHandlers } from "./handlers/korean-patch";
import { gracHandlers } from "./handlers/grac";
import { tagHandlers } from "./handlers/tag";
import { codeHandlers } from "./handlers/code";
import { goodsGroupHandlers } from "./handlers/goods-group";
import { steamHandlers } from "./handlers/steam";
import { ztormHandlers } from "./handlers/ztorm";
import { genbaHandlers } from "./handlers/genba";
import { vaultnHandlers } from "./handlers/vaultn";
import { pointnexusHandlers } from "./handlers/pointnexus";
import { youtubeHandlers } from "./handlers/youtube";
import { noticeHandlers } from "./handlers/notice";
import { faqHandlers } from "./handlers/faq";
import { qnaHandlers } from "./handlers/qna";
import { dataroomHandlers } from "./handlers/dataroom";
import { surveyHandlers } from "./handlers/survey";
import { eventHandlers } from "./handlers/event";
import { promotionHandlers } from "./handlers/promotion";
import { memberDashboardHandlers } from "./handlers/member-dashboard";
import { memberHandlers } from "./handlers/member";
import { memberReviewHandlers } from "@/renewal/mocks/member-review";
import { memberLockHandlers } from "@/renewal/mocks/member-lock";
import { memberApprovalHandlers } from "@/renewal/mocks/member-approval";
import { memberGradeHandlers } from "@/renewal/mocks/member-grade";
import { memberProfileHandlers } from "@/renewal/mocks/member-profile";
import { orderHandlers } from "./handlers/order";
import { orderDashboardHandlers } from "./handlers/order-dashboard";
import { chinaHandlers } from "./handlers/china";
import { partnerHandlers } from "./handlers/partner";
import { statisticsHandlers } from "./handlers/statistics";
import { devImageHandlers } from "./handlers/dev-images";

// 단위 이관마다 해당 단위의 API 계약(docs/migration/admin/*)대로 handler를 추가한다.
export const handlers: RequestHandler[] = [
  ...adminAuthHandlers,
  ...mainBannerHandlers,
  ...mainRecommandHandlers,
  ...searchRecommandHandlers,
  ...goodsTitleHandlers,
  ...goodsDashboardHandlers,
  ...stockDashboardHandlers,
  ...assetStockHandlers,
  ...goodsOptionStockHandlers,
  ...goodsPromotionStockHandlers,
  ...assetStockRandomHandlers,
  ...genbaAvailabilityLogHandlers,
  ...assetHandlers,
  ...titleOptionHandlers,
  ...goodsOptionHandlers,
  ...supplyContentHandlers,
  ...koreanPatchHandlers,
  ...gracHandlers,
  ...tagHandlers,
  ...codeHandlers,
  ...goodsGroupHandlers,
  ...steamHandlers,
  ...ztormHandlers,
  ...genbaHandlers,
  ...vaultnHandlers,
  ...pointnexusHandlers,
  ...youtubeHandlers,
  ...noticeHandlers,
  ...faqHandlers,
  ...qnaHandlers,
  ...dataroomHandlers,
  ...surveyHandlers,
  ...eventHandlers,
  ...promotionHandlers,
  ...memberDashboardHandlers,
  // 리뉴얼 가입 승인 mock은 legacy apply mock보다 먼저 와야 한다.
  ...memberApprovalHandlers,
  ...memberHandlers,
  ...memberReviewHandlers,
  ...memberLockHandlers,
  ...memberGradeHandlers,
  ...memberProfileHandlers,
  ...orderHandlers,
  ...orderDashboardHandlers,
  ...chinaHandlers,
  ...partnerHandlers,
  ...statisticsHandlers,
  ...devImageHandlers,
];
