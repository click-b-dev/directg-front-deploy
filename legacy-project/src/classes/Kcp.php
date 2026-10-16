<?php
class Kcp{
	protected $kcp_cert_info;
	protected $tradeReg_url;
	protected $payment_url;
	protected $cancel_url;
	protected $site_cd;
	protected $certificateLocation;
	protected $certificatePassword;
	protected $pkeyLocation;
	
	public function __construct($mode){
		if($mode=="test"){
			$this->tradeReg_url = "https://stg-spl.kcp.co.kr/std/tradeReg/register";
			$this->payment_url = "https://stg-spl.kcp.co.kr/gw/enc/v1/payment";
			$this->v_payment_url = "https://stg-spl.kcp.co.kr/gw/hub/v1/payment";
			$this->cancel_url="https://stg-spl.kcp.co.kr/gw/mod/v1/cancel";
			$this->site_cd = "T0000";
			$this->certificateLocation = "/home/dgkrshop/www/certificate/kcp/splCert.pem";
			$this->pkeyLocation = "/home/dgkrshop/www/certificate/kcp/splPrikeyPKCS8.pem";
			$this->certificatePassword = "changeit";
		}else{
			$this->tradeReg_url = "https://spl.kcp.co.kr/std/tradeReg/register";
			$this->payment_url = "https://spl.kcp.co.kr/gw/enc/v1/payment";
			$this->v_payment_url = "https://spl.kcp.co.kr/gw/hub/v1/payment";
			$this->cancel_url="https://spl.kcp.co.kr/gw/mod/v1/cancel";
			$this->site_cd = "AKPV0";
			$this->certificateLocation = "/home/dgkrshop/www/certificate/kcp/KCP_AUTH_AKPV0_CERT.pem";
			$this->pkeyLocation = "/home/dgkrshop/www/certificate/kcp/KCP_AUTH_AKPV0_PRIKEY.pem";
			$this->certificatePassword = "h2int_0303";
		}
		
		$this->kcp_cert_info = file_get_contents($this->certificateLocation,true);
		//echo $kcp_cert_info;
		//$kcp_cert_info = preg_replace("/\r\n|\r|\n/","",$kcp_cert_info); 
		$this->kcp_cert_info = preg_replace('/\r\n|\r|\n/', '', $this->kcp_cert_info);
	}
	
