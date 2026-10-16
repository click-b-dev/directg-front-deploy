import { useEffect, useState, type FormEvent } from "react";
import {
  useAddPackageItem,
  useDeleteDeliveryItem,
  useDeletePackageItem,
  useOptionView,
  type GoodsOptionView,
  type OptionPackageItem,
} from "@entities/goods-option";
import { OptionSubNav } from "@widgets/option-sub-nav";

type GoodsOptionViewScreenProps = { productCode: string };

// legacy goods/goods_option_view.php — 옵션상품 상세보기(읽기전용 종합 + 인라인 편집).
export const GoodsOptionViewScreen = ({ productCode }: GoodsOptionViewScreenProps) => {
  const { data } = useOptionView(productCode);

  useEffect(() => {
    document.title = "옵션상품 상세보기";
  }, []);

  if (!data) {
    return null;
  }
  return <OptionView data={data} />;
};

const PLATFORM_NAME: Record<string, string> = {
  "1": "Steam",
  "3": "Origin",
  "34": "Epic",
  "30": "Ubisoft Connect",
  "33": "Bethesda",
  "35": "Rockstar Games Launcher",
  "32": "기타",
};
const DELIVERY_TYPE_NAME: Record<string, string> = {
  "1": "코드발송",
  "2": "택배발송",
  "3": "코드 + 택배발송",
};
const ORDER_SYSTEM_NAME: Record<string, string> = {
  "1": "Asset API",
  "2": "Ztorm API",
  "8": "Vaultn API",
  "9": "Genba API",
  "10": "PointNexus API",
};
// legacy getProductStatus 뱃지.
const STATUS_BADGE: Record<string, { cls: string; label: string }> = {
  "0": { cls: "badge-primary-lighten", label: "판매중" },
  "1": { cls: "badge-warning-lighten", label: "판매중지" },
  "3": { cls: "badge-danger-lighten", label: "판매종료" },
  "9": { cls: "badge-secondary-lighten", label: "승인대기" },
};

const won = (v: number) => `${new Intl.NumberFormat("ko-KR").format(v)} 원`;

