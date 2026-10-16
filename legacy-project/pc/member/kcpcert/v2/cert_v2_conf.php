<?php
/* ============================================================================== */
/* =   KCP 본인확인 V2 설정                                                       = */
/* = -------------------------------------------------------------------------- = */
/* =   ※ 현재 테스트 엔드포인트/테스트 키로 설정되어 있음.                        = */
/* =     운영 전환 시 아래 [운영] 주석 URL 로 교체하고                            = */
/* =     site_cd / ENC_KEY 를 KCP 에서 발급한 운영 V2 값으로 교체할 것.           = */
/* ============================================================================== */

    /* 사이트코드 (테스트) */
    $g_conf_site_cd  = "AO7F3";                                                  // [운영] KCP 발급 운영 site_cd (예: A7SQ2)

    /* 거래등록 URL */
    $g_conf_cert_url = "https://testcert.kcp.co.kr/api/reg/certDataReg.do";       // [운영] https://cert.kcp.co.kr/api/reg/certDataReg.do

    /* 결과조회(복호화) URL */
    $g_conf_dec_url  = "https://testcert.kcp.co.kr/api/query/getCertData.do";     // [운영] https://cert.kcp.co.kr/api/query/getCertData.do

    /* Ret_URL (KCP 인증 완료 후 콜백 받을 본 사이트 주소 - FULL URL) */
    $g_conf_Ret_URL  = "https://directg.net/member/kcpcert/v2/cert_v2_return.php";

    /* 암호화 키 (테스트) */
    $g_conf_ENC_KEY  = "c2a22fa3ebe4698075bcac6b433d52e351c881b02fb83488d4283a43385b1f8e"; // [운영] KCP 발급 운영 V2 암호화키로 교체
?>
