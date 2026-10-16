import type { MainRecommand } from "@entities/main-recommand";
import { ProductThumbCard } from "@entities/product-thumb";

/** 추천·특집 섹션 (legacy index.php #recommand). count>0일 때만 렌더. */
export function RecommandSection({ recommendations }: { recommendations: MainRecommand[] }) {
  if (recommendations.length === 0) return null;

  return (
    <section id="recommand" className="mb-2">
      <div className="container">
        <h2 className="fw-bold">추천 및 특집</h2>
        {recommendations.map((recommand) => (
          <div key={recommand.idx}>
            <article className="my-3">
              <div className="row g-0 m-0">
                <div className="col-md-6">
                  <a href={recommand.recommand_banner_link} title={recommand.recommand_name}>
                    <img
                      src={recommand.recommand_banner}
                      className="img-fluid card-shadow"
                      alt={recommand.recommand_name}
                    />
                  </a>
                </div>
                <div className="col-md-6">
                  <div
                    className="d-flex flex-wrap thumb_list justify-content-between"
                    style={{ paddingLeft: "8px" }}
                  >
                    {recommand.recommand_goods.map((product) => (
                      <ProductThumbCard key={product.product_code} product={product} />
                    ))}
                  </div>
                </div>
              </div>
            </article>
            <div className="b-example-divider"></div>
          </div>
        ))}
      </div>
    </section>
  );
}
