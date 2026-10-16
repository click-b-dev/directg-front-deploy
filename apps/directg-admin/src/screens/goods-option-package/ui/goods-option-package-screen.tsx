import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  useOptionPackage,
  useSavePackageView,
  useAddPackageUnit,
  useDeletePackageUnit,
  useSearchPackageOption,
  useSaveBonusDescription,
  type OptionPackageData,
  type PackageOptionSearchResult,
} from "@entities/goods-option";
import { OptionSubNav } from "@widgets/option-sub-nav";
import { OptionPackageSteam } from "@features/option-package-steam";
import { SmartEditor, type SmartEditorHandle } from "@shared/ui";
import { useProductViewer } from "@shared/lib/use-product-viewer";

type GoodsOptionPackageScreenProps = { productCode: string };

// legacy goods/goods_option_package_register.php — 구성정보 설정(핵심 col-8).
export const GoodsOptionPackageScreen = ({ productCode }: GoodsOptionPackageScreenProps) => {
  const { data, dataUpdatedAt } = useOptionPackage(productCode);

  useEffect(() => {
    document.title = "옵션상품 구성정보 설정";
  }, []);

  if (!data) {
    return null;
  }
  return <PackageForm key={dataUpdatedAt} productCode={productCode} data={data} />;
};

// unit_type 뱃지: 1 Game / 2 DLC / 3 Music (그 외 없음).
const UNIT_BADGE: Record<string, string> = { "1": "Game", "2": "DLC", "3": "Music" };

