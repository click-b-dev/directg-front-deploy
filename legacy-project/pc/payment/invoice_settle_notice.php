<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 0 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

require_once('../../_module/iamport/src/iamport.php');

include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');

include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_payment.xml');
$logger = Logger::getLogger("payment");

$rest_api_key = "4958023482308513";
$rest_api_secret = "XFmDDOC5K8XMpjghwymn9vLHzZTr1foZVLDzAfEkoB6NVm4rVrP4WBMvBGXCVmCQ7fpHv31TF7GAuK2p";

$merchant_uid =filter_input(INPUT_POST, 'merchant_uid', FILTER_SANITIZE_STRING);
$status =filter_input(INPUT_POST, 'status', FILTER_SANITIZE_STRING);
$imp_uid =filter_input(INPUT_POST, 'imp_uid', FILTER_SANITIZE_STRING);

//header('Content-Type: application/json');
$logger->info($_POST);

$dsn = 'mysql:host='.DB_HOST.';dbname='.DB_DB.';port=3306;charset=utf8';

$iamport = new Iamport($rest_api_key, $rest_api_secret);

#2. merchant_uid 로 주문정보 찾기(가맹점의 주문번호)
$result = $iamport->findByImpUID($imp_uid); //IamportResult 를 반환(success, data, error)
$logger->info($result);

if ( $result->success ) {
	$payment_data = $result->data;

	//상품총 합계 = 상품합계 - 적립금할인 - 캐시할인 - 쿠폰할인
	$amount_should_be_paid = $payment_data->getCustomData('settle_price');
	try{  
			$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
			
			if ($payment_data->status === 'paid') {
				$amount = (int)$payment_data->amount;

				//결제로그생성
				$l_query = "insert into tbl_payment_log set imp_uid=:imp_uid,merchant_uid=:merchant_uid,pay_method=:pay_method,paid_amount=:paid_amount,status=:status,name=:name,pg_provider=:pg_provider,pg_tid=:pg_tid,buyer_name=:buyer_name,buyer_email=:buyer_email,custom_data=:custom_data,paid_at=:paid_at,receipt_url=:receipt_url,card_name=:card_name,apply_num=:apply_num,vbank_num=:vbank_num,vbank_name=:vbank_name,vbank_holder=:vbank_holder,vbank_date=:vbank_date,reg_date=now()";
				$stmt = $conn->prepare($l_query);
				$params = array(
					':imp_uid'=>$payment_data->imp_uid,
					':merchant_uid'=>$payment_data->getCustomData('settle_no'),
					':pay_method'=>$payment_data->pay_method,
					':paid_amount'=>$payment_data->amount,
					':status'=>$payment_data->status,
					':name'=>$payment_data->name,
					':pg_provider'=>$payment_data->pg_provider,
					':pg_tid'=>$payment_data->pg_tid,
					':buyer_name'=>$payment_data->buyer_name,
					':buyer_email'=>$payment_data->buyer_email,
					':custom_data'=>'',
					':paid_at'=>$payment_data->paid_at,
					':receipt_url'=>$payment_data->receipt_url,
					':card_name'=>$payment_data->card_name,
					':apply_num'=>$payment_data->apply_num,
					':vbank_num'=>$payment_data->vbank_num,
					':vbank_name'=>$payment_data->vbank_name,
					':vbank_holder'=>$payment_data->vbank_holder,
					':vbank_date'=>$payment_data->vbank_date,
				);
				$logger->info($params);
				$stmt->execute($params);
				
			}
			$order_result = true; 
		}catch (PDOException $e){  
			echo 'Error!: '.$e->getMessage();
			die();  
			//exit;
		}
		
		echo "ok";
} else {
	//결제실패
	$logger->info("결제실패");
}
	
?>