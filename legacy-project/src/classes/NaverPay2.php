<?
define( 'NAVERPAY_RESERVE_URL', '/np_rhwny898734/naverpay/payments/v2/reserve' );
define( 'NAVERPAY_PAYMENT_APPLY_URL', '/np_rhwny898734/naverpay/payments/v2.2/apply/payment' );
define( 'NAVERPAY_PATMENT_HISTORY_URL', '/np_rhwny898734/naverpay/payments/v2.2/list/history' );
define( 'NAVERPAY_CANCEL_URL', '/np_rhwny898734/naverpay/payments/v1/cancel' );
define( 'NAVERPAY_PURCHASE_CONFIRM_URL', '/np_rhwny898734/naverpay/payments/v1/purchase-confirm' );
define( 'NAVERPAY_POINT_SAVE_URL', '/np_rhwny898734/naverpay/payments/v1/naverpoint-save' );
define( 'NAVERPAY_RECEIPT_URL', '/np_rhwny898734/naverpay/payments/v1/receipt/cash-amount' );

class NaverPay2{
	private $client_id;
	private $client_secret;
	private $chain_id;
	private $mode;
	private $backend_server;
	private $naverpay_server_pc;
	private $naverpay_server_mobile;
	private $reserve_url = NAVERPAY_RESERVE_URL;
	private $apply_url = NAVERPAY_PAYMENT_APPLY_URL;
	private $history_url = NAVERPAY_PATMENT_HISTORY_URL;
	private $cancel_url = NAVERPAY_CANCEL_URL;
	private $confirm_url = NAVERPAY_PURCHASE_CONFIRM_URL;
	private $pointsave_url = NAVERPAY_POINT_SAVE_URL;
	private $receipt_url = NAVERPAY_RECEIPT_URL;

	function __construct($mode) {
		$this -> mode = $mode;
		if($mode=="TEST"){
			//$naverpay_mode="development";
			$this -> client_id="HN3GGCMDdTgGUfl0kFCo";
			$this -> chain_id="VWxWL1pseTd1b3l";
			$this -> client_secret="ftZjkkRNMR";
		} else {
			//$naverpay_mode="production";
			$this -> client_id="te1STsWHFt4ZiBkzQGgf";
			$this -> chain_id="amZxRVkxdVVRQUs";
			$this -> client_secret="6X_QDraqXO";
		}
	}
	public function getUrl(){
		if($this-> mode=="TEST"){
				//$this->backend_server = "https://dev-pub.apis.naver.com";
			$this->backend_server = "https://dev-pay.paygate.naver.com";
			$this->naverpay_server_pc = "https://test-pay.naver.com";
			$this->naverpay_server_mobile = "https://test-m.pay.naver.com";
		}else{
			$this->backend_server = "https://pay.paygate.naver.com";
			$this->naverpay_server_pc = "https://pay.naver.com";
			$this->naverpay_server_mobile = "https://m.pay.naver.com";
			//$this->backend_server = "https://apis.naver.com";
		}
	}

	//결제번호 생성
	public function getSettleNo(){
		$milliseconds = round(microtime(true) * 1000);
		$settle_no = $milliseconds;

		return "N".$settle_no;
	}

	//결제예약 (개발완료)
	public function naverPayReserve($params){
		$this->getUrl();
		$method = "POST";
		$content_type = "application/json";

		$url = $this->backend_server.$this->reserve_url;
		$data = array(
			"modelVersion"=>"2",
			"merchantPayKey"=>$params['merchantPayKey'],
			"merchantUserKey"=>$params['merchantUserKey'],
			"productName"=> $params['productName'],
			"productCount"=> $params['productCount'],
			"totalPayAmount"=>$params['totalPayAmount'],
			"deliveryFee"=>$params['deliveryFee'],
			"taxScopeAmount"=>$params['taxScopeAmount'],
			"taxExScopeAmount"=>$params['taxExScopeAmount'],
			"returnUrl"=>$params['returnUrl'],
			"purchaserName"=>$params['purchaserName'],
			"purchaserBirthday"=>$params['purchaserBirthday'],
			"useCfmYmdt"=>"",
			"merchantExtraParameter"=>$params['merchantExtraParameter'],
		);
		
		$data_string = json_encode($data);

//		print_r($data_string);

		$result = $this->post2($url, $data_string,$content_type,$method);

		$result_data = json_decode($result);

		if($result_data->code=="Success"){ //성공
			$reserveId = $result_data->body->reserveId;
			//예약정보 DB저장
			//return $this->naverPayPayment($reserveId);
			//return $reserveId;
			return $result_data;
		}else{
			return "Fail";
//			print_r($result_data);
		}
	}

