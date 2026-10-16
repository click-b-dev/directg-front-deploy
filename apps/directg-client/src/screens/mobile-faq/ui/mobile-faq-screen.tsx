import type { FaqListResponse } from "@entities/board-faq";
import { MobileSubHeader } from "@widgets/mobile-sub-header";

/** legacy faq_type_label 16종 (mobile/board/faq.html). */
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

/** legacy `strip_tags` 등가 — 버튼 질문 인라인 표시(question_html Parsedown `<p>` 래퍼 제거). */
const stripTags = (html: string) => html.replace(/<[^>]*>/g, "");

interface MobileFaqScreenProps {
  data: FaqListResponse;
  searchValue: string;
}

/**
 * 모바일 자주묻는 질문 (legacy `mobile/board/faq.html`).
 * 검색 GET 폼 + Bootstrap 아코디언(data 속성). 더보기/페이지네이션 없음.
 */
export function MobileFaqScreen({ data, searchValue }: MobileFaqScreenProps) {
  return (
    <>
      <MobileSubHeader pageTitle="자주묻는 질문" />
      <div id="appCapsuleSub">
        <div className="extraHeader">
          <form className="search-form" id="search-form" method="GET" action="/board/faq">
            <div className="form-group searchbox">
              <input
                type="text"
                className="form-control"
                name="searchValue"
                defaultValue={searchValue}
                placeholder="검색어를 입력해 주세요."
              />
              <i className="input-icon">
                <ion-icon name="search-outline" role="img"></ion-icon>
              </i>
            </div>
          </form>
        </div>

        <div className="section full mt-2">
          {data.list.length === 0 && (
            <div className="section full mt-2">
              <div className="text-center mb-2">검색된 게시물이 없습니다.</div>
            </div>
          )}
          <div className="accordion" id="accordionExample1">
            {data.list.map((faq) => (
              <div className="accordion-item" key={faq.idx}>
                <h2 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#accordion${faq.idx}`}
                    aria-expanded="false"
                  >
                    [{FAQ_TYPE_LABEL[faq.faq_type]}] {stripTags(faq.question_html)}
                  </button>
                </h2>
                <div
                  id={`accordion${faq.idx}`}
                  className="accordion-collapse collapse"
                  data-bs-parent="#accordionExample1"
                >
                  <div
                    className="accordion-body"
                    dangerouslySetInnerHTML={{ __html: faq.answer_html }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
