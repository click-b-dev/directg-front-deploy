"use client";

/**
 * 진행중 프로모션 랜딩 정렬 select — legacy `promotion_ing.html`(L239~245, L419~420).
 * discount 옵션 유효(thumb/list·search와 다름). onChange → `/promotion/promotion_ing?sort={val}`(sort만 유지 quirk).
 */
export function MobilePromotionIngLandingSort({ sort }: { sort: string }) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    location.href = `/promotion/promotion_ing?sort=${e.target.value}`;
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
        <option value="discount">높은할인률순</option>
      </select>
    </div>
  );
}
