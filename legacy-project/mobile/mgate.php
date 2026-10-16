<?php

$forward = preg_split("/[?]+/",$_GET['refer']);

if(isset($forward['1']))
{
	$forward['1'] = explode('=', $forward['1'], 2);
	while($forward['1']['1']!=urldecode($forward['1']['1'])) $forward['1']['1'] = urldecode($forward['1']['1']);
	$forward['1']['1'] = urlencode($forward['1']['1']);
	$forward['1'] = implode('=', $forward['1']);
}

### 모바일에서 제공하는 페이지리스트
// $url_check = array(
// 	'/' => 'index.html',
// 	'/index.php' => 'index.php',
// 	'/service/service.html' => 'service/service.html',
// 	'/member/login.html' => 'member/login.html',
// 	'/member/join_step1.html' => 'member/join_step1.html',
// 	'/game/game_view.html' => 'game/game_view.html',
// 	'/game/dlc_view.html' => 'game/dlc_view.html',
// 	'/game/bundle_view.html' => 'game/bundle_view.html',
// 	'/game/holomodels_view.html' => 'game/holomodels_view.html',
// 	'/game/holomodelsdlc_view.html' => 'game/holomodelsdlc_view.html',
// 	'/game/game_thumb.html' => 'game/game_thumb.html',
// 	'/game/game_list.html' => 'game/game_list.html',
// 	'/game/game_grid.html' => 'game/game_thumb.html',
// 	'/game/goods_thumb.html' => 'game/goods_thumb.html',
// 	'/game/goods_list.html' => 'game/goods_list.html',
// 	'/game/goods_grid.html' => 'game/goods_thumb.html',
// 	'/game/holomodels_thumb.html' => 'game/holomodels_thumb.html',
// 	'/game/holomodels_list.html' => 'game/holomodels_list.html',
// 	'/game/holomodels_grid.html' => 'game/holomodels_thumb.html',
// 	'/system_check.html' => 'system_check.html',
// 	'/promotion/promotion_ing_thumb.html' => 'promotion/promotion_ing_thumb.html',
// 	'/promotion/promotion_ing_list.html' => 'promotion/promotion_ing_list.html',
// 	'/promotion/promotion_ing_grid.html' => 'promotion/promotion_ing_thumb.html',
// 	'/promotion/promotion_season.html' => 'promotion/promotion_season.html',
// 	'/promotion/promotion_weekend.html' => 'promotion/promotion_weekend.html',
// 	'/board/notice_view.html' => 'board/notice_view.html',
// 	'/event/event.html' => 'event/event.html'
// );

