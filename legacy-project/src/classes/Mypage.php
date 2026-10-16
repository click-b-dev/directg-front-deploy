<?
require_once "Licence.php";
require_once "Otp.php";

class Mypage extends Pagination{
	private $_db;

	//클래스 생성자
	public function __construct(PDO $db){
		$this->_db = $db;
	}
	
	public function getMemberEmoney($m_no){
		$query = "SELECT SUM(amt_delta) FROM tbl_emoney_log WHERE m_no=:m_no";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':m_no'=>$m_no
		);
		$stmt->execute($params);
		$emoney = $stmt->fetch();
		return $emoney['0'];
	}
	
	public function getOrderItemCount($m_no,$status){
		$query = "SELECT COUNT(*) as cc, SUM(tot_pay) as ss FROM tbl_order a JOIN tbl_order_item b ON a.settle_no=b.settle_no WHERE a.m_no=:m_no AND b.status=:status";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':m_no'=>$m_no,
			':status'=>$status
		);
		$stmt->execute($params);
		$count = $stmt->fetch();
		return $count;
	}
	
	public function getOrderListMain($m_no,$status,$start_date,$end_date){
		if($status=="0"){
			$query = "SELECT a.orddt,b.settle_no,b.ordno,b.product_nm,b.tot_pay,b.status FROM tbl_order a JOIN tbl_order_item b ON a.settle_no=b.settle_no WHERE a.m_no=:m_no AND a.ord_ymd BETWEEN :start_date AND :end_date";
			$params = array(
				':m_no'=>$m_no,
				':start_date'=>$start_date,
				':end_date'=>$end_date
			);
		} else {
			$query = "SELECT a.orddt,b.settle_no,b.ordno,b.product_nm,b.tot_pay,b.status,b.cancel_dt FROM tbl_order a JOIN tbl_order_item b ON a.settle_no=b.settle_no WHERE a.m_no=:m_no AND b.status=:status AND a.ord_ymd BETWEEN :start_date AND :end_date";
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

	public function getOrderList($page,$add_where,$orderby,$param){
		try{
			$query = "SELECT * FROM tbl_order WHERE ".$add_where." ORDER BY ".$orderby;

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


	public function getRetailOrderList($page,$add_where,$orderby,$param){
		//25-06-18(수) 17:13 [이종석]
		/*
		0:주문완료,
		1:결제대기,
		2:결제완료,
		3:배송준비중,
		4:배송중,
		5:배송완료,
		6:구매확정,
		8:취소요청,
		9:취소완료,
		97:취소보류,
		11:반품요청,
		12:반품수거중,
		13:반품수거완료,
		14:반품완료,
		17:반품보류,
		18:반품반려중,
		19:반품반려완료,
		21:교환요청,
		22:수거중,
		23:수거완료,
		24:교환중,
		25:교환완료,
		27:교환보류,
		28:교환반려중,
		29:교환반려완료
		*/
		try{
			$query = "SELECT * FROM retail_order WHERE ".$add_where." ORDER BY ".$orderby;

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

/*
	public function getRetailOrderList($m_no, $step=0){
		if($step==0){
			$query = "SELECT * FROM retail_order WHERE m_no<>:m_no ORDER BY id DESC";
			$params = array(
				":m_no"=>$m_no
			);
		} else if($step=="9"){
			$query = "SELECT * FROM retail_order WHERE m_no=:m_no AND (step='8' OR step='9' OR step='11' OR step='12' OR step='13' OR step='14') ORDER BY id DESC";
			$params = array(
				":m_no"=>$m_no
			);
		} else if($step=="1"){
			$query = "SELECT * FROM retail_order WHERE m_no=:m_no AND (step='0' OR step='2' OR step='3' OR step='4' OR step='5' OR step='6' OR step='17' OR step='18' OR step='19' OR step='21' OR step='22' OR step='23' OR step='24' OR step='25' OR step='27' OR step='28 OR step='29') ORDER BY id DESC";
			$params = array(
				":m_no"=>$m_no
			);
		} else {
			$query = "SELECT * FROM retail_order WHERE m_no=:m_no AND step=:step ORDER BY id DESC";
			$params = array(
				":m_no"=>$m_no,
				":step"=>$step
			);
		}
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$result = $stmt->fetchAll();

		return $result;
	}
*/
	public function getOrderItemName($settle_no){
		$item_list = array();
		$list2 = array();

		$query = "SELECT product_code,product_nm FROM tbl_order_item WHERE settle_no=:settle_no ORDER BY product_code ASC";
		$params = array(
			":settle_no"=>$settle_no
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$result = $stmt->fetchAll();
		foreach($result as $data){
			$list2['goods_code'] = $data['product_code'];
			$list2['goods_nm'] = $data['product_nm'];
			array_push($item_list,$list2);
		}

		if(count($item_list)>1){
			$product_info = $item_list['0']['goods_nm']. " 외 ".(count($item_list)-1)."건";
		}else{
			$product_info = $item_list['0']['goods_nm'];
		}

		return $product_info;
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
		$query = "SELECT * FROM kcp_log WHERE settle_no=:settle_no";
		$params = array(
			':settle_no'=>$settle_no
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$result = $stmt->fetch();
		return $result;
	}

	public function getPaycoLog($settle_no){
		$query = "SELECT * FROM payco_log WHERE sellerOrderReferenceKey=:settle_no";
		$params = array(
			':settle_no'=>$settle_no
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$result = $stmt->fetch();
		return $result;
	}
	
	public function getTossLog($settle_no){
		$query = "SELECT * FROM toss_log WHERE order_id=:settle_no";
		$params = array(
			':settle_no'=>$settle_no
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$result = $stmt->fetch();
		return $result;
	}
	
	public function getTossbankLog($settle_no){
		$query = "SELECT * FROM toss_adapter_log WHERE settle_no=:settle_no";
		$params = array(
			':settle_no'=>$settle_no
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
				'results_per_page' =>'10',
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
		$query = "SELECT regdt, emoney_type, memo, amt_delta FROM tbl_emoney_log WHERE m_no='".$m_no."' and regdt>='".$start_date."' and regdt<='".$end_date."' order by regdt DESC ";
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
		$query = "SELECT m_id,name,nickname,birth_day,hp,is_auth,mailling,email FROM tbl_member WHERE m_no=:m_no";
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

	public function updateNewPassword($m_id,$m_pwd){
		if($m_id){
			$query = "UPDATE tbl_member SET m_pwd=PASSWORD(:m_pwd) WHERE m_id=:m_id";
			$stmt = $this->_db->prepare($query);
			$params = array(
				':m_id'=>$m_id,
				':m_pwd'=>$m_pwd
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
			
			//회원데이터 삭제
			$query = "delete from tbl_member WHERE m_id=:m_id";
			$stmt = $this->_db->prepare($query);
			$params = array(
				':m_id'=>$m_id
			);
			$stmt->execute($params);
		}
	}

	public function updateMemberMailling($m_id,$mailling){
		$query = "UPDATE tbl_member SET mailling=:mailling WHERE m_id=:m_id";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':mailling'=>$mailling,
			':m_id'=>$m_id
		);
		$stmt->execute($params);
	}

	public function updateMemberEmail($m_id,$email){
		$query = "UPDATE tbl_member SET email=:email WHERE m_id=:m_id";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':m_id'=>$m_id,
			':email'=>$email
		);
		$stmt->execute($params);
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
			$query = "SELECT a.sno,a.regdt,b.goods_code,b.goods_nm,b.consumer_price,b.price,b.flag,b.age_limit,b.goods_simg,b.platform_code FROM tbl_wishlist a INNER JOIN tbl_goods b ON a.goods_code=b.goods_code WHERE ".$add_where." ORDER BY ".$orderby;

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

	public function getQnaMobileList($page,$add_where,$orderby,$param){
		try{
			$query = "SELECT idx, subject, reg_date, answer_dt, is_answer, gubun, contents, answer FROM tbl_qna WHERE ".$add_where." ORDER BY ".$orderby;
			$options = array(
				'results_per_page' =>'10',
				'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*'.$param,
				'db_handle'  => $this->_db,
				'class_ul'   => 'pagination',
				'class_dead_links'=>'mx-1 disabled',
				'class_live_links'=>'mx-1',
				'class_last_links'=>''
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
	
	public function deleteWishlist($m_no,$sno){
		$query = "DELETE FROM tbl_wishlist WHERE m_no=:m_no AND sno=:sno";
		$params = array(
			':m_no'=>$m_no,
			':sno'=>$sno
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
	}
	
	public function deleteWishlistGoodscode($m_no,$goods_code){
		$query = "DELETE FROM tbl_wishlist WHERE m_no=:m_no AND goods_code=:goods_code";
		$params = array(
			':m_no'=>$m_no,
			':goods_code'=>$goods_code
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
	}
	
	public function getCart($m_no,$goods_code){
		$query = "SELECT goods_code FROM tbl_cart WHERE m_no=:m_no AND goods_code=:goods_code";
		$params = array(
			':m_no'=>$m_no,
			':goods_code'=>$goods_code
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$result = $stmt->fetch();
		return $result['goods_code'];
	}
	
	public function setCart($m_no,$goods_code){
		$query = "INSERT INTO tbl_cart SET m_no=:m_no, goods_code=:goods_code, ea=:ea, is_order=:is_order, reg_date=NOW()";
		$params = array(
			':m_no'=>$m_no,
			':goods_code'=>$goods_code,
			':ea'=>'1',
			':is_order'=>'0'
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
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
		$query = "INSERT INTO tbl_order_log SET settle_no=:settle_no, ordno=:ordno, message=:message, reg_date=NOW()";
		$params=array(
			":settle_no"=>$settle_no,
			":ordno"=>$ordno,
			":message"=>$message
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
	}

	public function updateOrderitem($ordno,$status,$message){
		$query = "UPDATE tbl_order_item SET status=:status WHERE ordno=:ordno";
		$params=array(
			":status"=>$status,
			":ordno"=>$ordno
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);

		$query2 = "SELECT settle_no FROM tbl_order_item WHERE ordno=:ordno";
		$params2=array(
			":ordno"=>$ordno
		);
		$stmt = $this->_db->prepare($query2);
		$stmt->execute($params2);
		$data = $stmt->fetch();

		$this->setOrderLog($data['settle_no'],$ordno,$message);

		return "OK";
	}

	public function setCancelRequest($ordno,$m_no,$m_id){
		$query = "INSERT INTO tbl_order_cancel_request SET ordno=:ordno, m_no=:m_no, m_id=:m_id, reg_date=NOW()";
		$params=array(
			":ordno"=>$ordno,
			":m_no"=>$m_no,
			":m_id"=>$m_id
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
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
		$query = "UPDATE tbl_event_gift_member SET ordno=:ordno,asset_id=:asset_id,reserve_id=:reserve_id,reg_date=NOW(),status=:status WHERE idx=:idx";
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
	
	public function setOtp($m_id,$token,$certificationCode){
		try{
			$query = "SELECT * FROM tbl_otp WHERE m_id=:m_id";
			$params = array(
				':m_id'=>$m_id
			);
			$stmt = $this->_db->prepare($query);
			$stmt->execute($params);
			$data = $stmt->fetch();

			$now = time();

			if ($data['expire'] < date('Y-m-d H:i:s')) {
				$del_query = "DELETE FROM tbl_otp WHERE m_id=:m_id";
				$stmt = $this->_db->prepare($del_query);
				$stmt->execute($params);
					
				$query = "INSERT INTO tbl_otp SET m_id=:m_id,token=:tmp_token,otp=:certificationCode,auth=:auth,expire=DATE_ADD(NOW(), INTERVAL 1 HOUR)";
				$params = array(
					':m_id'=>$m_id,
					':tmp_token'=>$token,
					':certificationCode'=>$certificationCode,
					':auth'=>'0'
				);
				$stmt = $this->_db->prepare($query);
				$stmt->execute($params);
			}else{
				$query = "UPDATE tbl_otp SET otp=:certificationCode,expire=DATE_ADD(NOW(), INTERVAL 1 HOUR),auth=:auth,token=:tmp_token WHERE m_id = :m_id";
				$params = array(
					':certificationCode'=>$certificationCode,
					':auth'=>'0',
					':tmp_token'=>$token,
					':m_id'=>$m_id
				);
				$stmt = $this->_db->prepare($query);
				$stmt->execute($params);
			}
			return $certificationCode;
		}catch(paginationException $e){
			echo $e;
			exit();
		}
	}
	
	public function getOtp($m_id){
		$query = "SELECT * FROM tbl_otp WHERE m_id=:m_id";
		$params = array(
			':m_id'=>$m_id
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$result = $stmt->fetch();
		return $result;
	}

	public function updateOtp($m_id,$auth){
		$query = "UPDATE tbl_otp SET auth=:auth WHERE m_id = :m_id";
		$params = array(
			':auth'=>$auth,
			':m_id'=>$m_id
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
	}
	
	public function getMemberAddress($m_no){
		$query = "SELECT idx,name,zipcode,address,address_detail,phone,message,reg_date,m_no,m_id FROM tbl_member_address WHERE m_no=:m_no";
		$params = array(
			":m_no"=>$m_no
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$result = $stmt->fetch();
		return $result;
	}

	public function patchEncDataMember($m_id,$key,$encode_type){
		$id = $key.$m_id;
		if($encode_type=="base64"){
			$enc_data = substr(base64_encode($id),11,strlen(base64_encode($id))+1);
		}else{
			$enc_data = strtolower(md5($id));
		}
		//$enc_data = base64_encode($id);
		return $enc_data;
	}

	//클래스 소멸자
	public function __destruct() {
		$this->_db=null;
	}
}
?>