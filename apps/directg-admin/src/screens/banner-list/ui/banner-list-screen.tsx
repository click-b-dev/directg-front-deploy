import { useEffect } from "react";
import {
  useDeleteMainBanner,
  useMainBannerList,
  useSortMainBanner,
  type BannerFlag,
  type MainBannerListItem,
} from "@entities/main-banner";
import { ServerPagination } from "@shared/ui";
import { formatDateTime } from "@shared/lib/datetime";

type BannerListScreenProps = {
  page: number;
  searchBannerTitle: string;
  searchFlag: BannerFlag | "";
};

const BASE_URL = "/site/banner_list";

// legacy banner_list.php 상태 컬럼 분기 그대로(독립 if — 상호배타).
const StatusCell = ({ banner }: { banner: MainBannerListItem }) => {
  const now = Math.floor(Date.now() / 1000);

  if (banner.bannerPeriodOutputFl === "N") {
    return banner.flag === "Y" ? (
      <span className="badge bg-success font-12">게시중</span>
    ) : (
      <span className="badge bg-secondary font-12">게시종료</span>
    );
  }

  return (
    <>
      {banner.banner_start - now > 0 && <>게시예정</>}
      {banner.banner_start < now && banner.banner_end > now && (
        <span className="badge bg-success font-12">게시중</span>
      )}
      {banner.banner_end < now && <span className="badge bg-secondary font-12">게시종료</span>}
    </>
  );
};

const PeriodCell = ({ banner }: { banner: MainBannerListItem }) => {
  if (banner.bannerPeriodOutputFl === "N") {
    return <span className="badge bg-secondary font-12">상시노출</span>;
  }
  return (
    <>
      <span className="badge bg-secondary font-12 mb-2">기간노출</span>
      <br />
      {formatDateTime(banner.banner_start)} ~ {formatDateTime(banner.banner_end)}
    </>
  );
};

