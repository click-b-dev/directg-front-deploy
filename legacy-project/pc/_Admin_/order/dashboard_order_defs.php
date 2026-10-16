<?
//============================================================
//주문 대시보드 공용 정의 — 셸(placeholder 렌더)과 AJAX 카운트 엔드포인트가 공유
//  - dash_count()      : 단일 COUNT 실행(실패 시 null)
//  - dash_sql_map()    : 카드 key => 집계 SQL
//  - dash_action_cards / dash_anomaly_cards : 카드 메타(라벨/설명/링크/아이콘/key)
//집계 SQL은 각 카드가 링크하는 리스트 페이지와 동일 조건(건수 일치 보장)
//============================================================

//단일 COUNT 실행 헬퍼 — 실패(예: 테이블 없음) 시 null 반환(카드에 '-' 표시)
if(!function_exists('dash_count')){
	function dash_count($conn, $sql){
		try{
			$stmt = $conn->query($sql);
			return (int)$stmt->fetchColumn();
		}catch(Exception $e){
			return null;
		}
	}
}

//카드 key => 집계 SQL (AJAX 엔드포인트가 key로 조회해 개별 실행)
function dash_sql_map(){
	return array(

		//1) 키발급 실패 — 결제완료(step=2)인데 발급 실패(send_status=fail, status=1) → order_ready.php
		'key_fail' =>
			"SELECT COUNT(*) FROM tbl_order a
			 INNER JOIN tbl_order_item b ON a.settle_no=b.settle_no
			 WHERE a.step='2' AND b.send_status='fail' AND b.status='1'",

		//2) 가상계좌 입금대기 — 실제 가상계좌가 발급된 미입금 건만 → order_vbank.php(getOrderVbankReady)와 동일 조건
		//   (step=1 이면서 KCP 가상계좌(SC0040) 또는 PayCo 미입금 vbank 로그가 존재 — 주문서만 작성된 건 제외)
		//   조인 중복 방지 위해 DISTINCT settle_no 로 주문 수 집계
		'vbank' =>
			"SELECT COUNT(DISTINCT a.settle_no) FROM tbl_order a
			 LEFT JOIN kcp_log b ON a.settle_no=b.settle_no AND a.payment_method='SC0040'
			 LEFT JOIN payco_log c ON a.settle_no=c.sellerOrderReferenceKey AND c.paymentCompletionYn='N'
			 WHERE a.step='1' AND (b.settle_no IS NOT NULL OR c.sellerOrderReferenceKey IS NOT NULL)",

		//3) 취소요청 미처리 — order_item status 7/8 → order_cancel_request.php
		'cancel_req' =>
			"SELECT COUNT(*) FROM tbl_order a
			 INNER JOIN tbl_order_item b ON a.settle_no=b.settle_no
			 WHERE (b.status='7' OR b.status='8')",

		//4) 실물 배송대기 — order_shipment_pending.php 와 동일 조건
		'ship_pending' =>
			"SELECT COUNT(*) FROM tbl_order a
			 INNER JOIN tbl_order_item b ON a.settle_no=b.settle_no
			 INNER JOIN tbl_order_shipment c ON a.settle_no=c.settle_no AND b.ordno=c.ordno
			 WHERE a.step='2' AND b.status='2' AND c.shipment_status='2' AND b.delivery_type<>'1'",

		//5) 연동없음 의심 — 코드발송(1·3)인데 order_system 빈값 → order_success.php?order_system=none
		'no_system' =>
			"SELECT COUNT(*) FROM tbl_order_item
			 WHERE status='2' AND (order_system='' OR order_system IS NULL)
			   AND (delivery_type='1' OR delivery_type='3')",

		//======= 이상 감지(데이터 정합성) — 최근 30일 스코프 =======

		//7) 발급완료인데 키기록 없음 — 발송완료 디지털아이템인데 5개 키테이블 어디에도 행이 없음(Vaultn은 clientOrderReference 매칭)
		'no_key' =>
			"SELECT COUNT(*) FROM tbl_order_item i
			 WHERE i.status='2' AND i.send_status='delivered'
			   AND (i.delivery_type='1' OR i.delivery_type='3')
			   AND i.order_system<>'' AND i.order_system IS NOT NULL
			   AND i.order_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
			   AND NOT EXISTS (SELECT 1 FROM tbl_order_item_asset x WHERE x.ordno=i.ordno)
			   AND NOT EXISTS (SELECT 1 FROM tbl_order_item_ztorm x WHERE x.ordno=i.ordno)
			   AND NOT EXISTS (SELECT 1 FROM tbl_order_item_vaultn x WHERE x.clientOrderReference=i.ordno)
			   AND NOT EXISTS (SELECT 1 FROM tbl_order_item_genba x WHERE x.ordno=i.ordno)
			   AND NOT EXISTS (SELECT 1 FROM tbl_order_item_pointnexus x WHERE x.ordno=i.ordno)",

		//8) 결제완료인데 PG로그 없음 — step=2·실결제(총액>0, 전액할인 제외)인데 5개 PG로그 어디에도 없음
		'no_pglog' =>
			"SELECT COUNT(*) FROM tbl_order a
			 WHERE a.step='2' AND a.total_price>0 AND a.payment_method<>'DG0000'
			   AND a.payment_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
			   AND NOT EXISTS (SELECT 1 FROM kcp_log x WHERE x.settle_no=a.settle_no)
			   AND NOT EXISTS (SELECT 1 FROM payco_log x WHERE x.sellerOrderReferenceKey=a.settle_no)
			   AND NOT EXISTS (SELECT 1 FROM toss_log x WHERE x.order_id=a.settle_no)
			   AND NOT EXISTS (SELECT 1 FROM tosspay_log x WHERE x.settle_no=a.settle_no)
			   AND NOT EXISTS (SELECT 1 FROM naverpay_log x WHERE x.merchantPayKey=a.settle_no)",

		//9) 상태 모순 — 미결제(step=1)인데 아이템 발급완료(status=2), 또는 결제완료(step=2)인데 아이템 입금대기(status=3)
		'state_conflict' =>
			"SELECT COUNT(DISTINCT a.settle_no) FROM tbl_order a
			 INNER JOIN tbl_order_item b ON a.settle_no=b.settle_no
			 WHERE b.order_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
			   AND ((a.step='1' AND b.status='2') OR (a.step='2' AND b.status='3'))",

		//12) 중복 결제로그 의심 — 동일 주문에 PG 승인로그 2건 이상(최근 90일)
		//    ※ PayCo는 정상 주문에도 sellerOrderReferenceKey가 같은 고스트 행(paymentCompletionYn IS NULL, orderProducts='null')이 1건 더 들어옴.
		//      → paymentCompletionYn='Y'(실제 결제완료)인 행만 세어 오탐 방지.
		'dup_pay' =>
			"SELECT COUNT(*) FROM (
			   SELECT b.settle_no FROM tbl_order a INNER JOIN kcp_log b ON b.settle_no=a.settle_no WHERE a.payment_date>=DATE_SUB(NOW(),INTERVAL 30 DAY) GROUP BY b.settle_no HAVING COUNT(*)>1
			   UNION SELECT b.sellerOrderReferenceKey FROM tbl_order a INNER JOIN payco_log b ON b.sellerOrderReferenceKey=a.settle_no WHERE a.payment_date>=DATE_SUB(NOW(),INTERVAL 30 DAY) AND b.paymentCompletionYn='Y' GROUP BY b.sellerOrderReferenceKey HAVING COUNT(*)>1
			   UNION SELECT b.order_id FROM tbl_order a INNER JOIN toss_log b ON b.order_id=a.settle_no WHERE a.payment_date>=DATE_SUB(NOW(),INTERVAL 30 DAY) GROUP BY b.order_id HAVING COUNT(*)>1
			   UNION SELECT b.settle_no FROM tbl_order a INNER JOIN tosspay_log b ON b.settle_no=a.settle_no WHERE a.payment_date>=DATE_SUB(NOW(),INTERVAL 30 DAY) GROUP BY b.settle_no HAVING COUNT(*)>1
			   UNION SELECT b.merchantPayKey FROM tbl_order a INNER JOIN naverpay_log b ON b.merchantPayKey=a.settle_no WHERE a.payment_date>=DATE_SUB(NOW(),INTERVAL 30 DAY) GROUP BY b.merchantPayKey HAVING COUNT(*)>1
			 ) t",


		//14) 발송 끼임 의심 — 재발송 선점(processing) 후 완료/원복 안 된 잔류. 정상 processing은 1초 미만이라 잡히면 대부분 끼임(하드킬)
		'send_processing' =>
			"SELECT COUNT(*) FROM tbl_order_item WHERE send_status='processing'",

	);
}

