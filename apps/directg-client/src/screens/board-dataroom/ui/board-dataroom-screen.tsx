import type { DataroomListResponse } from "@entities/board-dataroom";

import { DataroomList } from "./dataroom-list";

interface BoardDataroomScreenProps {
  data: DataroomListResponse;
}

/**
 * 자료실 (legacy `pc/board/dataroom.html`). SSR 목록, aside 없음, 페이지네이션 UI 없음.
 * 배너·안내는 정적 서버 렌더, 카드 그리드(썸네일 onError·다운로드)는 client(DataroomList).
 */
export function BoardDataroomScreen({ data }: BoardDataroomScreenProps) {
  return (
    <>
      <link rel="stylesheet" href="/assets/css/card-list.css" />
      <div className="container my-3 pb-5">
        <main>
          <section id="content" className="content rounded-0">
            <div className="top_banner">
              <img
                src="https://image.directg.net/h8a6cl5Nrp"
                alt="다이렉트 게임즈 자료실"
                className="w-100"
              />
            </div>

            <div className="card shadow-none rounded-0 mb-3 p-3 font-14 bg-darkgray text-secondary">
              <div>
                <ul className="m-0">
                  <li>
                    다이렉트 게임즈의 자료는 다이렉트 게임즈 회원분들을 위해 제공되며, 다운로드를
                    위해선 다이렉트 게임즈 계정이 필요합니다.
                  </li>
                  <li>
                    다이렉트 게임즈의 자료는 무단 배포와 상업적 사용을 제한하며, 부적절한 행위는
                    법적인 처벌을 받을 수 있습니다.
                  </li>
                  <li>
                    일부 자료는 사정에 따라 다운로드 기간 및 횟수, 연령 제한 등이 있을 수 있습니다.
                  </li>
                  <li>
                    다이렉트 게임즈의 자료는 메가 드라이브(https://mega.io)를 통해 제공됩니다.
                  </li>
                </ul>
              </div>
            </div>

            <DataroomList items={data.list} />
          </section>
        </main>
      </div>
    </>
  );
}
