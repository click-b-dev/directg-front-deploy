import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  useZtormCatalogue,
  useSearchZtormRrp,
  useAddZtormProduct,
  type ZtormCatalogueSearch,
  type ZtormCatalogueItem,
} from "@entities/ztorm";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/goods/ztorm/ztorm_catalogue";

const pad = (n: number) => String(n).padStart(2, "0");
const fmtDateTime = (unix: number) => {
  const d = new Date(unix * 1000);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

// legacy ztorm_catalogue.php — Ztorm 카탈로그 현황.
export const ZtormCatalogueScreen = (search: ZtormCatalogueSearch) => {
  const { data } = useZtormCatalogue(search);
  const addProduct = useAddZtormProduct();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalShown, setModalShown] = useState(false);
  const [ztItemId, setZtItemId] = useState("");

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
  const onAdd = () => {
    addProduct.mutate(
      { zt_item_id: ztItemId },
      {
        onSuccess: (res) => {
          window.alert(res.message);
          closeModal();
          setZtItemId("");
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
                    Ztorm API
                  </a>
                </li>
                <li className="breadcrumb-item active">Ztorm 카탈로그 현황</li>
              </ol>
            </div>
            <h4 className="page-title">Ztorm 카탈로그 현황</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row mb-2">
        <div className="col-12">
          <div className="float-start">{data.pagination.total_results.toLocaleString()} 개</div>
          <div className="float-end">
            <button
              type="button"
              className="btn btn-sm btn-primary shadow-none"
              onClick={() => setModalOpen(true)}
            >
              Ztorm 상품 추가
            </button>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <table className="table table-centered w-100 nowrap table-sm table-bordered border-light">
            <thead className="table-light font-13">
              <tr>
                <th className="text-center">고유번호</th>
                <th className="text-center">상품명</th>
                <th className="text-center">공급처</th>
                <th className="text-center">판매상태</th>
                <th className="text-center">주문가능일자</th>
                <th className="text-center">다운로드일자</th>
                <th className="text-center">출시일자</th>
                <th className="text-center">RRP</th>
                <th className="text-center">비고</th>
              </tr>
            </thead>
            <tbody className="font-12 bg-white">
              {data.items.map((item) => (
                <ZtormCatalogueRow key={item.ProductID} item={item} />
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
                    <h5 className="modal-title">Ztorm 상품 등록</h5>
                    <button type="button" className="btn-close" onClick={closeModal} />
                  </div>
                  <div className="modal-body">
                    <div className="mb-2 row ps-3 pe-3">
                      <label htmlFor="zt_item_id" className="col-sm-3 col-form-label bg-light">
                        ProductID
                      </label>
                      <div className="col-sm-9">
                        <input
                          type="text"
                          id="zt_item_id"
                          className="form-control"
                          value={ztItemId}
                          onChange={(e) => setZtItemId(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="mb-2 text-center">
                      <button
                        className="btn btn-primary shadow-none"
                        type="button"
                        disabled={addProduct.isPending}
                        onClick={onAdd}
                      >
                        Ztorm 상품 추가
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
    </>
  );
};

const ZtormCatalogueRow = ({ item }: { item: ZtormCatalogueItem }) => {
  const rrpSearch = useSearchZtormRrp();
  return (
    <tr>
      <td className="text-center">{item.ProductID}</td>
      <td className="text-start">
        [{item.RegionTag}] {item.name}
      </td>
      <td className="text-center">
        [{item.publisher_id}] {item.publisher_name}
      </td>
      <td className="text-center">{item.status}</td>
      <td className="text-center">{fmtDateTime(item.OrderDate)}</td>
      <td className="text-center">{fmtDateTime(item.download_date)}</td>
      <td className="text-center">{fmtDateTime(item.release_date)}</td>
      <td className="text-end">{item.rrp.toLocaleString()}</td>
      <td className="text-center">
        <button
          type="button"
          className="btn btn-sm btn-secondary shadow-none font-12"
          onClick={() =>
            rrpSearch.mutate(
              { zt_item_id: item.ProductID },
              { onSuccess: (r) => window.alert(r.message) },
            )
          }
        >
          RRP조회
        </button>
      </td>
    </tr>
  );
};
