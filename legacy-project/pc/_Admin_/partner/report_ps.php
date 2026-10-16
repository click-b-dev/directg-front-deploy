<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);

$publisher_code = filter_input(INPUT_POST, 'publisher_code', FILTER_SANITIZE_STRING);
$currency_converter = filter_input(INPUT_POST, 'currency_converter', FILTER_SANITIZE_STRING);
$product_code = filter_input(INPUT_POST, 'product_code', FILTER_SANITIZE_STRING);
$account_fee = filter_input(INPUT_POST, 'account_fee', FILTER_SANITIZE_NUMBER_FLOAT,FILTER_FLAG_ALLOW_FRACTION);
$card_fee = filter_input(INPUT_POST, 'card_fee', FILTER_SANITIZE_NUMBER_FLOAT,FILTER_FLAG_ALLOW_FRACTION);
$mobile_fee = filter_input(INPUT_POST, 'mobile_fee', FILTER_SANITIZE_NUMBER_FLOAT,FILTER_FLAG_ALLOW_FRACTION);

$royalty = filter_input(INPUT_POST, 'royalty', FILTER_SANITIZE_STRING);
$royalty_info = filter_input(INPUT_POST, 'royalty_info', FILTER_SANITIZE_STRING);

$search_year = filter_input(INPUT_POST, 'search_year', FILTER_SANITIZE_STRING);
$search_month = filter_input(INPUT_POST, 'search_month', FILTER_SANITIZE_STRING);

$revenue = filter_input(INPUT_POST, 'revenue', FILTER_SANITIZE_NUMBER_INT);
$goods_srp = filter_input(INPUT_POST, 'goods_srp', FILTER_SANITIZE_NUMBER_INT);
$product_cost = filter_input(INPUT_POST, 'product_cost', FILTER_VALIDATE_FLOAT);

$report_term = filter_input(INPUT_POST, 'report_term', FILTER_SANITIZE_STRING);


if($_POST['report_data']){
	//$report_data =  str_replace(']"',"]",str_replace('"[',"[",$_POST['report_data']));
	$report_data =  substr($_POST['report_data'],1,strlen($_POST['report_data'])-2);
	$report_json = json_decode($report_data,true);
	
	$total = 0;
	$total_sold = 0;
	foreach($report_json as $value){
		$total+=$value['revenue_share'];

		$total_sold+=$value['gross_units_sold'];
	}
}



