<?php
	// ============================================
	// 파일명: /lib/filter_common.php
	// 설명: 상품 필터링 통합 로직
	// ============================================

	// ============================================
	// 1. GET 파라미터 받기
	// ============================================
	$platform = filter_input(INPUT_GET, 'platform', FILTER_SANITIZE_STRING);
	$genre_code = filter_input(INPUT_GET, 'genre_code', FILTER_SANITIZE_STRING);
	$category_code = filter_input(INPUT_GET, 'category_code', FILTER_SANITIZE_STRING);
	$sort = filter_input(INPUT_GET, 'sort', FILTER_SANITIZE_STRING);
	$q = filter_input(INPUT_GET, 'q', FILTER_SANITIZE_STRING);

	// 배송타입
	$delivery_type_1 = filter_input(INPUT_GET, 'delivery_type_1', FILTER_SANITIZE_STRING);
	$delivery_type_2 = filter_input(INPUT_GET, 'delivery_type_2', FILTER_SANITIZE_STRING);
	$delivery_type_3 = filter_input(INPUT_GET, 'delivery_type_3', FILTER_SANITIZE_STRING);

	// 상태 필터
	$is_preorder = filter_input(INPUT_GET, 'is_preorder', FILTER_SANITIZE_STRING);
	$is_bonus = filter_input(INPUT_GET, 'is_bonus', FILTER_SANITIZE_STRING);
	$is_repay = filter_input(INPUT_GET, 'is_repay', FILTER_SANITIZE_STRING);
	if(!$is_promotion){
		$is_promotion = filter_input(INPUT_GET, 'is_promotion', FILTER_SANITIZE_STRING);
	}
	$is_soldout = filter_input(INPUT_GET, 'is_soldout', FILTER_SANITIZE_STRING);

	// 게임 타입
	$game_type = filter_input(INPUT_GET, 'game_type', FILTER_SANITIZE_STRING);
	$game_type_basic = filter_input(INPUT_GET, 'game_type_basic', FILTER_SANITIZE_STRING);
	$game_type_edition = filter_input(INPUT_GET, 'game_type_edition', FILTER_SANITIZE_STRING);
	$game_type_dlc = filter_input(INPUT_GET, 'game_type_dlc', FILTER_SANITIZE_STRING);
	$game_type_music = filter_input(INPUT_GET, 'game_type_music', FILTER_SANITIZE_STRING);
	$game_type_bundle = filter_input(INPUT_GET, 'game_type_bundle', FILTER_SANITIZE_STRING);

	// 플랫폼
	$platform_1 = filter_input(INPUT_GET, 'platform_1', FILTER_SANITIZE_STRING);
	$platform_34 = filter_input(INPUT_GET, 'platform_34', FILTER_SANITIZE_STRING);
	$platform_35 = filter_input(INPUT_GET, 'platform_35', FILTER_SANITIZE_STRING);

	// 한국어 지원
	$interface_korean = filter_input(INPUT_GET, 'interface_korean', FILTER_SANITIZE_STRING);
	$spoken_korean = filter_input(INPUT_GET, 'spoken_korean', FILTER_SANITIZE_STRING);
	$exclusive_korean = filter_input(INPUT_GET, 'exclusive_korean', FILTER_SANITIZE_STRING);

	// 장르 코드 배열
	$genre_code_arr = [];
	$genre_code_arr[0] = $genre_code;
	for ($i = 1; $i <= 10; $i++) {
		$genre_code_arr[$i] = filter_input(INPUT_GET, 'genre_code_'.$i, FILTER_SANITIZE_STRING);
	}

	// 카테고리 코드 배열
	$category_code_arr = [];
	$category_code_arr[0] = $category_code;
	for ($i = 1; $i <= 44; $i++) {
		$category_code_arr[$i] = filter_input(INPUT_GET, 'category_code_'.$i, FILTER_SANITIZE_STRING);
	}

	// ⭐ 가격 필터 (JavaScript로 채워진 값)
	$min_price = filter_input(INPUT_GET, 'min_price', FILTER_SANITIZE_STRING);
	$max_price = filter_input(INPUT_GET, 'max_price', FILTER_SANITIZE_STRING);

	// ============================================
	// 2. 변수 초기화
	// ============================================
	$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
	if (!$page) {
		$page = 1;
	}

	$where = [];
	$filter_where = [];
	$type_where = [];
	$platform_where = [];
	$delivery_where = [];
	$korean_where = [];
	$genre_where = [];
	$category_where = [];
	$price_where = [];

	$checked = [];
	$selected = [];

	$filter_str = " ( ";
	$filter_chk = false;

	$type_str = " ( ";
	$type_chk = false;

	$platform_str = " ( ";
	$platform_chk = false;

	$delivery_str = " ( ";
	$delivery_chk = false;

	$korean_str = " ( ";
	$korean_chk = false;

	$genre_str = " ( match(a.genre) AGAINST(";
	$genre_chk = false;

	$category_str = " ( match(a.category) AGAINST(";
	$category_chk = false;

	$price_str = " ( ";
	$price_chk = false;

	// ============================================
	// 3. 기본 조건
	// ============================================
	//26-01-26(월) 15:27 [이종석] 파일 통합하여 관리한다면 product_type이 아니라 delivery_type 으로 관리

	if($aside['product_type'] == "accessories"){
		$where[] = " find_in_set(a.game_type,'accessories')";
	} else if($aside['product_type'] == "holomodels"){
		$where[] = " find_in_set(a.game_type,'holomodels')";
	} else {
		$where[] = " find_in_set(a.game_type,'game,dlc,music,bundle')";
	}

	//상품명 검색
	if($q){
		$tmp = str_replace(':','',$q);
		$keword_search = str_replace(" ","",$tmp);
		foreach($tmp as $key=>$keyword){
			if($key==0){
				$keword_search .= $keyword;
			}else{
				$keword_search .= "[: ]*".$keyword;
			}
		}
		
		$where[] = " MATCH (a.product_name, a.product_name_en, a.keyword) AGAINST ('+".$q."*' IN BOOLEAN MODE)";
	}

	// ============================================
	// 4. 보너스/예약판매 필터 (OR 조건)
	// ============================================
	if ($is_bonus == "Y") {
		$filter_where[] = " a.is_bonus='".$is_bonus."'";
		$checked['is_bonus']['Y'] = "checked";
		$filter_chk = true;
	}

	if ($is_preorder == "Y") {
		$filter_where[] = " a.is_preorder='".$is_preorder."'";
		$checked['is_preorder']['Y'] = "checked";
		$filter_chk = true;
	}

	$filter_str .= implode(' OR ', $filter_where);
	$filter_str .= " ) ";

	if ($filter_chk === true) {
		$where[] = $filter_str;
	}

	// ============================================
	// 5. 품절 제외
	// ============================================
	if ($is_soldout == "Y") {
		$where[] = " a.soldout!='".$is_soldout."'";
		$checked['is_soldout']['Y'] = "checked";
	}

	// ============================================
	// 6. 게임 타입 조건 (OR 조건)
	// ============================================
	if ($game_type_basic != "") {
		$type_where[] = " (a.game_type='game' and a.display_type='basic') ";
		$checked['game_type']['basic'] = "checked";
		$type_chk = true;
	}

	if ($game_type_edition != "") {
		$type_where[] = " (a.game_type='game' and a.display_type='edition') ";
		$checked['game_type']['edition'] = "checked";
		$type_chk = true;
	}

	if ($game_type_dlc != "") {
		$type_where[] = " a.game_type='dlc' ";
		$checked['game_type']['dlc'] = "checked";
		$type_chk = true;
	}

	if ($game_type_music != "") {
		$type_where[] = " a.game_type='music' ";
		$checked['game_type']['music'] = "checked";
		$type_chk = true;
	}

	if ($game_type_bundle != "") {
		$type_where[] = " a.game_type='bundle' ";
		$checked['game_type']['bundle'] = "checked";
		$type_chk = true;
	}

	$type_str .= implode(' OR ', $type_where);
	$type_str .= " ) ";

	if ($type_chk === true) {
		$where[] = $type_str;
	}

	// ============================================
	// 7. 플랫폼 조건 (OR 조건)
	// ============================================
	if ($platform != "") {
		$platform_where[] = " a.product_platform='".$platform."' ";
		$checked['platform'][$platform] = "checked";
		$platform_chk = true;
	}

	if ($platform_1 != "") {
		$platform_where[] = " a.product_platform='1' ";
		$checked['platform']['1'] = "checked";
		$platform_chk = true;
	}

	if ($platform_34 != "") {
		$platform_where[] = " a.product_platform='34' ";
		$checked['platform']['34'] = "checked";
		$platform_chk = true;
	}

	if ($platform_35 != "") {
		$platform_where[] = " a.product_platform='35' ";
		$checked['platform']['35'] = "checked";
		$platform_chk = true;
	}

	$platform_str .= implode(' OR ', $platform_where);
	$platform_str .= " ) ";

	if ($platform_chk === true) {
		$where[] = $platform_str;
	}

	// ============================================
	// 7. 배송타입 조건 (OR 조건)
	// ============================================
	if ($delivery_type_1 != "") {
		$delivery_where[] = " a.delivery_type='1' ";
		$checked['delivery_type']['1'] = "checked";
		$delivery_chk = true;
	}

	if ($delivery_type_2 != "") {
		$delivery_where[] = " a.delivery_type='2' ";
		$checked['delivery_type']['2'] = "checked";
		$delivery_chk = true;
	}

	if ($delivery_type_3 != "") {
		$delivery_where[] = " a.delivery_type='3' ";
		$checked['delivery_type']['3'] = "checked";
		$delivery_chk = true;
	}

	$delivery_str .= implode(' OR ', $delivery_where);
	$delivery_str .= " ) ";

	if ($delivery_chk === true) {
		$where[] = $delivery_str;
	}

	// ============================================
	// 8. 한국어 지원 조건 (OR 조건)
	// ============================================
	if ($interface_korean == "Y") {
		$korean_where[] = " a.interface_korean='".$interface_korean."'";
		$checked['interface_korean']['Y'] = "checked";
		$korean_chk = true;
	}

	if ($spoken_korean == "Y") {
		$korean_where[] = " a.spoken_korean='".$spoken_korean."'";
		$checked['spoken_korean']['Y'] = "checked";
		$korean_chk = true;
	}

	if ($exclusive_korean == "Y") {
		$korean_where[] = " a.exclusive_korean='".$exclusive_korean."'";
		$checked['exclusive_korean']['Y'] = "checked";
		$korean_chk = true;
	}

	$korean_str .= implode(' OR ', $korean_where);
	$korean_str .= " ) ";

	if ($korean_chk === true) {
		$where[] = $korean_str;
	}

	// ============================================
	// 9. 장르 조건 (FULLTEXT BOOLEAN MODE)
	// ============================================
	for ($i = 0; $i <= 10; $i++) {
		if ($genre_code_arr[$i]) {
			$genre_where[] = " '".$genre_code_arr[$i]."*' ";
			$checked['genre_code'][$genre_code_arr[$i]] = "checked";
			$genre_chk = true;
		}
	}

	$genre_str .= implode(' ', $genre_where);
	$genre_str .= " IN BOOLEAN MODE) ) ";

	if ($genre_chk === true) {
		$where[] = $genre_str;
	}

	// ============================================
	// 10. 카테고리 조건 (FULLTEXT BOOLEAN MODE)
	// ============================================
	/*
	if ($category_code) {
		$where[] = " match(a.category) AGAINST('+".$category_code."' in boolean mode)";
	}
	*/

	for ($i = 0; $i <= 44; $i++) {
		if ($category_code_arr[$i]) {
			$category_where[] = " '".$category_code_arr[$i]."*' ";
			$checked['category_code'][$category_code_arr[$i]] = "checked";
			$category_chk = true;
		}
	}

	$category_str .= implode(' ', $category_where);
	$category_str .= " IN BOOLEAN MODE) ) ";

	if ($category_chk === true) {
		$where[] = $category_str;
	}

	// ============================================
	// 11. 프로모션 체크박스
	// ============================================
	if ($is_promotion == "Y") {
		$where[] = " c.idx IS NOT NULL";  // ⭐ 이 줄 추가!
		$checked['is_promotion']['Y'] = "checked";
	}

	// ============================================
	// 12. ⭐ 가격 필터 (min_price, max_price)
	// ============================================
	if ($min_price > 0) {
		$price_where[] = " COALESCE(c.sale_price, a.price) >= '".$min_price."' ";
		$price_chk = true;
	}

	if ($max_price > 0) {
		$price_where[] = " COALESCE(c.sale_price, a.price) <= '".$max_price."' ";
		$price_chk = true;
	}

	$price_str .= implode(' AND ', $price_where);
	$price_str .= " ) ";

	if ($price_chk === true) {
		$where[] = $price_str;
	}

	// ============================================
	// 13. WHERE 절 생성
	// ============================================
	$add_where = "";
	foreach ($where as $value) {
		$add_where .= " and ".$value;
	}

	// ============================================
	// 14. 페이지별 추가 조건
	// ============================================
	// 그룹 페이지
	if ($idx) {
		$add_where .= " and b.group_idx='".$idx."'";
	}

	// 퍼블리셔 페이지
	if ($publisher_code) {
		$add_where .= " and a.supplier_code='".$publisher_code."'";
	}
	
	// ============================================
	// 15. URL 파라미터 생성
	// ============================================
	$param = "";
	foreach ($_GET as $key => $value) {
		if ($key != "page") {
			if ($value != "") {
				if (is_array($value)) {
					foreach ($value as $sub_value) {
						$param .= "&".$key."[]=".$sub_value;
					}
				} else {
					$param .= "&".$key."=".$value;
				}
			}
		}
	}

	// ============================================
	// 16. 정렬 조건
	// ============================================
	switch ($sort) {
		case "release":
			$orderby = "a.release_date desc";
			break;
		case "name":
			$orderby = "a.product_name asc";
			break;
		case "name_en":
			$orderby = "a.product_name_en asc";
			break;
		case "pricedown":
			$orderby = "COALESCE(c.sale_price, a.price) asc";
			break;
		case "priceup":
			$orderby = "COALESCE(c.sale_price, a.price) desc";
			break;
		case "discount":
			$orderby = "discount desc";
			break;
		default:
			if($q){
				$orderby = " score desc,a.release_date desc";
				$sort = "match";
			}else{
				$orderby = " a.release_date desc";
				$sort = "release";
			}
			break;
	}

	$selected['sort'][$sort] = "selected";
?>