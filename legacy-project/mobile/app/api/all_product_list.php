<?
	ini_set( "display_errors", 1 );
	include_once($_SERVER["DOCUMENT_ROOT"]."/../mobile/lib/api_func.php");
	
	//8QzsjYk6GwmQRee99xDqef8u2P/t60uW4qSV2XxHUsU=
	$token = getBearerToken();
	
	$json_data = array();
	$game_data = array();
	
	if ($token=="8QzsjYk6GwmQRee99xDqef8u2P/t60uW4qSV2XxHUsU="){
		$is_auth= "Y";
	} else {
		$is_auth= "N";
		$error_message="접근권한이 없습니다.";
	}

	if($is_auth=="N"){
		$json_data = array(
			"status"=>"error",
			"code"=>"Access Denied",
			"message"=>$error_message,
		);
		
		echo json_encode($json_data);
	}else{
		include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
			
		$category_code = filter_input(INPUT_GET, 'category_code', FILTER_SANITIZE_STRING);
		
		//정렬순서
		$sort = filter_input(INPUT_GET, 'sort', FILTER_SANITIZE_STRING);
		
		$delivery_type_1 = filter_input(INPUT_GET, 'delivery_type_1', FILTER_SANITIZE_STRING);
		$delivery_type_2 = filter_input(INPUT_GET, 'delivery_type_2', FILTER_SANITIZE_STRING);
		$delivery_type_3 = filter_input(INPUT_GET, 'delivery_type_3', FILTER_SANITIZE_STRING);
		
		$is_preorder = filter_input(INPUT_GET, 'is_preorder', FILTER_SANITIZE_STRING);
		$is_bonus = filter_input(INPUT_GET, 'is_bonus', FILTER_SANITIZE_STRING);
		$is_repay = filter_input(INPUT_GET, 'is_repay', FILTER_SANITIZE_STRING);
		$is_promotion = filter_input(INPUT_GET, 'is_promotion', FILTER_SANITIZE_STRING);
		$is_soldout = filter_input(INPUT_GET, 'is_soldout', FILTER_SANITIZE_STRING);

		$game_type_basic = filter_input(INPUT_GET, 'game_type_basic', FILTER_SANITIZE_STRING);
		$game_type_edition = filter_input(INPUT_GET, 'game_type_edition', FILTER_SANITIZE_STRING);
		$game_type_dlc = filter_input(INPUT_GET, 'game_type_dlc', FILTER_SANITIZE_STRING);
		$game_type_music = filter_input(INPUT_GET, 'game_type_music', FILTER_SANITIZE_STRING);
		$game_type_bundle = filter_input(INPUT_GET, 'game_type_bundle', FILTER_SANITIZE_STRING);
		$game_type_accessories = filter_input(INPUT_GET, 'game_type_accessories', FILTER_SANITIZE_STRING);
		
		$platform_1 = filter_input(INPUT_GET, 'platform_1', FILTER_SANITIZE_STRING);
		$platform_34 = filter_input(INPUT_GET, 'platform_34', FILTER_SANITIZE_STRING);
		$platform_35 = filter_input(INPUT_GET, 'platform_35', FILTER_SANITIZE_STRING);

		$interface_korean = filter_input(INPUT_GET, 'interface_korean', FILTER_SANITIZE_STRING);
		$spoken_korean = filter_input(INPUT_GET, 'spoken_korean', FILTER_SANITIZE_STRING);
		$exclusive_korean = filter_input(INPUT_GET, 'exclusive_korean', FILTER_SANITIZE_STRING);
		$subtitle_korean = filter_input(INPUT_GET, 'subtitle_korean', FILTER_SANITIZE_STRING);
		
		$genre_code_arr = [];
		$search_label = array(
			1 => [], // 검색필터
			2 => [], // 상품유형
			3 => [], // 플랫폼
			4 => [], // 한국어지원
			5 => [], // 장르
		);
		for($i=1; $i<=10; $i++){
			$genre_code_arr[$i] = filter_input(INPUT_GET, 'genre_code_'.$i, FILTER_SANITIZE_STRING);
			$genre = filter_input(INPUT_GET, 'genre_code_'.$i, FILTER_SANITIZE_STRING);

			if($genre){
				$search_label[5]['genre_code_'.$i] = $genre; // 키를 input ID로
			}
		}

		$min_price = filter_input(INPUT_GET, 'min_price', FILTER_SANITIZE_STRING);
		$max_price = filter_input(INPUT_GET, 'max_price', FILTER_SANITIZE_STRING);

		$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);

		if(!$page){
			$page=1;
		}

		$where = [];
		$filter_where = [];
		$type_where = [];
		$platform_where = [];
		$korean_where = [];
		$genre_where = [];
		$price_where = [];
		$delivery_type_where = [];
		
		$param = "";
		$add_where = "";

		$filter_str = " ( ";
		$filter_chk = false;

		$type_str = " ( ";
		$type_chk = false;

		$platform_str = " ( ";
		$platform_chk = false;

		$korean_str = " ( ";
		$korean_chk = false;

		$genre_str = " ( match(a.genre) AGAINST(";
		$genre_chk = false;

		$price_str = " ( ";
		$price_chk = false;
		
		$delivery_type_str = " (";
		$delivery_type_chk = false;

		$where[] = " find_in_set(a.game_type,'game,dlc,music,bundle,accessories')";

		try{
			$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

			$goods= new Goods($conn);
			$promotion = new Promotion($conn);
			$mypage = new Mypage2($conn);
			
			if($delivery_type_1!=""){
				$delivery_type_where[] = " a.delivery_type='1' ";
				$delivery_type_chk = true;
			}
			
			if($delivery_type_2!=""){
				$delivery_type_where[] = " a.delivery_type='2' ";
				$delivery_type_chk = true;
			}
			
			if($delivery_type_3!=""){
				$delivery_type_where[] = " a.delivery_type='3' ";
				$delivery_type_chk = true;
			}
			
			$delivery_type_str .= implode(' OR ', $delivery_type_where);
			$delivery_type_str .= " ) ";

			if($delivery_type_chk===true){
				$where[]=$delivery_type_str;
			}

			include_once('../../game/game_common.php');

			if($is_promotion=="Y"){
				$goods_list = $goods->getGoodsPromotionList($page,$add_where,$orderby,$param);
			}else{
				$goods_list = $goods->getGoodsList($page,$add_where,$orderby,$param,$is_bonus);
			}

			//parse_str($_SERVER['QUERY_STRING'], $params);
			//unset($params['page']);
			//$query_without_page = http_build_query($params);
			
			if($goods_list->success == true){
				$result = $goods_list->resultset->fetchAll();

				$count = 0;
				foreach($result as $key=>$value){
					/*상세보기 url*/
					$title_info = $goods->getGoodsOptionTitleInfo($value['product_code']);
						switch($value['game_type']){
							case "game":
								$view_url = "https://m.directg.net/game/game_view.html?isApp=Y&product_id=".$title_info['sku']."&sku=".$value['goods_sku'];
							break;
							case "dlc":
								if($value['display_type']=="dlc_bundle"){
									$view_url = "https://m.directg.net/game/bundle_view.html?isApp=Y&sku=".$value['goods_sku'];
								}else{
									$view_url = "https://m.directg.net/game/dlc_view.html?isApp=Y&sku=".$value['goods_sku'];
								}
							break;
							case "music":
								$view_url = "https://m.directg.net/game/dlc_view.html?isApp=Y&sku=".$value['goods_sku'];
							break;
							case "bundle":
								$view_url = "https://m.directg.net/game/bundle_view.html?isApp=Y&sku=".$value['goods_sku'];
							break;
							case "accessories":
								$view_url = "https://m.directg.net/game/goods_item_view.html?isApp=Y&product_id=".$title_info['sku']."&sku=".$value['goods_sku'];
							break;
						}
						
						$promotion_goods=$promotion->getPromotionGoodsPrice($value['product_code']);
						
						if($promotion_goods['sale_price']>0){
							$value['discount'] =$promotion_goods['discount_rate'];
							$value['price'] =$promotion_goods['sale_price'];
							$value['is_promotion']="Y";
						}else{
							$value['is_promotion']="N";
						}
						
						if($_SESSION['member']['m_no']){
							$wishlist = $mypage->getWishlistItem($_SESSION['member']['m_no'],$value['product_code']);
							if($wishlist['idx']>0){
								$wishlist_chk="Y";
							} else {
								$wishlist_chk="N";
							}
						} else {
							$wishlist_chk="N";
						}
						
						if($value['spoken_korean']=="Y"){
							$spoken_korean = "Y";
						}else{
							$spoken_korean = "N";
						}
						
						if($value['interface_korean']=="Y"){
							$interface_korean = "Y";
						}else{
							$interface_korean = "N";
						}
						
						if($value['exclusive_korean']=="Y"){
							$exclusive_korean = "Y";
						}else{
							$exclusive_korean = "N";
						}
						
						if($value['subtitle_korean']=="Y"){
							$subtitle_korean = "Y";
						}else{
							$subtitle_korean = "N";
						}
		
					$game_data[$key]['goods_sku'] = $value['goods_sku'];
					$game_data[$key]['product_name'] = $value['product_name'];
					$game_data[$key]['product_name'] = $value['product_name'];
					$game_data[$key]['product_name_en'] = $value['product_name_en'];
					$game_data[$key]['release_date'] = date("Y-m-d",strtotime($value['release_date']));
					$game_data[$key]['consumer_price'] = $value['consumer_price'];
					$game_data[$key]['price'] = $value['price'];
					$game_data[$key]['discount'] = $value['discount'];
					$game_data[$key]['status'] = $value['status'];
					$game_data[$key]['game_type'] = $value['game_type'];
					$game_data[$key]['display_type'] = $value['display_type'];
					$game_data[$key]['genre'] = $value['genre'];
					$game_data[$key]['category'] = $value['category'];
					$game_data[$key]['product_platform'] = $value['product_platform'];
					$game_data[$key]['spoken_korean'] = $spoken_korean;
					$game_data[$key]['interface_korean'] = $interface_korean;
					$game_data[$key]['exclusive_korean'] = $exclusive_korean;
					$game_data[$key]['subtitle_korean'] = $subtitle_korean;
					$game_data[$key]['is_bonus'] = $value['is_bonus'];
					$game_data[$key]['is_preorder'] = $value['is_preorder'];
					$game_data[$key]['delivery_type'] = $value['delivery_type'];
					$game_data[$key]['image'] = $value['image'];
					$game_data[$key]['is_naverpay_coupon'] = $value['is_naverpay_coupon'];
					$game_data[$key]['soldout'] = $value['soldout'];
					$game_data[$key]['wishlist_chk'] = $wishlist_chk;
					$game_data[$key]['image'] = "https://image.directg.net/upload/product/".$value['product_code']."header/header.jpg";
					$game_data[$key]['is_promotion'] = $value['is_promotion'];
					$game_data[$key]['view_url'] = $view_url;
				}
			}
			
			$json_data = array(
				"status"=>"success",
				"data"=>array(
					"totalCount"=>$goods_list->total_results,
					"totalPage"=>$goods_list->total_pages,
					"currentPage"=>$page,
					"list"=>$game_data
				),
			);
			
			echo json_encode($json_data);

		}catch (PDOException $e){
			echo 'Error!: '.$e->getMessage();
			die();
		}
	}
	exit;
?>