<?
exit;
ini_set('display_errors', '1');
header("Content-type: text/html; charset=utf-8");
require_once('../../_module/iamport/src/iamport.php');

include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');

include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_iamport.xml');
$logger = Logger::getLogger("kcp");

$rest_api_key = "4958023482308513";
$rest_api_secret = "XFmDDOC5K8XMpjghwymn9vLHzZTr1foZVLDzAfEkoB6NVm4rVrP4WBMvBGXCVmCQ7fpHv31TF7GAuK2p";


$imp_uid = "imp_589970101376";

$dsn = 'mysql:host='.DB_HOST.';dbname='.DB_DB.';port=3306;charset=utf8';

$iamport = new Iamport($rest_api_key, $rest_api_secret);

#2. merchant_uid 로 주문정보 찾기(가맹점의 주문번호)
$result = $iamport->findByImpUID($imp_uid); //IamportResult 를 반환(success, data, error)

print_r($result);
$logger->info($result);
exit;
if ( $result->success ) {
	$payment_data = $result->data;

//상품총 합계 = 상품합계 - 적립금할인 - 캐시할인 - 쿠폰할인
$amount_should_be_paid = $payment_data->getCustomData('settle_price');
try{  
		$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
		$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		
		if ($payment_data->status === 'paid') {
			$amount = $payment_data->amount;

			//결제로그생성
			$l_query = "insert into directgames.tbl_kcp_log_invoice set settle_count=:settle_count,imp_uid=:imp_uid,merchant_uid=:merchant_uid,pay_method=:pay_method,paid_amount=:paid_amount,status=:status,name=:name,pg_provider=:pg_provider,pg_tid=:pg_tid,buyer_name=:buyer_name,buyer_email=:buyer_email,custom_data=:custom_data,paid_at=:paid_at,receipt_url=:receipt_url,card_name=:card_name,apply_num=:apply_num,vbank_num=:vbank_num,vbank_name=:vbank_name,vbank_holder=:vbank_holder,vbank_date=:vbank_date,reg_date=now()";
			$stmt = $conn->prepare($l_query);
			$params = array(
				':settle_count'=>$payment_data->getCustomData('settle_count'),
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

			//$stmt->execute($params);
			//$logger->info($l_query);
			//$logger->info($params);

			switch($payment_data->pay_method){
				case "card":
					$settlekind = "SC0010";
				break;
				case "trans":
					$settlekind = "SC0030";
				break;
				case "phone":
					$settlekind = "SC0060";
				break;
				case "payco":
					$settlekind = "PAYCO";
				break;
			}
			
			$amount_due = (int)$payment_data->getCustomData('amount_due');
			$amount_paid = (int)$payment_data->getCustomData('amount_paid');
			
			if($amount_due-$amount>0){
				$step="1";
				$flag="N";
			}else{
				$step="2";
				$flag="Y";
			}
			
			$logger->info($step);
			$logger->info($flag);
			$logger->info($amount_paid);
			$logger->info($amount);
			$logger->info($amount_paid+$amount);

			//인보이스 갱신
			$query = "update directgames.tbl_invoice_order set step=:step,amount_count=amount_count+1,amount_paid=:amount_paid,cdt=now(),flag=:flag where settle_no=:settle_no";
			$stmt = $conn->prepare($query);
			$params2 = array(
				':step'=>$step,
				':amount_paid'=>($amount_paid+$amount),
				':flag'=>$flag,
				':settle_no'=>$payment_data->getCustomData('settle_no'),
			);
			$logger->info($params2);
			$stmt->execute($params2);

		}else if($payment_data->status === 'paid' && $payment_data->pay_method=="vbank" ){//가상계좌 입금완료
			$l_query = "insert into directgames.tbl_kcp_log_invoice set settle_count=:settle_count,imp_uid=:imp_uid,merchant_uid=:merchant_uid,pay_method=:pay_method,paid_amount=:paid_amount,status=:status,name=:name,pg_provider=:pg_provider,pg_tid=:pg_tid,buyer_name=:buyer_name,buyer_email=:buyer_email,custom_data=:custom_data,paid_at=:paid_at,receipt_url=:receipt_url,card_name=:card_name,apply_num=:apply_num,vbank_num=:vbank_num,vbank_name=:vbank_name,vbank_holder=:vbank_holder,vbank_date=:vbank_date,reg_date=now()";
			$stmt = $conn->prepare($l_query);
			$params = array(
				':settle_count'=>$payment_data->getCustomData('settle_count'),
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

			$stmt->execute($params);
			$logger->info($l_query);
			$logger->info($params);

			//주문서 업데이트
			$query = "update directgames.tbl_invoice_order set step=:step,amount_count=amount_count+1,amount_paid=:amount_paid,cdt=now(),flag=:flag where settle_no=:settle_no";
			$stmt = $conn->prepare($query);

			if($payment_data->getCustomData('amount_due')-$payment_data->amount>0){
				$step="1";
				$flag="N";
				$amount_paid = "";
			}else{
				$step="2";
				$flag="Y";
				$amount_paid = "";
			}

			$params = array(
				':step'=>$step,
				':amount_paid'=>$payment_data->getCustomData('amount_paid')+$payment_data->amount,
				':flag'=>$flag,
				':settle_no'=>$payment_data->getCustomData('settle_no'),
			);
			$stmt->execute($params);
			$logger->info($query);
			$logger->info($params);

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
	$API_ERROR_LOG = "/log/invoice/pg_result_error";
	$ymd = date('Ymd');
	error_log($result->error['code']."\n",3,$_SERVER['DOCUMENT_ROOT'].$API_ERROR_LOG.'_'.$ymd);
	error_log($result->error['message']."\n",3,$_SERVER['DOCUMENT_ROOT'].$API_ERROR_LOG.'_'.$ymd);
}
?>