try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	
	switch($mode){
		case "report_register":
			//리포트 설정저장
			$query = "insert into directgames.tbl_report_config set publisher_code=:publisher_code,currency_converter=:currency_converter,account_fee=:account_fee,card_fee=:card_fee,mobile_fee=:mobile_fee,report_year=:report_year,report_month=:report_month,royalty=:royalty,royalty_info=:royalty_info,total=:total,total_sold=:total_sold,report_term=:report_term,reg_date=now() ON DUPLICATE KEY UPDATE update_date=now(),total=:total,total_sold=:total_sold,royalty=:royalty,royalty_info=:royalty_info,account_fee=:account_fee,card_fee=:card_fee,mobile_fee=:mobile_fee,currency_converter=:currency_converter";
			$params = array(
						":publisher_code" => $publisher_code,
						":currency_converter" => $currency_converter,
						":account_fee" => $account_fee,
						":card_fee" => $card_fee,
						":mobile_fee" => $mobile_fee,
						":report_year" => $search_year,
						":report_month" => $search_month,
						":royalty" => $royalty,
						":royalty_info" => $royalty_info,
						":total" => $total,
						":total_sold" => $total_sold,
						":report_term" => $report_term
					);
			$stmt = $conn->prepare($query);
			$stmt->execute($params);

			$parent_idx = $conn->lastInsertId();

			$sub_query="delete from directgames.tbl_report where parent_idx=:parent_idx";
			$sub_params = array(
				":parent_idx" => $parent_idx
			);

			$stmt = $conn->prepare($sub_query);
			$stmt->execute($sub_params);

			foreach($report_json as $value){
				$sub_query = "insert into directgames.tbl_report set parent_idx=:parent_idx,publisher_code=:publisher_code,product_code=:product_code,product_nm_en=:product_nm_en,platform_code=:platform_code,balence=:balence,rate=:rate,payment_gateway=:payment_gateway,publisher_srp=:publisher_srp,sales_price=:sales_price,publisher_price=:publisher_price,product_cost=:product_cost,gross_units_sold=:gross_units_sold,gross_sales_in_vat=:gross_sales_in_vat,gross_sales_ex_vat=:gross_sales_ex_vat,payment_gateway_fee=:payment_gateway_fee,net_sales=:net_sales,revenue=:revenue,revenue_share=:revenue_share";
				$sub_params = array(
							":parent_idx" => $parent_idx,
							":publisher_code" => $publisher_code,
							":product_code" => $value['product_code'],
							":product_nm_en" => $value['product_nm_en'],
							":platform_code" => $value['platform_code'],
							":balence" => $value['balence'],
							":rate" => $value['rate'],
							":payment_gateway" => $value['payment_gateway'],
							":publisher_srp" => $value['publisher_srp'],
							":sales_price" => $value['sales_price'],
							":publisher_price" => $value['publisher_price'],
							":product_cost" => $value['product_cost'],
							":gross_units_sold" => $value['gross_units_sold'],
							":gross_sales_in_vat" => $value['gross_sales_in_vat'],
							":gross_sales_ex_vat" => $value['gross_sales_ex_vat'],
							":payment_gateway_fee" => $value['payment_gateway_fee'],
							":net_sales" => $value['net_sales'],
							":revenue" => $value['revenue'],
							":revenue_share" => $value['revenue_share']
							
						);
				$stmt = $conn->prepare($sub_query);
				$stmt->execute($sub_params);
			}

			$go_url = "report_list.php";
			go($go_url);

			//리포트 통계저장
		break;
		case "report_batch":
			$start_date = $search_year."-".$search_month."-01";
			$end_date = $search_year."-".$search_month."-".date('t', strtotime($start_date));
			$query="call sp_sales_publisher_insert_batch(:publisher_code,:start_date,:end_date,@Result)";
			$params = array(
				":publisher_code" => $publisher_code,
				":start_date" => $start_date,
				":end_date" => $end_date
			);

			$stmt = $conn->prepare($query);
			$result = $stmt->execute($params);

			//print_r($params);
			echo "동기화가 완료되었습니다. 새로 고침해주십시요";
		break;

		case "refund_batch":
			$start_date = $search_year."-".$search_month."-01 00:00:00";
			$end_date = $search_year."-".$search_month."-".date('t', strtotime($start_date))." 23:59:59";
			$query="call sp_sales_publisher_refund_batch(:publisher_code,:start_date,:end_date,@Result)";
			$params = array(
				":publisher_code" => $publisher_code,
				":start_date" => $start_date,
				":end_date" => $end_date
			);

			$stmt = $conn->prepare($query);
			$result = $stmt->execute($params);

			//print_r($params);
			echo "동기화가 완료되었습니다. 새로 고침해주십시요";
		break;

		case "revenue_edit":
			$query="update tbl_goods_item set product_rs=:product_rs,product_srp=:product_srp where product_code=:product_code";
			$params = array(
				":product_rs" => $revenue,
				":product_srp" => $goods_srp,
				":product_code" => $product_code
			);
			$stmt = $conn->prepare($query);
			$result = $stmt->execute($params);
		break;

		case "email_notice":
			//메일 발송
			$query="update tbl_report_config set status='notice' where idx=:idx";
			$params = array(
				":idx" => $idx
			);
			$stmt = $conn->prepare($query);
			$result = $stmt->execute($params);
		break;
	}
}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>