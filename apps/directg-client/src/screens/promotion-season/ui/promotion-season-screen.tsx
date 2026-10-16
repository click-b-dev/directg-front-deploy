import type { PromotionSeasonConfig } from "@entities/promotion-season";
import { PromotionEventSection } from "@widgets/promotion-event-section";
import { SeasonRecommandSection } from "@widgets/season-recommand-section";
import { SeasonBestSection } from "@widgets/season-best-section";
import { SeasonMaxDiscountSection } from "@widgets/season-max-discount-section";
import { SeasonAddRepaySection } from "@widgets/season-add-repay-section";
import { SeasonPricesSection } from "@widgets/season-prices-section";
import { SeasonGamesSection } from "@widgets/season-games-section";

import { SeasonAccessGuard } from "./season-access-guard";

interface PromotionSeasonScreenProps {
  config: PromotionSeasonConfig;
}

/** legacy page inline style (b-example-divider + promotion-notice 배너). */
const SEASON_STYLE = `
.b-example-divider{ width:100%; height:50px; }
.promotion-notice{ padding:0 15px; align-items:center; justify-content:space-between; height:56px; margin-top:15px; margin-bottom:50px; }
.promotion-notice-title{ color:#FFFFFF; font-size:16px; font-weight:400; white-space:nowrap; line-height:37px; }
.promotion-notice-btn{ height:37px; padding-left:15px; padding-right:15px; border-radius:5px; font-size:14px; font-weight:700; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; }
.promotion-notice-btn:hover{ opacity:0.9; }
`;

/**
 * 시즌(대규모) 프로모션 (legacy `pc/promotion/promotion_season.html`). 복합 랜딩, 공개 SSR.
 * S-1(기반): breadcrumb + 기간 접근제한 + 배너/notice. 이후 S-2~S-8 섹션 추가.
 */
export function PromotionSeasonScreen({ config }: PromotionSeasonScreenProps) {
  const { isActive, allowView, name, bannerPc, bannerLink, notice } = config;
  // legacy: 기간 밖이면 alert(+비관리자 redirect). 관리자(allowView)만 콘텐츠 계속 렌더.
  const showContent = isActive || allowView;

  return (
    <>
      {/* legacy game 목록 카드 그리드 (인기/목록 섹션에서 사용) */}
      <link rel="stylesheet" href="/assets/css/card-list.css" />
      <style>{SEASON_STYLE}</style>

      {!isActive && <SeasonAccessGuard allowView={allowView} />}

      {showContent && (
        <>
          {/* breadcrumb */}
          <div className="container mt-3 breadcrumb">
            <div className="font-14">
              <a href="/" className="text-decoration-none">
                다이렉트 게임즈
              </a>{" "}
              &gt;{" "}
              <a
                href="/promotion/promotion_ing_thumb"
                className="text-decoration-none"
                title="할인프로모션"
              >
                할인프로모션
              </a>{" "}
              &gt; {name}
            </div>
          </div>

          <div className="container my-3 pb-5 px-0">
            <main id="content" className="content rounded-0">
              {/* 배너 (S-1) */}
              <section className="mb-3">
                <div className="container">
                  {bannerPc !== "#" && (
                    <a href={bannerLink}>
                      {/* legacy alt에 title 2회 verbatim */}
                      <img src={bannerPc} className="w-100" alt={`${name} ${name}`} />
                    </a>
                  )}

                  {notice.view === "Y" ? (
                    <div className="col-12 border-primary d-flex border-1 border-solid promotion-notice">
                      <div className="promotion-notice-title">{notice.title}</div>
                      <a
                        href={notice.btnUrl}
                        target="_self"
                        className="promotion-notice-btn btn btn-primary"
                      >
                        {notice.btnTitle}
                      </a>
                    </div>
                  ) : (
                    <div className="b-example-divider"></div>
                  )}
                </div>
              </section>

              {/* S-2 DG 추천게임 */}
              <SeasonRecommandSection />

              {/* S-3 프로모션 인기게임 */}
              <SeasonBestSection />

              {/* S-4 진행중인 이벤트 (weekend PromotionEventSection 재사용) */}
              <PromotionEventSection />

              {/* S-5 역대 최대할인 */}
              <SeasonMaxDiscountSection />

              {/* S-6 추가 포인트 적립 */}
              <SeasonAddRepaySection />

              {/* S-7 5천/1만원 미만 게임 */}
              <SeasonPricesSection />

              {/* S-8 프로모션 게임 목록 */}
              <SeasonGamesSection />
            </main>
          </div>
        </>
      )}
    </>
  );
}