	/*
	
	=========================================
	거래상태표
	==========================================
	STIR=>입금대기
	STIY=>입금완료
	STIC=>입금취소
	STIX=>가상계좌사용중지
	STRD=>입금거절
	
	STIS=>이체성공
	STIV=>이체취소(정산 전)
	STIW=>이체취소
	
	STEY=>에스크로 입급완료
	STEH=>에스크로 환불완료
	STHD=>에스크로 환불대기
	STOC=>에스크로 주문취소
	
	STPC=>부분취소
	
	STSR=>승인
	STSC=>승인취소
	STMR=>매입요청
	STJY=>대금지급완료
	STMD=>매입취소요청
	STMO=>취소정산완료
	STMT=>매입청구
	STJC=>매입취소청구
	STDS=>대금지급승인
	STJO=>매입취소완료
	STDN=>대금지급보류
	STJS=>매입취소실패
	
	
	STIB=>대금입금
	STDC=>취소반송
	STHB=>대금환불
	STMC=>매입반송
	STIF=>이체실패
	STSF=>승인대기
	
	STCH=>상태변경주체
	STUS=>사용
	STUC=>사용승인취소
	STAD=>적립
	STAC=>적립승인취소
	STIO=>입금초과
	
	STR0=>재매입종류
	STMT=>재매입요청
	STJC=>재매입취소
	STAU=>인증
	STCA=>취소접수
	
	STAE=>적립매입취소
	STUE=>사용매입취소
	
	STCR=>매입취소청구보류
	STCY=>매입취소청구완료
	STDR=>매입청구보류
	STDY=>매입청구완료
	STPY=>부분취소청구완료
	STAR=>승인요청
	STAF=>승인실패
	STVF=>검증실패
	STDE=>차감오류
	STCD=>취소대기
	STIU=>입금부족
	
	========================================
	used_card 카드코드표
	========================================
	신한	CCLG
	현대	CCDI
	롯데	CCLO
	외환	CCKE
	삼성	CCSS
	국민	CCKM
	비씨	CCBC
	농협	CCNH
	하나	CCHN
	씨티	CCCT
	우리	CCWR
	하나비씨	BC81
	케이뱅크	CCKK
	광주	CCKJ
	수협	CCSU
	제주	CCCJ
	한국산업은행	CCKD
	저축	CCSB
	신협	CCCU
	우체국	CCPB
	MG새마을금고	CCSM
	카카오뱅크	CCKA
	은련	CCUF
	마스터	CMCF
	JCB	CJCF
	비자	CVSF
	
	※ 해외카드(비자, 마스터, JCB)의 경우 PC버전에서는 CCXA, CCXB, CCXC로 진행해 주시기 바랍니다.
	
	========================================
	카드코드표
	========================================
	KB국민카드	CCKM
	BC카드	CCBC
	신한카드	CCLG
	삼성카드	CCSS
	현대카드	CCDI
	롯데카드	CCLO
	롯데아멕스카드	CCAM
	NH농협카드	CCNH
	하나카드	CCHN
	하나카드(외환)	CCKE
	우리카드	CCWR
	광주카드	CCKJ
	수협카드	CCSU
	제주카드	CCCJ
	씨티카드
	(구, 신세계한미)	CCSG
	씨티카드	CCCT
	씨티카드
	(구, 한미카드)	CCHM
	은련카드	CCUF
	해외비자	CVSF
	해외마스터	CMCF
	해외JCB	CJCF
	
	전북카드는 카드코드 CCKM으로 리턴됩니다.
	
	========================================
	계좌이체 은행코드표
	========================================
	한국산업은행	BK02
	기업은행	BK03
	국민은행	BK04
	수협	BK07
	농협	BK11
	지역농축협	BK12
	우리은행	BK20
	SC 제일은행	BK23
	한국시티은행	BK27
	iM 뱅크	BK31
	부산은행	BK32
	광주은행	BK34
	제주은행	BK35
	전북은행	BK37
	경남은행	BK39
	새마을금고	BK45
	신협	BK48
	산림조합	BK64
	우체국	BK71
	KEB 하나은행	BK81
	신한은행	BK88
	케이뱅크	BK89
	카카오뱅크	BK90
	토스뱅크	BK92
	유안타증권	B209
	한국투자증권	B243
	현대차증권	B263
	하나증권	B270
	유진투자증권	B280
	삼성증권	B240
	KB증권(현대)	B218
	NH투자증권	B247
	SK증권	B266
	신한금융투자	B278
	한화투자증권	B269
	미래에셋대우	B238
	아이엠증권	B262
	대신증권	B267
	DB증권	B279
	신영증권	B291
	
	========================================
	가상계좌 은행코드표 (PC버전(wish_vbank_list) 발급, webhook 응답(bank_code))
	========================================
	기업은행	03
	수협	07
	SC제일은행	23
	광주은행	34
	경남은행	39
	국민은행	04
	농협	11
	신한은행	26
	우체국	71
	우리은행	20
	부산은행	32
	KEB하나은행	81
	IM뱅크	31

	============================================
	Mobile버전(used_bank) 발급, PC/Mobile 응답(bankcode)
	============================================
	기업은행	BK03
	수협	BK07
	SC제일은행	BK23
	광주은행	BK34
	경남은행	BK39
	국민은행	BK04
	농협	BK11
	신한은행	BK26
	우체국	BK71
	우리은행	BK20
	부산은행	BK32
	KEB하나은행	BK81
	IM뱅크	BK31
	
	
	
	=================================================
	가상계좌 모의입금 페이지:https://testadmin.kcp.co.kr/Modules/Noti/TEST_Vcnt_Noti.jsp
	=================================================
	
	=================================================
	신용카드 매출전표(국문): https://partner.kcp.co.kr/bill/card?cmd=card_bill&tno=[NHN KCP거래번호]&order_no=[주문번호]&trade_mony=[거래금액]
	계좌이체 거래명세표(국문) : https://partner.kcp.co.kr/bill/acnt?cmd=acnt_bill&tno=[NHN KCP거래번호]&order_no=[주문번호]&trade_mony=[거래금액]
	가상계좌 거래명세표(국문): https://partner.kcp.co.kr/bill/vcnt?cmd=vcnt_bill&tno=[NHN KCP거래번호]&order_no=[주문번호]&trade_mony=[거래금액]
	휴대폰 거래명세표(국문): https://partner.kcp.co.kr/bill/mcash?cmd=mcash_bill&tno=[NHN KCP거래번호]&order_no=[주문번호]&trade_mony=[거래금액]
	현금 영수증 URL: https://partner.kcp.co.kr/bill/cash?cmd=cash_bill&cash_no=[현금영수증거래번호]&order_id=[주문번호]&trade_mony=[거래금액]
	=================================================
	*/
	
	
	
