<?
ini_set('display_errors', '1');
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
header("Content-type: text/html; charset=utf-8");
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib_webhook.php');

include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_kcp_webhook.xml');
$logger = Logger::getLogger("pc");

$logger->info("\n####가상계좌  입금통보#########\n");
$logger->info($_POST);
/*
 ==========================================================================
 PAGE : 공통 통보 PAGE
 --------------------------------------------------------------------------
 연동시 오류가 발생하는 경우 아래의 주소로 접속하셔서 확인하시기 바랍니다.
 접속 주소 : http://kcp.co.kr/technique.requestcode.do
 --------------------------------------------------------------------------
 Copyright (c)  2023   NHN KCP Inc.   All Rights Reserverd.
 
 가상계좌 모의 입금 페이지: https://testadmin.kcp.co.kr/Modules/Noti/TEST_Vcnt_Noti.jsp
 ==========================================================================
 */
?>
<?
    /*
     ==========================================================================
     02. 공통 통보 데이터받기
     --------------------------------------------------------------------------
     */
    $site_cd      = $_POST ["site_cd"];                 // 사이트 코드
    $tno          = $_POST ["tno"];                 // KCP 거래번호
    $order_no     = $_POST ["order_no"];                 // 주문번호
    $tx_cd        = $_POST ["tx_cd"];                 // 업무처리 구분 코드
    $tx_tm        = $_POST ["tx_tm"];                 // 업무처리 완료 시간
    /* = -------------------------------------------------------------------------- = */
    $ipgm_name    = "";                                    // 주문자명
    $remitter     = "";                                    // 입금자명
    $ipgm_mnyx    = "";                                    // 입금 금액
    $bank_code    = "";                                    // 은행코드
    $account      = "";                                    // 가상계좌 입금계좌번호
    $op_cd        = "";                                    // 처리구분 코드
    $noti_id      = "";                                    // 통보 아이디
    $cash_a_no    = "";                                    // 현금영수증 승인번호
    $cash_a_dt    = "";                                    // 현금영수증 승인시간
    $cash_no      = "";                                    // 현금영수증 거래번호
    /* = -------------------------------------------------------------------------- = */

    /*
    --------------------------------------------------------------------------
     02-1. 가상계좌 입금 통보 데이터 받기
    --------------------------------------------------------------------------
    */
    if ( $tx_cd == "TX00" )
    {
        $ipgm_name = $_POST[ "ipgm_name" ];                // 주문자명
        $remitter  = $_POST[ "remitter"  ];                // 입금자명
        $ipgm_mnyx = $_POST[ "ipgm_mnyx" ];                // 입금 금액
        $totl_mnyx = $_POST[ "totl_mnyx" ];                // 총 입금금액
        $ipgm_time = $_POST[ "ipgm_time" ];                // 입금 시각
        $bank_code = $_POST[ "bank_code" ];                // 은행코드
        $account   = $_POST[ "account"   ];                // 가상계좌 입금계좌번호
        $op_cd     = $_POST[ "op_cd"];                // 처리구분 코드 (입금완료:50, 입금 재전송:01, 입금취소: 13)
        $noti_id   = $_POST[ "noti_id"];                // 통보 아이디
        $cash_a_no = $_POST[ "cash_a_no"];                // 현금영수증 승인번호
        $cash_a_dt = $_POST[ "cash_a_dt"];                // 현금영수증 승인시간
        $cash_no   = $_POST[ "cash_no"];                // 현금영수증 거래번호
    }


    /* 
    ==========================================================================
     03. 공통 통보 결과를 업체 자체적으로 DB 처리 작업하시는 부분입니다.
    --------------------------------------------------------------------------
           통보 결과를 DB 작업 하는 과정에서 정상적으로 통보된 건에 대해 DB 작업에  
           실패하여 DB update 가 완료되지 않은 경우, 결과를 재통보 받을 수 있는     
           프로세스가 구성되어 있습니다.                                            
                                                                             
    * DB update가 정상적으로 완료된 경우                                     
         하단의 [04. result 값 세팅 하기] 에서 result 값의 value값을 0000으로     
         설정해 주시기 바랍니다.                                                  
                                                                             
    * DB update가 실패한 경우                                                
         하단의 [04. result 값 세팅 하기] 에서 result 값의 value값을 0000이외의   
          값으로 설정해 주시기 바랍니다.                                      
    -------------------------------------------------------------------------- 
    */

    /*
    --------------------------------------------------------------------------
     03-1. 가상계좌 입금 통보 데이터 DB 처리 작업 부분
    --------------------------------------------------------------------------
    */
    if ( $tx_cd == "TX00" ){
		try{
			//리뉴얼 DB
			$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
			$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

			//기존 DB
			$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
			$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

			$order = new Order($conn);
			$member = new Member($conn_dgkr);

			$pointnexus = new PointNexus(); //mode 미지정 → PointNexus::DEFAULT_MODE (운영 전환은 PointNexus.php 한 줄)

			$result = "0000";
			
			//가상계좌 입금 통보 로그저장

			$query="insert into kcp_vbank_log set site_cd=:site_cd,tno=:tno,order_no=:order_no,tx_cd=:tx_cd,tx_tm=:tx_tm,ipgm_name=:ipgm_name,ipgm_mnyx=:ipgm_mnyx,totl_mnyx=:totl_mnyx,ipgm_time=:ipgm_time,bank_code=:bank_code,account=:account,noti_id=:noti_id,op_cd=:op_cd,remitter=:remitter,cash_a_no=:cash_a_no,cash_no=:cash_no";
			$stmt = $conn->prepare($query);
			$params = array(
				':site_cd'=>$site_cd,
				':tno'=>$tno,
				':order_no'=>$order_no,
				':tx_cd'=>$tx_cd,
				':tx_tm'=>$tx_tm,
				':ipgm_name'=>$ipgm_name,
				':ipgm_mnyx'=>$ipgm_mnyx,
				':totl_mnyx'=>$totl_mnyx,
				':ipgm_time'=>$ipgm_time,
				':bank_code'=>$bank_code,
				':account'=>$account,
				':noti_id'=>$noti_id,
				':op_cd'=>$op_cd,
				':remitter'=>$remitter,
				':cash_a_no'=>$cash_a_no,
				':cash_no'=>$cash_no,
			);
			$stmt->execute($params);
			$logger->info($params);
			
			
			//주문서 결제상태 업데이트
			$u_query = "update tbl_order set step='2',payment_date=now() where step='1' AND settle_no=:settle_no";
			$stmt = $conn->prepare($u_query);
			$params = array(
				':settle_no'=>$order_no,
			);
			$stmt->execute($params);
			$logger->info($params);

			//##############################################################
			//게임코드발송
			//##############################################################
			//25-11-11(화) 19:08 [이종석] 이미 코드 발송은 되어있는 상태이므로 tbl_order_item을 update 하기만 하면 됨
			
			$order_item = $order->getOrderItem($order_no);
			
			foreach($order_item as $value){
				//게임코드 발송아이템 정보
				$delivery_item_list = $order->getGoodsItemDelivery($value['product_code']);
				switch($value['delivery_type']){
					case "1": //디지털상품 주문
						$order_status="2";
						$send_status = "delivered";
					break;
					case "2": //실물상품 주문
						$query="UPDATE tbl_order_shipment SET shipment_status='2' WHERE settle_no=:settle_no";
						$stmt = $conn->prepare($query);
						$d_params = array(
							":settle_no"=>$order_no,
						);
						$logger->info($d_params);
						$stmt->execute($d_params);
						$order_status="2";
					break;
					case "3": //디지털 + 실물상품 배송
						//실물상품 주문
						$query="UPDATE tbl_order_shipment SET shipment_status='2' WHERE settle_no=:settle_no";
						$stmt = $conn->prepare($query);
						$d_params = array(
							":settle_no"=>$order_no
						);
						$logger->info($d_params);
						$stmt->execute($d_params);
						$order_status="2";
						$send_status = "delivered";
					break;
				}

				//##############################################################
				//주문상품내역 정보 업데이트
				//##############################################################
				$query="update tbl_order_item set status=:status,send_status=:send_status where ordno=:ordno";
				$params = array(
					":status"=>$order_status,
					":send_status"=>$send_status,
					":ordno"=>$value['ordno'],
				);
				$logger->info($params);
				$stmt = $conn->prepare($query);
				$stmt->execute($params);

				//PointNexus VCNT book → confirm 처리
				//(ordno, productID)별 최신 row가 action='book' AND status='booked' 인 것만 confirm 대상
				//append-only 모델 — 이미 confirm/cancel 된 chain은 latest가 아니라서 자동 제외됨
				$pn_query = "SELECT a.* FROM tbl_order_item_pointnexus a
				             INNER JOIN (
				                 SELECT productID, MAX(idx) AS max_idx
				                 FROM tbl_order_item_pointnexus
				                 WHERE ordno=:ordno
				                 GROUP BY productID
				             ) b ON b.productID = a.productID AND b.max_idx = a.idx
				             WHERE a.ordno=:ordno
				               AND a.action='book' AND a.status='booked'
				               AND a.operationID IS NOT NULL AND a.operationID != ''";
				$pn_stmt = $conn->prepare($pn_query);
				$pn_stmt->execute(array(':ordno' => $value['ordno']));
				$pn_rows = $pn_stmt->fetchAll(PDO::FETCH_ASSOC);

				foreach($pn_rows as $pn_row){
					$pn_result = $pointnexus->runBookConfirm($pn_row['operationID']);
					$logger->info($pn_result);

					if(!empty($pn_result->success) && !empty($pn_result->data->license->key)){
						$op = $pn_result->data;
						$new_opid = isset($op->operationID) ? $op->operationID : null; //새 op 없으면 NULL (book op 재사용 시 uk_op 충돌). parent_operationID로 book op 링크 유지.
						//append-only — 새 row INSERT (UPDATE 안 함)
						OrderFulfillment_PointNexus::insertLogRow(
							$conn,
							$pn_row,
							'confirm',
							$new_opid,
							'confirmed',
							array(
								'license_key'       => $op->license->key,
								'license_type'      => isset($op->license->type) ? $op->license->type : '',
								'license_platform'  => isset($op->license->platform) ? $op->license->platform : '',
								'license_countries' => isset($op->license->countries) ? json_encode($op->license->countries, JSON_UNESCAPED_UNICODE) : '',
								'capsule_id'        => isset($op->capsule->id) ? $op->capsule->id : '',
								'raw_response'      => json_encode($pn_result, JSON_UNESCAPED_UNICODE),
							)
						);
					}else{
						$logger->error("PointNexus runBookConfirm 실패: ordno=".$value['ordno'].", operationID=".$pn_row['operationID']);
					}
				}
			}
				
			//##############################################################
			//사용 적립금 차감
			//##############################################################
			if($use_emoney>0){
				$member->setMemberEmoney($_SESSION['member']['m_no'],$use_emoney,'주문결제시 할인',$order_no);
			}
			
			$result = "0000";

		}catch(Exception $e){
			$result = "9999";
//			echo 'Error!: '.$e->getMessage();
			die();
		}
    }
    /* ============================================================================== */


    /* 
     ============================================================================== 
     04. result 값 세팅 하기
     ==============================================================================
     */
	
?>
<html><body><input type="hidden" name="result" value="<?=$result?>"></body></html>