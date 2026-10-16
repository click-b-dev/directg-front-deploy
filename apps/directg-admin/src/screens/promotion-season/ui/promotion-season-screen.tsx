import {
  usePromotionSeasonList,
  type PromotionSeasonListSearch,
  type PromotionSeasonListItem,
  type SeasonGoods,
} from "@entities/promotion";
import { ServerPagination, Badge } from "@shared/ui";
import { formatDateTime } from "@shared/lib/datetime";

const BASE_URL = "/promotion/promotion_season";

// legacy: 각 goods를 코드 + 이름 2줄로 렌더.
const GoodsList = ({ goods, className }: { goods: SeasonGoods[]; className?: string }) => (
  <div className={`d-flex flex-column justify-content-start${className ? ` ${className}` : ""}`}>
    {goods.map((item, i) => (
      <div
        key={`${item.product_code}-${i}`}
        className="p-1 border-start border-bottom border-end font-12"
      >
        {item.product_code} <br /> {item.product_name}{" "}
      </div>
    ))}
  </div>
);

// legacy: bg-light 헤더 + goods 목록(추천특집 제외 카테고리 공통).
const CategoryBlock = ({
  title,
  goods,
  listClassName,
}: {
  title: string;
  goods: SeasonGoods[];
  listClassName?: string;
}) => (
  <>
    <div className="d-flex align-items-start align-content-start justify-content-start">
      <div className="align-middle align-self-center flex-fill mb-auto bg-light text-center fw-bold py-2 border">
        {title}
      </div>
    </div>
    <GoodsList goods={goods} className={listClassName} />
  </>
);

// legacy promotion/promotion_season.php — 대규모 프로모션 목록(프로모션당 대형 카드).
export const PromotionSeasonScreen = (search: PromotionSeasonListSearch) => {
  const { data } = usePromotionSeasonList(search);

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
                    프로모션
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    대규모 프로모션 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">대규모 프로모션 목록</li>
              </ol>
            </div>
            <h4 className="page-title">대규모 프로모션 목록</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* 대규모 프로모션 검색필터 */}
      <div className="row g-2">
        <div className="card">
          <h5 className="card-header bg-secondary text-white">대규모 프로모션 검색필터</h5>
          <div className="card-body">
            <form className="form-horizontal" method="get" action={BASE_URL}>
              <div className="row">
                <div className="col-lg-6 mb-2">
                  <div className="input-group row">
                    <select
                      className="form-select col-sm-3"
                      name="search_key"
                      id="search_key"
                      defaultValue={search.search_key}
                    >
                      <option value="search_name">대규모 프로모션 이름</option>
                    </select>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        className="form-control"
                        id="search_value"
                        name="search_value"
                        placeholder="검색어"
                        defaultValue={search.search_value}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-lg-12">
                  <div className="float-end">
                    <button type="submit" className="btn btn-primary shadow-none">
                      검색
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="mb-2">{data.pagination.total_results.toLocaleString()} 개</div>

      <div className="row">
        <div className="col-12">
          {data.items.map((item) => (
            <SeasonCard key={item.idx} item={item} />
          ))}

          <div className="text-center mt-3">
            <ServerPagination
              page={data.pagination.current_page}
              totalPages={data.pagination.total_pages}
              baseUrl={BASE_URL}
              params={{
                search_key: search.search_key,
                search_value: search.search_value,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

const SeasonCard = ({ item }: { item: PromotionSeasonListItem }) => (
  <div className="card mb-4">
    <div className="card-header p-2">
      <div className="float-start">
        <span className="font-16 fw-bold">
          <a href={`/promotion/promotion_season_view?idx=${item.idx}`}>
            {item.promotion_season_name}
          </a>
        </span>
        <span className="ps-2">프로모션 기간</span>:{" "}
        {`${formatDateTime(item.promotion_season_start)} ~ ${formatDateTime(item.promotion_season_end)}`}{" "}
        <Badge variant="secondary">{item.is_view === "Y" ? "노출함" : "노출안함"}</Badge>
      </div>
      <div className="float-end">
        <a
          href={`/promotion/promotion_season_register?mode=modify&idx=${item.idx}`}
          className="action-icon text-secondary"
        >
          {" "}
          <i className="mdi mdi-square-edit-outline font-16" /> 프로모션 수정
        </a>
      </div>
    </div>

    {item.notice_view === "Y" && (
      <div className="card-header p-2">
        <div className="float-start">
          프로모션 공지 &gt;&gt; <span className="font-16 fw-bold">{item.notice_title}</span>
          <a
            href={item.notice_btn_url}
            target="_blank"
            rel="noreferrer"
            className="btn-sm btn-primary ms-2"
          >
            {item.notice_btn_title}
          </a>
        </div>
      </div>
    )}

    <div className="card-body p-0">
      <div className="card mb-0 rounded-0">
        <div className="row g-0">
          {/* PC/모바일 배너 */}
          <div className="col-md-3">
            <div className="card p-2 mb-0">
              <div className="card-header text-center bg-light fw-bold border">PC버전 배너</div>
              <img src={item.promotion_season_banner_pc} className="img-fluid" alt="PC버전 배너" />
            </div>
            <div className="card p-2 mb-0">
              <div className="card-header text-center bg-light fw-bold border">모바일버전 배너</div>
              <img
                src={item.promotion_season_banner_mobile}
                className="img-fluid"
                alt="모바일버전 배너"
              />
            </div>
          </div>

          {/* 추천 및 특집 */}
          <div className="col-md-3">
            <div className="card p-2 mb-0">
              <div className="card-header text-center bg-light fw-bold border">추천 및 특집</div>
              <img
                src={item.promotion_season_recommand_banner}
                className="img-fluid"
                alt="추천 및 특집"
              />
              <GoodsList goods={item.recommand_goods} className="mb-2" />
            </div>
          </div>

          {/* 카테고리 목록 */}
          <div className="col-md-6">
            <div className="row g-1 my-1 mx-1">
              <div className="col-md-4">
                <div className="">
                  <CategoryBlock title="대규모 역대 최대할인" goods={item.max_discount_goods} />
                </div>
                <div className="my-1">
                  <CategoryBlock title="추가 포인트 적립" goods={item.add_repay_goods} />
                </div>
              </div>
              <div className="col-md-4">
                <CategoryBlock title="대규모 인기게임" goods={item.best_goods} />
              </div>
              <div className="col-md-4">
                <CategoryBlock
                  title="대규모 5천원 미만"
                  goods={item.price_5000_goods}
                  listClassName="mb-2"
                />
                <CategoryBlock title="대규모 1만원 미만" goods={item.price_10000_goods} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
