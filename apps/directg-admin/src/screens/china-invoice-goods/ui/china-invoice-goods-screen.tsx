import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  useChinaGoodsList,
  useSaveChinaGoods,
  useDeleteChinaGoods,
  CHINA_GOODS_PLATFORM_OPTIONS,
  type ChinaGoodsListSearch,
  type ChinaGoodsItem,
} from "@entities/china";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/china/invoice_goods";
const PER_PAGE = 20;

const nf = (n: number) => n.toLocaleString("en-US");

type ModalState = {
  mode: "register" | "modify";
  idx: number;
  platform: string;
  goods_nm: string;
  price: string;
};

const EMPTY_MODAL: ModalState = { mode: "register", idx: 0, platform: "", goods_nm: "", price: "" };

// legacy china/invoice_goods.php — 중국 결제 상품 리스트(platform·goods_nm asc, 20/page).
export const ChinaInvoiceGoodsScreen = (search: ChinaGoodsListSearch) => {
  const { data } = useChinaGoodsList(search);
  const save = useSaveChinaGoods();
  const remove = useDeleteChinaGoods();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalShown, setModalShown] = useState(false);
  const [form, setForm] = useState<ModalState>(EMPTY_MODAL);

  // legacy Bootstrap fade: 마운트 후 다음 프레임에 .show 부여.
  useEffect(() => {
    if (!modalOpen) {
      return;
    }
    const id = requestAnimationFrame(() => setModalShown(true));
    return () => cancelAnimationFrame(id);
  }, [modalOpen]);

  // 페이지네이션은 raw 검색값(page 제외) 유지 = legacy $param.
  const paginationParams: Record<string, string> = {};
  const addP = (key: string, value: string) => {
    if (value !== "") paginationParams[key] = value;
  };
  addP("search_name", search.search_name);
  addP("search_platform", search.search_platform);

  if (!data) {
    return null;
  }

  const { items, pagination } = data;

  const openRegister = () => {
    setForm(EMPTY_MODAL);
    setModalOpen(true);
  };
  const openModify = (item: ChinaGoodsItem) => {
    setForm({
      mode: "modify",
      idx: item.idx,
      platform: item.platform,
      goods_nm: item.goods_nm,
      price: String(item.price),
    });
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalShown(false);
    setModalOpen(false);
  };

  // legacy: 저장 버튼(type=button+serialize AJAX, 클라 검증 없음) → alert(응답) + reload.
  const onSave = () => {
    save.mutate(
      {
        mode: form.mode,
        idx: form.idx,
        platform: form.platform,
        goods_nm: form.goods_nm,
        price: form.price,
      },
      {
        onSuccess: (res) => {
          window.alert(res.message);
          closeModal();
        },
      },
    );
  };

  // legacy: 삭제 버튼 → confirm → AJAX delete → alert(응답) + reload.
  const onDelete = (item: ChinaGoodsItem) => {
    if (!window.confirm(`[${item.platform}] ${item.goods_nm}을(를) 삭제하시겠습니까?`)) {
      return;
    }
    remove.mutate({ idx: item.idx }, { onSuccess: (res) => window.alert(res.message) });
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
                    중국결제
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    중국 결제 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">중국 결제 상품 리스트</li>
              </ol>
            </div>
            <h4 className="page-title">중국 결제 상품 리스트</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* 검색필터 */}
      <div className="row g-2">
        <div className="card">
          <h5 className="card-header bg-secondary text-white">검색필터</h5>
          <div className="card-body py-2">
            <form className="form-horizontal" method="get" action={BASE_URL}>
              <div className="row mb-2">
                <div className="col-lg-4">
                  <div className="row">
                    <label
                      htmlFor="search_name"
                      className="col-sm-3 col-form-label bg-light border"
                    >
                      상품명
                    </label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        className="form-control"
                        id="search_name"
                        name="search_name"
                        placeholder="상품명"
                        defaultValue={search.search_name}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="row">
                    {/* legacy: label for="search_email"(복붙 버그, 무해) */}
                    <label
                      htmlFor="search_email"
                      className="col-sm-3 col-form-label bg-light border"
                    >
                      플랫폼
                    </label>
                    <div className="col-sm-9">
                      <select
                        className="form-select "
                        id="search_platform"
                        name="search_platform"
                        defaultValue={search.search_platform}
                      >
                        <option value="">::: 플랫폼 선택 :::</option>
                        {CHINA_GOODS_PLATFORM_OPTIONS.map((opt, i) => (
                          <option key={i} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="col-lg-4">
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

      <div className="d-flex flex-row justify-content-between mb-2">
        {/* legacy quirk: 카운트 단위 "명"(개가 맞으나 원문 유지) */}
        <div className="float-start">{nf(pagination.total_results)} 명</div>
        <div className="float-end">
          <button type="button" className="btn btn-outline-danger" onClick={openRegister}>
            중국 결제 상품등록
          </button>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <table className="table table-centered w-100  nowrap table-sm table-bordered border-light">
            <thead className="table-light">
              <tr>
                <th className="text-center">번호</th>
                <th className="text-center">플랫폼</th>
                <th className="text-center">상품명</th>
                <th className="text-center">판매가</th>
                <th className="text-center">수정</th>
                <th className="text-center">삭제</th>
              </tr>
            </thead>
            <tbody className="bg-white font-12">
              {items.map((item, index) => (
                <ChinaGoodsRow
                  key={item.idx}
                  item={item}
                  no={pagination.total_results - (index + (pagination.current_page - 1) * PER_PAGE)}
                  onModify={openModify}
                  onDelete={onDelete}
                  deleteDisabled={remove.isPending}
                />
              ))}
            </tbody>
          </table>
          <div className="text-center mt-3 fs-5">
            <ServerPagination
              page={pagination.current_page}
              totalPages={pagination.total_pages}
              baseUrl={BASE_URL}
              params={paginationParams}
            />
          </div>
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
                    <h4 className="modal-title">
                      {form.mode === "modify" ? "중국 결제 상품 수정" : "중국 결제 상품 등록"}
                    </h4>
                    <button type="button" className="btn-close" onClick={closeModal} />
                  </div>
                  <div className="modal-body">
                    <div className="form-horizontal">
                      <div className="row mb-3">
                        <label htmlFor="platform" className="col-2 form-label">
                          * 플랫폼
                        </label>
                        <div className="col-10">
                          <select
                            className="form-select "
                            id="platform"
                            name="platform"
                            required
                            value={form.platform}
                            onChange={(e) => setForm({ ...form, platform: e.target.value })}
                          >
                            <option value="">::: 플랫폼 선택 :::</option>
                            {CHINA_GOODS_PLATFORM_OPTIONS.map((opt, i) => (
                              <option key={i} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <label htmlFor="goods_nm" className="col-2 form-label">
                          * 상품명
                        </label>
                        <div className="col-10">
                          <input
                            className="form-control"
                            type="text"
                            id="goods_nm"
                            name="goods_nm"
                            required
                            value={form.goods_nm}
                            onChange={(e) => setForm({ ...form, goods_nm: e.target.value })}
                            autoComplete="one-time-code"
                          />
                        </div>
                      </div>
                      <div className="row mb-3">
                        <label htmlFor="price" className="col-2 form-label">
                          * 판매가
                        </label>
                        <div className="col-10">
                          <div className="input-group">
                            <input
                              className="form-control"
                              type="text"
                              required
                              id="price"
                              name="price"
                              value={form.price}
                              onChange={(e) => setForm({ ...form, price: e.target.value })}
                              autoComplete="one-time-code"
                            />
                            <label className="input-group-text">원</label>
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3 text-center">
                        <div className="col-12">
                          <button
                            className="btn btn-primary shadow-none"
                            type="button"
                            disabled={save.isPending}
                            onClick={onSave}
                          >
                            중국 결제 상품 저장
                          </button>
                        </div>
                      </div>
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

const ChinaGoodsRow = ({
  item,
  no,
  onModify,
  onDelete,
  deleteDisabled,
}: {
  item: ChinaGoodsItem;
  no: number;
  onModify: (item: ChinaGoodsItem) => void;
  onDelete: (item: ChinaGoodsItem) => void;
  deleteDisabled: boolean;
}) => (
  <tr>
    <td className="text-center">{no}</td>
    <td className="text-center">{item.platform}</td>
    <td className="text-start">{item.goods_nm}</td>
    <td className="text-end">{nf(item.price)}원</td>
    <td className="text-center">
      <button type="button" className="btn btn-outline-dark btn-sm" onClick={() => onModify(item)}>
        수정
      </button>
    </td>
    <td className="text-center">
      <button
        type="button"
        className="btn btn-outline-danger btn-sm"
        disabled={deleteDisabled}
        onClick={() => onDelete(item)}
      >
        삭제
      </button>
    </td>
  </tr>
);
