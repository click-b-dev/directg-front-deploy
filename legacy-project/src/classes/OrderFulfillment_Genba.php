<?
//case "9" Genba 핸들러 — 예약구매/일반구매/품절 back-order 분기 보존
class OrderFulfillment_Genba {
	private $conn;
	private $genba;
	private $logger;

	public function __construct($conn, $genba, $logger) {
		$this->conn   = $conn;
		$this->genba  = $genba;
		$this->logger = $logger;
	}

	public function process($value, $sub_value, $payment_info) {
		$order_system = "Genba";

		if ($value['is_preorder'] == "Y") {
			//예약구매
			$reservationid = "";
			$order_response = $this->genba->runGenbaPlaceOrderAsync($reservationid, $sub_value['item_id'], $value['price'], $value['order_ppr'], $value['ip']);
			$this->logger->info($order_response);
			$Created = $order_response->Created;
			$Expiration = "";
		} else {
			//일반구매
			$reservation_response = $this->genba->runGenbaPlaceReservationAsync($sub_value['item_id'], $value['price'], $value['order_ppr'], $value['ip']);
			$this->logger->info($reservation_response);

			if ($reservation_response->Code == "2007") {
				//품절 → back-order
				$reservationid = "";
				$order_response = $this->genba->runGenbaPlaceOrderAsync($reservationid, $sub_value['item_id'], $value['price'], $value['order_ppr'], $value['ip']);
				$this->logger->info($order_response);
				$Created = $order_response->Created;
				$Expiration = "";
			} else {
				//정상판매
				$reservationid = $reservation_response->ID;
				$order_response = $this->genba->runGenbaPlaceOrderAsync($reservationid, $sub_value['item_id'], $value['price'], $value['order_ppr'], $value['ip']);
				$this->logger->info($order_response);
				$Created = $reservation_response->Created;
				$Expiration = $reservation_response->Expiration;
			}
		}

		if (!$order_response->ID) {
			//Genba 주문 실패
			$query = "insert into genba_error_log set ordno=:ordno,sku=:sku,name=:name,Code=:Code,Details=:Details,reg_date=now()";
			$stmt = $this->conn->prepare($query);
			$stmt->execute(array(
				":ordno"   => $value['ordno'],
				":sku"     => $sub_value['item_id'],
				":name"    => $sub_value['Name'],
				":Code"    => $order_response->Code,
				":Details" => $order_response->Details,
			));
			return array('order_status'=>'1', 'send_status'=>'fail', 'order_system'=>$order_system);
		}

		//Genba 주문 성공
		$genba_query = "insert into tbl_order_item_genba set m_no=:m_no,m_id=:m_id,ordno=:ordno,ID=:ID,ClientTransactionID=:ClientTransactionID,Sku=:Sku,Created=:Created,Expiration=:Expiration,State=:State,CommunicatedBuyingPrice=:CommunicatedBuyingPrice,ActualBuyingPrice=:ActualBuyingPrice,NetAmount=:NetAmount,GrossAmount=:GrossAmount,ReservationID=:ReservationID,ord_ymd=:ord_ymd,product_code=:product_code,product_name=:product_name,Name=:Name,Platform=:Platform,Publisher=:Publisher";
		$stmt = $this->conn->prepare($genba_query);
		$genba_params = array(
			":m_no"                    => $payment_info['m_no'],
			":m_id"                    => $payment_info['m_id'],
			":ordno"                   => $value['ordno'],
			":ID"                      => $order_response->ID,
			":ClientTransactionID"     => $order_response->ClientTransactionID,
			":Sku"                     => $order_response->Sku,
			":Created"                 => $Created,
			":Expiration"              => $Expiration,
			":State"                   => $order_response->State,
			":CommunicatedBuyingPrice" => $order_response->CommunicatedBuyingPrice->Amount,
			":ActualBuyingPrice"       => $order_response->ActualBuyingPrice->Amount,
			":NetAmount"               => $order_response->SellingPrice->NetAmount,
			":GrossAmount"             => $order_response->SellingPrice->GrossAmount,
			":ReservationID"           => $order_response->ReservationID,
			":ord_ymd"                 => date('Y-m-d'),
			":product_code"            => $value['product_code'],
			":product_name"            => $value['product_name'],
			":Name"                    => $sub_value['Name'],
			":Platform"                => $sub_value['Platform'],
			":Publisher"               => $sub_value['Publisher'],
		);
		$stmt->execute($genba_params);
		$this->logger->info($genba_params);

		return OrderFulfillment::successResult($order_system, $payment_info['pay_type']);
	}
}
?>
