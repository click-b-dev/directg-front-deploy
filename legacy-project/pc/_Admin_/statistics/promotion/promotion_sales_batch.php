<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$product_code = filter_input(INPUT_POST, 'product_code', FILTER_SANITIZE_STRING);
$publisher_code = filter_input(INPUT_POST, 'publisher_code', FILTER_SANITIZE_STRING);
$promotion_start = filter_input(INPUT_POST, 'promotion_start', FILTER_SANITIZE_STRING);
$promotion_end = filter_input(INPUT_POST, 'promotion_end', FILTER_SANITIZE_STRING);
$promotion_srp= filter_input(INPUT_POST, 'promotion_srp', FILTER_SANITIZE_STRING);
$sale_price= filter_input(INPUT_POST, 'sale_price', FILTER_SANITIZE_STRING);

//선택 집계(promotion_selected_batch) — 체크된 프로모션 목록 (병렬 배열)
$products = filter_input(INPUT_POST, 'products', FILTER_SANITIZE_STRING, FILTER_FORCE_ARRAY);
$starts   = filter_input(INPUT_POST, 'starts',   FILTER_SANITIZE_STRING, FILTER_FORCE_ARRAY);
$ends     = filter_input(INPUT_POST, 'ends',     FILTER_SANITIZE_STRING, FILTER_FORCE_ARRAY);
$prices   = filter_input(INPUT_POST, 'prices',   FILTER_SANITIZE_STRING, FILTER_FORCE_ARRAY);

//단일 프로모션 집계 (멱등: 기존 집계행 삭제 후 재삽입)
function aggregatePromotion($conn, $product_code, $promotion_start, $promotion_end, $sale_price){
	$total_count = 0;
	$total_price = 0;

	$query = "select b.product_code,b.product_name,TIMESTAMPDIFF(day, :promotion_start, b.order_date) AS day_diff,count(*)as cc,b.price,b.order_date from tbl_order a inner join tbl_order_item b on a.settle_no=b.settle_no inner join (select product_code,sale_price from tbl_promotion_schedule where promotion_start=:promotion_start and promotion_end=:promotion_end) as c on c.product_code=b.product_code and c.sale_price=b.price where a.step='2' and b.status='2' and b.order_date between :promotion_start and :promotion_end and b.product_code=:product_code GROUP BY b.product_code,day_diff";
	$params = array(
		":promotion_start"=>$promotion_start,
		":promotion_end"=>$promotion_end,
		":product_code"=>$product_code,
	);
	$stmt = $conn->prepare($query);
	$stmt->execute($params);
	$sales_data = $stmt->fetchAll();

	//재집계 멱등 처리: 기존 집계행 삭제 후 재삽입 (누적 방지)
	$del_query = "delete from tbl_sales_promotion where product_code=:product_code and promotion_start=:promotion_start and promotion_end=:promotion_end and unit_price=:unit_price";
	$stmt = $conn->prepare($del_query);
	$stmt->execute(array(
		":product_code"=>$product_code,
		":promotion_start"=>$promotion_start,
		":promotion_end"=>$promotion_end,
		":unit_price"=>$sale_price,
	));

	if(count($sales_data)==0){
		$query="insert into tbl_sales_promotion set product_code=:product_code,product_name=:product_name,promotion_start=:promotion_start,promotion_end=:promotion_end,day_diff=:day_diff,sales_count=:sales_count,unit_price=:unit_price ON DUPLICATE KEY UPDATE sales_count=VALUES(sales_count)";
		$stmt = $conn->prepare($query);
		$params = array(
			":product_code"=>$product_code,
			":product_name"=>"",
			":promotion_start"=>$promotion_start,
			":promotion_end"=>$promotion_end,
			":day_diff"=>"0",
			":sales_count"=>"0",
			":unit_price"=>$sale_price,
		);
		$stmt->execute($params);
	}

	foreach($sales_data as $value){
		$query="insert into tbl_sales_promotion set product_code=:product_code,product_name=:product_name,promotion_start=:promotion_start,promotion_end=:promotion_end,day_diff=:day_diff,sales_count=:sales_count,unit_price=:unit_price ON DUPLICATE KEY UPDATE sales_count=VALUES(sales_count)";
		$stmt = $conn->prepare($query);
		$params = array(
			":product_code"=>$value['product_code'],
			":product_name"=>$value['product_name'],
			":promotion_start"=>$promotion_start,
			":promotion_end"=>$promotion_end,
			":day_diff"=>$value['day_diff'],
			":sales_count"=>$value['cc'],
			":unit_price"=>$value['price']
		);
		$stmt->execute($params);

		$u_query="update tbl_sales set is_promotion='Y' where product_code=:product_code and unit_price=:unit_price and is_promotion='N'";
		$stmt = $conn->prepare($u_query);
		$u_params = array(
			":product_code"=>$value['product_code'],
			":unit_price"=>$value['price'],
		);
		$stmt->execute($u_params);

		$total_count+=$value['cc'];
		$total_price+=($value['price']*$value['cc']);
	}

	//할인 프로모션 주문수량 업데이트 (order_count가 채워지면 '집계됨'으로 전환)
	$u_query = "update tbl_promotion_schedule set order_count=:order_count,order_price=:order_price where product_code=:product_code and promotion_start=:promotion_start and promotion_end=:promotion_end and sale_price=:sale_price";
	$u_params = array(
		":order_count"=>$total_count,
		":order_price"=>$total_price,
		":product_code"=>$product_code,
		":promotion_start"=>$promotion_start,
		":promotion_end"=>$promotion_end,
		":sale_price"=>$sale_price,
	);
	$stmt = $conn->prepare($u_query);
	$stmt->execute($u_params);
}

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

	switch($mode){
		case "promotion_all_batch":
			//단건 집계 (재집계 버튼)
			aggregatePromotion($conn, $product_code, $promotion_start, $promotion_end, $sale_price);
		break;

		case "promotion_selected_batch":
			//체크박스로 선택된 미집계 프로모션들만 집계 (페이지당 최대 50개라 단일 요청)
			$processed = 0;
			if(is_array($products)){
				foreach($products as $i=>$pc){
					if($pc=="") continue;
					//환불기간(종료일+7일) 미경과 건은 제외 (방어)
					if(strtotime($ends[$i]) > time()-(7*86400)) continue;
					aggregatePromotion($conn, $pc, $starts[$i], $ends[$i], $prices[$i]);
					$processed++;
				}
			}
			echo json_encode(array("processed"=>$processed));
		break;
	}
}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}
?>
