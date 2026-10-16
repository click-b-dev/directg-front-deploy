import { getPromotionWeekendRecommand } from "@entities/promotion-weekend";

import { RecommandCard } from "./recommand-card";

/**
 * 주말특가 W-2 — DG 추천게임 (legacy promotion_weekend.html 135–178).
 * 4열 커스텀 카드(RecommandCard client — hero_capsule + onError 로고 + 할인/가격). 파생은 백엔드.
 */
export async function PromotionRecommandSection() {
  const { list } = await getPromotionWeekendRecommand();

  return (
    <section className="mb-3">
      <div className="container">
        <h2 className="fw-bold">DG 추천게임</h2>

        <div className="row row-col-1 row-cols-md-4 g-3 justify-content-center">
          {list.map((game) => (
            <RecommandCard key={game.sku} game={game} />
          ))}
        </div>
      </div>
      <div className="b-example-divider"></div>
    </section>
  );
}
