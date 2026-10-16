"use client";

import { useState, useTransition } from "react";

import type { NoticeListRow } from "@entities/board-notice";

import { loadMoreNotices } from "../api/load-more-notices";

interface MobileNoticeListProps {
  initialList: NoticeListRow[];
  totalPages: number;
}

/**
 * 모바일 공지사항 목록 + "더보기" 증분 (legacy `mobile/board/notice.html` #notice_list + #btn_paging).
 * - data-page == data-total 이면 alert("마지막페이지입니다")
 * - 아니면 다음 page를 로드해 목록 아래에 append, data-page/current_page +1
 */
export function MobileNoticeList({ initialList, totalPages }: MobileNoticeListProps) {
  const [items, setItems] = useState<NoticeListRow[]>(initialList);
  const [dataPage, setDataPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  const handleMore = () => {
    if (dataPage === totalPages) {
      alert("마지막페이지입니다");
      return;
    }
    const nextPage = dataPage + 1;
    startTransition(async () => {
      const more = await loadMoreNotices(nextPage);
      setItems((prev) => [...prev, ...more]);
      setDataPage(nextPage);
    });
  };

  return (
    <>
      <div className="section full mt-2">
        <ul className="listview image-listview text" id="notice_list">
          {items.map((notice) => (
            <li key={notice.idx}>
              <a href={`/board/notice_view?idx=${notice.idx}`} className="item">
                <div className="in">
                  <div>
                    {notice.subject}
                    <footer>{notice.deploy_date.substring(0, 10)}</footer>
                  </div>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="wide-block pt-2 pb-2 border-0 dg_bg">
        <button
          type="button"
          className="btn btn-secondary btn-block"
          data-page={dataPage}
          data-total={totalPages}
          id="btn_paging"
          onClick={handleMore}
          disabled={isPending}
        >
          ({" "}
          <span className="px-1" id="current_page">
            {dataPage}
          </span>{" "}
          /{" "}
          <span className="px-1" id="total_page">
            {totalPages}
          </span>{" "}
          ) 더보기
        </button>
      </div>
    </>
  );
}
