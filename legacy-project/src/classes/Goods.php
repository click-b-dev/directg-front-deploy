<?
class Goods extends Pagination{
	private $_db;
	private $promotion;
	
	//클래스 생성자
	public function __construct(PDO $conn){
		$this->_db = $conn;
		$this->promotion = new Promotion($conn);
	}

	//플랫폼별 옵션상품수
	public function getPlatformGoodsItemCount(){
		$query = "select product_platform,count(*)as cc from tbl_goods_item where status='0' and is_view='Y' and find_in_set(game_type,'game,dlc,music') group by product_platform order by count(*) desc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();

		return $data;
	}

	//장르별 옵션상품수
	public function getGenreGoodsItemCount(){
		$query = "select t.genre,count(*)as cc from (
		select
		   product_code,SUBSTRING_INDEX(SUBSTRING_INDEX(tbl_goods_item.genre,',',numbers.n),',',-1)as genre,numbers.n
		from
		   (select  1 n
			union  all  select 2
			union  all  select  3
			union  all  select  4
			union  all  select  5
			union  all  select  6
			 ) numbers INNER  JOIN tbl_goods_item
			on CHAR_LENGTH ( tbl_goods_item.genre ) - CHAR_LENGTH(replace(tbl_goods_item.genre, ',', ''))>=numbers.n-1
		WHERE tbl_goods_item.status='0'  and tbl_goods_item.is_view='Y' and find_in_set(tbl_goods_item.game_type,'game,dlc,music') 
		)as t
		group by t.genre having t.genre<>''  order by count(*) desc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();

