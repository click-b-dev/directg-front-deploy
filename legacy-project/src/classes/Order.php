<?
class Order{
	private $_db;
	private $promotion;
	
	//클래스 생성자
	public function __construct(PDO $conn){
		$this->_db = $conn;
		$this->promotion = new Promotion($conn);
	}
	
	public function getSettleNo(){
		$milliseconds = round(microtime(true) * 1000);
		$settle_no = $milliseconds;

		return $settle_no;
	}
	
	//1. 장바구니 추가 (Add to Cart)
	public function addCart($request_params){
		$is_chk = $this->addCartGoodsChk($request_params['m_no'],$request_params['goods_sku']);
		if($is_chk){
			$query = "insert into tbl_cart set m_no=:m_no,goods_sku=:goods_sku,product_code=:product_code,product_type=:product_type,reg_date=now()";
			$stmt = $this->_db->prepare($query);
			$params = array(
				':m_no'=>$request_params['m_no'],
				':goods_sku'=>$request_params['goods_sku'],
				':product_code'=>$request_params['product_code'],
				':product_type'=>$request_params['product_type']
			);
			$stmt->execute($params);
			
			return "success";
		}else{
			return "fail";
		}
	}
	
	//장바구니 상품담기 확인
	public function addCartGoodsChk($m_no,$goods_sku){
		$query = "select count(*)as cc from tbl_cart where m_no=:m_no and goods_sku=:goods_sku";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':m_no'=>$m_no,
			':goods_sku'=>$goods_sku,
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		
		if($data['cc']=="0"){
			return true;
		}else{
			return false;
		}
	}
	
	//계정당 구매수량 체크
	public function memberPurchaseLimitChk($m_id,$product_code,$product_name){
		try{
			$purchase_limit = $this->goodsPurchaseLimit($product_code);
			$query = "select count(*) from tbl_order_item where (status='2' or status='3') and m_id=:m_id and product_code=:product_code";
			$stmt = $this->_db->prepare($query);
			$params = array(
				':m_id'=>$m_id,
				':product_code'=>$product_code,
			);
			$stmt->execute($params);
			$data = $stmt->fetch();

			$order_count = (int)$data['0']+1;

			if($purchase_limit<$order_count){
				$result = array(
					"is_order"=>"fail",
					"msg"=>$product_name."는 구매수량제한 초과입니다.",
				);
				return $result;
			}else{
				$result = array(
					"is_order"=>"success",
					"msg"=>"OK",
				);
				return $result;
			}
		}catch(Exception $e){
			$is_order = "0";
			return $e->getMessage();
			exit;
		}

		return $is_order;
	}
	
	//구매제한상품수량
	public function goodsPurchaseLimit($product_code){
		$query = "select purchase_limit_yn,purchase_limit from tbl_goods_item where product_code=:product_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code,
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		
		if($data['purchase_limit_yn']=="Y"){	//구매제한있음.
			$purchase_limit = $data['purchase_limit'];
		}else{ //구매제한없음.
			$purchase_limit = 9999;
		}
		return $purchase_limit;
	}
	
	// 위시리스트 추가
	public function addWishList($request_params){
		$is_chk = $this->addWishListGoodsChk($request_params['m_no'],$request_params['goods_sku']);
		if($is_chk){
			$query = "insert into tbl_wishlist set m_no=:m_no,goods_sku=:goods_sku,product_code=:product_code,product_name=:product_name,reg_date=now()";
			$stmt = $this->_db->prepare($query);
			$params = array(
				':m_no'=>$request_params['m_no'],
				':goods_sku'=>$request_params['goods_sku'],
				':product_code'=>$request_params['product_code'],
				':product_name'=>$request_params['product_name']
			);
			$stmt->execute($params);
			
			return "success";
		}else{
			return "fail";
		}
	}
	
	//위시리스트 상품담기 확인
	public function addWishListGoodsChk($m_no,$goods_sku){
		$query = "select count(*)as cc from tbl_wishlist where m_no=:m_no and goods_sku=:goods_sku";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':m_no'=>$m_no,
			':goods_sku'=>$goods_sku,
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		
		if($data['cc']=="0"){
			return true;
		}else{
			return false;
		}
	}
	
