<?
class Promotion{
	private $_db;
	
	//클래스 생성자
	public function __construct(PDO $db){
		$this->_db = $db;
	}

	//프로모션 할인가격조회
	public function getPromotionGoodsPrice($product_code){
		$query = "select * from tbl_promotion_schedule where product_code=:product_code and confirm='Y' and promotion_start<=now() and promotion_end>=now()";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		return $data;
	}

	public function getPromotionGoodsPriceByProducts($product_codes){
		$arr = array();

		$i=0;
		foreach($product_codes as $product_code){
			$key = ':product_'.$i;
			$arr[] = $key;
			$params[$key] = $product_code;
			$i++;
		}

		$str = implode(',', $arr);

		$query = "SELECT * FROM tbl_promotion_schedule WHERE product_code IN (".$str.") and confirm='Y' and promotion_start<=now() and promotion_end>=now()";
		$stmt = $this->_db->prepare($query);

		$stmt->execute($params);
		$result = $stmt->fetchAll();

		return $result;
	}

	//진행중인 할인 프로모션 상품
	public function getPromotionIng($page,$add_where,$orderby,$param,$per_page){
		try{
			$query = "select a.steam_appid,a.product_code,a.product_name,a.product_name_en,a.release_date,c.sale_price as price,c.discount_rate ,a.consumer_price,a.status,a.goods_sku,a.game_type,a.display_type,a.publisher_code,a.product_platform,a.genre,c.promotion_start,c.promotion_end,a.is_bonus,a.delivery_type,a.domain,a.spoken_korean,a.interface_korean,a.exclusive_korean from tbl_goods_item a force index (product_code) inner join tbl_promotion_schedule c force index (ix_search_01) on c.product_code=a.product_code  where a.is_view='Y' and a.status='0' and c.promotion_start<=now() and c.promotion_end>=now() and c.discount_rate>'0' and c.confirm='Y' ".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>$per_page,
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

	public function getPromotionGoodsList($event_no){
		$query = "select a.goods_code,a.event_ea,a.sale_price,b.goods_nm,b.consumer_price,b.goods_simg,b.domain from tbl_event c inner join tbl_event_goods a on c.idx=a.event_no inner join tbl_goods b on a.goods_code=b.goods_code where c.idx=:event_no and c.end_dt>=now() and c.start_dt<now() and a.confirm='Y' order by b.open_date desc limit 12";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':event_no'=>$event_no
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();

		return $data;
	}
	
	//주말특가 프로모션 조회
	public function getPromotionWeekend(){
		$query = "select * from tbl_promotion_weekend where is_view='Y'";
		$stmt = $this->_db->prepare($query);

		$stmt->execute();
		$data = $stmt->fetch();

		return $data;
	}

	//주말특가 프로모션 노출 이벤트 현황
	public function getPromotionEventList($add_where){
		$query="select subject,contents,start_date,end_date,event_banner,event_link_url,event_link_target from tbl_event where is_view='Y' ".$add_where." and start_date<'".time()."' and end_date>'".time()."' order by end_date asc,start_date asc,-(idx) asc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		
		return $data;
	}
	
	//대규모 프로모션 조회
	public function getPromotionSeason(){
		$query = "select * from tbl_promotion_season where is_view='Y'";
		$stmt = $this->_db->prepare($query);

		$stmt->execute();
		$data = $stmt->fetch();

		return $data;
	}
	
	//대규모 프로모션 진행중인 기본게임 현황
	public function getPromotionSeasonGame($page,$add_where,$orderby,$param,$per_page){
		try{
			$query = "select a.steam_appid,a.product_code,a.product_name,a.product_name_en,a.release_date,c.sale_price as price,c.discount_rate ,a.consumer_price,a.status,a.goods_sku,a.game_type,a.display_type,a.publisher_code,a.product_platform,a.genre,c.promotion_start,c.promotion_end,a.is_bonus,a.delivery_type,a.domain,a.spoken_korean,a.interface_korean,a.exclusive_korean from tbl_goods_item a force index (product_code) inner join tbl_promotion_schedule c force index (ix_search_01) on c.product_code=a.product_code  where a.is_view='Y' and a.status='0' and c.discount_rate>'0' and c.confirm='Y' ".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>$per_page,
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

	public function getAddrepayGoods($product_codes){
		$arr = array();

		$i=0;
		foreach($product_codes as $product_code){
			$key = ':product_'.$i;
			$arr[] = $key;
			$params[$key] = $product_code;
			$i++;
		}

		$str = implode(',', $arr);

		$query = "SELECT product_code, start_dt, end_dt, repay_flag, repay_type, repay_point FROM tbl_add_repay WHERE product_code IN (".$str.") and repay_flag='Y' and start_dt<=now() and end_dt>=now()";
		$stmt = $this->_db->prepare($query);

		$stmt->execute($params);
		$result = $stmt->fetchAll();

		return $result;
	}
	
	public function getPromotionGroupList(){
		$now=strtotime(date("Y-m-d H:i:s"));
		$query = "SELECT idx, subject, start_date, end_date, use_flag FROM tbl_group WHERE use_flag='Y' AND start_date<=:now AND end_date>=:now";
		$stmt = $this->_db->prepare($query);
		$params=array(
			":now"=>$now
		);

		$stmt->execute($params);
		$result = $stmt->fetchAll();

		return $result;
	}

	//수정중
	public function getPromotionSeasonGame2($page,$add_where,$orderby,$param,$per_page){
		try{
			$query = "select a.steam_appid,a.product_code,a.product_name,a.product_name_en,a.release_date,c.sale_price AS price,c.discount_rate,c.discount_rate AS discount,a.consumer_price,a.status,a.goods_sku,a.game_type,a.display_type,a.bundle_type,a.genre,a.category,a.product_platform,a.preorder_start,a.preorder_end,a.spoken_korean,a.interface_korean,a.exclusive_korean,a.subtitle_korean,a.is_bonus,a.is_preorder,a.delivery_type,a.domain,a.is_naverpay_coupon,a.soldout
			from tbl_goods_item a force index (product_code)
			inner join tbl_promotion_schedule c force index (ix_search_01) on c.product_code=a.product_code

			where a.is_view='Y' and a.status='0' AND discount_rate>'0' ".$add_where." order by ".$orderby;
			

			$options = array(
				'results_per_page' =>$per_page,
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

	//클래스 소멸자
	public function __destruct() {
		$this->_db=null;
	}
}
?>