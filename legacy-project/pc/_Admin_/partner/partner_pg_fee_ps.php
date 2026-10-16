<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$publisher_code = filter_input(INPUT_POST, 'publisher_code', FILTER_SANITIZE_NUMBER_INT);
$account = filter_input(INPUT_POST, 'account', FILTER_SANITIZE_NUMBER_FLOAT,FILTER_FLAG_ALLOW_FRACTION);
$credit_card = filter_input(INPUT_POST, 'credit_card', FILTER_SANITIZE_NUMBER_FLOAT,FILTER_FLAG_ALLOW_FRACTION);
$mobile_payment = filter_input(INPUT_POST, 'mobile_payment', FILTER_SANITIZE_NUMBER_FLOAT,FILTER_FLAG_ALLOW_FRACTION);
print_r($_POST);
try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	switch($mode){
		case "delete":
			$query = "delete from directgames.tbl_pg_fee where publisher_code=:publisher_code";
			$stmt = $conn->prepare($query);
			$params = array(
				':publisher_code'=>$publisher_code 
			);
			$stmt->execute($params);
			
			echo "삭제되었습니다.";
		break;
		case "modify":
			$query = "update directgames.tbl_pg_fee set account=:account,credit_card=:credit_card,mobile_payment=:mobile_payment where publisher_code=:publisher_code";
			$stmt = $conn->prepare($query);
			$params = array(
				':account'=>$account,
				':credit_card'=>$credit_card,
				':mobile_payment'=> $mobile_payment,
				':publisher_code'=>$publisher_code 
			);
			$stmt->execute($params);
			echo "수정되었습니다.";
		break;

		case "register":
			$query = "insert into directgames.tbl_pg_fee set publisher_code=:publisher_code,account=:account,credit_card=:credit_card,mobile_payment=:mobile_payment,reg_date=now()";
			$stmt = $conn->prepare($query);
			$params = array(
				':publisher_code'=>$publisher_code ,
				':account'=>$account,
				':credit_card'=>$credit_card,
				':mobile_payment'=> $mobile_payment
			);
			$stmt->execute($params);
			echo "등록되었습니다.";
		break;

		case "select":
			$query = "select account,credit_card,mobile_payment from directgames.tbl_pg_fee where publisher_code=:publisher_code";
			$stmt = $conn->prepare($query);
			$params = array(
				':publisher_code'=>$publisher_code 
			);
			$stmt->execute($params);

			$data = $stmt->fetch();

			echo json_encode($data);

			//print_r($data);
		break;
	}

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>