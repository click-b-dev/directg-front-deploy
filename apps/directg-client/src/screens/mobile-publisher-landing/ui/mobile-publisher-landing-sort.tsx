"use client";

/**
 * 퍼블리셔 랜딩 정렬 select — legacy `publisher_<brand>.html`(L173~180, L357~360).
 * onChange → `{basePath}?sort={val}` 이동(**sort만 유지, 다른 파라미터 드롭 — legacy quirk**).
 */
export function MobilePublisherLandingSort({ basePath, sort }: { basePath: string; sort: string }) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    location.href = `${basePath}?sort=${e.target.value}`;
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
