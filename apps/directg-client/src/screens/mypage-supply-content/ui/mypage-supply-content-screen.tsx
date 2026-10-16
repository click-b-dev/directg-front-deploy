import type { SupplyContentResponse } from "@entities/mypage-supply-content";
import { MypageAside } from "@widgets/mypage-aside";

import { SupplyDownloadButton } from "./supply-download-button";

interface MypageSupplyContentScreenProps {
  data: SupplyContentResponse;
  /** 세션 회원 아이디(legacy `$m_id`, 한글패치 인증정보 표시용). */
  memberId: string;
}

/** 제공콘텐츠 유형 라벨 (legacy switch). */
function typeLabel(type: string): string {
  if (type === "P") return "한글패치";
  if (type === "C") return "콘텐츠";
  return "";
}

/**
 * 제공콘텐츠 (legacy `pc/mypage/mypage_supply_content_v2.html`). 세션 표.
 * 프로시저 merge/dedup·patch 인증 인코딩은 백엔드. 다운로드 버튼만 client. 가드는 route.
 */
export function MypageSupplyContentScreen({ data, memberId }: MypageSupplyContentScreenProps) {
  return (
    <div className="container my-3 pb-5">
      <main className="d-grid gap-3" style={{ gridTemplateColumns: "240px auto" }}>
        <MypageAside active="supply_content" />
        <section id="content" className="content rounded-0">
          <div className="col-12">
            <table className="table table-bordered table-dark">
              <thead className="font-14">
                <tr>
                  <th className="text-center">제공콘텐츠 유형</th>
                  <th className="text-center">제공콘텐츠명</th>
                  <th className="text-center">한글패치 인증정보</th>
                  <th className="text-center">다운로드</th>
                </tr>
              </thead>
              <tbody>
                {data.list.map((item, i) => (
                  <tr key={`${item.supply_content}-${i}`}>
                    <td className="text-center">{typeLabel(item.supply_content_type)}</td>
                    <td className="text-start">{item.supply_content}</td>
                    <td className="text-start">
                      {item.is_encode === "Y" && (
                        <div className="d-flex flex-column">
                          <div>
                            <strong>아이디</strong>: {memberId}
                          </div>
                          <div>
                            <strong>비밀번호</strong>:{" "}
                            <span className="enc_data">{item.auth_password}</span>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="text-center">
                      <SupplyDownloadButton
                        fileUrl={item.supply_content_url}
                        ordno={item.ordno}
                        patchName={item.supply_content}
                      />
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
