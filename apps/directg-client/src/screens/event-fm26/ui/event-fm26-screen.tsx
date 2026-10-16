import type { Fm26Status } from "@entities/event";
import type { MemberSession } from "@entities/member-auth";

import { EventApplyButton } from "./event-apply-button";

interface EventFm26ScreenProps {
  /** 로그인 세션(null=미로그인). legacy `$_SESSION['member']['m_no']`. */
  member: MemberSession | null;
  /** 이벤트#01 상태(로그인 시에만 조회). 미로그인이면 null. */
  status: Fm26Status | null;
}

/** legacy breadcrumb divider SVG(회색 chevron). */
const BREADCRUMB_DIVIDER =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Cpath d='M2.5 0L1 1.5 3.5 4 1 6.5 2.5 8l4-4-4-4z' fill='%236c757d'/%3E%3C/svg%3E\")";

/**
 * 이벤트 상세 — 풋볼 매니저 26 예약구매 이벤트 (legacy `pc/event/event_fm26.html`).
 * 공개 SSR + 세션 분기(미로그인 배너/뱃지/응모 버튼). 하드코딩 콘텐츠 verbatim(종료 이벤트).
 */
export function EventFm26Screen({ member, status }: EventFm26ScreenProps) {
  const isLoggedIn = member != null;

  return (
    <>
      <div className="container mt-3">
        <nav
          style={{ ["--bs-breadcrumb-divider" as string]: BREADCRUMB_DIVIDER }}
          aria-label="breadcrumb"
        >
          <ol className="breadcrumb font-14">
            <li className="breadcrumb-item">
              <a href="/" className="text-decoration-none" title="다이렉트 게임즈">
                다이렉트 게임즈
              </a>
            </li>
            <li className="breadcrumb-item">
              <a href="/event/event" className="text-decoration-none" title="이벤트">
                이벤트
              </a>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              풋볼 매니저 26 예약구매 이벤트
            </li>
          </ol>
        </nav>
      </div>

      <div className="container my-3 pb-5">
        <main>
          <section id="content" className="content rounded-0">
            <div className="mb-4 border border-1">
              <a
                href="/game/game_view?product_id=af3cca1a-d3ed-4b2d-ae85-79162db22328"
                title="풋볼 매니저 26"
              >
                <img src="https://image.directg.net/k834JLUyrH" className="w-100" />
              </a>
            </div>
            <p className="text-danger font-14">
              ※ 페이지 하단에 버튼을 통해 사은품 획득 또는 응모하실 수 있습니다. 이벤트 사은품은
              자동 지급되지 않습니다.
            </p>

            <div className="card mb-4 rounded-0">
              <div className="card-body">
                <h4 className="text-primary fw-bold py-1">
                  ■ 다이렉트 게임즈 X 풋볼 매니저 26 예약구매 이벤트
                </h4>
                <ul>
                  <li className="font-14">
                    이벤트 내용:
                    <ol className="list-unstyled">
                      <li>#01 &lt;풋볼 매니저 2024&gt; 구매 회원 한정 추가 혜택 이벤트</li>
                      <li>#02 &lt;풋볼 매니저 26&gt; 사전 액세스 플레이 인증 이벤트</li>
                    </ol>
                  </li>
                  <li className="font-14">
                    이벤트 기준: 이벤트 기간 내 주문 및 제품코드(키) 수령완료 기준 (이벤트 공지 전
                    주문건도 인정)
                  </li>
                  <li className="font-14">이벤트 기간: 2025년 11월 5일(수)까지</li>
                  <li className="font-14">
                    당첨자 안내: 2025년 11월 7일(금) 공지와 함께 별도의 이메일로 안내 예정
                  </li>
                </ul>

                <div className="alert mb-0">
                  <h5 className="text-warning fw-bold">※ 유의사항</h5>
                  <ul className="mb-0">
                    <li className="font-14 text-danger">
                      사은품 수령은 2025년 11월 10일(월)까지 가능하며, 이후 수령하지 않은 사은품은
                      소멸됩니다.
                    </li>
                    <li className="font-14 text-warning">
                      해당 이벤트는 다이렉트 게임즈에서 구매한 회원분들을 대상으로 하며, 응모를
                      위해선 계정 및 로그인이 필요합니다.
                    </li>
                    <li className="font-14 text-warning">
                      해당 이벤트는 계정 당 1회만 참여가 가능하며, 중복 참여는 인정되지 않습니다.
                    </li>
                    <li className="font-14 text-warning">
                      다이렉트 게임즈 포인트는 [마이페이지&gt;포인트]메뉴에서 확인할 수 있습니다.
                    </li>
                    <li className="font-14 text-warning">
                      다이렉트 게임즈 포인트는 현금화가 불가합니다.
                    </li>
                    <li className="font-14 text-warning">
                      보유한 포인트가 1,000원 이상 시 100원 단위로 사용이 가능하며, 일부 상품은
                      제한이 있을 수 있습니다.
                    </li>
                    <li className="font-14 text-warning">
                      이벤트 기간과 기준, 사은품은 사정에 따라 사전 공지 없이 변경될 수 있습니다.
                    </li>
                    <li className="font-14 text-warning">
                      부적절한 방법을 통한 응모는 모두 취소되며 법적인 처벌을 받을 수 있습니다.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {!isLoggedIn && (
              <div className="bg-danger text-white font-14 fw-bold p-3 mb-4">
                이벤트 참여를 위해서는 로그인이 필요합니다.
              </div>
            )}

            {/* 이벤트#01 — 포인트 3,000원 */}
            <div className="d-flex align-items-center bg-body border mb-4">
              <div className="flex-shrink-0">
                <img
                  src="https://image.directg.net/z81ajUl7m0"
                  alt="다이렉트 게임즈 포인트 3,000원"
                />
              </div>
              <div className="flex-grow-1 ms-3 p-0">
                <div className="h-100 d-flex flex-column justify-content-start align-items-start">
                  <div className="p-1">
                    <h5 className="text-primary fw-bold">
                      #01 &lt;풋볼 매니저 2024&gt; 구매 회원 한정 추가 혜택 이벤트
                    </h5>
                  </div>
                  <ul className="mb-3">
                    <li className="mb-1">
                      이벤트 내용: 다이렉트 게임즈에서 &lt;풋볼 매니저 2024&gt; 구매 이력이 있는
                      경우, &lt;풋볼 매니저 26&gt; 구매 시 사은품 지급 (계정당 1회)
                    </li>
                    <li className="mb-1">
                      이벤트 기준: 다이렉트 게임즈에서 구매한 회원 대상, 이벤트 기간 내 주문 및
                      제품코드(키) 수령완료 기준 (이벤트 공지 전 주문건도 인정)
                    </li>
                    <li className="mb-1">이벤트 기간: 2025년 11월 5일(수)까지</li>
                    <li className="mb-1">사은품 지급: 이벤트 페이지에서 실시간 수령</li>
                    <li className="text-info">사은품: 다이렉트 게임즈 포인트 3,000원</li>
                  </ul>
                  {isLoggedIn && (
                    <div className="mt-auto d-flex flex-row">
                      {status?.eventResult1 === "0" ? (
                        <div className="align-self-center me-3">
                          <span className="badge text-bg-warning font-15 py-3">미달성</span>
                        </div>
                      ) : status?.chkEventMember1 === "Y" ? (
                        <div className="align-self-center me-3">
                          <span className="badge text-bg-danger font-15 py-3">수령완료</span>
                        </div>
                      ) : (
                        <div className="align-self-center me-3">
                          <EventApplyButton eventNo={38} label="포인트 수령" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 이벤트#02 — 포인트 10,000원 */}
            <div className="d-flex align-items-center bg-body border mb-4">
              <div className="flex-shrink-0">
                <img
                  src="https://image.directg.net/r83UtlUqqN"
                  alt="다이렉트 게임즈 포인트 10,000원"
                />
              </div>
              <div className="flex-grow-1 ms-3 p-0">
                <div className="h-100 d-flex flex-column justify-content-center align-items-start">
                  <h5 className="text-primary fw-bold">
                    #02 &lt;풋볼 매니저 26&gt; 사전 액세스 플레이 인증 이벤트
                  </h5>
                  <ul className="mb-2 flex-grow-1">
                    <li className="mb-1">
                      이벤트 내용: 이벤트 기간 내 &lt;풋볼 매니저 26&gt; 사전 액세스 플레이 인증 시
                      추첨을 통해 총 300분에게 사은품 지급 (계정당 1회)
                    </li>
                    <li className="mb-1">
                      이벤트 기준: 다이렉트 게임즈에서 구매한 회원 대상, 이벤트 종료 전 안내에 따라
                      구글폼을 통해 인증 완료 기준
                    </li>
                    <li className="mb-1">
                      이벤트 참여 방법: &lt;풋볼 매니저 26&gt; 사전 액세스 플레이 후, 소셜미디어,
                      커뮤니티 등에 후기를 작성하고 구글폼을 통해 인증
                    </li>
                    <li className="mb-1">이벤트 기간: 2025년 11월 5일(수)까지</li>
                    <li className="mb-1">
                      사은품 지급: 2025년 11월 7일(금) 공지와 함께 일괄 지급 예정
                    </li>
                    <li className="text-info">사은품: 다이렉트 게임즈 포인트 10,000원</li>
                  </ul>
                  {isLoggedIn && (
                    <div className="mb-auto">
                      <EventApplyButton eventNo={39} label="구글폼 바로가기" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