	//결제창 호출 (개발완료)
	public function naverPayPayment($reserveId){
		$this->getUrl();

		$method = "GET";
		$content_type ="text/html";

		$url = $this->naverpay_server_pc."/payments/".$reserveId;
		return $url;
	}

	//결제승인
	public function naverPayPaymentApply($paymentId){
		$this->getUrl();

		$method = "POST";
		$content_type ="application/x-www-form-urlencoded";


		$url = $this->backend_server.$this->apply_url;

		$data_string = "paymentId=".$paymentId;

		$result = $this->post($url, $data_string,$content_type,$method);

		$result_data = json_decode($result);

		if($result_data->code=="Success"){ //성공
			//성공로그 작성
		}else{
			//실패로그작성
		}

		return $result_data;
	}


	//결제내역조회
	public function naverPayPaymentsHistory($paymentId,$approvalType='',$startTime='',$endTime='',$pageNumber='',$rowsPerPage=''){
		$this->getUrl();

		$url = $this->backend_server.$this->history_url;

		$method = "POST";
		$content_type = "application/json";

		if($paymentId){ /*개별조회건일때*/
			$data = array(
				"paymentId" => $paymentId //조회하고자 하는 네이버페이 결제번호
			);
			
			
		}else{ /*결제리스트 조회일때*/
			$data = array(
				"startTime" => $startTime, //검색 시작 일시(YYYYMMDDHH24MMSS)
				"endTime" => $endTime, // 검색 종료 일시(YYYYMMDDHH24MMSS)
				"approvalType"=> $approvalType, //(ALL:전체, APPROVAL:승인, CANCEL:취소, CANCEL_FAIL:취소실패)
				"pageNumber"=> $pageNumber, //조회하고자 하는 페이지번호 (값이 없으면 1로 간주)
				"rowsPerPage"=> $rowsPerPage  // 페이지 당 row 건수 (1~50까지 지정 가능하며, 값이 없으면 20으로 간주합니다)
			);
		}

		$data_string = json_encode($data);

		$result = $this->post($url,$data_string,$content_type,$method);

		$result_data = json_decode($result);

		return $result_data;
	}
	//결제취소
	public function naverPayCancel($paymentId,$merchantPayTransactionKey,$cancelAmount,$cancelReason,$cancelRequester,$taxScopeAmount,$taxExScopeAmount,$doCompareRest,$expectedRestAmount){
		$this->getUrl();

		$method = "POST";
		$content_type ="application/x-www-form-urlencoded";

		$data_string = "paymentId=".$paymentId."&merchantPayTransactionKey=".$merchantPayTransactionKey."&cancelAmount=".$cancelAmount."&cancelReason=".$cancelReason."&cancelRequester=".$cancelRequester."&taxScopeAmount=".$taxScopeAmount."&taxExScopeAmount=".$taxExScopeAmount."&doCompareRest=".$doCompareRest."&expectedRestAmount=".$expectedRestAmount;

		/*
		taxScopeAmount : 과세 대상 금액
		taxExScopeAmount : 면세 대상 금액
		doCompareRest :가맹점의 남은 금액과 네이버페이의 남은 금액이 일치하는지 체크하는 기능을 수행할지 여부  (1: 수행, 0:미수행)
		expectedRestAmount : 이번 취소가 수행되고 난 후에 남을 가맹점의 예상 금액 (doCompareRest=1 일때 동작)
		*/

		$url = $this->backend_server.$this->cancel_url;

		$result = $this->post($url,$data_string,$content_type,$method);

		$result_data = json_decode($result);

		return $result_data;
	}
	//거래완료
	public function naverPayPurchaseConfirm($paymentId){
		$this->getUrl();

		$method = "POST";
		$content_type ="application/x-www-form-urlencoded";

		$url = $this->backend_server.$this->confirm_url;

		$data = array(
			"paymentId" => $paymentId, //네이버페이 결제번호
			"requester" =>"2", // 요청자(1: 구매자, 2: 가맹점 관리자)
		);

		$data_string = json_encode($data);

		//$result = $this->post($url,$data_string,$content_type,$method);
		echo $url;
	}
	// 포인트 적립요청
	public function naverPayPointSave($paymentId){
		$this->getUrl();

		$method = "POST";
		$content_type ="application/x-www-form-urlencoded";

		$url = $this->backend_server.$this->pointsave_url;

		$data = array(
			"paymentId" => $paymentId, //네이버페이 결제번호
		);

		$data_string = json_encode($data);

		//$result = $this->post($url,$data_string,$content_type,$method);

		echo $url;
	}

