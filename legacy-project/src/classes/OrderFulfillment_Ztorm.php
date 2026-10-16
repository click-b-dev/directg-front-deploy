<?
//case "2" Ztorm 핸들러 — 회원가입 + 주문 생성
class OrderFulfillment_Ztorm {
	private $conn;
	private $ztorm;
	private $logger;

	public function __construct($conn, $ztorm, $logger) {
		$this->conn   = $conn;
		$this->ztorm  = $ztorm;
		$this->logger = $logger;
	}

	public function process($value, $sub_value, $payment_info) {
		$order_system = "Ztorm";
		$name = !empty($payment_info['name']) ? $payment_info['name'] : $payment_info['nickname'];

		//회원가입
		$member_params = array(
			"RetailerCustomerID" => $payment_info['m_id'],
			"Username"           => $name,
			"Email"              => $payment_info['m_id'],
			"FirstName"          => '',
			"LastName"           => '',
			"CountryCode"        => 'KR',
			"YearOfBirth"        => '',
		);
		$member_response = $this->ztorm->runCreateCustomer($member_params);
		$this->logger->info($member_response);

		//주문 생성
		$zt_ord_no = $this->ztorm->runZtormOrder($payment_info['m_id'], $payment_info['ip'], $value['ordno'], $sub_value['item_id'], $value['price'], $payment_info['payment_method'], $value['publisher_code']);
		$this->logger->info($zt_ord_no);

		//주문 응답에 CustomerProductID 없으면 실패(품절/주문불가) — tbl_order_item_ztorm 미생성, fail 반환
		//기존엔 검증 없이 무조건 성공 처리해 사각지대였음
		if (empty((string)$zt_ord_no)) {
			$this->logger->error("Ztorm 주문 실패(빈 CustomerProductID): ordno=".$value['ordno'].", item_id=".$sub_value['item_id']);
			return array('order_status'=>'1', 'send_status'=>'fail', 'order_system'=>$order_system);
		}

		$query = "insert into tbl_order_item_ztorm set m_no=:m_no,m_id=:m_id,ordno=:ordno,product_code=:product_code,product_name=:product_name,ztorm_item_id=:ztorm_item_id,ztorm_item_name=:ztorm_item_name,customer_product_id=:customer_product_id,ztorm_publisher=:ztorm_publisher,ztorm_platform=:ztorm_platform,order_date=now(),ord_ymd=:ord_ymd ON DUPLICATE KEY UPDATE batch_date=now()";
		$stmt = $this->conn->prepare($query);
		$c_params = array(
			":m_no"                => $payment_info['m_no'],
			":m_id"                => $payment_info['m_id'],
			":ordno"               => $value['ordno'],
			":product_code"        => $value['product_code'],
			":product_name"        => $value['product_name'],
			":ztorm_item_id"       => $sub_value['item_id'],
			":ztorm_item_name"     => $sub_value['item_name'],
			":customer_product_id" => $zt_ord_no,
			":ztorm_publisher"     => $sub_value['item_publisher'],
			":ztorm_platform"      => $sub_value['item_platform'],
			":ord_ymd"             => date('Y-m-d'),
		);
		$this->logger->info($c_params);
		$stmt->execute($c_params);

		return OrderFulfillment::successResult($order_system, $payment_info['pay_type']);
	}
}
?>