const OptionView = ({ data }: { data: GoodsOptionView }) => {
  const o = data.option;
  const [mainShot, setMainShot] = useState(data.screenshots[0]?.url ?? "");
  const deleteDelivery = useDeleteDeliveryItem(o.product_code);
  const deletePackage = useDeletePackageItem(o.product_code);
  const addPackage = useAddPackageItem(o.product_code);
  const status = STATUS_BADGE[o.status];

  const handleAddPackage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const item_name = String(fd.get("add_item_name") ?? "");
    if (item_name === "") {
      alert("패키지명(국문)을 입력하세요.");
      return;
    }
    addPackage.mutate({
      appid: String(fd.get("add_appid") ?? ""),
      item_type: String(fd.get("add_item_type") ?? ""),
      item_name,
    });
  };

  const packageTotal = data.package_items.reduce((sum, p) => sum + p.app_price, 0);

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
                    옵션상품 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">옵션상품 상세보기</li>
              </ol>
            </div>
            <h4 className="page-title">
              {o.product_name}({o.product_name_en})
            </h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-2 mb-2 mb-sm-0">
          <OptionSubNav productCode={o.product_code} active="view" gameType={o.game_type} />
        </div>
        <div className="col-10">
          <div className="row">
            <div className="col-12">
              <div className="row g-1">
                {/* 좌측 col-8 */}
                <div className="col-8">
                  {/* 기본정보 */}
                  <div className="card">
                    <h5 className="card-header bg-secondary text-white">옵션상품 기본정보</h5>
                    <div className="card-body p-2">
                      <table className="table table-sm table-bordered border-secondary table-centered mb-0">
                        <colgroup>
                          <col width="20%" />
                          <col width="*" />
                        </colgroup>
                        <tbody className="font-13">
                          <InfoRow label="옵션상품 코드" value={o.product_code} />
                          <InfoRow label="옵션상품 SKU" value={o.goods_sku} />
                          <InfoRow label="옵션상품명(국문)" value={o.product_name} />
                          <InfoRow label="옵션상품명(영문)" value={o.product_name_en} />
                          <InfoRow label="실물상품 모델코드" value={o.model_code} />
                          <InfoRow label="실물상품 모델명" value={o.model_name} />
                          <tr>
                            <th className="bg-light">옵션상품 플랫폼</th>
                            <td>
                              <span className="badge bg-dark font-12 fw-normal">
                                {PLATFORM_NAME[o.product_platform] ?? ""}
                              </span>
                            </td>
                          </tr>
                          {data.genres.length > 0 && (
                            <tr>
                              <th className="bg-light">옵션상품 장르</th>
                              <td>
                                {data.genres.map((g) => (
                                  <span
                                    key={g.code}
                                    className="badge badge-dark-lighten font-12 me-2"
                                  >
                                    {g.name}
                                  </span>
                                ))}
                              </td>
                            </tr>
                          )}
                          {data.categories.length > 0 && (
                            <tr>
                              <th className="bg-light">옵션상품 카테고리</th>
                              <td>
                                {data.categories.map((c) => (
                                  <span
                                    key={c.code}
                                    className="badge badge-dark-lighten font-12 me-2"
                                  >
                                    {c.name}
                                  </span>
                                ))}
                              </td>
                            </tr>
                          )}
                          <InfoRow label="옵션상품 출시일" value={o.release_date} />
                          <InfoRow label="옵션상품 유형" value={o.option_type} />
                          <InfoRow label="옵션상품 구분" value={o.game_type} />
                          <tr>
                            <th className="bg-light">배송방법</th>
                            <td>
                              <span className="badge badge-success-lighten font-12">
                                {DELIVERY_TYPE_NAME[o.delivery_type] ?? ""}
                              </span>
                            </td>
                          </tr>
                          {o.option_type !== "retail" && (
                            <InfoRow label="진열그룹" value={o.display_type} />
                          )}
                          <tr>
                            <th className="bg-light">한국어지원</th>
                            <td>
                              {o.spoken_korean === "Y" && (
                                <span className="badge bg-secondary font-11 fw-normal">
                                  음성 한국어
                                </span>
                              )}{" "}
                              {o.interface_korean === "Y" && (
                                <span className="badge bg-secondary font-11 fw-normal">
                                  인터페이스/자막 한글
                                </span>
                              )}{" "}
                              {o.exclusive_korean === "Y" && (
                                <span className="badge bg-secondary font-11 fw-normal">
                                  독점 한국어
                                </span>
                              )}
                            </td>
                          </tr>
                          <InfoRow label="진열상태" value={o.is_view} />
                        </tbody>
                      </table>
                    </div>
                    <div className="card-footer">
                      <div className="float-end">
                        <a
                          href={`/goods/goods_option_modify?product_code=${o.product_code}`}
                          className="btn btn-sm btn-primary shadow-none"
                        >
                          기본정보 설정
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* 대표상품 정보 */}
                  <div className="card">
                    <h5 className="card-header bg-secondary text-white">대표상품 정보</h5>
                    <div className="card-body p-2">
                      <div className="card mb-2">
                        <div className="row g-0 align-items-center">
                          <div className="col-md-4">
                            <img
                              src={`/upload/title/${data.title_info.title_id}/header/${data.title_info.title_id}.jpg`}
                              className="img-fluid"
                              alt="..."
                            />
                          </div>
                          <div className="col-md-8">
                            <div className="card-body p-0 ps-2">
                              <h5 className="card-title font-14 mb-2">
                                {data.title_info.title_name}
                              </h5>
                              <p className="card-text mb-1">
                                <small className="text-muted">
                                  {data.title_info.title_name_en}
                                </small>
                              </p>
                              <p className="card-text">
                                <span className="badge bg-info text-white font-11 fw-normal">
                                  {data.title_info.publisher}
                                </span>{" "}
                                <span className="badge bg-dark font-11 fw-normal">
                                  {data.title_info.release_date}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 스크린샷 */}
                  <div className="card">
                    <h5 className="card-header bg-secondary text-white">옵션상품 스크린샷</h5>
                    <div className="card-body p-2">
                      {mainShot && (
                        <div className="d-block mb-3 text-center">
                          <img
                            src={`${mainShot}?t=1`}
                            className="img-fluid"
                            style={{ maxWidth: 812 }}
                            alt="스크린샷"
                            id="screenshot"
                          />
                        </div>
                      )}
                      <div id="screenshot_thumbnail">
                        <div className="d-flex flex-row justify-content-start flex-nowrap mb-2">
                          {data.screenshots.map((shot) => (
                            <div className="text-center me-2" key={shot.idx}>
                              <div className="d-flex flex-column">
                                <a href="#" onClick={(e) => e.preventDefault()}>
                                  <img
                                    src={shot.thumbnail}
                                    className="img-fluid img-thumbnail p-0 thumbnail_list"
                                    style={{ maxWidth: 120 }}
                                    alt="스크린샷 썸네일"
                                    data-url={shot.url}
                                    onClick={() => setMainShot(shot.url)}
                                  />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 설명 */}
                  <div className="card">
                    <h5 className="card-header bg-secondary text-white">옵션상품 설명</h5>
                    <div className="card-body font-13">
                      <div
                        className="description"
                        dangerouslySetInnerHTML={{ __html: data.description_html }}
                      />
                    </div>
                  </div>

                  {/* 시스템 요구사항 */}
                  <div className="card">
                    <h5 className="card-header bg-secondary text-white">
                      옵션상품 시스템 요구사항
                    </h5>
                    <div
                      className="card-body font-13"
                      dangerouslySetInnerHTML={{ __html: data.requirements_html }}
                    />
                  </div>
                </div>

                {/* 우측 col-4 */}
                <div className="col-4">
                  {/* 이미지정보 */}
                  <div className="card">
                    <h5 className="card-header bg-secondary text-white">옵션상품 이미지정보</h5>
                    <div className="card-body p-2">
                      {o.game_type !== "bundle" && o.bundle_type !== "4" && (
                        <table className="table table-sm table-bordered border-secondary table-centered mb-0">
                          <colgroup>
                            <col width="30%" />
                            <col width="*" />
                          </colgroup>
                          <tbody className="font-13">
                            <InfoRow label="이미지도메인" value={o.domain} />
                            <tr>
                              <td colSpan={2} className="text-center p-0">
                                <img
                                  src={`/upload/product/${o.product_code}/header/header.jpg`}
                                  className="img-fluid"
                                  alt="header"
                                />
                              </td>
                            </tr>
                            <tr>
                              <td colSpan={2} className="text-start">
                                {data.short_description}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>

                  {/* 판매정보 */}
                  <div className="card">
                    <h5 className="card-header bg-secondary text-white">옵션상품 판매정보</h5>
                    <div className="card-body p-2">
                      <table className="table table-sm table-bordered border-secondary table-centered mb-0">
                        <colgroup>
                          <col width="30%" />
                          <col width="*" />
                        </colgroup>
                        <tbody className="font-13">
                          <tr>
                            <th className="bg-light">판매상태</th>
                            <td>
                              {status && (
                                <span className={`badge ${status.cls} font-12`}>
                                  {status.label}
                                </span>
                              )}
                            </td>
                          </tr>
                          <InfoRow label="구매제한여부" value={o.purchase_limit_yn} />
                          <tr>
                            <th className="bg-light">구매제한수량</th>
                            <td>계정당 최대 {o.purchase_limit}개</td>
                          </tr>
                          <InfoRow label="품절여부" value={o.is_stock} />
                          <InfoRow label="판매가능수량" value={String(o.item_stock)} />
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 가격정보 */}
                  <div className="card">
                    <h5 className="card-header bg-secondary text-white">옵션상품 가격정보</h5>
                    <div className="card-body p-1">
                      <table className="table table-sm table-bordered border-secondary table-centered mb-0">
                        <colgroup>
                          <col width="30%" />
                          <col width="*" />
                        </colgroup>
                        <tbody className="font-13">
                          <InfoRow label="DGKR 소비자가" value={won(o.consumer_price)} />
                          <InfoRow label="DGKR 판매가" value={won(o.price)} />
                          <tr>
                            <th className="bg-light">DGKR 할인률</th>
                            <td>
                              <span className="text-danger mdi mdi-arrow-down-bold" />{" "}
                              <span className="text-danger">
                                {new Intl.NumberFormat("ko-KR").format(o.discount)} %
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 공급처 정보 */}
                  <div className="card">
                    <h5 className="card-header bg-secondary text-white">옵션상품 공급처정보</h5>
                    <div className="card-body p-1">
                      <table className="table table-sm table-bordered border-secondary table-centered mb-0">
                        <colgroup>
                          <col width="30%" />
                          <col width="*" />
                        </colgroup>
                        <tbody className="font-13">
                          <InfoRow label="공급처" value={o.supplier_code} />
                          <InfoRow label="공급처 SRP" value={won(o.product_srp)} />
                          <InfoRow label="공급처 PPR" value={won(o.product_ppr)} />
                          <InfoRow label="공급처 RS" value={`${o.product_rs} %`} />
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Steam 정보 */}
                  <div className="card">
                    <h5 className="card-header bg-secondary text-white">옵션상품 Steam 정보</h5>
                    <div className="card-body p-1">
                      <table className="table table-sm table-bordered border-secondary table-centered mb-0">
                        <colgroup>
                          <col width="30%" />
                          <col width="*" />
                        </colgroup>
                        <tbody className="font-13">
                          <InfoRow label="Steam APP ID" value={o.steam_appid} />
                          <InfoRow label="Steam Package ID" value={o.packageid} />
                          <InfoRow label="Steam Bundle ID" value={o.bundleid} />
                          <InfoRow label="Steam 퍼블리셔" value="" />
                          <InfoRow label="Steam 개발사" value="" />
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 배송아이템 / 구성정보 */}
            <div className="col-12">
              <div className="card">
                <h5 className="card-header bg-secondary text-white">옵션상품 배송아이템</h5>
                <div className="card-body p-2">
                  <table className="table table-bordered table-centered mb-0 table-sm caption-top">
                    <caption className="py-1">배송아이템 세부정보</caption>
                    <thead className="table-light font-13">
                      <tr>
                        <th className="text-center">연동시스템</th>
                        <th className="text-center">플랫폼</th>
                        <th className="text-center">아이템 유형</th>
                        <th className="text-center">아이템 ID</th>
                        <th className="text-center">아이템 이름</th>
                        <th className="text-center">배송상태</th>
                        <th className="text-center">비고</th>
                      </tr>
                    </thead>
                    <tbody className="font-13">
                      {data.deliveries.map((d) => (
                        <tr key={`${d.order_system}-${d.item_id}`}>
                          <td className="text-center">{ORDER_SYSTEM_NAME[d.order_system] ?? ""}</td>
                          <td className="text-center">{d.item_platform}</td>
                          <td className="text-center">{d.item_type}</td>
                          <td className="text-center">{d.item_id}</td>
                          <td>{d.item_name}</td>
                          <td className="text-center">{d.flag === "Y" ? "배송중" : "종료"}</td>
                          <td className="text-center">
                            {d.flag === "Y" && (
                              <button
                                className="btn btn_link btn_delivery_delete"
                                type="button"
                                onClick={() => {
                                  if (confirm("삭제하시겠습니까?")) {
                                    deleteDelivery.mutate({
                                      item_id: d.item_id,
                                      order_system: d.order_system,
                                    });
                                  }
                                }}
                              >
                                <i className="mdi mdi-18px mdi-delete email-action-icons-item" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card">
                <h5 className="card-header bg-secondary text-white">옵션상품 구성정보</h5>
                <div className="card-body p-2 font-13">
                  <div className="d-flex justify-content-between align-self-baseline">
                    <div className="px-2 py-1">
                      {Number(o.packageid) > 0 && `Steam Package ID : ${o.packageid}`}
                      {Number(o.bundleid) > 0 && `Steam Bundle ID : ${o.bundleid}`}
                    </div>
                    <div className="px-2 py-1">
                      {Number(o.bundleid) > 0 && (
                        <button
                          type="button"
                          id="bundle_item_sync"
                          className="btn btn-info btn-sm shadow-none"
                          data-type="bundle"
                        >
                          구성 동기화
                        </button>
                      )}
                      {Number(o.packageid) > 0 && (
                        <button
                          type="button"
                          id="package_item_sync"
                          className="btn btn-info btn-sm shadow-none"
                          data-type="package"
                        >
                          구성 동기화
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-bordered table-centered mb-0 table-sm">
                      <thead className="table-light">
                        <tr>
                          <th className="text-center" style={{ width: 50 }}>
                            번호
                          </th>
                          <th className="text-center" style={{ width: 60 }}>
                            appid
                          </th>
                          <th className="text-center" style={{ width: 60 }}>
                            app_type
                          </th>
                          <th className="text-center">app_name</th>
                          <th className="text-center">app_price</th>
                          <th className="text-center" style={{ width: 50 }}>
                            비고
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.package_items.map((p, idx) => (
                          <PackageRow
                            key={p.package_srl}
                            item={p}
                            num={idx + 1}
                            onDelete={() => deletePackage.mutate(p.package_srl)}
                          />
                        ))}
                        <tr>
                          <td colSpan={4} className="text-center">
                            합계
                          </td>
                          <td className="text-end">
                            {new Intl.NumberFormat("ko-KR").format(packageTotal)}
                          </td>
                          <td />
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="card-footer">
                  <form className="row mb-0" onSubmit={handleAddPackage}>
                    <div className="col-2">
                      <input
                        type="text"
                        className="form-control"
                        name="add_appid"
                        placeholder="appid"
                      />
                    </div>
                    <div className="col-2">
                      <select name="add_item_type" className="form-select form-select-sm">
                        <option value="">App Type</option>
                        <option value="1">Game</option>
                        <option value="2">DLC</option>
                        <option value="3">Music</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        name="add_item_name"
                        placeholder="app_name"
                      />
                    </div>
                    <div className="col-2">
                      <button type="submit" className="btn btn-dark btn-sm shadow-none">
                        구성추가
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* dead 모달(트리거 미렌더) — legacy 정적 마크업 유지 */}
      <DeadModals />
    </>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <tr>
    <th className="bg-light">{label}</th>
    <td>{value}</td>
  </tr>
);

// legacy 구성 행: item_type 1게임/2DLC는 appid, 3패키지는 item_code 표시.
const PackageRow = ({
  item,
  num,
  onDelete,
}: {
  item: OptionPackageItem;
  num: number;
  onDelete: () => void;
}) => {
  const typeLabel = item.item_type === "1" ? "Game" : item.item_type === "2" ? "DLC" : "패키지";
  const idCol = item.item_type === "3" ? item.item_code : item.appid;
  return (
    <tr>
      <td className="text-center">{num}</td>
      <td className="text-center">{idCol}</td>
      <td className="text-center">{typeLabel}</td>
      <td>{item.item_name}</td>
      <td className="text-end">{new Intl.NumberFormat("ko-KR").format(item.app_price)}</td>
      <td className="text-center">
        <button
          type="button"
          className="btn btn-link action-icon btn_package_delete"
          onClick={onDelete}
        >
          <i className="mdi mdi-delete" />
        </button>
      </td>
    </tr>
  );
};

// legacy 모달 마크업(트리거 버튼이 뷰 본문에 렌더되지 않아 열 수 없는 정적 UI).
const DeadModals = () => (
  <>
    <div id="title-modal" className="modal fade" tabIndex={-1} role="dialog" aria-hidden="true">
      <div className="modal-dialog modal-lg" style={{ maxWidth: 900 }}>
        <div className="modal-content">
          <div className="modal-header modal-colored-header bg-primary">
            <h4 className="modal-title">대표상품 검색결과</h4>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-hidden="true"
            />
          </div>
          <div className="modal-body p-0">
            <table className="table table-striped table-border mb-0 table-sm" id="title_info">
              <thead className="table-dark">
                <tr>
                  <th className="text-center" style={{ width: 80 }}>
                    대표상품
                    <br />
                    코드
                  </th>
                  <th className="text-center" style={{ width: 350 }}>
                    대표상품명
                    <br />
                    (영문)
                  </th>
                  <th className="text-center" style={{ width: 150 }}>
                    퍼블리셔
                  </th>
                  <th className="text-center" style={{ width: 100 }}>
                    비고
                  </th>
                </tr>
              </thead>
              <tbody />
            </table>
          </div>
        </div>
      </div>
    </div>

    <div id="asset-modal" className="modal fade" tabIndex={-1} role="dialog" aria-hidden="true">
      <div className="modal-dialog modal-lg" style={{ maxWidth: 1000 }}>
        <div className="modal-content">
          <div className="modal-header modal-colored-header bg-primary">
            <h4 className="modal-title">Asset 검색결과</h4>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-hidden="true"
            />
          </div>
          <div className="modal-body p-0 font-13">
            <table className="table table-striped mb-0" id="asset_info">
              <thead className="table-dark font-14">
                <tr>
                  <th className="text-center">Asset Platform</th>
                  <th className="text-center">Asset Type</th>
                  <th className="text-center">Asset ID</th>
                  <th className="text-center">Asset name</th>
                  <th className="text-center">비고</th>
                </tr>
              </thead>
              <tbody className="font-13" />
            </table>
          </div>
        </div>
      </div>
    </div>

    <div id="ztorm-modal" className="modal fade" tabIndex={-1} role="dialog" aria-hidden="true">
      <div className="modal-dialog modal-lg" style={{ width: 1000, maxWidth: 1100 }}>
        <div className="modal-content">
          <div className="modal-header modal-colored-header bg-primary">
            <h4 className="modal-title">Ztorm 검색결과</h4>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-hidden="true"
            />
          </div>
          <div className="modal-body p-0 font-13">
            <table className="table table-striped mb-0" id="ztorm_info">
              <thead className="table-dark font-13">
                <tr>
                  <th className="text-center">플랫폼</th>
                  <th className="text-center">아이템 유형</th>
                  <th className="text-center">아이템 ID</th>
                  <th className="text-center">아이템 이름</th>
                  <th className="text-center">channel</th>
                  <th className="text-center">비고</th>
                </tr>
              </thead>
              <tbody className="font-13" />
            </table>
          </div>
        </div>
      </div>
    </div>

    <div id="package-modal" className="modal fade" tabIndex={-1} role="dialog" aria-hidden="true">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header modal-colored-header bg-primary">
            <h4 className="modal-title">패키지 구성 정보</h4>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-hidden="true"
            />
          </div>
          <div className="modal-body">
            <div id="package_info" />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-primary">
              패키지 구성추가
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      className="modal fade"
      id="package-second-modal"
      aria-hidden="true"
      tabIndex={-1}
      role="dialog"
    >
      <div className="modal-dialog modal-lg modal-dialog-centered" style={{ maxWidth: 1000 }}>
        <div className="modal-content modal-filled bg-light">
          <div className="modal-header modal-colored-header bg-primary">
            <h5 className="modal-title">패키지 구성추가</h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            />
          </div>
          <div className="modal-body pb-0">
            <div id="package_item_list" />
          </div>
          <div className="modal-footer pt-0">
            <div className="text-end">
              <button className="btn btn-primary btn-sm" type="button">
                전체추가
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
);
