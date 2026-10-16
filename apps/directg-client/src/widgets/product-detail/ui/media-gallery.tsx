"use client";

import { useState } from "react";

import type { MediaItem } from "@shared/types/product-detail";

/**
 * 미디어 영역 (legacy `#media` + `.media_change` 클릭 교체).
 * 메인 블록: video면 iframe, image면 img. 썸네일 클릭 시 메인 교체
 * (video → `//youtube.com/embed/{id}`, image → media_url).
 */
export function MediaGallery({ mediaList }: { mediaList: MediaItem[] }) {
  const [current, setCurrent] = useState(mediaList[0]);

  const mainUrl =
    current.media_type === "video" ? `//youtube.com/embed/${current.media_id}` : current.media_url;

  return (
    <section id="media" className="mb-3">
      <div className="row g-0">
        <div className="col-12">
          <div className="ratio ratio-16x9 mb-2" id="media_block">
            {current.media_type === "video" ? (
              <iframe id="media_frame" src={mainUrl} title="YouTube video" allowFullScreen />
            ) : (
              <img id="media_frame" src={mainUrl} className="w-100 img-fluid" />
            )}
          </div>
          <div id="media_list" className="overflow-x-scroll custom-scroll mb-0 py-3">
            <div className="d-flex flex-row justify-content-start flex-nowrap">
              {mediaList.map((value) => (
                <div
                  key={`${value.media_type}-${value.media_id}`}
                  className="position-relative"
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={value.media_thumb}
                    className="screenshot-thumbnail media_change"
                    alt="동영상 썸네일"
                    data-mediaid={value.media_id}
                    data-mediatype={value.media_type}
                    data-mediaurl={value.media_url}
                    onClick={() => setCurrent(value)}
                  />
                  {value.media_type === "video" && (
                    <div className="position-absolute top-50 start-50 translate-middle">
                      <div className="text-red fs-1">
                        <i className="fa-brands fa-youtube"></i>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
