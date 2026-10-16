import type { PromotionWeekendConfig } from "@entities/promotion-weekend";
import { Breadcrumb } from "@widgets/breadcrumb";
import { PromotionBestSection } from "@widgets/promotion-best-section";
import { PromotionEventSection } from "@widgets/promotion-event-section";
import { PromotionGamesSection } from "@widgets/promotion-games-section";
import { PromotionRecommandSection } from "@widgets/promotion-recommand-section";

import { WeekendAccessGuard } from "./weekend-access-guard";

interface PromotionWeekendScreenProps {
  config: PromotionWeekendConfig;
}

/**
 * 주말특가 프로모션 (legacy `pc/promotion/promotion_weekend.html`). 복합 랜딩, 공개 SSR.
 * W-1(기반): 기간 접근제한 + 배너. 이후 W-2(추천)/W-3(인기)/W-4(이벤트)/W-5(목록) 섹션 추가.
 */
export function PromotionWeekendScreen({ config }: PromotionWeekendScreenProps) {
  const { isActive, allowView, bannerLink, name } = config;
  // legacy: 기간 밖이면 alert(+비관리자 redirect). 관리자(allowView)만 콘텐츠 계속 렌더.
  const showContent = isActive || allowView;

  return (
    <>
      {/* legacy game 목록 카드 그리드 (인기/목록 섹션에서 사용) */}
      <link rel="stylesheet" href="/assets/css/card-list.css" />
      {/* legacy page inline: 섹션 구분자 */}
      <style>{`.b-example-divider{ width:100%; height:50px; }`}</style>

      {/* legacy header.html breadcrumb: 다이렉트 게임즈 > 주말특가 프로모션 (product_type=game, page_title 하드코딩). 기간 무관 항상 렌더. */}
      <Breadcrumb items={[{ label: "주말특가 프로모션" }]} />

      {!isActive && <WeekendAccessGuard allowView={allowView} />}

      {showContent && (
        <div className="container my-3 pb-5 px-0">
          <main id="content" className="content rounded-0">
            {/* 배너 (W-1) */}
            <section className="mb-3">
              <div className="container">
                <a href={bannerLink} title={name}>
                  {/* legacy: 배너 img 하드코딩(U84s2DngyK, banner 필드 무시) — verbatim */}
                  <img src="https://image.directg.net/U84s2DngyK" className="w-100" alt={name} />
                </a>
              </div>
              <div className="b-example-divider"></div>
            </section>

            {/* W-2 DG 추천게임 */}
            <PromotionRecommandSection />

            {/* W-3 프로모션 인기게임 */}
            <PromotionBestSection />

            {/* W-4 진행중인 이벤트 */}
            <PromotionEventSection />

            {/* W-5 프로모션 게임 목록 */}
            <PromotionGamesSection />
          </main>
        </div>
      )}
    </>
  );
}
