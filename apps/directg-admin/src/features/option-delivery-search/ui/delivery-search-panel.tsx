import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  useSearchDeliveryItem,
  useAddDeliveryItem,
  type DeliverySearchItem,
  type DeliverySystemKey,
} from "@entities/goods-option";

type DeliverySearchPanelProps = { productCode: string; productViewer: boolean };

type SystemConfig = {
  key: DeliverySystemKey;
  label: string;
  order_system: string; // 추가 시 고정 order_system
  placeholder: string;
  emptyMsg: string;
  hasMode?: boolean; // PointNexus test/prod
};

// legacy sub_sidebar tfoot 순서: Asset(1)/Ztorm(2)/Genba(9)/Vaultn(8)/PointNexus(10).
const SYSTEMS: SystemConfig[] = [
  {
    key: "asset",
    label: "Asset",
    order_system: "1",
    placeholder: "Asset ID를 입력해 주세요",
    emptyMsg: "Asset ID를 입력해주세요.",
  },
  {
    key: "ztorm",
    label: "Ztorm",
    order_system: "2",
    placeholder: "연동시스템의 고유번호를 입력해 주세요",
    emptyMsg: "Ztorm ID를 입력해주세요.",
  },
  {
    key: "genba",
    label: "Genba",
    order_system: "9",
    placeholder: "연동시스템의 고유번호를 입력해 주세요",
    emptyMsg: "Genba SKU를 입력해주세요.",
  },
  {
    key: "vaultn",
    label: "Vaultn",
    order_system: "8",
    placeholder: "연동시스템의 고유번호를 입력해 주세요",
    emptyMsg: "Vaultn SKU를 입력해주세요.",
  },
  {
    key: "pointnexus",
    label: "PointNexus",
    order_system: "10",
    placeholder: "PointNexus productID를 입력해 주세요",
    emptyMsg: "PointNexus productID를 입력해주세요.",
    hasMode: true,
  },
];

type ModalState = { open: boolean; system: SystemConfig; rows: DeliverySearchItem[] };