	//장바구니 아이템 선택
	public function setCartItemSelect($request_params){
		$query = "update tbl_cart set selected='1',price=:price where m_no=:m_no and goods_sku=:goods_sku";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':m_no'=>$request_params['m_no'],
			':goods_sku'=>$request_params['goods_sku'],
			':price'=>$request_params['price'],
		);
		$stmt->execute($params);
	}
	//장바구니 아이템 선택해제
	public function setCartItemDeselect($request_params){
		$query = "update tbl_cart set selected='0',price=:price where m_no=:m_no and goods_sku=:goods_sku";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':m_no'=>$request_params['m_no'],
			':goods_sku'=>$request_params['goods_sku'],
			':price'=>$request_params['price'],
		);
		$stmt->execute($params);
	}
	
	//2. 장바구니 조회 (View Cart)
	public function getCartList($m_no){
		$goods_info = array();
		$cart_list = array();

		$query = "select a.m_no,a.goods_sku,b.product_code,b.product_name,b.consumer_price,b.price,b.discount,b.product_platform,b.status,b.option_type,b.display_type,b.game_type,b.spoken_korean,b.interface_korean,b.exclusive_korean,b.is_bonus,a.product_type,a.selected,b.delivery_type,b.is_preorder,b.domain from tbl_cart a inner join tbl_goods_item b on a.product_code=b.product_code where a.m_no=:m_no and b.soldout='N'";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':m_no'=>$m_no
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		
		$promotion_data = array();

		foreach($data as $key=>$value){
			$promotion_data =$this->promotion->getPromotionGoodsPrice($value['product_code']);
			if($value['option_type']=="retail"){ //실물 상품
				$goods_info[] = array(
					"product_code"=>$value['product_code'],
					"goods_sku"=>$value['goods_sku'],
					"product_name"=>$value['product_name'],
					"product_platform"=>$value['product_platform'],
					"product_type"=>$value['product_type'],
					"game_type"=>"",
					"display_type"=>"",
					"spoken_korean"=>"",
					"interface_korean"=>"",
					"exclusive_korean"=>"",
					"is_bonus"=>"",
					"status"=>$value['status'],
					"discount"=>$value['discount'],
					"consumer_price"=>$value['consumer_price'],
					"price"=>$value['price'],
					"selected"=>$value['selected'],
					"delivery_type"=>$value['delivery_type'],
					"is_preorder"=>$value['is_preorder'],
					"domain"=>$value['domain'],
					"promotion"=>$promotion_data
				);
			}else{// 디지털 상품
				$goods_info[] = array(
					"product_code"=>$value['product_code'],
					"goods_sku"=>$value['goods_sku'],
					"product_name"=>$value['product_name'],
					"product_platform"=>$value['product_platform'],
					"product_type"=>$value['product_type'],
					"game_type"=>$value['game_type'],
					"display_type"=>$value['display_type'],
					"spoken_korean"=>$value['spoken_korean'],
					"interface_korean"=>$value['interface_korean'],
					"exclusive_korean"=>$value['exclusive_korean'],
					"is_bonus"=>$value['is_bonus'],
					"status"=>$value['status'],
					"discount"=>$value['discount'],
					"consumer_price"=>$value['consumer_price'],
					"price"=>$value['price'],
					"selected"=>$value['selected'],
					"delivery_type"=>$value['delivery_type'],
					"is_preorder"=>$value['is_preorder'],
					"domain"=>$value['domain'],
					"promotion"=>$promotion_data
				);
			}
		}
		$cart_list = $goods_info;

		return $cart_list;
	}
	

	//2. 장바구니 조회 (View Cart)
	public function getCartList2($m_no){
		$goods_info = array();
		$cart_list = array();

		$query = "select a.m_no,a.goods_sku,b.product_code,b.product_name,b.consumer_price,b.price,b.discount,b.product_platform,b.status,b.option_type,b.display_type,b.game_type,b.spoken_korean,b.interface_korean,b.exclusive_korean,b.is_bonus,a.product_type,a.selected,b.delivery_type,b.is_preorder,b.domain from tbl_cart a inner join tbl_goods_item b on a.product_code=b.product_code where a.m_no=:m_no";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':m_no'=>$m_no
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		
		$promotion_data = array();

		foreach($data as $key=>$value){
			$promotion_data =$this->promotion->getPromotionGoodsPrice($value['product_code']);
			if($value['option_type']=="retail"){ //실물 상품
				$goods_info[] = array(
					"product_code"=>$value['product_code'],
					"goods_sku"=>$value['goods_sku'],
					"product_name"=>$value['product_name'],
					"product_platform"=>$value['product_platform'],
					"product_type"=>$value['product_type'],
					"game_type"=>"",
					"display_type"=>"",
					"spoken_korean"=>"",
					"interface_korean"=>"",
					"exclusive_korean"=>"",
					"is_bonus"=>"",
					"status"=>$value['status'],
					"discount"=>$value['discount'],
					"consumer_price"=>$value['consumer_price'],
					"price"=>$value['price'],
					"selected"=>$value['selected'],
					"delivery_type"=>$value['delivery_type'],
					"is_preorder"=>$value['is_preorder'],
					"domain"=>$value['domain'],
					"promotion"=>$promotion_data
				);
			}else{// 디지털 상품
				$goods_info[] = array(
					"product_code"=>$value['product_code'],
					"goods_sku"=>$value['goods_sku'],
					"product_name"=>$value['product_name'],
					"product_platform"=>$value['product_platform'],
					"product_type"=>$value['product_type'],
					"game_type"=>$value['game_type'],
					"display_type"=>$value['display_type'],
					"spoken_korean"=>$value['spoken_korean'],
					"interface_korean"=>$value['interface_korean'],
					"exclusive_korean"=>$value['exclusive_korean'],
					"is_bonus"=>$value['is_bonus'],
					"status"=>$value['status'],
					"discount"=>$value['discount'],
					"consumer_price"=>$value['consumer_price'],
					"price"=>$value['price'],
					"selected"=>$value['selected'],
					"delivery_type"=>$value['delivery_type'],
					"is_preorder"=>$value['is_preorder'],
					"domain"=>$value['domain'],
					"promotion"=>$promotion_data
				);
			}
		}
		$cart_list = $goods_info;

		return $cart_list;
	}
	


	//선택된 장바구니 목록
	public function getCartItemList($m_no){
		$goods_info = array();
		$cart_list = array();

		$query = "select a.m_no,a.goods_sku,a.product_type,b.product_code,b.product_name,b.consumer_price,b.price,b.discount,b.product_platform,b.status,b.option_type,b.display_type,b.game_type,b.spoken_korean,b.interface_korean,b.exclusive_korean,b.is_bonus,b.delivery_type,b.product_srp,b.product_ppr,b.supplier_code,b.is_preorder,b.model_code,b.model_name,b.is_repay from tbl_cart a inner join tbl_goods_item b on a.product_code=b.product_code where a.m_no=:m_no and a.selected='1' and b.soldout='N'";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':m_no'=>$m_no,
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		
		$promotion_data = array();

		foreach($data as $key=>$value){
			$promotion_data =$this->promotion->getPromotionGoodsPrice($value['product_code']);
			if($value['option_type']=="retail"){
				$goods_info[] = array(
					"product_code"=>$value['product_code'],
					"goods_sku"=>$value['goods_sku'],
					"product_name"=>$value['product_name'],
					"product_platform"=>$value['product_platform'],
					"option_type"=>$value['option_type'],
					"game_type"=>$value['game_type'],
					"display_type"=>$value['display_type'],
					"spoken_korean"=>$value['spoken_korean'],
					"interface_korean"=>$value['interface_korean'],
					"exclusive_korean"=>$value['exclusive_korean'],
					"is_bonus"=>$value['is_bonus'],
					"status"=>$value['status'],
					"discount"=>$value['discount'],
					"consumer_price"=>$value['consumer_price'],
					"price"=>$value['price'],
					"product_srp"=>$value['product_srp'],
					"product_ppr"=>$value['product_ppr'],
					"product_ppr"=>$value['product_ppr'],
					"publisher_code"=>$value['supplier_code'],
					"product_type"=>$value['product_type'],
					"delivery_type"=>$value['delivery_type'],
					"is_preorder"=>$value['is_preorder'],
					"model_code"=>$value['model_code'],
					"model_name"=>$value['model_name'],
					"is_repay"=>$value['is_repay'],
					"promotion"=>$promotion_data
				);
				//
			}else{
				$goods_info[] = array(
					"product_code"=>$value['product_code'],
					"goods_sku"=>$value['goods_sku'],
					"product_name"=>$value['product_name'],
					"product_platform"=>$value['product_platform'],
					"option_type"=>$value['option_type'],
					"game_type"=>$value['game_type'],
					"display_type"=>$value['display_type'],
					"spoken_korean"=>$value['spoken_korean'],
					"interface_korean"=>$value['interface_korean'],
					"exclusive_korean"=>$value['exclusive_korean'],
					"is_bonus"=>$value['is_bonus'],
					"status"=>$value['status'],
					"discount"=>$value['discount'],
					"consumer_price"=>$value['consumer_price'],
					"price"=>$value['price'],
					"product_srp"=>$value['product_srp'],
					"product_ppr"=>$value['product_ppr'],
					"publisher_code"=>$value['supplier_code'],
					"delivery_type"=>$value['delivery_type'],
					"product_type"=>$value['product_type'],
					"is_preorder"=>$value['is_preorder'],
					"model_code"=>$value['model_code'],
					"model_name"=>$value['model_name'],
					"is_repay"=>$value['is_repay'],
					"promotion"=>$promotion_data
				);
			}
		}

		$cart_list = $goods_info;

		return $cart_list;
	}
	
	//$include_soldout: true면 품절(soldout='Y') 상품도 포함, false(기본)면 제외
	public function getOrderItemList($m_no, $include_soldout = false){
		$goods_info = array();
		$cart_list = array();

		$soldout_filter = $include_soldout ? "" : " and b.soldout='N'";
		$query = "select a.m_no,a.goods_sku,a.product_type,b.product_code,b.product_name,b.consumer_price,b.price,b.discount,b.product_platform,b.status,b.option_type,b.display_type,b.game_type,b.spoken_korean,b.interface_korean,b.exclusive_korean,b.is_bonus,b.delivery_type,b.product_srp,b.product_ppr,b.supplier_code,b.is_preorder,b.is_repay from tbl_cart a inner join tbl_goods_item b on a.product_code=b.product_code where a.m_no=:m_no and a.selected='1'" . $soldout_filter;
		$stmt = $this->_db->prepare($query);
		$params = array(
			':m_no'=>$m_no,
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		
		$promotion_data = array();

		foreach($data as $key=>$value){
			$promotion_data =$this->promotion->getPromotionGoodsPrice($value['product_code']);
			if($value['option_type']=="retail"){
				$goods_info[] = array(
					"product_code"=>$value['product_code'],
					"goods_sku"=>$value['goods_sku'],
					"product_name"=>$value['product_name'],
					"product_platform"=>$value['product_platform'],
					"option_type"=>$value['option_type'],
					"game_type"=>$value['game_type'],
					"display_type"=>$value['display_type'],
					"spoken_korean"=>$value['spoken_korean'],
					"interface_korean"=>$value['interface_korean'],
					"exclusive_korean"=>$value['exclusive_korean'],
					"is_bonus"=>$value['is_bonus'],
					"status"=>$value['status'],
					"discount"=>$value['discount'],
					"consumer_price"=>$value['consumer_price'],
					"price"=>$value['price'],
					"product_srp"=>$value['product_srp'],
					"product_ppr"=>$value['product_ppr'],
					"product_ppr"=>$value['product_ppr'],
					"publisher_code"=>$value['supplier_code'],
					"product_type"=>$value['product_type'],
					"delivery_type"=>$value['delivery_type'],
					"is_preorder"=>$value['is_preorder'],
					"is_repay"=>$value['is_repay'],
					"promotion"=>$promotion_data
				);
				//
			}else{
				$goods_info[] = array(
					"product_code"=>$value['product_code'],
					"goods_sku"=>$value['goods_sku'],
					"product_name"=>$value['product_name'],
					"product_platform"=>$value['product_platform'],
					"option_type"=>$value['option_type'],
					"game_type"=>$value['game_type'],
					"display_type"=>$value['display_type'],
					"spoken_korean"=>$value['spoken_korean'],
					"interface_korean"=>$value['interface_korean'],
					"exclusive_korean"=>$value['exclusive_korean'],
					"is_bonus"=>$value['is_bonus'],
					"status"=>$value['status'],
					"discount"=>$value['discount'],
					"consumer_price"=>$value['consumer_price'],
					"price"=>$value['price'],
					"product_srp"=>$value['product_srp'],
					"product_ppr"=>$value['product_ppr'],
					"publisher_code"=>$value['supplier_code'],
					"delivery_type"=>$value['delivery_type'],
					"product_type"=>$value['product_type'],
					"is_preorder"=>$value['is_preorder'],
					"is_repay"=>$value['is_repay'],
					"promotion"=>$promotion_data
				);
			}
		}

		$cart_list = $goods_info;

		return $cart_list;
	}


//게임코드 발송할 아이템 정보조회
	public function getGoodsItemDelivery($product_code){
		$query = "select product_code,order_system,item_id,item_name,item_platform,item_publisher from tbl_goods_item_delivery where product_code=:product_code order by item_name asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code,
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		
		return $data;
	}
	
	//주문서 저장
	public function setOrder($params){
		$query = "insert into tbl_order set settle_no=:settle_no,m_no=:m_no,m_id=:m_id,ord_ymd=:ord_ymd,ip=:ip,use_emoney=:use_emoney,total_price=:total_price,reg_date=now()";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':settle_no'=>$params['settle_no'],
			':m_no'=>$params['m_no'],
			':m_id'=>$params['m_id'],
			':ord_ymd'=>$params['ord_ymd'],
			':ip'=>$params['ip'],
			':use_emoney'=>$params['use_emoney'],
			':total_price'=>$params['total_price'],
		);
		$stmt->execute($params);
	}
	
	//주문상세 저장
	
	//주문상세내역 조회
	public function getOrderItem($settle_no){
		$query = "select * from tbl_order_item where settle_no=:settle_no order by ordno asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':settle_no'=>$settle_no,
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		
		return $data;
	}
	
	//주문상세내역 상품정보 조회
	public function getOrderItemOption($ordno){
		$query = "select * from tbl_order_item where ordno=:ordno";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':ordno'=>$ordno,
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		
		return $data;
	}
	
	//택배발송 주문내역 조회
	public function getOrderShipment($settle_no,$ordno){
		$query = "select * from tbl_order_shipment where settle_no=:settle_no and ordno=:ordno";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':settle_no'=>$settle_no,
			':ordno'=>$ordno,
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		
		return $data;
	}
	
	/*
	==========================================
	//3. 주문 상세 데이터 전송 (tbl_order_item)
	==========================================
	INSERT INTO tbl-order_item (order_id, product_id, quantity, unit_price)
	SELECT o.order_id, ci.product_id, ci.quantity, ci.price
	FROM tbl_cart ci
	JOIN tbl_order o ON o.m_no = {m_no} AND o.status = 'pending'
	WHERE ci.selected = 1;
	*/
	
	/*
	====================================
	//4. 주문 처리 (Order Processing)
	=====================================
	- 배송 상품: tbl_Shipments 테이블에 배송 정보를 저장하고, status를 shipped로 변경합니다.
	- 디지털 상품: Game_Code_Distribution 테이블에 게임 코드 발송 정보를 저장하고, status를 code_sent로 변경합니다.
	- 고객이 결제를 완료하면 tbl_cart의 데이터를 tbl_order_item로 이동하고, 해당 tbl_cart(selected-'1')를 삭제하여 장바구니를 비웁니다.
	*/
	
	/*
	//5.장바구니 데이터 정리 (Cart Cleanup)
	*/
	public function deleteCart($request_params){
		$query = "delete from tbl_cart where m_no=:m_no and goods_sku=:goods_sku";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':m_no'=>$request_params['m_no'],
			':goods_sku'=>$request_params['goods_sku'],
		);
		$stmt->execute($params);
	}
	
	//주문조회
	public function getOrder($settle_no){
		$query = "select * from tbl_order where settle_no=:settle_no";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':settle_no'=>$settle_no,
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		
		return $data;
	}
	
	//주문서 포인트 할인 사용체크
	public function getOrderUsePoint($settle_no){
		$query = "select use_emoney from tbl_order where settle_no=:settle_no";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':settle_no'=>$settle_no,
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		
		return $data['use_emoney'];
	}
	
	//KCP결제로그
	public function getKcpLog($settle_no){
		$query = "select * from kcp_log where settle_no=:settle_no";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':settle_no'=>$settle_no,
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		
		return $data;
	}
	
	//네이버페이 결제로그
	public function getNaverPayLog($paymentId){
		$query = "select * from naverpay_log where paymentId=:paymentId";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':paymentId'=>$paymentId,
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		
		return $data;
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
	
	//결제수단
	public function getPaymentMethod($payment_method){
		switch($payment_method){
			case "SC0010":
				echo "신용카드";
			break;
			case "SC0030":
				echo "실시간 계좌이체";
			break;
			case "SC0040":
				echo "가상계좌";
			break;
			case "SC0060":
				echo "휴대폰";
			break;
			case "DG0000":
				echo "전액할인";
			break;
			case "PAYCO":
				echo "페이코";
			break;
			case "samsung":
				echo "삼성페이";
			break;
			case "POINT":
				echo "네이버포인트";
			break;
			case "toss_bank":
				echo "퀵계좌이체";
			break;
			case "toss_pay":
				echo "토스페이";
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
				echo "코드+택배발송";
			break;
		}
	}
	
	//코드발송상태
	public function getOrderSendStatus($send_status){
		switch($send_status){
			case "delivered":
				echo "발송완료";
			break;
			case "preorder":
				echo "예약주문";
			break;
			case "backorder":
				echo "품절주문";
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
		}
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

	//마이페이지용 — append-only 모델에서 (ordno, productID)별 최신 row만 반환
	//사용자가 보는 것은 현재 상태(canceled 인지 confirmed/sold 인지)이므로 chain 전체가 아닌 latest만 노출
	public function getOrderItemPointNexus($ordno){
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
		$params = array(
			':ordno'=>$ordno
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	//택배발송 배송로그
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
	
	//회원등급별 지급 포인트 산정
	public function getOrderRepay($m_id,$price,$product_code){
		$repay = 0;
		//회원등급별 리워드 포인트
		$m_query = "select b.add_emoney_type,b.add_emoney_std_amt from directgames.tbl_member a inner join directgames.tbl_member_group b on a.mem_level=b.level where a.m_id=:m_id";
		$stmt = $this->_db->prepare($m_query);
		$params = array(
			':m_id'=>$m_id
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		if($data['add_emoney_type']=='%'){
			$repay = round($price/100 * $data['add_emoney_std_amt'],0);
		}else{
			$repay = $data['add_emoney_std_amt'];
		}

		$add_emoney = $this->getAddRepayGoods($price,$product_code);

		$totoal_repay = $repay + $add_emoney;

		return $totoal_repay;
	}
	
	//추가 포인트 지급 설정
	public function getAddRepayGoods($price,$product_code){
		$add_emoney = 0;
		$query = "select * from tbl_add_repay where product_code=:product_code and repay_flag='Y' and start_dt<now() and end_dt>=now() order by idx desc limit 1";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		if($data['repay_type']=="%"){
			$add_emoney = round($price/100 * $data['repay_point'],0);
		}else{
			$add_emoney = $data['repay_point'];
		}

		return $add_emoney;
	}
	
	//KCP 결제상세로그
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


	//클래스 소멸자
	public function __destruct() {
		$this->_db=null;
	}
}
?>