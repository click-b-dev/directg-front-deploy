import {
  useZtormPromotion,
  useSyncZtormPromotion,
  type ZtormPromotionSearch,
  type ZtormPromotionItem,
} from "@entities/ztorm";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/goods/ztorm/ztorm_promotion";

// number_format 0 소수(반올림) + 천단위 콤마.
const won = (n: number) => Math.round(n).toLocaleString();

// legacy ztorm_promotion.php — Ztorm 프로모션 현황.
export const ZtormPromotionScreen = (search: ZtormPromotionSearch) => {
  const { data } = useZtormPromotion(search);
  const syncPromotion = useSyncZtormPromotion();
  if (!data) {
    return null;
  }

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
                    Ztorm API
                  </a>
                </li>
                <li className="breadcrumb-item active">Ztorm 프로모션 현황</li>
              </ol>
            </div>
            <h4 className="page-title">Ztorm 프로모션 현황</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row mb-2">
        <div className="col-12">
          <div className="float-start">{data.pagination.total_results.toLocaleString()} 개</div>
          <div className="float-end">
            {/* legacy: 성공 시 reload만(alert 없음) */}
            <button
              type="button"
              className="btn btn-sm btn-primary shadow-none"
              disabled={syncPromotion.isPending}
              onClick={() => syncPromotion.mutate()}
            >
              Ztorm 캠페인 동기화
            </button>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <table className="table table-centered w-100 nowrap table-sm table-bordered border-light">
            <thead className="table-light font-13">
              <tr>
                <th className="text-center">옵션상품코드</th>
                <th className="text-center">옵션상품명</th>
                <th className="text-center">Item ID</th>
                <th className="text-center">Item Name</th>
                <th className="text-center">공급처</th>
                <th className="text-center">SRP</th>
                <th className="text-center">Discount</th>
                <th className="text-center">Discount SRP</th>
                <th className="text-center">시작일</th>
                <th className="text-center">종료일</th>
              </tr>
            </thead>
            <tbody className="font-12 bg-white">
              {data.items.map((item) => (
                <ZtormPromotionRow key={`${item.product_code}-${item.item_id}`} item={item} />
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-center mt-3">
          <ServerPagination
            page={data.pagination.current_page}
            totalPages={data.pagination.total_pages}
            baseUrl={BASE_URL}
            params={{}}
          />
        </div>
      </div>
    </>
  );
};

const ZtormPromotionRow = ({ item }: { item: ZtormPromotionItem }) => (
  <tr>
    <td className="text-center">{item.product_code}</td>
    <td className="text-start">{item.product_name}</td>
    <td className="text-center">{item.item_id}</td>
    <td className="text-start">{item.item_name}</td>
    <td className="text-start">{item.item_publisher}</td>
    <td className="text-end">{won(item.product_srp)}</td>
    <td className="text-center">{item.percent}%</td>
    <td className="text-end">{won(item.product_srp * (1 - item.percent / 100))}</td>
    <td className="text-center">{item.promotion_start}</td>
    <td className="text-center">{item.promotion_end}</td>
  </tr>
);
