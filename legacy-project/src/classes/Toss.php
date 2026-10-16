<?php
class Toss{
	protected $confirm_url;
	protected $secretkey;
	protected $clientkey;
	
	public function __construct($mode){
		if($mode=="test"){
			$this->clientkey = "test_ck_7DLJOpm5Qrld74AkkDqrPNdxbWnY";
			$this->secretkey = "test_gsk_Poxy1XQL8R2XOw0JpA2587nO5Wml";
		}else{
			$this->clientkey = "live_gck_QbgMGZzorznL1Pz5oOxDrl5E1em4";
			$this->secretkey = "live_gsk_26DlbXAaV0OlZ5aBjo4n3qY50Q9R";
		}
		$this->confirm_url="https://api.tosspayments.com/v1/payments/confirm";
	}
	
	public function confirmPayment($params){
		$url = $this->confirm_url;
		$data = array(
			"paymentKey"     => $params['paymentKey'],
			"orderId"        => $params['orderId'],
			"amount"         => $params['amount']
		);
		
		$req_data = json_encode($data);

		$certinfo = base64_encode($this->secretkey.":");

		$header_data = array(
			'Content-Type: application/json',
			'Authorization: Basic '.$certinfo
		);
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_HTTPHEADER, $header_data);
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
		curl_setopt($ch, CURLOPT_POSTFIELDS, $req_data);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		// API RES
		$res_data = curl_exec($ch); 
		$status_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		curl_close($ch);

		// RES JSON DATA Parsing
		$response_data = json_decode($res_data, true);

		if ($status_code != 200) {
			throw new Exception($response_data['message'] ?? '결제 승인에 실패했습니다. (HTTP ' . $status_code . ')');
		} else {
			return $response_data;
		}
	}
	
	public function cancelPayment($params){
		$data = array(
			"cancelReason"   => "구매자 변심"
		);
		
		if($params["cancelAmount"]>0){
			$data["cancelAmount"]=$params["cancelAmount"];
		}
		
		$url="https://api.tosspayments.com/v1/payments/".$params['paymentKey']."/cancel";

		$req_data = json_encode($data);

		$certinfo = base64_encode($this->secretkey.":");

		$header_data = array(
			'Content-Type: application/json',
			'Authorization: Basic '.$certinfo,
			'Idempotency-Key: '.$params['settle_no'].$params['cancelAmount']
		);
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_HTTPHEADER, $header_data);
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
		curl_setopt($ch, CURLOPT_POSTFIELDS, $req_data);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		// API RES
		$res_data = curl_exec($ch); 
		$status_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		curl_close($ch);

		// RES JSON DATA Parsing
		$response_data = json_decode($res_data, true);

		if ($status_code != 200) {
			return '결제취소에 실패했습니다. (HTTP ' . $status_code . ')';
		} else {
			return $response_data;
		}
	}

	public function viewPayment($paymentKey){
		$url="https://api.tosspayments.com/v1/payments/".$paymentKey;

		$certinfo = base64_encode($this->secretkey.":");

		$header_data = array(
			'Authorization: Basic '.$certinfo
		);
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_HTTPHEADER, $header_data);
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		// API RES
		$res_data = curl_exec($ch); 
		$status_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		curl_close($ch);

		// RES JSON DATA Parsing
		$response_data = json_decode($res_data, true);

		if ($status_code != 200) {
//			throw new Exception($response_data['message'] ?? '조회에 실패했습니다. (HTTP ' . $status_code . ')');
//			debug($response_data['message'] ?? '조회에 실패했습니다. (HTTP ' . $status_code . ')');
		} else {
			return $response_data;
		}
	}

	//클래스 소멸자
	public function __destruct() {
		$this->_db=null;
	}
}
?>