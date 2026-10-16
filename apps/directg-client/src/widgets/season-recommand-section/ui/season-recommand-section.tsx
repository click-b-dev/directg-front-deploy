import { getPromotionSeasonRecommand } from "@entities/promotion-season/api/get-promotion-season-recommand";
import { RecommandCard } from "@widgets/promotion-recommand-section";

/**
 * 시즌 S-2 — DG 추천게임 (legacy promotion_season.html 209–258). weekend W-2와 동일 마크업.
 * 4열 커스텀 카드(RecommandCard 재사용). 데이터만 season.
 */
export async function SeasonRecommandSection() {
  const { list } = await getPromotionSeasonRecommand();

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
