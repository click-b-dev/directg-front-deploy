<?php
class Tosspay{
	protected $url;
	protected $apikey;
	
	public function __construct($mode){
		if($mode=="test"){
			$this->apikey = "sk_test_J1N6eYr52R1N6KEQwq8R";
		}else{
			$this->apikey = "sk_live_aj8aaVZG8Dj8aOvE6Y2D";
		}
		$this->url="https://pay.toss.im/api/v2";
	}
	
	public function payment($params){
		$url = $this->url."/payments";
		$data = array(
			"orderNo"         => $params['settle_no'],
			"amount"          => $params['amount'],
			"amountTaxFree"   => "0",
			"productDesc"     => $params['product_name'],
			"apiKey"          => $this->apikey,
			"autoExecute"     => "true",
			"resultCallback"  => "https://directg.net/order/tosspay/success.php",
			"retUrl"          => $params['retUrl'],
			"retCancelUrl"    => $params['retCancelUrl']
		);
		
		$req_data = json_encode($data);

		$header_data = array(
			'Content-Type: application/json'
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
		$url = $this->url."/refunds";
		$data = array(
			"apiKey"          => $this->apikey,
			"payToken"        => $params['payToken'],
			"orderNo"         => $params['settle_no'],
			"refundNo"        => $params['refundNo']
		);
		if($params['amount']>0){
			$data["amount"]=$params['amount'];
		}
		
		$req_data = json_encode($data);

		$header_data = array(
			'Content-Type: application/json'
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
			throw new Exception($response_data['message'] ?? '환불 요청에 실패했습니다. (HTTP ' . $status_code . ')');
		} else {
			return $response_data;
		}
	}

	public function viewPayment($params){
		$url = $this->url."/status";
		$data = array(
			"apiKey"          => $this->apikey,
			"payToken"        => $params['payToken'],
			"orderNo"         => $params['settle_no']
		);
		
		$req_data = json_encode($data);

		$header_data = array(
			'Content-Type: application/json'
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

	//클래스 소멸자
	public function __destruct() {
		$this->_db=null;
	}
}
?>