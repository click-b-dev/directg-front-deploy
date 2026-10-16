import { useOptionSteamPackage } from "@entities/goods-option";
import { useProductViewer } from "@shared/lib/use-product-viewer";

type OptionPackageSteamProps = { productCode: string };

const won = (n: number) => n.toLocaleString("ko-KR");

// legacy goods_option_package_register.php col-4 — Steam 구성정보(참고용, read-only).
export const OptionPackageSteam = ({ productCode }: OptionPackageSteamProps) => {
  const { data } = useOptionSteamPackage(productCode);
  const productViewer = useProductViewer();

  if (!data) {
    return null;
  }
  const hasPackage = Number.parseInt(data.packageid || "0", 10) > 0;
  const hasBundle = Number.parseInt(data.bundleid || "0", 10) > 0;

  return (
    <div className="card">
      <h5 className="card-header bg-secondary text-white">Steam 구성정보 (참고용)</h5>
      <div className="card-body p-2 font-12">
        <div className="d-flex justify-content-between align-self-baseline">
          <div className="px-2 py-1">
            {hasPackage && <>Steam Package ID : {data.packageid}</>}
            {hasBundle && <>Steam Bundle ID : {data.bundleid}</>}
          </div>
          <div className="px-2 py-1">
            {/* legacy: 이 페이지 JS에 sync 핸들러 없음 → 표시만(no-op). product_viewer 시 숨김. */}
            {!productViewer && data.package_type === "bundle" && (
              <button type="button" className="btn btn-info btn-sm shadow-none">
                구성 동기화
              </button>
            )}
            {!productViewer && data.package_type === "package" && (
              <button type="button" className="btn btn-info btn-sm shadow-none">
                구성 동기화
              </button>
            )}
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-bordered table-centered mb-0 table-sm">
            <thead className="table-light">
              <tr>
                <th className="text-center" style={{ width: "50px" }}>
                  번호
                </th>
                <th className="text-center" style={{ width: "60px" }}>
                  appid
                </th>
                <th className="text-center" style={{ width: "60px" }}>
                  app_type
                </th>
                <th className="text-center">app_name</th>
                <th className="text-center">app_price</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => (
                <tr key={item.appid}>
                  <td className="text-center">
                    {item.app_name === "" ? (
                      <button type="button" className="btn action-icon">
                        <i className="mdi mdi-refresh" />
                      </button>
                    ) : (
                      "미등록"
                    )}
                  </td>
                  <td className="text-center">{item.appid}</td>
                  <td className="text-center">{item.app_type}</td>
                  <td className="text-start">{item.app_name}</td>
                  <td className="text-end">{won(item.app_price)}</td>
                </tr>
              ))}
              <tr className="bg-light">
                <th colSpan={4} className="text-center">
                  합계
                </th>
                <th className="text-end">{won(data.total)}</th>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
