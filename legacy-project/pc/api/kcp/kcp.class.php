<?php
define( 'KCP_REGISTER_URL', '/std/tradeReg/register' );
define( 'KCP_PAYMENT_URL', '/gw/enc/v1/payment' );
define( 'KCP_AUTOPAY_PAYMENT_URL', '/gw/hub/v1/payment' );
define( 'KCP_CANCEL_URL', '/gw/mod/v1/cancel' );

class KCP{
	private $tran_cd;
	private $site_cd;
	private $kcp_cert_info;
	private $mode;
	private $register_url=KCP_REGISTER_URL;
	private $payment_url=KCP_PAYMENT_URL;
	private $autopay_payment_url=KCP_AUTOPAY_PAYMENT_URL;
	private $cancel_url=KCP_CANCEL_URL;


	function __construct($site_cd, $kcp_cert_info, $mode) {
		$this->site_cd = $site_cd;
		$this->kcp_cert_info = $kcp_cert_info;
		$this->mode = $mode;
	}

	public function getUrl(){
		if($this->mode=="TEST"){
			$this->backend_server = "https://stg-spl.kcp.co.kr";
		}else{
			$this->backend_server = "https://spl.kcp.co.kr";
		}
	}

	//거래등록 (Mobile 전용. PC는 거래등록 하지 않음)
	public function kcpRegister($order_data){
		$this->getUrl();

		$method = "POST";
		$content_type = "application/json";

		$url = $this->backend_server.$this->register_url;

		$data = array(
			"site_cd"=>$this->site_cd,
			"kcp_cert_info"=>$this->kcp_cert_info,
			"ordr_idxx"=>$order_data['ordr_idxx'],
			"good_mny"=>$order_data['good_mny'],
			"pay_method"=>$order_data['pay_method'],
			"good_name"=>$order_data['good_name'],
			"Ret_URL"=>$order_data['Ret_URL'],
			"user_agent"=>$order_data['user_agent']
		);

		$data_string = json_encode($data);

		$result = $this->post($url, $data_string,$content_type,$method);

		$result_data = json_decode($result);
		if($result_data->Code=="0000"){ //성공
			$result_data->Message;
			$approvalKey=$result_data->approvalKey;
			//예약정보 DB저장
			//return $this->naverPayPayment($reserveId);
		}else{
			echo "결제예약실패";
			print_r($result_data);
		}
		/* RESULT
			"Message":응답 메세지 (Success),
			"approvalKey": 거래 인증 키 "bLoDPYtmcTZ40R1nCvfbUAcHyKIPdQ\/iE35VBPEo1cQ="
			"PayUrl": 결제 창 호출 주소 "https:\/\/testsmpay.kcp.co.kr\/pay\/mobileGW.kcp"
			"hashData": 거래등록 해쉬 "ed66516f3936cadc75cdaced83ef7684205aba8ad0e8e0db0a90d8f69ed8599f"
			"traceNo": 추적번호 "T0000M8QZ2ONYLN2"
			"paymentMethod": 결제수단 "CARD"
			"request_URI": 요청주소 ""
			"Code": 응답코드 "0000"
		*/
		return $result_data;
	}

	
	//결제 요청(결제창에서 받은 데이터를 API 통신으로 결제요청)
	public function kcpPayment($order_data){
		$this->getUrl();

		$method = "POST";
		$content_type = "application/json";

		$url = $this->backend_server.$this->payment_url;

		$data = array(
			"site_cd"=>$this->site_cd,
			"kcp_cert_info"=>$this->kcp_cert_info,
			"tran_cd"=>$order_data['tran_cd'],
			"enc_data"=>$order_data['enc_data'],
			"enc_info"=>$order_data['enc_info'],
			"ordr_mony"=>$order_data['ordr_mony'],
			"pay_type"=>$order_data['pay_type'],
			"ordr_no"=>$order_data['ordr_no']
		);

		$data_string = json_encode($data);

		$result = $this->post($url, $data_string,$content_type,$method);

		$result_data = json_decode($result);
		if($result_data->code=="Success"){ //성공
			$res_cd = $result_data->res_cd;
			//예약정보 DB저장
			//return $this->naverPayPayment($reserveId);
		}else{
			echo "결제실패";
			print_r($result_data);
		}
		/* RESULT
			"Message":응답 메세지 (Success),
			"approvalKey": 거래 인증 키 "bLoDPYtmcTZ40R1nCvfbUAcHyKIPdQ\/iE35VBPEo1cQ="
			"PayUrl": 결제 창 호출 주소 "https:\/\/testsmpay.kcp.co.kr\/pay\/mobileGW.kcp"
			"hashData": 거래등록 해쉬 "ed66516f3936cadc75cdaced83ef7684205aba8ad0e8e0db0a90d8f69ed8599f"
			"traceNo": 추적번호 "T0000M8QZ2ONYLN2"
			"paymentMethod": 결제수단 "CARD"
			"request_URI": 요청주소 ""
			"Code": 응답코드 "0000"
		*/
		return $result_data;
	}

