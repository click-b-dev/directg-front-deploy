<?
header('Content-Type: application/json; charset=UTF-8');
ini_set("display_errors", 0);
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
include_once(__DIR__.'/_inc.php');

//카탈로그 목록 행별 재고 지연조회 — GET /product/{id}의 stock 필드만 추려 반환
$mode = filter_input(INPUT_GET, "mode", FILTER_SANITIZE_STRING);
$id   = filter_input(INPUT_GET, "id",   FILTER_SANITIZE_STRING);
$mode = pn_normalize_mode($mode);

$response = array(
	"success"   => false,
	"total_qty" => 0,
	"variants"  => array(),
	"error"     => "",
);

if(!$id){
	$response['error'] = "상품 ID가 없습니다.";
	echo json_encode($response, JSON_UNESCAPED_UNICODE);
	exit;
}

try {
	$pointnexus = new PointNexus($mode);
	$result = $pointnexus->runProductRetrieve($id);
	if(!empty($result->success) && !empty($result->data)){
		$product = is_array($result->data) ? $result->data[0] : $result->data;
		$stock = isset($product->stock) && is_array($product->stock) ? $product->stock : array();
		$total = 0;
		$variants = array();
		foreach($stock as $s){
			$qty = (isset($s->qty) && is_numeric($s->qty)) ? (int)$s->qty : 0;
			$total += $qty;
			$variants[] = array(
				'qty'       => $qty,
				'geolock'   => isset($s->geolock) ? (string)$s->geolock : '',
				'countries' => (isset($s->countries) && is_array($s->countries)) ? count($s->countries) : 0,
			);
		}
		$response['success']   = true;
		$response['total_qty'] = $total;
		$response['variants']  = $variants;
	} else {
		$response['error'] = pn_extract_error($result, '재고 조회 실패');
	}
} catch (Exception $e) {
	$response['error'] = $e->getMessage();
}

echo json_encode($response, JSON_UNESCAPED_UNICODE);
exit;
