import type { MainRecommand } from "@entities/main-recommand";
import { MobileRecommandCard } from "@entities/product-thumb";

/**
 * 모바일 추천·특집 섹션 (legacy `mobile/index.php` `#recommand_list`, L305~493).
 * `count>0`일 때만 렌더. recommand마다 배너 + goods 카드(**최대 2개** — legacy `loop<2` quirk).
 * splide 아님(정적 col). `getMainRecommendations()` 재사용.
 */
export function MobileRecommandSection({ recommands }: { recommands: MainRecommand[] }) {
  if (recommands.length === 0) return null;

  return (
    <div className="section">
      <div className="section-title py-2 px-0">
        <h2 className="mb-0">추천 및 특집</h2>
      </div>
      <div className="col" id="recommand_list">
        {recommands.map((recommand) => (
          <div key={recommand.idx}>
            <div className="recommand_main_img">
              <a href={recommand.recommand_banner_link} title={recommand.recommand_name}>
                <img
                  src={recommand.recommand_banner}
                  className="img-fluid w-100 card-shadow"
                  alt={recommand.recommand_name}
                />
              </a>
            </div>
            <ul className="list-unstyled d-flex flex-wrap">
              {recommand.recommand_goods.slice(0, 2).map((goods, index) => (
                <MobileRecommandCard key={index} product={goods} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
