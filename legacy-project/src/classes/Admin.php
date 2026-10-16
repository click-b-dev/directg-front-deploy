<?
class Admin extends Pagination{
	private $_db;
	
	//클래스 생성자
	public function __construct(PDO $db){
		$this->_db = $db;
	}

	//옵션상품코드 생성
	public function setGoodsItemCode(){
		$query = "select max(product_code)+1 from tbl_goods_item";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetch();

		return $data['0'];
	}

	//대표상품(디지털게임) 리스트
	public function getGoodsList($page,$add_where,$orderby,$param){
		try{
			$query = "select * from tbl_goods where 1=1 ".$add_where." order by ".$orderby;

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
	
	//대표상품(실물상품) 리스트
	public function getGoodsAccessoriesList($page,$add_where,$orderby,$param){
		try{
			$query = "select * from tbl_goods where 1=1 ".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>'15',
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

	//장르별 대표상품 리스트
	public function getGoodsGenreList($page,$add_where,$orderby,$param){
		try{
			$query = "select a.*,b.genres_id,b.genres_name from tbl_goods a inner join steam_game_genre b on a.steam_appid=b.appid  where 1=1 ".$add_where." order by ".$orderby;

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

	//태그별 대표상품 리스트
	public function getGoodsTagInfoList($page,$add_where,$orderby,$param){
		try{
			$query = "select *,group_concat(b.tag_code)as tag from tbl_goods a inner join tbl_goods_tags b on a.title_id=b.title_id  group by a.title_id having a.is_view<>'D' ".$add_where." order by ".$orderby;

			//echo $query;

			$options = array(
				'results_per_page' =>'48',
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

	//스팀 게임 리스트
	public function getSteamList($page,$add_where,$orderby,$param){
		try{
			$query = "select * from steam_game where 1=1  ".$add_where." order by ".$orderby;

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

	public function getSteamGame($page,$add_where,$orderby,$param){
		try{
			$query = "select a.* from steam_game a inner join tbl_goods b on a.steam_appid=b.steam_appid where b.sales_status<>'E'  ".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>'50',
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
	
	public function getSteamAppDLC($page,$add_where,$orderby,$param){
		try{
			$query = "select * from steam_game where steam_appid is not null ".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>'50',
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

	public function getSteamAppPackage($page,$add_where,$orderby,$param){
		try{
			$query = "select appid,packageid,package_name,package_release,package_coming_soon,price_initial,price_final,min(batch_date)as batch_date,count(*)as cc from steam_package where 1=1  ".$add_where." group by packageid order by ".$orderby;

			$options = array(
				'results_per_page' =>'50',
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

	//특전 리스트
	public function getBonusPageList($page,$add_where,$orderby,$param){
		try{
			$query = "select * from tbl_bonus where 1=1  ".$add_where." order by ".$orderby;

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

	public function getGoodsItemBonusList($page,$add_where,$orderby,$param){
		try{

			//echo $add_where;
			$query = "select a.*,b.bonus_name,c.product_name,c.release_date,b.bonus_asset,c.preorder_start,c.preorder_end,b.bonus_delivery_type from tbl_goods_bonus a inner join tbl_bonus b on a.bonus_no=b.bonus_no inner join tbl_goods_item c on c.product_code=a.product_code where 1=1  ".$add_where." order by c.release_date desc,a.bonus_start_date desc,a.bonus_end_date desc";

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

	public function getBonusGoodsItem($bonus_no){
		$query = "select a.*,b.bonus_name,c.product_name,c.release_date,b.bonus_asset from tbl_goods_bonus a inner join tbl_bonus b on a.bonus_no=b.bonus_no inner join tbl_goods_item c on c.product_code=a.product_code where a.bonus_no=:bonus_no order by b.bonus_name asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':bonus_no'=>$bonus_no
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	public function getGoodsBonusInfo($product_code){
		$query = "select a.pre_delivery,a.pre_delivery_date,a.bonus_start_date,a.bonus_end_date,b.* from tbl_goods_bonus a inner join tbl_bonus b on a.bonus_no=b.bonus_no where a.product_code=:product_code order by b.bonus_name asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}

	public function getBonusDeliveryType($bonus_delivery_type){
		switch($bonus_delivery_type){
			case "1":
				$bonus_delivery_type_label= "특전key 포함";
			break;
			case "2":
				$bonus_delivery_type_label= "별도key 제공";
			break;
			case "3":
				$bonus_delivery_type_label= "다운로드 컨텐츠";
			break;
		}

		return $bonus_delivery_type_label;
	}

	public function getBonusList(){
		$query = "select * from tbl_bonus order by bonus_name asc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	//스팀 게임 리스트
	public function getSteamListAll($page,$add_where,$orderby,$param){
		try{
			$query = "select a.* from steam_app_list a where a.name is not null ".$add_where." order by " .$orderby;

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
	
	//스팀 평가정보
	public function getSteamReviewInfo($appid){
		$query = "select * from steam_review where appid=:appid ";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':appid'=>$appid
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}


	//스팀 게임 리스트 - 출시예정작
	public function getSteamComingSoon($page,$add_where,$orderby,$param){
		try{
			$query = "select a.*,
			 case 
				when coming_soon_date='발표 예정' then '3'
				when coming_soon_date='출시 예정 게임' then '2'
				else '1'
			 end as sort
			from steam_app_list a where a.coming_soon='1' ".$add_where." order by " .$orderby;

			//echo $query;

			$options = array(
				'results_per_page' =>'50',
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

	//스팀 패키지 목록
	public function getSteamPackageList($page,$add_where,$orderby,$param){
		try{
			$query = "select * from steam_package where package_name is not null ".$add_where." group by packageid having count(*)>1 order by package_release desc,packageid desc";

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

	//스팀 번들 목록
	public function getSteamBundleList($page,$add_where,$orderby,$param){
		try{
			$query = "select * from steam_package where package_name is not null  ".$add_where." group by packageid having count(*)>1 order by packageid desc";

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

	//대표상품 정보조회
	public function getTitle($title_id){
		$query = "select * from tbl_goods where title_id=:title_id";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':title_id'=>$title_id
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		return $data;
	}
	
	//대표상품 정보조회
	public function getTitleName($title_id){
		$query = "select title_name from tbl_goods where title_id=:title_id";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':title_id'=>$title_id
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		return $data['title_name'];
	}


	//대표상품 이름조회
	public function getGoodsName($title_id){
		$query = "select title_name,publisher_code,publisher,sku,release_date from tbl_goods where title_id=:title_id";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':title_id'=>$title_id
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		return $data;
	}

	//대표상품 정보조회
	public function getTitleInfo($product_code){
		$query = "select a.title_id,a.title_name,a.title_name_en,a.age_limit,a.game_rate,a.release_date,a.steam_appid,a.release_date,a.publisher_code,a.publisher from tbl_goods a inner join tbl_title_game b on a.title_id=b.title_id where b.product_code=:product_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		return $data;
	}

	public function getTitleGame($product_code){
		$query = "select a.title_id,a.title_name,a.title_name_en,a.age_limit,a.game_rate,a.release_date,a.steam_appid,a.release_date,a.publisher_code,a.publisher from tbl_goods a inner join tbl_title_game b on a.title_id=b.title_id where b.product_code=:product_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		return $data;
	}

	public function getTitleEdition($product_code){
		$query = "select a.title_id,a.title_name,a.title_name_en,a.age_limit,a.game_rate,a.release_date,a.steam_appid,a.release_date,a.publisher_code,a.publisher from tbl_goods a inner join tbl_title_edition b on a.title_id=b.title_id where b.product_code=:product_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		return $data;
	}

	public function getTitleDLC($product_code){
		$query = "select a.title_id,a.title_name,a.title_name_en,a.age_limit,a.game_rate,a.release_date,a.steam_appid,a.release_date,a.publisher_code,a.publisher from tbl_goods a inner join tbl_title_dlc b on a.title_id=b.title_id where b.product_code=:product_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		return $data;
	}

	public function getTitleBundle($product_code){
		$query = "select a.title_id,a.title_name,a.title_name_en,a.age_limit,a.game_rate,a.release_date,a.steam_appid,a.release_date,a.publisher_code,a.publisher from tbl_goods a inner join tbl_title_bundle b on a.title_id=b.title_id where b.product_code=:product_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		return $data;
	}

	public function getTitleDescription($title_id){
		$query = "select * from tbl_goods_description where title_id=:title_id";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':title_id'=>$title_id
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		return $data;
	}

	public function getGoodsTitleList($product_code){
		$query = "select a.title_id,a.title_name,a.title_name_en,a.platform_code,a.age_limit,a.game_rate,a.release_date,a.genre_code,a.steam_appid,a.release_date,a.publisher_code from tbl_goods a inner join tbl_goods_option b on a.title_id=b.title_id where b.product_code=:product_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();

		return $data;
	}

	public function getGameTitleIDList($product_code){
		$query = "select title_id from tbl_title_game where product_code=:product_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();

		return $data;
	}

	//관련상품 Game 대표상품 조회
	public function getGameTitleSearch($product_code){
		$query = "select b.title_id,b.title_name from tbl_title_option a inner join tbl_goods b on a.title_id=b.title_id where a.product_code=:product_code and a.product_type='game'";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		return $data;
	}

	//관련상품 DLC 대표상품 조회
	public function getDLCTitleSearch($product_code){
		$query = "select b.title_id,b.title_name from tbl_title_option a inner join tbl_goods b on a.title_id=b.title_id where a.product_code=:product_code and a.product_type='dlc'";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		return $data;
	}

	public function getEditionTitleSearch($product_code){
		$query = "select b.title_id,b.title_name from tbl_title_option a inner join tbl_goods b on a.title_id=b.title_id where a.product_code=:product_code and a.product_type='edition'";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		return $data;
	}

	public function getBundleTitleSearch($product_code){
		$query = "select b.title_id,b.title_name from tbl_title_option a inner join tbl_goods b on a.title_id=b.title_id where a.product_code=:product_code and a.product_type='bundle'";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		return $data;
	}

	public function getGameTitleID($product_code){
		$query = "select title_id from tbl_title_game where product_code=:product_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		return $data['title_id'];
	}

	public function getDLCTitleID($product_code){
		$query = "select title_id from tbl_goods_dlc where product_code=:product_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		return $data['title_id'];
	}

	//스팀 DG대표상품 매칭체크
	public function ChkDGTitle($steam_appid){
		$query = "select title_id from tbl_goods where steam_appid=:steam_appid";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':steam_appid'=>$steam_appid
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		return $data['title_id'];
	}

	public function ChkSteamGame($title_id){
		$query = "select steam_appid from steam_game where title_id=:title_id and app_type='game'";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':title_id'=>$title_id
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		return $data['steam_appid'];
	}

	//대표상품 타이틀 ID생성
	public function setGoodsTitleId(){
		$query = "select max(title_id) from tbl_goods";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetch();
		
		$tmp_title_id = substr($data['0'],1,strlen($data['0']));
		$tmp_title_id = $tmp_title_id+1;
		$tmp_title_id = "T".sprintf("%07d",$tmp_title_id);

		return $tmp_title_id;
	}
	
	//옵션상품수
	public function getGoodsOptionCount($title_id){
		$query = "select count(*) from tbl_goods_option where title_id=:title_id";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':title_id'=>$title_id
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data['0'];
	}


	//번들 구성 리스트
	public function getGoodsOptionBundleList($product_code){
		$query = "select bndl_no,asset_id,asset_name,asset_stock from tbl_goods_item_bundle where product_code=:product_code order by asset_name desc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	//옵션상품코드 조회
	public function getGoodsItemCode($appid){
		$query = "select product_code from tbl_goods_item where steam_appid=:steam_appid ";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':steam_appid'=>$appid
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data['product_code'];
	}

	//옵션상품수
	public function getGoodsOptionPackageInfo($packageid){
		$query = "select product_code,game_type,display_type from tbl_goods_item where packageid=:packageid ";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':packageid'=>$packageid
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}


	//옵션상품개별 조회
	public function getGoodsItemInfo($product_code){
		$query = "select product_code,product_name,supplier_code,product_platform,release_date,status,consumer_price,price,display_type from tbl_goods_item where product_code=:product_code ";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}

	public function getGoodsItemCode2($packageid){
		$query = "select product_code from tbl_goods_item where packageid=:packageid and product_platform='1' and find_in_set(status,'0,1,3,9')";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':packageid'=>$packageid
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data['product_code'];
	}

	//패키지구성 아이템 조회
	public function getPackageItemName($appid){
		$query = "select product_name from tbl_goods_item where steam_appid=:steam_appid limit 1";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':steam_appid'=>$appid
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data['product_name'];
	}

	//패키지 구성 리스트
	public function getGoodsOptionPackageList($product_code){
		$query = "select package_srl,item_name,item_type,item_info,appid,item_code from tbl_goods_item_package where product_code=:product_code order by item_type asc,item_name asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	public function getGoodsOptionPackageListCount($product_code){
		$query = "select count(*) from tbl_goods_item_package where product_code=:product_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data['0'];
	}

	//옵션상품별 구매특전 리스트
	public function getGoodsItemSpecial($product_code){
		$query = "select special_no,asset_id,asset_name,asset_stock,special_type from tbl_goods_special where product_code=:product_code order by special_type asc,asset_name asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	//패키지 구성추가
	public function setGoodsOptionPackage($product_code,$item_type,$item_name,$appid,$item_code){
		$query = "insert into tbl_goods_item_package set product_code=:product_code,item_type=:item_type,item_name=:item_name,appid=:appid,item_code=:item_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code,
			':item_type'=>$item_type,
			':item_name'=>$item_name,
			':appid'=>$appid,
			':item_code'=>$item_code,
		);
		$stmt->execute($params);

		if($appid>0){
			$this->setSteamAppUpdate($appid,$item_name);
		}

		//print_r($params);
	}

	//스팀 app name 한글업데이트
	public function setSteamAppUpdate($appid,$item_name){
		$query = "update steam_game set name_kr=:name_kr where steam_appid=:steam_appid";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':name_kr'=>$item_name,
			':steam_appid'=>$appid,
		);
		$stmt->execute($params);
	}

	//번들 구성추가
	public function setGoodsOptionBundle($product_code,$asset_id,$asset_name,$zt_item_id,$asset_type,$asset_platform,$bundle_product_code){
		$query = "insert into tbl_goods_item_bundle set product_code=:product_code,asset_id=:asset_id,asset_name=:asset_name,zt_item_id=:zt_item_id,asset_type=:asset_type,asset_platform=:asset_platform,bundle_product_code=:bundle_product_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code,
			':asset_id'=>$asset_id,
			':asset_name'=>$asset_name,
			':zt_item_id'=>$zt_item_id,
			':asset_type'=>$asset_type,
			':asset_platform'=>$asset_platform,
			':bundle_product_code'=>$bundle_product_code,
		);
		$stmt->execute($params);
	}

	//Asset 구성 추가
	public function setGoodsOptionDelivery($product_code,$asset_id,$asset_name,$asset_type,$asset_platform,$order_system){
		$query = "insert into tbl_goods_item_delivery set product_code=:product_code,asset_id=:asset_id,asset_name=:asset_name,asset_type=:asset_type,asset_platform=:asset_platform,order_system=:order_system";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code,
			':asset_id'=>$asset_id,
			':asset_name'=>$asset_name,
			':asset_type'=>$asset_type,
			':asset_platform'=>$asset_platform,
			':order_system'=>$order_system,
		);
		$stmt->execute($params);
	}

	//Ztorm 구성 추가
	public function setGoodsOptionDeliveryZtorm($product_code,$item_platform,$item_type,$item_id,$item_name,$providers_channel,$order_system){
		$query = "insert into tbl_goods_item_delivery set product_code=:product_code,product_id=:product_id,product_name=:product_name,category_name=:category_name,platform=:platform,providers_channel=:providers_channel,order_system=:order_system";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code,
			':product_id'=>$item_id,
			':product_name'=>$item_name,
			':category_name'=>$item_type,
			':platform'=>$item_platform,
			':providers_channel'=>$providers_channel,
			':order_system'=>$order_system,
		);
		$stmt->execute($params);
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
	
	//옵션상품 배송아이템 정보조회
	public function getGoodsItemDeliveryInfo($product_code,$item_id){
		if($item_id){
			$query = "select * from tbl_goods_item_delivery where product_code=:product_code and item_id=:item_id";
			$stmt = $this->_db->prepare($query);
			$params = array(
				':product_code'=>$product_code,
				':item_id'=>$item_id
			);
		}else{
			$query = "select * from tbl_goods_item_delivery where product_code=:product_code";
			$stmt = $this->_db->prepare($query);
			$params = array(
				':product_code'=>$product_code
			);
		}
		
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}

	//구매특전추가
	public function setGoodsOptionSpecial($product_code,$asset_id,$special_name,$special_type){
		$query = "insert into tbl_goods_special set product_code=:product_code,asset_id=:asset_id,asset_name=:asset_name,special_type=:special_type";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code,
			':asset_id'=>$asset_id,
			':asset_name'=>$special_name,
			':special_type'=>$special_type,
		);
		$stmt->execute($params);
	}

	//특전 구성 리스트
	public function getGoodsOptionSpecialList($product_code){
		$query = "select special_no,asset_id,asset_name,asset_stock from tbl_goods_item_special where product_code=:product_code order by asset_name asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	//상품옵션 리스트
	public function getGoodsOptionList($page,$add_where,$orderby,$param,$per_page="20"){
		try{
			$query = "select * from tbl_goods_item where product_code>0 ".$add_where." order by ".$orderby;

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

	//상품옵션 연동시스템별 리스트
	public function getGoodsOptionDeliveryList($page,$add_where,$orderby,$param,$per_page="20"){
		try{
			$query = "select a.product_code,a.product_name,a.soldout,a.status,b.item_id,b.item_name,b.item_type,b.item_platform,b.item_publisher,b.stock,b.update_date from tbl_goods_item a inner join tbl_goods_item_delivery b on a.product_code=b.product_code where a.status<>'3' ".$add_where." order by ".$orderby;

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

	//개발사 목록
	public function getDeveloperList(){
		$query = "select developer_name from tbl_developer order by developer_name asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	//장르목록
	public function getGenre(){
		$query = "select idx,genre_name from tbl_genre order by genre_name asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	public function getProductStatus($status){
		switch($status){
			case "0":
				$status_label="<span class='badge badge-primary-lighten font-12'>판매중</span>";
			break;
			case "1":
				$status_label="<span class='badge badge-warning-lighten font-12'>판매중지</span>";
			break;
			case "3":
				$status_label="<span class='badge badge-danger-lighten font-12'>판매종료</span>";
			break;
			case "9":
				$status_label="<span class='badge badge-secondary-lighten font-12'>승인대기</span>";
			break;
		}

		return $status_label;
	}

	public function getOrderSystem($order_system){
		switch($order_system){
			case "1":
				$order_system_label = "Asset API";
			break;
			case "2":
				$order_system_label = "Ztorm API";
			break;
			case "8":
				$order_system_label = "Vaultn API";
			break;
			case "9":
				$order_system_label = "Genba API";
			break;
			case "10":
				$order_system_label = "PointNexus API";
			break;
		}

		return $order_system_label;
	}

	public function getProductPlatform($product_platform){
		switch($product_platform){
			case "1":
				$product_platform_label="Steam";
			break;
			case "3":
				$product_platform_label="Origin";
			break;
			case "34":
				$product_platform_label="Epic";
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
			default:
				$product_platform_label = "";
			break;
		}

		return $product_platform_label;
	}

	public function getProductOrderSystem($order_system){
		switch($order_system){
			case "1":
				$order_system_label="Asset - key";
			break;
			case "2":
				$order_system_label="Ztorm - key";
			break;
			case "3":
				$order_system_label="Ztorm - key";
			break;
			case "9":
				$order_system_label="Genba - key";
			break;
		}

		return $order_system_label;
	}

	public function getProductType($product_type){
		switch($product_type){
			case "1":
				$product_type_label="기본게임";
			break;
			case "2":
				$product_type_label="기본게임 + DLC번들";
			break;
			case "3":
				$product_type_label="DLC";
			break;
			case "4":
				$product_type_label="DLC번들";
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
				$product_type_label="기본게임 번들";
			break;
		}

		return $product_type_label;
	}

	//게임유형
	public function getGameType($game_type){
		switch($game_type){
			case "game":
				$game_type_label="기본게임";
			break;
			case "dlc":
				$game_type_label="DLC";
			break;
			case "music":
				$game_type_label="사운드트랙";
			break;
			case "bundle":
				$game_type_label="번들";
			break;
			case "randombox":
				$game_type_label="랜덤박스";
			break;;
			case "holomodels":
				$game_type_label="홀로모델";
			break;;
		}

		return $game_type_label;
	}

	//번들유형
	public function getBundleType($bundle_type){
		switch($bundle_type){
			case "1":
				$bundle_type_label="에디션";
			break;
			case "2":
				$bundle_type_label="기타번들";
			break;
			case "3":
				$bundle_type_label="멀티팩";
			break;
			case "4":
				$bundle_type_label="DLC번들";
			break;
			break;
		}

		return $bundle_type_label;
	}

	//장르명
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


	//대표상품 관련동영상
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

	//대표상품 상세설명
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

	//옵션상품 상세설명
	public function getGoodsItemDescription($product_code){
		$query = "select* from tbl_goods_item_description where product_code=:product_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}

	//Steam 태그코드 리스트
	public function getTagList(){
		$query = "select idx,tag_group_code,tag_code,tag_name from tbl_tags where tag_code is not null order by tag_code asc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		return $data;
	}

	public function getTagGroupNonList(){
		$query = "select idx,tag_group_code,tag_code,tag_name,tag_name_en from tbl_tags where tag_group_code is null order by tag_name asc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		return $data;
	}

	public function getTagGroupList($depth,$parent_idx=""){
		if($depth=="1"){
			$query = "select idx,tags_group_code,tags_group_name from tbl_tags_group where group_depth=:group_depth order by tags_group_code asc";
			$stmt = $this->_db->prepare($query);
			$params = array(
				':group_depth'=>$depth
			);
			$stmt->execute($params);
		}else{
			$query = "select idx,tags_group_code,tags_group_name from tbl_tags_group where group_depth=:group_depth and parent_idx=:parent_idx order by tags_group_code asc";
			$stmt = $this->_db->prepare($query);
			$params = array(
				':group_depth'=>$depth,
				':parent_idx'=>$parent_idx,
			);
			$stmt->execute($params);
		}
		

		$data = $stmt->fetchAll();
		return $data;
	}

	public function getTagGroupInfo($tag_group_code){
		$query = "select tags_group_code,tags_group_name from tbl_tags_group where tags_group_code=:tags_group_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':tags_group_code'=>$tag_group_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}

	public function getTagGroupTagList($tag_group_code){
		$query = "select tag_code,tag_name from tbl_tags where tag_group_code=:tag_group_code order by tag_name asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':tag_group_code'=>$tag_group_code
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	public function setTagcode($tag_group_code){
		$query = "select max(tag_code) from tbl_tags where tag_group_code=:tag_group_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':tag_group_code'=>$tag_group_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		if(!$data['0']){
			$tag_code = $tag_group_code."001";
		}else{
			$tag_code = $tag_group_code.str_pad((substr($data['0'],6,3)+1),3,"0",STR_PAD_LEFT);
		}
		return $tag_code;
	}
	
	//플랫폼 현황
	public function getPlatformList(){
		$query = "select idx,platform,flag from directgames.tbl_platform order by flag desc,-(idx) desc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		return $data;
	}
	
	//배송방법 현황
	public function getDeliveryMethodList(){
		$query = "select * from tbl_delivery_method order by DELIVERY_METHOD_ID asc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		return $data;
	}

	//Steam 장르 리스트
	public function getSteamGenreList(){
		$query = "select b.genres_id,b.genres_name,count(*)as genre_count from steam_game a inner join  steam_game_genre b on a.steam_appid=b.appid where b.genres_id>'0' group by b.genres_id order by count(*) desc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		return $data;
	}

	//Steam 카테고리 리스트
	public function getSteamCategoryList(){
		$query = "select a.category_id,a.category_name,count(*)as category_count from steam_game_category a inner join steam_game b on a.appid=b.steam_appid where b.app_type='game' and a.category_id<>'22' and a.category_id<>'23' and a.category_id<>'29' and a.category_id<>'25' and a.category_id<>'30' and a.category_id<>'51' and a.category_id<>'40' and a.category_id<>'32' and a.category_id<>'8' and a.category_id<>'15' group by a.category_name order by count(*) desc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		return $data;
	}

	//퍼블리셔코드 조회
	public function getPublisherCode($product_code){
		$query = "select publisher_code from tbl_publisher where product_code=:product_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data['publisher_code'];
	}

	//비슷한 타이틀 검색(같은 개발사 + 같은장르)
	public function getRelatedTitleSearch($title_id,$developer,$genre,$search_type){

		if($search_type=="1"){ //같은장르
			$query = "select a.title_id,a.title_name,a.release_date,match(a.genre) AGAINST(:genre)as score from tbl_goods a inner join tbl_title_game b on a.title_id=b.title_id where a.title_id<>:title_id and a.developer<>:developer and match(a.genre) AGAINST(:genre) and a.release_date<CURDATE() group by a.title_id order by score desc,a.release_date desc limit 5";
			$stmt = $this->_db->prepare($query);
			$params = array(
				':title_id'=>$title_id,
				':developer'=>$developer,
				':genre'=>str_replace(",","+",$genre),
			);
			$stmt->execute($params);
			$data = $stmt->fetchAll();
			//print_r($data);
		}else{ //같은개발사
			$query = "select title_id,title_name,release_date from tbl_goods where title_id<>:title_id and developer=:developer order by release_date desc limit 10";
			$stmt = $this->_db->prepare($query);
			$params = array(
				':title_id'=>$title_id,
				':developer'=>$developer,
			);
			$stmt->execute($params);
			$data = $stmt->fetchAll();
		}

		return $data;
	}

	//옵션상품 기간범위에 따른 판매량
	public function getGoodsOptionSalesCount($product_code,$end_date){
		$query = "select sum(sales_count) from tbl_sales where product_code=:product_code and ord_ymd<=:end_date";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code,
			':end_date'=>$end_date,
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data['0'];
	}

	public function getGoodsOptionSalesTotalCount($product_code){
		$query = "select sum(sales_count) from tbl_sales where product_code=:product_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code,
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data['0'];
	}

	public function getPublisherNameSearch($product_code){
		$query = "select b.publisher_name from tbl_goods_item a inner join tbl_publisher b on a.supplier_code=b.publisher_code where a.product_code=:product_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data['publisher_name'];
	}

	//공급처 목록
	public function getPublisherAllList($search_year){
		if($search_year<>'all'){
			switch($search_year){
				case "2013":
					$query = "select publisher_code,publisher_name from tbl_publisher where is_2013<>'N' order by publisher_name asc";
					$stmt = $this->_db->prepare($query);
					$stmt->execute();
				break;
				case "2014":
					$query = "select publisher_code,publisher_name from tbl_publisher where is_2014<>'N' order by publisher_name asc";
					$stmt = $this->_db->prepare($query);
					$stmt->execute();
				break;
				case "2015":
					$query = "select publisher_code,publisher_name from tbl_publisher where is_2015<>'N' order by publisher_name asc";
					$stmt = $this->_db->prepare($query);
					$stmt->execute();
				break;
				case "2016":
					$query = "select publisher_code,publisher_name from tbl_publisher where is_2016<>'N' order by publisher_name asc";
					$stmt = $this->_db->prepare($query);
					$stmt->execute();
				break;
				case "2017":
					$query = "select publisher_code,publisher_name from tbl_publisher where is_2017<>'N' order by publisher_name asc";
					$stmt = $this->_db->prepare($query);
					$stmt->execute();
				break;
				case "2018":
					$query = "select publisher_code,publisher_name from tbl_publisher where is_2018<>'N' order by publisher_name asc";
					$stmt = $this->_db->prepare($query);
					$stmt->execute();
				break;
				case "2019":
					$query = "select publisher_code,publisher_name from tbl_publisher where is_2019<>'N' order by publisher_name asc";
					$stmt = $this->_db->prepare($query);
					$stmt->execute();
				break;
				case "2020":
					$query = "select publisher_code,publisher_name from tbl_publisher where is_2020<>'N' order by publisher_name asc";
					$stmt = $this->_db->prepare($query);
					$stmt->execute();
				break;
				case "2021":
					$query = "select publisher_code,publisher_name from tbl_publisher where is_2021<>'N' order by publisher_name asc";
					$stmt = $this->_db->prepare($query);
					$stmt->execute();
				break;
				case "2022":
					$query = "select publisher_code,publisher_name from tbl_publisher where is_2022<>'N' order by publisher_name asc";
					$stmt = $this->_db->prepare($query);
					$stmt->execute();
				break;
				default:
					$query = "select publisher_code,publisher_name from tbl_publisher where is_view='Y' order by publisher_name asc";
					$stmt = $this->_db->prepare($query);
					$stmt->execute();
				break;
			}
		}else{
			$query = "select publisher_code,publisher_name from tbl_publisher where is_view='Y' order by publisher_name asc";
			$stmt = $this->_db->prepare($query);
			$stmt->execute();
		}
		
		$data = $stmt->fetchAll();
		return $data;
	}

	/*
	public function getPublisherList(){
		$query = "select b.publisher_code,b.publisher_name from tbl_goods_item a inner join tbl_publisher b on a.publisher_code=b.publisher_code where find_in_set(status,'0,1,9') group by a.publisher_code order by b.publisher_name asc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		return $data;
	}
	*/

	public function getSupplierList(){
		$query = "select b.publisher_code,b.publisher_name from tbl_goods_item a inner join tbl_publisher b on a.supplier_code=b.publisher_code where find_in_set(status,'0,1,9') group by a.supplier_code order by b.publisher_name asc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		return $data;
	}

	//판매통계용 공급처 목록 — 현재 상품 보유 + 과거 판매이력(tbl_sales.supplier_code) 포함. 현재DB에 이름 없으면 예전DB(directgames.tbl_publisher.idx) 폴백
	public function getSalesSupplierList(){
		$query = "select s.supplier_code as publisher_code, case when c.publisher_name is not null then c.publisher_name when d.publisher is not null then concat(d.publisher,' (예전DB)') else s.supplier_code end as publisher_name
			from (
				select supplier_code from tbl_goods_item where find_in_set(status,'0,1,9') and supplier_code is not null and supplier_code<>0
				union
				select supplier_code from tbl_sales where supplier_code is not null and supplier_code<>0
			) s
			left join tbl_publisher c on s.supplier_code=c.publisher_code
			left join directgames.tbl_publisher d on s.supplier_code=d.idx
			order by publisher_name asc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		return $data;
	}
	
	
	//판매통계용 옵션상품 목록 — tbl_sales에 판매이력이 있는 상품만
	public function getSalesProductList(){
		//판매이력(tbl_sales) 기준. 현재 tbl_goods_item에서 삭제된 상품도 판매당시 상품명(스냅샷)으로 표시. cur_code가 null이면 현재 미등록 상품.
		//성능: 베이스는 distinct product_code(인덱스 스캔). 등록상품은 tbl_goods_item에서 이름을 가져오고,
		//      미등록상품(소수)만 COALESCE 단락평가로 tbl_sales 최신 상품명 서브쿼리가 실행됨.
		$query = "select s.product_code,
				coalesce(b.product_name,(select ts.product_name from tbl_sales ts where ts.product_code=s.product_code order by ts.ord_ymd desc limit 1)) as product_name,
				b.product_name_en,b.product_platform,b.display_type,b.release_date,b.product_code as cur_code
			from (select distinct product_code from tbl_sales) s
			left join tbl_goods_item b on s.product_code=b.product_code";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		//상품명 정렬은 PHP에서 처리 — SQL의 order by(임시테이블/filesort) 제거
		usort($data, function($a,$b){ return strcmp((string)$a['product_name'],(string)$b['product_name']); });
		return $data;
	}

	public function getPublisherList($page,$add_where,$orderby,$param){
		try{
			if($add_where){
				$query = "select * from tbl_publisher where 1=1 ".$add_where." order by ".$orderby;
			}else{
				$query = "select * from tbl_publisher order by ".$orderby;
			}

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

	//연도별 공급처목록
	public function getPublisherFilter($search_year){
		switch($search_year){
			case "2022":
				$query = "select publisher_code,publisher_name from tbl_publisher where is_2022=:is_2022 order by publisher_name asc";
				$params = array(
					':is_2022'=>'Y'
				);
				$stmt = $this->_db->prepare($query);
				$stmt->execute($params);
				$data = $stmt->fetchAll();
				return $data;
			break;
			default:
				//$this->getPublisherList();
			break;
		}
	}

	//노출상태별 대표상품현황
	public function getGoodsViewStatusCount(){
		$query = "select is_view,count(*)as cc from tbl_goods group by is_view order by is_view asc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		return $data;
	}

	//판매상태별 옵션상품현황
	public function getGoodsOptionStatusCount(){
		$query = "select status,count(*)as cc from tbl_goods_item group by status order by status asc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		return $data;
	}

	//공급처별 대표상품 등록현황
	public function getGoodsSupplierCount(){
		$query = "select supplier_code,is_view,count(*)as cc from tbl_goods group by supplier_code,is_view order by count(*) desc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		return $data;
	}

	//유형별 옵션상품현황
	public function getGoodsOptionTypeCount(){
		$query = "select status,game_type,bundle_type,count(*)as cc from tbl_goods_item group by game_type,bundle_type,status order by game_type asc,bundle_type asc,status asc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		return $data;
	}

	//연동시스템별 옵션상품현황
	public function getGoodsOrderSystemCount(){
		$query = "select status,order_system,count(*)as cc from tbl_goods_item where order_system is not null and order_system<>''  group by status,order_system order by order_system asc,status asc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		return $data;
	}

	//퍼블리셔별 대표상품현황
	public function getTitlePublisherCount(){
		$query = "select publisher,count(*)as cc from tbl_goods where find_in_set(sales_status,'S,C') group by publisher order by count(*) desc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		return $data;
	}

	//퍼블리셔별 옵션상품현황
	public function getGoodsOptionPublisherCount(){
		$query = "select publisher,game_type,count(*)as cc from tbl_goods_item where status='0'  group by publisher,game_type order by publisher asc,game_type asc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		return $data;
	}

	//공급처별 옵션상품 등록현황
	public function getGoodsOptionSupplierCount(){
		$query = "select supplier_code,count(*)as cc from tbl_goods_item where status='0' group by supplier_code order by count(*) desc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		return $data;
	}

	//장르별 대표상품현황
	public function getGoodsGenreCount(){
		$query = "select b.genres_id,b.genres_name,count(*)as cc from tbl_goods a inner join steam_game_genre b on a.steam_appid=b.appid where a.is_view='Y' group by b.genres_id order by count(*) desc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		return $data;
	}

	//카테고리별 대표상품현황
	public function getGoodsCategoryCount(){
		$query = "select b.category_id,b.category_name,count(*)as cc from tbl_goods a inner join steam_game_category b on a.steam_appid=b.appid where a.is_view='Y' and b.category_id<>'22' and b.category_id<>'23' and b.category_id<>'29' and b.category_id<>'32' and b.category_id<>'51' and b.category_id<>'30' and b.category_id<>'35' and b.category_id<>'25'  and b.category_id<>'62'and b.category_id<>'17' and b.category_id<>'8'  and b.category_id<>'40' and b.category_id<>'42' and b.category_id<>'41'  and b.category_id<>'44'  and b.category_id<>'15' and b.category_id<>'43' group by b.category_id order by count(*) desc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		return $data;
	}

	//프랜차이즈 현황
	public function getFranchiseList(){
		$query = "select idx,franchise_name from tbl_franchise order by franchise_name asc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		return $data;
	}

	//대표상품 프랜차이즈 검색
	public function getFranchiseSearch($search_franchise){
		$franchise_name = "%".$search_franchise."%";
		$query = "select idx,franchise_name from tbl_franchise where franchise_name like :franchise_name";

		echo $query;
		$stmt = $this->_db->prepare($query);
		$params = array(
			':franchise_name'=>$franchise_name
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	//대표상품 프랜차이즈 설정
	public function setTitleFranchise($title_id,$franchise_idx){
		$query = "update tbl_goods set franchise_idx=:franchise_idx where title_id=:title_id";
		$stmt = $this->_db->prepare($query);
		$params = array(
			":franchise_idx"=>$franchise_idx,
			":title_id"=>$title_id
		);

		$stmt->execute($params);
	}

	public function getGoodsFranchiseCount(){
		$query = "select t.franchise_idx,t.game_type,count(*)as cc from (select a.franchise_idx,a.title_id,c.game_type,count(*) from tbl_goods a inner join tbl_goods_option b on a.title_id=b.title_id inner join tbl_goods_item c on c.product_code=b.product_code where c.status='0' and a.franchise_idx is not null group by a.title_id,c.game_type) as t group by t.franchise_idx,t.game_type order by t.franchise_idx asc,t.game_type asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':franchise_idx'=>$franchise_idx
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	//프랜차이즈 조회
	public function getFranchiseName($franchise_idx){
		$query = "select franchise_name from tbl_franchise where idx=:idx";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':idx'=>$franchise_idx
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data['franchise_name'];
	}

	public function getSteamBasicGame($appid){
		$query = "select game_appid from steam_dlc where dlc_appid=:dlc_appid";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':dlc_appid'=>$appid
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data['game_appid'];
	}

	public function getSteamBasicGameAll($appid){
		$query = "select game_appid from steam_dlc_all where dlc_appid=:dlc_appid";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':dlc_appid'=>$appid
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data['game_appid'];
	}

	//스팀게임정보 장르조회
	public function getSteamGamesGenre($appid){
		$query = "select genre from steam_game where steam_appid=:appid";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':appid'=>$appid
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}

	public function getSteamAppsGenre($appid){
		$query = "select genres_name from steam_game_genre where appid=:appid";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':appid'=>$appid
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	public function getSteamGamesCategory($appid){
		$query = "select category from steam_game where steam_appid=:appid";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':appid'=>$appid
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		
		//print_r($steam_category_data);
		return $data;
	}

	public function getGameGrac($rateno){
		$query = "select orgname,entname,givenrate,rateddate,descriptors from grac_list where rateno=:rateno";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':rateno'=>$rateno
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}

	public function getSteamScreenshot($appid){
		$query = "select screenshot_id,screenshot_thumbnail,screenshot_full from steam_game_screenshot where appid=:appid";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':appid'=>$appid
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	public function getSteamDLC($appid){
		$query = "select dlc_appid from steam_dlc where game_appid=:game_appid";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':game_appid'=>$appid
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	public function getSteamDLCAll($appid){
		$query = "select dlc_appid from steam_dlc_all where game_appid=:game_appid";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':game_appid'=>$appid
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	//스팀 app조회
	public function getSteamAppinfo($appid){
		$query = "select * from steam_game where steam_appid=:steam_appid";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':steam_appid'=>$appid
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}

	public function getSteamAppinfoAll($appid){
		$query = "select name from steam_app_list where appid=:appid";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':appid'=>$appid
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}

	public function getSteamAppSearch($appid){
		$query = "select name,app_type,is_free,release_date,name_kr,consumer_price,price,supported_languages,genre from steam_game where steam_appid=:steam_appid";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':steam_appid'=>$appid
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}

	public function getSteamPackage($appid){
		$query = "select * from steam_package where appid=:appid order by package_coming_soon desc,-(price_initial) desc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':appid'=>$appid
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}
	
	//Steam 리뷰현황
	public function getSteamReview($appid){
		$query = "select * from steam_review where appid=:appid order by language asc,purchase_type asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':appid'=>$appid
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	public function getSteamPackageAll($appid){
		$query = "select packageid,package_name,package_release,package_coming_soon,price_initial,price_final from steam_package_all where appid=:appid order by price_initial asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':appid'=>$appid
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	public function getSteamPackageName($packageid){
		$query = "select package_name from steam_package where packageid=:packageid";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':packageid'=>$packageid
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data['package_name'];
	}

	public function getSteamDeveloper($appid){
		$query = "select group_concat(developer_name SEPARATOR ' , ')as developer from steam_game_developer where appid=:appid";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':appid'=>$appid
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}

	public function getSteamPublisher($appid){
		$query = "select publisher from  steam_game where steam_appid=:appid";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':appid'=>$appid
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}

	//구매특전 별도제공 asset_id 목록
	public function getSpecialAssetInfo($special_idx){
		$query = "select asset_id,asset_name from tbl_special_item where special_idx=:special_idx";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':special_idx'=>$special_idx
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	//스팀 game목록
	public function getSteamGameList($steam_appid){
		$query = "select steam_appid,name,is_free,release_date,app_type from steam_game where steam_appid=:steam_appid and app_type='game' order by name asc,is_free asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':steam_appid'=>$steam_appid
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}
	
	//스팀 평가점수 현황
	public function getSteamReviewList($page,$add_where,$orderby,$param){
		try{
			$query = "select * from steam_game a inner join (select appid,review_score,review_score_desc,total_positive,total_negative,total_reviews,batch_date from steam_review where language='all' and purchase_type='all')as b on a.steam_appid=b.appid  where b.total_positive>0 ".$add_where."order by release_date desc";

			$options = array(
				'results_per_page' =>'50',
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

	public function getSteamPackageGameList($packageid){
		$query = "select a.packageid,b.steam_appid,b.name,b.app_type,b.release_date from steam_package a inner join steam_game b on a.appid=b.steam_appid where a.packageid=:packageid and b.app_type='game'  order by b.release_date asc,b.is_free asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':packageid'=>$packageid
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	public function getSteamPackageDLCList($packageid){
		$query = "select a.packageid,b.steam_appid,b.name,b.app_type,b.release_date from steam_package a inner join steam_game b on a.appid=b.steam_appid where a.packageid=:packageid and b.app_type<>'game'  order by b.release_date asc,b.is_free asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':packageid'=>$packageid
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	//스팀 dlc목록
	public function getSteamDLCList($steam_appid){
		$query = "select a.dlc_appid,b.* from steam_dlc a left join steam_game b on a.dlc_appid=b.steam_appid where a.game_appid=:game_appid order by b.release_date asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':game_appid'=>$steam_appid
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	public function getSteamDLCList_v2($packageid){
		$query = "select c.steam_appid,c.app_type,c.name,c.name_kr from steam_package a inner join steam_dlc b on a.appid=b.game_appid inner join steam_game c on c.steam_appid=b.dlc_appid where a.packageid=:packageid and c.is_free<>'1' and c.price>0 and c.app_type<>'game' order by c.release_date asc,c.name asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':packageid'=>$packageid
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	//대표상품 tag리스트
	public function getGoodsTagList($title_id){
		$query = "select b.tag_group_code,a.tag_code,b.tag_name from tbl_goods_tags a inner join tbl_tags b on a.tag_code=b.tag_code where a.title_id=:title_id order by a.tag_code asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':title_id'=>$title_id
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	//옵션상품 번들구성리스트
	public function getGoodsItemBundle($product_code){
		$query = "select bndl_no,product_code,asset_id,asset_name,asset_stock,zt_item_id,asset_type,asset_platform,bundle_product_code from tbl_goods_item_bundle where product_code=:product_code order by asset_type asc,asset_name asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	public function getGoodsItemBundleCount($product_code){
		$query = "select count(*) from tbl_goods_item_bundle where product_code=:product_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data['0'];
	}

	//번들구성 조회
	public function getGoodsItemSearch($search_type,$search_value){
		switch($search_type){
			case "1":
				$query = "select asset_id,product_name,product_name_en,zt_item_id,product_platform,product_code,steam_appid from tbl_goods_item where asset_id=:asset_id order by product_name_en asc";
				$stmt = $this->_db->prepare($query);
				$params = array(
					':asset_id'=>$search_value
				);

				$stmt->execute($params);
				$data = $stmt->fetchAll();
			break;
			case "2":
				$query = "select name as product_name_en,name_kr as item_name,steam_appid as appid,case when app_type='game' then '1' when app_type='dlc' then '2' when app_type='music' then '2' end as item_type from steam_game where steam_appid=:steam_appid";
				$stmt = $this->_db->prepare($query);
				$params = array(
					':steam_appid'=>$search_value
				);
				$stmt->execute($params);
				$data = $stmt->fetchAll();
			break;
			case "3":
				$query="select * from tbl_goods_item where product_code=:product_code order by product_name asc";
				$stmt = $this->_db->prepare($query);
				$params = array(
					":product_code"=>$search_value
				);
				$stmt->execute($params);

				$data = $stmt->fetchAll();
			break;
			case "4":
				$query="select * from tbl_goods_item_package where product_code=:product_code order by item_type asc,item_name asc";
				$stmt = $this->_db->prepare($query);
				$params = array(
					":product_code"=>$search_value
				);
				$stmt->execute($params);

				$data = $stmt->fetchAll();
			break;
		}
		
		
		return $data;
	}

	//구매특전 삭제
	public function setGoodsItemSpecialDelete($special_no){
		$query = "delete from tbl_goods_special where special_no=:special_no";
		$params = array(
			':special_no'=>$special_no
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
	}

	//번들구성 삭제
	public function setGoodsItemBundleDelete($bndl_no){
		$query = "delete from tbl_goods_item_bundle where bndl_no=:bndl_no";
		$params = array(
			':bndl_no'=>$bndl_no
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
	}

	//패키지 구성삭제
	public function setGoodsItemPackageDelete($package_no){
		$query = "delete from tbl_goods_item_package where package_srl=:package_srl";
		$params = array(
			':package_srl'=>$package_no
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
	}

	//게등위 심의신청자 리스트
	public function  getGRACEntnameList(){
		$query = "select entname,tcount,batch_date from grac_entname  where tcount>='9' order by tcount desc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		return $data;
	}

	//게등위 게임심의정보 리스트
	public function getGRACList($page,$add_where,$orderby,$param){
		try{
			$query = "select * from grac_list where 1=1 ".$add_where." order by rateddate desc";

			$options = array(
				'results_per_page' =>'50',
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

	//태그별 대표상품 수 현황
	public function getTagGoodsCount(){
		$query = "select a.tag_code,count(*)as cc from tbl_goods_tags a inner join tbl_goods b on a.title_id=b.title_id where b.is_view='Y' group by a.tag_code";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		return $data;
	}

	//스팀태그별 appid별 카운트
	public function getSteamTagCount(){
		$query = "select tag_code,tag_name,count(*)as cc from steam_tag group by tag_name order by count(*) desc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		return $data;
	}

	public function getSteamTagCount_v2(){
		$query = "select a.idx,a.tag_code,a.tag_name,a.tag_name_ko,b.app_type,count(*)as cc from steam_tag a inner join steam_game b on a.appid=b.steam_appid where b.app_type='game'  group by a.tag_name,b.app_type order by a.tag_name asc,b.app_type asc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		return $data;
	}

	public function getSteamTagCount_ko(){
		$query = "select a.idx,a.tag_code,a.tag_name,b.app_type,count(*)as cc from steam_tag_ko a inner join steam_game b on a.appid=b.steam_appid  where b.app_type='game' group by a.tag_name,b.app_type order by a.tag_name asc,b.app_type asc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		return $data;
	}
	
	//태그코드 조회
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

	public function  getTagCode2($tag){
		$query = "select tag_code from tbl_tags where tag_name_en=:tag_name_en";
		$params = array(
			':tag_name_en'=>$tag
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data['tag_code'];
	}

	//태그코드 등록여부 체크
	public function chkTag($tag){
		$query = "select count(*) from tbl_tags where tag_name=:tag_name";
		$params = array(
			':tag_name'=>$tag
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data['0'];
	}

	public function  getTagGroupCode($tag){
		$query = "select tag_group_code from tbl_tags where tag_name_en=:tag_name_en";
		$params = array(
			':tag_name_en'=>$tag
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data['tag_group_code'];
	}

	public function  getTagGroupCodeV2($tag){
		$query = "select tag_group_code from tbl_tags where tag_name=:tag_name";
		$params = array(
			':tag_name'=>$tag
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data['tag_group_code'];
	}

	//대표장르 목록
	public function getGoodsPrimaryGenreList(){
		$query = "select tag_code,tag_name from tbl_tags where tag_group_code='PG'";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		return $data;
	}

	//스팀상세설명 tag 변환
	public function setSteamDescriptionhtml($description){
		//h1 => h3
		$description_html = str_replace("<h1","<h3",$description);
		$description_html = str_replace("h1>","h3>",$description_html);

		//h2 => h4
		$description_html = str_replace("h2>","h4>",$description_html);
		$description_html = str_replace("<h2","<h4",$description_html);

		$description_html = str_replace("<h3>","<br/><hr><h3>",$description_html);

		return $description_html;
		
	}

	public function getPrimaryGenreName($genre_code){
		$query = "select tag_name from tbl_tags where tag_code=:tag_code";
		$params = array(
			':tag_code'=>$genre_code
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data['tag_name'];
	}

	public function getAgeLimit($age_limit){
		switch($age_limit){
			case "10":
				echo "<span class='badge bg-success font-13 fw-normal'>전체이용가</span>";
			break;
			case "12":
				echo "<span class='badge bg-primary font-13 fw-normal'>12세이용가</span>";
			break;
			case "15":
				echo "<span class='badge bg-warning font-13 fw-normal'>15세이용가</span>";
			break;
			case "18":
				echo "<span class='badge bg-danger font-13 fw-normal'>청소년이용불가</span>";
			break;
		}
	}

	public function getSteamAppRanking($page,$add_where,$orderby,$param){
		try{
			$query = "select a.appid,name,a.app_type,a.release_date,a.is_free,a.metacritic_score,a.recommendations,a.consumer_price,a.price,a.coming_soon,a.supported_languages,a.batch_date,a.recommendations/DATEDIFF(now(),a.release_date)as diff_per_day,DATEDIFF(now(),a.release_date)as diff,a.metacritic_score,a.publisher,a.developer from steam_app_list a  where a.app_type='game' and a.recommendations>0 ".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>'50',
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

	public function getAgeLimitLabel($age_limit){
		switch($age_limit){
			case "10":
				echo "전체이용가";
			break;
			case "12":
				echo "12세이용가";
			break;
			case "15":
				echo "15세이용가";
			break;
			case "18":
				echo "청소년이용불가";
			break;
		}
	}

	public function getSteamTag($appid){
		$query = "select tag_name from steam_tag where appid=:appid and tag_name<>'Multiplayer' and tag_name<>'Singleplayer' order by tag_name asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':appid'=>$appid
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();

		return $data;
	}

	public function getSteamTagKo($appid){
		$query = "select tag_name from steam_tag_ko where appid=:appid order by tag_name asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':appid'=>$appid
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();

		return $data;
	}

	public function getSteamTagToKo($tag_name){
		$query = "select tag_name from steam_tag_ko where tag_name=:tag_name";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':tag_name'=>$tag_name
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		return $data['tag_name'];
	}

	public function getSteamTagToEn($tag_name){
		$query = "select tag_name_ko from steam_tag where tag_name=:tag_name";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':tag_name'=>$tag_name
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		return $data['tag_name_ko'];
	}

	public function getSteamTagList($appid){
		$query = "select tag_name from steam_tag where appid=:appid and tag_name_ko is null order by tag_name asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':appid'=>$appid
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();

		$steam_tag_list = array();

		//등록된 태그는 제거
		$num =0;

		foreach($data as $key=>$value){
			$tag_group_code = $this->getTagGroupCode($value['tag_name']);
			//echo $tag_code;
			//if($tag_group_code<>'G1' and $tag_group_code<>'P1'){
			$steam_tag_list[]=$value['tag_name'];
			$num++;
			//}
		}
		
		//print_r($steam_tag_list);
		return $steam_tag_list;
	}

	public function getSteamTagList_v2($appid){
		$query = "select tag_name from steam_tag where appid=:appid and tag_name_ko is null order by tag_name asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':appid'=>$appid
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();

		$steam_tag_list = array();

		//등록된 태그는 제거
		$num =0;

		foreach($data as $key=>$value){
			$tag_group_code = $this->getTagGroupCode($value['tag_name']);
			//echo $tag_code;
			//if($tag_group_code<>'G1' and $tag_group_code<>'P1'){
			$steam_tag_list[]=$value['tag_name'];
			$num++;
			//}
		}
		
		//print_r($steam_tag_list);
		return $steam_tag_list;
	}

	public function getSteamTagList_ko($appid){
		$query = "select tag_name from steam_tag_ko where appid=:appid order by tag_name asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':appid'=>$appid
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();

		$steam_tag_list = array();

		//등록된 태그는 제거
		$num =0;

		foreach($data as $key=>$value){
			$tag_group_code = $this->getTagGroupCodeV2($value['tag_name']);
			//echo $tag_code;
			if($tag_group_code<>'G0001' and substr($tag_group_code,0,1)<>'P'){
			$steam_tag_list[]=$value['tag_name'];
			$num++;
			}
		}
		
		//print_r($steam_tag_list);
		return $steam_tag_list;
	}

	public function getProductItemTag($product_code){
		$query = "select tags from tbl_goods_item_tags where product_code=:product_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		return $data['tags'];
	}

	public function getTagName($tag_code){
		$query = "select tag_name from tbl_tags where tag_code=:tag_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':tag_code'=>$tag_code
		);
		$stmt->execute($params);
		//print_r($params);
		$data = $stmt->fetch();

		return $data['tag_name'];
	}

	public function getSteamAppChk($appid){
		$query = "select product_code,product_name from tbl_goods_item where steam_appid=:steam_appid";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':steam_appid'=>$appid
		);
		$stmt->execute($params);
		//print_r($params);
		$data = $stmt->fetch();

		return $data;
	}

	public function getTagChk($tag_name){
		$query = "select * from tbl_tags where tag_name_en=:tag_name_en";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':tag_name_en'=>addslashes($tag_name)
		);
		$stmt->execute($params);
		//print_r($params);
		$data = $stmt->fetch();

		return $data;
	}

	//관련 옵션상품 검색
	public function getNoticeProductSearch($search_value){
		$query = "select goods_sku,product_name,product_name_en,product_platform,publisher_code,product_type,genba_sku from tbl_goods_item where product_name like :product_name order by product_type asc";
		$stmt = $this->_db->prepare($query);
		$keyword = "%".$search_value."%"; 
		$params = array(
			':product_name'=>$keyword
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	//옵션상품 appid 검색
	public function getProductSearch($appid){
		$query = "select product_name from tbl_goods_item where steam_appid=:steam_appid";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':steam_appid'=>$appid
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}

	//퍼블리셔별 옵션상품목록
	public function getPublisherGoodsItemList($publisher_code,$start_dt,$end_dt){
		$query = "select product_code,product_name,product_type,release_date,status,product_platform,supplier_code,product_srp,price,start_date,end_date from tbl_goods_item where supplier_code=:publisher_code order by release_date asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':publisher_code'=>$publisher_code
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();

		return $data;
	}
	
	//공급처별 옵션상품수
	public function getPublisherGoodsItemCount($publisher_code){
		$query = "select count(*) from tbl_goods_item where supplier_code=:supplier_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':supplier_code'=>$publisher_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		return $data['0'];
	}

	//번들 json파일 읽기
	public function getSteamBundleItem($bundleid){
		$bundle_path = "/home/dgkrshop/www/upload/bundle/bundle_".$bundleid.".json";
		$bundle_item = array();
		if(file_exists($bundle_path)){
			$json_string = file_get_contents($bundle_path);
			$data = json_decode($json_string, true);
			foreach($data['data'] as $key=>$value){
				if (!is_array($value)) {
					$bundle_item[$key] = $value;
				}else{
					foreach($value as $sub_key=>$sub_value){
						if($sub_key=="bundle_data"){
							$bundle_data=json_decode("[".$sub_value."]",true);
							
							foreach($bundle_data['0'] as $bundle_key=>$bundle_value){
								if($bundle_key=="m_rgItems"){
									foreach($bundle_value as $item_key=>$item_value){
										//패키지 아이디 없음
										if($item_value['m_nPackageID']['0']=="" && $item_key =="m_nPackageID"){
											$bundle_item[$item_value['m_rgIncludedAppIDs']['0']]['appid'] = $item_value['m_rgIncludedAppIDs']['0'];
											$steam_app_info = $this->getSteamAppSearch($item_value['m_rgIncludedAppIDs']['0']);
											$dg_product_info = $this->getProductSearch($item_value['m_rgIncludedAppIDs']['0']);
											switch($steam_app_info['app_type']){
												case "game":
													$app_sort = "0";
												break;
												case "music":
													$app_sort = "1";
												break;
												case "dlc":
													$app_sort = "1";
												break;
											}

											if($dg_product_info['product_name']){
												$bundle_item[$item_value['m_rgIncludedAppIDs']['0']]['app_name_kr'] = $dg_product_info['product_name'];
											}else{
												$bundle_item[$item_value['m_rgIncludedAppIDs']['0']]['app_name_kr'] = "";
											}
											$bundle_item[$item_value['m_rgIncludedAppIDs']['0']]['app_type'] = $steam_app_info['app_type'];
											$bundle_item[$item_value['m_rgIncludedAppIDs']['0']]['release_date'] = $steam_app_info['release_date'];
											$bundle_item[$item_value['m_rgIncludedAppIDs']['0']]['app_sort'] = $app_sort;

											if($steam_app_info['is_free']){
												$bundle_item[$item_value['m_rgIncludedAppIDs']['0']]['app_name'] = "[무료]".$steam_app_info['name'];
											}else{
												$bundle_item[$item_value['m_rgIncludedAppIDs']['0']]['app_name'] = $steam_app_info['name'];
											}
										}else{
											//패키지 아이디 있음
											$package_appid = explode(",",$item_value['m_rgIncludedAppIDs']['0']);
											
											foreach($package_appid as $sub_key=>$sub_item){
												$bundle_item[$sub_item]['appid'] = $sub_item;
												$steam_app_info = $this->getSteamAppSearch($sub_item);
												$dg_product_info = $this->getProductSearch($sub_item);
												switch($steam_app_info['app_type']){
													case "game":
														$app_sort = "0";
													break;
													case "music":
														$app_sort = "1";
													break;
													case "dlc":
														$app_sort = "1";
													break;
												}

												if($dg_product_info['product_name']){
													$bundle_item[$sub_item]['app_name_kr'] = $dg_product_info['product_name'];
												}else{
													$bundle_item[$sub_item]['app_name_kr'] = $steam_app_info['name_kr'];
												}
												$bundle_item[$sub_item]['app_type'] = $steam_app_info['app_type'];
												$bundle_item[$sub_item]['release_date'] = $steam_app_info['release_date'];
												$bundle_item[$sub_item]['app_sort'] = $app_sort;

												if($steam_app_info['is_free']){
													$bundle_item[$sub_item]['app_name'] = "[무료]".$steam_app_info['name'];
												}else{
													$bundle_item[$sub_item]['app_name'] = $steam_app_info['name'];
												}
											}
										}
										
									}
								}
							}
						}
					}
				}
			}
			
			foreach ((array) $bundle_item as $key => $value) {
				$sort[$key] = $value['app_sort'];
				$sort2[$key] = $value['app_name'];
			}

			array_multisort($sort, SORT_ASC,$sort2, SORT_DESC, $bundle_item);
		}
		return $bundle_item;
	}

	public function getSteamPackageItem_v2($packageid){
		$query = "select a.*,b.app_type,b.name_kr from steam_package_item a inner join steam_game b on a.appid=b.steam_appid where a.packageid=:packageid order by a.appid asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':packageid'=>$packageid
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}
	
	public function getSteamPackageInfo($packageid){
		$query = "select * from steam_package where packageid=:packageid group by packageid";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':packageid'=>$packageid
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}

	//package json파일 읽기
	public function getSteamPackageItem($packageid){
		$package_path = "/home/dgkrshop/www/upload/package/package_".$packageid.".json";
		$package_item = array();
		$app_sort = "";
		if(file_exists($package_path)){
			$json_string = file_get_contents($package_path);
			$data = json_decode($json_string, true);

			foreach($data['data'] as $key=>$value){
				if (!is_array($value)) {
					$package_item[$key] = $value;
				}else{
					foreach($value as $sub_key=>$sub_value){
						if($sub_key=="package_data"){
							$package_data=json_decode("[".$sub_value."]",true);
							foreach($package_data as $bundle_key=>$bundle_value){
								if($bundle_key=="m_rgItems"){
									foreach($bundle_value['m_rgItems'] as $item_key=>$item_value){
										$package_item[$item_key]['appid'] = $item_value['m_rgIncludedAppIDs']['0'];
										$steam_app_info = $this->getSteamAppSearch($item_value['m_rgIncludedAppIDs']['0']);
										$dg_product_info = $this->getProductSearch($item_value['m_rgIncludedAppIDs']['0']);
										switch($steam_app_info['app_type']){
											case "game":
												$app_sort = "0";
											break;
											case "music":
												$app_sort = "1";
											break;
											case "dlc":
												$app_sort = "1";
											break;
										}

										if($dg_product_info['product_name']){
											$package_item[$item_key]['app_name_kr'] = $dg_product_info['product_name'];
										}else{
											$package_item[$item_key]['app_name_kr'] = $steam_app_info['name_kr'];
										}

										$package_item[$item_key]['app_type'] = $steam_app_info['app_type'];
										$package_item[$item_key]['release_date'] = $steam_app_info['release_date'];
										$package_item[$item_key]['app_sort'] = $app_sort;

										if($steam_app_info['is_free']){
											$package_item[$item_key]['app_name'] = "[무료]".$steam_app_info['name'];
										}else{
											$package_item[$item_key]['app_name'] = $steam_app_info['name'];
										}
										
									}
								}
							}
						}
					}
				}
			}
			
			foreach ((array) $package_item as $key => $value) {
				$sort[$key] = $value['app_sort'];
				$sort2[$key] = $value['app_name'];
			}

			if(count($package_item)>0){
				array_multisort($sort, SORT_ASC,$sort2, SORT_DESC, $package_item);
				return $package_item;
			}
		}
	}

	//스팀 App json정보
	public function getSteamAppJSON($appids){
		$ch = curl_init();
		$url = "https://store.steampowered.com/api/appdetails?l=koreana&appids=".$appids;
		curl_setopt($ch,CURLOPT_URL, $url);
		curl_setopt($ch,CURLOPT_POST, false);
		curl_setopt($ch, CURLOPT_SSLVERSION, '6');
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
		curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, "5");
			$agents = array(
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.7; rv:7.0.1) Gecko/20100101 Firefox/7.0.1',
			'Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.9.1.9) Gecko/20100508 SeaMonkey/2.0.4',
			'Mozilla/5.0 (Windows; U; MSIE 7.0; Windows NT 6.0; en-US)',
			'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_7; da-dk) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1'
		 
		);
		curl_setopt($ch,CURLOPT_USERAGENT,$agents[array_rand($agents)]);
		$response = curl_exec($ch);
		$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		curl_close ($ch);
		$data  = json_decode($response);

		return $data;
	}

	//스팀 저장된 app json정보
	public function getAppJSON($appids){

	}

	//이미지 리사이징
	public function resizeImage($tmp_width,$tmp_height,$target_quality,$image_url,$image_path,$filename){
		$im_jpg = imagecreatefromjpeg($image_url);

		$width = imagesx($im_jpg);
		$height = imagesy($im_jpg);

		$new_image = imagecreatetruecolor($tmp_width,$tmp_height);

		imagecopyresampled($new_image, $im_jpg,0,0,0,0, $tmp_width, $tmp_height, $width, $height);

		imagejpeg($new_image,$image_path.$filename,$target_quality);
		$image_buffer = ob_get_contents();
		imagedestroy($new_image);
		if( ob_get_level() > 0 ){
			ob_flush();
			flush();
			ob_end_flush();
		}
	}

	//대표상품 스크린샷 목록
	public function getTitleScreenshotList($title_id){
		$query = "select idx,screenshot_num,file_name,file_size,file_type,url,thumbnail,domain,sort from tbl_goods_screenshot where title_id=:title_id order by sort asc,screenshot_num asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':title_id'=>$title_id
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
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

	//스팀 이미지 존재여부 체크
	public function getSteamImageChk($appid){
		$query = "select appid,is_header,is_capsule_231,is_capsule_120,is_capsule_616,is_library,is_hero from steam_image_chk where appid=:appid";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':appid'=>$appid
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}
	
	public function getSteamPackageImageChk($packageid){
		$query = "select packageid,is_header,is_capsule_231,is_capsule_120 from steam_package_image_chk where packageid=:packageid";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':packageid'=>$packageid
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}

	//스팀정보조회
	public function getSteamInfo($appid){
		$query = "select genre,category from steam_game where steam_appid=:appid";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':appid'=>$appid
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}

	//스팀 장르조회
	public function getSteamGenre($appid){
		$query = "select genres_id,genres_name from steam_game_genre where appid=:appid";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':appid'=>$appid
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	//스팀 카테고리조회
	public function getSteamCategory($appid){
		$query = "select category_id,category_name from steam_game_category where appid=:appid";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':appid'=>$appid
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	//구매특전 검색
	public function getGoodsSpecialSearch($title_name){
		$query = "select * from tbl_special_info where special_name like :special_name";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':special_name'=>$title_name."%"
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}
	
	//UUID 생성
	public function uuidgen4() {
	   return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
		  mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff),
		  mt_rand(0, 0x0fff) | 0x4000, mt_rand(0, 0x3fff) | 0x8000,
		  mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
		);
	}

	//Asset 현황
	public function getAssetList($page,$add_where,$orderby,$param){
		try{
			$query = "select * from tbl_asset where publisher<>'EA' and is_view='Y' ".$add_where." order by ".$orderby;
			
			//echo $query;

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

	public function getAssetCodeList($group_id){
		$query = "select code_id,name from directgames.tbl_asset_code where group_id=:group_id order by name asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':group_id'=>$group_id
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();

		return $data;
	}

	//개별 Asset Code값 조회
	public function getAssetCodeInfo($code_id){
		$query = "select name from directgames.tbl_asset_code where code_id=:code_id";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':code_id'=>$code_id
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		return $data['name'];
	}
	
	public function getAssetCode($group_id,$name){
		$query = "select code_id from tbl_asset_code where group_id=:group_id and name=:name";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':group_id'=>$group_id,
			':name'=>$name
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		return $data['code_id'];
	}

	//입고현황
	public function getAssetStockInList($page,$add_where,$orderby,$param){
		try{
			$query = "select * from tbl_asset_stock_log where 1=1 ".$add_where." order by ".$orderby;

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

	//발주현황
	public function getAssetPlacingOrder($page,$add_where,$orderby,$param){
		try{
			$query = "select * from tbl_placing_order where 1=1 ".$add_where." order by ".$orderby;

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

	//Asset ID별 입고/출고합계
	public function getAssetStockHistoryCount($asset_id,$stock_type){
		$query = "select sum(qty) from tbl_asset_stock_log where asset_id=:asset_id and stock_type=:stock_type group by asset_id";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':asset_id'=>$asset_id,
			':stock_type'=>$stock_type
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		return $data['0'];
	}

	//일별 입고합계
	public function  getAssetStockInDaySum($start_date,$end_date){
		$query = "select date_format(warehousing_date,'%Y-%m-%d')as warehousing_date,sum(qty)as total_qty,sum(qty*unit_price) as total_price from tbl_asset_stock_log where warehousing_date between :start_date and :end_date and stock_type='+' group by date_format(warehousing_date,'%Y-%m-%d')";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':start_date'=>$start_date,
			':end_date'=>$end_date
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();

		return $data;
	}

	//개별 Asset 정보조회
	public function getAssetInfo($asset_id){
		$query = "select asset_id,asset_name,productType,assetType,platform,publisher from tbl_asset where asset_id=:asset_id";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':asset_id'=>$asset_id
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}

	//공급처별 Asset현황
	public function getAssetPublisherCount(){
		$query = "select publisher,assetType,count(*)as cc from tbl_asset group by publisher,assetType order by publisher asc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		return $data;
	}

	//공급처별 Asset리스트
	public function getAssetPublisher($publisher){
		$query = "select asset_id,asset_name,productType,assetType,platform,publisher from tbl_asset where publisher=:publisher";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':publisher'=>$publisher
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}
	
	//공급처별 발주가능 Asset리스트
	public function getAssetPublisherPlacingOrder($add_where){
		$query = "select asset_id,asset_name,asset_srp,asset_ppr,productType,assetType,platform,publisher,stock,batch_date from tbl_asset where assetType<>'임시코드' and assetType<>'랜덤박스' and assetType<>'판매종료' and productType<>'특전' and assetType<>'패키지해체' ".$add_where." order by stock asc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		return $data;
	}

	public function getPromotionInfo($promotion_idx){
		$query = "select promotion_nm,promotion_start,promotion_end from tbl_promotion where idx=:idx";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':idx'=>$promotion_idx
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}


	//프로모션 상품현황
	public function getPromotionGoodsList($promotion_idx){
		$query = "select * from tbl_promotion_goods where parent_idx=:parent_idx";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':parent_idx'=>$promotion_idx
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	//프로모션별 옵션상품별 판매현황
	public function getPromotionSales($product_code,$promotion_start,$promotion_end){
		$query = "select sum(sales_count)as cc,sum(sales_count*unit_price)as total,unit_price from tbl_sales_promotion where product_code=:product_code and promotion_start=:promotion_start and promotion_end=:promotion_end  group by product_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code,
			':promotion_start'=>$promotion_start,
			':promotion_end'=>$promotion_end,
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}

	public function getPromotionPublisherSales($publisher_code,$promotion_start,$promotion_end){
		$query = "select unit_price,sum(sales_count)as cc,sum(sales_count*unit_price)as total from tbl_sales_promotion a inner join tbl_goods_item b on a.product_code=b.product_code where b.supplier_code=:publisher_code and a.promotion_start=:promotion_start and a.promotion_end=:promotion_end group by b.supplier_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':publisher_code'=>$publisher_code,
			':promotion_start'=>$promotion_start,
			':promotion_end'=>$promotion_end,
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}

	//프로모션별 - 상품별 세일즈 통계
	public function getPromotionGoodsSales($promotion_idx,$product_code){
		$query = "select * from tbl_sales_promotion where promotion_idx=:promotion_idx and product_code=:product_code order by day_diff asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':promotion_idx'=>$promotion_idx,
			':product_code'=>$product_code,
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	//프로모션 상품 진행이력
	public function getPromotionGoodsHistory($page,$add_where,$orderby,$param){
		try{
			$query = "select * from tbl_promotion a inner join tbl_promotion_goods b on a.idx=b.parent_idx where 1=1 ".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>'50',
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

	public function getPromotionHistory($page,$add_where,$orderby,$param){
		try{
			$query = "select a.*,b.product_name,b.game_type,b.display_type,b.release_date,b.product_platform from tbl_promotion_schedule a inner join tbl_goods_item b on a.product_code=b.product_code where a.discount_rate>'0' ".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>'50',
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

	public function getPromotionPublisher($page,$add_where,$orderby,$param){
		try{
			$query = "select a.publisher_code,a.promotion_type,a.promotion_gubun,a.promotion_label,sum(b.sales_count)as sales_count,sum(b.sales_count*b.unit_price)as sales_price,a.promotion_start,a.promotion_end,count(distinct b.product_code)as cc,max(a.discount_rate)as max_discount from tbl_promotion_schedule a inner join tbl_sales_promotion b on a.product_code=b.product_code and a.promotion_start=b.promotion_start and a.promotion_end=b.promotion_end and a.sale_price=b.unit_price where 1=1 ".$add_where." group by a.publisher_code order by ".$orderby;

			//echo $query;

			$options = array(
				'results_per_page' =>'200',
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

	public function getPromotionGroupList($page,$add_where,$orderby,$param){
		try{
			$query = "select a.promotion_type,a.promotion_gubun,a.promotion_label,a.publisher_code,a.product_code,count(*)as cc,date_format(a.promotion_start,'%Y')as promotion_year,date_format(a.promotion_start,'%m')as promotion_month,date_format(a.promotion_start,'%Y-%m-%d')as promotion_day,a.promotion_start,a.promotion_end,max(discount_rate)as max_discount from tbl_promotion_schedule a where 1=1 ".$add_where." group by a.promotion_type,a.promotion_gubun,a.publisher_code,a.promotion_start,a.promotion_end order by ".$orderby;

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

	//대표상품별 매출현황
	public function getGoodsSalesRanking($page,$add_where,$orderby,$param,$search_year){
		try{
			if($search_year){
				$query = "select t2.title_id,sum(t1.total_count)as total_count,sum(t1.unit_price*t1.total_count)as total_price from (select product_code,unit_price,sum(sales_count)as total_count  from tbl_sales where date_format(ord_ymd,'%Y')='".$search_year."' group by product_code,unit_price order by product_code asc,unit_price asc)as t1 inner join tbl_goods_option t2 on t2.product_code=t1.product_code inner join tbl_goods_item t3 on t3.product_code=t2.product_code where t3.game_type ".$add_where." group by t2.title_id order by ".$orderby;
			}else{
				$query = "select t2.title_id,sum(t1.total_count)as total_count,sum(t1.unit_price*t1.total_count)as total_price from (select product_code,unit_price,sum(sales_count)as total_count  from tbl_sales group by product_code,unit_price order by product_code asc,unit_price asc)as t1 inner join tbl_goods_option t2 on t2.product_code=t1.product_code inner join tbl_goods_item t3 on t3.product_code=t2.product_code where t3.game_type ".$add_where." group by t2.title_id order by ".$orderby;
			}
			

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
	
	public function getTitleSalesCount($start_date,$end_date){
		$query = "select b.title_id,b.product_type,sum(t.sales_count)as total_count,sum(t.sales_count*t.unit_price)as total_price from (select product_code,product_name,sales_count,unit_price from tbl_sales where ord_ymd between :start_date and :end_date )as t inner join tbl_title_option b on t.product_code=b.product_code group by b.title_id,b.product_code,b.product_type";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':start_date'=>$start_date,
			':end_date'=>$end_date,
		);

		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	public function getGoodsSalesCount($start_date,$end_date){
		$query = "  select a.title_id,a.title_name,c.product_code,c.product_name,b.product_type,sum(c.sales_count)as total_count,sum(c.sales_count*c.unit_price)as total_price from tbl_goods a inner join tbl_title_option b on a.title_id=b.title_id inner join tbl_sales c on c.product_code=b.product_code where c.ord_ymd between :start_date and :end_date group by c.product_code order by c.product_code asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':start_date'=>$start_date,
			':end_date'=>$end_date,
		);

		
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	//인기타이틀 순위
	public function getTitleRanking($page,$add_where,$orderby,$param){
		try{
			$query = " select sum(a.total_count)as total_count,sum(a.total_price)as total_price,sum(a.dlc_count)as dlc_count,sum(ifnull(a.dlc_price, '0'))as dlc_price ,b.* from tbl_sales_ranking a inner join tbl_goods b on a.title_id=b.title_id where b.title_id is not null ".$add_where." group by a.title_id order by sum(total_price+ifnull(a.dlc_price, '0')) desc";

			$options = array(
				'results_per_page' =>'50',
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

	//옵션상품별 매출현황
	public function getGoodsOptionSalesInfo($title_id,$app_type,$search_year){
		switch($app_type){
			case "Game":
				if($search_year){
					$query = "select t2.product_code,t3.product_name,t3.product_type,t3.product_platform,t3.release_date,sum(t1.total_count)as total_count,sum(t1.unit_price*t1.total_count)as total_price from (
				   select product_code,unit_price,sum(sales_count)as total_count  from tbl_sales where date_format(ord_ymd,'%Y')='".$search_year."' group by product_code,unit_price order by product_code asc,unit_price asc
				   )as t1 inner join tbl_goods_option t2 on t2.product_code=t1.product_code inner join tbl_goods_item t3 on t3.product_code=t2.product_code  
				   where t2.title_id=:title_id and find_in_set(t3.product_type,'1,2,5') group by t2.product_code order by sum(t1.unit_price*t1.total_count) desc";
				}else{
					$query = "select t2.product_code,t3.product_name,t3.product_type,t3.product_platform,t3.release_date,sum(t1.total_count)as total_count,sum(t1.unit_price*t1.total_count)as total_price from (
				   select product_code,unit_price,sum(sales_count)as total_count  from tbl_sales group by product_code,unit_price order by product_code asc,unit_price asc
				   )as t1 inner join tbl_goods_option t2 on t2.product_code=t1.product_code inner join tbl_goods_item t3 on t3.product_code=t2.product_code  
				   where t2.title_id=:title_id and find_in_set(t3.product_type,'1,2,5') group by t2.product_code order by sum(t1.unit_price*t1.total_count) desc";
				}
			break;
			case "DLC":
				if($search_year){
					$query = "select t2.product_code,t3.product_name,t3.product_type,t3.product_platform,t3.release_date,sum(t1.total_count)as total_count,sum(t1.unit_price*t1.total_count)as total_price from (
				   select product_code,unit_price,sum(sales_count)as total_count  from tbl_sales where date_format(ord_ymd,'%Y')='".$search_year."' group by product_code,unit_price order by product_code asc,unit_price asc
				   )as t1 inner join tbl_goods_option t2 on t2.product_code=t1.product_code inner join tbl_goods_item t3 on t3.product_code=t2.product_code  
				   where t2.title_id=:title_id and find_in_set(t3.product_type,'3,4') group by t2.product_code order by sum(t1.unit_price*t1.total_count) desc";
				}else{
					$query = "select t2.product_code,t3.product_name,t3.product_type,t3.product_platform,t3.release_date,sum(t1.total_count)as total_count,sum(t1.unit_price*t1.total_count)as total_price from (
				   select product_code,unit_price,sum(sales_count)as total_count  from tbl_sales group by product_code,unit_price order by product_code asc,unit_price asc
				   )as t1 inner join tbl_goods_option t2 on t2.product_code=t1.product_code inner join tbl_goods_item t3 on t3.product_code=t2.product_code  
				   where t2.title_id=:title_id and find_in_set(t3.product_type,'3,4') group by t2.product_code order by sum(t1.unit_price*t1.total_count) desc";
				}
			break;
			case "Bundle":
				if($search_year){
					$query = "select t2.product_code,t3.product_name,t3.product_type,t3.product_platform,t3.release_date,sum(t1.total_count)as total_count,sum(t1.unit_price*t1.total_count)as total_price from (
				   select product_code,unit_price,sum(sales_count)as total_count  from tbl_sales where date_format(ord_ymd,'%Y')='".$search_year."' group by product_code,unit_price order by product_code asc,unit_price asc
				   )as t1 inner join tbl_goods_option t2 on t2.product_code=t1.product_code inner join tbl_goods_item t3 on t3.product_code=t2.product_code  
				   where t2.title_id=:title_id and find_in_set(t3.product_type,'8') group by t2.product_code order by sum(t1.unit_price*t1.total_count) desc";
				}else{
					$query = "select t2.product_code,t3.product_name,t3.product_type,t3.product_platform,t3.release_date,sum(t1.total_count)as total_count,sum(t1.unit_price*t1.total_count)as total_price from (
				   select product_code,unit_price,sum(sales_count)as total_count  from tbl_sales group by product_code,unit_price order by product_code asc,unit_price asc
				   )as t1 inner join tbl_goods_option t2 on t2.product_code=t1.product_code inner join tbl_goods_item t3 on t3.product_code=t2.product_code  
				   where t2.title_id=:title_id and find_in_set(t3.product_type,'8') group by t2.product_code order by sum(t1.unit_price*t1.total_count) desc";
				}
				
			break;
		}
		
		$stmt = $this->_db->prepare($query);
		$params = array(
			':title_id'=>$title_id,
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	//상품별 최근 진행된 프로모션 판매실적
	public function getLastPromotionGoodsSales($asset_id){
		$query = "select promotion_idx,sum(sales_count)as cc,avg(sales_count)as avg from tbl_sales_promotion where asset_id=:asset_id group by promotion_idx order by promotion_idx desc limit 1";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':asset_id'=>$asset_id,
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}

	public function getPromotionTitle($promotion_type,$promotion_gubun,$promotion_label,$product_code,$promotion_start){
		$title_info = $this->getTitleInfo($product_code);

		switch($promotion_type){
			case "정규(대)":
				switch($promotion_gubun){
					case "1":case "2":
						$promotion_title = "[".$this->getPublisherNameSearch($product_code)."] ".substr($promotion_start,0,4)."년 봄맞이 ".$promotion_label;
					break;
					case "3":case "4":
						$promotion_title = "[".$this->getPublisherNameSearch($product_code)."] ".substr($promotion_start,0,4)."년 여름 ".$promotion_label;
					break;
					case "5":case "6":
						$promotion_title = "[".$this->getPublisherNameSearch($product_code)."] ".substr($promotion_start,0,4)."년 추석 ".$promotion_label;
					break;
					case "7":case "8":
						$promotion_title = "[".$this->getPublisherNameSearch($product_code)."] ".substr($promotion_start,0,4)."년 겨울 ".$promotion_label;
					break;
				}
				
			break;
			case "정규(중)":
				switch($promotion_gubun){
					case "9":
						$promotion_title = "[".$this->getPublisherNameSearch($product_code)."] ".substr($promotion_start,0,4)."년 설날 ".$promotion_label;
					break;
					case "10":
						$promotion_title = "[".$this->getPublisherNameSearch($product_code)."] ".substr($promotion_start,0,4)."년 할로윈 ".$promotion_label;
					break;
					case "11":
						$promotion_title = "[".$this->getPublisherNameSearch($product_code)."] ".substr($promotion_start,0,4)."년 블랙프라이데이 ".$promotion_label;
					break;
				}
			break;
			case "정규(소)":
				$promotion_title = "[".$this->getPublisherNameSearch($product_code)."] ".$title_info['title_name']." 주말 ".$promotion_label;
			break;
			case "플래시":
				switch($promotion_gubun){
					case "20":
						$promotion_title = "[".$this->getPublisherNameSearch($product_code)."] ".$promotion_label;
					break;
					case "22":case "23":
						$promotion_title = "[".$this->getPublisherNameSearch($product_code)."] ".$title_info['title_name']." ".$promotion_label;
					break;
					case "31":
						$promotion_title = "[".$this->getPublisherNameSearch($product_code)."] ".$promotion_label;
					break;
				}
				
			break;
			case "신규":
				switch($promotion_gubun){
					case "13":
						$promotion_title = "[".$this->getPublisherNameSearch($product_code)."] ".$promotion_label;
					break;
					case "16": case "17":
						$promotion_title = "[".$this->getPublisherNameSearch($product_code)."] ".$title_info['title_name']." ".$promotion_label;
					break;
					case "19":case "18":
						$goods_item_info = $this->getGoodsItemInfo($product_code);
						$promotion_title = "[".$goods_item_info['product_name']."] ".$promotion_label;
					break;
				}
				
			break;
		}

		return $promotion_title;
	}

	public function getWeek($date){
		$DEFAULT_DAYS = 1; //1 ~ 7 (월 ~ 일)
		list($yy, $mm, $dd) = explode('-', $date); // - 로 잘라서 연,월,일을 구합니다
		$first_day = date('N', mktime(0,0,0,$mm, 1, $yy)); //입력한 날짜의 해당하는 월의 1일이 몇요일인지 구합니다.
		
		if($first_day <= $DEFAULT_DAYS){  
			$remain_days = $DEFAULT_DAYS - $first_day;
			$next_monday = $remain_days +1;
		}else{
			$remain_days= 7 - $first_day; //1일을 기준으로 해당주가 몇일 남았는지 구합니다.
			$next_monday = $remain_days + $DEFAULT_DAYS +1; //1일 기준으로 차주의 월요일이 몇일인지 구합니다.
		}

		if($dd < $next_monday){ //입력한 날짜가 전달의 마지막주에 포함될 경우.
			$new_date = date('Y-m-d', mktime(0,0,0,$mm,0,$yy)); //날짜를 0으로 입력해서 지난달의 마지막 주를 새로계산하도록 합니다.
			return $this->getWeek($new_date);
		}else{
			$week = $mm."월 ".ceil(($dd-($next_monday -1))/7); //몇번째 주차인지 구하기.
			return $week;
		}
	}

	//타임딜 진행이력
	public function getTimedealHistory($product_code){
		$query = "select a.* from tbl_timedeal a inner join tbl_goods_item b on a.product_code=b.product_code where a.product_code=:product_code order by a.timedeal_start asc,a.timedeal_end asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code,
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	//추가적립금 프로모션 진행이력
	public function getAddRepayHistory($product_code){
		$query = "select a.* from tbl_add_repay a inner join tbl_goods_item b on a.product_code=b.product_code where a.product_code=:product_code order by a.start_date asc,a.end_date asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code,
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	//오늘출시 타이틀
	public function getSteamComingSoonList($term_type,$add_where){
		switch($term_type){
			case "0":
				$query = "select * from steam_app_list where coming_soon_date='".date('Y-m-d')."' ".$add_where." order by coming_soon_date asc";
				$stmt = $this->_db->prepare($query);
			break;
			case "1":
				$query = "select * from steam_app_list where coming_soon_date BETWEEN (CURDATE()) AND (SELECT ADDDATE(CURDATE(), - WEEKDAY(CURDATE()) + 6 )) ".$add_where ." order by coming_soon_date asc";
				$stmt = $this->_db->prepare($query);
			break;
			case "2":
				$query = "select * from steam_app_list where coming_soon_date BETWEEN (SELECT ADDDATE(CURDATE(), - WEEKDAY(CURDATE()) + 7 )) AND (SELECT ADDDATE(CURDATE(), - WEEKDAY(CURDATE()) + 13 )) ".$add_where ." order by coming_soon_date asc";
				$stmt = $this->_db->prepare($query);
			break;
			case "3":
				$query = "select * from steam_app_list where DATE_FORMAT(coming_soon_date,'%Y-%m')=DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 MONTH),'%Y-%m') and coming_soon_date>(SELECT ADDDATE(CURDATE(), - WEEKDAY(CURDATE()) + 13 )) ".$add_where ." order by coming_soon_date asc";
				$stmt = $this->_db->prepare($query);
			break;
		}

		$stmt->execute();
		$data = $stmt->fetchAll();
		return $data;
	}
	
		//Asset 월별 판매현황
	public function getOrderAssetDayCount($page,$add_where,$orderby,$param){
		try{
			$query = "select a.asset_id,a.asset_name,a.publisher,a.assetType,a.platform,a.productType,count(b.asset_id)as total_count from tbl_asset a inner join tbl_order_item_asset b on a.asset_id=b.asset_id where a.publisher<>'Naverpay' and a.assetType<>'구매특전' ".$add_where." group by b.asset_id  order by total_count desc";

			$options = array(
				'results_per_page' =>'50',
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
	
	//Asset 월별 판매현황
	public function getOrderAssetMonthCount($page,$add_where,$orderby,$param){
		try{
			$query = "select a.asset_id,b.asset_name,a.publisher,a.assetType,a.platform,a.productType,count(b.asset_id)as total_count from tbl_asset a inner join tbl_order_item_asset b on a.asset_id=b.asset_id where a.publisher<>'Naverpay'  and a.assetType<>'구매특전' ".$add_where." group by b.asset_id  order by total_count desc";

			$options = array(
				'results_per_page' =>'50',
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
	
	//Asset 누적 판매현황
	public function getOrderAssetTotalCount($page,$add_where,$orderby,$param){
		try{
			$query = "select a.asset_id,a.asset_name,a.publisher,a.assetType,a.platform,a.productType,count(b.asset_id)as total_count from tbl_asset a inner join tbl_order_item_asset b on a.asset_id=b.asset_id where a.publisher<>'Naverpay' and a.assetType<>'임시코드' and a.assetType<>'구매특전' group by b.asset_id order by total_count desc";

			$options = array(
				'results_per_page' =>'100',
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
	

	//Genba 누적 판매현황
	public function getOrderGenbaCount($page,$add_where,$orderby,$param){
		try{
			$query = "select Sku,Name,Publisher,count(*)as total_count,sum(NetAmount)as total_NetAmount,sum(GrossAmount)as total_GrossAmount,sum(ActualBuyingPrice)as total_ActualBuyingPrice from tbl_order_item_genba where Sku is not null group by Sku order by sum(NetAmount)-sum(ActualBuyingPrice) desc";

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
	
	//Genba 퍼블리셔 판매현황
	public function getOrderGenbaPublisherCount($page,$add_where,$orderby,$param){
		try{
			$query = "select Publisher,count(*)as total_count,sum(NetAmount)as total_NetAmount,sum(GrossAmount)as total_GrossAmount,sum(ActualBuyingPrice)as total_ActualBuyingPrice from tbl_order_item_genba where Sku is not null group by Publisher order by sum(NetAmount)-sum(ActualBuyingPrice) desc";

			$options = array(
				'results_per_page' =>'100',
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
	
	//Vaultn 누적 판매현황
	public function getOrderVaultnCount($page,$add_where,$orderby,$param){
		try{
			$query = "select sku,Name,publisherName,count(*)as total_count,sum(salesPriceGross)as total_GrossAmount,sum(salesPriceGross/1.1)as total_NetAmount,sum(netPurchasePrice)as total_ActualBuyingPrice from tbl_order_item_vaultn where sku is not null group by sku order by sum(salesPriceGross-netPurchasePrice) desc";

			$options = array(
				'results_per_page' =>'100',
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
	
	
	//26-03-20(금) 11:48 [이종석] 홀로모델 판매현황
	public function getHolomodelsSalesCount($start_date,$end_date){
		$query = "SELECT a.title_id, a.product_type, b.product_code, b.product_name, SUM(b.sales_count) AS sales_count, SUM(b.sales_count * b.unit_price) AS sales_amount FROM tbl_title_option a INNER JOIN tbl_sales b ON a.product_code = b.product_code WHERE a.product_type='holomodels' AND b.ord_ymd BETWEEN :start_date AND :end_date GROUP BY a.product_type, b.product_code, b.product_name ORDER BY sales_count DESC";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':start_date'=>$start_date,
			':end_date'=>$end_date,
		);

		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}


	//클래스 소멸자
	public function __destruct() {
		$this->_db=null;
	}
}
?>