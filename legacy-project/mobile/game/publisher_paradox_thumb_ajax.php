<?php
	include_once($_SERVER["DOCUMENT_ROOT"].'/lib/lib.php');

	$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_NUMBER_INT);
	if(!$page){
		$page=1;
	}
	$page = $page+1;
	
	$page_type="thumb";
	$publisher_code = "30";

	$platform = filter_input(INPUT_GET, 'platform', FILTER_SANITIZE_STRING);
	$genre_code = filter_input(INPUT_GET, 'genre_code', FILTER_SANITIZE_STRING);
	$category_code = filter_input(INPUT_GET, 'category_code', FILTER_SANITIZE_STRING);
	
	//정렬순서
	$sort = filter_input(INPUT_GET, 'sort', FILTER_SANITIZE_STRING);
	$is_preorder = filter_input(INPUT_GET, 'is_preorder', FILTER_SANITIZE_STRING);
	$is_bonus = filter_input(INPUT_GET, 'is_bonus', FILTER_SANITIZE_STRING);
	$is_repay = filter_input(INPUT_GET, 'is_repay', FILTER_SANITIZE_STRING);
	$is_promotion = filter_input(INPUT_GET, 'is_promotion', FILTER_SANITIZE_STRING);
	$is_soldout = filter_input(INPUT_GET, 'is_soldout', FILTER_SANITIZE_STRING);

	$game_type = filter_input(INPUT_GET, 'game_type', FILTER_SANITIZE_STRING);
	$game_type_basic = filter_input(INPUT_GET, 'game_type_basic', FILTER_SANITIZE_STRING);
	$game_type_edition = filter_input(INPUT_GET, 'game_type_edition', FILTER_SANITIZE_STRING);
	$game_type_dlc = filter_input(INPUT_GET, 'game_type_dlc', FILTER_SANITIZE_STRING);
	$game_type_music = filter_input(INPUT_GET, 'game_type_music', FILTER_SANITIZE_STRING);
	$game_type_bundle = filter_input(INPUT_GET, 'game_type_bundle', FILTER_SANITIZE_STRING);
	
	$platform_1 = filter_input(INPUT_GET, 'platform_1', FILTER_SANITIZE_STRING);
	$platform_34 = filter_input(INPUT_GET, 'platform_34', FILTER_SANITIZE_STRING);
	$platform_35 = filter_input(INPUT_GET, 'platform_35', FILTER_SANITIZE_STRING);

	$interface_korean = filter_input(INPUT_GET, 'interface_korean', FILTER_SANITIZE_STRING);
	$spoken_korean = filter_input(INPUT_GET, 'spoken_korean', FILTER_SANITIZE_STRING);
	$exclusive_korean = filter_input(INPUT_GET, 'exclusive_korean', FILTER_SANITIZE_STRING);
	
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

	$where = [];
	$filter_where = [];
	$type_where = [];
	$platform_where = [];
	$korean_where = [];
	$genre_where = [];
	$price_where = [];
	
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

	$where[] = " find_in_set(a.game_type,'game,dlc,music,bundle')";
	$where[] = "a.supplier_code='".$publisher_code."'";

	try{
		$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

		$goods= new Goods($conn);
		$promotion = new Promotion($conn);
		$mypage = new Mypage2($conn);

		include_once('./new_game_common.php');

		$goods_list = $goods->getGoodsList2($page, $add_where, $orderby, $param, 60);

	}catch (PDOException $e){
		echo 'Error!: '.$e->getMessage();
		die();
	}
?>
<? include_once('thumb_inc.php');?>