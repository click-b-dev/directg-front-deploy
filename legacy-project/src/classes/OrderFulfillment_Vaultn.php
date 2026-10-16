<?
//case "8" Vaultn 핸들러 — runOrderCreate 후 응답 검증으로 성공/실패 분기
class OrderFulfillment_Vaultn {
	private $conn;
	private $vaultn;
	private $logger;

	public function __construct($conn, $vaultn, $logger) {
		$this->conn   = $conn;
		$this->vaultn = $vaultn;
		$this->logger = $logger;
	}

	public function process($value, $sub_value, $payment_info) {
		$order_system = "Vaultn";

		$params = array(
			"sku"                     => $sub_value['item_id'],
			"ipAddress"               => $payment_info['ip'],
			"salesPriceGross"         => $value['price'],
			"clientOrderReference"    => $value['ordno'],
			"clientCustomerReference" => (string)$payment_info['m_no'],
		);
		$vaultn_data = $this->vaultn->runOrderCreate($params);
		$this->logger->info($vaultn_data);

		if (!$vaultn_data->orderId) {
			return array('order_status'=>'1', 'send_status'=>'fail', 'order_system'=>$order_system);
		}

		$query = "insert into tbl_order_item_vaultn set m_no=:m_no,m_id=:m_id,orderId=:orderId,clientOrderReference=:clientOrderReference,sku=:sku,clientCustomerReference=:clientCustomerReference,created=:created,status=:status,salesCurrency=:salesCurrency,salesCountry=:salesCountry,salesCountryCode=:salesCountryCode,salesPriceGross=:salesPriceGross,publisherName=:publisherName,publisherGuid=:publisherGuid,priceModel=:priceModel,priceListGuid=:priceListGuid,countryCode=:countryCode,srpCurrency=:srpCurrency,purchasePriceCurrency=:purchasePriceCurrency,baseSRP=:baseSRP,discountedSRP=:discountedSRP,netDiscountedSRP=:netDiscountedSRP,priceListVAT=:priceListVAT,basePurchasePrice=:basePurchasePrice,promoPercentage=:promoPercentage,netPurchasePrice=:netPurchasePrice,estimatedMargin=:estimatedMargin,provider=:provider,fulfilmentStatus=:fulfilmentStatus,reg_date=now(),ord_ymd=:ord_ymd,product_code=:product_code,product_name=:product_name,Name=:Name ON DUPLICATE KEY UPDATE update_date=now()";
		$stmt = $this->conn->prepare($query);
		$c_params2 = array(
			":m_no"                    => $payment_info['m_no'],
			":m_id"                    => $payment_info['m_id'],
			":orderId"                 => $vaultn_data->orderId,
			":clientOrderReference"    => $value['ordno'],
			":sku"                     => $vaultn_data->orderItemDetails->sku,
			":clientCustomerReference" => $payment_info['m_no'],
			":created"                 => $vaultn_data->created,
			":status"                  => $vaultn_data->status,
			":salesCurrency"           => $vaultn_data->orderDetails->salesCurrency,
			":salesCountry"            => $vaultn_data->orderDetails->salesCountry,
			":salesCountryCode"        => $vaultn_data->orderDetails->salesCountryCode,
			":salesPriceGross"         => $vaultn_data->orderDetails->salesPriceGross,
			":publisherName"           => $vaultn_data->orderDetails->priceListDetails->publisherName,
			":publisherGuid"           => $vaultn_data->orderDetails->priceListDetails->publisherGuid,
			":priceModel"              => $vaultn_data->orderDetails->priceListDetails->priceModel,
			":priceListGuid"           => $vaultn_data->orderDetails->priceListDetails->priceListGuid,
			":countryCode"             => $vaultn_data->orderDetails->priceListDetails->countryCode,
			":srpCurrency"             => $vaultn_data->orderDetails->priceListDetails->srpCurrency,
			":purchasePriceCurrency"   => $vaultn_data->orderDetails->priceListDetails->purchasePriceCurrency,
			":baseSRP"                 => $vaultn_data->orderDetails->priceListDetails->baseSRP,
			":discountedSRP"           => $vaultn_data->orderDetails->priceListDetails->discountedSRP,
			":netDiscountedSRP"        => $vaultn_data->orderDetails->priceListDetails->netDiscountedSRP,
			":priceListVAT"            => $vaultn_data->orderDetails->priceListDetails->priceListVAT,
			":basePurchasePrice"       => $vaultn_data->orderDetails->priceListDetails->basePurchasePrice,
			":promoPercentage"         => $vaultn_data->orderDetails->priceListDetails->promoPercentage,
			":netPurchasePrice"        => $vaultn_data->orderDetails->priceListDetails->netPurchasePrice,
			":estimatedMargin"         => $vaultn_data->orderDetails->priceListDetails->estimatedMargin,
			":provider"                => $vaultn_data->orderItemDetails->provider,
			":fulfilmentStatus"        => $vaultn_data->orderItemDetails->fulfilmentStatus,
			":ord_ymd"                 => date('Y-m-d'),
			":product_code"            => $value['product_code'],
			":product_name"            => $value['product_name'],
			":Name"                    => $sub_value['item_name'],
		);
		$this->logger->info($c_params2);
		$stmt->execute($c_params2);

		return OrderFulfillment::successResult($order_system, $payment_info['pay_type']);
	}
}
?>