//그룹 집계 — 한 번의 쿼리로 여러 카드 값을 동시에 반환(카드마다 개별 스캔하지 않도록 묶음)
//카운트 엔드포인트가 ?group=... 로 호출 → bucket=>cnt 맵 반환. 결과 없는 bucket은 클라이언트에서 0 처리.
function dash_group_sql(){
	return array(
		//시스템별 발급실패 — key_fail(send_status='fail')과 동일 기준을 order_system(공급사)별로 한 번에 집계
		//  CASE로 공급사 버킷을 만들어 GROUP BY → tbl_order_item 을 1회만 스캔(카드 5개가 스캔 5회 하던 것을 1회로)
		//  order_system 매핑: Asset=1/4/5/6, Ztorm=2/3, Vaultn=8, Genba=9, PointNexus=10
		'fail_breakdown' =>
			"SELECT CASE
			          WHEN b.order_system IN ('1','4','5','6') THEN 'asset'
			          WHEN b.order_system IN ('2','3')          THEN 'ztorm'
			          WHEN b.order_system='8'                   THEN 'vaultn'
			          WHEN b.order_system='9'                   THEN 'genba'
			          WHEN b.order_system='10'                  THEN 'pointnexus'
			        END AS bucket,
			        COUNT(*) AS cnt
			 FROM tbl_order a
			 INNER JOIN tbl_order_item b ON a.settle_no=b.settle_no
			 WHERE a.step='2' AND b.send_status='fail' AND b.status='1'
			   AND b.order_system IN ('1','2','3','4','5','6','8','9','10')
			 GROUP BY bucket",
	);
}

