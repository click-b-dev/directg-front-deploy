import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  useSteamAppList,
  useSyncSteamApp,
  useSyncSteamTag,
  useSyncSteamReview,
  useSyncSteamPackage,
  useDeleteSteamApp,
  useRegisterSteamApp,
  type SteamAppSearch,
  type SteamAppItem,
  type SteamReviewRow,
  type SteamPackageRow,
  type SteamDlcRow,
} from "@entities/steam";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/steam/steam_apps_list";

const APP_TYPES: { value: string; label: string; id: string }[] = [
  { value: "game", label: "Game", id: "game" },
  { value: "dlc", label: "DLC", id: "dlc" },
  { value: "music", label: "Music", id: "music" },
];

// number_format(x/100) — 0 소수(반올림) + 천단위 콤마.
const price100 = (cents: number) => Math.round(cents / 100).toLocaleString();
const pct = (n: number, total: number) => (total > 0 ? Math.round((n * 10000) / total) / 100 : 0);

// legacy steam/steam_apps_list.php — 스팀 Apps 검색(읽기 뷰).
export const SteamAppsListScreen = (search: SteamAppSearch) => {
  const { data } = useSteamAppList(search);
  const register = useRegisterSteamApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalShown, setModalShown] = useState(false);
  const [appids, setAppids] = useState("");

  useEffect(() => {
    if (!modalOpen) {
      return;
    }
    const id = requestAnimationFrame(() => setModalShown(true));
    return () => cancelAnimationFrame(id);
  }, [modalOpen]);

  if (!data) {
    return null;
  }

  const closeModal = () => {
    setModalShown(false);
    setModalOpen(false);
  };
  // legacy btn_app_register: appids 필수 → get_steam_game_info steam_sync → alert + reload.
  const onRegister = () => {
    if (!appids) {
      window.alert("appid를 입력해주세요.");
      return;
    }
    register.mutate(
      { appids },
      {
        onSuccess: (res) => {
          window.alert(res.message);
          closeModal();
          setAppids("");
        },
      },
    );
  };

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
                    스팀 동기화
                  </a>
                </li>
                <li className="breadcrumb-item active">스팀 Apps 검색</li>
              </ol>
            </div>
            <h4 className="page-title">스팀 Apps 검색</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* 스팀 Apps 검색필터 */}
      <div className="row g-2">
        <div className="card">
          <h5 className="card-header bg-secondary text-white">스팀 Apps 검색필터</h5>
          <div className="card-body">
            <form className="form-horizontal" method="get" action={BASE_URL}>
              <div className="row">
                <div className="col-4 mb-2">
                  <div className="row">
                    <label className="col-sm-3 col-form-labe col-form-label-sm bg-light border">
                      스팀 APP TYPE
                    </label>
                    <div className="col-sm-9 mt-1">
                      {APP_TYPES.map((t) => (
                        <div className="form-check form-check-inline" key={t.value}>
                          <input
                            type="radio"
                            id={`search_app_type_${t.id}`}
                            name="search_app_type"
                            className="form-check-input"
                            value={t.value}
                            defaultChecked={search.search_app_type === t.value}
                          />
                          <label className="form-check-label" htmlFor={`search_app_type_${t.id}`}>
                            {t.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="col-2 mb-2">
                  <div className="row">
                    <label
                      htmlFor="search_appid"
                      className="col-sm-5 col-form-labe col-form-label-sm bg-light border"
                    >
                      스팀 APPID
                    </label>
                    <div className="col-sm-7">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        id="search_appid"
                        name="search_appid"
                        placeholder="스팀 APPID"
                        defaultValue={search.search_appid}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-4 mb-2">
                  <div className="row">
                    <label
                      htmlFor="search_name"
                      className="col-sm-3 col-form-labe col-form-label-sm bg-light border"
                    >
                      스팀 상품명
                    </label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        id="search_name"
                        name="search_name"
                        placeholder="스팀 상품명"
                        defaultValue={search.search_name}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-2 mb-2">
                  <div className="row">
                    <label
                      htmlFor="drm_notice"
                      className="col-sm-5 col-form-labe col-form-label-sm bg-light border"
                    >
                      제 3자 DRM
                    </label>
                    <div className="col-sm-7 mt-1">
                      <div className="form-check form-check-inline">
                        <input
                          type="checkbox"
                          id="drm_notice"
                          name="drm_notice"
                          className="form-check-input"
                          value="Y"
                          defaultChecked={search.drm_notice === "Y"}
                        />
                        <label className="form-check-label" htmlFor="drm_notice">
                          있음
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-2 mb-2">
                  <div className="row">
                    <label
                      htmlFor="ext_user_account_notice"
                      className="col-sm-5 col-form-labe col-form-label-sm bg-light border"
                    >
                      타사 계정
                    </label>
                    <div className="col-sm-7 mt-1">
                      <div className="form-check form-check-inline">
                        <input
                          type="checkbox"
                          id="ext_user_account_notice"
                          name="ext_user_account_notice"
                          className="form-check-input"
                          value="Y"
                          defaultChecked={search.ext_user_account_notice === "Y"}
                        />
                        <label className="form-check-label" htmlFor="ext_user_account_notice">
                          있음
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-2 mb-2">
                  <div className="row">
                    <div className="col-lg-12">
                      <div className="float-end">
                        <button type="submit" className="btn btn-primary shadow-none">
                          스팀 Apps 검색
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <button type="button" className="btn btn-primary" onClick={() => setModalOpen(true)}>
        Steam App추가
      </button>

      {modalOpen &&
        createPortal(
          <>
            <div
              className={`modal fade${modalShown ? " show" : ""}`}
              tabIndex={-1}
              role="dialog"
              style={{ display: "block" }}
            >
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header modal-colored-header bg-primary">
                    <h5 className="modal-title">Steam App 등록</h5>
                    <button type="button" className="btn-close" onClick={closeModal} />
                  </div>
                  <div className="modal-body">
                    <div className="mb-2 row ps-3 pe-3">
                      <label htmlFor="appids" className="col-sm-3 col-form-label bg-light">
                        appid
                      </label>
                      <div className="col-sm-9">
                        <input
                          type="text"
                          id="appids"
                          className="form-control"
                          value={appids}
                          onChange={(e) => setAppids(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="mb-2 text-center">
                      <button
                        className="btn btn-primary shadow-none"
                        type="button"
                        disabled={register.isPending}
                        onClick={onRegister}
                      >
                        Steam App 등록
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className={`modal-backdrop fade${modalShown ? " show" : ""}`}
              onClick={closeModal}
            />
          </>,
          document.body,
        )}

      <div className="mb-2">{data.pagination.total_results.toLocaleString()} 개</div>

      <div className="row">
        <div className="col-12">
          <div className="table-responsive">
            <table className="table table-centered nowrap table-sm table-bordered">
              <thead className="table-dark">
                <tr>
                  <th className="text-center" style={{ width: "100px" }}>
                    스팀
                    <br />
                    APPID
                  </th>
                  <th className="text-center" style={{ width: "100px" }}>
                    스팀유형
                  </th>
                  <th className="text-center">스팀 상품명</th>
                  <th className="text-center" style={{ width: "130px" }}>
                    출시일
                  </th>
                  <th className="text-center" style={{ width: "100px" }}>
                    스팀
                    <br />
                    초기가격
                  </th>
                  <th className="text-center" style={{ width: "100px" }}>
                    스팀
                    <br />
                    판매가
                  </th>
                  <th className="text-center" style={{ width: "100px" }}>
                    대표상품코드
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <SteamAppRows key={item.steam_appid} item={item} />
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-center mt-3">
            <ServerPagination
              page={data.pagination.current_page}
              totalPages={data.pagination.total_pages}
              baseUrl={BASE_URL}
              params={{
                search_app_type: search.search_app_type,
                search_appid: search.search_appid,
                search_name: search.search_name,
                drm_notice: search.drm_notice,
                ext_user_account_notice: search.ext_user_account_notice,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

const Badge = ({ children, dark }: { children: React.ReactNode; dark?: boolean }) => (
  <span className={`badge ${dark ? "bg-dark" : "bg-secondary"} font-13 fw-normal`}>
    {children}{" "}
  </span>
);

const SteamAppRows = ({ item }: { item: SteamAppItem }) => {
  const isGame = item.app_type === "game";
  const syncApp = useSyncSteamApp();
  const syncTag = useSyncSteamTag();
  const syncReview = useSyncSteamReview();
  const langs = item.supported_languages
    .replace(/<[^>]*>/g, "")
    .split(",")
    .map((s) => s.trim());

  return (
    <>
      <tr>
        <td className="text-center">{item.steam_appid}</td>
        <td className="text-center">{item.app_type}</td>
        <td>{item.name}</td>
        <td className="text-center">
          {item.coming_soon ? item.coming_soon_date : item.release_date}
        </td>
        <td className="text-end">{price100(item.consumer_price)}</td>
        <td className="text-end">{price100(item.price)}</td>
        <td className="text-center">{item.title_id}</td>
      </tr>
      {!isGame && (
        <tr>
          <th className="text-center bg-light">기본게임</th>
          <td colSpan={6}>
            [{item.basic_game_appid}] {item.basic_game_name}
          </td>
        </tr>
      )}
      <tr>
        <th className="text-center bg-light">개발사</th>
        <td colSpan={6}>{item.developer}</td>
      </tr>
      <tr>
        <th className="text-center bg-light">퍼블리셔</th>
        <td colSpan={6}>{item.publisher}</td>
      </tr>
      <tr>
        <th className="text-center bg-light">제 3자 DRM</th>
        <td colSpan={6}>{item.drm_notice}</td>
      </tr>
      <tr>
        <th className="text-center bg-light">타사 계정</th>
        <td colSpan={6}>{item.ext_user_account_notice}</td>
      </tr>
      <tr>
        <th className="text-center bg-light">동기화일자</th>
        <td colSpan={6}>{item.batch_date}</td>
      </tr>
      <tr>
        <th className="text-center bg-light">한국어지원</th>
        <td colSpan={6}>
          {langs.includes("한국어") && <Badge>인터페이스/자막</Badge>}
          {langs.includes("한국어*") && (
            <>
              <Badge>인터페이스/자막</Badge>
              <Badge>음성</Badge>
            </>
          )}
        </td>
      </tr>
      <tr>
        <th className="text-center bg-light">장르</th>
        <td colSpan={7}>
          {item.genre.split(",").map((g, i) => (
            <Badge key={i}>{g}</Badge>
          ))}
        </td>
      </tr>
      <tr>
        <th className="text-center bg-light">카테고리</th>
        <td colSpan={7}>
          {item.category.split(",").map((c, i) => (
            <Badge key={i}>{c}</Badge>
          ))}
        </td>
      </tr>
      <tr>
        <th className="text-center bg-light">태그(국문)</th>
        <td colSpan={7}>
          {item.tags_ko.map((t) => (
            <Badge dark key={t.code}>
              [{t.code}] {t.name}
            </Badge>
          ))}
        </td>
      </tr>
      <tr>
        <th className="text-center bg-light">리뷰</th>
        <td colSpan={7}>
          <button
            type="button"
            className="btn btn-sm btn-secondary shadow-none"
            onClick={() =>
              syncReview.mutate(
                { appid: item.steam_appid, purchase_type: "all", language: "all" },
                { onSuccess: (r) => window.alert(r.message) },
              )
            }
          >
            구매 평가 동기화
          </button>
        </td>
      </tr>
      <tr>
        <td colSpan={8}>
          <button
            type="button"
            className="btn btn-info btn-sm shadow-none"
            onClick={() =>
              syncApp.mutate(
                { appids: item.steam_appid, title_id: item.title_id },
                { onSuccess: (r) => window.alert(r.message) },
              )
            }
          >
            스팀 동기화
          </button>{" "}
          {/* legacy #69: 장르/카테고리 동기화는 JS 핸들러 미바인딩(no-op) — 그대로 이식 */}
          <button type="button" className="btn btn-sm btn-secondary shadow-none">
            장르 동기화
          </button>{" "}
          <button type="button" className="btn btn-sm btn-secondary shadow-none">
            카테고리 동기화
          </button>{" "}
          <button
            type="button"
            className="btn btn-sm btn-secondary shadow-none"
            onClick={() => syncTag.mutate({ appids: item.steam_appid })}
          >
            TAG 동기화
          </button>
        </td>
      </tr>
      {item.reviews.filter((r) => r.total_reviews > 0).length > 0 && (
        <tr>
          <td colSpan={8}>
            <ReviewTable reviews={item.reviews} />
          </td>
        </tr>
      )}
      {item.packages.length > 0 && (
        <tr>
          <td colSpan={8}>
            <PackageTable packages={item.packages} appid={item.steam_appid} />
          </td>
        </tr>
      )}
      {isGame && item.dlcs.length > 0 && (
        <tr>
          <td colSpan={8}>
            <DlcTable dlcs={item.dlcs} />
          </td>
        </tr>
      )}
    </>
  );
};

const ReviewTable = ({ reviews }: { reviews: SteamReviewRow[] }) => (
  <table className="table table-centered table-sm table-bordered caption-top">
    <caption className="py-1">리뷰 현황</caption>
    <thead className="table-light font-13">
      <tr>
        <th className="text-center">language</th>
        <th className="text-center">purchase_type</th>
        <th className="text-center">review_score</th>
        <th className="text-center">review_score_desc</th>
        <th className="text-center">긍정 리뷰수</th>
        <th className="text-center">부정 리뷰수</th>
        <th className="text-center">전체 리뷰수</th>
      </tr>
    </thead>
    <tbody className="font-12">
      {reviews
        .filter((r) => r.total_reviews > 0)
        .map((r, i) => (
          <tr key={i}>
            <td className="text-center">{r.language}</td>
            <td className="text-center">{r.purchase_type}</td>
            <td className="text-end">{r.review_score}</td>
            <td className="text-center">{r.review_score_desc}</td>
            <td className="text-end">
              {r.total_positive.toLocaleString()}
              <br />({pct(r.total_positive, r.total_reviews)}%)
            </td>
            <td className="text-end">
              {r.total_negative.toLocaleString()}
              <br />({pct(r.total_negative, r.total_reviews)}%)
            </td>
            <td className="text-end">{r.total_reviews.toLocaleString()}</td>
          </tr>
        ))}
    </tbody>
  </table>
);

const PackageTable = ({ packages, appid }: { packages: SteamPackageRow[]; appid: string }) => {
  const syncPackage = useSyncSteamPackage();
  return (
    <table className="table table-centered table-sm table-bordered caption-top">
      <caption className="py-1">Pakcage 현황</caption>
      <thead className="table-light font-13">
        <tr>
          <th className="text-center">번호</th>
          <th className="text-center">packageid</th>
          <th className="text-center">package_name</th>
          <th className="text-center">
            출시여부
            <br />
            (출시일)
          </th>
          <th className="text-center">initial</th>
          <th className="text-center">final</th>
          <th className="text-center">individual</th>
          <th className="text-center">옵션상품코드</th>
          <th className="text-center">비고</th>
        </tr>
      </thead>
      <tbody className="font-12">
        {packages.map((p, i) => (
          <tr key={p.packageid}>
            <td className="text-center">{i + 1}</td>
            <td className="text-center">{p.packageid}</td>
            <td>{p.package_name}</td>
            <td className="text-center">
              {p.package_coming_soon === "1" ? "예약판매" : "일반판매"}
              <br />({p.package_release})
            </td>
            <td className="text-end">{price100(p.price_initial)}</td>
            <td className="text-end">
              {price100(p.price_final)}
              <br />( {p.discount_percent}% )
            </td>
            <td className="text-end">{price100(p.price_individual)}</td>
            <td className="text-center" />
            <td className="text-center">
              {/* legacy: 예약판매(package_coming_soon=1) 아닐 때만 동기화 버튼 */}
              {p.package_coming_soon !== "1" && (
                <button
                  type="button"
                  className="btn btn-sm btn-secondary shadow-none"
                  onClick={() =>
                    syncPackage.mutate(
                      { packageid: p.packageid, appid },
                      { onSuccess: (r) => window.alert(r.message) },
                    )
                  }
                >
                  패키지 정보 동기화
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const DlcTable = ({ dlcs }: { dlcs: SteamDlcRow[] }) => {
  const syncApp = useSyncSteamApp();
  const deleteApp = useDeleteSteamApp();
  let dlcNo = 0;
  return (
    <table className="table table-centered table-sm table-bordered caption-top">
      <caption className="py-1">DLC 현황</caption>
      <thead className="table-light font-13">
        <tr>
          <th className="text-center">번호</th>
          <th className="text-center">appid</th>
          <th className="text-center">app_name</th>
          <th className="text-center">app_type</th>
          <th className="text-center">
            출시여부
            <br />
            (출시일)
          </th>
          <th className="text-center">initial</th>
          <th className="text-center">final</th>
          <th className="text-center">비고</th>
          <th className="text-center">삭제</th>
        </tr>
      </thead>
      <tbody className="font-12">
        {dlcs.map((d) => {
          const no = d.consumer_price > 0 ? String(++dlcNo) : "-";
          const initial =
            d.is_free === "1"
              ? "무료"
              : d.consumer_price > 0
                ? price100(d.consumer_price)
                : d.coming_soon === "1"
                  ? "판매예정"
                  : "판매중지";
          const final = d.is_free === "1" ? "-" : d.price > 0 ? price100(d.price) : "-";
          return (
            <tr key={d.dlc_appid}>
              <td className="text-center">{no}</td>
              <td className="text-center">{d.dlc_appid}</td>
              <td>{d.name}</td>
              <td className="text-center">{d.app_type}</td>
              <td className="text-center">
                {d.coming_soon === "1" ? "출시예정" : "출시"}
                <br />({d.coming_soon === "1" ? d.coming_soon_date : d.release_date})
              </td>
              <td className="text-end">{initial}</td>
              <td className="text-end">{final}</td>
              <td className="text-center">
                {/* legacy: 출시예정(coming_soon=1) 아닐 때만 동기화 */}
                {d.coming_soon !== "1" && (
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary shadow-none"
                    onClick={() =>
                      syncApp.mutate(
                        { appids: d.dlc_appid, mode: "dlc_sync" },
                        { onSuccess: (r) => window.alert(r.message) },
                      )
                    }
                  >
                    DLC 정보 동기화
                  </button>
                )}
              </td>
              <td className="text-center">
                <button
                  type="button"
                  className="btn btn-sm btn-danger shadow-none"
                  onClick={() =>
                    deleteApp.mutate(d.dlc_appid, { onSuccess: (r) => window.alert(r.message) })
                  }
                >
                  삭제
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