		return $data;
	}
	
	//카테고리별 옵션상품수
	public function getCategoryGoodsItemCount(){
		$query = "select t.category,count(*)as cc from (
		select
		   product_code,SUBSTRING_INDEX(SUBSTRING_INDEX(tbl_goods_item.category,',',numbers.n),',',-1)as category,numbers.n
		from
		   (select  1 n
			union  all  select 2
			union  all  select  3
			union  all  select  4
			union  all  select  5
			union  all  select  6
			union  all  select  7
			 ) numbers INNER  JOIN tbl_goods_item
			on CHAR_LENGTH ( tbl_goods_item.category ) - CHAR_LENGTH(replace(tbl_goods_item.category, ',', ''))>=numbers.n-1
		WHERE tbl_goods_item.status='0'  and tbl_goods_item.is_view='Y' and find_in_set(tbl_goods_item.game_type,'game,dlc,music') 
		)as t
		group by t.category order by count(*) desc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();

		return $data;
	}

	//대표상품정보 조회
	public function getTitleInfo($title_id){
		$query = "select title_id,title_name,title_name_en,release_date,developer,game_rate,age_limit,publisher,publisher_code,steam_appid,is_view,interface_korean,spoken_korean,tags,coming_soon,coming_soon_date from tbl_goods where title_id=:title_id";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':title_id'=>$title_id
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		return $data;
	}

	//대표상품정보 조회[SKU방식]
	public function getTitleInfoSku($product_id){
		$query = "select title_id,title_name,title_name_en,release_date,developer,game_rate,age_limit,publisher,publisher_code,steam_appid,is_view,interface_korean,spoken_korean,exclusive_korean,tags,coming_soon,coming_soon_date,genre,category,drm_notice,ext_user_account_notice,domain,sku from tbl_goods where sku=:sku";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':sku'=>$product_id
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		return $data;
	}

	public function setTitleHit($product_id,$ip){
		if($ip<>'112.216.231.146'){
			$query = "update tbl_goods set hit=(hit+1)where sku=:sku";
			$stmt = $this->_db->prepare($query);
			$params = array(
				':sku'=>$product_id
			);
			$stmt->execute($params);
			
			$query = "insert into tbl_title_view_log set title_sku=:title_sku,view_date=:view_date,hit='1' ON DUPLICATE KEY UPDATE hit=(hit+1)";
			$stmt = $this->_db->prepare($query);
			$params = array(
				':title_sku'=>$product_id,
				':view_date'=>date('Y-m-d')
			);
			$stmt->execute($params);
		}
	}

	//대표상품 플랫폼종류
	public function getTitlePlatform($title_id){
		$query = "select
		case c.product_platform 
		when '1' then 'Steam' 
		when '34' then 'Epic'
		when '35' then 'Rockstar Games Launcher'
		when '30' then 'Ubisoft Connect'
		end as platform_label,c.product_platform
		from tbl_title_option b inner join tbl_goods_item c on c.product_code=b.product_code where b.title_id=:title_id and c.status='0' group by c.product_platform ";
		//echo $query;
		$stmt = $this->_db->prepare($query);
		$params = array(
			':title_id'=>$title_id
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();

		return $data;
	}

	//옵션상품 대표상품
	public function getGoodsOptionTitleInfo($product_code){
		$query = "select b.title_id,b.title_name,b.publisher,b.developer,b.sku,b.genre,b.release_date,b.domain from tbl_title_option a inner join tbl_goods b on a.title_id=b.title_id where a.product_code=:product_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}
	
	public function getGoodsOptionTitleInfoByProducts($product_codes){
		$arr = array();

		$i=0;
		foreach($product_codes as $product_code){
			$key = ':product_'.$i;
			$arr[] = $key;
			$params[$key] = $product_code;
			$i++;
		}

		$str = implode(',', $arr);

		$query = "SELECT a.product_code,b.title_id,b.title_name,b.publisher,b.developer,b.sku,b.genre,b.release_date,b.domain FROM tbl_title_option a INNER JOIN tbl_goods b ON a.title_id=b.title_id WHERE a.product_code IN (".$str.")";

		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$result = $stmt->fetchAll();

		return $result;
	}

	//DLC구성 리스트 
	public function getGoodsDLCList($title_id){
		$query="select b.* from tbl_goods_dlc a inner join tbl_goods_item b on a.product_code=b.product_code where a.title_id=:title_id and FIND_IN_SET(b.status,'0,9,2') order by b.price desc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			":title_id"=>$title_id
		);
		$stmt->execute($params);
		$goods_dlc_data = $stmt->fetchAll();

		return $goods_dlc_data;
	}

	//특전구성 리스트
	public function getGoodsItemSpecialList($product_code){
		$query="select b.* from tbl_goods_item_special a inner join tbl_special_info b on a.special_info_no=b.idx where a.product_code=:product_code order by b.idx desc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			":product_code"=>$product_code
		);
		$stmt->execute($params);
		$goods_special_data = $stmt->fetchAll();

		return $goods_special_data;
	}

	//예약판매 진행여부 확인
	public function goodsPreOrderChk($goods_code){
		$goods_info = array();
		$data = array();
		
	}

	//상품정보조회
	public function getGoodsItemDetail($product_code){
		$goods_info = array();
		$data = array();

		$query = "select goods_sku,product_code,product_name,product_name_en,packageid,release_date,product_platform,consumer_price,price,discount,status,bundleid,is_bonus,is_view,is_free,steam_appid,spoken_korean,interface_korean,exclusive_korean,display_type,game_type,bundle_type,option_type,soldout,is_naverpay_coupon,delivery_type,genre,category,tag,delivery_date,is_preorder,domain,supplier_code,publisher from tbl_goods_item where product_code=:product_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		
		$promotion_data =$this->promotion->getPromotionGoodsPrice($product_code);

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
		$goods_info['is_naverpay_coupon'] = $data['is_naverpay_coupon'];
		
		$goods_info['genre'] = $data['genre'];
		$goods_info['category'] = $data['category'];
		$goods_info['tag'] = $data['tag'];
		$goods_info['domain'] = $data['domain'];
		$goods_info['publisher'] = $data['publisher'];
		$goods_info['publisher_name'] = $this->getPublisher($data['supplier_code']);
		$goods_info['promotion']=$promotion_data;

		return $goods_info;
	}

	//상품정보조회
	public function getGoodsItemDetailSku($sku){
		$goods_info = array();
		$data = array();
		$promotion_data = array();

		$query = "select goods_sku,product_code,product_name,product_name_en,packageid,release_date,product_platform,consumer_price,price,discount,status,bundleid,is_bonus,is_view,is_free,steam_appid,spoken_korean,interface_korean,exclusive_korean,display_type,game_type,option_type,soldout,delivery_type,delivery_date,genre,category,tag,age_limit,game_rate,model_code,model_name,is_preorder,domain,developer,publisher,is_package_view,is_auth from tbl_goods_item where goods_sku=:goods_sku";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':goods_sku'=>$sku
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		
		$promotion_data =$this->promotion->getPromotionGoodsPrice($data['product_code']);
		
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
		$goods_info['game_rate'] = $data['game_rate'];
		$goods_info['age_limit'] = $data['age_limit'];
		$goods_info['model_code'] = $data['model_code'];
		$goods_info['model_name'] = $data['model_name'];
		$goods_info['domain'] = $data['domain'];
		$goods_info['developer'] = $data['developer'];
		$goods_info['publisher'] = $data['publisher'];
		$goods_info['is_package_view'] = $data['is_package_view'];
		$goods_info['is_auth'] = $data['is_auth']; //본인인증 필수 상품 여부(Y/N)
		$goods_info['tag'] = $data['tag'];
		$goods_info['promotion']=$promotion_data;

		return $goods_info;
	}
	//dlc의 관련기본게임정보
	public function getTitleDetail($product_code){
		$title_info = array();
		$data = array();

		$query = "select b.title_id,b.title_name,b.sku as product_id,b.is_view,b.publisher,b.developer,b.age_limit,b.game_rate,b.genre,b.category from tbl_title_option a inner join tbl_goods b on a.title_id=b.title_id where a.product_code=:product_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		$title_info['title_id'] = $data['title_id'];
		$title_info['title_name'] = $data['title_name'];
		$title_info['product_id'] = $data['product_id'];
		$title_info['is_view'] = $data['is_view'];
		$title_info['publisher'] = $data['publisher'];
		$title_info['developer'] = $data['developer'];
		$title_info['genre'] = $data['genre'];
		$title_info['category'] = $data['category'];
		$title_info['age_limit'] = $data['age_limit'];
		$title_info['game_rate'] = $data['game_rate'];

		return $title_info;
	}


	//장르별 타이틀 조회
	public function getGoodsGenreList($page,$add_where,$orderby,$param){
		try{
			$query = "select a.steam_appid,a.product_code,a.product_name,a.product_name_en,date_format(a.release_date,'%Y-%m-%d')as release_date,a.price,a.discount,a.consumer_price,a.status,a.goods_sku,a.game_type,a.display_type,a.publisher_code,a.genre,a.category,a.product_platform,a.preorder_start,a.preorder_end,a.spoken_korean,a.interface_korean,a.exclusive_korean,a.is_bonus,a.delivery_type,a.domain,a.is_preorder from tbl_goods_item a where a.is_view='Y' and a.status='0'".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>'60',
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
	
	//카테고리별 조회
	public function getGoodsCategoryList($page,$add_where,$orderby,$param){
		try{
			$query = "select a.steam_appid,a.product_code,a.product_name,a.product_name_en,date_format(a.release_date,'%Y-%m-%d')as release_date,a.price,a.discount,a.consumer_price,a.status,a.goods_sku,a.game_type,a.display_type,a.publisher_code,a.genre,a.category,a.product_platform,a.preorder_start,a.preorder_end,a.spoken_korean,a.interface_korean,a.exclusive_korean,a.is_bonus,a.delivery_type,a.domain,a.is_preorder from tbl_goods_item a where a.is_view='Y' and a.status='0'".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>'60',
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

	//플랫폼별 타이틀 조회
	public function getGoodsPlatformList($page,$add_where,$orderby,$param){
		try{
			$query = "select a.steam_appid,a.product_code,a.product_name,a.product_name_en,a.release_date,a.price,a.discount,a.consumer_price,a.status,a.goods_sku,a.game_type,a.publisher_code,a.genre,a.category,a.product_platform,a.preorder_start,a.preorder_end,a.display_type,a.delivery_type,a.domain,a.spoken_korean,a.interface_korean,a.exclusive_korean,a.is_preorder,a.is_naverpay_coupon from tbl_goods_item a where a.is_view='Y' and a.status='0'".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>'60',
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

	//퍼블리셔별 타이틀 조회
	public function getGoodsPublisherList($publisher_code){
		$query = "select title_id,title_name,publisher_code,release_date from tbl_goods where is_view='Y' and publisher_code=:publisher_code order by release_date desc,reg_date desc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':publisher_code'=>$publisher_code
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();

		return $data;

	}

	//퍼블리셔별 옵션상품조회

	//퍼블리셔별 진행중인 프로모션 상품조회
	public function getPublisherPromotionIng($publisher_code){
		$query = "select b.publisher_code,a.promotion_type,a.promotion_gubun,a.promotion_label,d.title_id,d.title_name,a.promotion_start,a.promotion_end,a.discount_rate from tbl_promotion_schedule a inner join tbl_goods_item b on a.product_code=b.product_code inner join tbl_goods_option c on c.product_code=b.product_code inner join tbl_goods d on d.title_id=c.title_id where a.promotion_start<=now() and a.promotion_end>=now() and b.publisher_code=:publisher_code group by c.title_id,a.promotion_start,a.promotion_end order by a.promotion_start desc,a.promotion_end desc,d.title_name desc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':publisher_code'=>$publisher_code
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();

		return $data;
	}

	public function getPromotionLabel($promotion_type,$promotion_gubun,$promotion_label,$publisher_code,$title_id,$promotion_start){
		$title_info = $this->getTitleInfo($title_id);

		switch($promotion_type){
			case "정규(대)":
				switch($promotion_gubun){
					case "1":case "2":
						$promotion_title = "[".$this->getPublisher($publisher_code)."] ".substr($promotion_start,0,4)." 봄맞이 ".$promotion_label;
					break;
					case "3":case "4":
						$promotion_title = "[".$this->getPublisher($publisher_code)."] ".substr($promotion_start,0,4)."  여름 ".$promotion_label;
					break;
					case "5":case "6":
						$promotion_title = "[".$this->getPublisher($publisher_code)."] ".substr($promotion_start,0,4)."  추석 ".$promotion_label;
					break;
					case "7":case "8":
						$promotion_title = "[".$this->getPublisher($publisher_code)."] ".substr($promotion_start,0,4)."  겨울 ".$promotion_label;
					break;
				}
				
			break;
			case "정규(중)":
				switch($promotion_gubun){
					case "9":
						$promotion_title = "[".$this->getPublisher($publisher_code)."] ".substr($promotion_start,0,4)."  설날 ".$promotion_label;
					break;
					case "10":
						$promotion_title = "[".$this->getPublisher($publisher_code)."] ".substr($promotion_start,0,4)."  ".$promotion_label;
					break;
					case "11":
						$promotion_title = "[".$this->getPublisher($publisher_code)."] ".substr($promotion_start,0,4)."  ".$promotion_label;
					break;
				}
			break;
			case "정규(소)":
				$promotion_title = "[".$this->getPublisher($publisher_code)."] ".$title_info['title_name']." 주말 ".$promotion_label;
			break;
			case "플래시":
				switch($promotion_gubun){
					case "20":
						$promotion_title = "[".$this->getPublisher($publisher_code)."] 플래시 ".$promotion_label;
					break;
					case "21":
						$promotion_title = "[".$this->getPublisher($publisher_code)."] [프랜차이즈명] ".$promotion_label;
					break;
					case "22":case "23":
						$promotion_title = "[".$this->getPublisher($publisher_code)."] ".$title_info['title_name']." ".$promotion_label;
					break;
				}
				
			break;
			case "신규":
				switch($promotion_gubun){
					case "16": case "17":
						$promotion_title = "[".$this->getPublisher($publisher_code)."] ".$title_info['title_name']." ".$promotion_label;
					break;
					case "18":
					//	$goods_item=$this->getGoodsItemInfo($product_code);
						$promotion_title = "[".$this->getPublisher($publisher_code)."] ".$goods_item['product_name']." ".$promotion_label;
					break;
					case "19":
						$promotion_title = "[".$this->getPublisher($publisher_code)."] ".$title_info['title_name']." ".$promotion_label;
					break;
				}
				
			break;
		}

		return $promotion_title;
	}

	//기본게임 DG판매가 조회
	public function  getBasicGamePrice($title_id){
		$query = "select b.consumer_price,b.price,b.discount,b.status from tbl_goods_option a inner join tbl_goods_item b on a.product_code=b.product_code where a.title_id=:title_id and b.product_type='1'";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':title_id'=>$title_id
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		return $data;
	}

	//플랫폼정보조회
	public function getPlatform($platform_code){
		switch($platform_code){
			case "1":
				$product_platform_label="Steam";
			break;
			case "3":
				$product_platform_label="Origin";
			break;
			case "34":
				$product_platform_label="Epic Games";
			break;
			case "30":
				$product_platform_label="Ubisoft Connect";
			break;
			case "35":
				$product_platform_label="Rockstar Games Launcher";
			break;
			case "33":
				$product_platform_label="Bethesda";
			break;
		}

		return $product_platform_label;
	}

	//게임유형조회
	public function getGameType($game_type){
		switch($game_type){
			case "game":
				$game_type_label="기본게임";
			break;
			case "dlc":
				$game_type_label="DLC";
			break;
			case "music":
				$game_type_label="Music";
			break;
		}

		return $game_type_label;
	}

	//퍼블리셔 정보조회
	public function getPublisher($publisher_code){
		$query = "select publisher_name from tbl_publisher where publisher_code=:publisher_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':publisher_code'=>$publisher_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		return $data['publisher_name'];
	}

	//개발사 정보조회
	/*
	public function getDeveloper($developer_code){
		$query = "select developer_name from tbl_developer where developer_code=:developer_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':developer_code'=>$developer_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		return $data['developer_name'];
	}
	*/

	public function getGoodsItemPrice($product_code){
		$query = "select a.sale_price,a.discount_rate,a.promotion_srp,a.p_discount_rate from tbl_promotion_schedule a inner join tbl_goods_item b on a.product_code=b.product_code where a.product_code=:product_code and a.promotion_start>=now() and a.promotion_end<now() and a.confirm='Y' order by b.open_date desc limit 1";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		return $data;
	}

	//장르정보 조회
	public function getGenreName($genre_idx){
		$query = "select idx,genre_name from tbl_genre where idx=:idx ";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':idx'=>$genre_idx
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data['genre_name'];
	}

	//스크린샷 조회
	public function getGoodsScreenShot($goods_code){
		$goods_screenshot_list = array();
		$list = array();

		$query = "select url,file_name,file_type,thumbnail,idx from tbl_goods_screenshot where goods_code=:goods_code order by sort IS NULL ASC, sort ASC, file_type !='media' ASC, idx ASC";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':goods_code'=>$goods_code
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();

		
		foreach($data as $key=> $value){
			if($value['file_type']=="media"){
				$list['screenShot'] = "<div class='ratio ratio-16x9'><iframe class='embed-responsive-item' src='".$value['url']."'></iframe></div>";
				$list['screenShot_thumbnail'] = $value['thumbnail'];
			}else{
				$list['screenShot'] = "<img src='https://directg.net/plugins/fileUpload/server/php/files/".$goods_code."/medium/".$value['file_name']."' style='max-width:900px;min-width:918px;'>";
				$list['screenShot_thumbnail'] = "https://directg.net/plugins/fileUpload/server/php/files/".$goods_code."/thumbnail/".$value['file_name'];
			}
			
			$list['file_type'] =$value['file_type'];
			$list['idx'] =$value['idx'];
			array_push($goods_screenshot_list,$list);
		}

		return $goods_screenshot_list;
	}

	//패키지 구성 리스트
	public function getGoodsOptionPackageList($product_code){
		$query = "select a.*,b.release_date,b.app_type,b.coming_soon from tbl_goods_item_package a inner join steam_game b on a.appid=b.steam_appid where a.product_code=:product_code order by a.item_type asc,b.release_date asc,b.app_type asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	//번글 구성 리스트 
	public function getGoodsOptionBundleList($product_code){
		$query = "select bndl_no,asset_name,asset_type,bundle_product_code from tbl_goods_item_bundle  where product_code=:product_code order by asset_name asc,asset_id asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	//패키지 구성 개별가격조회
	public function getGoodsOptionPackagePrice($item_type,$item_code){
		if($item_type=="1" || $item_type=="2"){
			$query = "select product_code,consumer_price,price,discount,release_date,status from tbl_goods_item where steam_appid=:steam_appid";
			$stmt = $this->_db->prepare($query);
			$params = array(
				':steam_appid'=>$item_code
			);
		}else{
			$query = "select product_code,consumer_price,price,discount,release_date,status from tbl_goods_item where product_code=:product_code";
			$stmt = $this->_db->prepare($query);
			$params = array(
				':product_code'=>$item_code
			);
		}
		
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}

	//상세정보 설명 html디코딩
	public function html_print2($str){
		$str = str_replace("&#60;","<",$str);
		$str = str_replace("&#62;",">",$str);
		$str = str_replace("&#34;",'"',$str);
		$str = str_replace("&#38;","&",$str);
		$str = str_replace("&amp;","&",$str);
		$str = str_replace("\"","",$str);
		$str = str_replace("&lt;","<",$str);
		$str = str_replace("&gt;",">",$str);
		
		return $str;
	}

	public function getGoodsOptionList($page,$add_where,$orderby,$param){
		try{
			$query = "select c.sku,c.title_id,c.title_name,c.release_date,c.steam_appid,a.publisher_code from tbl_goods_item a inner join tbl_goods_option b on a.product_code=b.product_code inner join tbl_goods c on c.title_id=b.title_id where a.is_view='Y' and c.is_view='Y' ".$add_where." group by b.title_id order by ".$orderby;

			$options = array(
				'results_per_page' =>'60',
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

	//예약구매 옵션상품목록
	public function getGoodsOptionPreOrder($page,$add_where,$orderby,$param){
		try{
			$query = "select * from tbl_goods where is_view='Y' and sales_status='S' and title_code='33' ".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>'30',
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
	
	//예약구매 옵션상품목록
	public function getGoodsOptionPreOrderM($page,$add_where,$orderby,$param){
		try{
			$query = "select * from tbl_goods where is_view='Y' and sales_status='S' and title_code='33' ".$add_where." order by ".$orderby;

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

	//대표상품 관련 game 리스트
	public function getTitleGameList($title_id,$product_platform){
		$query = "select b.* from tbl_title_option a inner join tbl_goods_item b on a.product_code=b.product_code where a.title_id=:title_id and b.product_platform=:product_platform and a.product_type='game' and b.status='0' order by b.product_platform asc,price asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':title_id'=>$title_id,
			':product_platform'=>$product_platform
		);

		$stmt->execute($params);
		$data = $stmt->fetchAll();
		
		return $data;
	}

	//대표상품 관련 에디션 리스트
	public function getTitleEditionList($title_id,$product_platform){
		$query = "select b.* from tbl_title_option a inner join tbl_goods_item b on a.product_code=b.product_code where a.title_id=:title_id and b.product_platform=:product_platform and b.status='0' and a.product_type='edition' order by b.product_platform asc,price asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':title_id'=>$title_id,
			':product_platform'=>$product_platform
		);

		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	//대표상품 관련 dlc 리스트
	public function getTitleDLCList($title_id,$product_platform){
		$query = "select b.* from tbl_title_option a inner join tbl_goods_item b on a.product_code=b.product_code where a.title_id=:title_id and b.product_platform=:product_platform and b.status='0' and b.game_type='dlc' and a.product_type='dlc' order by b.product_platform desc,b.release_date desc,b.price desc,b.product_name desc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':title_id'=>$title_id,
			':product_platform'=>$product_platform
		);

		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}
	
	//대표상품 관련 dlc번들 리스트
	public function getTitleDLCBundleList($title_id,$product_platform){
		$query = "select b.* from tbl_title_option a inner join tbl_goods_item b on a.product_code=b.product_code where a.title_id=:title_id and b.product_platform=:product_platform and b.status='0' and b.game_type='dlc' and b.bundle_type='4' order by b.product_platform desc,b.release_date desc,b.price desc,b.product_name desc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':title_id'=>$title_id,
			':product_platform'=>$product_platform
		);

		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}
	
	//대표상품 관련 기타 리스트
	public function getTitleEtcList($title_id){
		$query = "select b.* from tbl_title_option a inner join tbl_goods_item b on a.product_code=b.product_code where a.title_id=:title_id  and b.is_view='Y' and b.game_type='accessories' order by b.goods_sort asc,-(b.release_date) asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':title_id'=>$title_id,
		);

		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}
	
	//대표상품 관련 홀로모델 리스트
	public function getTitleHolomodelsList($title_id,$product_platform){
		$query = "select b.* from tbl_title_option a inner join tbl_goods_item b on a.product_code=b.product_code where a.title_id=:title_id and b.product_platform=:product_platform and a.product_type='holomodels' and b.display_type='holomodels' and b.status='0' order by b.product_platform asc,price asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':title_id'=>$title_id,
			':product_platform'=>$product_platform
		);

		$stmt->execute($params);
		$data = $stmt->fetchAll();
		
		return $data;
	}

	//대표상품 관련 홀로모델 에디션 리스트
	public function getTitleHolomodelsEditionList($title_id,$product_platform){
		$query = "select b.* from tbl_title_option a inner join tbl_goods_item b on a.product_code=b.product_code where a.title_id=:title_id and b.product_platform=:product_platform and b.status='0' and a.product_type='holomodelsedition' order by b.product_platform asc,price asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':title_id'=>$title_id,
			':product_platform'=>$product_platform
		);

		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	//대표상품 관련 dlc 리스트
	public function getTitleHolomodelsDLCList($title_id,$product_platform){
		$query = "select b.* from tbl_title_option a inner join tbl_goods_item b on a.product_code=b.product_code where a.title_id=:title_id and b.product_platform=:product_platform and b.status='0' and b.display_type='holomodelsdlc' and a.product_type='holomodels' order by b.product_platform desc,b.release_date desc,b.price desc,b.product_name desc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':title_id'=>$title_id,
			':product_platform'=>$product_platform
		);

		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}
	

	//게임목록
	public function getGoodsList($page,$add_where,$orderby,$param){
		try{
			$query = "select a.steam_appid,a.product_code,a.product_name,a.product_name_en,a.release_date,a.price,a.discount,a.consumer_price,a.status,a.goods_sku,a.game_type,a.display_type,a.bundle_type,a.genre,a.category,a.product_platform,a.preorder_start,a.preorder_end,a.spoken_korean,a.interface_korean,a.exclusive_korean,a.subtitle_korean,a.is_bonus,a.is_preorder,a.delivery_type,a.domain,a.is_naverpay_coupon,a.soldout
			
			from tbl_goods_item a where a.is_view='Y' and a.status='0' ".$add_where." order by ".$orderby;

			$count_query = "SELECT COUNT(*) from tbl_goods_item a where a.is_view='Y' and a.status='0' ".$add_where;

			$options = array(
				'results_per_page' =>'60',
				'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*'.$param,
				'db_handle'  => $this->_db,
				'text_prev'  => '<img src="/assets/images/icon/ep_arrow-left.svg">',
				'text_next'  => '<img src="/assets/images/icon/ep_arrow-right.svg">',
				'text_first' => '<img src="/assets/images/icon/d-arrow-left.svg">',
				'text_last'  => '<img src="/assets/images/icon/d-arrow-right.svg">',
				'class_dead_links' => 'd-none',
				'count_query' => $count_query
			);
			$pagination = new pagination($page, $query, $options);

			return $pagination;

		}catch(paginationException $e){
			echo $e;
			exit();
		}
	}

	//게임목록
	//프로모션 가격검색을 따로 할 필요 없음
	public function getGoodsList2($page,$add_where,$orderby,$param,$count=60,$keyword=""){
		try{
			if ($keyword) {
				$score_query = ", (MATCH(a.product_name, a.product_name_en, a.keyword) AGAINST('".$keyword."') + (CASE WHEN a.product_name LIKE '".$keyword."%' THEN 20 WHEN a.product_name LIKE '%".$keyword."%' THEN 10 ELSE 0 END)) as score";
			}

			$query = "select a.steam_appid,a.product_code,a.product_name,a.product_name_en,a.release_date,COALESCE(c.sale_price, a.price) AS price,COALESCE(c.discount_rate, a.discount) AS discount,a.consumer_price,a.status,a.goods_sku,a.game_type,a.display_type,a.bundle_type,a.genre,a.category,a.product_platform,a.preorder_start,a.preorder_end,a.spoken_korean,a.interface_korean,a.exclusive_korean,a.subtitle_korean,a.is_bonus,a.is_preorder,a.delivery_type,a.domain,a.is_naverpay_coupon,a.soldout,d.repay_type,d.repay_point".$score_query."
			
			from tbl_goods_item a 

			LEFT JOIN (
				SELECT product_code,sale_price,discount_rate,idx
				FROM tbl_promotion_schedule 
				WHERE promotion_start < NOW() AND promotion_end > NOW() AND confirm = 'Y'
			) c ON c.product_code = a.product_code

			LEFT JOIN (
				SELECT product_code,repay_type,repay_point
				FROM tbl_add_repay
				WHERE start_dt < NOW() AND end_dt > NOW() AND repay_flag = 'Y'
			) d ON d.product_code = a.product_code

			where a.is_view='Y' and a.status='0' ".$add_where." order by ".$orderby;
			

			$options = array(
				'results_per_page' =>$count,
				'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*'.$param,
				'db_handle'  => $this->_db,
				'text_prev'  => '<img src="/assets/images/icon/ep_arrow-left.svg">',
				'text_next'  => '<img src="/assets/images/icon/ep_arrow-right.svg">',
				'text_first' => '<img src="/assets/images/icon/d-arrow-left.svg">',
				'text_last'  => '<img src="/assets/images/icon/d-arrow-right.svg">',
				'class_dead_links' => 'd-none',
			);
			$pagination = new pagination($page, $query, $options);

			return $pagination;

		}catch(paginationException $e){
			echo $e;
			exit();
		}
	}
	
	//게임목록 (수정중)
	public function getGoodsList3($page,$add_where,$orderby,$param,$count=60,$keyword=""){
		try{
			if ($keyword) {
				$score_query = ", (MATCH(a.product_name, a.product_name_en, a.keyword) AGAINST('".$keyword."') + (CASE WHEN a.product_name LIKE '".$keyword."%' THEN 20 WHEN a.product_name LIKE '%".$keyword."%' THEN 10 ELSE 0 END)) as score";
			}

			$query = "select a.steam_appid,a.product_code,a.product_name,a.product_name_en,a.release_date,COALESCE(c.sale_price, a.price) AS price,COALESCE(c.discount_rate, a.discount) AS discount,a.consumer_price,a.status,a.goods_sku,a.game_type,a.display_type,a.bundle_type,a.genre,a.category,a.product_platform,a.preorder_start,a.preorder_end,a.spoken_korean,a.interface_korean,a.exclusive_korean,a.subtitle_korean,a.is_bonus,a.is_preorder,a.delivery_type,a.domain,a.is_naverpay_coupon,a.soldout,d.repay_type,d.repay_point".$score_query."
			
			from tbl_goods_item a 

			LEFT JOIN (
				SELECT product_code,sale_price,discount_rate,idx
				FROM tbl_promotion_schedule 
				WHERE promotion_start < NOW() AND promotion_end > NOW() AND confirm = 'Y'
			) c ON c.product_code = a.product_code

			LEFT JOIN (
				SELECT product_code,repay_type,repay_point
				FROM tbl_add_repay
				WHERE start_dt < NOW() AND end_dt > NOW() AND repay_flag = 'Y'
			) d ON d.product_code = a.product_code

			where a.is_view='Y' and a.status='0' ".$add_where." order by ".$orderby;
			

			$options = array(
				'results_per_page' =>$count,
				'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*'.$param,
				'db_handle'  => $this->_db,
				'text_prev'  => '<img src="/assets/images/icon/ep_arrow-left.svg">',
				'text_next'  => '<img src="/assets/images/icon/ep_arrow-right.svg">',
				'text_first' => '<img src="/assets/images/icon/d-arrow-left.svg">',
				'text_last'  => '<img src="/assets/images/icon/d-arrow-right.svg">',
				'class_dead_links' => 'd-none'
			);
			$pagination = new pagination($page, $query, $options);

			return $pagination;

		}catch(paginationException $e){
			echo $e;
			exit();
		}
	}

	//게임검색
	public function getGoodsSearch($page,$add_where,$orderby,$param,$is_bonus,$keyword){
		try{

				$query = "select a.steam_appid,a.product_code,a.product_name,a.product_name_en,a.release_date,a.price,a.discount,a.consumer_price,a.status,a.goods_sku,a.game_type,a.bundle_type,a.genre,a.category,a.product_platform,a.preorder_start,a.preorder_end,a.spoken_korean,a.interface_korean,a.exclusive_korean,a.exclusive_korean,a.display_type,a.is_preorder,a.is_bonus,a.delivery_type,a.domain,a.is_naverpay_coupon,a.soldout,MATCH (a.product_name, a.product_name_en,a.keyword) AGAINST ('".$keyword."*')as score
				
				from tbl_goods_item a where a.is_view='Y' and a.status='0' ".$add_where." order by ".$orderby;
			

			$options = array(
				'results_per_page' =>'60',
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

	//퍼블리셔 상품목록
	public function getPublisherGoodsSearch($page,$add_where,$orderby,$param,$is_bonus){
		try{
			$query = "select a.steam_appid,a.product_code,a.product_name,a.product_name_en,a.release_date,a.price,a.discount,a.consumer_price,a.status,a.goods_sku,a.game_type,a.bundle_type,a.genre,a.category,a.product_platform,a.preorder_start,a.preorder_end,a.spoken_korean,a.interface_korean,a.exclusive_korean,a.exclusive_korean,a.display_type,a.is_preorder,a.is_bonus,a.delivery_type,a.domain,a.is_naverpay_coupon from tbl_goods_item a where a.is_view='Y' and a.status='0' ".$add_where." order by ".$orderby;
			
			//echo $query;

			$options = array(
				'results_per_page' =>'60',
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
	
	public function getGroupGoodsSearch($page,$add_where,$orderby,$param){
		try{
			$query = "select a.steam_appid,a.product_code,a.product_name,a.product_name_en,a.release_date,a.price,a.discount,a.consumer_price,a.status,a.goods_sku,a.game_type,a.bundle_type,a.genre,a.category,a.product_platform,a.preorder_start,a.preorder_end,a.spoken_korean,a.interface_korean,a.exclusive_korean,a.exclusive_korean,a.display_type,a.is_preorder,a.is_bonus,a.delivery_type,a.domain,a.is_naverpay_coupon from tbl_goods_item a INNER JOIN tbl_group_item b ON a.product_code=b.product_code where a.is_view='Y' and a.status='0' ".$add_where." order by ".$orderby;
			
			//echo $query;

			$options = array(
				'results_per_page' =>'60',
				'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*'.$param,  
				'db_handle'  => $this->_db,
				'text_prev'  => '<img src="/assets/images/icon/ep_arrow-left.svg">',
				'text_next'  => '<img src="/assets/images/icon/ep_arrow-right.svg">',
				'text_first' => '<img src="/assets/images/icon/d-arrow-left.svg">',
				'text_last'  => '<img src="/assets/images/icon/d-arrow-right.svg">',
				'class_dead_links' => 'd-none'
			);
			$pagination = new pagination($page, $query, $options);

			return $pagination;

		}catch(paginationException $e){
			echo $e;
			exit();
		}
	}
	
	public function getGroupGoodsPromotionSearch($page,$add_where,$orderby,$param){
		try{
			$query = "select a.steam_appid,a.product_code,a.product_name,a.product_name_en,a.release_date,a.price,a.discount,a.consumer_price,a.status,a.goods_sku,a.game_type,a.bundle_type,a.genre,a.category,a.product_platform,a.preorder_start,a.preorder_end,a.spoken_korean,a.interface_korean,a.exclusive_korean,a.exclusive_korean,a.display_type,a.is_preorder,a.is_bonus,a.delivery_type,a.domain,a.is_naverpay_coupon,a.soldout from tbl_goods_item a INNER JOIN tbl_group_item b ON a.product_code=b.product_code 
			INNER JOIN tbl_promotion_schedule c ON a.product_code=c.product_code
			where a.is_view='Y' and a.status='0' and c.promotion_start<=now() and c.promotion_end>=now() and c.confirm='Y' ".$add_where." order by ".$orderby;
			
			//echo $query;

			$options = array(
				'results_per_page' =>'60',
				'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*'.$param,  
				'db_handle'  => $this->_db,
				'text_prev'  => '<img src="/assets/images/icon/ep_arrow-left.svg">',
				'text_next'  => '<img src="/assets/images/icon/ep_arrow-right.svg">',
				'text_first' => '<img src="/assets/images/icon/d-arrow-left.svg">',
				'text_last'  => '<img src="/assets/images/icon/d-arrow-right.svg">',
				'class_dead_links' => 'd-none'
			);
			$pagination = new pagination($page, $query, $options);

			return $pagination;

		}catch(paginationException $e){
			echo $e;
			exit();
		}
	}
		
	public function getGoodsGroupList($page,$add_where,$orderby,$param,$count=60){
		try{
			$query = "select a.steam_appid,a.product_code,a.product_name,a.product_name_en,a.release_date,COALESCE(c.sale_price, a.price) AS price,COALESCE(c.discount_rate, a.discount) AS discount,a.consumer_price,a.status,a.goods_sku,a.game_type,a.display_type,a.bundle_type,a.genre,a.category,a.product_platform,a.preorder_start,a.preorder_end,a.spoken_korean,a.interface_korean,a.exclusive_korean,a.subtitle_korean,a.is_bonus,a.is_preorder,a.delivery_type,a.domain,a.is_naverpay_coupon,a.soldout,d.repay_type,d.repay_point
			
			from tbl_goods_item a 
			INNER JOIN tbl_group_item b ON a.product_code=b.product_code

			LEFT JOIN (
				SELECT product_code,sale_price,discount_rate,idx
				FROM tbl_promotion_schedule 
				WHERE promotion_start < NOW() AND promotion_end > NOW() AND confirm = 'Y'
			) c ON c.product_code = a.product_code

			LEFT JOIN (
				SELECT product_code,repay_type,repay_point
				FROM tbl_add_repay
				WHERE start_dt < NOW() AND end_dt > NOW() AND repay_flag = 'Y'
			) d ON d.product_code = a.product_code

			where a.is_view='Y' and a.status='0' ".$add_where." order by ".$orderby;
			

			$options = array(
				'results_per_page' =>$count,
				'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*'.$param,
				'db_handle'  => $this->_db,
				'text_prev'  => '<img src="/assets/images/icon/ep_arrow-left.svg">',
				'text_next'  => '<img src="/assets/images/icon/ep_arrow-right.svg">',
				'text_first' => '<img src="/assets/images/icon/d-arrow-left.svg">',
				'text_last'  => '<img src="/assets/images/icon/d-arrow-right.svg">',
				'class_dead_links' => 'd-none'
			);
			$pagination = new pagination($page, $query, $options);

			return $pagination;

		}catch(paginationException $e){
			echo $e;
			exit();
		}
	}

	//진행중인 프로모션 상품 검색
	public function getGoodsPromotionSearch($page,$add_where,$orderby,$param,$keyword){
		try{
			$query = "select a.steam_appid,a.product_code,a.product_name,a.product_name_en,a.release_date,a.delivery_type,c.sale_price as price,c.discount_rate as discount,a.consumer_price,a.status,a.goods_sku,a.game_type,a.publisher_code,a.product_platform,a.genre,a.is_preorder,a.is_bonus,a.domain,a.display_type,a.soldout, MATCH (a.product_name, a.product_name_en,a.keyword) AGAINST ('".$keyword."*')as score
			from tbl_goods_item a force index (product_code) inner join tbl_promotion_schedule c force index (ix_search_01) on c.product_code=a.product_code  where a.is_view='Y' and a.status='0' and c.promotion_start<=now() and c.promotion_end>=now() and c.confirm='Y' ".$add_where." order by ".$orderby;
			//echo $query;
			//exit;

			$options = array(
				'results_per_page' =>'60',
				'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*'.$param,  
				'db_handle'  => $this->_db,
				'text_prev'  => '<img src="/assets/images/icon/ep_arrow-left.svg">',
				'text_next'  => '<img src="/assets/images/icon/ep_arrow-right.svg">',
				'text_first' => '<img src="/assets/images/icon/d-arrow-left.svg">',
				'text_last'  => '<img src="/assets/images/icon/d-arrow-right.svg">',
				'class_dead_links' => 'd-none'
			);
			$pagination = new pagination($page, $query, $options);

			return $pagination;

		}catch(paginationException $e){
			echo $e;
			exit();
		}
	}

	//진행중인 프로모션 상품 목록
	public function getGoodsPromotionList($page,$add_where,$orderby,$param){
		try{
			$query = "select a.steam_appid,a.product_code,a.product_name,a.product_name_en,a.release_date,a.delivery_type,c.sale_price as price,c.discount_rate as discount,a.consumer_price,a.status,a.goods_sku,a.game_type,a.publisher_code,a.product_platform,a.genre,a.is_preorder,a.is_bonus,a.domain,a.display_type,a.bundle_type,a.category,a.preorder_start,a.preorder_end,a.spoken_korean,a.interface_korean,a.exclusive_korean,a.exclusive_korean,a.is_naverpay_coupon,a.soldout, MATCH (a.product_name, a.product_name_en,a.keyword) AGAINST ('".$keyword."*')as score
			from tbl_goods_item a force index (product_code) inner join tbl_promotion_schedule c force index (ix_search_01) on c.product_code=a.product_code  where a.is_view='Y' and a.status='0' and c.promotion_start<=now() and c.promotion_end>=now() and c.confirm='Y' ".$add_where." order by ".$orderby;
			//echo $query;
			//exit;

			$options = array(
				'results_per_page' =>'60',
				'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*'.$param,  
				'db_handle'  => $this->_db,
				'text_prev'  => '<img src="/assets/images/icon/ep_arrow-left.svg">',
				'text_next'  => '<img src="/assets/images/icon/ep_arrow-right.svg">',
				'text_first' => '<img src="/assets/images/icon/d-arrow-left.svg">',
				'text_last'  => '<img src="/assets/images/icon/d-arrow-right.svg">',
				'class_dead_links' => 'd-none'
			);
			$pagination = new pagination($page, $query, $options);

			return $pagination;

		}catch(paginationException $e){
			echo $e;
			exit();
		}
	}

	//프로모션 옵션상품목록
	public function getGoodsOptionPromotionIng($page,$add_where,$orderby,$param){
		try{
			$query = "select c.product_code,c.product_name,c.product_name_en,c.game_type,c.bundle_type,c.product_platform,c.consumer_price,c.price,c.discount,c.steam_appid,c.release_date,c.interface_korean,c.spoken_korean,d.sale_price,d.discount_rate,c.goods_sku
			 from tbl_goods_item c  inner join tbl_promotion_schedule d on d.product_code=c.product_code where c.status='0' and c.is_view='Y' and find_in_set(c.game_type,'game,dlc,music') ".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>'60',
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

	//게임검색 tag필터링
	public function getTagFilterList($tag_params){
		$count = 1;
		foreach($tag_params as $value){
			if($count==1){
				$add_where = "having find_in_set('".$value."',tag)";
			}else{
				$add_where.= " and find_in_set('".$value."',tag)";
			}
			$count++;
		}

		$query = "select distinct
				substring_index(substring_index(t.tag, ',', numbers.n), ',' , -1) as tag_code
		from (
			select 1 as n union all 
			select 2 union all
			select 3 union all 
			select 4 union all
			select 5) as numbers
			inner join (select title_id,group_concat(tag_code)as tag from tbl_goods_tags group by title_id ".$add_where.")as t 
			on char_length(t.tag) - char_length(replace(t.tag, ',', '')) >= numbers.n - 1
		order by t.tag asc";

		//echo $query;
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	public function getGoodsDescription($title_id){
		$query = "select* from tbl_goods_description where title_id=:title_id";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':title_id'=>$title_id
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}

	//옵션상품 짧은설명
	public function getGoodsOptionDescription($product_code){
		$query = "select* from tbl_goods_item_description where product_code=:product_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}

	//동영상목록
	public function getGoodsMediaList($title_id){
		$query = "select* from tbl_goods_media where title_id=:title_id and media_type='video' order by media_sort asc,idx asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':title_id'=>$title_id
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	public function  getGoodsScreenshotList($title_id){
		$query = "select screenshot_num,file_name,file_size,file_type,url,thumbnail,domain from tbl_goods_screenshot where title_id=:title_id order by sort asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':title_id'=>$title_id
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	public function  getGoodsItemScreenshotList($product_code){
		$query = "select screenshot_num,file_name,file_size,file_type,url,thumbnail from tbl_goods_item_screenshot where product_code=:product_code order by sort asc,screenshot_num asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	public function  getGoodsTagList($title_id){
		$query = "select a.tag_code,b.tag_name from tbl_goods_tags a inner join tbl_tags b on a.tag_code=b.tag_code where a.title_id=:title_id ";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':title_id'=>$title_id
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	public function  getGoodsItemTagList($product_code){
		$query = "select tags from tbl_goods_item_tags where product_code=:product_code ";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}

	public function getTagName($tag_code){
		$query = "select tag_name from tbl_tags where tag_code=:tag_code";
		$params = array(
			':tag_code'=>$tag_code
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data['tag_name'];
	}

	public function getTagCode($tag){
		$query = "select tag_code from tbl_tags where tag_name=:tag_name";
		$params = array(
			':tag_name'=>$tag
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data['tag_code'];
	}

	public function getTagGroupList($parent_idx){
		$query = " select tags_group_code,tags_group_name from tbl_tags_group where parent_idx=:parent_idx order by tags_group_code asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':parent_idx'=>$parent_idx
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	public function getTagGroupTagList($group_code){
		$query = " select b.tag_code,b.tag_name from tbl_tags_group a inner join tbl_tags b on a.tags_group_code=b.tag_group_code where a.tags_group_code=:tags_group_code order by b.tag_code asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':tags_group_code'=>$group_code
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	public function getPrimaryGenreName($tag_code){
		$query = "select tag_name from tbl_tags where tag_code=:tag_code";
		$params = array(
			':tag_code'=>$tag_code
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data['tag_name'];
	}

	public function getTagList(){
		$query = "select idx,tag_group_code,tag_code,tag_name,tag_name_en from tbl_tags order by tag_code asc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		return $data;
	}

	//태그별 대표상품 수 현황
	public function getTagGoodsCount($tag_code){
		if($tag_code){
			$query = "select title_id,group_concat(distinct tag_code order by tag_code)as tag from tbl_goods_tags group by title_id having tag like :tag";
			$stmt = $this->_db->prepare($query);
			$params = array(
				':tag'=>'%'.$tag_code.'%'
			);
			$stmt->execute($params);
		}else{
			$query = "select a.tag_code,count(*)as cc from tbl_goods_tags a inner join tbl_goods b on a.title_id=b.title_id where b.is_view='Y' group by a.tag_code";
			$stmt = $this->_db->prepare($query);
			$stmt->execute();
		}
		$data = $stmt->fetchAll();
		return $data;
	}

	public function getProductType($product_type){
		switch($product_type){
			case "1":
				$product_type_label="<span class='badge bg-primary font-14'>기본게임</span>";
			break;
			case "2":
				$product_type_label="<span class='badge bg-info font-14'>기본게임 + DLC번들</span>";
			break;
			case "3":
				$product_type_label="<span class='badge bg-secondary font-14'>DLC</span>";
			break;
			case "4":
				$product_type_label="<span class='badge bg-secondary font-14'>DLC번들</span>";
			break;
			case "5":
				$product_type_label="멀티팩";
			break;
			case "6":
				$product_type_label="랜덤박스";
			break;
			case "7":
				$product_type_label="확장팩";
			break;
			case "8":
				$product_type_label="<span class='badge bg-info font-14'>기본게임 번들</span>";
			break;
		}

		return $product_type_label;
	}

	//스팀 Appid 조회
	public function getSteamAppid($product_code){
		$query = "select steam_appid from tbl_goods_item where product_code=:product_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		return $data['steam_appid'];
	}

	//스팀 json정보
	public function getSteamAppInfo($appid){
		$query = "select publisher,developer,is_free,drm_notice,ext_user_account_notice from steam_game where steam_appid=:steam_appid";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':steam_appid'=>$appid
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		return $data;
	}

	//Steam 장르목록
	public function getSteamGenreList(){
		$query = "select genres_id,genres_name from steam_game_genre where genres_id<'29' group by genres_id order by genres_name asc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		return $data;
	}

	//Steam 카테고리 목록

	public function getSteamCategoryList(){
		$query = "select category_id,category_name from steam_game_category where category_id<>'23' and category_id<>'22' and category_id<>'25' and category_id<>'51' and category_id<>'30' and category_id<>'29' and category_id<>'40' and category_id<>'35' and category_id<>'15' and category_id<>'16' and category_id<>'32' and category_id<>'14' and category_id<>'17' and category_id<>'8' and category_id<>'13' group by category_name order by category_name asc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		return $data;
	}

	public function getPublisherList(){
		$query = "select b.publisher_code,b.publisher_name from tbl_goods_item a inner join tbl_publisher b on a.publisher_code=b.publisher_code where find_in_set(status,'0,1,9') group by a.publisher_code having count(*)>1 order by b.publisher_name asc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		return $data;
	}

	//퍼블리셔별 프란차이즈 현황
	public function getPublisherFranchiseList($publisher_code){
		$query = "select franchise_idx,title_name,steam_appid,count(*)as cc from tbl_goods where franchise_idx is not null and publisher_code=:publisher_code and is_view='Y' group by franchise_idx order by release_date desc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':publisher_code'=>$publisher_code
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();

		return $data;
	}

	//퍼블리셔별 프란차이즈 현황
	public function getPublisherFranchiseGoods($publisher_code,$franchise_idx){
		$query = "select title_id,title_name,release_date,steam_appid from tbl_goods where publisher_code=:publisher_code and franchise_idx=:franchise_idx and is_view='Y' order by release_date desc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':publisher_code'=>$publisher_code,
			':franchise_idx'=>$franchise_idx,
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();

		return $data;
	}

	//프랜차이즈명 조회
	public function getFranchistName($franchise_idx){
		$query = "select franchise_name from tbl_franchise where idx=:idx";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':idx'=>$franchise_idx
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		return $data['franchise_name'];
	}

	//할인 프로모션 진행여부 체크
	public function getPromotionGoodsItem($product_code){
		$query = "select * from tbl_promotion_schedule where product_code=:product_code and promotion_start<=now() and promotion_end>=now()";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		return $data;
	}

	//구매특전 제공여부 확인
	public function getGoodsOptionBonusChk($product_code){
		$query = "select * from tbl_goods_bonus where product_code=:product_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		return $data;
	}

	//장르별 인기타이틀
	public function getGenreBestTitle($genre){
		$sales_date = $this->getBestTitleConfig();
		
		$query = "select b.title_id,b.title_name,b.genre,b.category,b.tags,b.release_date,b.domain from tbl_sales_ranking a inner join tbl_goods b on a.title_id=b.title_id where a.sales_year=:sales_year and a.sales_month=:sales_month and match(b.genre) AGAINST('+".$genre."')order by a.total_price desc limit 5";
		
		$stmt = $this->_db->prepare($query);
		$params = array(
			':sales_year'=>$sales_date['sales_year'],
			':sales_month'=>$sales_date['sales_month'],
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();

		return $data;
	}
	
	public function getBestTitleConfig(){
		$query = "select max(sales_date) from tbl_best_title_config";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetch();
		
		$sales_date = array(
			"sales_year"=>substr($data['0'],0,4),
			"sales_month"=>substr($data['0'],4,2),
		);
		
		return $sales_date;
	}

	//추천상품 
	public function getRecommandTitle($title_id,$product_platform,$developer_data,$genre_data,$category_data){
		//echo $genre_data;
		$developer_list = explode(",",$developer_data);
		$genre_list = explode(",",$genre_data);
		$category_list = explode(",",$category_data);
		$add_where = "";
		$tag_filter1 = "";
		$tag_filter2 = "";
		$tag_filter3= "";

		//$add_where.=" and c.product_platform='".$product_platform."'";

		foreach($developer_list as $developer){
			$tag_filter4 .= ' "'.urlencode($developer).'"';
			$developer_point = "match(a.developer) AGAINST('".$tag_filter4."') as developer_point";
		}

		//$add_where.= " and match(a.developer) AGAINST('".$tag_filter4."')";
		

		foreach($genre_list as $genre){
			$tag_filter1 .= " ".$genre;
			
		}
		if(isset($tag_filter1) && $tag_filter1<>""){
			$genre_point = "match(a.genre) AGAINST('".$tag_filter1."') as genre_point";
			$add_where.= " and match(a.genre) AGAINST('".$tag_filter1."')";
		}

		foreach($category_list as $category){
			$tag_filter2.= ' '.$category.' ';
		}

		if(isset($tag_filter2) && $tag_filter2<>""){
			$add_where.= " and match(a.category) AGAINST('".$tag_filter2."')";
			$category_point = "match(a.category) AGAINST('".$tag_filter2."') as cateogry_point";
		}

		$query = "select a.*,c.goods_sku,c.product_name,c.consumer_price,c.price,c.discount,c.is_bonus,c.is_preorder,c.delivery_type,c.game_type,c.display_type,c.product_code,".$developer_point.",".$genre_point.",".$category_point." from tbl_goods a inner join tbl_title_option b on a.title_id=b.title_id inner join tbl_goods_item c on b.product_code=c.product_code where a.is_view='Y' and c.status='0' and c.is_view='Y' and b.product_type='game' and a.title_id<>'".$title_id."' ".$add_where." group by a.title_id order by (genre_point+developer_point) desc,genre_point desc limit 10";

		//echo $query;
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();

		return $data;
	}
	
	public function getTimedealSchedule($product_code){
		//$query = "select * from tbl_timedeal where product_code=:product_code and timedeal_start<UNIX_TIMESTAMP() and timedeal_end>UNIX_TIMESTAMP()";
		$query = "select * from tbl_timedeal where product_code=:product_code and timedeal_end>UNIX_TIMESTAMP()";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}
	
	//대표상품 상품정보제공고시
	public function getAttributeInfo($title_id){
		$query = "select* from tbl_title_attribute_set where title_id=:title_id";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':title_id'=>$title_id
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}
	
	
	//옵션상품 배송아이템
	public function getGoodsItemDeliveryList($product_code){
		$query = "select * from tbl_goods_item_delivery where product_code=:product_code order by item_id asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}
	
	
	//옵션상품 품절상태 업데이트
	public function setGoodsItemSoldout($product_code){
		$query = "update tbl_goods_item set soldout='Y' where product_code=:product_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
	}
	
	//옵션상품 연령제한 정보 확인
	public function getGoodsItemAgeLimit($product_code){
		$query = "select b.title_id,b.age_limit from tbl_goods_item a inner join tbl_title_option b on a.product_code=b.product_code where a.product_code=:product_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}
	
	//옵션상품 구성정보 상세내역
	public function getGoodsOptionPackageInfo($product_code){
		$query = "select * from tbl_goods_option_bundle where product_code=:product_code order by unit_type asc,unit_name asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}
	
	//대표상품 배송방법 정보조회
	public function getGoodsDeliveryMethodInfo($title_id){
		$query = "select a.*,b.COURIER_CODE from tbl_delivery_method a inner join tbl_delivery_detail_info b on a.DELIVERY_METHOD_ID=b.DELIVERY_METHOD_ID and b.title_id=:title_id";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':title_id'=>$title_id
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}
	
	//원격지 파일 존재유무
	public function remoteFileExist($filepath) {
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL,$filepath);
		curl_setopt($ch, CURLOPT_NOBODY, 1);
		curl_setopt($ch, CURLOPT_SSLVERSION, '6');
		curl_setopt($ch, CURLOPT_FAILONERROR, 1);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
		curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, "3");
		$response = curl_exec($ch);
		$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		curl_close ($ch);
		return $http_code;
	}
	
	//옵션상품 진행중인 이벤트 정보 가져오기
	public function getEventGoodsInfo($product_code){
		$query = "select a.*,UNIX_TIMESTAMP() from tbl_event a inner join tbl_event_goods b on a.idx=b.event_no  where b.product_code=:product_code and a.is_view='Y' and a.end_date>UNIX_TIMESTAMP() and a.start_date<UNIX_TIMESTAMP()";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}

	//추천검색어 (유저페이지 노출 슬롯 4개)
	public function getSearchRecommandList(){
		$query = "select idx,keyword,link_url from tbl_search_recommand where is_del='N' and is_view='Y' order by recommand_sort asc, idx asc limit 4";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		return $stmt->fetchAll(PDO::FETCH_ASSOC);
	}

	//헤더 배지 정보 — 장바구니 담긴 수 + 장바구니/위시리스트 내 진행중 프로모션 보유 여부. 쿼리 1회
	//프로모션 판정 기준은 Promotion::getPromotionGoodsPrice()와 동일(confirm='Y' + 기간내)
	//헤더·사이드바에서 중복 호출되므로 static 캐시로 요청당 1회만 조회
	public function getHeaderBadge($m_no){
		static $cache = null;

		if($cache !== null){
			return $cache;
		}

		$badge = array('cart_cnt'=>0, 'cart_promo'=>0, 'wish_promo'=>0);

		if(empty($m_no)){
			$cache = $badge;
			return $badge;
		}

		$query = "select
				(select count(*) from tbl_cart where m_no=:m_no1) as cart_cnt,
				exists(select 1 from tbl_cart a inner join tbl_promotion_schedule b on a.product_code=b.product_code
					where a.m_no=:m_no2 and b.confirm='Y' and b.promotion_start<=now() and b.promotion_end>=now()) as cart_promo,
				exists(select 1 from tbl_wishlist a inner join tbl_promotion_schedule b on a.product_code=b.product_code
					where a.m_no=:m_no3 and b.confirm='Y' and b.promotion_start<=now() and b.promotion_end>=now()) as wish_promo";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':m_no1'=>$m_no,
			':m_no2'=>$m_no,
			':m_no3'=>$m_no
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		$badge['cart_cnt']   = (int)$data['cart_cnt'];
		$badge['cart_promo'] = (int)$data['cart_promo'];
		$badge['wish_promo'] = (int)$data['wish_promo'];

		$cache = $badge;

		return $badge;
	}

	//추천검색어 단건 조회 (클릭 이동용)
	public function getSearchRecommand($idx){
		$query = "select idx,keyword,link_url,is_del,is_view from tbl_search_recommand where idx=:idx";
		$stmt = $this->_db->prepare($query);
		$stmt->execute(array(':idx'=>$idx));
		return $stmt->fetch();
	}

	//추천검색어 클릭수 +1
	public function updateSearchRecommandClick($idx){
		$query = "update tbl_search_recommand set click_count=click_count+1 where idx=:idx";
		$stmt = $this->_db->prepare($query);
		$stmt->execute(array(':idx'=>$idx));
	}

	//클래스 소멸자
	public function __destruct() {
		$this->_db=null;
	}
}
?>