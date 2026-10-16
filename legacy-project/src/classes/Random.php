<?
class Random{
	private $_db;

	//클래스 생성자
	public function __construct(){
		$this->_db = new DB;
		$this->_asset = new Asset;
	}

	public function weighted_random($weights) {
		$r = mt_rand(1, array_sum($weights));
		for($i=0; $i<count($weights); $i++) {
			$r -= $weights[$i];
			if($r < 1) return $i;
		}
		return false;
	}

	public function getGoodsRandom($random_array,$goods_code,$m_id,$ordno){
		$values = array();
		$weights = array();

		//print_r($random_array);

		foreach($random_array as $key=>$value){
			array_push($values,$value['asset_id']);
			array_push($weights,$value['weight']);
		}

		//print_r($weights);
		
		
		$random_idx = $this->getGoodsRandomReserve($weights,$values,$goods_code,$m_id,$ordno);
		
		return $random_idx;
	}

	public function getGoodsRandomReserve($weights,$values,$goods_code,$m_id,$ordno){

		$index = $this->weighted_random($weights);
		$asset_id = $values[$index];

		$query = "SELECT idx,asset_id FROM tbl_goods_random where goods_code='$goods_code' and m_id is null and asset_id='".$asset_id."' ORDER BY RAND() LIMIT 1";
		$result= $this->_db->query($query);
		$data = $this->_db->fetch($result);

		if($data['idx']){
			$random_idx = $data['asset_id'];

			$u_query="update tbl_goods_random set m_id='$m_id',ordno='$ordno',reg_date=now() where idx='".$data['idx']."'";
			$this->_db->query($u_query);
		}else{
			$stock_chk = $this->goodsRandomStockChk($goods_code);
			if($stock_chk){
				$random_idx = $this->getGoodsRandomReserve($weights,$values,$goods_code,$m_id,$ordno);
			}else{
				$isDBOK = false;
				echo "판매종료";
				exit;
			}
		}

		return $random_idx;
	}

	//랜덤박스 재고체크
	public function goodsRandomStockChk($goods_code){
		$query = "SELECT count(*) FROM tbl_goods_random where goods_code='$goods_code' and m_id is null";
		$result= $this->_db->query($query);
		$data = $this->_db->fetch($result);

		if($data[0]==0){
			$is_stock = false;
		}else{
			$is_stock = true;
		}
		
		return $is_stock;
	}

	public function generateRandombox($goods_code,$random_set){
		$result = array();
		$list = array();
		foreach($random_set as $key=>$value){
			//echo $value['asset_id']."<br/>";
			for($i=0;$i<$value['stock'];$i++){
				array_push($result,$value['asset_id']);
			}
		}
		//랜덤으로 섞음.
		shuffle($result);
		foreach($result as $value){
			$query = $this->_db->_query_print("INSERT INTO tbl_randombox (product_code, stat, asset_id) VALUES ([s], 'U', [s])",$goods_code,$value);
			$this->_db->query($query);
			echo $query."<br/>";
		}
		return $result;
	}

	//랜덤박스 주문처리
	
	public function orderRandombox($m_no,$m_id,$product_code,$ordno){

		while(true){
			$query = $this->_db->_query_print("update tbl_randombox set m_no=[s], ordno=[s], upd_dt=current_timestamp, stat='A' WHERE product_code=[s] AND stat='U' order by srl limit 1",$m_no,$ordno,$product_code);
			
			$result = $this->_db->query($query);
			
			if(!$result){
				throw	new Exception('동일한 주문번호로 시도할 수 없습니다.');
			}

			if($this->_db->affected()==0){
				return	-1; //재고없음
			}

			$query2 = $this->_db->_query_print("SELECT asset_id FROM tbl_randombox WHERE ordno=[s]",$ordno);
			$result2 = $this->_db->query($query2);
			$data2 = $this->_db->fetch($result2);

			$asset_id = $data2['asset_id'];

			$asset_result = $this->_asset->runReserveTest($ordno,$asset_id,$m_id);

			if($asset_result<>"error"){
				return $asset_result;
			}

			$query3 = $this->_db->_query_print("UPDATE tbl_randombox SET m_no=null, ordno=null, upd_dt=current_timestamp, stat='S' WHERE ordno=[s]",$ordno);
			//$this->_db->query($query3);
		}
	}

		//클래스 소멸자
	public function __destruct() {
	}
}
?>