<?
//case "10" PointNexus 핸들러
//기본: runProductSell(즉시 판매·키 발급) / KCP 가상계좌(VCNT)에 한해 runProductBook(예약·키 선점)
//실패(success=false 또는 operationID 없음) 시 status='failed' row 기록 후 fail 반환 (operationID는 NULL)
//book 흐름은 Phase 5(KCP webhook)에서 confirm/cancel로 이어짐
class OrderFulfillment_PointNexus {
	private $conn;
	private $pointnexus;
	private $logger;

	public function __construct($conn, $pointnexus, $logger) {
		$this->conn       = $conn;
		$this->pointnexus = $pointnexus;
		$this->logger     = $logger;
	}

	public function process($value, $sub_value, $payment_info) {
		$order_system = "PointNexus";
		$pay_type     = isset($payment_info['pay_type']) ? $payment_info['pay_type'] : '';
		$pg           = isset($payment_info['pg']) ? $payment_info['pg'] : ''; //'kcp'|'toss'|'tosspay'|'payco'|'naverpay'|'dgkr' 등 — 호출부에서 명시

		//clientRequestID는 24시간 내 unique 요구 (idempotency) — ordno+item_id 조합으로 결정적 생성
		$clientRequestID = $value['ordno'] . '_' . $sub_value['item_id'];
		if (strlen($clientRequestID) > 80) {
			$clientRequestID = substr($clientRequestID, 0, 80);
		}

		$params = array(
			'currency'        => 'KRW',
			'countryCode'     => 'KR',
			'IP'              => $payment_info['ip'],
			'price'           => (int)$value['price'],
			'vat'             => 1000, //한국 VAT 10% (PointNexus는 *100 단위)
			'clientRequestID' => $clientRequestID,
		);

		//프리오더 상품 판별 — pointnexus_catalogue.isPreOrder 조회
		//프리오더는 출시 전이라 키 재고가 없어 runProductBook 호출 시 거절됨
		//따라서 VCNT 든 즉시결제든 항상 runProductSell 호출 → pending_reveal 상태로 저장 → 출시 후 reveal 배치에서 키 수령
		$is_preorder = false;
		try {
			$pre_stmt = $this->conn->prepare("SELECT isPreOrder FROM pointnexus_catalogue WHERE productID=:productID AND mode=:mode LIMIT 1");
			$pre_stmt->execute(array(':productID'=>$sub_value['item_id'], ':mode'=>$this->pointnexus->getMode()));
			$is_preorder = ((int)$pre_stmt->fetchColumn() === 1);
		} catch (PDOException $e) {
			//카탈로그 조회 실패 시 일반상품으로 fallback (안전한 쪽)
			$this->logger->error("pointnexus_catalogue 조회 실패: ".$e->getMessage());
		}

		//KCP 가상계좌 + 일반상품 → book→confirm 흐름 / 그 외(즉시결제, 프리오더 등)는 sell
		//Phase 5에서 KCP webhook(op_cd 50/13)이 book→confirm/cancel 호출
		$is_book = (!$is_preorder) && ($pg == 'kcp' && $pay_type == 'VCNT');

		if ($is_book) {
			$pn_data = $this->pointnexus->runProductBook($sub_value['item_id'], $params);
		} else {
			$pn_data = $this->pointnexus->runProductSell($sub_value['item_id'], $params);
		}
		$this->logger->info($pn_data);

		//응답 검증 — success 없거나 operationID 없으면 실패
		//결제는 이미 완료된 상태이므로 미발급 건을 추적·재시도·리포트할 수 있도록 실패 row를 남김
		//operationID가 없어 NULL로 INSERT (uk_op UNIQUE는 NULL 다중 허용 → 충돌 없음, parent_operationID도 NULL)
		if (empty($pn_data->success) || empty($pn_data->data->operationID)) {
			$fail_action = $is_book ? 'book' : 'sell'; //시도했던 호출 종류
			$fail_source = array(
				'm_no'            => $payment_info['m_no'],
				'm_id'            => $payment_info['m_id'],
				'ordno'           => $value['ordno'],
				'product_code'    => $value['product_code'],
				'product_name'    => $value['product_name'],
				'Name'            => $sub_value['item_name'],
				'productID'       => $sub_value['item_id'],
				'currency'        => $params['currency'],
				'countryCode'     => $params['countryCode'],
				'price'           => $params['price'],
				'vat'             => $params['vat'],
				'clientRequestID' => $clientRequestID,
				'mode'            => $this->pointnexus->getMode(),
				'ord_ymd'         => date('Y-m-d'),
			);
			try {
				self::insertLogRow($this->conn, $fail_source, $fail_action, null, 'failed', array(
					'raw_request'  => json_encode($params,  JSON_UNESCAPED_UNICODE),
					'raw_response' => json_encode($pn_data, JSON_UNESCAPED_UNICODE),
				));
			} catch (PDOException $e) {
				//실패 row 기록 자체가 실패해도 발급 결과(fail)는 그대로 반환
				$this->logger->error("PointNexus 실패 row INSERT 실패: ".$e->getMessage());
			}
			return array('order_status'=>'1', 'send_status'=>'fail', 'order_system'=>$order_system);
		}

		$op                = $pn_data->data;
		$license_key       = isset($op->license->key)        ? $op->license->key        : '';
		$license_type      = isset($op->license->type)       ? $op->license->type       : '';
		$license_platform  = isset($op->license->platform)   ? $op->license->platform   : '';
		$license_countries = isset($op->license->countries)  ? json_encode($op->license->countries, JSON_UNESCAPED_UNICODE) : '';
		$capsule_id        = isset($op->capsule->id)         ? $op->capsule->id         : '';

		//상태 결정 — book 흐름은 booked, sell 흐름은 license_key 유무에 따라 sold/pending_reveal
		//action: append-only 로그 컨벤션 — 호출 종류(sell/book) 기록
		if ($is_book) {
			$action = 'book';
			$status = 'booked';
		} elseif (!empty($license_key)) {
			$action = 'sell';
			$status = 'sold';
		} else {
			$action = 'sell';
			$status = 'pending_reveal'; //Preorder SKU — Phase 6 reveal 배치에서 처리
		}

		//최초 호출(sell/book)이라 parent_operationID는 NULL — 후속 confirm/cancel/reveal에서 채움
		$query = "insert into tbl_order_item_pointnexus set
			m_no=:m_no, m_id=:m_id, ordno=:ordno,
			product_code=:product_code, product_name=:product_name, Name=:Name,
			productID=:productID, operationID=:operationID, action=:action, parent_operationID=NULL, capsule_id=:capsule_id,
			license_key=:license_key, license_type=:license_type, license_platform=:license_platform, license_countries=:license_countries,
			currency=:currency, countryCode=:countryCode, price=:price, vat=:vat,
			clientRequestID=:clientRequestID, status=:status, mode=:mode,
			ord_ymd=:ord_ymd, raw_request=:raw_request, raw_response=:raw_response, reg_date=now()
			ON DUPLICATE KEY UPDATE update_date=now()";
		$stmt = $this->conn->prepare($query);
		$insert_params = array(
			':m_no'              => $payment_info['m_no'],
			':m_id'              => $payment_info['m_id'],
			':ordno'             => $value['ordno'],
			':product_code'      => $value['product_code'],
			':product_name'      => $value['product_name'],
			':Name'              => $sub_value['item_name'],
			':productID'         => $sub_value['item_id'],
			':operationID'       => $op->operationID,
			':action'            => $action,
			':capsule_id'        => $capsule_id,
			':license_key'       => $license_key,
			':license_type'      => $license_type,
			':license_platform'  => $license_platform,
			':license_countries' => $license_countries,
			':currency'          => $params['currency'],
			':countryCode'       => $params['countryCode'],
			':price'             => $params['price'],
			':vat'               => $params['vat'],
			':clientRequestID'   => $clientRequestID,
			':status'            => $status,
			':mode'              => $this->pointnexus->getMode(),
			':ord_ymd'           => date('Y-m-d'),
			':raw_request'       => json_encode($params, JSON_UNESCAPED_UNICODE),
			':raw_response'      => json_encode($pn_data, JSON_UNESCAPED_UNICODE),
		);
		$this->logger->info($insert_params);
		$stmt->execute($insert_params);

		return OrderFulfillment::successResult($order_system, $pay_type);
	}

