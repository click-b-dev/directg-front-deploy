import { useEffect } from "react";

// legacy main.php: intval((strtotime('YYYY-MM-DD') - strtotime(date('Y-m-d'))) / 86400)
// 만료일 − 오늘(자정) 의 정수 일수(truncate). KST는 DST 없어 86400 나눗셈이 정확한 정수.
// 브라우저 로컬 날짜 = 운영 환경(한국) 기준. Date.UTC로 계산해 TZ 무관하게 자정 간 일수 산출.
const daysLeft = (target: string): number => {
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const [year, month, day] = target.split("-").map(Number);
  return Math.trunc((Date.UTC(year, month - 1, day) - today) / 86_400_000);
};

// legacy main.php 정적 대시보드(운영서비스 관리현황). 콘텐츠 본문만 — topnav/footer는 위젯이 담당.
export const DashboardScreen = () => {
  useEffect(() => {
    // legacy main.php <title>
    document.title = "관리자시스템::다이렉트 게임즈 관리자시스템 V2";
  }, []);

  return (
    <>
      {/* start page title */}
      <div className="row">
        <div className="col-12">
          <div className="page-title-box">
            <div className="page-title-right" />
            <h4 className="page-title">대시보드</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-9">
          <div className="card">
            <h5 className="card-header bg-secondary text-white">운영서비스 관리현황</h5>
            <div className="card-body p-2">
              <table className="table table-bordered table-sm table-centered">
                <colgroup>
                  <col />
                  <col />
                  <col />
                  <col />
                  <col />
                  <col />
                  <col />
                </colgroup>
                <thead className="table-light font-13">
                  <tr>
                    <th className="text-center">시스템분류</th>
                    <th className="text-center">서비스 분류</th>
                    <th className="text-center">서비스 용도</th>
                    <th className="text-center">서비스 내용</th>
                    <th className="text-center">서비스 기간</th>
                    <th className="text-center">서비스 제공업체</th>
                    <th className="text-center">운영관리업무</th>
                  </tr>
                </thead>
                <tbody className="font-12">
                  {/* ===== DGKR 리뉴얼 (rowspan 16) ===== */}
                  <tr>
                    <td rowSpan={16} className="text-center">
                      DGKR 리뉴얼
                      <br />
                      (PC버전 - https://directg.net)
                      <br />
                      (모바일버전 - https://m.directg.net)
                    </td>
                    <td className="text-center">서버호스팅</td>
                    <td>웹서버 (175.126.82.76)</td>
                    <td>DG 웹서비스 운영</td>
                    <td>~ 2026-12-04 ({daysLeft("2026-12-04")}일 남음)</td>
                    <td>카페24 (dgkrshop)</td>
                    <td>
                      - 서버호스팅 기간연장 관리
                      <br />- 서버 트래픽 모니터링
                    </td>
                  </tr>
                  <tr>
                    <td className="text-center">보안</td>
                    <td>
                      웹방화벽
                      <br />
                      (딥파이더)
                    </td>
                    <td>DG 웹서비스 해킹공격 방어</td>
                    <td>~ 2026-12-04 ({daysLeft("2026-12-04")}일 남음)</td>
                    <td>카페24 (dgkrshop)</td>
                    <td>
                      - 웹방화벽 정상동작 모니터링
                      <br />- 웹방화벽 오탐지 여부 모니터링 및 차단해제
                    </td>
                  </tr>
                  <tr>
                    <td className="text-center">보안</td>
                    <td>
                      SSL보안인증서
                      <br />
                      (멀티도메인)
                    </td>
                    <td>
                      * 적용 도메인 현황
                      <br /> - directg.net (DG PC 대표도메인)
                      <br />- m.directg.net (DG 모바일 대표도메인)
                      <br />
                    </td>
                    <td>~ 2026-11-13 ({daysLeft("2026-11-13")}일 남음)</td>
                    <td>카페24 (h2intershop)</td>
                    <td>
                      - SSL 보안인증서 기간연장 관리 <br />- SSL 보안인증서 갱신
                    </td>
                  </tr>
                  <tr>
                    <td className="text-center">이미지호스팅</td>
                    <td>트래픽분산</td>
                    <td>DG 웹서비스 이미지파일 업로드</td>
                    <td>~2027-01-21 ({daysLeft("2027-01-21")}일 남음)</td>
                    <td>디스크엔 (directg)</td>
                    <td>
                      - 서비스 정상동작 모니터링 <br />- DG 웹서비스 이미지파일 업로드 <br />
                    </td>
                  </tr>
                  <tr>
                    <td className="text-center">API</td>
                    <td>유료메일발송</td>
                    <td>
                      - DG 회원가입시 인증메일 발송
                      <br /> - DG 비밀번호찾기시 인증메일 발송
                    </td>
                    <td>
                      충전식 포인트 차감 <br />
                      (건당 0.5원)
                    </td>
                    <td>다이렉트샌드 (dcpinter)</td>
                    <td>
                      - 메일발송 서비스 정상동작 모니터링 <br />- 충전포인트 관리 <br />
                    </td>
                  </tr>
                  <tr>
                    <td className="text-center">API</td>
                    <td>결제 PG</td>
                    <td>신용카드, 계좌이체, 휴대폰 결제서비스</td>
                    <td></td>
                    <td>KCP (directg2)</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td className="text-center">API</td>
                    <td>간편결제 PG</td>
                    <td>PAYCO 간편결제서비스</td>
                    <td></td>
                    <td>PAYCO (h2interactive)</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td className="text-center">API</td>
                    <td>간편결제 PG</td>
                    <td>네이버페이 간편결제서비스</td>
                    <td></td>
                    <td>네이버페이</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td className="text-center">API</td>
                    <td>간편로그인</td>
                    <td>네이버 간편로그인 서비스</td>
                    <td></td>
                    <td>네이버</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td className="text-center">API</td>
                    <td>간편로그인</td>
                    <td>카카오 간편로그인 서비스</td>
                    <td></td>
                    <td>카카오</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td className="text-center">API</td>
                    <td>간편로그인</td>
                    <td>페이코 간편로그인 서비스</td>
                    <td></td>
                    <td>페이코</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td className="text-center">API</td>
                    <td>본인인증</td>
                    <td>휴대폰 본인인증 서비스</td>
                    <td></td>
                    <td>KCP (gamepara)</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td className="text-center">API</td>
                    <td>결제 연동 모듈</td>
                    <td>KCP 결제연동</td>
                    <td></td>
                    <td>포트원 (구 아임포트)</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td className="text-center">API</td>
                    <td>주문연동</td>
                    <td>Ztorm API 서비스</td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td className="text-center">API</td>
                    <td>주문연동</td>
                    <td>Genba API 서비스</td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td className="text-center">API</td>
                    <td>주문연동</td>
                    <td>Vaultn API 서비스</td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>

                  {/* ===== DGKR (directgames.co.kr) (rowspan 7) ===== */}
                  <tr>
                    <td rowSpan={7} className="text-center">
                      DGKR
                      <br />
                      (PC버전 - https://directgames.co.kr)
                      <br />
                      (모바일버전 - https://m.directgames.co.kr)
                    </td>
                    <td className="text-center">서버호스팅</td>
                    <td>웹서버 (110.10.129.207)</td>
                    <td>DG 웹서비스 운영</td>
                    <td>~ 2026-09-09 ({daysLeft("2026-09-09")}일 남음)</td>
                    <td>카페24 (h2intershop)</td>
                    <td>
                      - 서버호스팅 기간연장 관리
                      <br />- 서버 트래픽 모니터링
                    </td>
                  </tr>
                  <tr>
                    <td className="text-center">서버호스팅</td>
                    <td>DB서버 (110.10.130.54)</td>
                    <td>DG 웹서비스 데이터 저장</td>
                    <td>~ 2026-11-08 ({daysLeft("2026-11-08")}일 남음)</td>
                    <td>카페24 (h2interdb)</td>
                    <td>
                      - 서버호스팅 기간연장 관리
                      <br />- 서버 트래픽 모니터링
                    </td>
                  </tr>
                  <tr>
                    <td className="text-center">서버호스팅</td>
                    <td>Asset서버 (175.125.94.163)</td>
                    <td>DG 키 재고 관리 및 키 발송 API서비스</td>
                    <td>~ 2027-02-25 ({daysLeft("2027-02-25")}일 남음)</td>
                    <td>카페24 (dgassetjp)</td>
                    <td>
                      - 서버호스팅 기간연장 관리
                      <br />- 서버 트래픽 모니터링
                    </td>
                  </tr>
                  <tr>
                    <td className="text-center">보안</td>
                    <td>
                      웹방화벽
                      <br />
                      (딥파이더)
                    </td>
                    <td>DG 웹서비스 해킹공격 방어</td>
                    <td>~ 2026-06-09 ({daysLeft("2026-06-09")}일 남음)</td>
                    <td>카페24 (h2intershop)</td>
                    <td>
                      - 웹방화벽 정상동작 모니터링
                      <br />- 웹방화벽 오탐지 여부 모니터링 및 차단해제
                    </td>
                  </tr>
                  <tr>
                    <td className="text-center">보안</td>
                    <td>
                      SSL보안인증서
                      <br />
                      (멀티도메인)
                    </td>
                    <td>
                      - directgames.co.kr (대표도메인)
                      <br />- m.directgames.co.kr (대표도메인)
                      <br />
                    </td>
                    <td>~ 2026-11-13 ({daysLeft("2026-11-13")}일 남음)</td>
                    <td>카페24 (h2intershop)</td>
                    <td>
                      - SSL 보안인증서 기간연장 관리 <br />- SSL 보안인증서 갱신
                    </td>
                  </tr>
                  <tr>
                    <td className="text-center">도메인</td>
                    <td>DG 도메인</td>
                    <td>
                      DGKR <br />- directg.net
                    </td>
                    <td>~ 2027-04-17 ({daysLeft("2027-04-17")}일 남음)</td>
                    <td>고도몰 (dcpinter)</td>
                    <td>- 도메인 기간연장 관리</td>
                  </tr>
                  <tr>
                    <td className="text-center">도메인</td>
                    <td>DG 도메인</td>
                    <td>
                      DGKR
                      <br />- directgames.co.kr
                    </td>
                    <td>~ 2028-07-29 ({daysLeft("2028-07-29")}일 남음)</td>
                    <td>카페24 (h2intershop)</td>
                    <td>- 도메인 기간연장 관리</td>
                  </tr>

                  {/* ===== DGJP (rowspan 7) ===== */}
                  <tr>
                    <td rowSpan={7} className="text-center">
                      DGJP
                    </td>
                    <td className="text-center">서버호스팅</td>
                    <td>웹서버 (1.234.83.241)</td>
                    <td>DGJP 웹서비스 운영</td>
                    <td>~ 2026-10-27 ({daysLeft("2026-10-27")}일 남음)</td>
                    <td>카페24 (h2interactive)</td>
                    <td>
                      - 서버호스팅 기간연장 관리
                      <br />- 서버 트래픽 모니터링
                    </td>
                  </tr>
                  <tr>
                    <td className="text-center">서버호스팅</td>
                    <td>DB서버 (175.126.146.157)</td>
                    <td>DGJP 웹서비스 데이터 저장</td>
                    <td>~ 2026-11-16 ({daysLeft("2026-11-16")}일 남음)</td>
                    <td>카페24 (dgjpdb)</td>
                    <td>
                      - 서버호스팅 기간연장 관리
                      <br />- 서버 트래픽 모니터링
                    </td>
                  </tr>
                  <tr>
                    <td className="text-center">서버호스팅</td>
                    <td>Asset서버 (211.110.44.14)</td>
                    <td>DGJP 키 재고 관리 및 키 발송 API서비스</td>
                    <td>~ 2027-06-09 ({daysLeft("2027-06-09")}일 남음)</td>
                    <td>카페24 (h2interasset)</td>
                    <td>
                      - 서버호스팅 기간연장 관리
                      <br />- 서버 트래픽 모니터링
                    </td>
                  </tr>
                  <tr>
                    <td className="text-center">보안</td>
                    <td>
                      웹방화벽
                      <br />
                      (딥파이더)
                    </td>
                    <td>DGJP 웹서비스 해킹공격 방어</td>
                    <td>~ 2026-10-27 ({daysLeft("2026-10-27")}일 남음)</td>
                    <td>카페24 (h2interactive)</td>
                    <td>
                      - 웹방화벽 정상동작 모니터링
                      <br />- 웹방화벽 오탐지 여부 모니터링 및 차단해제
                    </td>
                  </tr>
                  <tr>
                    <td className="text-center">보안</td>
                    <td>
                      SSL보안인증서
                      <br />
                      (멀티도메인)
                    </td>
                    <td>
                      * 적용 도메인 현황
                      <br />- directg.jp (DGJP PC 대표도메인)
                      <br />- directgames.jp <br />- m.directg.jp (DGJP 모바일 대표도메인)
                      <br />
                    </td>
                    <td>~ 2026-11-06 ({daysLeft("2026-11-06")}일 남음)</td>
                    <td>카페24 (h2interactive)</td>
                    <td>
                      - SSL 보안인증서 기간연장 관리 <br />- SSL 보안인증서 갱신
                    </td>
                  </tr>
                  <tr>
                    <td className="text-center">도메인</td>
                    <td>DGJP 도메인</td>
                    <td>
                      DGJP PC,모바일
                      <br /> - directg.jp{" "}
                    </td>
                    <td>~2026-10-31 ({daysLeft("2026-10-31")}일 남음)</td>
                    <td>muumuu-domain.com</td>
                    <td>- 도메인 기간연장 관리</td>
                  </tr>
                  <tr>
                    <td className="text-center">도메인</td>
                    <td>DGJP 도메인</td>
                    <td>
                      도메인 포워딩 <br />- directgames.jp{" "}
                    </td>
                    <td>~2026-10-31 ({daysLeft("2026-10-31")}일 남음)</td>
                    <td>muumuu-domain.com</td>
                    <td>- 도메인 기간연장 관리</td>
                  </tr>

                  {/* ===== H2 홈페이지 한국어버전 (rowspan 8) ===== */}
                  <tr>
                    <td rowSpan={8} className="text-center">
                      H2 홈페이지 한국어버전
                      <br /> (http://h2int.com)
                    </td>
                    <td className="text-center">서버호스팅</td>
                    <td>웹서버 (110.10.189.175)</td>
                    <td>H2 홈페이지 웹서비스 운영</td>
                    <td>~ 2026-12-18 ({daysLeft("2026-12-18")}일 남음)</td>
                    <td>카페24 (h2interhome)</td>
                    <td>
                      - 서버호스팅 기간연장 관리
                      <br />- 서버 트래픽 모니터링
                    </td>
                  </tr>
                  <tr>
                    <td className="text-center">도메인</td>
                    <td>H2 홈페이지 도메인</td>
                    <td>
                      도메인 포워딩 <br /> - h2interactive.co.kr
                    </td>
                    <td>~2027-02-14 ({daysLeft("2027-02-14")}일 남음)</td>
                    <td>고도몰</td>
                    <td>- 도메인 기간연장 관리</td>
                  </tr>
                  <tr>
                    <td className="text-center">도메인</td>
                    <td>H2 홈페이지 도메인</td>
                    <td>
                      도메인 포워딩 <br /> - h2inter.com
                    </td>
                    <td>~2027-07-28 ({daysLeft("2027-07-28")}일 남음)</td>
                    <td>고도몰</td>
                    <td>- 도메인 기간연장 관리</td>
                  </tr>
                  <tr>
                    <td className="text-center">도메인</td>
                    <td>H2 홈페이지 도메인</td>
                    <td>
                      도메인 포워딩 <br /> - h2inter.co.kr{" "}
                    </td>
                    <td>~2035-08-14 ({daysLeft("2035-08-14")}일 남음)</td>
                    <td>후이즈</td>
                    <td>- 도메인 기간연장 관리</td>
                  </tr>
                  <tr>
                    <td className="text-center">도메인</td>
                    <td>H2 홈페이지 도메인</td>
                    <td>
                      도메인 포워딩 <br /> - h2inter.net{" "}
                    </td>
                    <td>~2035-08-14 ({daysLeft("2035-08-14")}일 남음)</td>
                    <td>후이즈</td>
                    <td>- 도메인 기간연장 관리</td>
                  </tr>
                  <tr>
                    <td className="text-center">도메인</td>
                    <td>H2 홈페이지 도메인</td>
                    <td>
                      도메인 포워딩 <br /> - h2int.co.kr{" "}
                    </td>
                    <td>~2030-09-28 ({daysLeft("2030-09-28")}일 남음)</td>
                    <td>후이즈</td>
                    <td>- 도메인 기간연장 관리</td>
                  </tr>
                  <tr>
                    <td className="text-center">도메인</td>
                    <td>H2 홈페이지 도메인</td>
                    <td>
                      H2 홈페이지 대표도메인
                      <br /> - h2int.com{" "}
                    </td>
                    <td>~2030-09-28 ({daysLeft("2030-09-28")}일 남음)</td>
                    <td>후이즈</td>
                    <td>- 도메인 기간연장 관리</td>
                  </tr>
                  <tr>
                    <td className="text-center">도메인</td>
                    <td>H2 홈페이지 도메인</td>
                    <td>
                      도메인 포워딩 <br /> - h2int.net{" "}
                    </td>
                    <td>~2030-09-28 ({daysLeft("2030-09-28")}일 남음)</td>
                    <td>후이즈</td>
                    <td>- 도메인 기간연장 관리</td>
                  </tr>

                  {/* ===== H2 홈페이지 일본어버전 (rowspan 2) ===== */}
                  <tr>
                    <td rowSpan={2} className="text-center">
                      H2 홈페이지 일본어버전 <br /> (http://h2int.jp)
                    </td>
                    <td className="text-center">서버호스팅</td>
                    <td>웹서버</td>
                    <td>H2 홈페이지 일본어버전 웹서비스 운영</td>
                    <td>~ 2026-12-18 ({daysLeft("2026-12-18")}일 남음)</td>
                    <td>카페24 (h2interhome)</td>
                    <td>
                      - 서버호스팅 기간연장 관리
                      <br />- 서버 트래픽 모니터링
                    </td>
                  </tr>
                  <tr>
                    <td className="text-center">도메인</td>
                    <td>H2 홈페이지 도메인</td>
                    <td>
                      H2 홈페이지 일본어버전 대표도메인 <br /> - h2int.jp
                    </td>
                    {/* legacy 버그 이식: 표시 텍스트는 ~2026-08-31 이나 일수 계산은 2026-12-18 사용 */}
                    <td>~2026-08-31 ({daysLeft("2026-12-18")}일 남음)</td>
                    <td>일본지사</td>
                    <td>- 도메인 기간연장 관리</td>
                  </tr>

                  {/* ===== H2몰 (rowspan 2) ===== */}
                  <tr>
                    <td rowSpan={2} className="text-center">
                      H2몰
                    </td>
                    <td className="text-center">도메인</td>
                    <td>H2몰 도메인</td>
                    <td>
                      H2몰 대표도메인 <br /> - h2mall.net
                    </td>
                    <td>~2029-11-27 ({daysLeft("2029-11-27")}일 남음)</td>
                    <td>후이즈</td>
                    <td>- 도메인 기간연장 관리</td>
                  </tr>
                  <tr>
                    <td className="text-center">도메인</td>
                    <td>H2몰 도메인</td>
                    <td>
                      도메인 포워딩
                      <br /> - h2mall.co.kr
                    </td>
                    <td>~2030-09-22 ({daysLeft("2030-09-22")}일 남음)</td>
                    <td>후이즈</td>
                    <td>- 도메인 기간연장 관리</td>
                  </tr>

                  {/* ===== 메일서비스 (단일 행) ===== */}
                  <tr>
                    <td className="text-center">
                      메일서비스
                      <br />
                      (https://mail.h2int.com)
                    </td>
                    <td className="text-center">웹메일</td>
                    <td>사내메일</td>
                    <td>
                      접속도메인 <br />
                      -mail.h2int.com (대표도메인)
                      <br />
                      -mail.h2interactive.co.kr
                    </td>
                    <td>~2027-01-23 ({daysLeft("2027-01-23")}일 남음)</td>
                    <td>닷홈</td>
                    <td>
                      - 웹메일서비스 기간연장 관리
                      <br />- 웹메일서비스 장애시 원인분석 및 조치
                      <br />
                    </td>
                  </tr>

                  {/* ===== 제휴DG 현대이지웰 (rowspan 3) ===== */}
                  <tr>
                    <td rowSpan={3} className="text-center">
                      제휴DG 현대이지웰 <br />
                      (PC버전 - https://ezwel.directg.net) <br />
                      (모바일버전 - https://m.ezwel.directg.net)
                    </td>
                    <td className="text-center">서버호스팅</td>
                    <td>웹서버</td>
                    <td>현대이지웰 제휴 웹서비스</td>
                    <td>~2026-06-01 ({daysLeft("2026-06-01")}일 남음)</td>
                    <td>카페24 (dgezwel)</td>
                    <td>
                      - 서버호스팅 기간연장 관리
                      <br />- 서버 트래픽 모니터링
                      <br />
                    </td>
                  </tr>
                  <tr>
                    <td className="text-center">보안</td>
                    <td>
                      웹방화벽
                      <br />
                      (딥파이더)
                    </td>
                    <td>현대이지웰 제휴 웹서비스 해킹공격 방어</td>
                    <td>~ 2026-06-01 ({daysLeft("2026-06-01")}일 남음)</td>
                    <td>카페24 (dgezwel)</td>
                    <td>
                      - 웹방화벽 정상동작 모니터링
                      <br />- 웹방화벽 오탐지 여부 모니터링 및 차단해제
                    </td>
                  </tr>
                  <tr>
                    <td className="text-center">보안</td>
                    <td>
                      SSL보안인증서
                      <br />
                      (멀티도메인)
                    </td>
                    <td>
                      * 적용 도메인 현황
                      <br />- ezwel.directg.net (제휴DG PC도메인)
                      <br />- m.ezwel.directg.net (제휴DG 모바일도메인)
                      <br />
                    </td>
                    <td>~ 2026-11-13 ({daysLeft("2026-11-13")}일 남음)</td>
                    <td>카페24 (h2intershop)</td>
                    <td>
                      - SSL 보안인증서 기간연장 관리 <br />- SSL 보안인증서 갱신
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
