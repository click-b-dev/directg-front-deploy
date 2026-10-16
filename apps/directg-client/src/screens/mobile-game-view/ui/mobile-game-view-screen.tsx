import { type GameDetailResponse, MobileGameOptionCard } from "@entities/game-detail";
import { MobileSubHeader } from "@widgets/mobile-sub-header";

/** legacy 플랫폼 코드 → svg 파일명(mobile 탭 switch: 1/34/35만). */
const PLATFORM_FILE: Record<string, string> = {
  "1": "steam",
  "34": "epic_w",
  "35": "rockstar_2",
};

/** legacy `date("Y년 m월 d일")` — release_date(YYYY-MM-DD)를 zero-pad 유지해 포맷. */
function formatReleaseDate(releaseDate: string): string {
  const [y, m, d] = releaseDate.slice(0, 10).split("-");
  return `${y}년 ${m}월 ${d}일`;
}

/** legacy `strip_tags` 등가 — 렌더된 HTML에서 태그 제거(권리표기 텍스트화). */
const stripTags = (html: string) => html.replace(/<[^>]*>/g, "");

/** 안내 alert 블록 (legacy `section full mb-2 > wide-block px-2 mt-2 > alert rounded-0 > p`). */
function AlertBlock({ children, danger = false }: { children: string; danger?: boolean }) {
  return (
    <div className="section full mb-2">
      <div className="wide-block px-2 mt-2">
        <div
          className={`alert ${danger ? "alert-danger" : "alert-secondary"} rounded-0`}
          role="alert"
        >
          <p className="text-break text-wrap font-14 mb-0">{children}</p>
        </div>
      </div>
    </div>
  );
}

interface MobileGameViewScreenProps {
  data: GameDetailResponse;
  productId: string;
  sku: string;
}

/**
 * 모바일 게임 상세 (legacy `mobile/game/game_view.html`). 서브페이지 셸(sub_header + appCapsuleSub).
 * PC보다 단순: 미디어/DLC/추천/toggle 없음. 위시·장바구니는 order 도메인 이월(마크업만).
 */