	//append-only 로그 row INSERT 공용 헬퍼 — webhook/어드민 confirm·cancel/마이페이지 등에서 공유
	//$source : 원본 row (PDO::FETCH_ASSOC 형식, m_no/m_id/ordno/productID/currency/mode/price 등 복사 대상)
	//$action : 'confirm'|'bookCancel'|'cancel'|'reveal' 등 — 이 호출의 종류
	//$operationID : 응답에서 받은 operationID (confirm/cancel 등은 새 ID)
	//$status : 이 호출 결과의 status (confirmed/canceled/...)
	//$extras : 옵션 (license_key, license_type, license_platform, license_countries, capsule_id, raw_request, raw_response)
	//parent_operationID 는 자동으로 $source['operationID'] 사용 (이 호출이 어느 op 위에서 실행됐는지)
	public static function insertLogRow($conn, $source, $action, $operationID, $status, $extras = array()) {
		$extras = array_merge(array(
			'license_key'       => '',
			'license_type'      => '',
			'license_platform'  => '',
			'license_countries' => '',
			'capsule_id'        => isset($source['capsule_id']) ? $source['capsule_id'] : '',
			'raw_request'       => '',
			'raw_response'      => '',
		), $extras);

		$query = "INSERT INTO tbl_order_item_pointnexus SET
			m_no=:m_no, m_id=:m_id, ordno=:ordno,
			product_code=:product_code, product_name=:product_name, Name=:Name,
			productID=:productID,
			operationID=:operationID, action=:action, parent_operationID=:parent_operationID,
			capsule_id=:capsule_id,
			license_key=:license_key, license_type=:license_type, license_platform=:license_platform, license_countries=:license_countries,
			currency=:currency, countryCode=:countryCode, price=:price, vat=:vat,
			clientRequestID=:clientRequestID,
			status=:status, mode=:mode,
			ord_ymd=:ord_ymd,
			raw_request=:raw_request, raw_response=:raw_response,
			reg_date=NOW()";
		$stmt = $conn->prepare($query);
		$stmt->execute(array(
			':m_no'               => isset($source['m_no']) ? $source['m_no'] : null,
			':m_id'               => isset($source['m_id']) ? $source['m_id'] : null,
			':ordno'              => isset($source['ordno']) ? $source['ordno'] : null,
			':product_code'       => isset($source['product_code']) ? $source['product_code'] : null,
			':product_name'       => isset($source['product_name']) ? $source['product_name'] : null,
			':Name'               => isset($source['Name']) ? $source['Name'] : null,
			':productID'          => isset($source['productID']) ? $source['productID'] : null,
			':operationID'        => $operationID,
			':action'             => $action,
			':parent_operationID' => isset($source['operationID']) ? $source['operationID'] : null,
			':capsule_id'         => $extras['capsule_id'],
			':license_key'        => $extras['license_key'],
			':license_type'       => $extras['license_type'],
			':license_platform'   => $extras['license_platform'],
			':license_countries'  => $extras['license_countries'],
			':currency'           => isset($source['currency']) ? $source['currency'] : 'KRW',
			':countryCode'        => isset($source['countryCode']) ? $source['countryCode'] : 'KR',
			':price'              => isset($source['price']) ? $source['price'] : 0,
			':vat'                => isset($source['vat']) ? $source['vat'] : 1000,
			':clientRequestID'    => isset($source['clientRequestID']) ? $source['clientRequestID'] : null,
			':status'             => $status,
			':mode'               => isset($source['mode']) ? $source['mode'] : 'prod',
			':ord_ymd'            => isset($source['ord_ymd']) ? $source['ord_ymd'] : date('Y-m-d'),
			':raw_request'        => $extras['raw_request'],
			':raw_response'       => $extras['raw_response'],
		));
	}

