<?
//case "1" Asset 핸들러 — try/catch 패턴 보존, 응답 list를 foreach로 다중 insert
class OrderFulfillment_Asset {
	private $conn;
	private $asset;
	private $logger;

	public function __construct($conn, $asset, $logger) {
		$this->conn   = $conn;
		$this->asset  = $asset;
		$this->logger = $logger;
	}

	public function process($value, $sub_value, $payment_info) {
		$order_system = "Asset";
		try {
			$asset_response = $this->asset->runReserveRegister($payment_info['m_id'], $value['ordno'], $sub_value['item_id']);
			$this->logger->info($asset_response);

			//품절 등으로 응답 list가 비면 insert가 0건 → tbl_order_item_asset 미생성.
			//성공(delivered)으로 처리하면 order_ready로도 안 잡히는 사각지대가 되므로 fail 반환
			if (empty($asset_response->list)) {
				$this->logger->error("Asset 발급 실패(품절/빈 응답): ordno=".$value['ordno'].", item_id=".$sub_value['item_id']);
				return array('order_status'=>'1', 'send_status'=>'fail', 'order_system'=>$order_system);
			}

			foreach ($asset_response->list as $asset_item) {
				$query = "insert into tbl_order_item_asset set m_no=:m_no,m_id=:m_id,ordno=:ordno,product_code=:product_code,product_name=:product_name,asset_id=:asset_id,asset_name=:asset_name,reserve_id=:reserve_id,asset_publisher=:asset_publisher,asset_platform=:asset_platform,order_date=now(),asset_type=:asset_type,ord_ymd=:ord_ymd";
				$stmt = $this->conn->prepare($query);
				$stmt->execute(array(
					":m_no"            => $payment_info['m_no'],
					":m_id"            => $payment_info['m_id'],
					":ordno"           => $asset_item->po,
					":product_code"    => $value['product_code'],
					":product_name"    => $value['product_name'],
					":asset_id"        => $asset_item->assetId,
					":asset_name"      => $sub_value['item_name'],
					":reserve_id"      => $asset_item->reserveId,
					":asset_publisher" => $sub_value['item_publisher'],
					":asset_platform"  => $sub_value['item_platform'],
					":asset_type"      => $sub_value['item_type'],
					":ord_ymd"         => date('Y-m-d'),
				));
			}
			return OrderFulfillment::successResult($order_system, $payment_info['pay_type']);
		} catch (Exception $e) {
			return array('order_status'=>'1', 'send_status'=>'fail', 'order_system'=>$order_system);
		}
	}
}
?>
