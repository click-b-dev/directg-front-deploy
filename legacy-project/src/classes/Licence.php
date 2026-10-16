<?
class Licence{
	private $_db;

	//클래스 생성자
	public function __construct(PDO $db){
		$this->_db = $db;
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
	
	public function getOrderItem($ordno){
		$query = "SELECT status,provider,settle_no,is_lic_actv,product_code,reserve_id,asset_id FROM tbl_order_item WHERE ordno=:ordno";
		$params = array(
			':ordno'=>$ordno
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$result = $stmt->fetch();
		return $result;
	}
	
	public function getOrderGift($goods_code){
		$query = "SELECT gift_nm, gift_yn, period_limit, start_dt, end_dt, receive_type, sku FROM tbl_goods_gift WHERE goods_code = :goods_code";
		$params = array(
			':goods_code'=>$goods_code
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$result = $stmt->fetch();
		return $result;
	}
	
	public function setOrderGift($ordno,$gift_nm,$m_id,$m_no,$sku,$orderId,$status,$fulfilmentStatus){
		$query = "INSERT into tbl_order_gift SET ordno=:ordno, gift_nm=:gift_nm, reg_date=NOW(), m_id=:m_id, m_no=:m_no, sku=:sku, orderId=:orderId, status=:status, fulfilmentStatus=:fulfilmentStatus";
		$params=array(
			":ordno"=>$ordno,
			":gift_nm"=>$gift_nm,
			":m_id"=>$m_id,
			":m_no"=>$m_no,
			":sku"=>$sku,
			":orderId"=>$orderId,
			":status"=>$status,
			":fulfilmentStatus"=>$fulfilmentStatus
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
	}

	public function updateOrderGift($status,$active_dt,$fulfilmentStatus,$orderId){
		$query = "UPDATE tbl_order_gift SET status=:status, active_dt=:active_dt, fulfilmentStatus=:fulfilmentStatus WHERE orderId=:orderId";
		$params=array(
			":status"=>$status,
			":active_dt"=>$active_dt,
			":fulfilmentStatus"=>$fulfilmentStatus,
			":orderId"=>$orderId
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
	}

	public function updateOrderGiftActive($ordno){
		$query = "UPDATE tbl_order_gift SET active_dt=NOW() WHERE ordno=:ordno";
		$params=array(
			":ordno"=>$ordno
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
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
	
	public function updateLicence($ordno,$lic_actv='1'){
		$query = "UPDATE tbl_order_item SET is_lic_actv=:lic_actv WHERE ordno=:ordno";
		$params = array(
			':ordno'=>$ordno,
			':lic_actv'=>$lic_actv
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
	}
	
	public function updateOrderItem($ordno,$lic_actv='1'){
		$query = "UPDATE tbl_order_item SET is_actv=:lic_actv,completion_date=now() WHERE ordno=:ordno";
		$params = array(
			':ordno'=>$ordno,
			':lic_actv'=>$lic_actv
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
	}
	
	public function getOrderBundleItem($ordno){
		$query = "SELECT reserve_id,asset_id,item_nm FROM tbl_order_bundle_item WHERE ordno=:ordno";
		$params = array(
			':ordno'=>$ordno
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$result = $stmt->fetchAll();
		return $result;
	}
	
	public function setOrderLog($settle_no,$ordno,$message){
		$query = "INSERT INTO tbl_order_log SET settle_no=:settle_no,ordno=:ordno,message=:message,reg_date=NOW()";
		$params = array(
			':settle_no'=>$settle_no,
			':ordno'=>$ordno,
			':message'=>$message
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
	}
	

	public function getOrderItemRepay($ordno){
		$query = "SELECT repay FROM tbl_order_item WHERE ordno=:ordno";
		$params = array(
			':ordno'=>$ordno
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$result = $stmt->fetch();
		$repay = $result['repay'];

		return $repay;
	}
	
	public function getGenbaLog($ordno){
		$query = "SELECT Sku,price,goods_ppr FROM genba_order_log WHERE ordno=:ordno";
		$params = array(
			':ordno'=>$ordno
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$result = $stmt->fetch();
		return $result;
	}
	
	public function getOrderGenba($ordno){
		$query = "SELECT ID,State FROM tbl_order_item_genba WHERE ordno=:ordno";
		$params = array(
			':ordno'=>$ordno
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$result = $stmt->fetch();
		return $result;
	}
	
	public function ReservationIDsetOrderGenba($ordno,$ClientTransactionID,$Sku,$Created,$Expiration,$State,$CommunicatedBuyingPrice,$ActualBuyingPrice,$NetAmount,$GrossAmount,$ReservationID,$ID=NULL){
		$query = "insert into tbl_order_item_genba set ordno=:ordno,ClientTransactionID=:ClientTransactionID,Sku=:Sku,Created=:Created,Expiration=:Expiration,State=:State,CommunicatedBuyingPrice=:CommunicatedBuyingPrice,ActualBuyingPrice=:ActualBuyingPrice,NetAmount=:NetAmount,GrossAmount=:GrossAmount,ReservationID=:ReservationID,ID=:ID";
		$params = array(
			':ordno'=> $ordno,
			':ClientTransactionID'=> $ClientTransactionID,
			':Sku' =>$Sku,
			':Created' =>$Created,
			':Expiration' =>$Expiration,
			':State' =>$State,
			':CommunicatedBuyingPrice' =>$CommunicatedBuyingPrice,
			':ActualBuyingPrice' =>$ActualBuyingPrice,
			':NetAmount' =>$NetAmount,
			':GrossAmount' =>$GrossAmount,
			':ReservationID' =>$ReservationID,
			':ID' =>$ID
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
	}
	
	public function updateOrderGenba($State,$ID,$ordno){
		$query = "UPDATE tbl_order_item_genba SET State=:State,ID=:ID WHERE ordno=:ordno";
		$params = array(
			':State'=>$State,
			':ID'=>$ID,
			':ordno'=>$ordno
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
	}
	
	
	
	public function getVaultnLog($ordno){
		$query = "SELECT Sku,price,goods_ppr FROM vaultn_order_log WHERE ordno=:ordno";
		$params = array(
			':ordno'=>$ordno
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$result = $stmt->fetch();
		return $result;
	}
	
	public function getOrderVaultn($ordno){
		$query = "select orderId,status,fulfilmentStatus from tbl_order_item_vaultn where clientOrderReference=:clientOrderReference";
		$params = array(
			':clientOrderReference'=>$ordno
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$result = $stmt->fetch();
		return $result;
	}
	
	public function updateOrderVaultn($status,$update_date,$fulfilmentStatus,$orderId){
		$query = "UPDATE tbl_order_item_vaultn SET status=:status, update_date=:update_date, fulfilmentStatus=:fulfilmentStatus WHERE orderId=:orderId";
		$params = array(
			':status'=>$status,
			':update_date'=>$update_date,
			':fulfilmentStatus'=>$fulfilmentStatus,
			':orderId'=>$orderId
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
	}
	
	public function setOrderVaultn($data){
		$query = "INSERT into tbl_order_item_vaultn SET ";
		$query_arr=array();
		$params=array();

		foreach($data as $key=>$value){
			if(gettype($value)=="object"){
				foreach($value as $key2=>$value2){
					if(gettype($value2)=="object"){
						foreach($value2 as $key3=>$value3){
							array_push($query_arr, "{$key3}=:{$key3}");
							$params[":".$key3]=$value3;
						}
					} else if(gettype($value2)=="array"){
						if($key2=="orderItemContent"){
							array_push($query_arr, "keycode=NULL");
						}
					} else {
						array_push($query_arr, "{$key2}=:{$key2}");
						$params[":".$key2]=$value2;
					}
				}
			} else {
				array_push($query_arr, "{$key}=:{$key}");
				$params[":".$key]=$value;
			}
		}

		array_push($query_arr, "reg_date=now()");
		$query .= implode(",", $query_arr);

		$stmt = $conn->prepare($query);
		$stmt->execute($params);
	}
	

	public function getOrderItemInfo($ordno){
		$query = "SELECT a.product_code,a.product_nm,b.goods_nm_en FROM tbl_order_item a INNER JOIN tbl_goods b ON a.product_code=b.goods_code WHERE a.ordno=:ordno";
		$params = array(
			':ordno'=>$ordno
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$result = $stmt->fetch();
		return $result;
	}
	
	public function updateEventGiftMember($reserve_id, $active_dt){
		$query = "UPDATE tbl_event_gift_member SET active_dt=:active_dt WHERE reserve_id=:reserve_id";
		$params = array(
			':active_dt'=>$active_dt,
			':reserve_id'=>$reserve_id
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
	}
	

	public function checkEmoney($m_no,$emoney_type,$value,$type){
		switch($type){
			case "ordno":
				$chk_query = "SELECT COUNT(*) FROM directgames.tbl_emoney_log WHERE ordno=:ordno AND emoney_type=:emoney_type";
				$chk_params = array(
					':ordno'=>$value,
					':emoney_type'=>$emoney_type
				);
			break;
			case "settle_no":
				$chk_query = "SELECT COUNT(*) FROM directgames.tbl_emoney_log WHERE settle_no=:settle_no AND emoney_type=:emoney_type";
				$chk_params = array(
					':settle_no'=>$value,
					':emoney_type'=>$emoney_type
				);
			break;
		}
		$stmt = $this->_db->prepare($chk_query);
		$stmt->execute($chk_params);
		$chk = $stmt->fetch();

		return $chk[0];
	}

	public function setEmoney($m_no,$emoney_type,$emoney,$memo,$value,$type){
		$chk = $this->checkEmoney($m_no,$emoney_type,$value,$type);
		if($chk==0 && $emoney>0){
			switch($type){
				case "ordno":
					$query = "INSERT INTO directgames.tbl_emoney_log SET m_no=:m_no,ordno=:ordno,emoney=:emoney,regdt=NOW(),memo=:memo,emoney_type=:emoney_type,amt_delta=:amt_delta";
					$amt_delta=$emoney_type.$emoney;
					$params = array(
						':m_no'=>$m_no,
						':ordno'=>$value,
						':emoney'=>$emoney,
						':memo'=>$memo,
						':emoney_type'=>$emoney_type,
						':amt_delta'=>$emoney,
					);
				break;
				case "settle_no":
					$query = "INSERT INTO directgames.tbl_emoney_log SET m_no=:m_no,settle_no=:settle_no,emoney=:emoney,regdt=NOW(),memo=:memo,emoney_type=:emoney_type,amt_delta=:amt_delta";
					$amt_delta=$emoney_type.$emoney;
					$params = array(
						':m_no'=>$m_no,
						':settle_no'=>$value,
						':emoney'=>$emoney,
						':memo'=>$memo,
						':emoney_type'=>$emoney_type,
						':amt_delta'=>$emoney,
					);
				break;
			}
			$stmt = $this->_db->prepare($query);
			$result = $stmt->execute($params);
			return $result;
		}
	}
	public function ss(){
		echo "ASDF";
	}

	public function setOrderEmoney($ordno,$m_no,$repay){
		$emoney_type = '+';
		$memo = '주문완료 적립';
		//$emoney = $this->getOrderItemRepay($ordno);
		
		$this->setEmoney($m_no,$emoney_type,$repay,$memo,$ordno,'ordno');
	}

	public function setRandomBoxEmoney($m_no,$point,$memo,$ordno){
		$emoney_type = '+';
		$memo = '랜덤박스 구매보상';
		$result = $this->setEmoney($m_no,$emoney_type,$point,$memo,$ordno,'ordno');

		if($result){
			return "ok";
		}else{
			return "error";
		}
	}

	//클래스 소멸자
	public function __destruct() {
		$this->_db=null;
	}
}
?>