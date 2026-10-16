<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$event_no = filter_input(INPUT_GET, 'event_no', FILTER_SANITIZE_STRING);
$start_dt = filter_input(INPUT_GET, 'start_dt', FILTER_SANITIZE_STRING);
$end_dt = filter_input(INPUT_GET, 'end_dt', FILTER_SANITIZE_STRING);

try{
	$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	if($event_no){
		$query = "select * from tbl_event_goods where event_no=:event_no";
		$params = array(
			":event_no"=>$event_no
		);
		$stmt = $conn_dgkr->prepare($query);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		
		foreach($data as $value){
			echo $value['goods_code']." / ".$value['sale_price']." / ".$value['discount_rate']." / ".$value['event_srp']." / ".$value['p_discount_rate']."<br/>" ;
			$query="insert into tbl_promotion_schedule set promotion_type=:promotion_type,promotion_gubun=:promotion_gubun,product_code=:product_code,promotion_start=:promotion_start,promotion_end=:promotion_end,consumer_price=:consumer_price,sale_price=:sale_price,discount_rate=:discount_rate,promotion_srp=:promotion_srp,p_discount_rate=:p_discount_rate,publisher_code=:publisher_code,reg_date=now() ON DUPLICATE KEY UPDATE promotion_type=:promotion_type,promotion_gubun=:promotion_gubun,sale_price=:sale_price,discount_rate=:discount_rate,promotion_srp=:promotion_srp,p_discount_rate=:p_discount_rate,publisher_code=:publisher_code,reg_date=now()";
			$param = array(
				":promotion_type"=>'플래시',
				":promotion_gubun"=>'22',
				":product_code"=>$value['goods_code'],
				":promotion_start"=>$start_dt,
				":promotion_end"=>$end_dt,
				":consumer_price"=>$consumer_price,
				":sale_price"=>$value['sale_price'],
				":discount_rate"=>$value['discount_rate'],
				":promotion_srp"=>$value['event_srp'],
				":p_discount_rate"=>$value['p_discount_rate'],
				":publisher_code"=>$publisher_code
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
		}
	}
}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>