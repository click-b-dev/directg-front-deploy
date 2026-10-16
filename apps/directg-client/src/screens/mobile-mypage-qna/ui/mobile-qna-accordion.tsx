"use client";

import { useState, useTransition, type MouseEvent } from "react";

import { postMypageQnaView, type QnaRow } from "@entities/mypage-qna";

import { loadMoreQna } from "../api/load-more-qna";

interface MobileQnaAccordionProps {
  initialList: QnaRow[];
  totalPages: number;
}

/**
 * 모바일 문의 내역 아코디언 + 더보기 (legacy `mobile/mypage/mypage_qna.html` #accordion / #btn_more).
 * - Bootstrap collapse(data 속성, data-bs-parent 단일 오픈)로 토글.
 * - 조회로그: **초기 렌더 답변완료 항목**을 펼칠 때만 `postMypageQnaView`(fire-and-forget).
 *   legacy 처럼 버튼의 실제 `aria-expanded`를 읽어 펼침 전환을 판정한다.
 * - legacy quirk: 더보기(ajax_qna.php) 증분 항목은 `btn-show-answer`/`data-idx`가 없어 조회로그 미발생 → 로그 미배선.
 */
export function MobileQnaAccordion({ initialList, totalPages }: MobileQnaAccordionProps) {
  const [items, setItems] = useState<QnaRow[]>(initialList);
  const [dataPage, setDataPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  // 초기 렌더 항목 수 — 이 인덱스 미만만 조회로그를 남긴다(증분 항목 제외).
  const initialCount = initialList.length;

  const handleAnswerClick = (event: MouseEvent<HTMLButtonElement>, row: QnaRow) => {
    // legacy: 답변대기중은 로그 없음.
    if (row.is_answer !== "Y") return;
    // React onClick은 Bootstrap 토글보다 먼저 실행 → aria-expanded는 클릭 직전 값(펼치기 전 "false").
    const willExpand = event.currentTarget.getAttribute("aria-expanded") === "false";
    if (willExpand) {
      void postMypageQnaView(row.idx);
    }
  };

  const handleMore = () => {
    const nextPage = dataPage + 1;
    startTransition(async () => {
      const more = await loadMoreQna(nextPage);
      setItems((prev) => [...prev, ...more]);
      setDataPage(nextPage);
    });
  };

  const isLastPage = dataPage >= totalPages;

  return (
    <>
      <div className="accordion" id="accordion">
        {items.map((row, index) => {
          const answered = row.is_answer === "Y";
          const logsView = index < initialCount; // 초기 항목만 조회로그(quirk 1)
          const collapseId = `accordion_${row.idx}`;
          return (
            <div className="accordion-item" key={`${row.idx}-${index}`}>
              <h2 className="accordion-header">
                <button
                  className={`${logsView ? "btn-show-answer " : ""}accordion-button collapsed justify-content-between pe-5`}
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#${collapseId}`}
                  aria-expanded="false"
                  {...(logsView ? { "data-idx": row.idx } : {})}
                  onClick={logsView ? (event) => handleAnswerClick(event, row) : undefined}
                >
                  <span className="col-9 p-0">{row.subject}</span>
                  {answered ? (
                    <span className="badge badge-primary col-3 ms-1">답변완료</span>
                  ) : (
                    <span className="badge badge-danger col-3 ms-1">답변대기중</span>
                  )}
                </button>
              </h2>
              <div
                id={collapseId}
                className="accordion-collapse collapse"
                data-bs-parent="#accordion"
              >
                <div className="accordion-body py-0">
                  <div className="card-body mb-3 p-1">
                    <h4>문의내용</h4>
                    <div
                      className="p-1 shadow-none rounded-0"
                      dangerouslySetInnerHTML={{ __html: row.contents_html }}
                    />
                    <hr />
                    <h4>답변</h4>
                    {answered ? (
                      <div
                        className="p-1 shadow-none rounded-0"
                        dangerouslySetInnerHTML={{ __html: row.answer_html }}
                      />
                    ) : (
                      <div className="p-1 shadow-none rounded-0">답변 대기중 입니다.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="col-12">
        <input
          type="button"
          className={`btn ${isLastPage ? "btn-secondary" : "btn-primary"} btn-lg btn-block`}
          value={isLastPage ? "마지막 페이지" : "더보기"}
          name="btn_more"
          id="btn_more"
          data-page={dataPage}
          onClick={handleMore}
          disabled={isPending}
        />
      </div>
    </>
  );
}