const PackageForm = ({ productCode, data }: { productCode: string; data: OptionPackageData }) => {
  const productViewer = useProductViewer();
  const editorRef = useRef<SmartEditorHandle>(null);
  // is_bonus는 표시 전용(legacy 저장 트리거 없음).
  const [isBonus, setIsBonus] = useState(data.is_bonus);
  const [unitType, setUnitType] = useState("");
  const [unitName, setUnitName] = useState("");
  const [searchCode, setSearchCode] = useState("");
  const [modal, setModal] = useState<{ item: PackageOptionSearchResult | null } | null>(null);
  const [modalShown, setModalShown] = useState(false);

  const savePackageView = useSavePackageView(productCode);
  const addUnit = useAddPackageUnit(productCode);
  const deleteUnit = useDeletePackageUnit(productCode);
  const searchOption = useSearchPackageOption(productCode);
  const saveBonus = useSaveBonusDescription(productCode);

  useEffect(() => {
    if (!modal) {
      return;
    }
    const id = requestAnimationFrame(() => setModalShown(true));
    return () => cancelAnimationFrame(id);
  }, [modal]);

  const closeModal = () => {
    setModalShown(false);
    window.setTimeout(() => setModal(null), 200);
  };

  const onDirectAdd = () => {
    if (!unitType) {
      window.alert("유형을 선택해 주세요.");
      return;
    }
    if (!unitName) {
      window.alert("구성명을 입력해 주세요.");
      return;
    }
    addUnit.mutate({ unit_type: unitType, unit_code: "", unit_name: unitName });
  };

  const onSearch = () => {
    searchOption.mutate(
      { search_option_code: searchCode },
      { onSuccess: (res) => setModal({ item: res.item }) },
    );
  };

  const onModalAdd = (item: PackageOptionSearchResult) => {
    addUnit.mutate(
      { unit_type: item.unit_type, unit_code: item.unit_code, unit_name: item.unit_name },
      { onSuccess: closeModal },
    );
  };

  const onDeleteUnit = (idx: number) => {
    if (window.confirm("선택하신 구성을 삭제하시겠습니까?")) {
      deleteUnit.mutate(idx);
    }
  };

  const onSaveBonus = () =>
    saveBonus.mutate({ value: editorRef.current?.getContent() ?? data.bonus_description });

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
                <li className="breadcrumb-item active">구성정보 설정</li>
              </ol>
            </div>
            <h4 className="">
              {data.product.product_name}{" "}
              <span className="badge bg-dark">{data.product.platform_name}</span>{" "}
              <span className="badge bg-dark">{data.product.game_type}</span>{" "}
              <span className="badge bg-dark">{data.product.display_type}</span>
            </h4>
            <small>sku: {data.product.goods_sku}</small>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-2 mb-2 mb-sm-0">
          <OptionSubNav
            productCode={productCode}
            active="package"
            gameType={data.product.game_type}
          />
        </div>
        <div className="col-10">
          <div className="row">
            <div className="col-8">
              {/* 구성정보 설정 */}
              <div className="card">
                <h5 className="card-header bg-secondary text-white">구성정보 설정</h5>
                <div className="card-body p-2 font-13">
                  <div className="d-flex mb-2">
                    {/* legacy: 클릭 즉시 저장(package_view_config). */}
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="is_package_view"
                        id="is_package_view_y"
                        value="Y"
                        checked={data.is_package_view === "Y"}
                        onChange={() => savePackageView.mutate({ is_package_view: "Y" })}
                      />
                      <label className="form-check-label" htmlFor="is_package_view_y">
                        구성정보 사용
                      </label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="is_package_view"
                        id="is_package_view_n"
                        value="N"
                        checked={data.is_package_view === "N"}
                        onChange={() => savePackageView.mutate({ is_package_view: "N" })}
                      />
                      <label className="form-check-label" htmlFor="is_package_view_n">
                        구성정보 미사용
                      </label>
                    </div>
                  </div>
                  <table className="table table-bordered table-centered mb-0 table-sm">
                    <thead className="table-light">
                      <tr>
                        <th className="text-center">번호</th>
                        <th className="text-center">옵션상품코드</th>
                        <th className="text-center">구성명</th>
                        <th className="text-center">비고</th>
                      </tr>
                    </thead>
                    <tbody className="font-12">
                      {data.units.map((u, i) => (
                        <tr key={u.idx}>
                          <td className="text-center">{i + 1}</td>
                          <td className="text-center">{u.unit_code}</td>
                          <td>
                            <div className="d-flex flex-column">
                              {UNIT_BADGE[u.unit_type] && (
                                <div>
                                  <span className="badge bg-secondary font-11">
                                    {UNIT_BADGE[u.unit_type]}
                                  </span>
                                </div>
                              )}
                              {u.unit_name}
                            </div>
                          </td>
                          <td className="text-center">
                            {!productViewer && (
                              <a
                                href="#"
                                className="action-icon"
                                title="구성삭제"
                                onClick={(e) => {
                                  e.preventDefault();
                                  onDeleteUnit(u.idx);
                                }}
                              >
                                {" "}
                                <i className="mdi mdi-delete" />
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={4}>
                          <div className="row mb-0">
                            <div className="col-2">
                              <select
                                id="unit_type"
                                name="unit_type"
                                className="form-select form-select-sm"
                                value={unitType}
                                onChange={(e) => setUnitType(e.target.value)}
                              >
                                <option value="">유형</option>
                                <option value="1">기본게임</option>
                                <option value="2">DLC</option>
                                <option value="3">Music</option>
                                <option value="4">특전</option>
                                <option value="5">기타</option>
                              </select>
                            </div>
                            <div className="col-8">
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                id="unit_name"
                                name="unit_name"
                                placeholder="추가할 구성명을 입력해 주세요."
                                value={unitName}
                                onChange={(e) => setUnitName(e.target.value)}
                              />
                            </div>
                            <div className="col-2 px-0">
                              {!productViewer && (
                                <button
                                  type="button"
                                  className="btn btn-dark btn-sm shadow-none"
                                  onClick={onDirectAdd}
                                >
                                  구성추가
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={4}>
                          <div className="row mb-0">
                            <div className="col-10">
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                id="search_option_code"
                                name="search_option_code"
                                placeholder="검색할 옵션상품코드를 입력해 주세요"
                                value={searchCode}
                                onChange={(e) => setSearchCode(e.target.value)}
                              />
                            </div>
                            <div className="col-2 px-0">
                              <button
                                type="button"
                                className="btn btn-light btn-sm shadow-none border"
                                onClick={onSearch}
                              >
                                옵션상품검색
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* bonus_description 프리뷰(정제 HTML) */}
              <div dangerouslySetInnerHTML={{ __html: data.bonus_description_preview_html }} />

              {/* 구매특전 설정 */}
              <div className="card">
                <h5 className="card-header bg-secondary text-white">구매특전 설정</h5>
                <div className="card-body p-2">
                  <div className="row g-0 mb-2 border">
                    <label htmlFor="is_bonus" className="col-sm-3 col-form-label bg-light font-13">
                      * 구매특전 제공여부
                    </label>
                    <div className="col-3 mt-1 ms-1">
                      {/* legacy: 저장 트리거 없음(표시 전용). */}
                      <div className="form-check form-radio-dark form-check-inline">
                        <input
                          type="radio"
                          id="is_bonus_y"
                          name="is_bonus"
                          className="form-check-input"
                          value="Y"
                          checked={isBonus === "Y"}
                          onChange={() => setIsBonus("Y")}
                        />
                        <label className="form-check-label font-12" htmlFor="is_bonus_y">
                          예
                        </label>
                      </div>
                      <div className="form-check form-radio-dark form-check-inline">
                        <input
                          type="radio"
                          id="is_bonus_n"
                          name="is_bonus"
                          className="form-check-input"
                          value="N"
                          checked={isBonus === "N"}
                          onChange={() => setIsBonus("N")}
                        />
                        <label className="form-check-label font-12" htmlFor="is_bonus_n">
                          아니오
                        </label>
                      </div>
                    </div>
                  </div>

                  <SmartEditor ref={editorRef} initialValue={data.bonus_description} />
                </div>
                <div className="card-footer">
                  <div className="float-end">
                    {!productViewer && (
                      <button
                        type="button"
                        className="btn btn-sm btn-primary shadow-none"
                        onClick={onSaveBonus}
                      >
                        특전설명 저장
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* col-4: Steam 구성정보 참고 */}
            <div className="col-4">
              <OptionPackageSteam productCode={productCode} />
            </div>
          </div>
        </div>
      </div>

      {/* 옵션상품검색 → 구성 상세추가 모달 */}
      {modal &&
        createPortal(
          <>
            <div
              className={`modal fade${modalShown ? " show" : ""}`}
              style={{ display: "block" }}
              tabIndex={-1}
            >
              <div className="modal-dialog modal-lg modal-dialog-centered modal-top">
                <div className="modal-content modal-filled bg-light">
                  <div className="modal-header modal-colored-header bg-primary">
                    <h5 className="modal-title">구성 상세추가</h5>
                    <button type="button" className="btn-close" onClick={closeModal} />
                  </div>
                  <div className="modal-body pb-0">
                    <table className="table table-sm table-bordered">
                      <thead className="table-light font-13">
                        <tr>
                          <th className="text-center">옵션상품코드</th>
                          <th className="text-center">유형</th>
                          <th className="text-center">옵션상품명</th>
                          <th className="text-center">비고</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white font-12">
                        {modal.item ? (
                          <tr>
                            <td className="text-center">{modal.item.unit_code}</td>
                            <td className="text-center">{modal.item.game_type}</td>
                            <td>{modal.item.unit_name}</td>
                            <td className="text-center">
                              {!productViewer && (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-secondary shadow-none font-12"
                                  onClick={() => modal.item && onModalAdd(modal.item)}
                                >
                                  구성추가
                                </button>
                              )}
                            </td>
                          </tr>
                        ) : (
                          <tr>
                            <td colSpan={4} className="text-center">
                              검색된 결과가 없습니다.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
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
    </>
  );
};
