<?
//주문 키발급 디스패처 — order_system 코드별로 핸들러 클래스에 위임
//호출부는 외부 switch ($sub_value['order_system']) 통째로 이 클래스의 processItem() 호출 한 줄로 치환
//새 API 추가: 신규 핸들러 클래스 파일 생성 → 이 디스패처 생성자에 1줄 추가
class OrderFulfillment {
	private $handlers;

	//시스템별 전용 로거 캐시 (요청 내 중복 appender 부착 방지)
	private static $sys_loggers = array();

	//$apis: ['asset'=>Asset, 'ztorm'=>Ztorm, 'vaultn'=>Vaultn, 'genba'=>Genba, 'pointnexus'=>PointNexus]
	//pointnexus는 호출부에서 전달하지 않을 수 있으므로(점진적 롤아웃) isset 가드
	//$logger(PG 결제로거)는 호환 위해 받지만 핸들러에는 주입하지 않음 — 주문 발급 로그는 시스템별 로그로 분리(아래 systemLogger)
	public function __construct($conn, $apis, $logger) {
		$this->handlers = array(
			"1" => new OrderFulfillment_Asset($conn, $apis['asset'], self::systemLogger('asset')),
			"2" => new OrderFulfillment_Ztorm($conn, $apis['ztorm'], self::systemLogger('ztorm')),
			"8" => new OrderFulfillment_Vaultn($conn, $apis['vaultn'], self::systemLogger('vaultn')),
			"9" => new OrderFulfillment_Genba($conn, $apis['genba'], self::systemLogger('genba')),
		);
		if (isset($apis['pointnexus'])) {
			$this->handlers["10"] = new OrderFulfillment_PointNexus($conn, $apis['pointnexus'], self::systemLogger('pointnexus'));
		}
	}

	//시스템별 전용 로거 — 결제(PG) 로그가 아니라 각 주문시스템 디렉토리(/log/<system>/)에 적재.
	//PG 페이지가 전역 Logger::configure()로 설정한 결제 로거는 건드리지 않도록,
	//named logger('fulfillment.<system>')에 DailyFile appender를 직접 부착하고
	//additivity=false 로 root(결제로그)로의 전파를 차단한다.
	//출력 파일: www/log/<system>/fulfillment-YYYY-MM-DD.log (__DIR__=src/classes 기준 — DOCUMENT_ROOT는 진입점마다 달라 안 씀)
	private static function systemLogger($system) {
		if (isset(self::$sys_loggers[$system])) {
			return self::$sys_loggers[$system];
		}
		$logger = Logger::getLogger('fulfillment.'.$system);
		if (count($logger->getAllAppenders()) === 0) {
			$layout = new LoggerLayoutPattern();
			$layout->setConversionPattern("%d{Y-m-d H:i:s} : %-5p : %m%n");
			$layout->activateOptions();

			$appender = new LoggerAppenderDailyFile('fulfillment_'.$system);
			$appender->setFile(__DIR__.'/../../log/'.$system.'/fulfillment-%s.log');
			$appender->setDatePattern('Y-m-d');
			$appender->setAppend(true);
			$appender->setLayout($layout);
			$appender->activateOptions();

			$logger->addAppender($appender);
			$logger->setAdditivity(false); //root(결제로그)로 전파 차단
		}
		self::$sys_loggers[$system] = $logger;
		return $logger;
	}

	//order_system 코드 → 해당 핸들러의 process() 호출
	//$value: 주문 항목 (tbl_order_item row), $sub_value: 배송 아이템 (tbl_goods_item_delivery row)
	//$payment_info: ['pay_type','ip','m_no','m_id','name','nickname','payment_method']
	//반환: ['order_status','send_status','order_system']
	public function processItem($order_system, $value, $sub_value, $payment_info) {
		if (isset($this->handlers[$order_system])) {
			return $this->handlers[$order_system]->process($value, $sub_value, $payment_info);
		}
		return array('order_status'=>'1', 'send_status'=>'fail', 'order_system'=>'');
	}

	//VCNT(가상계좌)는 입금대기, 그 외는 즉시 발송 — 핸들러 공통 분기 (각 핸들러에서 호출)
	public static function successResult($order_system, $pay_type) {
		if ($pay_type == "VCNT") {
			return array('order_status'=>'3', 'send_status'=>'pending', 'order_system'=>$order_system);
		}
		return array('order_status'=>'2', 'send_status'=>'delivered', 'order_system'=>$order_system);
	}
}
?>
