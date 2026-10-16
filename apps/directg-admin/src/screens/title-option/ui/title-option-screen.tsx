import { useEffect, useState } from "react";
import {
  useAddOption,
  useDeleteOption,
  useSearchOptions,
  useTitleOptions,
  type OptionCandidate,
  type OptionCategory,
  type OptionProduct,
  type OptionStatus,
  type TitleOptions,
} from "@entities/title-option";
import { TitleSubNav } from "@widgets/title-sub-nav";
import { useProductViewer } from "@shared/lib/use-product-viewer";

type TitleOptionScreenProps = { titleId: number };

// legacy goods/title_option_register.php — 대표상품 관련상품 설정.
export const TitleOptionScreen = ({ titleId }: TitleOptionScreenProps) => {
  const { data } = useTitleOptions(titleId);

  useEffect(() => {
    document.title = "대표상품 관련상품 설정";
  }, []);

  if (!data) {
    return null;
  }
  return <OptionSettings data={data} />;
};

const CATEGORIES: { key: OptionCategory; label: string }[] = [
  { key: "game", label: "기본게임 진열설정" },
  { key: "edition", label: "에디션 진열설정" },
  { key: "dlc", label: "DLC 진열설정" },
  { key: "etc", label: "실물상품 진열설정" },
  { key: "holomodels", label: "홀로모델 진열설정" },
  { key: "holomodelsdlc", label: "홀로모델 DLC 진열설정" },
  { key: "holomodelsedition", label: "홀로모델 에디션 진열설정" },
];

const STATUS_LABEL: Record<OptionStatus, string> = {
  "0": "판매중",
  "1": "판매중지",
  "2": "품절",
  "9": "승인대기",
  "3": "판매종료",
};

type ModalState = { open: boolean; category: OptionCategory; candidates: OptionCandidate[] };

const OptionSettings = ({ data }: { data: TitleOptions }) => {
  const productViewer = useProductViewer();
  // legacy: 각 섹션 검색 input 기본값 = title_name.
  const [searchValues, setSearchValues] = useState<Record<OptionCategory, string>>(
    () =>
      Object.fromEntries(CATEGORIES.map((c) => [c.key, data.title_name])) as Record<
        OptionCategory,
        string
      >,
  );
  const [modal, setModal] = useState<ModalState>({
    open: false,
    category: "game",
    candidates: [],
  });
  const [modalShown, setModalShown] = useState(false);

  const searchMutation = useSearchOptions();
  const addMutation = useAddOption();
  const deleteMutation = useDeleteOption();

  const openModal = (category: OptionCategory, candidates: OptionCandidate[]) => {
    setModal({ open: true, category, candidates });
    // Bootstrap fade: display 후 한 프레임 뒤 .show.
    requestAnimationFrame(() => setModalShown(true));
  };
  const closeModal = () => {
    setModalShown(false);
    setTimeout(() => setModal((prev) => ({ ...prev, open: false })), 150);
  };

  const onSearch = (category: OptionCategory) => {
    const value = searchValues[category];
    if (!value) {
      // legacy: 빈 검색어 alert.
      window.alert("검색할 옵션상품명을 입력해주세요.");
      return;
    }
    searchMutation.mutate(
      { titleId: data.title_id, query: { category, value } },
      { onSuccess: (candidates) => openModal(category, candidates) },
    );
  };
  const onAdd = (productCode: string) => {
    addMutation.mutate(
      { titleId: data.title_id, payload: { category: modal.category, product_code: productCode } },
      { onSuccess: closeModal },
    );
  };
  const onDelete = (category: OptionCategory, productCode: string) => {
    deleteMutation.mutate({ titleId: data.title_id, category, productCode });
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
                  <a href="#" onClick={(event) => event.preventDefault()}>
                    홈
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(event) => event.preventDefault()}>
                    상품
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(event) => event.preventDefault()}>
                    대표상품 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">관련상품 설정</li>
              </ol>
            </div>
            <h4 className="page-title">
              {data.title_name} <small>({data.title_name_en})</small>
            </h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-2 mb-2 mb-sm-0">
          <TitleSubNav titleId={data.title_id} titleCode="33" active="option" />
        </div>
        <div className="col-10">
          {CATEGORIES.map((category) => (
            <OptionSection
              key={category.key}
              label={category.label}
              products={data.categories[category.key]}
              searchValue={searchValues[category.key]}
              onSearchChange={(v) => setSearchValues((prev) => ({ ...prev, [category.key]: v }))}
              onSearch={() => onSearch(category.key)}
              onDelete={(code) => onDelete(category.key, code)}
              productViewer={productViewer}
            />
          ))}
        </div>
      </div>

      {/* 옵션상품 검색 모달 */}
      {modal.open && (
        <OptionSearchModal
          shown={modalShown}
          candidates={modal.candidates}
          onAdd={onAdd}
          onClose={closeModal}
          productViewer={productViewer}
        />
      )}
    </>
  );
};

const won = (n: number) => `${n.toLocaleString()} 원`;

const PriceCell = ({ product }: { product: OptionProduct }) => {
  if (product.is_free === "Y") {
    return (
      <td className="text-end">
        무료
        <br />
        <a href={product.is_free_url} target="_blank" rel="noreferrer">
          무료URL 이동
        </a>
      </td>
    );
  }
  return (
    <td className="text-end">
      <div className="d-flex flex-column">
        <div>
          <s className="text-muted font-11">{won(product.consumer_price)}</s>
        </div>
        <div>
          ({" "}
          <span className="text-danger">
            <span className="mdi mdi-arrow-down-bold" />
            {product.discount}%
          </span>{" "}
          ) <span className="text-dark">{won(product.price)}</span>
        </div>
      </div>
    </td>
  );
};