export function MobileGameViewScreen({ data, productId, sku }: MobileGameViewScreenProps) {
  const t = data.title_info;
  const pageTitle = t.title_name;

  if (data.goods_status === "N") {
    return (
      <>
        <MobileSubHeader pageTitle={pageTitle} />
        <div id="appCapsuleSub" className="full-height">
          <div className="error-page">
            <div className="icon-box text-danger">
              <ion-icon name="alert-circle" role="img" aria-label="alert circle"></ion-icon>
            </div>
            <h1 className="title">ERROR</h1>
            <div className="text mb-5 font-16">{data.goods_status_msg}</div>
          </div>
        </div>
      </>
    );
  }

  const platformItem = data.goods_item[data.platform] ?? {};
  const gameOptions = platformItem.game ?? [];
  const editionOptions = platformItem.edition ?? [];
  const hasKorean =
    t.spoken_korean === "Y" || t.interface_korean === "Y" || t.exclusive_korean === "Y";

  // 연령/게임등급 아이콘 (legacy: age_limit "10"→age_all, else age_{limit}; game_rate 각 자리 "1"→grade{i+1})
  const ageImg = t.age_limit === "10" ? "age_all.png" : t.age_limit ? `age_${t.age_limit}.png` : "";
  const gradeImgs = t.game_rate
    .split("")
    .map((c, i) => (c === "1" ? `grade${i + 1}.png` : null))
    .filter((v): v is string => v !== null);

  return (
    <>
      <MobileSubHeader pageTitle={pageTitle} />
      <div id="appCapsuleSub" className="full-height">
        {/* 타이틀 카드 */}
        <div className="card mb-2">
          <div className="card-header">{t.title_name}</div>
          <img
            src={`${t.domain}/upload/title/${t.title_id}/header/${t.title_id}.jpg`}
            className="card-img-top rounded-0"
            alt={t.title_name}
          />
          <div className="card-body text-white font-14 p-2">
            {data.goods_description.short_description}
          </div>
        </div>

        {/* 안내 alert */}
        {data.flags.only_multiplayer === "Y" && (
          <AlertBlock>
            온라인/멀티플레이 전용 게임입니다. 싱글플레이는 지원하지 않습니다.
          </AlertBlock>
        )}
        {data.flags.is_early_access === "Y" && (
          <AlertBlock>
            정식 출시 전 앞서 해보기를 진행하는 상품입니다. 게임 내 기술적인 요소와 컨텐츠, 언어
            등은 지속적인 업데이트를 통해 개선될 예정입니다.
          </AlertBlock>
        )}
        {t.drm_notice && (
          <AlertBlock>{` 제 3자 DRM을 사용합니다. (${stripTags(t.drm_notice)})`}</AlertBlock>
        )}
        {t.ext_user_account_notice && (
          <AlertBlock>{stripTags(t.ext_user_account_notice)}</AlertBlock>
        )}
        {data.goods_description.region_msg && (
          <AlertBlock danger>{data.goods_description.region_msg}</AlertBlock>
        )}

        {/* 플랫폼 탭 */}
        <div className="section full mb-2">
          <div className="section-title">플랫폼</div>
          <div className="wide-block px-2 mt-2">
            <ul className="nav nav-pills">
              {data.title_platform.map((p) => {
                const code = p.product_platform;
                const active = code === data.platform;
                const file = PLATFORM_FILE[code];
                return (
                  <li className="nav-item col-4" key={code}>
                    <a
                      href={`/game/game_view?product_id=${productId}&sku=${sku}&platform=${code}`}
                      className="nav-link rounded-0 p-0"
                    >
                      <div
                        className={`w-100 h-100 d-flex justify-content-center align-items-center border ${
                          active ? "active border-primary border-4" : "border-2"
                        } bg-none p-0`}
                      >
                        <img
                          src={`/mobile-assets/images/platform/${file}.svg?1`}
                          className={`rounded-0 bg-none ${active ? "" : "opacity-30"} w-100`}
                          alt=""
                        />
                      </div>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* 기본게임 */}
        {gameOptions.length > 0 && (
          <div className="section full mb-2">
            <div className="section-title">기본게임</div>
            <div className="wide-block p-0">
              <ul className="listview simple-listview">
                {gameOptions.map((o) => (
                  <MobileGameOptionCard key={o.product_code} option={o} />
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* 에디션 */}
        {editionOptions.length > 0 && (
          <div className="section full mb-2">
            <div className="section-title">에디션</div>
            <div className="wide-block p-0 py-2">
              <ul className="listview simple-listview">
                {editionOptions.map((o) => (
                  <MobileGameOptionCard key={o.product_code} option={o} />
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* 상품 정보 제공 고시 (정적) */}
        <div className="section full mb-2">
          <div className="section-title">상품 정보 제공 고시 (디지털 콘텐츠)</div>
          <div className="wide-block p-0">
            <ul className="list-unstyled mb-0">
              <li className="ps-2 py-2 border-bottom border-opacity-25">
                <div className="p-0">
                  <span className="text-secondary font-14">제작자 또는 공급자</span>
                  <p className="font-12 mb-0">상세정보 개발사/퍼블리셔 참조</p>
                </div>
              </li>
              <li className="ps-2 py-2 border-bottom border-opacity-25">
                <div className="p-0">
                  <span className="text-secondary font-14">이용조건/이용기간</span>
                  <p className="font-12 mb-0">
                    제품 코드 수신, 등록 후{" "}
                    <a href="https://store.steampowered.com/" target="_blank" rel="noreferrer"></a>
                    의 서비스 종료까지
                  </p>
                </div>
              </li>
              <li className="ps-2 py-2 border-bottom border-opacity-25">
                <div className="p-0">
                  <span className="text-secondary font-14">상품 제공 방식</span>
                  <p className="font-12 mb-0">마이페이지를 통한 제품 코드 실시간 발송</p>
                </div>
              </li>
              <li className="ps-2 py-2 border-bottom border-opacity-25">
                <div className="p-0">
                  <span className="text-secondary font-14">최소 시스템 사양, 필수 소프트웨어</span>
                  <p className="font-12 mb-0">
                    <a href="#system_info">시스템 요구사항</a> 참조
                  </p>
                </div>
              </li>
              <li className="ps-2 py-2 border-bottom border- 1 border-opacity-25">
                <div className="p-0">
                  <span className="text-secondary font-14">
                    청약철회 또는 계약의 해제 해지의 따른 효과
                  </span>
                  <p className="font-12 mb-0">
                    <a href="/service/refund_policy" target="_blank" rel="noreferrer">
                      환불정책안내
                    </a>{" "}
                    참조
                  </p>
                </div>
              </li>
              <li className="ps-2 py-2 border-bottom border- 1 border-opacity-25">
                <div className="p-0">
                  <span className="text-secondary font-14">소비자상담 관련 전화번호</span>
                  <p className="font-12 mb-0">1544-2367</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* 상세정보 */}
        <div className="section full mb-2">
          <div className="section-title">상세정보</div>
          <div className="wide-block p-0">
            <ul className="list-unstyled mb-0">
              <li className="px-3 py-2 border-bottom border-opacity-25">
                <p className="mb-0">
                  <span className="text-secondary me-1 fw-500 font-14">출시일</span>
                  <span className="font-14">{formatReleaseDate(t.release_date)}</span>
                </p>
              </li>
              <li className="px-3 py-2 border-bottom border-opacity-25">
                <p className="mb-0">
                  <span className="text-secondary me-1 fw-500 font-14">개발사</span>
                  <span className="font-14">{t.developer}</span>
                </p>
              </li>
              <li className="px-3 py-2 border-bottom border-opacity-25">
                <p className="mb-0">
                  <span className="text-secondary me-1 fw-500 font-14">퍼블리셔</span>
                  <span className="font-14">{t.publisher}</span>
                </p>
              </li>
              {hasKorean ? (
                <li className="px-3 py-2 border-bottom border-opacity-25">
                  <p className="mb-0">
                    <span className="text-secondary me-1 fw-500 font-14">언어지원</span>
                    <span className="badge bg-secondary font-12 fw-400 rounded-2">
                      {t.spoken_korean === "Y" ? "음성 한글" : ""}
                    </span>
                    <span className="badge bg-secondary font-12 fw-400 rounded-2">
                      {t.interface_korean === "Y" ? "인터페이스/자막 한글" : ""}
                    </span>
                    <span className="badge bg-secondary font-12 fw-400 rounded-2">
                      {t.exclusive_korean === "Y" ? "독점/한글패치" : ""}
                    </span>
                  </p>
                </li>
              ) : (
                <li className="px-3 py-2 border-bottom border-opacity-25">
                  <p className="mb-0">
                    <span className="text-secondary me-1 fw-500 font-14">언어지원</span>
                    <span className="badge bg-secondary font-12 fw-400 rounded-2">
                      한국어지원안함
                    </span>
                  </p>
                </li>
              )}
              {/* legacy 퍼블리셔 중복 행(quirk 보존) */}
              <li className="px-3 py-2 border-bottom border-opacity-25">
                <p className="mb-0">
                  <span className="text-secondary me-1 fw-500 font-14">퍼블리셔</span>
                  <span className="font-14">{t.publisher}</span>
                </p>
              </li>
              <li className="px-3 py-2 border-bottom border-opacity-25">
                <div className="d-flex flex-row flex-wrap">
                  {data.genre_names.map((name, i) => (
                    <span
                      key={`g${i}`}
                      className="badge bg-secondary font-12 fw-400 px-2 rounded-2 me-1 my-1"
                    >
                      {name}
                    </span>
                  ))}
                  {data.category_names.map((name, i) => (
                    <span
                      key={`c${i}`}
                      className="badge bg-secondary font-12 fw-400 px-2 rounded-2 me-1 my-1"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </li>
              <li className="px-3 py-2 border-1 border-bottom border-opacity-25">
                <div className="d-flex flex-row flex-wrap">
                  {ageImg && (
                    <img
                      src={`/mobile-assets/images/game/${ageImg}`}
                      className="me-1 my-1"
                      alt=""
                    />
                  )}
                  {gradeImgs.map((g) => (
                    <img
                      key={g}
                      src={`/mobile-assets/images/game/${g}`}
                      className="me-1 my-1"
                      alt=""
                    />
                  ))}
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* 진행중인 이벤트 */}
        {data.is_event_info === "Y" && data.event_data && (
          <div className="section full">
            <div className="section-title">진행중인 이벤트</div>
            <div className="wide-block mb-2 border-0">
              <div className="card">
                <img
                  src={data.event_data.event_banner}
                  className="card-img-top rounded-0"
                  alt={data.event_data.subject}
                />
                <div className="card-body p-2">
                  <h5 className="card-title font-14">■ {data.event_data.subject}</h5>
                  <div
                    className="event_contents font-12"
                    dangerouslySetInnerHTML={{
                      __html: `${data.event_data.contents_html}<hr>${data.event_data.event_notes_html}`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 상세설명 */}
        <div className="section full">
          <div className="section-title">상세설명</div>
          <div className="wide-block pt-2 pb-2">
            <div
              className="goods_detail_info"
              dangerouslySetInnerHTML={{ __html: data.description_html }}
            />
          </div>
        </div>

        {/* 시스템 요구사항 */}
        <a id="system_info"></a>
        <div className="section full">
          <div className="section-title">시스템 요구사항</div>
          <div className="wide-block pt-2 pb-2">
            <div
              className="goods_detail_info"
              dangerouslySetInnerHTML={{ __html: data.requirements_html }}
            />
          </div>
        </div>

        {/* 권리표기 (strip_tags) */}
        <a id="copyright"></a>
        <div className="section full">
          <div className="section-title">권리표기</div>
          <div className="wide-block pt-2 pb-2">
            <div className="goods_detail_info">{stripTags(data.legal_html)}</div>
          </div>
        </div>
      </div>
    </>
  );
}
