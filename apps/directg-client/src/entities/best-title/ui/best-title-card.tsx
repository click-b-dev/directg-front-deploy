"use client";

import type { BestTitle } from "../model/types";

/** 인기게임 순위 카드 (legacy index.php #best_game). 커버 로드 실패 시 세로 BI로 대체. */
export function BestTitleCard({ title, ranking }: { title: BestTitle; ranking: number }) {
  return (
    <div className="col">
      <div className="card mb-0 rounded-1 card-shadow border-0 h-100">
        <div className="position-relative h-100 d-flex align-items-center">
          <div className="position-absolute top-0 start-0">
            <div className="ratio ratio-1x1" style={{ width: "32px", height: "32px" }}>
              <span className="badge bg-darkblue text-white rounded-0 font-14 num px-1 py-2">
                {ranking}
              </span>
            </div>
          </div>
          <a href={`/game/game_view?product_id=${title.sku}`} title={title.title_name}>
            <img
              src={`${title.domain}/upload/title/${title.title_id}/library/library_600x900.jpg`}
              className="card-img-top rounded-1"
              alt={title.title_name}
              onError={(e) => {
                e.currentTarget.src = "/assets/images/logo/H2_DG_BI_VERTICAL.svg";
              }}
            />
          </a>
        </div>
      </div>
    </div>
  );
}
