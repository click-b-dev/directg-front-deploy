import type { GameListResponse } from "@entities/game-list";
import {
  ProductGridCard,
  ProductListCard,
  ProductThumbCard,
  type ProductThumb,
} from "@entities/product-thumb";
import { ServerPagination } from "@shared/ui/server-pagination";
import { Breadcrumb } from "@widgets/breadcrumb";
import { GameFilter } from "@widgets/game-filter";
import { GameFilterOrder } from "@widgets/game-filter-order";

type ViewType = "thumb" | "list" | "grid";

interface GamePlatformScreenProps {
  data: GameListResponse;
  /** 현재 platform 코드 (페이지네이션 param 유지). */
  platform: string;
  /** legacy switch 매핑 결과(Steam/Epic Games/Rockstar Games), page_title·breadcrumb. */
  platformName: string;
  /** legacy $page_type — thumb/list/grid 뷰. */
  viewType: ViewType;
}

/**
 * 플랫폼별 상품 목록 (legacy `pc/game/game_platform_{thumb,list,grid}.html`). 공개 SSR.
 * game_category 동형 — platform 필터 블록만 숨김(genre 표시). page_title은 platform 코드 정적 매핑.
 */
export function GamePlatformScreen({
  data,
  platform,
  platformName,
  viewType,
}: GamePlatformScreenProps) {
  const { list, page, totalPages, total } = data;

  return (
    <>
      {/* legacy header.html breadcrumb: 다이렉트 게임즈 > 게임 > 플랫폼별 ({platformName}). "게임" 링크는 page_type 의존. */}
      <Breadcrumb
        items={[
          { label: "게임", href: `/game/game_${viewType}.html` },
          { label: `플랫폼별 (${platformName})` },
        ]}
      />
      <div className="container my-3 pb-5">
        {/* legacy game 목록 카드 그리드 (home/board-dataroom 선례와 동일 로드) */}
        <link rel="stylesheet" href="/assets/css/card-list.css" />
        <main>
          <GameFilter aside={{ productType: true, platform: false }} />
          <section id="content" className="content rounded-0">
            <GameFilterOrder total={total} basePath="/game/game_platform" pageType={viewType} />
            <PlatformList viewType={viewType} list={list} />

            <div id="pagination" className="mt-4">
              <ServerPagination
                page={page}
                totalPages={totalPages}
                baseUrl={`/game/game_platform_${viewType}.html`}
                params={{ platform }}
              />
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

/** 뷰별 카드 컨테이너 (legacy #thumb_list / #card_list>.row.g-3 / #grid_list). */
function PlatformList({ viewType, list }: { viewType: ViewType; list: ProductThumb[] }) {
  if (viewType === "list") {
    return (
      <div id="card_list">
        <div className="row g-3">
          {list.map((product) => (
            <ProductListCard key={product.goods_sku} product={product} />
          ))}
        </div>
      </div>
    );
  }
  if (viewType === "grid") {
    return (
      <div id="grid_list">
        {list.map((product) => (
          <ProductGridCard key={product.goods_sku} product={product} />
        ))}
      </div>
    );
  }
  return (
    <div id="thumb_list">
      {list.map((product) => (
        <ProductThumbCard key={product.goods_sku} product={product} />
      ))}
    </div>
  );
}
