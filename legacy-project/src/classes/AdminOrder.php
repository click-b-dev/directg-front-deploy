<?
class AdminOrder extends Pagination{
	private $_db;
	
	//클래스 생성자
	public function __construct(PDO $db){
		$this->_db = $db;
	}
	
	//입금대기 리스트
	public function getOrderPaymentReady($page,$add_where,$orderby,$param){
		try{
			$query = "select settle_no,reg_date,is_mobile,m_id,pg_provider,payment_method,use_emoney,use_cash,total_price,step,payment_date,version,ip from tbl_order where step='1' ".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>'20',
				'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*'.$param,  
				'db_handle'  => $this->_db  
			);
			$pagination = new pagination($page, $query, $options);

			return $pagination;

		}catch(paginationException $e){
			echo $e;
			exit();
		}
	}
	
	//가상계좌 입금대기 리스트
	public function getOrderVbankReady($page,$add_where,$orderby,$param){
		try{
			$query = "SELECT a.settle_no as settle_no,reg_date,is_mobile,m_id,pg_provider,payment_method,use_emoney,use_cash,total_price,step,payment_date,version,ip,
			b.idx as kcp_idx,
			b.res_cd,
			b.res_msg,
			b.res_en_msg,
			b.pay_method,
			b.tno,
			b.amount,
			b.card_cd,
			b.card_name,
			b.card_no,
			b.app_no,
			b.app_time,
			b.noinf,
			b.noinf_type,
			b.quota,
			b.card_mny,
			b.coupon_mny,
			b.payco_point_mny,
			b.partcanc_yn,
			b.card_bin_type_01,
			b.card_bin_type_02,
			b.isp_issuer_cd,
			b.isp_issuer_nm,
			b.bank_name,
			b.bank_code,
			b.bk_mny,
			b.depositor,
			b.account,
			b.va_date,
			b.va_name,
			b.cash_authno,
			b.cash_no,
			b.commid,
			b.mobile_no,
			b.van_id,
			b.escw_yn,
			c.* FROM tbl_order a LEFT JOIN kcp_log b ON a.settle_no=b.settle_no AND a.payment_method='SC0040' LEFT JOIN payco_log c ON a.settle_no=c.sellerOrderReferenceKey AND a.payment_method='PAYCO' AND c.paymentCompletionYn='N' WHERE (a.step='1' OR a.step='8') ".$add_where." AND (b.settle_no IS NOT NULL OR c.sellerOrderReferenceKey IS NOT NULL) order by ".$orderby;

			$options = array(
				'results_per_page' =>'20',
				'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*'.$param,  
				'db_handle'  => $this->_db  
			);
			$pagination = new pagination($page, $query, $options);

			return $pagination;

		}catch(paginationException $e){
			echo $e;
			exit();
		}
	}
	
	//주문대기
	public function getOrderReadyList($page,$add_where,$orderby,$param){
		try{
			//결제완료(step='2') + 키발급 실패(send_status='fail') + 미취소(status='1')
			//send_status='fail' = Asset/Vaultn/Genba/PointNexus 및 핸들러 없는 order_system 공통 실패 마커
			//status='1' = 아직 취소(7/8/9) 안 된 건만 — 취소·환불된 실패건은 제외
			$query = "select * from tbl_order a inner join tbl_order_item b on a.settle_no=b.settle_no where a.step='2' and b.send_status='fail' and b.status='1' ".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>'20',
				'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*'.$param,  
				'db_handle'  => $this->_db  
			);
			$pagination = new pagination($page, $query, $options);

			return $pagination;

		}catch(paginationException $e){
			echo $e;
			exit();
		}
	}
	
	//결제완료 리스트
	public function getOrderPaymentApproved($page,$add_where,$orderby,$param){
		try{
			$query = "select settle_no,reg_date,is_mobile,m_id,pg_provider,payment_method,use_emoney,use_cash,total_price,step,payment_date,ip from tbl_order where step='2' ".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>'20',
				'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*'.$param,  
				'db_handle'  => $this->_db  
			);
			$pagination = new pagination($page, $query, $options);

			return $pagination;

		}catch(paginationException $e){
			echo $e;
			exit();
		}
	}
	
	//발송대기
	public function getOrderSendPending($page,$add_where,$orderby,$param){
		try{
			$query = "select * from tbl_order a inner join tbl_order_item b on a.settle_no=b.settle_no where a.step='2' and b.status='2' ".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>'20',
				'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*'.$param,  
				'db_handle'  => $this->_db  
			);
			$pagination = new pagination($page, $query, $options);

			return $pagination;

		}catch(paginationException $e){
			echo $e;
			exit();
		}
	}
	
	//주문통합
	public function getOrderAll($page,$add_where,$orderby,$param){
		try{
			$query = "select b.*,a.step from tbl_order a inner join tbl_order_item b on a.settle_no=b.settle_no where a.m_no>'0' ".$add_where." order by ".$orderby;
			// echo $query;

			$options = array(
				'results_per_page' =>'20',
				'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*'.$param,  
				'db_handle'  => $this->_db  
			);
			$pagination = new pagination($page, $query, $options);

			return $pagination;

		}catch(paginationException $e){
			echo $e;
			exit();
		}
	}
	
	//주문완료
	public function getOrderSuccess($page,$add_where,$orderby,$param){
		try{
			//order_system 추가 — 목록의 '연동없음' 빨강 강조 및 연동시스템 필터 표시용 (tbl_order_item 단일 테이블)
			$query = "select settle_no,ordno,m_id,product_code,product_name,price,status,is_actv,delivery_type,order_date,ip,order_system from tbl_order_item where status='2' ".$add_where." order by ".$orderby;
			//echo $query;

			$options = array(
				'results_per_page' =>'20',
				'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*'.$param,  
				'db_handle'  => $this->_db  
			);
			$pagination = new pagination($page, $query, $options);

			return $pagination;

		}catch(paginationException $e){
			echo $e;
			exit();
		}
	}

	//리셀러(의심) 회원 주문완료 — tbl_member(directgames) 와 m_id JOIN 후 mem_type='R' 만 추출
	//전체회원 200만 중 리셀러 6천 규모라 IN 절(6천건) 대신 크로스 DB JOIN 사용
	public function getResellerOrderList($page,$add_where,$orderby,$param){
		try{
			$query = "select a.settle_no,a.ordno,a.m_id,a.product_code,a.product_name,a.price,a.status,a.is_actv,a.delivery_type,a.order_date,a.ip,a.order_system,b.m_no
						from tbl_order_item a inner join directgames.tbl_member b on a.m_id=b.m_id
						where a.status='2' and b.mem_type='R' ".$add_where." order by ".$orderby;
			//echo $query;

			$options = array(
				'results_per_page' =>'20',
				'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*'.$param,
				'db_handle'  => $this->_db
			);
			$pagination = new pagination($page, $query, $options);

			return $pagination;

		}catch(paginationException $e){
			echo $e;
			exit();
		}
	}

	//주문취소요청
	public function getOrderCancelRequest($page,$add_where,$orderby,$param){
		try{
			$query = "select * from tbl_order a inner join tbl_order_item b on a.settle_no=b.settle_no where (b.status='7' OR b.status='8') ".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>'20',
				'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*'.$param,  
				'db_handle'  => $this->_db  
			);
			$pagination = new pagination($page, $query, $options);

			return $pagination;

		}catch(paginationException $e){
			echo $e;
			exit();
		}
	}
	
	//주문취소완료
	public function getOrderCancelComplete($page,$add_where,$orderby,$param){
		try{
			$query = "select * from tbl_order a inner join tbl_order_item b on a.settle_no=b.settle_no where b.status='9' ".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>'20',
				'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*'.$param,  
				'db_handle'  => $this->_db  
			);
			$pagination = new pagination($page, $query, $options);

			return $pagination;

		}catch(paginationException $e){
			echo $e;
			exit();
		}
	}
	
	//배송주문 통합리스트
	public function getOrderShipmentAll($page,$add_where,$orderby,$param){
		try{
			$query = "select * from tbl_order a inner join tbl_order_item b on a.settle_no=b.settle_no inner join tbl_order_shipment c on a.settle_no=c.settle_no and b.ordno=c.ordno where a.step='2' and b.status='2' and b.delivery_type<>'1' ".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>'20',
				'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*'.$param,  
				'db_handle'  => $this->_db  
			);
			$pagination = new pagination($page, $query, $options);

			return $pagination;

		}catch(paginationException $e){
			echo $e;
			exit();
		}
	}
	
	//배송대기
	public function getOrderShipmentPending($page,$add_where,$orderby,$param){
		try{
			$query = "select * from tbl_order a inner join tbl_order_item b on a.settle_no=b.settle_no inner join tbl_order_shipment c on a.settle_no=c.settle_no and b.ordno=c.ordno where a.step='2' and b.status='2' and c.shipment_status='2' and b.delivery_type<>'1' ".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>'20',
				'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*'.$param,  
				'db_handle'  => $this->_db  
			);
			$pagination = new pagination($page, $query, $options);

			return $pagination;

		}catch(paginationException $e){
			echo $e;
			exit();
		}
	}
	
	//배송준비
	public function getOrderShipmentReady($page,$add_where,$orderby,$param){
		try{
			$query = "select * from tbl_order a inner join tbl_order_item b on a.settle_no=b.settle_no inner join tbl_order_shipment c on a.settle_no=c.settle_no and b.ordno=c.ordno where a.step='2' and b.status='2' and c.shipment_status='3' and b.delivery_type<>'1' ".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>'20',
				'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*'.$param,  
				'db_handle'  => $this->_db  
			);
			$pagination = new pagination($page, $query, $options);

			return $pagination;

		}catch(paginationException $e){
			echo $e;
			exit();
		}
	}
	
	//배송중
	public function getOrderShipmentShipping($page,$add_where,$orderby,$param){
		try{
			$query = "select * from tbl_order a inner join tbl_order_item b on a.settle_no=b.settle_no inner join tbl_order_shipment c on a.settle_no=c.settle_no and b.ordno=c.ordno where a.step='2' and b.status='2' and c.shipment_status='4' and b.delivery_type<>'1' ".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>'20',
				'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*'.$param,  
				'db_handle'  => $this->_db  
			);
			$pagination = new pagination($page, $query, $options);

			return $pagination;

		}catch(paginationException $e){
			echo $e;
			exit();
		}
	}
	
	//배송완료
	public function getOrderShipmentDelivered($page,$add_where,$orderby,$param){
		try{
			$query = "select * from tbl_order a inner join tbl_order_item b on a.settle_no=b.settle_no inner join tbl_order_shipment c on a.settle_no=c.settle_no and b.ordno=c.ordno where a.step='2' and b.status='2' and c.shipment_status='5' and b.delivery_type<>'1' ".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>'20',
				'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*'.$param,  
				'db_handle'  => $this->_db  
			);
			$pagination = new pagination($page, $query, $options);

			return $pagination;

		}catch(paginationException $e){
			echo $e;
			exit();
		}
	}
	
	//구매확정
	public function getOrderShipmentConfirm($page,$add_where,$orderby,$param){
		try{
			$query = "select * from tbl_order a inner join tbl_order_item b on a.settle_no=b.settle_no inner join tbl_order_shipment c on a.settle_no=c.settle_no and b.ordno=c.ordno where a.step='2' and b.status='2' and c.shipment_status='6' and b.delivery_type<>'1' ".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>'20',
				'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*'.$param,  
				'db_handle'  => $this->_db  
			);
			$pagination = new pagination($page, $query, $options);

			return $pagination;

		}catch(paginationException $e){
			echo $e;
			exit();
		}
	}
	
	//미수령 주문
	public function getOrderNotReceived($page,$add_where,$orderby,$param){
		try{
			$query = "select * from tbl_order_item where status='2' and is_actv='0' ".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>'20',
				'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*'.$param,  
				'db_handle'  => $this->_db  
			);
			$pagination = new pagination($page, $query, $options);

			return $pagination;

		}catch(paginationException $e){
			echo $e;
			exit();
		}
	}
	
	//발송실패
	
	//취소요청
	
	//취소완료
	public function getOrderRefund($page,$add_where,$orderby,$param){
		try{
			$query = "select * from tbl_order a inner join tbl_order_item b on a.settle_no=b.settle_no where b.status='9'".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>'20',
				'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*'.$param,  
				'db_handle'  => $this->_db  
			);
			$pagination = new pagination($page, $query, $options);

			return $pagination;

		}catch(paginationException $e){
			echo $e;
			exit();
		}
	}
	//Asset 주문완료
	public function getOrderAssetSuccess($page,$add_where,$orderby,$param){
		try{
			$query = "select * from tbl_order_item_asset where asset_id>'0' ".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>'20',
				'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*'.$param,  
				'db_handle'  => $this->_db  
			);
			$pagination = new pagination($page, $query, $options);

			return $pagination;

		}catch(paginationException $e){
			echo $e;
			exit();
		}
	}
	
	//Asset 주문실패
	
	//Ztorm주문완료
	public function getOrderZtormSuccess($page,$add_where,$orderby,$param){
		try{
			$query = "select * from tbl_order_item_ztorm where ztorm_item_id>0 ".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>'20',
				'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*'.$param,  
				'db_handle'  => $this->_db  
			);
			$pagination = new pagination($page, $query, $options);

			return $pagination;

		}catch(paginationException $e){
			echo $e;
			exit();
		}
	}
	
	//Genba 주문완료
	public function getOrderGenbaSuccess($page,$add_where,$orderby,$param){
		try{
			$query = "select * from tbl_order_item_genba where product_code>0 ".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>'20',
				'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*'.$param,  
				'db_handle'  => $this->_db  
			);
			$pagination = new pagination($page, $query, $options);

			return $pagination;

		}catch(paginationException $e){
			echo $e;
			exit();
		}
	}
	
	//Vaultn 주문완료
	public function getOrderVaultnSuccess($page,$add_where,$orderby,$param){
		try{
			$query = "select * from tbl_order_item_vaultn where product_code>0 ".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>'20',
				'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*'.$param,  
				'db_handle'  => $this->_db  
			);
			$pagination = new pagination($page, $query, $options);

			return $pagination;

		}catch(paginationException $e){
			echo $e;
			exit();
		}
	}

	//주문결제완료 리스트
	public function getOrderList($page,$add_where,$orderby,$param){
		try{
			$query = "select * from tbl_order a inner join tbl_order_item b on a.id=b.order_id where 1=1 ".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>'5',
				'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*'.$param,  
				'db_handle'  => $this->_db  
			);
			$pagination = new pagination($page, $query, $options);

			return $pagination;

		}catch(paginationException $e){
			echo $e;
			exit();
		}
	}
	
	//결제PG
	public function getPGProvider($pg_provider,$payment_method){
		switch($pg_provider){
			case "kcp":
				echo "KCP";
			break;
			case "naverpay":
				echo "네이버페이";
			break;
			case "payco":
				echo "페이코";
			break;
			case "uplus":
				if($payment_method=="DG0000"){
					echo "DGKR";
				}
			break;
			case "DGKR":
				echo "전액할인";
			break;
			case "toss":
				echo "토스";
			break;
			case "toss_pay":
				echo "토스페이";
			break;
		}
	}

	//결제상태
	public function getCheckoutStatus($step){
		switch($step){
			case "1":
				echo "입금대기";
			break;
			case "2":
				echo "결제완료";
			break;
			case "8":
				echo "환불요청";
			break;
			case "9":
				echo "환불완료";
			break;
			case "99":
				echo "취소완료";
			break;
		}
	}

	//주문상태
	public function getOrderStatus($status){
		switch($status){
			case "1":
				echo "주문대기";
			break;
			case "2":
				echo "주문완료";
			break;
			case "3":
				echo "배송준비";
			break;
			case "4":
				echo "배송중";
			break;
			case "5":
				echo "배송완료";
			break;
			case "6":
				echo "구매확정";
			break;
			case "8":
				echo "취소요청";
			break;
			case "9":
				echo "취소완료";
			break;
		}
	}
	
	//배송상태
	public function getShipmentStatus($shipment_status){
		switch($shipment_status){
			case "2":
				echo "배송대기";
			break;
			case "3":
				echo "배송준비";
			break;
			case "4":
				echo "배송중";
			break;
			case "5":
				echo "배송완료";
			break;
			case "6":
				echo "구매확정";
			break;
			case "8":
				echo "취소요청";
			break;
			case "9":
				echo "취소완료";
			break;
		}
	}

	//결제수단
	public function getSettlekindLabel($settlekind){
		switch($settlekind){
			case "SC0010":
				echo "신용카드";
			break;
			case "SC0030":
				echo "계좌이체";
			break;
			case "SC0040":
				echo "가상계좌";
			break;
			case "SC0060":
				echo "휴대폰";
			break;
			case "POINT":
				echo "포인트";
			break;
			case "PAYCO":
				echo "페이코";
			break;
			case "DG0000":
				echo "전액할인";
			break;
			case "samsung":
				echo "삼성페이";
			break;
			case "toss_bank":
				echo "퀵계좌이체";
			break;
			case "toss_pay":
				echo "토스머니";
			break;
		}
	}
	
	//주문상품 배송유형
	public function getDeliveryType($delivery_type){
		switch($delivery_type){
			case "1":
				echo "코드발송";
			break;
			case "2":
				echo "택배발송";
			break;
			case "3":
				echo "코드 + 택배발송";
			break;
		}
	}
	
	//Genba 주문상태
	public function getGenbaState($state){
		switch($state){
			case "0":
				echo "BACK_ORDERED";
			break;
			case "1":
				echo "PRE_ORDERED";
			break;
			case "2":
				echo "DELIVERED";
			break;
			case "3":
			break;
		}
	}
	
	//택배사
	public function getShipmentCompany($delivery_code){
		$company=array();
		switch($delivery_code){
			case "001":
				$company['name']="CJ대한통운";
				$company['code']="CJ";
			break;
			case "002":
				$company['name']="로젠택배";
				$company['code']="LG";
			break;
		}
		return $company;
	}

	//주문정보
	public function getOrderInfo($settle_no, $search_year = 0){
		if ($search_year) {
			$query = "select * from tbl_order_{$search_year} where settle_no=:settle_no";
		} else {
			$query = "select * from tbl_order where settle_no=:settle_no";
		}
		
		$stmt = $this->_db->prepare($query);
		$params = array(
			':settle_no'=>$settle_no
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}
	
	//배송지정보
	public function getOrderAddress($settle_no){
		$query = "select * from tbl_order_address where settle_no=:settle_no";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':settle_no'=>$settle_no
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}

	//주문상세정보
	public function getOrderItem($settle_no, $search_year = 0){
		if ($search_year) {
			$query = "select * from tbl_order_item_{$search_year} where settle_no=:settle_no order by ordno asc";
		} else {
			$query = "select * from tbl_order_item where settle_no=:settle_no order by ordno asc";
		}
		
		$stmt = $this->_db->prepare($query);
		$params = array(
			':settle_no'=>$settle_no
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}
	
	//배송로그
	public function getOrderItemDelivery($ordno){
		$query = "select * from tbl_order_shipment where ordno=:ordno";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':ordno'=>$ordno
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	//배송상품주문취소
	public function updateOrderItemDelivery($ordno, $status){
		$query = "UPDATE tbl_order_shipment SET shipment_status=:status WHERE ordno=:ordno";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':status'=>$status,
			':ordno'=>$ordno
		);
		$stmt->execute($params);
	}

	//게임코드 발송현황(Asset)
	public function getOrderItemAsset($ordno){
		$query = "select * from tbl_order_item_asset where ordno=:ordno order by ordno asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':ordno'=>$ordno
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}
	
	//게임코드 발송현황(Ztorm)
	public function getOrderItemZtorm($ordno){
		$query = "select * from tbl_order_item_ztorm where ordno=:ordno order by ordno asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':ordno'=>$ordno
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}
	
	//게임코드 발송현황(Genba)
	public function getOrderItemGenba($ordno){
		$query = "select * from tbl_order_item_genba where ordno=:ordno order by ordno asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':ordno'=>$ordno
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}
	
	//게임코드 발송현황(Vaultn)
	public function getOrderItemVaultn($ordno){
		$query = "select * from tbl_order_item_vaultn where clientOrderReference=:clientOrderReference order by clientOrderReference asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':clientOrderReference'=>$ordno
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	//게임코드 발송현황(PointNexus) — 시계열 전체 (order_view 표시용)
	//append-only 로그라 한 ordno에 sell/book/confirm/cancel 등 여러 row 누적
	public function getOrderItemPointNexus($ordno){
		$query = "select * from tbl_order_item_pointnexus where ordno=:ordno order by idx asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':ordno'=>$ordno
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	//게임코드 발송현황(PointNexus) — (ordno, productID)별 최신 row만 (환불 처리용)
	//환불 시 같은 productID의 가장 마지막 상태(book/sold/confirmed/...)를 기준으로 cancel API 분기
	public function getActiveOrderItemPointNexus($ordno){
		$query = "SELECT a.* FROM tbl_order_item_pointnexus a
		          INNER JOIN (
		              SELECT productID, MAX(idx) AS max_idx
		              FROM tbl_order_item_pointnexus
		              WHERE ordno=:ordno
		              GROUP BY productID
		          ) b ON b.productID = a.productID AND b.max_idx = a.idx
		          WHERE a.ordno=:ordno
		          ORDER BY a.idx ASC";
		$stmt = $this->_db->prepare($query);
		$stmt->execute(array(':ordno'=>$ordno));
		return $stmt->fetchAll();
	}

	//실물상품 모델정보
	public function getOrderItemModelInfo($product_code){
		$query = "select model_code,model_name from tbl_goods_item where product_code=:product_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}

	public function getOrderKcpLog($settle_no){
		$query = "select * from kcp_log where settle_no=:settle_no order by idx asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':settle_no'=>$settle_no
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}

	public function getOrderTossAdapterLog($settle_no){
		$query = "select * from toss_adapter_log where settle_no=:settle_no order by idx asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':settle_no'=>$settle_no
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}

	public function getOrderTossLog($settle_no){
		$query = "select * from toss_log where order_id=:settle_no order by idx asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':settle_no'=>$settle_no
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}

	public function getOrderTosspayLog($settle_no){
		$query = "select * from tosspay_log where settle_no=:settle_no order by idx asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':settle_no'=>$settle_no
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}

	public function getOrderNaverPayLog2($settle_no){
		$query = "select * from naverpay_log where merchantPayKey=:merchantPayKey order by idx asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':merchantPayKey'=>$settle_no
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}
	//페이코 결제 로그
	public function getOrderPaycoLog($settle_no){
		$query = "select * from payco_log where sellerOrderReferenceKey=:sellerOrderReferenceKey order by idx asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':sellerOrderReferenceKey'=>$settle_no
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}

	//PayCo 취소 이력 (payco_log_cancel) — 회차별 취소 응답 로그 (전액/연속 부분취소)
	public function getPaycoCancelLog($settle_no){
		$query = "select code,message,result,reg_date from payco_log_cancel where sellerOrderReferenceKey=:settle_no order by reg_date asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':settle_no'=>$settle_no
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	public function getOrderLog($settle_no){
		$query = "SELECT * FROM tbl_order_log WHERE settle_no=:settle_no ORDER BY idx asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':settle_no'=>$settle_no
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	public function setOrderLog($settle_no, $ordno, $message){
		$query = "INSERT INTO tbl_order_log SET settle_no=:settle_no,ordno=:ordno,memo=:memo,admin_id=:admin_id,reg_date=NOW()";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':settle_no'=>$settle_no,
			':ordno'=>$ordno,
			':memo'=>$message,
			':admin_id'=>$_SESSION['admin']['admin_id']
		);
		$stmt->execute($params);
	}

	public function cancelOrder($settle_no,$step){
		$query = "UPDATE tbl_order SET step=:step,cancel_date=NOW() WHERE settle_no=:settle_no";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':step'=>$step,
			':settle_no'=>$settle_no
		);
		$stmt->execute($params);
	}

	public function cancelOrderItem($ordno,$status){
		$query = "UPDATE tbl_order_item SET status=:status,cancel_date=NOW() WHERE ordno=:ordno";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':status'=>$status,
			':ordno'=>$ordno
		);
		$stmt->execute($params);
	}

	public function cancelOrderItemGenba($id,$status){
		$query = "UPDATE tbl_order_item_genba SET State=:status WHERE ID=:id";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':id'=>$id,
			':status'=>$status
		);
		$stmt->execute($params);
	}

	public function cancelOrderItemVaultn($orderid,$status){
		$query = "UPDATE tbl_order_item_vaultn SET status=:status,update_date=NOW() WHERE orderId=:orderId";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':status'=>$status,
			':orderId'=>$orderid
		);
		$stmt->execute($params);
	}

	public function getNaverpayCorpName($corp, $code){
		$name="";
		$card_corp_name=array(
			'C0'=>'신한',
			'C1'=>'비씨',
			'C3'=>'KB국민',
			'C4'=>'NH농협',
			'C5'=>'롯데',
			'C7'=>'삼성',
			'C9'=>'씨티',
			'CB'=>'우리',
			'CF'=>'하나',
			'CH'=>'현대'
		);
		$naverpay_bank_corp_name=array(
			'002'=>'산업은행',
			'003'=>'기업은행',
			'004'=>'국민은행',
			'005'=>'외환은행',
			'007'=>'수협',
			'011'=>'농협',
			'012'=>'지역농·축협',
			'020'=>'우리은행',
			'023'=>'SC제일은행',
			'027'=>'씨티은행',
			'031'=>'iM뱅크',
			'032'=>'부산은행',
			'034'=>'광주은행',
			'035'=>'제주은행',
			'037'=>'전북은행',
			'039'=>'경남은행',
			'045'=>'새마을금고',
			'048'=>'신협',
			'050'=>'저축은행',
			'071'=>'우체국',
			'081'=>'하나은행',
			'088'=>'신한은행',
			'089'=>'케이뱅크',
			'090'=>'카카오뱅크',
			'092'=>'토스뱅크',
			'102'=>'대신저축은행',
			'103'=>'에스비아이저축은행',
			'104'=>'에이치케이저축은행',
			'105'=>'웰컴저축은행',
			'106'=>'신한저축은행',
			'209'=>'유안타증권',
			'218'=>'KB증권',
			'221'=>'상상인증권',
			'222'=>'한양증권',
			'223'=>'리딩투자증권',
			'224'=>'BNK투자증권',
			'225'=>'IBK투자증권',
			'227'=>'다올투자증권',
			'238'=>'미래에셋',
			'240'=>'삼성증권',
			'243'=>'한국투자증권',
			'247'=>'NH투자증권',
			'261'=>'교보증권',
			'262'=>'하이투자증권',
			'263'=>'현대차증권',
			'264'=>'키움증권',
			'265'=>'이베스트투자증권',
			'266'=>'SK증권',
			'267'=>'대신증권',
			'269'=>'한화증권',
			'270'=>'하나금융투자',
			'278'=>'신한금융투자',
			'279'=>'DB금융투자',
			'280'=>'유진투자증권',
			'287'=>'메리츠증권',
			'288'=>'카카오페이증권',
			'290'=>'부국증권',
			'291'=>'신영증권',
			'292'=>'케이프투자증권',
			'293'=>'한국증권금융',
			'294'=>'우리투자증권(구포스)',
			'295'=>'우리투자증권'
		);

		if($corp=="card"){
			$name = $card_corp_name[$code];
		} else if($corp=="bank"){
			$name = $naverpay_bank_corp_name[$code];
		}
		return $name;
	}

	public function getTossCorpName($corp, $code){
		$name="";
		$card_corp_name=array(
			'3K'=>'기업 BC',
			'46'=>'광주은행',
			'71'=>'롯데카드',
			'30'=>'한국산업은행',
			'31'=>'BC카드',
			'51'=>'삼성카드',
			'38'=>'새마을금고',
			'41'=>'신한카드',
			'62'=>'신협',
			'36'=>'씨티카드',
			'33'=>'우리BC카드(BC 매입)',
			'W1'=>'우리카드(우리 매입)',
			'37'=>'우체국예금보험',
			'39'=>'저축은행중앙회',
			'35'=>'전북은행',
			'42'=>'제주은행',
			'15'=>'카카오뱅크',
			'3A'=>'케이뱅크',
			'24'=>'토스뱅크',
			'21'=>'하나카드',
			'61'=>'현대카드',
			'11'=>'KB국민카드',
			'91'=>'NH농협카드',
			'34'=>'Sh수협은행',
			'6D'=>'다이너스 클럽',
			'4M'=>'마스터카드',
			'3C'=>'유니온페이',
			'7A'=>'아메리칸 익스프레스',
			'4J'=>'JCB',
			'4V'=>'VISA'
		);
		$bank_corp_name=array(
			'39'=>'경남은행',
			'34'=>'광주은행',
			'12'=>'단위농협(지역농축협)',
			'32'=>'부산은행',
			'45'=>'새마을금고',
			'64'=>'산림조합',
			'88'=>'신한은행',
			'48'=>'신협',
			'27'=>'씨티은행',
			'20'=>'우리은행',
			'71'=>'우체국예금보험',
			'50'=>'저축은행중앙회',
			'37'=>'전북은행',
			'35'=>'제주은행',
			'90'=>'카카오뱅크',
			'89'=>'케이뱅크',
			'92'=>'토스뱅크',
			'81'=>'하나은행',
			'54'=>'홍콩상하이은행',
			'60'=>'Bank of America',
			'3'=>'IBK기업은행',
			'6'=>'KB국민은행',
			'31'=>'iM뱅크(대구)',
			'2'=>'한국산업은행',
			'11'=>'NH농협은행',
			'23'=>'SC제일은행',
			'7'=>'Sh수협은행',
			'30'=>'수협중앙회',
			'S8'=>'교보증권',
			'SE'=>'대신증권',
			'SK'=>'메리츠증권',
			'S5'=>'미래에셋증권',
			'SM'=>'부국증권',
			'S3'=>'삼성증권',
			'SN'=>'신영증권',
			'S2'=>'신한금융투자',
			'S0'=>'유안타증권',
			'SJ'=>'유진투자증권',
			'SQ'=>'카카오페이증권',
			'SB'=>'키움증권',
			'ST'=>'토스증권',
			'SR'=>'펀드온라인코리아(한국포스증권)',
			'SH'=>'하나금융투자',
			'S9'=>'아이엠증권',
			'S6'=>'한국투자증권',
			'SG'=>'한화투자증권',
			'SA'=>'현대차증권',
			'SI'=>'DB금융투자',
			'S4'=>'KB증권',
			'SP'=>'KTB투자증권(다올투자증권)',
			'SO'=>'LIG투자증권',
			'SL'=>'NH투자증권',
			'SD'=>'SK증권'
		);

		if($corp=="card"){
			$name = $card_corp_name[$code];
		} else if($corp=="bank"){
			$name = $bank_corp_name[$code];
		}
		
		return $name;
	}

	public function getTosspayCorpName($corp, $code){
		$name="";
		$card_corp_name=array(
			'1'=>'신한',
			'2'=>'현대',
			'3'=>'삼성',
			'4'=>'국민',
			'5'=>'롯데',
			'6'=>'하나',
			'7'=>'우리',
			'8'=>'농협',
			'9'=>'씨티(미지원)',
			'10'=>'비씨(BC)'
		);
		$bank_corp_name=array(
			'002'=>'KDB산업은행',
			'003'=>'IBK기업은행',
			'004'=>'KB국민은행',
			'005'=>'KEB하나은행',
			'007'=>'수협은행',
			'011'=>'NH농협은행',
			'020'=>'우리은행',
			'023'=>'SC은행',
			'027'=>'씨티은행',
			'031'=>'대구은행',
			'032'=>'부산은행',
			'034'=>'광주은행',
			'035'=>'제주은행',
			'037'=>'전북은행',
			'039'=>'경남은행',
			'045'=>'MG새마을금고',
			'048'=>'신협',
			'050'=>'저축은행',
			'064'=>'산림조합',
			'071'=>'우체국',
			'081'=>'하나은행',
			'088'=>'신한은행',
			'089'=>'케이뱅크',
			'090'=>'카카오뱅크',
			'092'=>'토스뱅크',
			'103'=>'SBI저축은행',
			'218'=>'KB증권',
			'230'=>'미래에셋증권',
			'238'=>'미래에셋증권',
			'240'=>'삼성증권',
			'243'=>'한국투자증권',
			'247'=>'NH투자증권',
			'261'=>'교보증권',
			'262'=>'하이투자증권',
			'263'=>'현대차투자증권',
			'264'=>'키움증권',
			'265'=>'이베스트증권',
			'266'=>'SK증권',
			'267'=>'대신증권',
			'269'=>'한화투자증권',
			'270'=>'하나증권',
			'271'=>'토스증권',
			'278'=>'신한투자증권',
			'279'=>'DB금융투자',
			'280'=>'유진투자',
			'287'=>'메리츠증권',
			'888'=>'토스머니',
			'889'=>'토스포인트'
		);

		if($corp=="card"){
			$name = $card_corp_name[$code];
		} else if($corp=="bank"){
			$name = $bank_corp_name[$code];
		}
		
		return $name;
	}


	//지정된 옵션상품 기간내 판매현황
	public function getEventGoodsOrderCount($product_code,$start_date,$end_date){
		$query = "select product_code,count(*)as order_count,sum(price)as order_price from tbl_order_item where product_code=:product_code and status='2' and order_date>=:start_date and order_date<:end_date group by product_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code,
			':start_date'=>$start_date,
			':end_date'=>$end_date
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}
	
	//이벤트 기간내 네이버페이 즉시할인 결제건 통계
	public function getEventNaverpayCount($start_date,$end_date){
		$query = "select count(*)as event_count,sum(b.discountPayAmount)as event_discount,sum(b.totalPayAmount)as total_amount from tbl_order a inner join naverpay_log b on a.settle_no=b.merchantPayKey where a.step='2' and a.payment_date>=:start_date and a.payment_date<:end_date and b.discountPayAmount>'0';";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':start_date'=>$start_date,
			':end_date'=>$end_date
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}
	
	//이벤트 기간내 퀵계좌이체 즉시할인 결제건 통계
	public function getEventTossCount($start_date,$end_date){
		$query = "select b.coupon_mny,count(*)as event_count,sum(b.coupon_mny)as event_discount,sum(b.amount)as total_amount from tbl_order a inner join toss_adapter_log b on a.settle_no=b.settle_no where a.step='2' and a.payment_date>=:start_date and a.payment_date<:end_date and b.coupon_mny>'0' group by b.coupon_mny";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':start_date'=>$start_date,
			':end_date'=>$end_date
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}
	
	//이벤트 기간내 토스페이 즉시할인 결제건 통계
	public function getEventTossPayCount($start_date,$end_date){
		$query = "select b.discountedAmount,count(*)as event_count,sum(b.discountedAmount)as event_discount,sum(b.amount)as total_amount from tbl_order a inner join tosspay_log b on a.settle_no=b.settle_no where a.step='2' and a.payment_date>=:start_date and a.payment_date<:end_date and b.discountedAmount>'0' group by b.discountedAmount";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':start_date'=>$start_date,
			':end_date'=>$end_date
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	//실물상품별 주문현황
	
	//주문 ip 국가코드 확인
	public function getCountry($ip){
		$reader = new GeoIp2\Database\Reader($_SERVER["DOCUMENT_ROOT"].'/../geoip2/GeoLite2-City.mmdb');
		$record = $reader->city($ip);
		$country = $record->country->isoCode;
		return $country;
	}

    // 주문과거리스트
    public function getOrderOldList($page, $add_where, $orderby, $param, $year){
        try {
            $sql = "SELECT 
                        a.settle_no, a.ord_ymd, a.step, a.email, a.regdt, a.cdt, a.settlekind,
                        b.ordno, b.status, b.product_code, b.product_nm, b.zt_ord_no, b.zt_item_id,
                        b.is_lic_actv, b.tot_pay, b.supp_cd, a.pg_provider, c.imp_uid, a.mobilepay
	                FROM `tbl_order_{$year}` a 
                        INNER JOIN `tbl_order_item_{$year}` b ON a.id = b.order_id 
	                    LEFT JOIN `tbl_kcp_log` c ON a.settle_no = c.merchant_uid
	                WHERE a.m_no > '0' {$add_where}
	                ORDER BY {$orderby}";

            $options = array(
                'results_per_page' =>'20',
                'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*'.$param,
                'db_handle'  => $this->_db
            );

            $pagination = new pagination($page, $sql, $options);

            return $pagination;
        } catch (paginationException $e) {
            echo $e;
            exit();
        }
    }

    // 주문과거상세
    public function getOrderOldView($page, $add_where, $orderby, $param, $year){
        try {
            $sql = "SELECT 
                        a.settle_no, a.ord_ymd, a.step, a.email, a.regdt, a.cdt, a.settlekind,
                        b.ordno, b.status, b.product_code, b.product_nm, b.zt_ord_no, b.zt_item_id,
                        b.is_lic_actv, b.tot_pay, b.supp_cd, a.pg_provider, c.imp_uid, a.mobilepay
	                FROM `tbl_order_{$year}` a 
                        INNER JOIN `tbl_order_item_{$year}` b ON a.id = b.order_id 
	                    LEFT JOIN `tbl_kcp_log` c ON a.settle_no = c.merchant_uid
	                WHERE a.m_no > '0' {$add_where}
	                ORDER BY {$orderby}";

            $options = array(
                'results_per_page' =>'20',
                'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*'.$param,
                'db_handle'  => $this->_db
            );

            $pagination = new pagination($page, $sql, $options);

            return $pagination;
        } catch (paginationException $e) {
            echo $e;
            exit();
        }
    }
	
	//클래스 소멸자
	public function __destruct() {
		$this->_db=null;
	}
}
?>