	//인증서 정보확인
	public function ReadCertificate(){
		//인증서 파일 읽기
		$certFile = file_get_contents($this->certificateLocation,true);
		$certinfo = openssl_x509_parse($certFile);
		$validFrom = $certinfo['validFrom_time_t'];
		$validTo = $certinfo['validTo_time_t'];
		
		//개인 키 파일 읽기
		$keyFile = file_get_contents($this->pkeyLocation,true);
		$keyCheckData = array(0=>$keyFile,1=>$this->certificatePassword);
		
		//개인 키 복호화 (암호가 있는 경우):
		$privateKeyDecoded = openssl_pkey_get_private($keyFile, $this->certificatePassword);
		
		//개인 키 유효성 확인
		if($privateKeyDecoded === false) {
			//echo "개인 키 로드 및 유효성 확인 실패";
		}else{
			//echo "개인 키 로드 및 유효성 확인 성공";
			$publicKey = openssl_pkey_get_details($privateKeyDecoded);
			$res=openssl_pkey_new();
			openssl_pkey_export($res, $privkey, "PassPhrase number 1" );
			$pubkey=openssl_pkey_get_details($res);
			$pkey=$pubkey["key"];
		}

		$return_data = array(
			'validFrom'=>$validFrom,
			'validTo'=>$validTo,
			'pkey'=>$pkey,
		);

		//print_r($return_data);
		return $return_data;
	}
	
	//거래등록 (모바일만 해당됨)
	public function tradeReg($params){
		$url = $this->tradeReg_url;
		
		$data = array(
			"site_cd"        => $this->site_cd,
			"kcp_cert_info"  => $this->kcp_cert_info,
			"ordr_idxx"      =>$params['ordr_idxx'],
			"good_mny"       => $params['good_mny'],
			"good_name"      => $params['good_name'],
			"pay_method"     => $params['pay_method'],
			"Ret_URL"        => $params['Ret_URL'],
			"escw_used"      => $params['escw_used'],
			"user_agent"     => $params['user_agent']
		);
		
		$req_data = json_encode($data);
    
		$header_data = array( "Content-Type: application/json", "charset=utf-8" );
		 $ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_HTTPHEADER, $header_data);
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
		curl_setopt($ch, CURLOPT_POSTFIELDS, $req_data);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		// API RES
		$res_data  = curl_exec($ch); 
		$status_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		 curl_close($ch); 
		 
		// RES JSON DATA Parsing
		$json_res = json_decode($res_data, true);
		
