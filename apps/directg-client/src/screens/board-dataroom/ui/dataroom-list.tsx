"use client";

import { postDataroomDownload, type DataroomItem } from "@entities/board-dataroom";

interface DataroomListProps {
  items: DataroomItem[];
}

/**
 * 자료실 카드 그리드 (legacy `thumb_data`). 썸네일 onError 숨김 + 다운로드 버튼.
 * 다운로드(legacy jQuery AJAX): fetch → 비로그인 alert(error_msg) / 로그인 window.open(file_url).
 */
export function DataroomList({ items }: DataroomListProps) {
  const handleDownload = async (idx: number, fileUrl: string) => {
    try {
      const data = await postDataroomDownload({ idx, file_url: fileUrl });
      if (data.status === "error") {
        alert(data.error_msg);
      } else {
        window.open(data.file_url, "_blank");
      }
    } catch (e) {
      alert(String(e));
    }
  };

  return (
    <div className="thumb_data">
      {items.map((value) => (
        <div key={value.idx} className="card rounded-0 bg-card border-0 p-0 flex-shrink-0">
          <div className="thumb-area p-0 position-relative flex-shrink-0">
            <img
              src={`/upload/dataroom/${value.thumbnail}`}
              className="card-img-top rounded-0 w-100 h-100"
              alt="..."
              onError={(e) => {
                e.currentTarget.style.visibility = "hidden";
              }}
            />
            <div className="label_area position-absolute bottom-0 start-0">
              <span className="label bg-warning rounded-0 font-12 fw-bold">월페이퍼</span>
            </div>
          </div>
          <div className="content-area bg-light d-flex flex-column h-100 text-secondary">
            <div className="title-area font-14 text-decoration-none text-truncate align-content-center flex-shrink-0">
              {value.file_name}
            </div>
            <div className="info-area d-flex h-100 w-100 justify-content-between bg-none-25">
              <div className="d-flex flex-column">
                <ul>
                  <li>배포일자: {value.deploy_date}</li>
                  <li dangerouslySetInnerHTML={{ __html: value.contents }} />
                </ul>
              </div>
              <div className="button-area d-flex align-self-end">
                <div className="wishlist-area text-center">
                  <button
                    type="button"
                    className="btn btn-sm btn-primary border-0 shadow-none btn_wishlist justify-content-center btn-file"
                    data-idx={value.idx}
                    data-url={value.file_url}
                    onClick={() => handleDownload(value.idx, value.file_url)}
                  >
                    <span className="icon_area">
                      <img
                        src="/assets/images/icon/download.svg"
                        className="d-block w-100"
                        alt=""
                      />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
