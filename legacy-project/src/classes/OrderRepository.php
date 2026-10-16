<?
//주문 관련 DB 작업 통합 헬퍼
//- INSERT (reserve 단계 + DGKR 전액할인): insertOrder, insertAddress, insertOrderItem
//- 결제 완료 후 키발급 단계: updateItemStatus
//- 결제 완료 후 정리: clearCart, insertShipment
//
//화이트리스트 기반 동적 SQL 생성 — $params에 들어있는 컬럼만 INSERT/UPDATE에 포함
class OrderRepository {
	private $conn;
	private $logger;

	public function __construct($conn, $logger) {
		$this->conn   = $conn;
		$this->logger = $logger;
	}

	//tbl_order INSERT — reserve 단계 또는 DGKR 전액할인 호출
	//$params 화이트리스트: settle_no, m_no, m_id, ord_ymd, ip, use_emoney, total_price, payment_method, pg_provider, step, is_mobile, version
	//ord_ymd, version은 기본값 자동 적용 (호출부 명시 시 덮어씀)
	//$with_payment_date=true 시 payment_date=now() 추가 (DGKR 전액할인 즉시 완료 케이스)
	public function insertOrder($params, $with_payment_date = false) {
		//기본값 — 호출부에서 omit해도 NULL 들어가지 않도록
		if (!isset($params['ord_ymd'])) $params['ord_ymd'] = date('Y-m-d');
		if (!isset($params['version'])) $params['version'] = '3';

		$allowed = array('settle_no','m_no','m_id','ord_ymd','ip','use_emoney','total_price','payment_method','pg_provider','step','is_mobile','version');
		list($set_parts, $bind) = $this->buildSetClause($params, $allowed);
		$set_parts[] = "reg_date=now()";
		if ($with_payment_date) {
			$set_parts[] = "payment_date=now()";
		}
		$query = "insert into tbl_order set " . implode(',', $set_parts);
		$stmt = $this->conn->prepare($query);
		$this->logger->info($bind);
		$stmt->execute($bind);
	}

	//tbl_order_address INSERT — 배송지 정보
	//$params 화이트리스트: settle_no, m_id, name, zipcode, address, address_detail, tel, msg
	public function insertAddress($params) {
		$allowed = array('settle_no','m_id','name','zipcode','address','address_detail','tel','msg');
		list($set_parts, $bind) = $this->buildSetClause($params, $allowed);
		$set_parts[] = "reg_date=now()";
		$query = "insert into tbl_order_address set " . implode(',', $set_parts);
		$stmt = $this->conn->prepare($query);
		$this->logger->info($bind);
		$stmt->execute($bind);
	}

	//tbl_order_item INSERT — cart 항목 1건당 호출
	//quantity='1', status='1', version='3', order_date=now()는 자동 추가
	//$params 화이트리스트: settle_no, ordno, product_code, product_name, delivery_type, goods_price, price, order_srp, order_ppr, publisher, publisher_code, m_no, m_id, ip, is_preorder, is_promotion, repay
	public function insertOrderItem($params) {
		$allowed = array('settle_no','ordno','product_code','product_name','delivery_type','goods_price','price','order_srp','order_ppr','publisher','publisher_code','order_system','m_no','m_id','ip','is_preorder','is_promotion','repay');
		list($set_parts, $bind) = $this->buildSetClause($params, $allowed);
		$set_parts[] = "quantity='1'";
		$set_parts[] = "status='1'";
		$set_parts[] = "version='3'";
		$set_parts[] = "order_date=now()";
		$query = "insert into tbl_order_item set " . implode(',', $set_parts);
		$stmt = $this->conn->prepare($query);
		$this->logger->info($bind);
		$stmt->execute($bind);
	}

	//tbl_order_item 상태 갱신 — 디스패처 호출 후 매 주문 항목 처리 마지막에 호출
	//$with_order_date=true 시 order_date=now() 추가 갱신 (DGKR 전액할인 즉시 완료 케이스)
	public function updateItemStatus($ordno, $status, $send_status, $order_system, $with_order_date = false) {
		$set_clause = "status=:status,send_status=:send_status,order_system=:order_system";
		if ($with_order_date) {
			$set_clause .= ",order_date=now()";
		}
		$query = "update tbl_order_item set " . $set_clause . " where ordno=:ordno";
		$stmt = $this->conn->prepare($query);
		$params = array(
			":status"       => $status,
			":send_status"  => $send_status,
			":order_system" => $order_system,
			":ordno"        => $ordno,
		);
		$this->logger->info($params);
		$stmt->execute($params);
	}

	//장바구니에서 selected='1' 항목 일괄 삭제
	public function clearCart($m_no) {
		$query = "delete from tbl_cart where m_no=:m_no and selected='1'";
		$stmt = $this->conn->prepare($query);
		$params = array(':m_no' => $m_no);
		$this->logger->info($params);
		$stmt->execute($params);
	}

	//실물상품 배송 정보 insert — case "2"/"3" 처리 시 호출
	public function insertShipment($settle_no, $value, $courier_name, $shipment_status) {
		$query = "insert into tbl_order_shipment set settle_no=:settle_no,ordno=:ordno,product_code=:product_code,product_name=:product_name,model_code=:model_code,model_name=:model_name,courier_name=:courier_name,shipment_status=:shipment_status";
		$stmt = $this->conn->prepare($query);
		$d_params = array(
			":settle_no"       => $settle_no,
			":ordno"           => $value['ordno'],
			":product_code"    => $value['product_code'],
			":product_name"    => $value['product_name'],
			":model_code"      => $value['model_code'],
			":model_name"      => $value['model_name'],
			":courier_name"    => $courier_name,
			":shipment_status" => $shipment_status,
		);
		$this->logger->info($d_params);
		$stmt->execute($d_params);
	}

	//화이트리스트 기반 SET 절과 바인딩 배열 생성 — INSERT 메서드들이 공통으로 사용
	private function buildSetClause($params, $allowed) {
		$set_parts = array();
		$bind = array();
		foreach ($allowed as $col) {
			if (isset($params[$col])) {
				$set_parts[] = "{$col}=:{$col}";
				$bind[":{$col}"] = $params[$col];
			}
		}
		return array($set_parts, $bind);
	}
}
?>
