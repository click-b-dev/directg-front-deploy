<?php
ini_set("display_errors",1);
header('Content-Type: application/json');
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$idx = filter_input(INPUT_POST, 'idx', FILTER_SANITIZE_STRING);
$idx_arr = filter_input(INPUT_POST, 'idx_arr', FILTER_SANITIZE_STRING,FILTER_FORCE_ARRAY);
$product_code_arr = filter_input(INPUT_POST, 'product_code_arr', FILTER_SANITIZE_STRING,FILTER_FORCE_ARRAY);

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$mypage = new Mypage2($conn);
	$goods = new Goods($conn);
	$order = new Order($conn);

	$json_data = array(
		"mode"=>$mode,
		"idx"=>$idx,
		"idx_arr"=>$idx_arr[0]
	);
	switch($mode){
		case "delete":
			$mypage->deleteWishlist($_SESSION['member']['m_no'],$idx);
			$json_data = array(
				"error_code"=>"OK",
				"error_msg"=>"삭제 완료"
			);
			echo json_encode($json_data);
		break;
		case "select_delete":
			foreach ($idx_arr as $idx) {
				$mypage->deleteWishlist($_SESSION['member']['m_no'],$idx);
			}
			$json_data = array(
				"error_code"=>"OK",
				"error_msg"=>"삭제 완료"
			);
			echo json_encode($json_data);
		break;
		case "cart_move":
			foreach ($product_code_arr as $product_code) {
				$product_code_chk = $mypage->getCart($_SESSION['member']['m_no'], $product_code);
				if(!$product_code_chk){
					$wishlist_item = $mypage->getWishlistItem($_SESSION['member']['m_no'], $product_code);
					$goods_item_info = $goods->getGoodsItemDetailSku($wishlist_item['goods_sku']);
					$ip = get_client_ip_env();
					$request_params = array(
						"m_no"=>$_SESSION['member']['m_no'],
						"ip"=>$ip,
						"goods_sku"=>$wishlist_item['goods_sku'],
						"product_code"=>$goods_item_info['product_code'],
						"product_type"=>$goods_item_info['option_type'],
					);
					$result = $order->addCart($request_params);
					$mypage->deleteWishlistGoodscode($_SESSION['member']['m_no'], $product_code);
				}
			}
			$json_data = array(
				"error_code"=>"OK",
				"error_msg"=>"이동되었습니다."
			);
			echo json_encode($json_data);
		break;
		case "add_wishlist":
			/*
			foreach ($goods_code_arr as $goods_code) {
				$goods_code_chk = $mypage->getCart($_SESSION['member']['m_no'], $goods_code);
				if(!$goods_code_chk){
					$mypage->setCart($_SESSION['member']['m_no'], $goods_code);
					$mypage->deleteWishlistGoodscode($_SESSION['member']['m_no'], $goods_code);
				}
			}
			$json_data = array(
				"error_code"=>"OK",
				"error_msg"=>"이동되었습니다."
			);
			echo json_encode($json_data);
			*/
		break;
	}
}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}
?>