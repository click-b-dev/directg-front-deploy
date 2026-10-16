<?
class Mypage2 extends Pagination{
	private $_db;

	//클래스 생성자
	public function __construct(PDO $db){
		$this->_db = $db;
	}
	
	//마이페이지 > 대시보드
	public function getOrderItemCount($m_no,$status){
		$query = "SELECT COUNT(*) as cc, SUM(price) as ss FROM tbl_order_item WHERE m_no=:m_no AND status=:status";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':m_no'=>$m_no,
			':status'=>$status
		);
		$stmt->execute($params);
		$count = $stmt->fetch();
		return $count;
	}
	
	public function getMemberEmoney($m_no){
		$query = "SELECT SUM(amt_delta) FROM directgames.tbl_emoney_log WHERE m_no=:m_no";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':m_no'=>$m_no
		);
		$stmt->execute($params);
		$emoney = $stmt->fetch();
		return $emoney['0'];
	}
	
	//마이페이지 > 대시보드 > 최근 주문내역
	public function getOrderListMain($m_no,$status,$start_date,$end_date){
		if($status=="2"){
			$query = "SELECT b.order_date,b.settle_no,b.ordno,b.product_name,b.price,a.step,b.status,b.is_actv,b.delivery_type FROM tbl_order a JOIN tbl_order_item b ON a.settle_no=b.settle_no WHERE a.m_no=:m_no AND a.ord_ymd BETWEEN :start_date AND :end_date and a.step='2' AND b.status=:status order by b.order_item_id desc";
			$params = array(
				':m_no'=>$m_no,
				':status'=>$status,
				':start_date'=>$start_date,
				':end_date'=>$end_date
			);
		} else {
			$query = "SELECT b.order_date,b.settle_no,b.ordno,b.product_name,b.price,a.step,b.status,b.cancel_date,b.is_actv,b.delivery_type FROM tbl_order a JOIN tbl_order_item b ON a.settle_no=b.settle_no WHERE a.m_no=:m_no AND b.status=:status AND a.ord_ymd BETWEEN :start_date AND :end_date order by b.cancel_date desc";
			$params = array(
				':m_no'=>$m_no,
				':status'=>$status,
				':start_date'=>$start_date,
				':end_date'=>$end_date
			);
		}
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$result = $stmt->fetchAll();
		return $result;
	}
	
	//
	public function getOrderList_v2($page,$add_where,$orderby,$param){
		try{
			$query = "SELECT a.ord_ymd,a.step,b.* FROM tbl_order a inner join tbl_order_item b on a.settle_no=b.settle_no WHERE ".$add_where." ORDER BY ".$orderby;

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

	public function getOrderList_vbank($page,$add_where,$orderby,$param){
		try{
			$query = "SELECT a.payment_method,a.ord_ymd,a.step,b.*,c.res_msg,c.tno,c.amount,c.app_time,c.bank_name,c.depositor,c.account,c.va_date,d.* FROM tbl_order a inner join tbl_order_item b on a.settle_no=b.settle_no LEFT join kcp_log c on a.settle_no=c.settle_no AND a.payment_method='SC0040' LEFT JOIN payco_log d on a.settle_no=d.sellerOrderReferenceKey WHERE ".$add_where." ORDER BY ".$orderby;

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
	public function getOrder($m_no,$settle_no){
		if($m_no=="823942" || $m_no=="827877"){
			$query = "SELECT settle_no,settlekind,settleprice,cash,emoney,email,m_no,step,cdt,id,zt_mem_id,regdt,pg_provider,ord_ymd FROM tbl_order WHERE settle_no=:settle_no";
			$params = array(
				':settle_no'=>$settle_no
			);
		} else {
			$query = "SELECT settle_no,settlekind,settleprice,cash,emoney,email,m_no,step,cdt,id,zt_mem_id,regdt,pg_provider,ord_ymd FROM tbl_order WHERE settle_no=:settle_no AND m_no=:m_no";
			$params = array(
				':m_no'=>$m_no,
				':settle_no'=>$settle_no
			);
		}
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$result = $stmt->fetch();
		return $result;
	}
	
	public function getOrderV2($m_no,$settle_no){
		$query = "SELECT * FROM tbl_order WHERE settle_no=:settle_no AND m_no=:m_no";
		$params = array(
			':m_no'=>$m_no,
			':settle_no'=>$settle_no
		);
		
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$result = $stmt->fetch();
		return $result;
	}
	
	public function getOrderItem($settle_no){
		$query = "SELECT ordno,product_code,product_nm,status,pay,tot_pay,zt_item_id,zt_ord_no,asset_id,reserve_id,is_lic_actv,supp_cd,publisher_code,is_delivery FROM tbl_order_item WHERE settle_no=:settle_no";
		$params = array(
			':settle_no'=>$settle_no
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$result = $stmt->fetchAll();
		return $result;
	}
	
	public function getOrderItemV2($settle_no){
		$query = "SELECT * FROM tbl_order_item WHERE settle_no=:settle_no";
		$params = array(
			':settle_no'=>$settle_no
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$result = $stmt->fetchAll();
		return $result;
	}
	
	public function getOrderItemZtorm($ordno){
		$query = "SELECT * FROM tbl_order_item_ztorm WHERE ordno=:ordno";
		$params = array(
			':ordno'=>$ordno
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$result = $stmt->fetch();
		return $result;
	}

	public function getOrderGoodsGift($ordno){
		$order_data = array();
		$list = array();

		$query = "SELECT reserve_id,gift_nm,active_dt,ordno,sku,orderId FROM tbl_order_gift WHERE ordno=:ordno";
		$params = array(
			':ordno'=>$ordno
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$result = $stmt->fetchAll();
		return $result;
	}

	
	public function getGoodsData($goods_code){
		$query = "SELECT goods_kind,package_set,platform_code,preorder_free FROM tbl_goods WHERE goods_code=:goods_code";
		$params = array(
			':goods_code'=>$goods_code
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$result = $stmt->fetch();
		return $result;
	}

	public function getRetailOrder($m_no,$settle_no){
		if($m_no=="823942"){
			$query = "SELECT * FROM retail_order WHERE settle_no=:settle_no";
			$params = array(
				':settle_no'=>$settle_no
			);
		} else {
			$query = "SELECT * FROM retail_order WHERE settle_no=:settle_no AND m_no=:m_no";
			$params = array(
				':m_no'=>$m_no,
				':settle_no'=>$settle_no
			);
		}
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$result = $stmt->fetch();
		return $result;
	}

	public function getRetailOrderLog($settle_no){
		$query = "SELECT * FROM retail_order_log WHERE settle_no=:settle_no";
		$params = array(
			':settle_no'=>$settle_no
		);

		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$result = $stmt->fetchAll();
		return $result;
	}

	public function getRetailNaverpayLog($settle_no){
		$query = "SELECT * FROM retail_naverpay_log WHERE merchantPayKey=:settle_no";
		$params = array(
			':settle_no'=>$settle_no
		);

		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$result = $stmt->fetch();
		return $result;
	}

	public function getRetailKcpLog($settle_no){
		$query = "SELECT * FROM retail_kcp_log WHERE settle_no=:settle_no";
		$params = array(
			':settle_no'=>$settle_no
		);

		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$result = $stmt->fetch();
		return $result;
	}

	public function getGoodsSupplyNew($goods_code){
		$supply_array = array();
		$list = array();

		$query = "SELECT a.idx,a.goods_code,a.supply_contents,a.supply_file_url,b.prefix_text,b.encode_type FROM tbl_goods_supply a LEFT JOIN tbl_patch_goods b ON a.patch_no=b.idx WHERE a.goods_code=:goods_code";
		$params = array(
			':goods_code'=>$goods_code
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$result = $stmt->fetchAll();

		foreach($result as $data){
			$list['idx']=$data['idx'];
			$list['goods_code']=$data['goods_code'];
			$list['supply_contents']=$data['supply_contents'];
			$list['supply_file_url']=$data['supply_file_url'];
			$list['prefix_text']=$data['prefix_text'];
			$list['encode_type']=$data['encode_type'];
			array_push($supply_array,$list);
		}
		return $supply_array;
	}
	
	public function updateOrderAddress($settle_no,$name,$zipcode,$address,$address_detail,$tel,$msg){
		$query = "UPDATE tbl_order_address SET name=:name,zipcode=:zipcode,address=:address,address_detail=:address_detail,tel=:tel,msg=:msg WHERE settle_no=:settle_no";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':name'=>$name,
			':zipcode'=>$zipcode,
			':address'=>$address,
			':address_detail'=>$address_detail,
			':tel'=>$tel,
			':msg'=>$msg,
			':settle_no'=>$settle_no
		);
		$stmt->execute($params);
	}

	//패키지 발송 요청체크
	public function deliveryAddressChk($ordno){
		$query = "SELECT name,address,address_detail,zipcode,tel,tracking_no,msg,status FROM tbl_order_address WHERE ordno=:ordno";
		$params = array(
			':ordno'=>$ordno
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}

	//패키지 발송신청 가능상품체크
	public function isDeliveryGoodsChk($goods_code){
		$query = "SELECT delivery_yn FROM tbl_goods WHERE goods_code=:goods_code";
		$params = array(
			':goods_code'=>$goods_code
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$data = $stmt->fetch();
		
		return $data['delivery_yn'];
	}


	public function getKcpLog($settle_no){
		$query = "SELECT imp_uid,merchant_uid,pay_method,paid_amount,status,name,pg_provider,pg_tid,buyer_name,buyer_email,paid_at,receipt_url,card_name,apply_num,vbank_num,
		vbank_name,vbank_holder,vbank_date FROM tbl_kcp_log WHERE merchant_uid=:merchant_uid";
		$params = array(
			':merchant_uid'=>$settle_no
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$result = $stmt->fetch();
		return $result;
	}
	
	public function getGoodsPublisher($code){
		$query = "SELECT publisher FROM tbl_publisher WHERE idx=:code";
		$params = array(
			':code'=>$code
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$result = $stmt->fetch();
		return $result['publisher'];
	}
	
	public function getGoodsPackage($package_set){
		$package_set = str_replace("&#34;",'"',htmlspecialchars_decode($package_set));
		$package_array = array();
		$package_obj = json_decode($package_set,true);
		if(is_array($package_obj)){
			foreach($package_obj as $value){
				$data['goods_code'] = $value['goods_code'];
				$data['goods_nm'] = $value['goods_nm'];
				array_push($package_array,$data);
			}
		}
		return $package_array;
	}
	
	public function goodsPreOrderChk2($goods_code){
		$query = "SELECT pre_purchase_yn FROM tbl_goods WHERE goods_code=:goods_code";
		$params = array(
			':goods_code'=>$goods_code
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$result = $stmt->fetch();
		return $result['pre_purchase_yn'];
	}

	public function getPointList($page,$add_where,$orderby,$param){
		try{
			$query = "SELECT regdt, emoney_type, memo, amt_delta FROM tbl_emoney_log WHERE ".$add_where." ORDER BY ".$orderby;

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
	
	public function getPointListMain($m_no,$start_date,$end_date){
		$query = "SELECT regdt, emoney_type, memo, amt_delta FROM directgames.tbl_emoney_log WHERE m_no='".$m_no."' and regdt>='".$start_date."' and regdt<='".$end_date."' order by regdt DESC ";
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$result = $stmt->fetchAll();
		return $result;
	}

	public function getCouponList($page,$add_where,$orderby,$param){
		try{
			$query = "SELECT a.coupon_name, a.sdate, a.edate, a.coupon_price, a.currency, b.regdt FROM tbl_offline_coupon a JOIN tbl_offline_download b ON a.sno=b.coupon_sno WHERE ".$add_where." ORDER BY ".$orderby;

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

	public function eventGoodsPrice($goods_code){
		$query = "SELECT a.goods_code,a.event_ea,a.sale_price,b.goods_nm,b.consumer_price,b.goods_bimg FROM tbl_event c INNER JOIN tbl_event_goods a ON c.idx=a.event_no INNER JOIN tbl_goods b ON a.goods_code=b.goods_code WHERE a.goods_code=:goods_code AND c.end_dt>=NOW() AND c.start_dt<NOW() AND a.confirm=:confirm";
		$params = array(
			':goods_code'=>$goods_code,
			':confirm'=>"Y"
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$data = $stmt->fetch();
		
		if($data['sale_price']){
			return $data['sale_price'];
		}else{
			return 0;
		}
	}

	public function getMemberInfo($m_no){
		$query = "SELECT m_id,name,nickname,birth_day,hp,is_auth FROM directgames.tbl_member WHERE m_no=:m_no";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':m_no'=>$m_no
		);
		$stmt->execute($params);
		$result = $stmt->fetch();
		return $result;
	}

	public function memberChk($m_id,$m_pwd){
		$query = "SELECT m_id,m_pwd,status FROM tbl_member WHERE m_id=:m_id AND m_pwd=PASSWORD(:m_pwd)";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':m_id'=>$m_id,
			':m_pwd'=>$m_pwd
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		if($m_id!=""){
			if($data['status']=="5"){
				$result = array(
					"status"=>"fail",
					"error_code"=>"NO_AUTH_CONFIRM",
					"error_msg"=>"미승인된 회원입니다.",
				);
			}else{
				if(!$data['m_id']){
					$result = array(
						"status"=>"fail",
						"error_code"=>"INVALID_PASSWORD",
						"error_msg"=>"비밀번호가 일치하지 않습니다.",
					);
				}else{
					$result = array(
						"status"=>"success",
						"error_code"=>"OK",
						"error_msg"=>"성공",
						"data"=>$data
					);
				}
			}
		} else {
			$result = array(
				"status"=>"fail",
				"error_code"=>"SESSION_EXPIRED",
				"error_msg"=>"세션이 종료되었습니다. 다시 로그인해주세요.",
			);
		}

		return $result;
	}

	public function updatePassword($m_id,$current_password,$m_pwd){
		if($m_id){
			$query = "UPDATE tbl_member SET m_pwd=PASSWORD(:m_pwd) WHERE m_id=:m_id AND m_pwd=PASSWORD(:current_password)";
			$stmt = $this->_db->prepare($query);
			$params = array(
				':m_id'=>$m_id,
				':m_pwd'=>$m_pwd,
				':current_password'=>$current_password
			);
			$stmt->execute($params);
		}
	}

	public function updateMemberStatus($m_id,$status){
		if($status=="1"){
			$query = "UPDATE tbl_member SET status=:status,out_date=NOW() WHERE m_id=:m_id";
			$stmt = $this->_db->prepare($query);
			$params = array(
				':status'=>"1",
				':m_id'=>$m_id
			);
			$stmt->execute($params);
		}
	}


	public function getMemberSnsInfo($m_no){
		$query = "SELECT sns_type,sns_connect_date,email FROM sns_info WHERE m_no=:m_no";
		$params = array(
			':m_no'=>$m_no
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$result = $stmt->fetchAll();
		return $result;
	}

	public function getWishlist($page,$add_where,$orderby,$param){
		try{
			$query = "SELECT a.idx,a.reg_date,a.product_code,a.product_name,b.consumer_price,b.price,b.is_view,b.status,b.soldout,b.goods_sku,b.game_type,b.display_type,b.product_platform,b.discount FROM tbl_wishlist a INNER JOIN tbl_goods_item b ON a.product_code=b.product_code WHERE ".$add_where." ORDER BY ".$orderby;

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

	public function getWishlistItem($m_no,$product_code){
		$query = "SELECT * FROM tbl_wishlist WHERE m_no=:m_no AND product_code=:product_code";
		$params = array(
			":m_no"=>$m_no,
			":product_code"=>$product_code
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$result = $stmt->fetch();
		return $result;
	}

	public function getWishlistByProducts($m_no, $product_codes){
		if(empty($product_codes)) return array();
		
		$arr = array();
		$params = array(
			":m_no"=>$m_no
		);
		
		$i=0;
		foreach($product_codes as $product_code){
			$key = ':product_'.$i;
			$arr[] = $key;
			$params[$key] = $product_code;
			$i++;
		}
		
		$str = implode(',', $arr);
		
		$query = "SELECT idx,goods_sku,product_code FROM tbl_wishlist WHERE m_no=:m_no AND product_code IN (".$str.")";
		
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$result = $stmt->fetchAll();
		
		return $result;
	}

	public function getQnaList($page,$add_where,$orderby,$param){
		try{
			$query = "SELECT idx, subject, reg_date, answer_dt, is_answer, gubun, contents, answer FROM tbl_qna WHERE ".$add_where." ORDER BY ".$orderby;
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
	
	public function getQnaView($idx,$m_id){
		$query = "SELECT subject, reg_date, answer_dt, is_answer, gubun, contents, answer FROM tbl_qna WHERE idx=:idx AND user_id=:m_id";
		$params = array(
			':idx'=>$idx,
			':m_id'=>$m_id
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$result = $stmt->fetch();
		return $result;
	}
	
	public function setQna($m_id,$gubun,$subject,$contents,$ip){
		$query = "INSERT INTO tbl_qna SET user_id=:user_id,gubun=:gubun,subject=:subject,contents=:contents,ip=:ip,reg_date=NOW()";
		$params = array(
			':user_id'=>$m_id,
			':gubun'=>$gubun,
			':subject'=>$subject,
			':contents'=>$contents,
			':ip'=>$ip
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		return $this->_db->lastInsertId();
	}
	
	public function setQnaFile($idx,$m_id,$uploadfile,$type,$upname,$ip){
		$query = "INSERT INTO tbl_file SET table_name=:table_name,puid=:puid,user_id=:user_id,filename=:filename,file_type=:file_type,upname=:upname,ip=:ip,reg_date=NOW()";
		$params = array(
			':table_name'=>'tbl_qna',
			':puid'=>$idx,
			':user_id'=>$m_id,
			':filename'=>$uploadfile,
			':file_type'=>$type,
			':upname'=>$upname,
			':ip'=>$ip
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
	}
	
	//위시리스트 삭제
	public function deleteWishlist($m_no,$idx){
		$query = "DELETE FROM tbl_wishlist WHERE m_no=:m_no AND idx=:idx";
		$params = array(
			':m_no'=>$m_no,
			':idx'=>$idx
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
	}
	
	public function deleteWishlistGoodscode($m_no,$product_code){
		$query = "DELETE FROM tbl_wishlist WHERE m_no=:m_no AND product_code=:product_code";
		$params = array(
			':m_no'=>$m_no,
			':product_code'=>$product_code
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
	}
	
	public function getCart($m_no,$product_code){
		$query = "SELECT product_code FROM tbl_cart WHERE m_no=:m_no AND product_code=:product_code";
		$params = array(
			':m_no'=>$m_no,
			':product_code'=>$product_code
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$result = $stmt->fetch();
		return $result['product_code'];
	}

	public function setPaperCouponMember($coupon_number,$m_no,$m_id){
		$licence = new Licence($this->_db);
		//해당쿠폰 인증번호 회원 유효성 확인
		$chk_query = "SELECT sno,coupon_sno,flag FROM tbl_offline_paper WHERE number=:coupon_number";
		$chk_params = array(
			":coupon_number"=>$coupon_number
		);
		$stmt = $this->_db->prepare($chk_query);
		$stmt->execute($chk_params);
		$chk_data = $stmt->fetch();
		if($chk_data['sno']){	//유효한 쿠폰번호
			$c_query = "SELECT sno, coupon_name, sdate, edate, coupon_price, issuePerPersonLimitCnt, dailyIssuePerPersonLimitCnt, issuePerPersonLimitYn, status, code_type, partner FROM tbl_offline_coupon WHERE sno=:sno";
			$c_params = array(
				":sno"=>$chk_data['coupon_sno']
			);
			$stmt = $this->_db->prepare($c_query);
			$stmt->execute($c_params);
			$coupon_data = $stmt->fetch();

			if($coupon_data['status']=="1"){	//쿠폰 등록 가능한 상태일경우
				if(($coupon_data['sdate'] < date('Y-m-d H:i:s')) && ($coupon_data['edate'] > date('Y-m-d H:i:s'))){	//사용기간내에서만 가능
					if($coupon_data['code_type']=="DYNAMIC"){	//난수생성된 경우
						if($chk_data['flag']=="Y"){
							$msg = "이미 사용된 쿠폰입니다.";
						} else {
							$s_query = "SELECT COUNT(*) AS total_count, SUM(CASE WHEN DATE(regdt) = CURDATE() THEN 1 ELSE 0 END) AS today_count FROM tbl_offline_download WHERE m_no=:m_no AND coupon_sno = :sno";	//입력한 쿠폰번호와 같은 종류의 쿠폰을 몇개나 등록했는지
							$s_params = array(
								":m_no"=>$m_no,
								":sno"=>$chk_data['coupon_sno']
							);
							$stmt = $this->_db->prepare($s_query);
							$stmt->execute($s_params);
							$s_data = $stmt->fetch();
							$count = $s_data['total_count'];
							$day_count = $d_data['today_count'];
							if(
								(
									(
										($count<$coupon_data['issuePerPersonLimitCnt'] && $coupon_data['issuePerPersonLimitCnt']>0)
										|| $coupon_data['issuePerPersonLimitCnt']==0
									)
									&&
									(
										($day_count<$coupon_data['dailyIssuePerPersonLimitCnt'] && $coupon_data['dailyIssuePerPersonLimitCnt']>0)
										|| $coupon_data['dailyIssuePerPersonLimitCnt']==0
									)
								) || $coupon_data['issuePerPersonLimitYn']=="N"
							){
								$licence->setEmoney($m_no,"+",$coupon_data['coupon_price'],"쿠폰적립-".$coupon_data['coupon_name']."(".$coupon_data['partner'].")",$coupon_number,"ordno");
								
								$result=$this->setPaperCouponDownload($chk_data['coupon_sno'],$chk_data['sno'],$m_no,$m_id);
								
								$update_query = "UPDATE tbl_offline_paper SET flag=:flag WHERE number=:number";
								$update_params = array(
									":flag"=>"Y",
									":number"=>$coupon_number
								);
								$stmt = $this->_db->prepare($update_query);
								$stmt->execute($update_params);
								$update_result = $this->_db->lastInsertId();

								$msg = "성공";
							} else {
								$msg = "등록 횟수가 초과되었습니다.";
							}
						}
					} else {	//지정코드인 경우
						$u_query = "SELECT COUNT(sno) FROM tbl_offline_download WHERE paper_sno=:sno AND m_no=:m_no AND m_id=:m_id";	//지정코드가 아닐 경우 같은 쿠폰이 있을 수 없고, 지정코드인 경우 등록했으면 count=1
						$u_params = array(
							":sno"=>$chk_data['sno'],
							":m_no"=>$m_no,
							":m_id"=>$m_id
						);
						$stmt = $this->_db->prepare($u_query);
						$stmt->execute($u_params);
						$u_data = $stmt->fetch();
						if($u_data[0]>0){	//이미 등록한적이 있는 경우
							$msg = "이미 등록한 코드입니다.";
						} else {
							$order_check=$this->getOrderInfo($chk_data['coupon_sno'],$m_no);
							if($order_check>0){
								$licence->setEmoney($m_no,"+",$coupon_data['coupon_price'],"쿠폰적립-".$coupon_data['coupon_name']."(".$coupon_data['partner'].")",$coupon_number,"ordno");
								
								$result=$this->setPaperCouponDownload($chk_data['coupon_sno'],$chk_data['sno'],$m_no,$m_id);
								
								$msg = "성공";
							} else {
								$msg = "키수령 후 등록 가능합니다.";
							}
						}
					}
				} else {
					$msg = "등록기간이 아닙니다.";
				}
			} else {
				$msg = "등록할 수 없는 쿠폰입니다.";
			}
		}else{
			$msg = "쿠폰번호를 다시 확인해 주세요.";
		}
		return $msg;
	}
	
	public function setPaperCouponDownload($coupon_sno, $sno, $m_no, $m_id){
		$query = "INSERT INTO tbl_offline_download SET coupon_sno=:coupon_sno,paper_sno=:paper_sno,m_no=:m_no,m_id=:m_id,regdt=now()";
		$params = array(
			":coupon_sno"=>$coupon_sno,
			":paper_sno"=>$sno,
			":m_no"=>$m_no,
			":m_id"=>$m_id
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		return $this->_db->lastInsertId();
	}
	
	public function getOrderInfo($sno,$m_no){
		$check=0;
		$product_query="SELECT COUNT(*) FROM tbl_offline_goods WHERE coupon_sno=:sno";
		$product_params=array(
			":sno"=>$sno
		);
		$stmt = $this->_db->prepare($product_query);
		$stmt->execute($product_params);
		$product_result = $stmt->fetch();

		if($product_result[0]>0){
			$check="1";
		} else {
			$check_query="SELECT b.product_code, b.start_dt, b.end_dt FROM tbl_offline_coupon a JOIN tbl_offline_goods b ON a.sno=b.coupon_sno WHERE a.sno=:sno AND NOW() BETWEEN b.start_dt AND b.end_dt";
			$check_params=array(
				":sno"=>$sno
			);
			$stmt = $this->_db->prepare($check_query);
			$stmt->execute($check_params);
			$check_result = $stmt->fetchAll();

			foreach($check_result as $data){
				$order_query="SELECT COUNT(sno) FROM tbl_order_item WHERE m_no=:m_no AND product_code=:product_code AND is_lic_actv='1' AND status='2'";
				$order_params=array(
					":m_no"=>$m_no,
					":product_code"=>$data['product_code']
				);
				
				$stmt = $this->_db->prepare($order_query);
				$stmt->execute($order_params);
				
				$order_data = $stmt->fetch();
				if($order_data[0]>0){
					$check++;
				}
			}
		}
		return $check;
	}

	public function setOrderLog($settle_no,$ordno,$message){
		$query = "INSERT INTO tbl_order_log SET settle_no=:settle_no, ordno=:ordno, memo=:memo, reg_date=NOW()";
		$params=array(
			":settle_no"=>$settle_no,
			":ordno"=>$ordno,
			":memo"=>$message
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
	}

	public function updateOrderitem($settle_no,$ordno,$status,$message){
		$query = "UPDATE tbl_order_item SET status=:status WHERE ordno=:ordno";
		$params=array(
			":status"=>$status,
			":ordno"=>$ordno
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);

		$this->setOrderLog($settle_no,$ordno,$message);

		return "OK";
	}

	public function updateOrder($settle_no,$status,$message){
		$query = "UPDATE tbl_order_item SET status=:status WHERE settle_no=:settle_no";
		$params=array(
			":status"=>$status,
			":settle_no"=>$settle_no
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);

		$query = "UPDATE tbl_order SET step=:status WHERE settle_no=:settle_no";
		$params=array(
			":status"=>$status,
			":settle_no"=>$settle_no
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);

		$this->setOrderLog($settle_no,NULL,$message);

		return "OK";
	}

	public function setCancelRequest($ordno,$m_no,$m_id){
		$query = "INSERT INTO directgames.tbl_order_cancel_request SET ordno=:ordno, m_no=:m_no, m_id=:m_id, reg_date=NOW()";
		$params=array(
			":ordno"=>$ordno,
			":m_no"=>$m_no,
			":m_id"=>$m_id
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
	}

	//취소요청 철회 — 가상계좌(VCNT) 입금대기건은 입금대기로, 일반건은 원래 상태(발송오류=1/정상=2)로 복원
	public function withdrawCancelRequest($ordno,$m_no,$settle_no){
		//철회 대상 조회 — send_status(pending=가상계좌 입금대기 식별)로 분기
		$stmt = $this->_db->prepare("SELECT settle_no, send_status FROM tbl_order_item WHERE ordno=:ordno AND m_no=:m_no AND `status`=8 LIMIT 1");
		$stmt->execute(array(":ordno"=>$ordno, ":m_no"=>$m_no));
		$target = $stmt->fetch();

		if(!$target){
			return array(
				"success"=>false,
				"message"=>"관리자가 취소 요청을 확인 중이기 때문에 철회할 수 없습니다."
			);
		}

		if($target["send_status"]=="pending"){
			//가상계좌(VCNT) 입금대기 취소건 → 주문 전체를 입금대기로 복원 (아이템 status=3, tbl_order.step=1)
			$stmt = $this->_db->prepare("UPDATE tbl_order_item SET `status`=3 WHERE settle_no=:settle_no AND m_no=:m_no AND `status`=8 AND send_status='pending'");
			$stmt->execute(array(":settle_no"=>$target["settle_no"], ":m_no"=>$m_no));

			$stmt = $this->_db->prepare("UPDATE tbl_order SET step=1 WHERE settle_no=:settle_no AND step='8'");
			$stmt->execute(array(":settle_no"=>$target["settle_no"]));

			$this->setOrderLog($settle_no, $ordno, "가상계좌 입금대기 복원(취소철회)");
			$msg = "취소 요청이 철회되어 입금대기 상태로 복원되었습니다.";
		}else{
			//일반 결제 아이템 취소건 → 원래 상태로 복원 (발송오류=1, 정상=2)
			$stmt = $this->_db->prepare("UPDATE tbl_order_item SET `status`=CASE WHEN send_status='fail' THEN 1 ELSE 2 END WHERE ordno=:ordno AND m_no=:m_no AND `status`=8");
			$stmt->execute(array(":ordno"=>$ordno, ":m_no"=>$m_no));

			$this->setOrderLog($settle_no, $ordno, "주문취소철회");
			$msg = "취소 요청이 철회되었습니다.";
		}

		return array(
			"success"=>true,
			"message"=>$msg
		);
	}

	public function getGiftList($page,$add_where,$orderby,$param){
		try{
			$query = "SELECT a.title,a.gift_nm,a.is_delivery,b.parent_idx,b.reserve_id,b.m_id,b.tracking_no,b.status,b.ordno,b.delivery_code,a.address_enddt,b.idx FROM tbl_event_gift a INNER JOIN tbl_event_gift_member b ON a.idx=b.parent_idx WHERE ".$add_where." ORDER BY ".$orderby;

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

	public function getGiftMember($idx){
		$query = "SELECT parent_idx,status,asset_id,reserve_id FROM tbl_event_gift_member WHERE idx=:idx";
		$params = array(
			":idx"=>$idx
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$result = $stmt->fetch();
		return $result;
	}

	public function updateGiftMemberAddress($idx,$name,$zipcode,$address,$address_detail,$tel,$status){
		$query = "UPDATE tbl_event_gift_member SET receiver=:receiver,zipcode=:zipcode,address=:address,address_detail=:address_detail,tel=:tel,status=:status,reg_date=NOW() WHERE idx=:idx";
		$params = array(
			":receiver" => $name,
			":zipcode" => $zipcode,
			":address" => $address,
			":address_detail" => $address_detail,
			":tel" => $tel,
			":status"=>$status,
			":idx" => $idx
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
	}
	
	public function updateGiftMemberAsset($idx,$ordno,$asset_id,$reserve_id,$status){
		$query = "UPDATE tbl_event_gift_member SET ordno=:ordno,asset_id=:asset_id,reserve_id=:reserve_id,reg_date=NOW(),status='3' WHERE idx=:idx";
		$params = array(
			":ordno" => $ordno,
			":asset_id" => $asset_id,
			":reserve_id" => $reserve_id,
			":status" => $status,
			":idx" => $idx
		);
		
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
	}
	
	public function getGoodsItemDetail($product_code){
		$goods_info = array();
		$data = array();

		$query = "select goods_sku,product_code,product_name,product_name_en,packageid,release_date,product_platform,consumer_price,price,discount,status,bundleid,is_bonus,is_view,is_free,steam_appid,spoken_korean,interface_korean,exclusive_korean,display_type,game_type,option_type,soldout,delivery_type,genre,category,tag,delivery_date,is_preorder,domain from tbl_goods_item where product_code=:product_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		

		$goods_info['goods_sku'] = $data['goods_sku'];
		$goods_info['product_code'] = $data['product_code'];
		$goods_info['product_name'] = $data['product_name'];
		$goods_info['product_name_en'] = $data['product_name_en'];
		$goods_info['packageid'] = $data['packageid'];
		$goods_info['release_date'] = $data['release_date'];
		$goods_info['product_platform'] = $data['product_platform'];
		$goods_info['consumer_price'] = $data['consumer_price'];
		$goods_info['price'] = $data['price'];
		$goods_info['discount'] = $data['discount'];
		$goods_info['status'] = $data['status'];
		$goods_info['bundleid'] = $data['bundleid'];
		$goods_info['is_bonus'] = $data['is_bonus'];
		$goods_info['is_free'] = $data['is_free'];
		$goods_info['is_view'] = $data['is_view'];
		$goods_info['is_preorder'] = $data['is_preorder'];
		$goods_info['option_type'] = $data['option_type'];
		$goods_info['display_type'] = $data['display_type'];
		$goods_info['game_type'] = $data['game_type'];
		$goods_info['steam_appid'] = $data['steam_appid'];
		$goods_info['spoken_korean'] = $data['spoken_korean'];
		$goods_info['interface_korean'] = $data['interface_korean'];
		$goods_info['exclusive_korean'] = $data['exclusive_korean'];
		$goods_info['soldout'] = $data['soldout'];
		$goods_info['delivery_type'] = $data['delivery_type'];
		$goods_info['delivery_date'] = $data['delivery_date'];
		$goods_info['genre'] = $data['genre'];
		$goods_info['category'] = $data['category'];
		$goods_info['tag'] = $data['tag'];
		$goods_info['domain'] = $data['domain'];

		return $goods_info;
	}
	
	//클래스 소멸자
	public function __destruct() {
		$this->_db=null;
	}
}
?>