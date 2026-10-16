"use client";

import {
  openSnsConnectPopup,
  postPaycoDisconnect,
  postSnsDisconnect,
  type SnsConnectType,
  type SnsLoginConnection,
} from "@entities/mypage-sns-login";
import { MobileSubHeader } from "@widgets/mobile-sub-header";

/** legacy `sns_login_connect.html` head `<style>`. */
const SNS_CSS = `
#appCapsuleSub{
	padding-top:56px;
}
`;

const SNS_TYPES: SnsConnectType[] = ["PAYCO", "KAKAO", "NAVER"];

interface NormalizedRow {
  sns_type: SnsConnectType;
  is: boolean;
  sns_connect_date: string;
}

/** legacy: PAYCO/KAKAO/NAVER 기본 미연결, 조회 결과로 연결 상태/일자 채움. */
function normalizeRows(list: SnsLoginConnection[]): NormalizedRow[] {
  const rows = new Map<SnsConnectType, NormalizedRow>(
    SNS_TYPES.map((type) => [type, { sns_type: type, is: false, sns_connect_date: "" }]),
  );
  for (const value of list) {
    const type = value.sns_type.toUpperCase() as SnsConnectType;
    if (!rows.has(type)) continue;
    rows.set(type, { sns_type: type, is: true, sns_connect_date: value.sns_connect_date });
  }
  return SNS_TYPES.map((type) => rows.get(type)!);
}

/**
 * 모바일 마이페이지 - 간편로그인 연결 (legacy `mobile/mypage/sns_login_connect.html`).
 * PAYCO/KAKAO/NAVER 연결 상태 3테이블 + 계정연결(팝업)/연결해제(AJAX). 세션 가드·조회는 라우트.
 * entities/mypage-sns-login 전부 재사용. connect 팝업명은 PC connect_*(모바일 login_*과 미세 차이).
 */
export function MobileMypageSnsLoginConnectScreen({
  connections,
}: {
  connections: SnsLoginConnection[];
}) {
  const rows = normalizeRows(connections);

  const handleConnect = (type: SnsConnectType) => {
    void openSnsConnectPopup(type);
  };

  const handleDisconnect = async (type: SnsConnectType) => {
    try {
      if (type === "PAYCO") {
        const data = await postPaycoDisconnect();
        if (data.result === "0") {
          window.location.reload();
        } else {
          window.alert(data.result);
        }
        return;
      }
      const data = await postSnsDisconnect(type);
      window.alert(data.msg);
      if (data.code === "0") {
        window.location.reload();
      }
    } catch {
      window.alert("[object Object]");
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SNS_CSS }} />
      <MobileSubHeader pageTitle="간편로그인 연결" />
      <div id="appCapsuleSub" className="mt-0">
        <div className="section full mt-2">
          <div className="wide-block">
            {rows.map((row) => {
              const lower = row.sns_type.toLowerCase();
              return (
                <div className="table-responsive mb-3" key={row.sns_type}>
                  <table className="table table-dark table-bordered font-14">
                    <thead className="">
                      <tr className="border-secondary-subtle border-1 border-opacity-25">
                        <th colSpan={2} scope="col" className="text-center">
                          {row.sns_type} 간편로그인
                        </th>
                      </tr>
                    </thead>
                    <tbody className="font-14">
                      {row.is ? (
                        <>
                          <tr className="table-active border-secondary-subtle border-1 border-opacity-25">
                            <th>계정연결</th>
                            <td>
                              <button
                                type="button"
                                className="btn btn-sm btn-light"
                                id={`btn_${lower}_disconnect`}
                                onClick={() => void handleDisconnect(row.sns_type)}
                              >
                                X 연결해제
                              </button>
                            </td>
                          </tr>
                          <tr className="table-active border-secondary-subtle border-1 border-opacity-25">
                            <th>연결상태</th>
                            <td>연결됨.</td>
                          </tr>
                          <tr className="table-active border-secondary-subtle border-1 border-opacity-25">
                            <th>연결일자</th>
                            <td>{row.sns_connect_date}</td>
                          </tr>
                        </>
                      ) : (
                        <tr className="table-active border-secondary-subtle border-1 border-opacity-25">
                          <th>계정연결</th>
                          <td>
                            <button
                              type="button"
                              className="btn btn-sm btn-light"
                              id={`btn_${lower}_connect`}
                              onClick={() => handleConnect(row.sns_type)}
                            >
                              + 계정연결
                            </button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