	//결제 요청(결제창에서 받은 데이터를 API 통신으로 결제요청)
	public function kcpPayment_m($order_data){
		$this->getUrl();

		$method = "POST";
		$content_type = "application/json";

		$url = $order_data['PayUrl'];

		$data = array(
			"site_cd"=>$this->site_cd,
			"kcp_cert_info"=>$this->kcp_cert_info,
			"tran_cd"=>$order_data['tran_cd'],
			"enc_data"=>$order_data['enc_data'],
			"enc_info"=>$order_data['enc_info'],
			"ordr_mony"=>$order_data['ordr_mony'],
			"pay_type"=>$order_data['pay_type'],
			"ordr_no"=>$order_data['ordr_no']
		);

		$data_string = json_encode($data);

		$result = $this->post($url, $data_string,$content_type,$method);

		$result_data = json_decode($result);
		if($result_data->code=="Success"){ //성공
			$reserveId = $result_data->body->reserveId;
			//예약정보 DB저장
			//return $this->naverPayPayment($reserveId);
			return $reserveId;
		}else{
			echo "결제예약실패";
			print_r($result_data);
		}
		/* RESULT
			"Message":응답 메세지 (Success),
			"approvalKey": 거래 인증 키 "bLoDPYtmcTZ40R1nCvfbUAcHyKIPdQ\/iE35VBPEo1cQ="
			"PayUrl": 결제 창 호출 주소 "https:\/\/testsmpay.kcp.co.kr\/pay\/mobileGW.kcp"
			"hashData": 거래등록 해쉬 "ed66516f3936cadc75cdaced83ef7684205aba8ad0e8e0db0a90d8f69ed8599f"
			"traceNo": 추적번호 "T0000M8QZ2ONYLN2"
			"paymentMethod": 결제수단 "CARD"
			"request_URI": 요청주소 ""
			"Code": 응답코드 "0000"
		*/
		return $result_data;
	}


	public function post( $url, $data_string,$content_type,$method,$timeout=60){
		$ch = curl_init(); //파라미터:url -선택사항
		$header_data = array( "Content-Type: application/json", "charset=utf-8" );
		
		curl_setopt($ch,CURLOPT_URL,$url); //여기선 url을 변수로
		curl_setopt($ch,CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch,CURLOPT_HEADER, 1);
		curl_setopt($ch,CURLOPT_CONNECTTIMEOUT , $timeout);
		curl_setopt($ch,CURLOPT_SSLVERSION, '6');
		curl_setopt($ch,CURLOPT_TIMEOUT , $timeout);
		curl_setopt($ch,CURLOPT_HTTPHEADER, $header_data); 
		curl_setopt($ch,CURLOPT_CUSTOMREQUEST, $method);
		curl_setopt($ch,CURLOPT_POST, 1); //Method를 POST로 지정.. 이 라인이 아예 없으면 GET
		curl_setopt($ch,CURLOPT_POSTFIELDS, $data_string);
		curl_setopt($ch,CURLOPT_SSL_VERIFYPEER, 0);

		$result = curl_exec($ch);
		$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
		$response = curl_getinfo($ch);

		$body = substr($result, $headerSize);
		$resObj = json_decode($body);
		curl_close($ch);

		if($httpCode=="200"){	//성공
			//error_log("[".date('Y.m.d H:i:s')."] ".$result."\n", 3, "/home/directgames/log/naverpay/naverpay_log_".date('Y-m-d'));
		}else{ //실패
			//print $body;
			//error_log("\n[".date('Y.m.d H:i:s')."] request | ". $_SESSION['user']['m_id']."\n", 3, "/home/directgames/log/naverpay/naverpay_error_log_".date('Y-m-d'));
			//error_log("\n[".date('Y.m.d H:i:s')."] request | ". $data_string."\n", 3, "/home/directgames/log/naverpay/naverpay_error_log_".date('Y-m-d'));
			//error_log("\n[".date('Y.m.d H:i:s')."] response | ". $result."\n", 3, "/home/directgames/log/naverpay/naverpay_error_log_".date('Y-m-d'));
		}

		return $body;
	}
}
?>