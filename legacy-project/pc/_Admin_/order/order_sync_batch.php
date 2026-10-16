<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$ord_ymd = filter_input(INPUT_POST, 'ord_ymd', FILTER_SANITIZE_STRING);
$search_year = filter_input(INPUT_POST, 'search_year', FILTER_SANITIZE_STRING);

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
	
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);
	$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

	switch($mode){
		case "batch_day":
			switch($search_year){
				case "2013":

				break;
				case "2014":

				break;
				case "2015":

				break;
				case "2016":

				break;
				case "2017":
	
				break;
				case "2018":

				break;
				case "2019":

				break;
				case "2020":
					$query = "select settle_no,ord_ymd,m_no,email,ip,emoney,cash,pg_provider,settlekind,settleprice,step,orddt,cdt,canceldt,mobilepay from tbl_order_2020 where ord_ymd=:ord_ymd order by id asc";
					$params = array(
						":ord_ymd"=>$ord_ymd,
					);
					$stmt = $conn_dgkr->prepare($query);
					$stmt->execute($params);
					$order_data_2020 = $stmt->fetchAll();

					$is_2020 = true;
				break;
			}
		break;
	}
	

	foreach($order_data_2020 as $value){
		$query="insert into tbl_order set settle_no=:settle_no,m_no=:m_no,m_id=:m_id,ord_ymd=:ord_ymd,step=:step,use_emoney=:use_emoney,use_cash=:use_cash,pg_provider=:pg_provider,payment_method=:payment_method,total_price=:total_price,is_mobile=:is_mobile,ip=:ip,reg_date=:reg_date,payment_date=:payment_date,cancel_date=:cancel_date,batch_date=now(),version='1' ON DUPLICATE KEY UPDATE total_price=:total_price,batch_date=now()";
		$stmt = $conn->prepare($query);
		$params = array(
			":settle_no"=>$value['settle_no'],
			":m_no"=>$value['m_no'],
			":m_id"=>$value['email'],
			":ord_ymd"=>$value['ord_ymd'],
			":step"=>$value['step'],
			":use_emoney"=>$value['emoney'],
			":use_cash"=>$value['cash'],
			":pg_provider"=>$value['pg_provider'],
			":payment_method"=>$value['settlekind'],
			":total_price"=>$value['settleprice'],
			":is_mobile"=>strtoupper($value['mobilepay']),
			":ip"=>$value['ip'],
			":reg_date"=>$value['orddt'],
			":payment_date"=>$value['cdt'],
			":cancel_date"=>$value['canceldt'],
		);
		
		$stmt->execute($params);
	}

	

	$query = "select settle_no,ord_ymd,m_no,email,ip,emoney,cash,pg_provider,settlekind,settleprice,step,orddt,cdt,canceldt,mobilepay,memberdc from tbl_order where ord_ymd=:ord_ymd order by id asc";
	$params = array(
		":ord_ymd"=>$ord_ymd,
	);
	$stmt = $conn_dgkr->prepare($query);
	$stmt->execute($params);
	$order_data = $stmt->fetchAll();

	foreach($order_data as $value){
		$query="insert into tbl_order set settle_no=:settle_no,m_no=:m_no,m_id=:m_id,ord_ymd=:ord_ymd,step=:step,use_emoney=:use_emoney,use_cash=:use_cash,member_dc=:member_dc,pg_provider=:pg_provider,payment_method=:payment_method,total_price=:total_price,is_mobile=:is_mobile,ip=:ip,reg_date=:reg_date,payment_date=:payment_date,cancel_date=:cancel_date,batch_date=now(),version='1' ON DUPLICATE KEY UPDATE total_price=:total_price,batch_date=now()";
		$stmt = $conn->prepare($query);
		$params = array(
			":settle_no"=>$value['settle_no'],
			":m_no"=>$value['m_no'],
			":m_id"=>$value['email'],
			":ord_ymd"=>$value['ord_ymd'],
			":step"=>$value['step'],
			":use_emoney"=>$value['emoney'],
			":use_cash"=>$value['cash'],
			":member_dc"=>$value['memberdc'],
			":pg_provider"=>$value['pg_provider'],
			":payment_method"=>$value['settlekind'],
			":total_price"=>$value['settleprice'],
			":is_mobile"=>strtoupper($value['mobilepay']),
			":ip"=>$value['ip'],
			":reg_date"=>$value['orddt'],
			":payment_date"=>$value['cdt'],
			":cancel_date"=>$value['canceldt'],
		);
		
		$stmt->execute($params);
	}
	
	echo "완료";


}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>