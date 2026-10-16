# Vaultn - 인증서 관리 (cert)

## 원본
- 파일: `pc/_Admin_/goods/vaultn/vaultn_cert.php` (라이브)
- 데이터: `Vaultn::ReadCertificate()`

## 화면·플로우
- 진입 URL: `/goods/vaultn/vaultn_cert` (파라미터 없음, 사이드바 외 직접 접근)
- page_title `Vaultn 인증서 관리`(breadcrumb active + h4)
- 2행 테이블(colgroup 15%/*): `Vaultn 인증서 유효기간` = `date('Y-m-d H:i:s', validFrom) ~ date(..., validTo)` (validFrom/validTo는 **unix timestamp**) / `thumbprint`

## API 계약 (백엔드 전달)
### `GET /admin/vaultn/cert`
- 응답 `200`: `{ validFrom: number(unix sec), validTo: number(unix sec), thumbprint: string }`
- 백엔드 책임: ReadCertificate 결과. 날짜 포맷은 프론트에서 `Y-m-d H:i:s`(UTC 기준) 변환.

## 타겟 매핑
- 라우트: `routes/goods/vaultn/vaultn_cert.tsx`
- screens: `vaultn-cert` / entities: `vaultn`(cert) / mock: `handlers/vaultn`

## Parity 체크리스트
- [ ] 유효기간 `From ~ To` 포맷 · thumbprint 표시