	//비동기 취소(cancel_pending) 1건 검증·확정 — order_view(자동)·검증배치(수동) 공용. cron 불필요.
	//$row: 최신 cancel_pending row(idx/ordno/operationID/raw_response/mode 포함). $pointnexus: 해당 mode 인스턴스.
	//$adminOrder: null이면 주문상품 취소완료 처리·주문로그 생략(pn row 상태만 확정).
	//반환: array('status'=>확정상태, 'result'=>'ok|fail|pending', 'state'=>op상태, 'message'=>설명)
	public static function resolveCancelPending($conn, $pointnexus, $row, $adminOrder = null) {
		$ret = array('status' => 'cancel_pending', 'result' => 'pending', 'state' => '', 'message' => '');
		if(empty($row['operationID'])){
			$ret['message'] = 'operationID 없음 — 보류';
			return $ret;
		}
		$op = $pointnexus->runOperation($row['operationID']);
		if(empty($op->success) || empty($op->data) || !isset($op->data[0])){
			$ret['message'] = 'operation 조회 실패 — 보류';
			return $ret;
		}
		$d     = $op->data[0];
		$state = isset($d->state) ? $d->state : '';
		$qe    = isset($d->qtyInError) ? (int)$d->qtyInError : 0;
		$ret['state'] = $state;

		//raw_response: 기존 accept + 이번 verify 병합 보존
		$merged = json_encode(array(
			'accept' => json_decode(isset($row['raw_response']) ? $row['raw_response'] : 'null'),
			'verify' => $op,
		), JSON_UNESCAPED_UNICODE);

		//주문로그용 settle_no
		$settle_no = '';
		if($adminOrder !== null){
			$ss = $conn->prepare("SELECT settle_no FROM tbl_order_item WHERE ordno=:o LIMIT 1");
			$ss->execute(array(':o' => $row['ordno']));
			$sr = $ss->fetch(PDO::FETCH_ASSOC);
			$settle_no = $sr ? $sr['settle_no'] : '';
		}

		if($state === 'done' && $qe === 0){
			$u = $conn->prepare("UPDATE tbl_order_item_pointnexus SET status='canceled', raw_response=:r, update_date=NOW() WHERE idx=:idx");
			$u->execute(array(':r' => $merged, ':idx' => $row['idx']));
			$ret['status'] = 'canceled'; $ret['result'] = 'ok'; $ret['message'] = 'canceled 확정';
			if($adminOrder !== null){
				$adminOrder->setOrderLog($settle_no, $row['ordno'], "[PointNexus] 취소 검증 완료(state=done) — canceled 확정");
				//주문상품에 남은 활성/대기 PointNexus 없으면 취소완료(9)
				$chk = $conn->prepare("
					SELECT COUNT(*) AS cnt
					FROM tbl_order_item_pointnexus a
					INNER JOIN (
						SELECT ordno, productID, MAX(idx) AS midx
						FROM tbl_order_item_pointnexus
						WHERE ordno = :o
						GROUP BY ordno, productID
					) b ON a.idx = b.midx
					WHERE a.ordno = :o2
					  AND a.status IN ('booked','sold','confirmed','pending_reveal','cancel_pending')");
				$chk->execute(array(':o' => $row['ordno'], ':o2' => $row['ordno']));
				$left = $chk->fetch(PDO::FETCH_ASSOC);
				if((int)$left['cnt'] === 0){
					$adminOrder->cancelOrderItem($row['ordno'], "9");
					$adminOrder->setOrderLog($settle_no, $row['ordno'], "[PointNexus] 전체 취소 확정 — 주문상품 취소완료(9) 처리");
				}
			}
		}else if($state === 'error' || $qe > 0){
			$u = $conn->prepare("UPDATE tbl_order_item_pointnexus SET status='cancel_failed', raw_response=:r, update_date=NOW() WHERE idx=:idx");
			$u->execute(array(':r' => $merged, ':idx' => $row['idx']));
			$ret['status'] = 'cancel_failed'; $ret['result'] = 'fail'; $ret['message'] = 'cancel_failed 확정 (수동확인 필요)';
			if($adminOrder !== null){
				$adminOrder->setOrderLog($settle_no, $row['ordno'], "[PointNexus] 취소 검증 실패(state=".$state.", qtyInError=".$qe.") — cancel_failed. 주문상품 취소완료 안 됨(수동확인 필요)");
			}
		}else{
			$ret['message'] = 'state='.$state.' 처리중 — 보류';
		}
		return $ret;
	}

	//마이페이지/어드민 키 조회용 — 라이브 조회(Option A): DB 저장값 대신 PointNexus에서 직접 받아 표시.
	//sold/confirmed → GET /operation/{id} 로 최신 키 / pending_reveal → reveal 시도(첫 성공 시 sold로 append 영속화).
	//라이브 실패·키 없음 시 DB 저장값으로 폴백(고객 화면은 그대로 노출, 어드민은 source로 실패 표시).
	//반환: array('status','license_key','license_platform','source'=>'live'|'db_fallback'|'skip','error')
	//  - live        : PointNexus에서 직접 받은 키
	//  - db_fallback : 라이브 호출했으나 예외/응답실패/키없음 → DB 저장값 사용 (어드민 경고 대상)
	//  - skip        : 라이브 미시도(booked/canceled/failed/operationID없음) 또는 예약 미출시(정상)
	public static function fetchLicenseForView($conn, $row, $logger = null) {
		$status  = isset($row['status'])           ? $row['status']           : '';
		$opId    = isset($row['operationID'])      ? $row['operationID']      : '';
		$mode    = isset($row['mode'])             ? $row['mode']             : 'prod';
		$db_key  = isset($row['license_key'])      ? $row['license_key']      : '';
		$db_plat = isset($row['license_platform']) ? $row['license_platform'] : '';

		//기본(폴백) — source 'skip': 라이브 조회를 시도하지 않는 정상 상태
		$base = array(
			'status'           => $status,
			'license_key'      => $db_key,
			'license_platform' => $db_plat,
			'source'           => 'skip',
			'error'            => '',
		);

		//라이브 조회 대상이 아니거나(booked/canceled/failed 등) operationID가 없으면 DB 값 그대로
		if ($opId === '' || ($status !== 'sold' && $status !== 'confirmed' && $status !== 'pending_reveal')) {
			return $base;
		}

		try {
			$pointnexus = new PointNexus($mode);

			if ($status === 'pending_reveal') {
				//예약판매 — reveal 호출(멱등). 출시 전이면 success=false(400) → 미출시(정상).
				$res = $pointnexus->runOperationReveal($opId);
				if (!empty($res->success) && !empty($res->data)) {
					$op       = is_array($res->data) ? $res->data[0] : $res->data;
					$key      = isset($op->capsule->item->key)      ? $op->capsule->item->key      : '';
					$platform = isset($op->capsule->item->platform) ? $op->capsule->item->platform : '';
					$capsule  = isset($op->capsule->id)             ? $op->capsule->id             : '';
					$revealId = isset($op->id)                      ? $op->id                      : null; //reveal는 새 operationID 발급 — sell op 재사용 시 uk_op(operationID 유니크) 충돌
					if ($key !== '') {
						//첫 reveal 성공 → sold row append(폴백/감사용). operationID=reveal op(신규), parent_operationID=sell op(자동).
						try {
							self::insertLogRow($conn, $row, 'reveal', $revealId, 'sold', array(
								'license_key'      => $key,
								'license_platform' => $platform,
								'capsule_id'       => $capsule,
								'raw_response'     => json_encode($res, JSON_UNESCAPED_UNICODE),
							));
						} catch (Exception $e) {
							if ($logger) { $logger->error('fetchLicenseForView reveal persist: '.$e->getMessage()); }
						}
						return array(
							'status'           => 'sold',
							'license_key'      => $key,
							'license_platform' => $platform,
							'source'           => 'live',
							'error'            => '',
						);
					}
				}
				//미출시/키 없음 → 여전히 예약중(정상, 실패 아님)
				return array(
					'status'           => 'pending_reveal',
					'license_key'      => '',
					'license_platform' => '',
					'source'           => 'skip',
					'error'            => '',
				);
			}

			//sold/confirmed — GET /operation/{id} 라이브 조회
			$res = $pointnexus->runOperation($opId);
			if (!empty($res->success) && !empty($res->data)) {
				$op       = is_array($res->data) ? $res->data[0] : $res->data;
				$key      = isset($op->capsule->item->key)      ? $op->capsule->item->key      : '';
				$platform = isset($op->capsule->item->platform) ? $op->capsule->item->platform : '';
				if ($key !== '') {
					return array(
						'status'           => $status,
						'license_key'      => $key,
						'license_platform' => ($platform !== '' ? $platform : $db_plat),
						'source'           => 'live',
						'error'            => '',
					);
				}
			}
			//응답은 왔으나 success=false 또는 키 없음 → DB 폴백 + 실패 표시
			$base['source'] = 'db_fallback';
			$base['error']  = 'PointNexus 응답에 키 없음 (success=false 또는 capsule.key 비어있음)';
			return $base;

		} catch (Exception $e) {
			if ($logger) { $logger->error('fetchLicenseForView: '.$e->getMessage()); }
			//예외(타임아웃·네트워크·토큰실패 등) → DB 폴백 + 실패 표시
			$base['source'] = 'db_fallback';
			$base['error']  = $e->getMessage();
			return $base;
		}
	}
}
?>
