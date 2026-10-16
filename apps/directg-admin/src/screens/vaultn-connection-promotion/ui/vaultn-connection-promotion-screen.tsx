import {
  useVaultnConnectionPromotions,
  type VaultnConnectionPromotionItem,
} from "@entities/vaultn";

const VIEW_URL = "/goods/vaultn/vaultn_connection_promotion_view";

// legacy date("Y-m-d H:i:s", strtotime('+9 hours', strtotime($v))) — 문자열 파싱 후 +9시간(UTC 기준).
const plus9h = (s?: string) => {
  if (!s) {
    return "";
  }
  const d = new Date(s.replace(" ", "T") + "Z");
  if (Number.isNaN(d.getTime())) {
    return s;
  }
  d.setUTCHours(d.getUTCHours() + 9);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ${p(
    d.getUTCHours(),
  )}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}`;
};

// legacy vaultn_connection_promotion.php — Vaultn Connection 프로모션 목록.
export const VaultnConnectionPromotionScreen = ({ connectionGuid }: { connectionGuid: string }) => {
  const { data } = useVaultnConnectionPromotions(connectionGuid);
  if (!data) {
    return null;
  }

  const items = Array.isArray(data.items) ? data.items : [];
  const viewHref = (promotionGuid: string) =>
    `${VIEW_URL}?connectionGuid=${encodeURIComponent(connectionGuid)}&promotionGuid=${encodeURIComponent(
      promotionGuid,
    )}`;

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
                    Valutn 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">Valutn 프로모션 현황</li>
              </ol>
            </div>
            <h4 className="page-title">ConnectionPromotion</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <table className="table table-bordered table-sm">
                <thead className="table-light font-12">
                  <tr>
                    <th className="text-center">guid</th>
                    <th className="text-center">title</th>
                    <th className="text-center">validFrom</th>
                    <th className="text-center">validTo</th>
                    <th className="text-center">동기화</th>
                  </tr>
                </thead>
                <tbody className="font-12">
                  {items.map((item, i) => (
                    <PromotionRow
                      key={item.guid ?? i}
                      item={item}
                      connectionGuid={connectionGuid}
                      viewHref={viewHref}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            {/* end card-body */}
          </div>
          {/* end card */}
        </div>
        {/* end col */}
      </div>
      {/* end row */}
    </>
  );
};

const PromotionRow = ({
  item,
  connectionGuid,
  viewHref,
}: {
  item: VaultnConnectionPromotionItem;
  connectionGuid: string;
  viewHref: (promotionGuid: string) => string;
}) => (
  <tr>
    <td className="text-center">
      <a href={viewHref(item.guid ?? "")}>{item.guid}</a>
    </td>
    <td>{item.title}</td>
    <td className="text-center">{plus9h(item.validFrom)}</td>
    <td className="text-center">{plus9h(item.validTo)}</td>
    <td className="text-center">
      {/* legacy: btn_vaultn_sync (전용 핸들러 미바인딩) */}
      <button
        type="button"
        className="btn btn-outline-secondary btn-sm btn_vaultn_sync"
        data-connectionguid={connectionGuid}
        data-promotionguid={item.guid}
      >
        동기화
      </button>
    </td>
  </tr>
);