export const BannerListScreen = ({
  page,
  searchBannerTitle,
  searchFlag,
}: BannerListScreenProps) => {
  useEffect(() => {
    // legacy admin_head.php <title> = $page_title
    document.title = "메인배너 관리";
  }, []);

  const { data } = useMainBannerList({
    page,
    search_banner_title: searchBannerTitle,
    search_flag: searchFlag,
  });
  const sortMutation = useSortMainBanner();
  const deleteMutation = useDeleteMainBanner();

  const items = data?.items ?? [];
  const totalResults = data?.pagination.total_results ?? 0;
  const totalPages = data?.pagination.total_pages ?? 0;

  const handleSort = (idx: number, direction: "up" | "down") => {
    sortMutation.mutate({ idx, direction });
  };

  const handleDelete = (idx: number) => {
    // legacy: confirm("해당 배너를 삭제하시겠습니까?")
    if (window.confirm("해당 배너를 삭제하시겠습니까?")) {
      deleteMutation.mutate(idx);
    }
  };

  return (
    <>
      {/* start page title */}
      <div className="row">
        <div className="col-12">
          <div className="page-title-box">
            <div className="page-title-right">
              <ol className="breadcrumb m-0">
                {/* legacy: href="javascript: void(0);" (비동작 링크) → 코드베이스 관례(topbar)대로 preventDefault */}
                <li className="breadcrumb-item">
                  <a href="#" onClick={(event) => event.preventDefault()}>
                    홈
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(event) => event.preventDefault()}>
                    사이트
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(event) => event.preventDefault()}>
                    배너 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">메인배너 관리</li>
              </ol>
            </div>
            <h4 className="page-title">메인배너 관리</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* 검색필터 (legacy: form method=get → 네이티브 전체 이동) */}
      <div className="row g-2">
        <div className="card">
          <h5 className="card-header bg-secondary text-white">검색필터</h5>
          <div className="card-body">
            <form className="form-horizontal" method="get" action={BASE_URL}>
              <div className="row mb-2">
                <div className="col-lg-6">
                  <div className="row">
                    <label
                      htmlFor="search_banner_title"
                      className="col-sm-3 col-form-label bg-light border"
                    >
                      배너 제목
                    </label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        className="form-control"
                        id="search_banner_title"
                        name="search_banner_title"
                        placeholder="배너 제목 검색"
                        defaultValue={searchBannerTitle}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="row">
                    <label
                      htmlFor="search_flag"
                      className="col-sm-3 col-form-label bg-light border"
                    >
                      노출 여부
                    </label>
                    <div className="col-sm-9">
                      <div className="form-check form-check-inline mt-1">
                        <input
                          type="radio"
                          id="search_flag_y"
                          name="search_flag"
                          className="form-check-input"
                          value="Y"
                          defaultChecked={searchFlag === "Y"}
                        />
                        <label className="form-check-label" htmlFor="search_flag_y">
                          예
                        </label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input
                          type="radio"
                          id="search_flag_n"
                          name="search_flag"
                          className="form-check-input"
                          value="N"
                          defaultChecked={searchFlag === "N"}
                        />
                        <label className="form-check-label" htmlFor="search_flag_n">
                          아니오
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-2">
                  <div className="float-end">
                    <button type="submit" className="btn btn-primary shadow-none">
                      메인배너 검색
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="d-flex flex-row justify-content-between mb-2">
        <div className="float-start">{totalResults.toLocaleString()} 개</div>
        <div className="float-end">
          <div className="float-end">
            <a href="/site/banner_register" className="btn btn-danger shadow-none">
              메인배너 등록
            </a>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="table-responsive">
            <table className="table table-centered w-100  nowrap table-sm table-bordered border-light">
              <colgroup>
                <col width="6%" />
                <col width="16%" />
                <col width="*" />
                <col width="15%" />
                <col width="17%" />
                <col width="6%" />
                <col width="6%" />
                <col width="8%" />
              </colgroup>
              <thead className="table-light font-13">
                <tr>
                  <th className="text-center">순서</th>
                  <th className="text-center">배너 이미지</th>
                  <th className="text-center">배너 제목</th>
                  <th className="text-center">배너 퍼블리셔</th>
                  <th className="text-center">기간</th>
                  <th className="text-center">상태</th>
                  <th className="text-center">노출여부</th>
                  <th className="text-center">관리</th>
                </tr>
              </thead>
              <tbody className="bg-white font-12">
                {items.map((banner) => (
                  <tr key={banner.idx}>
                    <td className="text-center">
                      <div className="d-flex flex-row align-items-center justify-content-center">
                        <div className="me-2">{banner.banner_sort}</div>
                        <div className="d-flex flex-column">
                          <button
                            type="button"
                            className="btn btn-sm p-0 btn_sort_up"
                            data-idx={banner.idx}
                            onClick={() => handleSort(banner.idx, "up")}
                          >
                            <i className="mdi mdi-chevron-up-box mdi-24px" />
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm p-0 btn_sort_down"
                            data-idx={banner.idx}
                            onClick={() => handleSort(banner.idx, "down")}
                          >
                            <i className="mdi mdi-chevron-down-box mdi-24px" />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="p-1">
                      <a href={banner.banner_link} target="_blank" rel="noreferrer">
                        <img
                          src={banner.banner_pc}
                          alt={`${banner.banner_title} 배너 이미지`}
                          className="img-fluid"
                        />
                      </a>
                    </td>
                    <td>
                      {banner.banner_title}({banner.product_code})<br />
                      pc 배너 url: {banner.banner_pc}
                      <br />
                      모바일 배너 url: {banner.banner_mobile}
                      <br />
                    </td>
                    <td className="text-center">{banner.banner_publisher}</td>
                    <td className="text-center px-1">
                      <PeriodCell banner={banner} />
                    </td>
                    <td className="text-center">
                      <StatusCell banner={banner} />
                    </td>
                    <td className="text-center">{banner.flag}</td>
                    <td className="text-center">
                      <a
                        href={`/site/banner_modify?idx=${banner.idx}`}
                        className="btn btn-info btn-sm shadow-none"
                      >
                        수정
                      </a>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm shadow-none btn_delete"
                        data-idx={banner.idx}
                        onClick={() => handleDelete(banner.idx)}
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center mt-3">
            <ServerPagination
              page={page}
              totalPages={totalPages}
              baseUrl={BASE_URL}
              params={{ search_banner_title: searchBannerTitle, search_flag: searchFlag }}
            />
          </div>
        </div>
        {/* end col */}
      </div>
      {/* end row */}
    </>
  );
};