		// 응답 처리
		if ($status_code === 200) {
			$response_data = json_decode($res_data, true);
			// 성공적인 응답 처리 (결제 창 URL, TID 등)
			//echo "결제 요청 성공: " . $response_data['tid'];
			// 결제 창 URL을 사용자에게 리다이렉트 또는 iframe으로 표시
			return $res_data;
		} else {
			// 실패한 응답 처리 (에러 메시지)
			echo "결제 요청 실패: " . $status_code . " - " . $response_data;
		}
	}
	
	//결제요청
	public function requestPayment($params){
		// KCP 결제 요청 생성
		if($params['pay_method']=="VCNT"){	//25-09-15(월) 12:19 [이종석] 가상계좌
			$data = array(
				'site_cd' => $this->site_cd,
				'kcp_cert_info' => $this->kcp_cert_info, // NHN KCP 에서 발급하는 서비스 인증서
				'pay_method' => $params['pay_method'], // 결제수단
				'amount' => $params['amount'], // 거래건의 총 금액
				'currency' => $params['currency'], // 화폐단위 (원화: 410)
				'va_txtype' => $params['va_txtype'], // 가상계좌 발급 타입 (41100000 고정)
				'va_mny' => $params['va_mny'], // 가상계좌 발급 금액 (amount와 동일)
				'va_bankcode' => $params['va_bankcode'], // 가상계좌 은행 코드
				'va_name' => $params['va_name'], // 입금자명
				'va_date' => $params['va_date'], // 입금 마감시각
				'ordr_idxx' => $params['ordr_idxx'], // 상점 주문번호
				'good_name' => $params['good_name'], // 상품명
				'buyr_name' => $params['buyr_name'], // 주문자명
				'va_receipt_gubn' => $params['va_receipt_gubn'], // 추가
				'va_taxno'  => $params['va_taxno'],         // 추가
			);
			$request_data = json_encode($data);
			
			$url = $this->v_payment_url;
		} else {	//25-09-15(월) 12:19 [이종석] 가상계좌 이외
			$data = array(
				'site_cd' => $this->site_cd,
				'kcp_cert_info' => $this->kcp_cert_info, // NHN KCP 에서 발급하는 서비스 인증서
				'enc_data' => $params['enc_data'], // 결제창 인증결과 암호화 정보
				'enc_info' => $params['enc_info'], // 결제창 인증결과 암호화 정보
				'tran_cd' => $params['tran_cd'], // 요청코드(수정불가)
				'ordr_mony' => $params['ordr_mony'], // 실제 결제 요청 금액(결제금액 유효성 검증)
				'ordr_no' => $params['ordr_idxx'], // 실제 결제 주문번호
				'pay_type' => $params['pay_type'], // 실제 결제수단(결제수단 유효성 검증)
			);
			$request_data = json_encode($data);
			
			$url = $this->payment_url;
		}
		
		$header_data = array( "Content-Type: application/json", "charset=utf-8" );
		
		// API REQ
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_HTTPHEADER, $header_data); 
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
		curl_setopt($ch, CURLOPT_POSTFIELDS, $request_data);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_SSLVERSION, '6');
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
		$err = curl_error($ch);
		// API RES
		$res_data  = curl_exec($ch); 
		$status_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		 curl_close($ch); 
		 
		// 응답 처리
		if ($status_code === 200) {
			$response_data = json_decode($res_data, true);
			// 성공적인 응답 처리 (결제 창 URL, TID 등)
			//echo "결제 요청 성공: " . $response_data['tid'];
			// 결제 창 URL을 사용자에게 리다이렉트 또는 iframe으로 표시
			return $res_data;
		} else {
			// 실패한 응답 처리 (에러 메시지)
			echo "결제 요청 실패: " . $status_code . " - " . $response_data;
		}
	}
	
	//거래취소
	 public function cancelPayment($params){
		// 서명데이터생성에시
		// site_cd(사이트코드) + "^" + tno(거래번호) + "^" + mod_type(취소유형)
		// NHN KCP로부터 발급받은 개인키(PRIVATE KEY)로 SHA256withRSA 알고리즘을 사용한 문자열 인코딩 값
		
		$cancel_target_data = $this->site_cd . "^" . $params['tno']. "^" . $params['mod_type'];
		$key_data = file_get_contents($this->pkeyLocation,true);
		
		$pri_key = openssl_pkey_get_private($key_data,$this->certificatePassword);
		
		// 결제 취소 signature 생성
		openssl_sign($cancel_target_data, $signature, $pri_key, 'sha256WithRSAEncryption');
		//echo "cancel_signature :".base64_encode($signature)."<br><br>";
		$kcp_sign_data = base64_encode($signature);
		
		$data = array(
			'site_cd'        => $this->site_cd,
			'kcp_cert_info'  => $this->kcp_cert_info,
			'kcp_sign_data'  => $kcp_sign_data,
			'tno'            => $params['tno'],
			'mod_type'       => $params['mod_type']
		);
		
		//print_r($data);
		
		$req_data = json_encode($data);
		
		$header_data = array( "Content-Type: application/json", "charset=utf-8" );
		
		$url = $this->cancel_url;
		
		// API REQ
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_HTTPHEADER, $header_data);
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
		curl_setopt($ch, CURLOPT_POSTFIELDS, $req_data);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_SSLVERSION, '6');
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
		$err = curl_error($ch);
		$status_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		
		// API RES
		$res_data  = curl_exec($ch);
		
		// RES JSON DATA Parsing
		$json_res = json_decode($res_data, true);
		
		$res_cd = $json_res["res_cd"];
		$res_msg = $json_res["res_msg"];

		curl_close($ch); 
/*
		error_log("\r\n[".date('Y.m.d H:i:s')."] response | \n".$res_data."\n", 3, "/home/dgkrshop/www/log/admin/kcp_cancel_log_".date('Y-m-d'));
		error_log("\r\n[".date('Y.m.d H:i:s')."] response | \n".$json_res."\n", 3, "/home/dgkrshop/www/log/admin/kcp_cancel_log_".date('Y-m-d'));
		error_log("\r\n[".date('Y.m.d H:i:s')."] response | \n".$status_code."\n", 3, "/home/dgkrshop/www/log/admin/kcp_cancel_log_".date('Y-m-d'));
		
*/		
		// 응답 처리
		return $res_data;
		if ($status_code === 200) {
			//$response_data = json_decode($res_data, true);
			// 성공적인 응답 처리 (결제 창 URL, TID 등)
			//echo "결제취소 요청 성공: " . $response_data['tid'];
			// 결제 창 URL을 사용자에게 리다이렉트 또는 iframe으로 표시
//			return $res_data;
		} else {
			// 실패한 응답 처리 (에러 메시지)
			echo "결제취소 요청 실패: " . $status_code . " - " . $response_data;
		}
	}
}
?>