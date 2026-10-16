import { useDirectSendRemaining } from "@entities/member";

// 잔액 천단위 콤마. legacy는 raw 출력이나 개발자 지시로 포매팅(parity 이탈).
const nf = (n: number) => n.toLocaleString("en-US");

// legacy member/directsend_remaining_emoney.php — 자동메일(DirectSend) 잔액조회(정적 + 잔액).
export const MemberDirectSendRemainingScreen = () => {
  const { data } = useDirectSendRemaining();

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
                    회원
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    자동메일 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">자동메일 잔액조회</li>
              </ol>
            </div>
            <h4 className="page-title">자동메일 잔액조회</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-12">
          <table className="table table-centered w-100  nowrap table-sm table-bordered border-light">
            <tbody className="font-12 table-light">
              <tr>
                <th className="bg-light">연동시스템</th>
                <td className="bg-white">다이렉트샌드 메일발송 API (https://directsend.co.kr/)</td>
              </tr>
              <tr>
                <th className="bg-light">계정정보</th>
                <td className="bg-white">dcpinter / 비밀번호는 별도 문의</td>
              </tr>
              <tr>
                <th className="bg-light">잔액조회</th>
                <td className="bg-white">{nf(data.remaining_point)} 원</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="alert alert-info" role="alert">
        <span>
          <i className="dripicons-information me-2" /> 메일발송 비용은 발송 1건당 0.5원입니다.
        </span>
        <br />
      </div>
      <div className="alert alert-info" role="alert">
        <span>
          <i className="dripicons-information me-2" /> 잔액이 얼마 남지 않은 것을 확인 할 경우
          충전요청 부탁드립니다.
        </span>
      </div>
    </>
  );
};