//처리 필요(Action Required) 카드 메타 — 열면 자동 조회
function dash_action_cards($document_root){
	//연동없음 링크는 order_success가 기본 '오늘' 기간으로 필터되므로, 전체기간으로 보도록 날짜범위를 넓게 전달
	$none_link = $document_root."/order/order_success.php?order_system=none&search_start_date=2020-01-01&search_end_date=".date('Y-m-d');

	return array(
		array('key'=>'key_fail',        'label'=>'키발급 실패',       'desc'=>'결제완료인데 키 미발급',       'url'=>$document_root.'/order/order_ready.php'),
		array('key'=>'cancel_req',      'label'=>'취소요청',          'desc'=>'취소요청 상태 대기',          'url'=>$document_root.'/order/order_cancel_request.php'),
		array('key'=>'vbank',           'label'=>'가상계좌 입금대기',  'desc'=>'가상계좌 발급 후 미입금',      'url'=>$document_root.'/order/order_vbank.php'),
		array('key'=>'ship_pending',    'label'=>'실물 배송대기',      'desc'=>'배송 시작 전',                'url'=>$document_root.'/order/order_shipment_pending.php'),
		array('key'=>'no_system',       'label'=>'연동없음 의심',      'desc'=>'코드발송인데 연동시스템 없음',  'url'=>$none_link),
		array('key'=>'send_processing', 'label'=>'재발송 처리중 오류', 'desc'=>'재발송 처리중 잔류(확인필요)', 'url'=>''),
	);
}

//확인 필요 카드 메타 — 가벼운 점검, 열면 자동 조회 (처리필요 다음 섹션)
//  · 시스템별 발급실패 : key_fail(send_status='fail')을 order_system별로 분해 → 어느 공급사가 실패 중인지
//    5개 카드가 group='fail_breakdown' 을 공유 → 한 번의 GROUP BY 쿼리로 5개 값 동시 조회(스캔 1회)
function dash_check_cards($document_root){
	return array(
		array('group'=>'fail_breakdown', 'bucket'=>'asset',      'label'=>'Asset 발급실패',      'desc'=>'키발급 실패(Asset)',      'url'=>''),
		array('group'=>'fail_breakdown', 'bucket'=>'ztorm',      'label'=>'Ztorm 발급실패',      'desc'=>'키발급 실패(Ztorm)',      'url'=>''),
		array('group'=>'fail_breakdown', 'bucket'=>'vaultn',     'label'=>'Vaultn 발급실패',     'desc'=>'키발급 실패(Vaultn)',     'url'=>''),
		array('group'=>'fail_breakdown', 'bucket'=>'genba',      'label'=>'Genba 발급실패',      'desc'=>'키발급 실패(Genba)',      'url'=>''),
		array('group'=>'fail_breakdown', 'bucket'=>'pointnexus', 'label'=>'PointNexus 발급실패', 'desc'=>'키발급 실패(PointNexus)', 'url'=>''),
	);
}

//이상 감지(데이터 정합성) 카드 메타 (url 빈값이면 비링크 카드)
//무겁거나 순수 정합성 점검 항목만 남김 → 대시보드에서 [점검 실행] 버튼 클릭 시에만 조회(온디맨드)
function dash_anomaly_cards($document_root){
	return array(
		array('key'=>'no_key',         'label'=>'발급완료·키없음', 'desc'=>'발송완료인데 키기록 없음', 'url'=>''),
		array('key'=>'no_pglog',       'label'=>'PG로그 없음',     'desc'=>'결제완료인데 PG기록 없음', 'url'=>''),
		array('key'=>'state_conflict', 'label'=>'상태 모순',       'desc'=>'주문↔아이템 상태 불일치',  'url'=>''),
		array('key'=>'dup_pay',        'label'=>'중복결제 의심',   'desc'=>'PG 승인로그 2건+',        'url'=>''),
	);
}
?>
