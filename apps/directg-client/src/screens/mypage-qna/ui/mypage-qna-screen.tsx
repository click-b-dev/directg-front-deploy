import { Fragment } from "react";

import type { QnaListResponse } from "@entities/mypage-qna";
import { MypageAside } from "@widgets/mypage-aside";
import { ServerPagination } from "@shared/ui/server-pagination";

import { QnaViewButton } from "./qna-view-button";

interface MypageQnaScreenProps {
  data: QnaListResponse;
}

/** legacy `$qnaGubun` (구분 코드 → 라벨). */
const QNA_GUBUN_LABEL: Record<string, string> = {
  "6": "계정, 회원, 인증",
  "7": "한글, 제공 콘텐츠",
  "1": "게임 설치, 플레이",
  "2": "주문, 결제",
  "4": "주문취소 및 환불",
  "3": "기타",
  "5": "제품 코드(키) 오류",
  "8": "할인, 가격",
  "9": "이용방법",
};

/**
 * 문의 내역 (legacy `pc/mypage/mypage_qna.html`). 세션 목록 + 아코디언(Bootstrap collapse).
 * 문의내용/답변은 백엔드 렌더 HTML. 답변보기 펼침 시 조회로그(QnaViewButton). 가드는 route.
 */
export function MypageQnaScreen({ data }: MypageQnaScreenProps) {
  const { list, page, totalPages } = data;

  return (
    <div className="container my-3 pb-5">
      <main className="d-grid gap-3" style={{ gridTemplateColumns: "240px auto" }}>
        <MypageAside active="qna" />
        <section id="content" className="content rounded-0 font-14">
          <div className="col-12">
            <div className="card mb-0 shadow-none rounded-0 text-center">
              <div className="card-header border-bottom accordion align-content-center text-nowrap">
                <div className="row fw-bold">
                  <div className="col-2">구분</div>
                  <div className="col-6">제목</div>
                  <div className="col-2">작성일자</div>
                  <div className="col-2">답변여부</div>
                </div>
              </div>
              <div className="card-body py-0 text-nowrap">
                {list.map((value, i) => (
                  <Fragment key={value.idx}>
                    <div className="row border-top py-2 align-items-center">
                      <div className="col-2">{QNA_GUBUN_LABEL[value.gubun]}</div>
                      <div className="col-6 text-start text-wrap">{value.subject}</div>
                      <div className="col-2">{value.reg_date}</div>
                      <div className="col-2">
                        {value.is_answer === "Y" ? (
                          <QnaViewButton idx={value.idx} targetId={`collapse-${i}`} />
                        ) : (
                          <button
                            className="btn btn-sm btn-dark font-14 w-75"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target={`#collapse-${i}`}
                            aria-expanded="false"
                            aria-controls={`#collapse-${i}`}
                            data-idx={value.idx}
                          >
                            답변대기중
                          </button>
                        )}
                      </div>
                    </div>

                    <div id={`collapse-${i}`} className="collapse text-start">
                      <div className="card-body mb-3">
                        <h4>문의내용</h4>
                        <div
                          className="card p-3 shadow-none rounded-0 text-wrap"
                          dangerouslySetInnerHTML={{ __html: value.contents_html }}
                        />
                        <hr />
                        <h4>답변</h4>
                        {value.is_answer === "Y" ? (
                          <div
                            className="card p-3 shadow-none rounded-0 text-wrap"
                            dangerouslySetInnerHTML={{ __html: value.answer_html }}
                          />
                        ) : (
                          <div className="card p-3 shadow-none rounded-0 text-wrap">
                            답변 대기중 입니다.
                          </div>
                        )}
                      </div>
                    </div>
                  </Fragment>
                ))}

                {list.length === 0 && <div className="p-3">등록된 문의가 없습니다.</div>}
              </div>
            </div>
          </div>
          <div id="pagination" className="mt-4">
            <ServerPagination page={page} totalPages={totalPages} baseUrl="/mypage/mypage_qna" />
          </div>
        </section>
      </main>
    </div>
  );
}
