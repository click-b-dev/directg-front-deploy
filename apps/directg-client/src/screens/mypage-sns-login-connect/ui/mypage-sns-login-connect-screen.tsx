"use client";

import {
  openSnsConnectPopup,
  postPaycoDisconnect,
  postSnsDisconnect,
  type SnsConnectType,
  type SnsLoginConnection,
} from "@entities/mypage-sns-login";
import { MypageAside } from "@widgets/mypage-aside";

interface NormalizedSnsRow {
  sns_type: SnsConnectType;
  is: boolean;
  sns_connect_date: string;
  email: string;
}

const SNS_TYPES: SnsConnectType[] = ["PAYCO", "KAKAO", "NAVER"];

function normalizeRows(list: SnsLoginConnection[]): NormalizedSnsRow[] {
  const rows = new Map<SnsConnectType, NormalizedSnsRow>(
    SNS_TYPES.map((type) => [
      type,
      {
        sns_type: type,
        is: false,
        sns_connect_date: "",
        email: "",
      },
    ]),
  );

  for (const value of list) {
    const type = value.sns_type.toUpperCase() as SnsConnectType;
    if (!rows.has(type)) {
      continue;
    }
    rows.set(type, {
      sns_type: type,
      is: true,
      sns_connect_date: value.sns_connect_date,
      email: value.email,
    });
  }

  return SNS_TYPES.map((type) => rows.get(type)!);
}

function SnsActionButton({ row }: { row: NormalizedSnsRow }) {
  const lowerType = row.sns_type.toLowerCase();

  const disconnect = async () => {
    try {
      if (row.sns_type === "PAYCO") {
        const data = await postPaycoDisconnect();
        if (data.result === "0") {
          window.location.reload();
        } else {
          window.alert(data.result);
        }
        return;
      }

      const data = await postSnsDisconnect(row.sns_type);
      window.alert(data.msg);
      if (data.code === "0") {
        window.location.reload();
      }
    } catch {
      window.alert("[object Object]");
    }
  };

  if (row.is) {
    return (
      <button
        type="button"
        className="btn btn-sm btn-danger"
        id={`btn_${lowerType}_disconnect`}
        onClick={disconnect}
      >
        X 연결해제
      </button>
    );
  }

  return (
    <button
      type="button"
      className="btn btn-sm btn-info"
      id={`btn_${lowerType}_connect`}
      onClick={() => openSnsConnectPopup(row.sns_type)}
    >
      + 계정연결
    </button>
  );
}

/**
 * 마이페이지 — 간편로그인 연결 (legacy `pc/mypage/sns_login_connect.html`).
 * provider 3종 고정 테이블 + provider별 연결/해제 AJAX 동작.
 */
export function MypageSnsLoginConnectScreen({ list }: { list: SnsLoginConnection[] }) {
  const rows = normalizeRows(list);

  return (
    <div className="container my-3 pb-5">
      <main className="d-grid gap-3" style={{ gridTemplateColumns: "240px auto" }}>
        <MypageAside active="sns_login" />
        <section id="content" className="content rounded-0">
          <div className="col-12">
            <table className="table table-bordered table-dark">
              <thead className="font-14">
                <tr>
                  <th className="text-center">간편로그인 종류</th>
                  <th className="text-center">연결된 이메일</th>
                  <th className="text-center">연결상태</th>
                  <th className="text-center">연결일자</th>
                  <th className="text-center">비고</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.sns_type}>
                    <td className="text-center">{row.sns_type} 간편로그인</td>
                    <td className="text-center">{row.email}</td>
                    <td className="text-center">{row.is ? "연결됨" : "연결안됨"}</td>
                    <td className="text-center">{row.sns_connect_date}</td>
                    <td className="text-center">
                      <SnsActionButton row={row} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