const OptionSection = ({
  label,
  products,
  searchValue,
  onSearchChange,
  onSearch,
  onDelete,
  productViewer,
}: {
  label: string;
  products: OptionProduct[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  onDelete: (productCode: string) => void;
  productViewer: boolean;
}) => (
  <div className="card">
    <h5 className="card-header bg-secondary text-white">{label}</h5>
    <div className="card-body p-0">
      <table className="table table-bordered table-centered mb-0 table-sm">
        <colgroup>
          <col />
          <col width="40%" />
          <col />
          <col />
          <col />
          <col />
          <col />
          <col />
          <col />
        </colgroup>
        <thead className="table-light font-13">
          <tr>
            <th className="text-center">
              옵션
              <br />
              상품번호
            </th>
            <th className="text-center">옵션상품명</th>
            <th className="text-center" style={{ width: "80px" }}>
              플랫폼
            </th>
            <th className="text-center" style={{ width: "90px" }}>
              출시일
            </th>
            <th className="text-center">유형</th>
            <th className="text-center">공급처</th>
            <th className="text-center" style={{ width: "140px" }}>
              옵션상품
              <br />
              가격정보
            </th>
            <th className="text-center">판매상태</th>
            <th className="text-center">비고</th>
          </tr>
        </thead>
        <tbody className="font-12">
          {products.map((product) => (
            <tr key={product.product_code}>
              <td className="text-center">{product.product_code}</td>
              <td>{product.product_name}</td>
              <td className="text-center">{product.platform}</td>
              <td className="text-center">{product.release_date.slice(0, 10)}</td>
              <td className="text-center">
                {product.game_type}
                <br />({product.display_type})
              </td>
              <td className="text-center">{product.supplier}</td>
              <PriceCell product={product} />
              <td className="text-center">{STATUS_LABEL[product.status]}</td>
              <td className="text-center">
                <a
                  href={`/goods/goods_option_view?product_code=${product.product_code}`}
                  className="action-icon"
                >
                  <i className="mdi mdi-eye" />
                </a>
                <a
                  href={`/goods/goods_option_register?product_code=${product.product_code}&mode=modify`}
                  className="action-icon"
                >
                  <i className="mdi mdi-square-edit-outline" />
                </a>
                {/* legacy: product_viewer면 삭제 숨김. */}
                {!productViewer && (
                  <a
                    href="#"
                    className="action-icon"
                    onClick={(event) => {
                      event.preventDefault();
                      onDelete(product.product_code);
                    }}
                  >
                    <i className="mdi mdi-delete" />
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="card-footer">
      <div className="row">
        <div className="col-9">
          <input
            type="text"
            className="form-control"
            placeholder="검색할 옵션상품명을 입력해 주세요"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
        <div className="col-3">
          <button type="button" className="btn btn-dark shadow-none" onClick={onSearch}>
            옵션상품 검색
          </button>
        </div>
      </div>
    </div>
  </div>
);

const OptionSearchModal = ({
  shown,
  candidates,
  onAdd,
  onClose,
  productViewer,
}: {
  shown: boolean;
  candidates: OptionCandidate[];
  onAdd: (productCode: string) => void;
  onClose: () => void;
  productViewer: boolean;
}) => (
  <>
    <div
      className={`modal fade${shown ? " show" : ""}`}
      style={{ display: "block" }}
      tabIndex={-1}
      role="dialog"
    >
      <div className="modal-dialog modal-lg" style={{ maxWidth: "1100px" }}>
        <div className="modal-content">
          <div className="modal-header modal-colored-header bg-primary">
            <h4 className="modal-title">옵션상품 검색결과</h4>
            <button type="button" className="btn-close" aria-hidden="true" onClick={onClose} />
          </div>
          <div className="modal-body p-0">
            <table className="table table-border mb-0 table-sm">
              <thead className="table-dark font-14">
                <tr>
                  <th className="text-center" style={{ width: "80px" }}>
                    옵션상품
                    <br />
                    번호
                  </th>
                  <th className="text-center" style={{ width: "350px" }}>
                    옵션상품명
                    <br />
                    (영문명)
                  </th>
                  <th className="text-center" style={{ width: "100px" }}>
                    플랫폼
                  </th>
                  <th className="text-center" style={{ width: "150px" }}>
                    퍼블리셔
                  </th>
                  <th className="text-center" style={{ width: "150px" }}>
                    게임옵션
                    <br />
                    (번들옵션)
                  </th>
                  <th className="text-center" style={{ width: "100px" }}>
                    판매상태
                  </th>
                  <th className="text-center" style={{ width: "100px" }}>
                    비고
                  </th>
                </tr>
              </thead>
              <tbody className="font-13">
                {candidates.map((candidate) => (
                  <tr key={candidate.product_code}>
                    <td className="text-center">{candidate.product_code}</td>
                    <td className="text-start">
                      {candidate.product_name}
                      <br />({candidate.product_name_en})
                    </td>
                    <td className="text-center">{candidate.platform}</td>
                    <td className="text-center">{candidate.publisher}</td>
                    <td className="text-center">
                      {candidate.game_type}
                      {candidate.bundle_type ? <>({candidate.bundle_type})</> : null}
                    </td>
                    <td className="text-center">{STATUS_LABEL[candidate.status]}</td>
                    <td className="text-center">
                      {/* legacy: product_viewer면 옵션추가 숨김. */}
                      {!productViewer && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => onAdd(candidate.product_code)}
                        >
                          옵션추가
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {candidates.length === 0 && (
                  <tr>
                    <td className="text-center" colSpan={7}>
                      검색결과가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <div className={`modal-backdrop fade${shown ? " show" : ""}`} onClick={onClose} />
  </>
);
