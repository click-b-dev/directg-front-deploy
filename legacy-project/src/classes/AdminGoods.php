<?
class AdminGoods extends Pagination{
	private $_db;
	
	//클래스 생성자
	public function __construct(PDO $db){
		$this->_db = $db;
	}
	
	public function getGoodsImageChkList($page,$add_where,$orderby,$param){
		try{
			$query = "select * from tbl_goods a inner join steam_image_chk b on a.steam_appid=b.appid where a.sales_status<>'E' ".$add_where." order by ".$orderby;

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

	public function getGoodsOptionList($page,$add_where,$orderby,$param){
		try{
			$query = "select * from tbl_goods where is_chk<>'Y' ".$add_where." order by ".$orderby;

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
	
	//옵션상품 재고현황
	public function getGoodsOptionStockList($page,$add_where,$orderby,$param,$results_per_page){
		try{
			$query = "select a.product_code,a.product_name,a.soldout,a.status,b.item_id,b.item_name,b.item_type,b.item_platform,b.item_publisher,b.stock,b.update_date from tbl_goods_item a inner join tbl_goods_item_delivery b on a.product_code=b.product_code where b.order_system='1' and a.status<>'3' ".$add_where." order by ".$orderby;
			
			//echo $query;

			$options = array(
				'results_per_page' =>$results_per_page,
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
	
	//할인 프로모션 진행중인 옵션상품 재고현황
	public function getGoodsPromotionStockList($page,$add_where,$orderby,$param,$results_per_page){
		try{
			$query = "select a.product_code,a.product_name,a.soldout,a.status,b.item_id,b.item_name,b.item_type,b.item_platform,b.item_publisher,b.stock,b.update_date from tbl_goods_item a inner join tbl_goods_item_delivery b on a.product_code=b.product_code inner join tbl_promotion_schedule c on c.product_code=a.product_code where b.order_system='1' and a.status<>'3' and timestampdiff(second,now(),c.promotion_start)<'0' and timestampdiff(second,now(),c.promotion_end)>='0' ".$add_where." order by ".$orderby;
			
			//echo $query;

			$options = array(
				'results_per_page' =>$results_per_page,
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
	
	public function getTitleID($product_code){
		$query = "select title_id from tbl_title_option where product_code=:product_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		
		return $data;
	}
	
	//Asset 정보 조회
	public function getAssetInfo($asset_id){
		$query = "select * from tbl_asset where asset_id=:asset_id";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':asset_id'=>$asset_id
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		return $data;
	}

	//옵션상품 상세설명류 저장 (tbl_goods_item_description upsert — 허용 컬럼만)
	public function setGoodsItemDescription($product_code,$column,$value){
		$allowed = array('description','description_v2','short_description','region_msg','requirements','legal_text','bonus_description');
		if(!in_array($column, $allowed, true)){
			return false;
		}
		//description_v2(스마트에디터)는 version='2' 함께 갱신
		$extra = ($column === 'description_v2') ? ",version='2'" : "";
		$query = "insert into tbl_goods_item_description set ".$column."=:value,product_code=:product_code,reg_date=now() ON DUPLICATE KEY UPDATE ".$column."=:value".$extra;
		$stmt = $this->_db->prepare($query);
		$params = array(
			':value'=>$value,
			':product_code'=>$product_code
		);
		$stmt->execute($params);

		return $stmt->rowCount();
	}

	//Steam 이미지 체크 플래그 저장 (steam_image_chk upsert — 허용 컬럼만)
	public function setSteamImageChk($appid,$column,$value){
		$allowed = array('is_header','is_capsule_231');
		if(!in_array($column, $allowed, true)){
			return false;
		}
		$query = "insert into steam_image_chk set appid=:appid,".$column."=:value,reg_date=now() ON DUPLICATE KEY UPDATE update_date=now(),".$column."=:value";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':appid'=>$appid,
			':value'=>$value
		);
		$stmt->execute($params);

		return $stmt->rowCount();
	}

	//스크린샷 정렬 순서 변경 (up=sort-1, down=sort+1)
	public function setScreenshotSort($idx,$direction){
		$op = ($direction === 'up') ? 'sort-1' : 'sort+1';
		$query = "update tbl_goods_item_screenshot set sort=".$op." where idx=:idx";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':idx'=>$idx
		);
		$stmt->execute($params);

		return $stmt->rowCount();
	}

	//대표상품 정보조회
	public function getTitleInfo($product_code){
		$query = "select a.title_id,a.title_name,a.title_name_en,a.age_limit,a.game_rate,a.release_date,a.steam_appid,a.release_date,a.publisher,a.genre,a.drm_notice,a.ext_user_account_notice,a.sku from tbl_goods a inner join tbl_title_option b on a.title_id=b.title_id where b.product_code=:product_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		return $data;
	}
	
	//옵션상품 공급처조회
	public function getGoodsItemPublisher($product_code){
		$query = "select supplier_code from tbl_goods_item where product_code=:product_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		return $data['supplier_code'];
	}
	
	//대표상품 연령정보
	public function getTitleAgeLimit($title_id){
		$query = "select age_limit from tbl_goods where title_id=:title_id";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':title_id'=>$title_id
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		return $data['age_limit'];
	}
	
	//옵션상품 대표상품설정
	public function setTitleAdd($product_code,$title_id,$game_type,$bundle_type){
		switch($game_type){
			case "game":
				$query = "insert into tbl_title_option set product_code=:product_code,title_id=:title_id,product_type='game'";
			break;
			case "dlc":
				$query = "insert into tbl_title_option set product_code=:product_code,title_id=:title_id,product_type='dlc'";
			break;
			case "bundle":
				if($bundle_type=="1"){
					$query = "insert into tbl_title_option set product_code=:product_code,title_id=:title_id,product_type='edition'";
				}else{
					$query = "insert into tbl_title_option set product_code=:product_code,title_id=:title_id,product_type='bundle'";
				}
			break;
		}
		
		$stmt = $this->_db->prepare($query);
		$params = array(
			":product_code"=>$product_code,
			":title_id"=>$title_id
		);

		$stmt->execute($params);
	}
	
	//대표상품검색 (상품 > 옵션상품 관리 > 옵션상품 상세보기 > 대표상품 검색)
	public function getTitlteSearch($search_value){
		$query = "select sku,title_id,title_name,title_name_en,publisher from tbl_goods where title_name like :title_name";
		$stmt = $this->_db->prepare($query);
		$keyword = "%".$search_value."%"; 
		$params = array(
			':title_name'=>$keyword
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		
		return $data;
	}
	
	//옵션상품 태그정보
	public function getGoodsItemTag($product_code){
		$query = "select tags from tbl_goods_item_tags where product_code=:product_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		return $data;
	}
	
	//메타크리틱 점수순위
	public function getGoodsMetacriticScore($page,$add_where,$orderby,$param){
		try{
			$query = "select a.metacritic_score,a.metacritic_url,a.name,a.release_date,a.appid,a.recommendations,a.publisher,a.app_type from steam_app_list a where a.app_type<>'Music' and a.metacritic_score>0 ".$add_where." order by a.metacritic_score desc,a.release_date desc";

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
	
	//대표상품 전체목록
	public function getTitleListAll(){
		$query = "select title_id,title_name from tbl_goods order by title_name asc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		return $data;
	}
	
	//대표상품 기본게임수
	public function getGoodsGameCount($title_id,$status){
		$query = "select count(*) from tbl_title_option a inner join tbl_goods_item b on a.product_code=b.product_code where a.title_id=:title_id and b.status=:status and b.game_type='game' and b.display_type='basic'";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':title_id'=>$title_id,
			':status'=>$status
		);

		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data['0'];
	}
	
	//대표상품 관련에디션수
	public function getGoodsEditionCount($title_id,$status){
		$query = "select count(*) from tbl_title_option a inner join tbl_goods_item b on a.product_code=b.product_code where a.title_id=:title_id and b.status=:status and b.game_type='game' and b.display_type='edition'";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':title_id'=>$title_id,
			':status'=>$status
		);

		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data['0'];
	}

	// 대표상품 DLC상품 수
	public function getGoodsDLCCount($title_id,$status){
		$query = "select count(*) from tbl_title_option a inner join tbl_goods_item b on a.product_code=b.product_code where a.title_id=:title_id and b.status=:status and b.game_type='dlc' and b.display_type='dlc'";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':title_id'=>$title_id,
			':status'=>$status
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data['0'];
	}
	
	//대표상품 관련번들수
	public function getGoodsBundleCount($title_id,$status,$bundle_type){
		if($bundle_type=="4"){
			$query = "select count(*) from tbl_title_option a inner join tbl_goods_item b on a.product_code=b.product_code where a.title_id=:title_id and b.status=:status and b.game_type='bundle' and b.bundle_type='4'";
			$stmt = $this->_db->prepare($query);
			$params = array(
				':title_id'=>$title_id,
				':status'=>$status
			);
		}else{
			$query = "select count(*) from tbl_title_option a inner join tbl_goods_item b on a.product_code=b.product_code where a.title_id=:title_id and b.status=:status and b.game_type='bundle' and b.bundle_type<>'4' and b.bundle_type<>'1'";
			$stmt = $this->_db->prepare($query);
			$params = array(
				':title_id'=>$title_id,
				':status'=>$status
			);
		}
		
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data['0'];
	}
	
	//대표상품 관련 악세사리
	public function getGoodsAccessoriesCount($title_id,$status,$delivery_type){
		$query = "select count(*) from tbl_title_option a inner join tbl_goods_item b on a.product_code=b.product_code where a.title_id=:title_id and b.status=:status and b.game_type='accessories' and b.delivery_type=:delivery_type";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':title_id'=>$title_id,
			':status'=>$status,
			':delivery_type'=>$delivery_type
		);

		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data['0'];
	}
	
	//홀로모델 기본상품
	public function getGoodsHolomodelsCount($title_id,$status){
		$query = "select count(*) from tbl_title_option a inner join tbl_goods_item b on a.product_code=b.product_code where a.title_id=:title_id and b.status=:status and b.game_type='holomodels' and b.display_type='holomodels'";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':title_id'=>$title_id,
			':status'=>$status
		);

		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data['0'];
	}
	
	//홀로모델 에디션
	public function getGoodsHolomodelsEditionCount($title_id,$status){
		$query = "select count(*) from tbl_title_option a inner join tbl_goods_item b on a.product_code=b.product_code where a.title_id=:title_id and b.status=:status and b.game_type='holomodels' and b.display_type='holomodelsedition'";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':title_id'=>$title_id,
			':status'=>$status
		);

		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data['0'];
	}
	
	//홀로모델 DLC
	public function getGoodsHolomodelsDLCCount($title_id,$status){
		$query = "select count(*) from tbl_title_option a inner join tbl_goods_item b on a.product_code=b.product_code where a.title_id=:title_id and b.status=:status and b.game_type='holomodels' and b.display_type='holomodelsdlc'";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':title_id'=>$title_id,
			':status'=>$status
		);

		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data['0'];
	}
	
	//대표상품 관련 기본게임 리스트
	public function getTitleGameList($title_id){
		$query = "select b.* from tbl_title_option a inner join tbl_goods_item b on a.product_code=b.product_code where a.title_id=:title_id and b.display_type='basic' order by b.product_platform desc,b.release_date desc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':title_id'=>$title_id
		);

		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	//대표상품 관련에디션 리스트
	public function getTitleEditionList($title_id){
		$query = "select b.* from tbl_title_option a inner join tbl_goods_item b on a.product_code=b.product_code where a.title_id=:title_id and b.display_type='edition' order by b.product_platform desc,b.release_date desc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':title_id'=>$title_id
		);

		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	//대표상품 관련 Bundle 리스트
	public function getTitleBundleList($title_id){
		$query = "select b.* from tbl_title_option a inner join tbl_goods_item b on a.product_code=b.product_code where a.title_id=:title_id and b.game_type='bundle' and b.bundle_type<>'1' order by b.product_platform desc,b.release_date desc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':title_id'=>$title_id,
		);

		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	//대표상품 관련 dlc 리스트
	public function getTitleDLCList($title_id){
		$query = "select b.* from tbl_title_option a inner join tbl_goods_item b on a.product_code=b.product_code where a.title_id=:title_id and b.game_type in ('dlc','music') order by b.product_platform desc,b.release_date desc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':title_id'=>$title_id
		);

		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}
	
	//대표상품 관련 기타 리스트
	public function getTitleEtcList($title_id){
		$query = "select b.* from tbl_title_option a inner join tbl_goods_item b on a.product_code=b.product_code where a.title_id=:title_id and b.game_type='accessories' order by b.product_platform desc,b.release_date desc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':title_id'=>$title_id
		);

		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}


	//대표상품 관련 홀로모델 리스트
	public function getTitleHolomodelsList($title_id){
		$query = "select b.* from tbl_title_option a inner join tbl_goods_item b on a.product_code=b.product_code where a.title_id=:title_id and b.display_type='holomodels' order by b.product_platform desc,b.release_date desc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':title_id'=>$title_id
		);

		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	//대표상품 관련 홀로모델 DLC 리스트
	public function getTitleHolomodelsDLCList($title_id){
		$query = "select b.* from tbl_title_option a inner join tbl_goods_item b on a.product_code=b.product_code where a.title_id=:title_id and b.display_type='holomodelsdlc' order by b.product_platform desc,b.release_date desc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':title_id'=>$title_id
		);

		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	//대표상품 관련 홀로모델 에디션 리스트
	public function getTitleHolomodelsEditionList($title_id){
		$query = "select b.* from tbl_title_option a inner join tbl_goods_item b on a.product_code=b.product_code where a.title_id=:title_id and b.display_type='holomodelsedition' order by b.product_platform desc,b.release_date desc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':title_id'=>$title_id
		);

		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	//플랫폼명 조회
	public function getPlatformName($platform_code){
		switch($platform_code){
			case "1":
				$platform_label="Steam";
			break;
			case "3":
				$platform_label="Origin";
			break;
			case "34":
				$platform_label="Epic";
			break;
			case "30":
				$platform_label="Ubisoft Connect";
			break;
			case "33":
				$platform_label="Bethesda ";
			break;
			case "35":
				$platform_label="Rockstar Games Launcher ";
			break;
			case "51":
				$platform_label="홀로모델";
			break;
		}

		return $platform_label;
	}
	
	public function getGoodsOptionGameType($game_type){
		switch($game_type){
			case "game":
				echo "게임";
			break;
			case "dlc":
				echo "DLC";
			break;
			case "music":
				echo "사운드트랙";
			break;
			case "bundle":
				echo "번들";
			break;
			case "timedeal":
				echo "타임딜";
			break;
			case "randombox":
				echo "랜덤박스";
			break;
			case "accessories":
				echo "PS악세사리";
			break;
			case "holomodels":
				echo "홀로모델";
			break;
		}
	}
	
	public function getGoodsOptionDisplayType($display_type){
		switch($display_type){
			case "basic":
				echo "기본게임";
			break;
			case "edition":
				echo "에디션";
			break;
			case "multi":
				echo "멀티팩";
			break;
			case "dlc":
				echo "DLC";
			break;
			case "game_bundle":
				echo "기본게임번들";
			break;
			case "dlc_bundle":
				echo "DLC번들";
			break;
			case "etc_bundle":
				echo "기타번들";
			break;
			case "timedeal":
				echo "타임딜";
			break;
			case "holomodels":
				echo "홀로모델";
			break;
			case "holomodelsdlc":
				echo "홀로모델 DLC";
			break;
			case "holomodelsedition":
				echo "홀로모델 에디션";
			break;
		}
	}
	
	//퍼블리셔명 조회
	public function getPublisherName($publisher_code){
		$query = "select publisher_name from tbl_publisher where publisher_code=:publisher_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':publisher_code'=>$publisher_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data['publisher_name'];
	}

	//퍼블리셔명 조회 (현재DB 없으면 예전DB directgames.tbl_publisher.idx 폴백 + 예전DB 표시, 그것도 없으면 코드)
	public function getPublisherNameFallback($publisher_code){
		$query = "select publisher_name from tbl_publisher where publisher_code=:publisher_code";
		$stmt = $this->_db->prepare($query);
		$stmt->execute(array(':publisher_code'=>$publisher_code));
		$name = $stmt->fetchColumn();
		if($name){
			return $name;
		}
		$query = "select publisher from directgames.tbl_publisher where idx=:publisher_code";
		$stmt = $this->_db->prepare($query);
		$stmt->execute(array(':publisher_code'=>$publisher_code));
		$old_name = $stmt->fetchColumn();
		if($old_name){
			return $old_name.' <span class="badge bg-warning text-dark">예전DB</span>';
		}
		return $publisher_code;
	}
	
	//Vaultn 카탈로그 현황
	public function getVaultnProductList($page,$add_where,$orderby,$param){
		try{
			$query = "select * from vaultn_catalogue where sku is not null and currencyCode='KRW' ".$add_where." order by ".$orderby;

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
	
	//Vaultn 프로모션 현황
	public function getVaultnPromotionList($page,$add_where,$orderby,$param){
		try{
			$query = "select a.*,b.title as product_name,b.srp,b.purchasePrice from vaultn_promotion a inner join vaultn_catalogue b on a.sku=b.sku where b.currencyCode='KRW' and b.srp>0 ".$add_where." order by ".$orderby;

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
	
	//Ztorm 카탈로그 현황
	public function getZtormCatalogue($page,$add_where,$orderby,$param){
		try{
			$query = "select * from ztorm_catalogue where view_flag<>'N' and RegionTag<>'LATAM' and RegionTag<>'China' and RegionTag<>'CIS' and RegionTag<>'ME' and publisher_id<>'351' ".$add_where." order by ".$orderby;
			
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
	
	//Ztorm 프로모션 현황
	public function getZtormPromotion($page,$add_where,$orderby,$param){
		try{
			$query = "select a.product_code,a.product_name,b.item_id,b.item_name,b.item_publisher,c.percent,date_format(FROM_UNIXTIME(c.valid_from),'%Y-%m-%d %H:%i:%s')as promotion_start,date_format(FROM_UNIXTIME(c.valid_to),'%Y-%m-%d %H:%i:%s')as promotion_end,a.product_srp from tbl_goods_item a inner join tbl_goods_item_delivery b on a.product_code=b.product_code inner join ztorm_promotion c on c.zt_item_id=b.item_id where b.order_system='2' and a.status='0' ".$add_where." order by ".$orderby;
			
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
	
	//Ztorm 퍼블리셔 현황
	public function getZtormPublisher(){
		$query = "select publisher_id,publisher_name,count(*)as cc from ztorm_catalogue where view_flag='Y' and RegionTag<>'LATAM' and RegionTag<>'China' and RegionTag<>'CIS' and RegionTag<>'ME' and publisher_id<>'351' group by publisher_id order by count(*) desc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		return $data;
	}
	
	//genba 퍼블리셔 현황
	public function getGenbaPublisherList(){
		$query = "select publisher,status from genba_publisher order by publisher asc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		return $data;
	}
	
	//genba 퍼블리셔 현황
	public function getGenbaTitlePublisher(){
		$query = "select Publisher,count(*) from genba_title group by Publisher order by publisher asc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		return $data;
	}
	
	public function setGoodsOptionDeliveryItem($product_code,$item_platform,$item_id,$item_name,$item_publisher,$order_system,$item_type){
		$query = "insert into tbl_goods_item_delivery set product_code=:product_code,item_id=:item_id,item_name=:item_name,item_platform=:item_platform,item_publisher=:item_publisher,order_system=:order_system,item_type=:item_type";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code,
			':item_id'=>$item_id,
			':item_name'=>$item_name,
			':item_platform'=>$item_platform,
			':item_publisher'=>$item_publisher,
			':order_system'=>$order_system,
			':item_type'=>$item_type,
		);
		$stmt->execute($params);
	}
	
	//겐바 카탈로그 검색
	public function searchGenbaProduct($sku){
		$query = "select * from genba_catalogue where Sku=:Sku";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':Sku'=>$sku
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}
	
	//genba 타이틀 목록
	public function getGenbaTitleList($page,$add_where,$orderby,$param){
		try{
			$query = "select a.* from genba_title a inner join genba_publisher b on a.Publisher=b.publisher where b.status='Y' ".$add_where." order by ".$orderby;
			
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
	
	//genba 상품 목록
	public function getGenbaProductList($page,$add_where,$orderby,$param){
		try{
			$query = "select a.*,c.Srp,c.Wsp from genba_catalogue a inner join genba_publisher b on a.Publisher=b.publisher inner join genba_price c on a.Sku=c.Sku where b.status='Y' and (BlacklistCountryCodes NOT Regexp 'KR') and a.RegionCode<>'R' and a.RegionCode<>'LATAM' and a.RegionCode<>'TK'  ".$add_where." order by ".$orderby;

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
	
	//genba 가격 목록
	public function getGenbaPriceList($page,$add_where,$orderby,$param){
		try{
			$query = "select b.*,a.ReleaseDate from genba_catalogue a inner join genba_price b on a.Sku=b.Sku where (a.BlacklistCountryCodes NOT Regexp 'KR')  and a.RegionCode<>'R' ".$add_where." order by ".$orderby;

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
	
	//genba 프로모션 목록
	public function getGenbaPromotionSchedule($page,$add_where,$orderby,$param,$results_per_page){
		try{
			$query = "select PromotionId,Name,fromDate,toDate,DiscountPercentage,count(*)as cc from genba_promotion where 1=1 ".$add_where." group by PromotionId  order by ".$orderby;

			$options = array(
				'results_per_page' =>$results_per_page,
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
	
	//genba 프로모션 목록
	public function getGenbaPromotionScheduleGoods($page,$add_where,$orderby,$param){
		try{
			$query = "select a.*,b.Name as title from genba_promotion a inner join genba_catalogue b on a.Sku=b.Sku where b.PreLiveState='1' and ( b.BlacklistCountryCodes NOT Regexp 'KR')  ".$add_where." group by a.fromDate,a.toDate,a.sku,a.DiscountPercentage order by ".$orderby;

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
	
	//Vaultn 카탈로그 검색
	public function searchVaultnProduct($sku){
		$query = "select * from vaultn_catalogue where sku=:sku";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':sku'=>$sku
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}

	//PointNexus 카탈로그 검색
	public function searchPointNexusProduct($productID, $mode){
		//운영 전환: 기본 환경 prod. 명시적으로 "test"를 넘긴 경우만 test 조회.
		if($mode != "test"){ $mode = "prod"; }
		$query = "select * from pointnexus_catalogue where productID=:productID and mode=:mode";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':productID'=>$productID,
			':mode'=>$mode
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}
	
	//옵션상품 상세설명 동기화 체크
	public function getGoodsOptionDescriptionChk($product_code){
		$query = "select reg_date from tbl_goods_item_description where product_code=:product_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		
		return $data;
	}
	
	//특전정보 검색
	public function getBonusSearch($search_value){
		$query = "select * from tbl_bonus where bonus_name like :bonus_name";
		$stmt = $this->_db->prepare($query);
		$keyword = "%".$search_value."%"; 
		$params = array(
			':bonus_name'=>$keyword
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		
		return $data;
	}
	
	
	//옵션상품 특전제공 설정정보
	public function getGoodsItemBonus($product_code){
		$query = "select a.bonus_delivery_type,a.bonus_name,a.stock,b.* from tbl_bonus a inner join tbl_goods_bonus b on a.bonus_no=b.bonus_no where b.product_code=:product_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}
	
	//Youtube 채널리스트
	public function getYoutubeChannelList($page,$add_where,$orderby,$param){
		try{
			$query = "select * from youtube_channel where idx>'0' ".$add_where." order by ".$orderby;

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
	
	//Youtube  동영상리스트
	public function getYoutubeVideoList($page,$add_where,$orderby,$param){
		try{
			$query = "select * from youtube_video where idx>'0' ".$add_where." order by ".$orderby;

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
	
	//Youtube 동영상 검색
	public function getYoutubeVideoSearch($add_where){
		$query = "select * from youtube_video where idx>'0' ".$add_where." order by publishedAt asc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		return $data;
	}
	
	//대표상품 동영상 설정현황
	public function getTitleVideoList($title_id){
		$query = "select b.* from tbl_goods_media a inner join youtube_video b on a.youtube_media_id=b.videoId  where a.title_id=:title_id and a.media_type='video'";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':title_id'=>$title_id
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}
	
	//한글패치 현황
	public function getKoreanPatchList(){
		$query = "select * from tbl_patch_goods order by idx desc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		return $data;
	}
	
	//한글패치 인증정보
	public function patchEncDataAdmin($m_id,$key,$encode_type){
		$id = $key.$m_id;
		if($encode_type=="base64"){
			$enc_data = substr(base64_encode($id),11,strlen(base64_encode($id))+1);
		}else{
			$enc_data = strtolower(md5($id));
		}
		//$enc_data = base64_encode($id);
		return $enc_data;
	}
	
	//한글패치 다운로드 현황
	public function getKoreanPatchDownloadLog($page,$add_where,$orderby,$param){
		try{
			$query = "select * from directgames.tbl_patch_download_log where idx>'0' ".$add_where." order by ".$orderby;

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
	
	//카테고리 현황
	public function getCategoryList(){
		$query = "select * from tbl_category order by category_code asc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		return $data;
	}
	
	public function getParentCategoryInfo($category_code){
		$query = "select * from tbl_category where category_code=:category_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			":category_code"=>$category_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}
	
	//카테고리 경로
	public function getCategoryInfo($category_code,$category_depth){
		$query = "select * from tbl_category where category_code REGEXP :category_code and category_depth=:category_depth order by category_code asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':category_code'=>"^".$category_code,
			':category_depth'=>$category_depth,
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	public function getGroupList(){
		$query = "SELECT * FROM tbl_group ORDER BY idx DESC";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		return $data;
	}
	public function getGroupItemList($group_idx){
		$query = "SELECT * FROM tbl_group_item WHERE group_idx=:group_idx ORDER BY idx DESC";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':group_idx'=>$group_idx
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}

	//타임딜 진행이력
	public function getTimedealHistory($product_code){
		$query = "select * from tbl_timedeal where product_code=:product_code order by timedeal_start asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}
	
	// 추가적립금 진행이력
	public function getAddRepayHistory($product_code){
		$query = "select * from tbl_add_repay where product_code=:product_code order by start_dt asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}
	
	//품절된 옵션상품
	public function getGoodsOpionSoldoutList(){
		$query = "select a.product_code,a.product_name,a.option_type,b.item_type,b.item_id,b.item_name,b.item_publisher,b.stock from tbl_goods_item a  inner join tbl_goods_item_delivery b on a.product_code=b.product_code where a.status='0' and a.soldout='Y' and a.option_type='digital' and b.order_system='1' and b.stock='0' order by b.item_publisher asc, b.item_id asc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		return $data;
	}

	//재고 0인 디지털 Asset 옵션상품 (판매종료 status='3' 제외). 대시보드에서 status 기준(0=판매중) 분류용
	public function getGoodsOptionStockZeroList(){
		$query = "select a.product_code,a.product_name,a.option_type,a.status,a.soldout,b.item_type,b.item_id,b.item_name,b.item_publisher,b.stock from tbl_goods_item a inner join tbl_goods_item_delivery b on a.product_code=b.product_code where a.option_type='digital' and b.order_system='1' and b.stock='0' and a.status<>'3' order by a.status asc, b.item_publisher asc, b.item_id asc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		return $data;
	}

	//판매중(status=0) & 품절(soldout=Y) 옵션상품 중 Asset(order_system=1) 제외 — Asset 외 상품. 배송시스템(order_system) 함께. 대시보드용
	public function getGoodsOptionSellingSoldoutList(){
		$query = "select a.product_code,a.product_name,a.option_type,a.status,a.soldout,b.order_system from tbl_goods_item a left join tbl_goods_item_delivery b on a.product_code=b.product_code where a.status='0' and a.soldout='Y' and (b.order_system is null or b.order_system<>'1') order by b.order_system asc, a.product_code asc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		return $data;
	}
	
	//옵션상품조회
	public function getGoodsOptionSearch($product_code){
		$query = "select product_code,product_name,game_type,product_platform from tbl_goods_item where product_code=:product_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
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
	
	//상품정보조회
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
		
		$promotion_data =$this->getPromotionGoodsPrice($product_code);

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
		$goods_info['promotion']=$promotion_data;

		return $goods_info;
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
	
	//옵션상품 스크린샷 목록
	public function getProductScreenshotList($product_code){
		$query = "select idx,screenshot_num,file_name,file_size,file_type,url,thumbnail,sort from tbl_goods_item_screenshot where product_code=:product_code order by sort asc,screenshot_num asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':product_code'=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}
	
	//제공 컨텐츠 현황
	public function getSupplyContentList($page,$add_where,$orderby,$param,$results_per_page){
		try{
			$query = "select * from directgames.tbl_supply_content where 1=1 ".$add_where." order by idx asc ";
			
			//echo $query;

			$options = array(
				'results_per_page' =>$results_per_page,
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
	//제공 컨텐츠 관련 옵션상품 목록
	public function getSupplyContentGoodsList($parent_idx){
		$query = "select * from directgames.tbl_supply_content_goods where parent_idx=:parent_idx order by idx asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':parent_idx'=>$parent_idx
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