export const DeliverySearchPanel = ({ productCode, productViewer }: DeliverySearchPanelProps) => {
  // 라디오 연동시스템(legacy order_system) — 검색 게이트.
  const [orderSystem, setOrderSystem] = useState("");
  const [queries, setQueries] = useState<Record<DeliverySystemKey, string>>({
    asset: "",
    ztorm: "",
    genba: "",
    vaultn: "",
    pointnexus: "",
  });
  const [pnMode, setPnMode] = useState("test");
  const [modal, setModal] = useState<ModalState | null>(null);
  const [modalShown, setModalShown] = useState(false);

  const searchMutation = useSearchDeliveryItem(productCode);
  const addMutation = useAddDeliveryItem(productCode);

  useEffect(() => {
    if (!modal?.open) {
      return;
    }
    const id = requestAnimationFrame(() => setModalShown(true));
    return () => cancelAnimationFrame(id);
  }, [modal?.open]);

  const closeModal = () => {
    setModalShown(false);
    window.setTimeout(() => setModal(null), 200);
  };

  const onSearch = (system: SystemConfig) => {
    // legacy: 라디오 미선택 → 알림. 각 시스템 입력 미입력 → 시스템별 알림.
    if (!orderSystem) {
      window.alert("연동시스템을 선택해 주세요.");
      return;
    }
    const query = queries[system.key];
    if (!query) {
      window.alert(system.emptyMsg);
      return;
    }
    searchMutation.mutate(
      {
        system: system.key,
        order_system: orderSystem,
        query,
        pn_mode: system.hasMode ? pnMode : undefined,
      },
      {
        onSuccess: (res) => {
          setModal({ open: true, system, rows: res.items });
        },
      },
    );
  };

  const setRowField = (index: number, field: keyof DeliverySearchItem, value: string) =>
    setModal((m) =>
      m ? { ...m, rows: m.rows.map((r, i) => (i === index ? { ...r, [field]: value } : r)) } : m,
    );

  const onAdd = (row: DeliverySearchItem, system: SystemConfig) => {
    addMutation.mutate({ order_system: system.order_system, ...row }, { onSuccess: closeModal });
  };

  const setQuery = (key: DeliverySystemKey, value: string) =>
    setQueries((prev) => ({ ...prev, [key]: value }));

  return (
    <>
      <tr>
        <td colSpan={9} className="p-3">
          {/* 연동시스템 라디오 */}
          <div className="row mb-2">
            <label className="col-sm-3 col-form-label col-form-label-sm bg-light border">
              * 연동시스템
            </label>
            <div className="col-sm-9 border">
              {SYSTEMS.map((s) => (
                <div className="form-check form-check-inline form-radio-dark mt-1" key={s.key}>
                  <input
                    type="radio"
                    id={`order_system_${s.order_system}`}
                    name="order_system"
                    className="form-check-input"
                    value={s.order_system}
                    checked={orderSystem === s.order_system}
                    onChange={() => setOrderSystem(s.order_system)}
                  />
                  <label className="form-check-label" htmlFor={`order_system_${s.order_system}`}>
                    {s.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* 시스템별 검색행 */}
          {SYSTEMS.map((s) => (
            <div className="row mb-2" key={s.key}>
              <label className="col-sm-3 col-form-label col-form-label-sm bg-light border">
                * {s.label} 검색
              </label>
              <div className="col-6">
                <div className="input-group">
                  {s.hasMode && (
                    <select
                      className="form-control form-control-sm"
                      style={{ maxWidth: "90px" }}
                      value={pnMode}
                      onChange={(e) => setPnMode(e.target.value)}
                    >
                      <option value="test">test</option>
                      <option value="prod">prod</option>
                    </select>
                  )}
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder={s.placeholder}
                    value={queries[s.key]}
                    onChange={(e) => setQuery(s.key, e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-dark shadow-none"
                    onClick={() => onSearch(s)}
                  >
                    {s.label} 검색
                  </button>
                </div>
              </div>
            </div>
          ))}
        </td>
      </tr>

      {modal &&
        createPortal(
          <>
            <div
              className={`modal fade${modalShown ? " show" : ""}`}
              style={{ display: "block" }}
              tabIndex={-1}
            >
              <div className="modal-dialog modal-lg" style={{ maxWidth: "1100px" }}>
                <div className="modal-content">
                  <div className="modal-header modal-colored-header bg-primary">
                    <h4 className="modal-title">{modal.system.label} 검색결과</h4>
                    <button type="button" className="btn-close" onClick={closeModal} />
                  </div>
                  <div className="modal-body p-0 font-13">
                    <table className="table table-striped mb-0">
                      <thead className="table-dark font-12">
                        <tr>
                          <th className="text-center">플랫폼</th>
                          <th className="text-center">유형</th>
                          <th className="text-center">아이템 ID</th>
                          <th className="text-center">아이템 이름</th>
                          <th className="text-center">공급처</th>
                          {modal.system.key === "ztorm" && <th className="text-center">channel</th>}
                          <th className="text-center">비고</th>
                        </tr>
                      </thead>
                      <tbody className="font-12">
                        {modal.rows.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center">
                              검색된 결과가 없습니다.
                            </td>
                          </tr>
                        ) : (
                          modal.rows.map((row, i) => (
                            <tr key={`${row.item_id}-${i}`}>
                              <td>
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  value={row.item_platform}
                                  onChange={(e) => setRowField(i, "item_platform", e.target.value)}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  value={row.item_type}
                                  onChange={(e) => setRowField(i, "item_type", e.target.value)}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  value={row.item_id}
                                  onChange={(e) => setRowField(i, "item_id", e.target.value)}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  value={row.item_name}
                                  onChange={(e) => setRowField(i, "item_name", e.target.value)}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  value={row.item_publisher}
                                  onChange={(e) => setRowField(i, "item_publisher", e.target.value)}
                                />
                              </td>
                              {modal.system.key === "ztorm" && (
                                <td>
                                  <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    value={row.providers_channel}
                                    onChange={(e) =>
                                      setRowField(i, "providers_channel", e.target.value)
                                    }
                                  />
                                </td>
                              )}
                              <td className="text-center">
                                {!productViewer && (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => onAdd(row, modal.system)}
                                  >
                                    {modal.system.label} 추가
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
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
