import type { MypagePointList } from "@entities/mypage-point";
import { MypageAside } from "@widgets/mypage-aside";
import { ServerPagination } from "@shared/ui/server-pagination";

interface MypagePointScreenProps {
  data: MypagePointList;
}

const nf = (value: number) => value.toLocaleString("en-US");

/** 적립/사용 색상 (legacy: +→text-danger, -→text-primary). */
const typeColor = (emoneyType: string) =>
  emoneyType === "+" ? "text-danger" : emoneyType === "-" ? "text-primary" : "";

const typeLabel = (emoneyType: string) =>
  emoneyType === "+" ? "적립" : emoneyType === "-" ? "사용" : "";

/** 마이페이지 — 포인트 내역 (legacy `pc/mypage/mypage_point.html`). 정적 SSR. 가드는 route. */
export function MypagePointScreen({ data }: MypagePointScreenProps) {
  const { member_emoney, list, page, totalPages } = data;

  return (
    <div className="container my-3 pb-5">
      <main className="d-grid gap-3" style={{ gridTemplateColumns: "240px auto" }}>
        <MypageAside active="point" />
        <section id="content" className="content rounded-0 font-14">
          <div className="col-12 mb-5">
            <div className="card shadow-none rounded-0">
              <div className="card-body p-3 overflow-auto">
                고객님께서 보유하신 포인트는{" "}
                <span className="text-danger fw-bold">{nf(member_emoney)}</span>원 입니다.
              </div>
            </div>
          </div>

          <div className="col-12">
            <table className="table table-bordered table-centered mb-0 text-center align-middle text-nowrap">
              <thead className="align-middle">
                <tr>
                  <th>날짜</th>
                  <th>적립/사용</th>
                  <th className="w-50">사유</th>
                  <th>포인트</th>
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center">
                      포인트 내역이 없습니다.
                    </td>
                  </tr>
                ) : (
                  list.map((value, index) => (
                    <tr key={value.regdt + index}>
                      <td>{value.regdt}</td>
                      <td className={` ${typeColor(value.emoney_type)}`}>
                        {typeLabel(value.emoney_type)}
                      </td>
                      <td className="text-start">{value.memo}</td>
                      <td className={`text-end ${typeColor(value.emoney_type)} won`}>
                        {" "}
                        {nf(value.amt_delta)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div id="pagination" className="mt-4">
            <ServerPagination page={page} totalPages={totalPages} baseUrl="/mypage/mypage_point" />
          </div>
        </section>
      </main>
    </div>
  );
}