	//현금영수증 발생대상 금액조회 (이 절에서 설명하는 API는 현금 영수증을 가맹점에서 직접 발급해야 할 경우 사용하는 API 입니다.)
	public function naverPayReceipt(){
		$this->getUrl();

		$method = "POST";
		$content_type ="application/x-www-form-urlencoded";

		$url = $this->backend_server.$this->receipt_url;

		$data = array(
			"paymentId" => $paymentId, //네이버페이 결제번호
		);

		$data_string = json_encode($data);

		//$result = $this->post($url,$data_string,$content_type,$method);

		echo $url;
	}

	public function post( $url, $data_string,$content_type,$method,$timeout=60){
		$ch = curl_init(); //파라미터:url -선택사항

		curl_setopt($ch,CURLOPT_URL,$url); //여기선 url을 변수로
		curl_setopt($ch,CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch,CURLOPT_HEADER, 1);
		curl_setopt($ch,CURLOPT_CONNECTTIMEOUT , $timeout);
		curl_setopt($ch,CURLOPT_SSLVERSION, '6');
		curl_setopt($ch,CURLOPT_TIMEOUT , $timeout);
		curl_setopt($ch, CURLOPT_HTTPHEADER, array(
			'X-Naver-Client-Id: '.$this -> client_id,
			'X-Naver-Client-Secret: '.$this -> client_secret,
			'X-NaverPay-Chain-Id: '.$this -> chain_id,
			'Content-Type: '.$content_type
			)
		);
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
		curl_setopt($ch,CURLOPT_POST, 1); //Method를 POST로 지정.. 이 라인이 아예 없으면 GET
		curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);
		$result = curl_exec($ch);
		$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
		$response = curl_getinfo($ch);

		$body = substr($result, $headerSize);
		$resObj = json_decode($body);
		curl_close($ch);
		//print_r($body);

		//echo $httpCode;
                                                                                                                                                                                                                                                                                                  
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

	public function post2( $url, $data_string,$content_type,$method,$timeout=60){
		$ch = curl_init(); //파라미터:url -선택사항

		curl_setopt($ch,CURLOPT_URL,$url); //여기선 url을 변수로
		curl_setopt($ch,CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch,CURLOPT_HEADER, 1);
		curl_setopt($ch,CURLOPT_CONNECTTIMEOUT , $timeout);
		curl_setopt($ch,CURLOPT_SSLVERSION, '6');
		curl_setopt($ch,CURLOPT_TIMEOUT , $timeout);
		curl_setopt($ch, CURLOPT_HTTPHEADER, array(
			'X-Naver-Client-Id: '.$this -> client_id,
			'X-Naver-Client-Secret: '.$this -> client_secret,
			'X-NaverPay-Chain-Id: '.$this -> chain_id,
			'Content-Type: '.$content_type
			)
		);
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
		curl_setopt($ch,CURLOPT_POST, 1); //Method를 POST로 지정.. 이 라인이 아예 없으면 GET
		curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);
		$result = curl_exec($ch);
		$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
		$response = curl_getinfo($ch);

		$body = substr($result, $headerSize);
		$resObj = json_decode($body);
		curl_close($ch);
		//print_r($body);

		//echo $httpCode;

		if($httpCode=="200"){	//성공
			//error_log("[".date('Y.m.d H:i:s')."] ".$result."\n", 3, "/home/directgames/log/naverpay/naverpay_log_".date('Y-m-d'));
		}else{ //실패
			print $body;
			//error_log("\n[".date('Y.m.d H:i:s')."] request | ". $_SESSION['user']['m_id']."\n", 3, "/home/directgames/log/naverpay/naverpay_error_log_".date('Y-m-d'));
			//error_log("\n[".date('Y.m.d H:i:s')."] request | ". $data_string."\n", 3, "/home/directgames/log/naverpay/naverpay_error_log_".date('Y-m-d'));
		//	error_log("\n[".date('Y.m.d H:i:s')."] httpCode | ". $httpCode."\n", 3, "/home/directgames/log/naverpay/naverpay_error_log_".date('Y-m-d'));
			//error_log("\n[".date('Y.m.d H:i:s')."] response | ". $result."\n", 3, "/home/directgames/log/naverpay/naverpay_error_log_".date('Y-m-d'));
		}

		return $body;
	}

}
?>