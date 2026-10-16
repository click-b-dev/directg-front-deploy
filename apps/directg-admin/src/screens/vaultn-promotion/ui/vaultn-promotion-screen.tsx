import { useVaultnPromotionList, type VaultnPromotionRow } from "@entities/vaultn";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/goods/vaultn/vaultn_promotion";
// legacy 번호 오프셋: 뷰가 (page-1)*30 하드코딩(페이지 크기는 50) — legacy 버그 그대로 이식.
const NUM_OFFSET_STEP = 30;

const fmt0 = (v: number) => Math.round(v).toLocaleString();
const fmt2 = (v: number) =>
  v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// legacy vaultn_promotion.php — Vaultn 프로모션 현황(DB, 50/page).
export const VaultnPromotionScreen = ({ page }: { page: number }) => {
  const { data } = useVaultnPromotionList(page);
  if (!data) {
    return null;
  }

  const { total_results, current_page, total_pages } = data.pagination;

  return (
    <>
      {/* start page title */}
      <div className="row">
        <div className="col-12">
          <div className="page-title-box">
            <div className="page-title-right">
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    홈
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    상품
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    Vaultn 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">Valutn 프로모션 현황</li>
              </ol>
            </div>
            <h4 className="page-title">Valutn 프로모션 현황</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-12">
          <div className="d-flex flex-row justify-content-between mb-2">
            <div className="float-start">{total_results.toLocaleString()} 개</div>
          </div>
          <div className="card">
            <h5 className="card-header bg-secondary text-white">Vaultn Product</h5>
            <div className="table-responsive">
              <table className="table table-centered w-100 dt-responsive nowrap table-sm table-bordered">
                <thead className="table-light font-13">
                  <tr>
                    <th className="text-center">No</th>
                    <th className="text-center">promotion name</th>
                    <th className="text-center">validFrom</th>
                    <th className="text-center">validTo</th>
                    <th className="text-center">
                      product
                      <br />
                      (sku)
                    </th>
                    <th className="text-center">discountPercentage</th>
                    <th className="text-center">
                      discountSrp
                      <br />
                      (Srp)
                    </th>
                    <th className="text-center">
                      discountPurchasePrice
                      <br />
                      (purchasePrice)
                    </th>
                    <th className="text-center">비고</th>
                  </tr>
                </thead>
                <tbody className="font-12">
                  {data.items.map((item, index) => (
                    <PromotionRow
                      key={`${item.sku}-${index}`}
                      item={item}
                      num={total_results - (index + (current_page - 1) * NUM_OFFSET_STEP)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-center mt-3">
              <ServerPagination page={current_page} totalPages={total_pages} baseUrl={BASE_URL} />
            </div>
          </div>
          {/* end card */}
        </div>
        {/* end col */}
      </div>
    </>
  );
};

const PromotionRow = ({ item, num }: { item: VaultnPromotionRow; num: number }) => (
  <tr>
    <td className="text-center">{num}</td>
    <td>{item.title}</td>
    <td className="text-center">{item.validFrom}</td>
    <td className="text-center">{item.validTo}</td>
    <td className="text-start">
      {item.product_name}
      <br />({item.sku})
    </td>
    <td className="text-center">{item.discountPercentage}</td>
    <td className="text-end">
      {fmt0(item.srp * (1 - item.discountPercentage / 100))}
      <br />({item.srp.toLocaleString()})
    </td>
    <td className="text-end">
      {fmt2(item.purchasePrice * (1 - item.discountPercentage / 100))}
      <br />({fmt2(item.purchasePrice)})
    </td>
    <td className="text-center">
      {item.reg_date}
      <br />({item.update_date})
    </td>
  </tr>
);
