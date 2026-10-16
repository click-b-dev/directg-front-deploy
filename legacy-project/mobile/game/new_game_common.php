<?php
if($is_bonus=="Y"){
	$filter_where[] = " a.is_bonus='".$is_bonus."'";
	$checked['is_bonus']['Y'] = "checked";
	$search_label[1]['is_bonus']="특전";
	$filter_chk = true;
}
if($is_preorder=="Y"){
	$filter_where[] = " a.is_preorder='".$is_preorder."'";
	$checked['is_preorder']['Y'] = "checked";
	$search_label[1]['is_preorder']="예약구매";
	$filter_chk = true;
}

if($is_soldout=="Y"){
	$where[] = " a.soldout!='".$is_soldout."'";
	$checked['is_soldout']['Y'] = "checked";
	$search_label[1]['is_soldout']="품절상품 제외";
}

$filter_str .= implode(' OR ', $filter_where);
$filter_str .= " ) ";

if($filter_chk===true){
	$where[]=$filter_str;
}

if($game_type_basic!=""){
	$type_where[] = " (a.game_type='game' and a.display_type='basic') ";
	$checked['game_type']['basic'] = "checked";
	$search_label[2]['game_type_basic']="기본게임";
	$type_chk = true;
}

if($game_type_edition!=""){
	$type_where[] = " (a.game_type='game' and a.display_type='edition') ";
	$checked['game_type']['edition'] = "checked";
	$search_label[2]['game_type_edition']="에디션";
	$type_chk = true;
}

if($game_type_dlc!=""){
	$type_where[] = " a.game_type='dlc' ";
	$checked['game_type']['dlc'] = "checked";
	$search_label[2]['game_type_dlc']="DLC";
	$type_chk = true;
}

if($game_type_music!=""){
	$type_where[] = " a.game_type='music' ";
	$checked['game_type']['music'] = "checked";
	$search_label[2]['game_type_music']="사운드트랙";
	$type_chk = true;
}

if($game_type_bundle!=""){
	$type_where[] = " a.game_type='bundle' ";
	$checked['game_type']['bundle'] = "checked";
	$search_label[2]['game_type_bundle']="번들";
	$type_chk = true;
}

$type_str .= implode(' OR ', $type_where);
$type_str .= " ) ";

if($type_chk===true){
	$where[]=$type_str;
}

if($platform!=""){
	$platform_where[] = " a.product_platform='".$platform."' ";
	$checked['platform'][$platform] = "checked";
	$search_label[3]['platform']=$platform;
	$platform_chk = true;
}

if($platform_1!=""){
	$platform_where[] = " a.product_platform='1' ";
	$checked['platform']['1'] = "checked";
	$search_label[3]['platform_1']="Steam";
	$platform_chk = true;
}

if($platform_34!=""){
	$platform_where[] = " a.product_platform='34' ";
	$checked['platform']['34'] = "checked";
	$search_label[3]['platform_34']="Epic Games";
	$platform_chk = true;
}

if($platform_35!=""){
	$platform_where[] = " a.product_platform='35' ";
	$checked['platform']['35'] = "checked";
	$search_label[3]['platform_35']="Rockstar Games";
	$platform_chk = true;
}

$platform_str .= implode(' OR ', $platform_where);
$platform_str .= " ) ";

if($platform_chk===true){
	$where[]=$platform_str;
}

if($interface_korean=="Y"){
	$korean_where[] = " a.interface_korean='".$interface_korean."'";
	$checked['interface_korean']['Y'] = "checked";
	$search_label[4]['interface_korean']="자막 한국어지원";
	$korean_chk = true;
}

if($spoken_korean=="Y"){
	$korean_where[] = " a.spoken_korean='".$spoken_korean."'";
	$checked['spoken_korean']['Y'] = "checked";
	$search_label[4]['spoken_korean']="음성 한국어지원";
	$korean_chk = true;
}

if($exclusive_korean=="Y"){
	$korean_where[] = " a.exclusive_korean='".$exclusive_korean."'";
	$checked['exclusive_korean']['Y'] = "checked";
	$search_label[4]['exclusive_korean']="독점 한국어지원";
	$korean_chk = true;
}

$korean_str .= implode(' OR ', $korean_where);
$korean_str .= " ) ";

if($korean_chk===true){
	$where[]=$korean_str;
}

$genre_code_arr[0]=$genre_code; //25-09-24(수) 17:08 [이종석] 장르를 선택해서 들어온 경우 기본값으로 $genre_code_arr[0]을 세팅
for($i=0;$i<=10;$i++){
	if($genre_code_arr[$i]){
		$genre_where[] = " '".$genre_code_arr[$i]."* '";
		$checked['genre_code'][$genre_code_arr[$i]] = "checked";
		$genre_chk = true;
	}
}


$genre_str .= implode(' ', $genre_where);
$genre_str .= " IN BOOLEAN MODE) ) ";

if($genre_chk===true){
	$where[]=$genre_str;
}

if($category_code){ //25-09-24(수) 17:08 [이종석] 카테고리를 선택해서 들어온 경우 해당 category_code
	$where[] = " match(a.category) AGAINST('+".$category_code."'  in boolean mode)";
}

if($is_promotion=="Y"){
	$search_option["is_promotion"]="할인프로모션";
	$checked['is_promotion']['Y'] = "checked";
	if($aside['promotion']!="false"){
		$search_label[1]['is_promotion']="프로모션";
	}

    $where[] = " c.idx IS NOT NULL";  // ⭐ 이 줄 추가!
}

//가격 필터링
// if($is_promotion=="Y"){
// 	if($min_price>0){
// 		$price_where[] = " c.sale_price>'".$min_price."' ";
// 		$price_chk = true;
// 	}
// 	if($max_price>0){
// 		$price_where[] = " c.sale_price<'".$max_price."' ";
// 		$price_chk = true;
// 	}
// } else {
// 	if($min_price>0){
// 		$price_where[] = " a.price>'".$min_price."' ";
// 		$price_chk = true;
// 	}
// 	if($max_price>0){
// 		$price_where[] = " a.price<'".$max_price."' ";
// 		$price_chk = true;
// 	}
// }
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

if($price_chk===true){
	$where[]=$price_str;
}

foreach($where as $value){
	$add_where.= " and ".$value;
}

foreach($_GET as $key=>$value){
	if($key<>"page" ){
		if($value<>""){
			if(is_array($value)){
				foreach($value as $sub_value){
					$param.="&".$key."[]=".$sub_value;
				}
			}else{
				$param.="&".$key."=".$value;
			}
			
		}
	}
}

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

$selected['sort'][$sort] = "checked";
?>