$url_check = array(
	'/' => 'index.html',
	"/index.php" => "index.php",
	"/service/service.html" => "service/service.html",
	"/promotion/promotion_ing_thumb.html" => "promotion/promotion_ing_thumb.html",
	"/promotion/promotion_ing_list.html" => "promotion/promotion_ing_list.html",
	"/promotion/promotion_ing_grid.html" => "promotion/promotion_ing_thumb.html",
	"/promotion/promotion_weekend.html" => "promotion/promotion_weekend.html",
	"/promotion/promotion_season.html" => "promotion/promotion_season.html",
	"/event/event.html" => "event/event.html",
	"/board/notice.html" => "board/notice.html",
	"/board/notice_view.html" => "board/notice_view.html",
	"/service/guide.html" => "service/guide.html",
	"/service/guide_steam.html" => "service/guide_steam.html",
	"/service/guide_epic.html" => "service/guide_epic.html",
	"/service/guide_rockstar.html" => "service/guide_rockstar.html",
	"/board/faq.html" => "board/faq.html",
	"/mypage/mypage_qna_register.html" => "mypage/mypage_qna_register.html",
	"/game/game_view.html" => "game/game_view.html",
	"/game/dlc_view.html" => "game/dlc_view.html",
	"/game/bundle_view.html" => "game/bundle_view.html",
	"/game/goods_item_view.html" => "game/goods_item_view.html",
	"/game/game_search_thumb.html" => "game/game_search_thumb.html",
	"/game/game_search_list.html" => "game/game_search_list.html",
	"/game/game_search_grid.html" => "game/game_search_thumb.html",
	"/game/game_thumb.html" => "game/game_thumb.html",
	"/game/game_list.html" => "game/game_list.html",
	"/game/game_grid.html" => "game/game_thumb.html",
	"/game/goods_thumb.html" => "game/goods_thumb.html",
	"/game/goods_list.html" => "game/goods_list.html",
	"/game/goods_grid.html" => "game/goods_thumb.html",
	"/game/holomodels_thumb.html" => "game/holomodels_thumb.html",
	"/game/holomodels_list.html" => "game/holomodels_list.html",
	"/game/holomodels_grid.html" => "game/holomodels_thumb.html",
	"/game/game_platform_thumb.html" => "game/game_platform_thumb.html",
	"/game/game_platform_list.html" => "game/game_platform_list.html",
	"/game/game_platform_grid.html" => "game/game_platform_thumb.html",
	"/game/game_genre_thumb.html" => "game/game_genre_thumb.html",
	"/game/game_genre_list.html" => "game/game_genre_list.html",
	"/game/game_genre_grid.html" => "game/game_genre_thumb.html",
	"/game/game_category_thumb.html" => "game/game_thumb.html",
	"/game/game_category_list.html" => "game/game_thumb.html",
	"/game/game_category_grid.html" => "game/game_thumb.html",
	"/game/goods_category_thumb.html" => "game/goods_thumb.html",
	"/game/goods_category_list.html" => "game/goods_thumb.html",
	"/game/goods_category_grid.html" => "game/goods_thumb.html",
	"/game/publisher_2k_thumb.html" => "game/publisher_2k_thumb.html",
	"/game/publisher_2k_list.html" => "game/publisher_2k_list.html",
	"/game/publisher_2k_grid.html" => "game/publisher_2k_thumb.html",
	"/game/publisher_sega_thumb.html" => "game/publisher_sega_thumb.html",
	"/game/publisher_sega_list.html" => "game/publisher_sega_list.html",
	"/game/publisher_sega_grid.html" => "game/publisher_sega_thumb.html",
	"/game/publisher_capcom_thumb.html" => "game/publisher_capcom_thumb.html",
	"/game/publisher_capcom_list.html" => "game/publisher_capcom_list.html",
	"/game/publisher_capcom_grid.html" => "game/publisher_capcom_thumb.html",
	"/game/publisher_paradox_thumb.html" => "game/publisher_paradox_thumb.html",
	"/game/publisher_paradox_list.html" => "game/publisher_paradox_list.html",
	"/game/publisher_paradox_grid.html" => "game/publisher_paradox_thumb.html",
	"/game/publisher_playstation_thumb.html" => "game/publisher_playstation_thumb.html",
	"/game/publisher_playstation_list.html" => "game/publisher_playstation_list.html",
	"/game/publisher_playstation_grid.html" => "game/publisher_playstation_thumb.html",
	"/game/publisher_neowiz_thumb.html" => "game/publisher_neowiz_thumb.html",
	"/game/publisher_neowiz_list.html" => "game/publisher_neowiz_list.html",
	"/game/publisher_neowiz_grid.html" => "game/publisher_neowiz_thumb.html",
	"/game/publisher_asw_thumb.html" => "game/publisher_asw_thumb.html",
	"/game/publisher_asw_list.html" => "game/publisher_asw_list.html",
	"/game/publisher_asw_grid.html" => "game/publisher_asw_thumb.html",
	"/game/publisher_thq_thumb.html" => "game/publisher_thq_thumb.html",
	"/game/publisher_thq_list.html" => "game/publisher_thq_list.html",
	"/game/publisher_thq_grid.html" => "game/publisher_thq_thumb.html",
	"/game/publisher_505_games_thumb.html" => "game/publisher_505_games_thumb.html",
	"/game/publisher_505_games_list.html" => "game/publisher_505_games_list.html",
	"/game/publisher_505_games_grid.html" => "game/publisher_505_games_thumb.html",
	"/game/publisher_focus_thumb.html" => "game/publisher_focus_thumb.html",
	"/game/publisher_focus_list.html" => "game/publisher_focus_list.html",
	"/game/publisher_focus_grid.html" => "game/publisher_focus_thumb.html",
	"/game/publisher_hooded_horse_thumb.html" => "game/publisher_hooded_horse_thumb.html",
	"/game/publisher_hooded_horse_list.html" => "game/publisher_hooded_horse_list.html",
	"/game/publisher_hooded_horse_grid.html" => "game/publisher_hooded_horse_thumb.html",
	"/game/publisher_clouded_leopard_thumb.html" => "game/publisher_clouded_leopard_thumb.html",
	"/game/publisher_clouded_leopard_list.html" => "game/publisher_clouded_leopard_list.html",
	"/game/publisher_clouded_leopard_grid.html" => "game/publisher_clouded_leopard_thumb.html",
	"/game/game_preorder.html" => "game/game_preorder.html",
	"/service/private.html" => "service/private.html",
	"/service/agreement.html" => "service/agreement.html",
	"/service/youthpolicy.html" => "service/youthpolicy.html",
	"/service/refund_policy.html" => "service/refund_policy.html",
	"/member/login.html" => "member/login.html",
	"/member/find_password.html" => "member/find_password.html",
	"/member/join_step1.html" => "member/join_step1.html",
	"/member/join_step2.html" => "member/join_step2.html",
	"/member/join_step3.html" => "member/join_step1.html",
	"/member/join_step4.html" => "member/join_step1.html",
	"/member/join_step5.html" => "member/join_step1.html",
	"/mypage/mypage_main.html" => "mypage/mypage_main.html",
	"/mypage/account_settings.html" => "mypage/account_settings.html",
	"/mypage/sns_login_connect.html" => "mypage/sns_login_connect.html",
	"/mypage/member_level_info.html" => "mypage/member_level_info.html",
	"/mypage/mypage_order_wating.html" => "mypage/mypage_order_wating.html",
	"/mypage/mypage_order_wating_view.html" => "mypage/mypage_order_wating_view.html",
	"/mypage/mypage_order.html" => "mypage/mypage_order.html",
	"/mypage/mypage_order_view.html" => "mypage/mypage_order_view.html",
	"/mypage/mypage_cancel_request.html" => "mypage/mypage_cancel_request.html",
	"/mypage/mypage_cancel_end.html" => "mypage/mypage_cancel_end.html",
	"/mypage/mypage_cancel_view.html" => "mypage/mypage_order_view.html",
	"/mypage/mypage_wishlist.html" => "mypage/mypage_wishlist.html",
	"/mypage/mypage_qna.html" => "mypage/mypage_qna.html",
	"/mypage/mypage_supply_content_v2.html" => "mypage/mypage_supply_content.html",
	"/mypage/mypage_point.html" => "mypage/mypage_point.html",
	"/mypage/mypage_coupon.html" => "mypage/mypage_coupon.html",
	"/mypage/mypage_gift.html" => "mypage/mypage_gift.html",
	"/order/cart.html" => "order/cart.html",
	"/order/order.html" => "order/order.html",
	"/order/settle.html" => "order/settle.html",
	"/order/order_end.html" => "order/order_end.html",
	"/order/order_fail.html" => "order/order_fail.html",
	"/system_check.html" => "system_check.html"
);

### 모바일용 페이지인지 체크하여 모바일용 페이지로 링크 변환
foreach($url_check as $k => $v){
	if( $k == $forward['0'] ){
		$param = "";
		foreach($_GET as $k2=>$v2){
			while($v2!=urldecode($v2)) $v2 = urldecode($v2);
			if($k2 != 'refer') $param .= "&".$k2."=".urlencode($v2);
		}
		//header("HTTP/1.1 301 Moved Permanently");
		
		//echo $param;
		if($forward['1']){
			header("location:https://m.directg.net/".$v."?".$forward['1'].$param);exit;
			echo $v;
		}else{
			header("location:https://m.directg.net/".$v);exit;
			echo $v;
		}
	}
}

### 상단에서 매칭되는 정보가 없다면 모두 메인페이지로 이동.
$queryList = array();
foreach ($_GET as $name => $value) {
	if ($name != 'refer') $queryList[] = $name.'='.urlencode($value);
}
$queryString = count($queryList) ? ('?'.implode('&', $queryList)) : '';
header("HTTP/1.1 301 Moved Permanently");
header("location:https://".$_SERVER['HTTP_HOST']."/".$queryString);exit;
?>