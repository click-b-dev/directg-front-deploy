<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$settle_no = filter_input(INPUT_GET, 'settle_no', FILTER_SANITIZE_STRING);

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
	
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);
	$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);


	$query = "select settle_no,ord_ymd,m_no,email,ip,emoney,cash,pg_provider,settlekind,settleprice,step,orddt,cdt,canceldt,mobilepay,memberdc from tbl_order where settle_no=:settle_no";
	$params = array(
		":settle_no"=>$settle_no,
	);
	$stmt = $conn_dgkr->prepare($query);
	$stmt->execute($params);
	$order_data = $stmt->fetchAll();

	foreach($order_data as $value){
		$query="insert into tbl_order set settle_no=:settle_no,m_no=:m_no,m_id=:m_id,ord_ymd=:ord_ymd,step=:step,use_emoney=:use_emoney,use_cash=:use_cash,member_dc=:member_dc,pg_provider=:pg_provider,payment_method=:payment_method,total_price=:total_price,is_mobile=:is_mobile,ip=:ip,reg_date=:reg_date,payment_date=:payment_date,cancel_date=:cancel_date,batch_date=now(),version='1' ON DUPLICATE KEY UPDATE step=:step,payment_date=:payment_date,total_price=:total_price,batch_date=now()";
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