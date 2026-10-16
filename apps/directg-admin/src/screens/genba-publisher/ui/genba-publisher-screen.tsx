import { useState } from "react";
import {
  useConfigGenbaPublisher,
  useGenbaPublisherList,
  type GenbaPublisherItem,
} from "@entities/genba";

// legacy genba_publisher.php — Genba 퍼블리셔 관리.
export const GenbaPublisherScreen = () => {
  const { data } = useGenbaPublisherList();
  if (!data) {
    return null;
  }

  // legacy: getGenbaPublisherList()가 cc(sku수)를 SELECT하지 않아 합계는 항상 0.
  const total = 0;

  return (
    <>
      {/* start page title */}
      <div className="row">
        <div className="col-12">
          <div className="page-title-box">
            <div className="page-title-right">
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    홈
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    상품
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    Genba 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">Genba 퍼블리셔 관리</li>
              </ol>
            </div>
            <h4 className="page-title">Genba 퍼블리셔 관리</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-12">
          <div className="card">
            <h5 className="card-header bg-secondary text-white">Genba 퍼블리셔 현황</h5>
            <div className="card-body p-0">
              <div className="table-responsive border border-1">
                <form>
                  <table className="table table-centered w-100 nowrap table-sm table-bordered table-striped">
                    <thead className="table-light font-14">
                      <tr>
                        <th className="text-center">번호</th>
                        <th className="text-center">Publisher</th>
                        <th className="text-center">sku수</th>
                        <th className="text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="font-12">
                      {data.items.map((item, index) => (
                        <GenbaPublisherRow key={item.publisher} num={index + 1} item={item} />
                      ))}
                    </tbody>
                    <tfoot className="table-light">
                      <tr>
                        <th className="text-center" colSpan={2}>
                          합계
                        </th>
                        <th className="text-end">{total.toLocaleString()}</th>
                        <th />
                      </tr>
                    </tfoot>
                  </table>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// legacy: Status 체크박스(switch). 토글 시 genba_ps.php publisher_config 호출 후 alert.
// location.reload 주석처리 → 재조회 없음, 체크 상태는 사용자 토글대로 유지(로컬 상태).
const GenbaPublisherRow = ({ num, item }: { num: number; item: GenbaPublisherItem }) => {
  const [checked, setChecked] = useState(item.status === "Y");
  const config = useConfigGenbaPublisher();

  const handleChange = (next: boolean) => {
    setChecked(next);
    config.mutate(
      { publisher: item.publisher, status: next ? "Y" : "N" },
      { onSuccess: (res) => window.alert(res.message) },
    );
  };

  const inputId = `publisher${num}`;

  return (
    <tr>
      <td className="text-center">{num}</td>
      <td className="text-start">{item.publisher}</td>
      {/* legacy quirk: cc 미SELECT → 항상 빈칸 */}
      <td className="text-end" />
      <td className="text-center">
        <input
          type="checkbox"
          className="is_status"
          id={inputId}
          name="publisher"
          value={item.publisher}
          data-switch="primary"
          checked={checked}
          onChange={(e) => handleChange(e.target.checked)}
        />
        <label htmlFor={inputId} data-on-label="Yes" data-off-label="No" />
      </td>
    </tr>
  );
};
