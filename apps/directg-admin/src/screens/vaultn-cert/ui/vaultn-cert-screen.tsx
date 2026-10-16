import { useVaultnCertificate } from "@entities/vaultn";

// legacy date('Y-m-d H:i:s', $unix) — unix(초)를 Y-m-d H:i:s로 표시(UTC 기준).
const fmtUnix = (unix: number) => {
  const d = new Date(unix * 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ${p(
    d.getUTCHours(),
  )}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}`;
};

// legacy vaultn_cert.php — Vaultn 인증서 관리.
export const VaultnCertScreen = () => {
  const { data } = useVaultnCertificate();
  if (!data) {
    return null;
  }

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
                    Vaultn 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">Vaultn 인증서 관리</li>
              </ol>
            </div>
            <h4 className="page-title">Vaultn 인증서 관리</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-12">
          <table className="table table-sm table-bordered border-secondary table-centered mb-0">
            <colgroup>
              <col width="15%" />
              <col width="*" />
            </colgroup>
            <tbody className="font-13">
              <tr>
                <th className="bg-light">Vaultn 인증서 유효기간</th>
                <td>
                  {fmtUnix(data.validFrom)} ~ {fmtUnix(data.validTo)}
                </td>
              </tr>
              <tr>
                <th className="bg-light">thumbprint</th>
                <td>{data.thumbprint}</td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* end col */}
      </div>
      {/* end row */}
    </>
  );
};
