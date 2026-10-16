"use client";

/**
 * 통합검색 정렬 select — legacy `game_search.html`(L239~245, L416~419).
 * onChange → `/game/game_search?q={q}&sort={val}` 이동(**q·sort만 유지, 다른 필터 드롭 — legacy quirk**).
 */
export function MobileGameSearchSort({ q, sort }: { q: string; sort: string }) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    location.href = `/game/game_search?q=${q}&sort=${e.target.value}`;
  };

  return (
    <div className="boxed align-self-center">
      <select
        className="form-control form-select-sm form-select"
        id="sort"
        name="sort"
        defaultValue={sort}
        onChange={handleChange}
      >
        <option value="">::::정렬순서:::</option>
        <option value="release">출시일순</option>
        <option value="pricedown">낮은가격순</option>
        <option value="priceup">높은가격순</option>
      </select>
    </div>
  );
}
