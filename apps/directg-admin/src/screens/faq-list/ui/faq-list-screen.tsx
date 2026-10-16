import { useFaqList, type FaqListSearch, type FaqListItem } from "@entities/faq";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/board/faq_list";

// legacy faq_type_label — 구분 셀 라벨.
const FAQ_TYPE_LABELS: Record<string, string> = {
  M01: "계정, 회원",
  M02: "포인트",
  O01: "주문, 결제",
  O02: "제품 코드(키)",
  O03: "취소, 환불",
  O04: "가격",
  O05: "할인",
  G01: "상품",
  G02: "구성, DLC",
  G03: "특전",
  G04: "한글",
  S01: "이용방법",
  S02: "게임 등록",
  S03: "게임 설치",
  S04: "게임 실행",
  E01: "기타",
};

// legacy 구분 btn-group — 표시 순서·비순차 id 그대로.
const FILTER_BUTTONS: { value: string; id: string; label: string }[] = [
  { value: "all", id: "item_cd_all", label: "전체" },
  { value: "M01", id: "item_cd_2", label: "계정, 회원" },
  { value: "M02", id: "item_cd_16", label: "포인트" },
  { value: "S01", id: "item_cd_1", label: "이용방법" },
  { value: "S02", id: "item_cd_6", label: "게임 등록" },
  { value: "S03", id: "item_cd_10", label: "게임 설치" },
  { value: "S04", id: "item_cd_9", label: "게임 실행" },
  { value: "G01", id: "item_cd_13", label: "상품" },
  { value: "G02", id: "item_cd_7", label: "구성, DLC" },
  { value: "G03", id: "item_cd_8", label: "특전" },
  { value: "G04", id: "item_cd_11", label: "한글" },
  { value: "O01", id: "item_cd_3", label: "주문, 결제" },
  { value: "O02", id: "item_cd_5", label: "제품 코드(키)" },
  { value: "O03", id: "item_cd_4", label: "취소, 환불" },
  { value: "O04", id: "item_cd_12", label: "가격" },
  { value: "O05", id: "item_cd_14", label: "할인" },
  { value: "E01", id: "item_cd_15", label: "기타" },
];

// legacy board/faq_list.php — 자주묻는질문 목록.
export const FaqListScreen = (search: FaqListSearch) => {
  const { data } = useFaqList(search);
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
                    게시판
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    자주묻는질문 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">자주묻는질문 목록</li>
              </ol>
            </div>
            <h4 className="page-title">자주묻는질문 목록</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row g-2">
        <div className="card">
          <h5 className="card-header bg-secondary text-white">검색필터</h5>
          <div className="card-body">
            <form className="form-horizontal" method="get" action={BASE_URL}>
              <div className="row mb-2">
                <label
                  htmlFor="search_title_id"
                  className="col-sm-1 col-form-label bg-light border text-center"
                >
                  구분
                </label>
                <div className="col-sm-11">
                  <div
                    className="btn-group"
                    role="group"
                    aria-label="Basic radio toggle button group"
                  >
                    {FILTER_BUTTONS.map((b) => (
                      <FilterButton key={b.id} button={b} selected={search.search_item_cd} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="row mb-2">
                <label
                  htmlFor="search_subject"
                  className="col-sm-1 col-form-label bg-light border text-center"
                >
                  질문검색
                </label>
                <div className="col-sm-4">
                  <input
                    type="text"
                    className="form-control"
                    id="search_subject"
                    name="search_subject"
                    placeholder="검색어"
                    defaultValue={search.search_subject}
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-lg-12">
                  <div className="float-end">
                    <button type="submit" className="btn btn-primary btn-sm shadow-none">
                      자주묻는질문 검색
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="d-flex flex-row justify-content-between mb-2">
        <div className="float-start">{data.pagination.total_results.toLocaleString()} 개</div>
        <div className="float-end" />
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table
                  className="table table-centered w-100 dt-responsive nowrap table-sm table-bordered"
                  id=""
                >
                  <thead className="table-light font-14">
                    <tr>
                      <th className="all" style={{ width: "20px" }}>
                        <div className="form-check">
                          <input type="checkbox" className="form-check-input" id="customCheck1" />
                          <label className="form-check-label" htmlFor="customCheck1">
                            &nbsp;
                          </label>
                        </div>
                      </th>
                      <th className="text-center" style={{ width: "50px" }}>
                        번호
                      </th>
                      <th className="text-center" style={{ width: "100px" }}>
                        구분
                      </th>
                      <th className="text-center">내용</th>
                      <th className="text-center" style={{ width: "80px" }}>
                        비고
                      </th>
                    </tr>
                  </thead>
                  <tbody className="font-14">
                    {data.items.map((item) => (
                      <FaqRow key={item.idx} item={item} />
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
                    search_item_cd: search.search_item_cd,
                    search_subject: search.search_subject,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const FilterButton = ({
  button,
  selected,
}: {
  button: { value: string; id: string; label: string };
  selected: string;
}) => (
  <>
    <input
      type="radio"
      className="btn-check"
      name="search_item_cd"
      id={button.id}
      autoComplete="off"
      value={button.value}
      defaultChecked={selected === button.value}
    />
    <label className="btn btn-outline-primary shadow-none" htmlFor={button.id}>
      {button.label}
    </label>
  </>
);

const FaqRow = ({ item }: { item: FaqListItem }) => (
  <tr>
    <td className="text-center">
      <div className="form-check">
        <input
          type="checkbox"
          className="form-check-input"
          id={`idx${item.idx}`}
          name="idx"
          value={item.idx}
        />
        <label className="form-check-label" htmlFor="idx">
          &nbsp;
        </label>
      </div>
    </td>
    <td className="text-center px-1">{item.idx}</td>
    <td className="text-center px-1">{FAQ_TYPE_LABELS[item.faq_type]}</td>
    <td className="text-start px-1">
      <div className="card">
        <div className="card-header p-1 ps-2">
          <strong className="pe-2">[질문]</strong> {item.question}
        </div>
        <div className="card-body p-1">
          <div className="d-flex flex-row align-items-start">
            <div className="p-1" style={{ minWidth: "50px" }}>
              <strong>[답변]</strong>
            </div>
            <div className="p-1" dangerouslySetInnerHTML={{ __html: item.answer_html }} />
          </div>
        </div>
      </div>
    </td>
    <td className="text-center px-1">
      <a href={`/board/faq_register?mode=modify&idx=${item.idx}`} className="action-icon">
        {" "}
        <i className="mdi mdi-square-edit-outline" />
      </a>
    </td>
  </tr>
);
