import { Fragment } from "react";

import type { FaqListResponse } from "@entities/board-faq";
import { CustomerAside } from "@widgets/customer-aside";
import { ServerPagination } from "@shared/ui/server-pagination";

interface BoardFaqScreenProps {
  data: FaqListResponse;
  /** 검색어(legacy `$searchValue`) — 검색 input value 유지용. */
  searchValue: string;
}

/** legacy `$faq_type_label` (faq_type 코드 → 구분 라벨). */
const FAQ_TYPE_LABEL: Record<string, string> = {
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

/**
 * 자주묻는질문 (legacy `pc/board/faq.html`). SSR + aside_customer.
 * 질문/답변은 백엔드 렌더 HTML. 아코디언은 Bootstrap collapse(data 속성, 전역 번들).
 * 빈 목록 메시지는 legacy 버그($qna_list 미정의)로 미출력. 페이지네이션은 검색어 미포함(quirk).
 */
export function BoardFaqScreen({ data, searchValue }: BoardFaqScreenProps) {
  const { list, page, totalPages } = data;

  return (
    <div className="container my-3 pb-5">
      <main className="d-grid gap-3" style={{ gridTemplateColumns: "240px auto" }}>
        <CustomerAside active="faq" />
        <section id="content" className="content rounded-0">
          <div className="row">
            <div className="col-12">
              <form method="GET" action="">
                <div className="mb-3 input-group rounded-0">
                  <input
                    className="form-control form-control-lg rounded-0"
                    type="text"
                    name="searchValue"
                    placeholder="궁금하신 점이 있다면 여기서 먼저 찾아보세요"
                    defaultValue={searchValue}
                  />
                  <button
                    type="submit"
                    id="button-addon2"
                    className="btn btn-lg btn-secondary rounded-0"
                  >
                    자주묻는질문 검색
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="card mb-0 shadow-none rounded-0 text-center font-14">
            <div className="card-header border-bottom accordion align-content-center text-wrap">
              <div className="row fw-bold">
                <div className="col-2">구분</div>
                <div className="col-10">제목</div>
              </div>
            </div>
            <div className="card-body py-0 text-wrap">
              {list.map((value, i) => (
                <Fragment key={value.idx}>
                  <div
                    className="row border-top py-2 align-items-center"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapse-${i}`}
                    aria-expanded="false"
                    aria-controls={`#collapse-${i}`}
                    data-idx={value.idx}
                  >
                    <div className="col-2">{FAQ_TYPE_LABEL[value.faq_type]}</div>
                    <div
                      className="col-10 text-start text-wrap cursor-pointer"
                      dangerouslySetInnerHTML={{ __html: value.question_html }}
                    />
                  </div>

                  <div id={`collapse-${i}`} className="collapse text-start">
                    <div
                      className="card-body m-5"
                      dangerouslySetInnerHTML={{ __html: value.answer_html }}
                    />
                  </div>
                </Fragment>
              ))}
            </div>
            <div id="pagination" className="mt-4">
              <ServerPagination page={page} totalPages={totalPages} baseUrl="/board/faq" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
