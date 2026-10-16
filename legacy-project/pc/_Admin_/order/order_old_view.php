<?php
$sidebar_file = "sidebar_order.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
require_once $_SERVER["DOCUMENT_ROOT"].'/../geoip2/geoip2.phar';

$page_title ="과거주문 상세보기";

$settle_no = filter_input(INPUT_GET, 'settle_no', FILTER_SANITIZE_STRING);
$search_year = filter_input(INPUT_GET, 'search_year', FILTER_SANITIZE_NUMBER_INT);

$goods_special_item = array();

try{
    // $conn = new PDO($dsn,DB_USER,DB_PASSWORD);
    // $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

    $conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
    $conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

    $adminOrder= new AdminOrder($conn_dgkr);

    // $order= new Order($conn_dgkr);

    // $use_emoney = $order->getOrderUsePoint($settle_no);
    // echo $use_emoney;

    $adminV1= new AdminV1($conn_dgkr);

    //주문결제정보
    $order_data = $adminOrder->getOrderInfo($settle_no, $search_year);

    //주문상품정보
    $order_item_data = $adminOrder->getOrderItem($settle_no, $search_year);

    //배송지정보
    // $order_address_data = $adminOrder->getOrderAddress($settle_no);

    $naverpay = new NaverPay('');
    $toss = new Toss("");
    $tosspay = new Tosspay("");

    //결제로그
    switch($order_data['version']){
        case "1":
            switch($order_data['pg_provider']){
                case "kcp":
                    $settle_log = $adminV1->getOrderKcpLog($settle_no);
                    break;
                case "uplus":
                    break;
                case "naverpay":
                    $settle_log = $adminV1->getOrderNaverPayLog($settle_no);
                    $naverpay_history=$naverpay->naverPayPaymentsHistory($settle_log['paymentId']);
                    break;
                case "payco":
                    $settle_log = $adminV1->getOrderPaycoLog($settle_no);
                    break;
            }
            break;
        case "2":
            switch($order_data['pg_provider']){
                case "kcp":
                    $settle_log = $adminV1->getOrderKcpLog2($settle_no);
                    break;
                case "uplus":
                    break;
                case "naverpay":
                    $settle_log = $adminV1->getOrderNaverPayLog3($settle_no);
                    break;
                case "payco":
                    $settle_log = $adminV1->getOrderPaycoLog($settle_no);
                    break;
            }
            break;
        case "3":
            switch($order_data['pg_provider']){
                case "kcp":
                    $settle_log = $adminOrder->getOrderKcpLog($settle_no);
                    break;
                case "uplus":
                    break;
                case "naverpay":
                    $settle_log = $adminOrder->getOrderNaverPayLog2($settle_no);

                    $naverpay_history=$naverpay->naverPayPaymentsHistory($settle_log['paymentId']);
                    break;
                case "payco":
                    $settle_log = $adminOrder->getOrderPaycoLog($settle_no);
                    break;
                case "toss":
                    $settle_log = $adminOrder->getOrderTossAdapterLog($settle_no);
                    if(!$settle_log['idx']){
                        $settle_log = $adminOrder->getOrderTossLog($settle_no);
                        $toss_history=$toss->viewPayment($settle_log['payment_key']);
                    } else {
                        $toss_history=$toss->viewPayment($settle_log['tno']);
                    }
                    break;
                case "toss_pay":
                    //토스페이먼츠와 별개
                    $settle_log = $adminOrder->getOrderTosspayLog($settle_no);
                    $view_params["payToken"]=$settle_log["payToken"];
                    $view_params["settle_no"]=$settle_no;
                    $tosspay_history=$tosspay->viewPayment($view_params);
                    break;
            }
            break;
    }

    //관리자메모

    //주문취소이력
    $order_log = $adminOrder->getOrderLog($settle_no);

    $cancel_request=0;
    $cancel_finish=0;

    $cancel_request_price=0;
    $cancel_finish_price=0;

}catch (PDOException $e){
    echo 'Error!: '.$e->getMessage();
    die();
}

//주문상태
$orderStatus = array(
	"0"=>"주문완료",
	"1"=>"주문대기",
	"2"=>"주문완료",
	"8"=>"취소요청",
	"9"=>"취소완료",
);
?>
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php'); ?>

<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
<div class="wrapper">
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_start.php'); ?>

<div class="content-page">
        <div class="content">
<!-- Start Content-->
            <div class="container-fluid">
                <!-- start page title -->
                <div class="row">
                    <div class="col-12">
                        <div class="page-title-box">
                            <div class="page-title-right">
                                <ol class="breadcrumb m-0">
                                    <li class="breadcrumb-item"><a href="javascript: void(0);">홈</a></li>
                                    <li class="breadcrumb-item"><a href="javascript: void(0);">주문</a></li>
                                    <li class="breadcrumb-item active"><?=$page_title?></li>
                                </ol>
                            </div>
                            <h4 class="page-title"><?=$page_title?></h4>
                        </div>
                    </div>
                </div>
                <!-- end page title -->

                <div class="row">
                    <div class="col-lg-12">
                        <div class="card mb-0">
                            <h5 class="card-header bg-secondary text-white font-14">주문상품 정보</h5>
                            <div class="card-body p-1">
                                <div class="table-responsive">
                                    <table class="table table-bordered table-sm mb-0">
                                        <thead class="table-light font-13">
                                        <tr>
                                            <th class="text-center" style="width:50px">선택</th>
                                            <th class="text-center" style="width:80px">주문번호</th>
                                            <th class="text-center">상품정보</th>
                                            <th class="text-center" style="width:70px">적립</th>
                                            <th class="text-center" style="width:90px">정상가</th>
                                            <th class="text-center" style="width:90px">판매가</th>
                                            <th class="text-center" style="width:90px">주문상태</th>
                                            <th class="text-center" style="width:90px">수령상태</th>
                                            <th class="text-center" style="width:90px">취소처리</th>
                                        </tr>
                                        </thead>
                                        <tbody class="font-12">
                                        <?
                                        $i=1;
                                        foreach($order_item_data as $value){
                                            if($value['delivery_type']=="1" || $value['delivery_type']=="3"){
                                                //키 발송현황
                                                switch($value['order_system']){
                                                    case "Asset":
                                                        $order_item_asset[$value['ordno']] = $adminOrder->getOrderItemAsset($value['ordno']);
                                                        break;
                                                    case "Ztorm":
                                                        $order_item_ztorm[$value['ordno']] = $adminOrder->getOrderItemZtorm($value['ordno']);
                                                        break;
                                                    case "Genba":
                                                        $order_item_genba[$value['ordno']] = $adminOrder->getOrderItemGenba($value['ordno']);
                                                        break;
                                                    case "Vaultn":
                                                        $order_item_vaultn[$value['ordno']] = $adminOrder->getOrderItemVaultn($value['ordno']);
                                                        break;
                                                }
                                            }

                                            if($value['delivery_type']=="2" || $value['delivery_type']=="3"){
                                                $order_item_delivery[$value['ordno']] = $adminOrder->getOrderItemDelivery($value['ordno']);
                                            }
                                            ?>
                                            <tr>
                                                <td class="text-center"><?=$i?></td>
                                                <td class="text-center"><?=$value['ordno']?></td>
                                                <td>
                                                    <?=$value['product_code']?>
                                                    <p class='mb-0'><?=$value['product_nm']?></p>
                                                </td>
                                                <td class="text-end"><?=number_format($value['repay'])?></td>
                                                <td class="text-end"><?=number_format($value['pay'])?> 원</td>
                                                <td class="text-end"><?=number_format($value['tot_pay'])?> 원</td>
                                                <td class="text-center"><?=$orderStatus[$value['STATUS']]?></td>
                                                <td class="text-center">
                                                    <? if($value['is_lic_actv']=="0"){
														echo "X";
													}elseif($value['is_lic_actv']=="2"){
														echo "미확인";
													}else{
														echo "O";
													}

													// if($data['zt_mem_id']>0){
													// 	$zt_mem_id=$data['zt_mem_id'];
													// }else{
													// 	$zt_mem_id=$value['zt_mem_id'];
													// }
    												?>
                                                </td>
                                                <td class="text-center">
                                                    <!-- <?if($value['status']<>'9'){?>
                                                        <button type="button" class="btn btn-danger btn-sm shadow-none btn_cancel" data-bs-toggle="modal" data-bs-target="#order-cancel-modal" data-ordno="<?=$value['ordno']?>" data-system="<?=$value['order_system']?>" data-productname="<?=$value['product_name']?>" data-delivery_type="<?=$value['delivery_type']?>">취소</button>
                                                    <?}?>
                                                    <?if($value['status']=='8'){?>
                                                        <hr>
                                                        <button type="button" class="btn btn-success btn-sm shadow-none btn_reject" data-ordno="<?=$value['ordno']?>" data-settleno="<?=$settle_no?>" data-adminid="<?=$_SESSION['admin']['admin_id']?>" data-settlemethod="<?=$order_data['payment_method']?>">반려</button>
                                                    <?}?> -->
                                                </td>
                                            </tr>
                                            <tr>
                                                <td colspan="9">
                                                    <table class="table table-bordered table-sm">
                                                        <tbody class="font-12">
                                                        <?php
                                                        if($value['delivery_type']=="1"||$value['delivery_type']=="3"){
                                                            ?>
                                                            <tr>
                                                                <th class="text-center bg-black text-white">디지털상품</th>
                                                                <td>
                                                                    <table class="table table-bordered table-sm mb-0">
                                                                        <colgroup>
                                                                            <col width="6%"/>
                                                                            <col width="19%"/>
                                                                            <col width="*"/>
                                                                            <col width="10%"/>
                                                                            <col width="10%"/>
                                                                            <col width="19%"/>
                                                                            <col width="6%"/>
                                                                            <col width="7%"/>
                                                                        </colgroup>
                                                                        <thead class="table-light font-12">
                                                                        <tr>
                                                                            <th class="text-center">주문시스템</th>
                                                                            <th class="text-center">Item ID</th>
                                                                            <th class="text-center">Item Name</th>
                                                                            <th class="text-center">Item Platform</th>
                                                                            <th class="text-center">Item Publisher</th>
                                                                            <th class="text-center">Item Order ID</th>
                                                                            <th class="text-center">Status</th>
                                                                            <th class="text-center">키확인</th>
                                                                        </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                        <?
                                                                        foreach($order_item_asset[$value['ordno']] as $sub_value){
                                                                            ?>
                                                                            <tr>
                                                                                <td class="text-center">Asset</td>
                                                                                <td class="text-center"><?=$sub_value['asset_id']?></td>
                                                                                <td><?=$sub_value['asset_name']?></td>
                                                                                <td class="text-center"><?=$sub_value['asset_platform']?></td>
                                                                                <td class="text-center"><?=$sub_value['asset_publisher']?></td>
                                                                                <td class="text-center"><?=$sub_value['reserve_id']?></td>
                                                                                <td></td>
                                                                                <td class="text-center">
                                                                                    <?
                                                                                    //if($value['is_actv']=="1"){
                                                                                    ?>
                                                                                    <button type="button" class="btn btn-info btn-sm shadow-none btn_licence_view" data-mode="getAssetLicence" data-itemorderid="<?=$sub_value['reserve_id']?>">키 확인</button>
                                                                                    <?
                                                                                    //}
                                                                                    ?>
                                                                                </td>
                                                                            </tr>
                                                                            <?
                                                                        }
                                                                        ?>
                                                                        <?
                                                                        foreach($order_item_ztorm[$value['ordno']] as $sub_value){
                                                                            ?>
                                                                            <tr>
                                                                                <td class="text-center">Ztorm</td>
                                                                                <td class="text-center"><?=$sub_value['ztorm_item_id']?></td>
                                                                                <td><?=$sub_value['ztorm_item_name']?></td>
                                                                                <td class="text-center"><?=$sub_value['ztorm_publisher']?></td>
                                                                                <td class="text-center"><?=$sub_value['ztorm_platform']?></td>
                                                                                <td class="text-center"><a href="https://hub.exertisztorm.net/hub/orders/list?id=&retailer_order=&retailer_customer=&customer_product=<?=$sub_value['customer_product_id']?>&after=&before=" target="_BLANK"><?=$sub_value['customer_product_id']?></a></td>
                                                                                <td></td>
                                                                                <td></td>
                                                                            </tr>
                                                                            <?
                                                                        }
                                                                        ?>
                                                                        <?
                                                                        foreach($order_item_genba[$value['ordno']] as $sub_value){
                                                                            ?>
                                                                            <tr>
                                                                                <td class="text-center">Genba</td>
                                                                                <td class="text-center"><?=$sub_value['Sku']?></td>
                                                                                <td><?=$sub_value['Name']?></td>
                                                                                <td class="text-center"><?=$sub_value['Platform']?></td>
                                                                                <td class="text-center"><?=$sub_value['Publisher']?></td>
                                                                                <td class="text-center"><?=$sub_value['ID']?></td>
                                                                                <td class="text-center">
                                                                                    <?

                                                                                    switch($sub_value['State']){
                                                                                        case "0":
                                                                                            echo "품절";
                                                                                            break;
                                                                                        case "1":
                                                                                            echo "예약구매";
                                                                                            break;
                                                                                        case "2":
                                                                                            echo "주문완료";
                                                                                            break;
                                                                                        case "3":
                                                                                            echo "환불완료";
                                                                                            break;

                                                                                    }
                                                                                    ?>
                                                                                </td>
                                                                                <td></td>
                                                                            </tr>
                                                                            <?
                                                                        }
                                                                        ?>
                                                                        <?
                                                                        foreach($order_item_vaultn[$value['ordno']] as $sub_value){
                                                                            ?>
                                                                            <tr>
                                                                                <td class="text-center">Vaultn</td>
                                                                                <td class="text-center"><?=$sub_value['sku']?></td>
                                                                                <td ><?=$sub_value['Name']?></td>
                                                                                <td class="text-center"><?=$sub_value['provider']?></td>
                                                                                <td class="text-center"><?=$sub_value['publisherName']?></td>
                                                                                <td class="text-center"><?=$sub_value['orderId']?></td>
                                                                                <td class="text-center"><?=$sub_value['status']?></td>
                                                                                <td></td>
                                                                            </tr>
                                                                            <?
                                                                        }
                                                                        ?>
                                                                        </tbody>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                            <?php
                                                        }
                                                        if($value['delivery_type']=="2"||$value['delivery_type']=="3"){
                                                            ?>
                                                            <tr>
                                                                <th class="text-center bg-black text-white">실물상품</th>
                                                                <td>
                                                                    <table class="table table-bordered table-sm">
                                                                        <thead class="table-light font-12">
                                                                        <tr>
                                                                            <th class="text-center">상품정보</th>
                                                                            <th class="text-center">배송상태</th>
                                                                            <th class="text-center">운송장번호</th>
                                                                            <th class="text-center">주문일자</th>
                                                                            <th class="text-center">배송시작일자</th>
                                                                            <th class="text-center">배송완료일자</th>
                                                                            <th class="text-center">구매확정일자</th>
                                                                            <th class="text-center">배송조회</th>
                                                                        </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                        <?
                                                                        foreach($order_item_delivery[$value['ordno']] as $sub_value){
                                                                            //모델정보 가져오기
                                                                            $model_info = $adminOrder->getOrderItemModelInfo($value['product_code']);

                                                                            $sub_value['shipment_company'] = $adminOrder->getShipmentCompany($sub_value['delivery_code']);
                                                                            ?>
                                                                            <tr>
                                                                                <td class="text-start">[<?=$model_info['model_code']?>] <?=$model_info['model_name']?></td>
                                                                                <td class="text-center <?=($sub_value['shipment_status']=="8"||$sub_value['shipment_status']=="9")?"text-danger":""?>"><?=$adminOrder->getShipmentStatus($sub_value['shipment_status'])?></td>
                                                                                <td class="text-center"><?=$sub_value['tracking_number']?><br/>(<?=$sub_value['shipment_company']['name']?>)</td>
                                                                                <td class="text-center"><?=$value['order_date']?></td>
                                                                                <td class="text-center"><?=$sub_value['shipped_date']?></td>
                                                                                <td class="text-center"><?=$sub_value['estimated_delivery_date']?></td>
                                                                                <td class="text-center"><?=$sub_value['actual_delivery_date']?></td>
                                                                                <td class="text-center"><button type='button' class='btn btn-sm btn-outline-secondary shadow-none font-12 btn_delivery_search' data-trackingno='<?=str_replace("-","",$sub_value['tracking_number'])?>' data-deliverycode="<?=$sub_value['delivery_code']?>">배송조회</button></td>
                                                                            </tr>

                                                                            <tr>
                                                                                <td class="bg-secondary text-white font-14">운송장 정보</td>
                                                                                <td colspan="7">
                                                                                    <form class="deliveryFrm" method="post" action="order_ps.php">
                                                                                        <input type="hidden" name="mode" value="register_tracking_no_item">
                                                                                        <input type="hidden" name="settle_no" value="<?=$value['settle_no']?>">
                                                                                        <input type="hidden" name="ordno" value="<?=$value['ordno']?>">
                                                                                        <input type="hidden" name="escw_yn" value="<?=$settle_log['escw_yn']?>">
                                                                                        <input type="hidden" name="payment_method" value="<?=$order_data['payment_method']?>">
                                                                                        <div class="input-group">
                                                                                            <select class="form-select bg-light" name="delivery_code">
                                                                                                <option value="001">CJ</option>
                                                                                                <option value="002">로젠</option>
                                                                                            </select>

                                                                                            <input type="text" class="form-control w-75" placeholder="운송장번호" name="tracking_no">
                                                                                            <button class="btn btn-dark shadow-none" name="register_tracking_no" id="register_tracking_no" type="submit">등록</button>
                                                                                        </div>
                                                                                    </form>
                                                                                </td>
                                                                            </tr>

                                                                            <?
                                                                        }
                                                                        ?>
                                                                        </tbody>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                            <?
                                                        }
                                                        ?>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                            <?
                                            if($value['status']=="8"){
                                                $cancel_request_price += $value['price'];
                                                $cancel_request++;
                                            } else if($value['status']=="9"){
                                                $cancel_finish_price += $value['price'];
                                                $cancel_finish++;
                                            }
                                            $total_price+=$value['tot_pay'];
                                            $i++;
                                        }
                                        ?>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-lg-4">
                        <div class="card mb-3">
                            <h5 class="card-header bg-secondary text-white font-14">주문자 정보</h5>
                            <div class="card-body p-1">
                                <table class="table table-bordered table-sm mb-0">
                                    <colgroup>
                                        <col width="25%"/>
                                        <col width="*"/>
                                    </colgroup>
                                    <tbody class="font-12">
                                    <tr>
                                        <th class="table-light">회원 고유번호</th>
                                        <td><span class="text-start"><?=$order_data['m_no']?></span></td>
                                    </tr>
                                    <tr>
                                        <th class="table-light">회원 ID</th>
                                        <td><span class="text-start"><?=$order_data['email']?></span></td>
                                    </tr>
                                    <tr>
                                        <th class="table-light">주문경로</th>
                                        <td><span class="text-start"><?=($order_data['mobilepay']=="n")?"PC":"모바일"?></span></td>
                                    </tr>
                                    <tr>
                                        <th class="table-light">주문 IP</th>
                                        <td><span class="text-start"><?=$order_data['ip']?></span></td>
                                    </tr>
                                    <tr>
                                        <th class="table-light">주문 국가</th>
                                        <td>
											<span class="text-start">
											<?
                                            try {
                                                $country = $adminOrder->getCountry($order_data['ip']);
                                                echo $country;
                                            } catch (Exception $e) {
                                                echo $e->getMessage();
                                                $country ="";
                                            }
                                            ?>

											</span>
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <?php
                        if($cancel_request>0 || $cancel_finish>0){
                            ?>
                            <div class="card mb-3">
                                <h5 class="card-header bg-secondary text-white font-14">취소 정보</h5>
                                <div class="card-body p-1">
                                    <table class="table table-bordered table-sm mb-0">
                                        <colgroup>
                                            <col width="25%"/>
                                            <col width="*"/>
                                        </colgroup>
                                        <tbody class="font-12">
                                        <tr>
                                            <th class="table-light">취소요청</th>
                                            <td><?=number_format($cancel_request_price)?> 원(<?=$cancel_request?> 건)</td>
                                        </tr>
                                        <tr>
                                            <th class="table-light">취소완료</th>
                                            <td><?=number_format($cancel_finish_price)?> 원 (<?=$cancel_finish?> 건)</td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <?php
                        }
                        ?>

                        <div class="card mb-3">
                            <h5 class="card-header bg-secondary text-white font-14 ">결제 정보</h5>
                            <div class="card-body p-1">
                                <div class="table-responsive">
                                    <table class="table table-sm table-bordered mb-0">
                                        <tbody class="font-12">
                                        <tr>
                                            <th class="table-light">주문생성일</th>
                                            <td class="text-start"><?=$order_data['orddt']?></td>
                                        </tr>
                                        <tr>
                                            <th class="table-light">결제번호</th>
                                            <td class="text-start"><?=$order_data['settle_no']?> <button class="btn btn-primary btn-sm" id="btn_settle_no_copy" data-settleno="<?=$order_data['settle_no']?>">번호 복사</button></td>
                                        </tr>
                                        <tr>
                                            <th class="table-light">결제PG</th>
                                            <td class="text-start"><?=$order_data['pg_provider']?></td>
                                        </tr>
                                        <tr>
                                            <th class="table-light">결제수단</th>
                                            <td class="text-start"><?=$order_data['settlekind']?></td>
                                        </tr>
                                        <tr>
                                            <th class="table-light">총 주문금액 </th>
                                            <td class="text-start"><?=number_format($total_price)?> 원</td>
                                        </tr>
                                        <tr> 
                                            <th class="table-light">총 할인금액</th>
                                            <td class="text-start">
                                                <span><?=number_format($order_data['emoney']+$order_data['coupon']+$order_data['cash'])?> 원</span>
                                                <!-- <?php
                                                if(($order_data['pg_provider']=="DGKR"&&$order_data['payment_method']=="DG0000")&&($order_data['use_emoney']>0)){
                                                    ?>
                                                    <button type="button" class="btn btn-dark btn-sm" id="btn_order_refund" data-settleno="<?=$order_data['settle_no']?>" data-useemoney="<?=$order_data['use_emoney']?>">결제취소+사용적립금 반환</button><br/>
                                                    <?php
                                                } else if($order_data['use_emoney']>0){
                                                    ?>
                                                    <button type="button" class="btn btn-dark btn-sm" id="btn_point_refund" data-settleno="<?=$order_data['settle_no']?>" data-useemoney="<?=$order_data['use_emoney']?>">사용적립금 반환</button><br/>
                                                    <?php
                                                }
                                                ?> -->
                                                <div>(포인트 할인 <?=number_format($order_data['emoney'])?> 원: + 캐시할인 <?=number_format($order_data['cash'])?> 원 + 쿠폰 할인 <?=number_format($order_data['coupon'])?> 원)</div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th class="table-light">최종 결제금액</th>
                                            <td class="text-start"><?=number_format($order_data['settleprice'])?> 원</td>
                                        </tr>
                                        <tr>
                                            <th class="table-light">결제상태</th>
                                            <td><span class="badge bg-secondary font-12"><?=$adminOrder->getCheckoutStatus($order_data['step'])?></span></td>
                                        </tr>
                                        <?if($order_data['step']<>'1'){?>
                                            <tr>
                                                <th class="table-light">결제완료일자</th>
                                                <td><?=$order_data['cdt']?></td>
                                            </tr>
                                        <?}?>
                                        <?
                                        if($settle_log['imp_uid']){
                                            ?>
                                            <tr>
                                                <th class="table-light">아임포트 주문번호</th>
                                                <td><?=$settle_log['imp_uid']?></td>
                                            </tr>
                                            <?
                                        }
                                        ?>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <? if($order_data['pg_provider']=="kcp"){?>
                            <?php
                            if($settle_log['escw_yn']=="N"){
                                $mod_type="STSC";
                            } else {
                                $mod_type="STE2";
                            }
                            ?>
                            <div class="card mb-3" style="display:none;">
                                <h5 class="card-header bg-secondary text-white font-14">KCP 결제정보</h5>
                                <div class="card-body p-1">
                                    <form id="kcpFrm" name="kcpFrm">
                                        <input type="hidden" name="mode" value="kcp_refund">
                                        <input type="hidden" name="settle_no" value="<?=$settle_no?>">
                                        <input type="hidden" name="mod_type" value="<?=$mod_type?>">
                                        <input type="hidden" name="tno" value="<?=$settle_log['tno']?>">
                                    </form>
                                    <table class="table table-bordered table-sm mb-0">
                                        <colgroup>
                                            <col width="30%"/>
                                            <col width="*"/>
                                        </colgroup>
                                        <tbody class="font-13">
                                        <tr>
                                            <th class="table-light">KCP 거래 고유번호</th>
                                            <td><?=$settle_log['tno']?></td>
                                        </tr>
                                        <tr>
                                            <th class="table-light">KCP 상태코드</th>
                                            <td><?=$settle_log['tx_cd']?></td>
                                        </tr>
                                        <tr>
                                            <th class="table-light">결제수단명</th>
                                            <td><?=$settle_log['pay_method']?></td>
                                        </tr>
                                        <tr>
                                            <th class="table-light">에스크로여부</th>
                                            <td><?=$settle_log['escw_yn']?></td>
                                        </tr>
                                        <?
                                        switch($order_data['payment_method']){
                                            case "SC0010":
                                                $bill_url = "https://partner.kcp.co.kr/bill/card?cmd=card_bill&tno=".$settle_log['tno']."&order_no=".$settle_log['settle_no']."&trade_mony=".$settle_log['amount'];
                                                ?>
                                                <?if($settle_log['isp_issuer_nm']){?>
                                                <tr>
                                                    <th class="table-light">ISP 계열 카드 발급 사 명</th>
                                                    <td><?=$settle_log['isp_issuer_nm']?></td>
                                                </tr>
                                            <?}?>
                                                <tr>
                                                    <th class="table-light">카드명</th>
                                                    <td><?=$settle_log['card_name']?>
                                                        <?if($settle_log['card_bin_type_01']){?><span class="badge bg-secondary"><?=($settle_log['card_bin_type_01']=="0")?"개인":"법인"?></span><?}?>
                                                        <?if($settle_log['card_bin_type_02']){?><span class="badge bg-secondary"><?=($settle_log['card_bin_type_02']=="0")?"신용카드":"체크카드"?></span> <?}?>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th class="table-light">카드번호</th>
                                                    <td><?=$settle_log['card_no']?></td>
                                                </tr>
                                                <tr>
                                                    <th class="table-light">신용카드 결제금액</th>
                                                    <td><?=number_format($settle_log['card_mny'])?></td>
                                                </tr>
                                                <?if($settle_log['coupon_mny']>0){?>
                                                <tr>
                                                    <th class="table-light">쿠폰 할인 금액</th>
                                                    <td><?=number_format($settle_log['coupon_mny'])?></td>
                                                </tr>
                                            <?}?>
                                                <?if($settle_log['payco_point_mny']>0){?>
                                                <tr>
                                                    <th class="table-light">페이코 포인트 사용 금액</th>
                                                    <td><?=number_format($settle_log['payco_point_mny'])?></td>
                                                </tr>
                                            <?}?>
                                                <tr>
                                                    <th class="table-light">결제승인번호</th>
                                                    <td><?=$settle_log['app_no']?></td>
                                                </tr>
                                                <tr>
                                                    <th class="table-light">결제승인시간</th>
                                                    <td><?=$settle_log['app_time']?></td>
                                                </tr>
                                                <tr>
                                                    <th class="table-light">결제금액</th>
                                                    <td><?=number_format($settle_log['amount'])?></td>
                                                </tr>
                                                <?
                                                break;
                                            case "SC0030": //계좌이체
                                                $bill_url = "https://partner.kcp.co.kr/bill/acnt?cmd=acnt_bill&tno=".$settle_log['tno']."&order_no=".$settle_log['settle_no']."&trade_mony=".$settle_log['amount'];
                                                ?>
                                                <tr>
                                                    <th class="table-light">은행명</th>
                                                    <td><?=$settle_log['bank_name']?></td>
                                                </tr>
                                                <tr>
                                                    <th class="table-light">은행코드</th>
                                                    <td><?=$settle_log['bank_code']?></td>
                                                </tr>
                                                <tr>
                                                    <th class="table-light">계좌이체 결제 금액</th>
                                                    <td><?=$settle_log['bk_mny']?></td>
                                                </tr>
                                                <tr>
                                                    <th class="table-light">현금영수증 승인번호</th>
                                                    <td><?=$settle_log['cash_authno']?></td>
                                                </tr>
                                                <tr>
                                                    <th class="table-light">현금영수증 거래번호</th>
                                                    <td><?=$settle_log['cash_no']?></td>
                                                </tr>
                                                <tr>
                                                    <th class="table-light">계좌이체 결제시각</th>
                                                    <td><?=$settle_log['app_time']?></td>
                                                </tr>
                                                <?
                                                break;
                                            case "SC0040":
                                                $bill_url = "https://partner.kcp.co.kr/bill/vcnt?cmd=vcnt_bill&tno=".$settle_log['tno']."&order_no=".$settle_log['settle_no']."&trade_mony=".$settle_log['amount'];
                                                ?>
                                                <?if($order_data['step']=="1" || $order_data['step']=="8"){?>
                                                <tr>
                                                    <th class="table-light">가상계좌 취소</th>
                                                    <td><button type="button" class="btn btn-danger btn-sm shadow-none" id="btn_kcp_refund">계좌반납</button></td>
                                                </tr>
                                            <?}?>
                                                <tr>
                                                    <th class="table-light">주문자명</th>
                                                    <td><?=$settle_log['ipgm_name']?></td>
                                                </tr>
                                                <tr>
                                                    <th class="table-light">은행명</th>
                                                    <td><?=$settle_log['bank_name']?></td>
                                                </tr>
                                                <tr>
                                                    <th class="table-light">가상계좌번호</th>
                                                    <td><?=$settle_log['account']?></td>
                                                </tr>
                                                <tr>
                                                    <th class="table-light">입금할 계좌 입금주</th>
                                                    <td><?=$settle_log['depositor']?></td>
                                                </tr>
                                                <tr>
                                                    <th class="table-light">가상계좌 입금예정금액</th>
                                                    <td><?=number_format($settle_log['amount'])?></td>
                                                </tr>
                                                <tr>
                                                    <th class="table-light">가상계좌 입금마감일자</th>
                                                    <td><?=substr($settle_log['va_date'],0,4)?>-<?=substr($settle_log['va_date'],4,2)?>-<?=substr($settle_log['va_date'],6,2)?> <?=substr($settle_log['va_date'],8,2)?>:<?=substr($settle_log['va_date'],10,2)?>:<?=substr($settle_log['va_date'],12,2)?></td>
                                                </tr>
                                                <tr>
                                                    <th class="table-light">가상계좌 입금 금액</th>
                                                    <td><?=$settle_log['ipgm_mnyx']?></td>
                                                </tr>
                                                <tr>
                                                    <th class="table-light">가상계좌에 입금된 금액합계</th>
                                                    <td><?=$settle_log['totl_mnyx']?></td>
                                                </tr>
                                                <tr>
                                                    <th class="table-light">가상계좌 입금 시각</th>
                                                    <td><?=$settle_log['ipgm_time']?></td>
                                                </tr>
                                                <tr>
                                                    <th class="table-light">가상계좌 은행코드</th>
                                                    <td><?=$settle_log['bank_code ']?></td>
                                                </tr>
                                                <tr>
                                                    <th class="table-light">입금된 가상계좌번호</th>
                                                    <td><?=$settle_log['account']?></td>
                                                </tr>
                                                <tr>
                                                    <th class="table-light">가상계좌 입금 통보 아이디</th>
                                                    <td><?=$settle_log['noti_id']?></td>
                                                </tr>
                                                <tr>
                                                    <th class="table-light">가상계좌 입금 구분코드</th>
                                                    <td><?=$settle_log['op_cd']?></td>
                                                </tr>
                                                <tr>
                                                    <th class="table-light">가상계좌 입금자명</th>
                                                    <td><?=$settle_log['remitter']?></td>
                                                </tr>
                                                <tr>
                                                    <th class="table-light">현금영수증 승인번호</th>
                                                    <td><?=$settle_log['cash_a_no']?></td>
                                                </tr>
                                                <tr>
                                                    <th class="table-light">현금영수증 거래번호</th>
                                                    <td><?=$settle_log['cash_no']?></td>
                                                </tr>
                                                <?
                                                break;
                                            case "SC0060": //휴대폰
                                                $bill_url = "https://partner.kcp.co.kr/bill/mcash?cmd=mcash_bill&tno=".$settle_log['tno']."&order_no=".$settle_log['settle_no']."&trade_mony=".$settle_log['amount'];
                                                ?>
                                                <tr>
                                                    <th class="table-light">통신사 코드</th>
                                                    <td><?=$settle_log['commid']?></td>
                                                </tr>
                                                <tr>
                                                    <th class="table-light">휴대폰 번호</th>
                                                    <td><?=$settle_log['mobile_no']?></td>
                                                </tr>
                                                <tr>
                                                    <th class="table-light">실물/컨텐츠 구분</th>
                                                    <td><?=$settle_log['van_id']?></td>
                                                </tr>
                                                <?
                                                break;
                                        }
                                        ?>
                                        <tr>
                                            <th class="table-light">결제 건의 부분취소 가능 유무</th>
                                            <td><?=$settle_log['partcanc_yn']?></td>
                                        </tr>
                                        <?if($order_data['step']=="2"){?>
                                            <tr>
                                                <th class="table-light">결제취소</th>
                                                <td><button type="button" class="btn btn-danger btn-sm shadow-none" id="btn_kcp_refund">결제취소</button></td>
                                            </tr>
                                        <?}?>
                                        <tr>
                                            <th class="table-light">거래영수증</th>
                                            <td>

                                                <a class="btn btn-secondary shadow-none btn-sm" href="<?=$bill_url?>" target="_blank">가맹점용 영수증 보기</a
                                                >
                                                <!--<a class="btn btn-secondary shadow-none btn-sm" href="https://bill.payco.com/outseller/receipt/<?=$settle_log['orderNo']?>" target="_blank">고객용 영수증 보기</a>-->
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        <?}?>

                        <?php
                        if($order_data['pg_provider']=="toss"){
                            if($order_data['payment_method']=="toss_bank"){
                                $mod_type="STSC";
                                $bill_url="https://dashboard.tosspayments.com/receipt/mids/directg/orders/".$settle_log['settle_no']."/cash-receipt?ref=PX";
                                ?>
                                <div class="card mb-3">
                                    <h5 class="card-header bg-secondary text-white font-14">토스 결제정보</h5>
                                    <div class="card-body p-1">
                                        <form id="tossFrm" name="tossFrm">
                                            <input type="hidden" name="mode" value="toss_adapter_refund">
                                            <input type="hidden" name="settle_no" value="<?=$settle_no?>">
                                            <input type="hidden" name="mod_type" value="<?=$mod_type?>">
                                            <input type="hidden" name="tno" value="<?=$settle_log['tno']?>">
                                        </form>
                                        <table class="table table-bordered table-sm mb-0">
                                            <colgroup>
                                                <col width="30%"/>
                                                <col width="*"/>
                                            </colgroup>
                                            <tbody class="font-13">
                                            <tr>
                                                <th class="table-light">은행명</th>
                                                <td><?=$settle_log['bank_name']?></td>
                                            </tr>
                                            <tr>
                                                <th class="table-light">은행코드</th>
                                                <td><?=$settle_log['bank_code']?></td>
                                            </tr>
                                            <?if($settle_log['coupon_mny']>'0'){?>
                                                <tr>
                                                    <th class="table-light">즉시할인 금액</th>
                                                    <td><?=number_format($settle_log['coupon_mny'])?> 원</td>
                                                </tr>
                                            <?}?>
                                            <tr>
                                                <th class="table-light">계좌이체 결제 금액</th>
                                                <td><?=number_format($settle_log['bk_mny'])?> 원</td>
                                            </tr>
                                            <tr>
                                                <th class="table-light">현금영수증 승인번호</th>
                                                <td><?=$settle_log['cash_authno']?></td>
                                            </tr>
                                            <tr>
                                                <th class="table-light">현금영수증 거래번호</th>
                                                <td><?=$settle_log['cash_no']?></td>
                                            </tr>
                                            <tr>
                                                <th class="table-light">계좌이체 결제시각</th>
                                                <td><?=$settle_log['app_time']?></td>
                                            </tr>
                                            <tr>
                                                <th class="table-light">tno</th>
                                                <td><?=$settle_log['tno']?></td>
                                            </tr>
                                            <tr>
                                                <th class="table-light">에스크로 여부</th>
                                                <td><?=$settle_log['escw_yn']?></td>
                                            </tr>
                                            <?if($order_data['step']=="2"){?>
                                                <tr>
                                                    <th class="table-light">결제취소</th>
                                                    <td>
                                                        <button type="button" class="btn btn-danger btn-sm shadow-none" id="btn_toss_refund" data-modetype="STSC">결제취소</button></td>
                                                </tr>
                                            <?}?>
                                            <tr>
                                                <th class="table-light">거래영수증</th>
                                                <td>

                                                    <a class="btn btn-secondary shadow-none btn-sm" href="<?=$bill_url?>" target="_blank">가맹점용 현금영수증 보기</a
                                                    >
                                                    <!--<a class="btn btn-secondary shadow-none btn-sm" href="https://bill.payco.com/outseller/receipt/<?=$settle_log['orderNo']?>" target="_blank">고객용 영수증 보기</a>-->
                                                </td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <?php
                            } else {
                                ?>

                                <div class="card mb-3">
                                    <h5 class="card-header bg-secondary text-white font-14">토스 결제정보</h5>
                                    <div class="card-body p-1">
                                        <table class="table table-bordered table-sm mb-0">
                                            <colgroup>
                                                <col width="30%"/>
                                                <col width="*"/>
                                            </colgroup>
                                            <tbody class="font-13">
                                            <tr>
                                                <th class="table-light">결제수단</th>
                                                <td><?=$settle_log['method']?></td>
                                            </tr>
                                            <tr>
                                                <th class="table-light">총 결제금액</th>
                                                <td><?=number_format($settle_log['total_amount'])?></td>
                                            </tr>
                                            <?if($settle_log['coupon_mny']>'0'){?>
                                                <tr>
                                                    <th class="table-light">즉시할인 금액</th>
                                                    <td><?=number_format($settle_log['ba'])?> 원</td>
                                                </tr>
                                            <?}?>
                                            <tr>
                                                <th class="table-light">취소 가능금액</th>
                                                <td><?=number_format($settle_log['balance_amount'])?></td>
                                            </tr>
                                            <tr>
                                                <th class="table-light">결제 시간</th>
                                                <td><?=$settle_log['requested_at']?></td>
                                            </tr>
                                            <tr>
                                                <th class="table-light">승인 시간</th>
                                                <td><?=$settle_log['approved_at']?></td>
                                            </tr>

                                            <?if($order_data['step']=="2"){?>
                                                <tr>
                                                    <th class="table-light">결제취소</th>
                                                    <td>
                                                        <!--button type="button" class="btn btn-danger btn-sm shadow-none" id="btn_toss_refund">결제취소</button-->
                                                        <button type="button" class="btn btn-danger btn-sm shadow-none btn_cancel" id="" data-bs-toggle="modal" data-bs-target="#order-refund-modal">결제취소</button>
                                                    </td>


                                                </tr>
                                            <?}?>
                                            <tr>
                                                <th class="table-light">거래영수증</th>
                                                <td>
                                                    <a class="btn btn-secondary shadow-none btn-sm" href="<?=$bill_url?>" target="_blank">가맹점용 현금영수증 보기</a
                                                    >
                                                </td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <?php
                            }
                        } else if($order_data['pg_provider']=="toss_pay"){
                            ?>
                            <div class="card mb-3">
                                <h5 class="card-header bg-secondary text-white font-14">토스페이 결제정보</h5>
                                <div class="card-body p-1">
                                    <table class="table table-bordered table-sm mb-0">
                                        <colgroup>
                                            <col width="35%"/>
                                            <col width="*"/>
                                        </colgroup>
                                        <tbody class="font-13">
                                        <tr>
                                            <th class="table-light">결제수단</th>
                                            <td>
                                                <?php
                                                switch($settle_log['payMethod']){
                                                    case "TOSS_MONEY":
                                                        echo "토스머니";
                                                        break;
                                                    case "CARD":
                                                        echo "카드";
                                                        break;
                                                    case "TOSSPAY_MONEY":
                                                        echo "토스페이머니";
                                                        break;
                                                    case "ACCOUNT":
                                                        echo "ACCOUNT";
                                                        break;
                                                    case "RESELLER_CARD":
                                                        echo "RESELLER_CARD";
                                                        break;
                                                    case "BNPL":
                                                        echo "BNPL";
                                                        break;
                                                }
                                                ?>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th class="table-light">총 결제금액</th>
                                            <td><?=number_format($settle_log['amount'])?></td>
                                        </tr>
                                        <tr>
                                            <th class="table-light">할인 금액</th>
                                            <td><?=number_format($settle_log['discountedAmount'])?> 원</td>
                                        </tr>
                                        <tr>
                                            <th class="table-light">취소 가능금액</th>
                                            <td><?=number_format($settle_log['paidAmount'])?></td>
                                        </tr>
                                        <tr>
                                            <th class="table-light">결제완료처리 시간</th>
                                            <td><?=$settle_log['paidTs']?></td>
                                        </tr>

                                        <?if($order_data['step']=="2"){?>
                                            <tr>
                                                <th class="table-light">결제취소</th>
                                                <td>
                                                    <!--button type="button" class="btn btn-danger btn-sm shadow-none" id="btn_toss_refund">결제취소</button-->
                                                    <button type="button" class="btn btn-danger btn-sm shadow-none btn_cancel" id="" data-bs-toggle="modal" data-bs-target="#order-tosspay-refund-modal">결제취소</button>
                                                </td>


                                            </tr>
                                        <?}?>
                                        <tr>
                                            <th class="table-light">거래영수증</th>
                                            <td>
                                                <a class="btn btn-secondary shadow-none btn-sm" href="<?=$bill_url?>" target="_blank">가맹점용 현금영수증 보기</a
                                                >
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <?php
                        }
                        ?>


                        <? if($order_data['pg_provider']=="payco"){?>
                            <div class="card mb-0">
                                <h5 class="card-header bg-secondary text-white font-14">PAYCO 결제 정보</h5>
                                <div class="card-body p-2">
                                    <form name="paycoFrm" id="paycoFrm">
                                        <input type="hidden" name="mode" value="payco_refund">
                                        <input type="hidden" name="settle_no" value="<?=$settle_no?>">
                                        <input type="hidden" name="orderNo" value="<?=$settle_log['orderNo']?>">
                                        <input type="hidden" name="cancelTotalAmt" value="<?=$settle_log['totalPaymentAmt']?>">
                                        <input type="hidden" name="orderCertifyKey" value="<?=$settle_log['orderCertifyKey']?>">
                                    </form>
                                    <table class="table table-bordered table-sm mb-0">
                                        <colgroup>
                                            <col width="25%"/>
                                            <col width="*"/>
                                        </colgroup>
                                        <tbody class="font-13">
                                        <tr>
                                            <th class="table-light">PAYCO 예약번호</th>
                                            <td>
                                                <?=$settle_log['reserveOrderNo']?>
                                                <?php
                                                if($order_data['step']=="2"){
                                                    ?>
                                                    <button id="order_detail" data-reserveorderno="<?=$settle_log['reserveOrderNo']?>" data-sellerorderreferencekey="<?=$settle_no?>">결제 상세정보</button>
                                                    <?php
                                                }
                                                ?>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th class="table-light">PAYCO 주문번호</th>
                                            <td><?=$settle_log['orderNo']?></td>
                                        </tr>
                                        <tr>
                                            <th class="table-light">주문자명</th>
                                            <td><?=$settle_log['memberName']?></td>
                                        </tr>
                                        <tr>
                                            <th class="table-light">주문자 EMAIL</th>
                                            <td><?=$settle_log['memberEmail']?></td>
                                        </tr>
                                        <tr>
                                            <th class="table-light">총 주문금액</th>
                                            <td><?=number_format($settle_log['totalOrderAmt'])?></td>
                                        </tr>
                                        <?
                                        $paymentDetails = json_decode($settle_log['paymentDetails'],true);
                                        foreach($paymentDetails as $sub_key=>$sub_value){
                                            ?>
                                            <!--
									<tr>
										<th class="table-light">PAYCO 결제번호</th>
										<td><?=$sub_value['paymentTradeNo']?></td>
									</tr>
									-->
                                            <tr>
                                                <th class="table-light">결제수단명</th>
                                                <td><?=$sub_value['paymentMethodName']?></td>
                                            </tr>
                                            <tr>
                                                <th class="table-light">결제일시</th>
                                                <td><?=$sub_value['tradeYmdt']?></td>
                                            </tr>
                                            <tr>
                                                <th class="table-light">결제 승인번호</th>
                                                <td><?=$sub_value['pgAdmissionNo']?></td>
                                            </tr>
                                            <tr>
                                                <th class="table-light">결제 승인일시</th>
                                                <td><?=$sub_value['pgAdmissionYmdt']?></td>
                                            </tr>
                                            <tr>
                                                <th class="table-light">PAYCO 간편결제여부</th>
                                                <td><?=$sub_value['easyPaymentYn']?></td>
                                            </tr>

                                            <tr>
                                                <th class="table-light">총 결제금액</th>
                                                <td><?=number_format($sub_value['paymentAmt'])?> (공급가액: <?=number_format($sub_value['taxableAmt'])?> + 부가세: <?=number_format($sub_value['vatAmt'])?>)</td>
                                            </tr>

                                            <?if(is_array($sub_value['cardSettleInfo'])){?>
                                                <tr>
                                                    <th class="table-light">신용카드 결제정보</th>
                                                    <td>
                                                        <ul class="list-group ">
                                                            <li class="list-group-item">카드사명: <?=$sub_value['cardSettleInfo']['cardCompanyName']?></li>
                                                            <li class="list-group-item">카드사코드: <?=$sub_value['cardSettleInfo']['cardCompanyCode']?></li>
                                                            <li class="list-group-item">카드번호: <?=$sub_value['cardSettleInfo']['cardNo']?></li>
                                                            <li class="list-group-item">할부개월수: <?=$sub_value['cardSettleInfo']['cardInstallmentMonthNumber']?></li>
                                                            <li class="list-group-item">카드사 승인번호: <?=$sub_value['cardSettleInfo']['cardAdmissionNo']?></li>
                                                            <li class="list-group-item">무이자여부: <?=$sub_value['cardSettleInfo']['cardInterestFreeYn']?></li>
                                                            <li class="list-group-item">법인카드 여부: <?=$sub_value['cardSettleInfo']['corporateCardYn']?></li>
                                                            <li class="list-group-item">부분취소가능 여부: <?=$sub_value['cardSettleInfo']['partCancelPossibleYn']?></li>
                                                            <li class="list-group-item">매입사 코드: <?=$sub_value['cardSettleInfo']['acquirersCorporationCode']?></li>
                                                        </ul>
                                                    </td>
                                                </tr>
                                            <?}?>
                                            <?if(is_array($sub_value['cellphoneSettleInfo'])){?>
                                                <tr>
                                                    <th class="table-light">휴대폰 결제정보</th>
                                                    <td>
                                                        <? print_r($sub_value['cellphoneSettleInfo'])?>
                                                        <ul class="list-group">
                                                            <li class="list-group-item">통신사명: <?=$sub_value['cellphoneSettleInfo']['companyName']?></li>
                                                            <li class="list-group-item">휴대폰 번호: <?=$sub_value['cellphoneSettleInfo']['cellphoneNo']?></li>
                                                        </ul>
                                                    </td>
                                                </tr>
                                            <?}?>
                                            <?if(is_array($sub_value['realtimeAccountTrasferSettleInfo'])){?>
                                                <tr>
                                                    <th class="table-light">실시간계좌이체 결제정보</th>
                                                    <td>
                                                        <? print_r($sub_value['realtimeAccountTrasferSettleInfo'])?>
                                                        <ul class="list-group">
                                                            <li class="list-group-item">은행명: <?=$sub_value['realtimeAccountTrasferSettleInfo']['bankName']?></li>
                                                            <li class="list-group-item">은행코드: <?=$sub_value['realtimeAccountTrasferSettleInfo']['bankCode']?></li>
                                                        </ul>
                                                    </td>
                                                </tr>
                                            <?}?>
                                            <?if(is_array($sub_value['nonBankbookSettleInfo'])){?>
                                                <tr>
                                                    <th class="table-light">무통장입금 결제정보</th>
                                                    <td>
                                                        <ul class="list-group">
                                                            <li class="list-group-item">은행명: <?=$sub_value['nonBankbookSettleInfo']['bankName']?></li>
                                                            <li class="list-group-item">은행코드: <?=$sub_value['nonBankbookSettleInfo']['bankCode']?></li>
                                                            <li class="list-group-item">계좌번호: <?=$sub_value['nonBankbookSettleInfo']['accountNo']?></li>
                                                            <li class="list-group-item">입금만료일: <?=$sub_value['nonBankbookSettleInfo']['paymentExpirationYmd']?></li>
                                                        </ul>
                                                    </td>
                                                </tr>
                                                <?if(($order_data['step']=="1" || $order_data['step']=="8") && $sub_value['couponSettleInfo']['discountConditionAmt'] < date("Ymd")){?>
                                                    <tr>
                                                        <th class="table-light">결제취소</th>
                                                        <td><button type="button" class="btn btn-danger btn-sm shadow-none" id="btn_payco_cancel">계좌반납</button></td>
                                                    </tr>
                                                <?}?>
                                            <?}?>
                                            <?if(is_array($sub_value['couponSettleInfo'])){?>
                                                <tr>
                                                    <th class="table-light">쿠폰 결제정보</th>
                                                    <td>
                                                        <? print_r($sub_value['couponSettleInfo'])?>
                                                        <ul class="list-group">
                                                            <li class="list-group-item">쿠폰 할인금액: <?=$sub_value['couponSettleInfo']['discountAmt']?></li>
                                                            <li class="list-group-item">쿠폰 할인조건: <?=$sub_value['couponSettleInfo']['discountConditionAmt']?></li>
                                                        </ul>
                                                    </td>
                                                </tr>
                                            <?}?>
                                        <?}?>
                                        <?if($order_data['step']=="2"){?>
                                            <tr>
                                                <th class="table-light">결제취소</th>
                                                <td><button type="button" class="btn btn-danger btn-sm shadow-none" id="btn_payco_refund">결제취소</button></td>
                                            </tr>
                                        <?}?>
                                        <tr>
                                            <th class="table-light">거래영수증</th>
                                            <td>

                                                <a class="btn btn-secondary shadow-none btn-sm" href="https://bill.payco.com/seller/receipt/GBPT2K/<?=$settle_log['sellerOrderReferenceKey']?>/<?=$settle_log['orderNo']?>" target="_blank">가맹점용 영수증 보기</a>
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        <?}?>
                        <?
                        if($order_data['pg_provider']=="naverpay"){
                            ?>
                            <div class="card mb-0">
                                <h5 class="card-header bg-secondary text-white font-14">네이버페이 결제 정보</h5>
                                <div class="card-body p-2">
                                    <form name="naverpayFrm" id="naverpayFrm">
                                        <input type="hidden" name="mode" value="naverpay_refund">
                                        <input type="hidden" name="settle_no" value="<?=$settle_no?>">
                                        <input type="hidden" name="paymentId" value="<?=$settle_log['paymentId']?>">
                                        <input type="hidden" name="cancelAmount" value="<?=$settle_log['totalPayAmount']?>">
                                    </form>

                                    <table class="table table-bordered table-sm mb-0">
                                        <colgroup>
                                            <col width="25%"/>
                                            <col width="*"/>
                                        </colgroup>
                                        <tbody class="font-13">
                                        <tr>
                                            <th class="table-light">네이버페이 결제번호</th>
                                            <td><?=$settle_log['paymentId']?></td>
                                        </tr>
                                        <tr>
                                            <th class="table-light">결제승인 유형</th>
                                            <td><?=$settle_log['admissionTypeCode']?>
                                                <?
                                                switch($settle_log['admissionTypeCode']){
                                                    case "01":
                                                        echo "원결제 승인";
                                                        break;
                                                    case "03":
                                                        echo "전체취소";
                                                        break;
                                                    case "04":
                                                        echo "부분취소";
                                                        break;
                                                }
                                                ?>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th class="table-light">결제/취소 일시</th>
                                            <td><?=$settle_log['admissionYmdt']?></td>
                                        </tr>
                                        <tr>
                                            <th class="table-light">거래 완료 일시</th>
                                            <td><?=$settle_log['tradeConfirmYmdt']?></td>
                                        </tr>
                                        <tr>
                                            <th class="table-light">총 결제/취소 금액</th>
                                            <td><?=$settle_log['totalPayAmount']?></td>
                                        </tr>
                                        <tr>
                                            <th class="table-light">구매자 결제/취소 금액</th>
                                            <td><?=$settle_log['applyPayAmount']?></td>
                                        </tr>
                                        <tr>
                                            <th class="table-light">주 결제 수단 결제/취소 금액</th>
                                            <td><?=$settle_log['primaryPayAmount']?></td>
                                        </tr>
                                        <tr>
                                            <th class="table-light">네이버페이 포인트/머니 결제/취소 금액</th>
                                            <td><?=$settle_log['npointPayAmount']?></td>
                                        </tr>
                                        <tr>
                                            <th class="table-light">즉시 할인 결제/취소 금액</th>
                                            <td><?=$settle_log['discountPayAmount']?></td>
                                        </tr>
                                        <tr>
                                            <th class="table-light">주 결제 수단</th>
                                            <td><?=$settle_log['primaryPayMeans']?></td>
                                        </tr>
                                        <?if($settle_log['primaryPayMeans']=="CARD"){?>
                                            <tr>
                                                <th class="table-light">주 결제 수단 카드사</th>
                                                <td><?=$settle_log['cardCorpCode']?></td>
                                            </tr>
                                            <tr>
                                                <th class="table-light">카드 번호</th>
                                                <td><?=$settle_log['cardNo']?></td>
                                            </tr>
                                            <tr>
                                                <th class="table-light">카드승인번호</th>
                                                <td><?=$settle_log['cardAuthNo']?></td>
                                            </tr>
                                        <?}?>
                                        <?if($settle_log['primaryPayMeans']=="BANK"){?>
                                            <tr>
                                                <th class="table-light">주 결제 수단 은행</th>
                                                <td><?=$settle_log['bankCorpCode']?></td>
                                            </tr>
                                            <tr>
                                                <th class="table-light">계좌 번호</th>
                                                <td><?=$settle_log['bankAccountNo']?></td>
                                            </tr>
                                        <?}?>

                                        <?php
                                        if($order_data['step']=="2" || $order_data['step']=="8"){
                                            ?>
                                            <tr>
                                                <th>결제완료일자</th>
                                                <td><?=$order_data['payment_date']?></td>
                                            </tr>
                                            <tr>
                                                <th>결제취소</th>
                                                <td><button type="button" class="btn btn-danger btn-sm shadow-none" id="btn_naverpay_refund">결제취소</button></td>
                                            </tr>
                                            <?php
                                        }
                                        ?>

                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        <?}?>
                    </div>
                    <div class="col-lg-8">
                        <?if($order_address_data['zipcode']){?>
                            <div class="card mb-2">
                                <h5 class="card-header bg-secondary text-white font-14">배송지 정보</h5>
                                <div class="card-body p-1">
                                    <table class="table table-bordered table-sm mb-0">
                                        <thead class="table-light font-13">
                                        <tr>
                                            <th class="text-center" style="width:150px">우편번호</th>
                                            <th class="text-center">주소</th>
                                            <th class="text-center" style="width:100px">주문자</th>
                                            <th class="text-center" style="width:100px">휴대폰번호</th>
                                        </tr>
                                        </thead>
                                        <tbody class="font-12">
                                        <tr>
                                            <td class="text-center"><?=$order_address_data['zipcode']?></td>
                                            <td class="text-start"><?=$order_address_data['address']?> <?=$order_address_data['address_detail']?></td>
                                            <td class="text-center"><?=$order_address_data['name']?></td>
                                            <td class="text-center"><?=$order_address_data['tel']?></td>
                                        </tr>
                                        <tr>
                                            <th class="bg-light text-center">배송요청 메시지</th>
                                            <td colspan="3"><?=$order_address_data['msg']?></td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        <?}?>

                        <div class="card mb-2">
                            <h5 class="card-header bg-secondary text-white font-14">주문 히스토리</h5>
                            <div class="card-body p-1">
                                <table class="table table-bordered table-sm mb-0">
                                    <thead class="table-light font-13">
                                    <tr>
                                        <th class="text-center">주문번호</th>
                                        <th class="text-center">처리자</th>
                                        <th class="text-center">처리일자</th>
                                        <th class="text-center">내용</th>
                                    </tr>
                                    </thead>
                                    <tbody class="font-12">
                                    <?php
                                    foreach($order_log as $value){
                                        ?>
                                        <tr>
                                            <td><?=$value['ordno']?></td>
                                            <td><?=$value['admin_id']?></td>
                                            <td><?=$value['reg_date']?></td>
                                            <td><?=$value['message']?></td>
                                        </tr>
                                        <?php
                                    }
                                    ?>
                                    </tbody>
                                </table>
                            </div>
                            <div class="card-footer">
                                <form name="adminFrm" id="adminFrm" method="POST" action="order_ps.php">
                                    <input type="hidden" name="settle_no" value="<?=$settle_no?>">
                                    <input type="hidden" name="admin_id" value="<?=$_SESSION['admin']['admin_id']?>">
                                    <div class="row gy-2 gx-2 align-items-center">
                                        <div class="col-3">
                                            <div class="form-floating">
                                                <input type="hidden" name="mode" value="memo_add">
                                                <input type="hidden" name="settle_no" value="<?=$settle_no?>">

                                                <select class="form-select" id="memo_gubun" name="memo_gubun" required>
                                                    <option value="일반">일반</option>
                                                    <option value="취소환불">취소환불</option>
                                                    <option value="차액환불">차액환불</option>
                                                </select>
                                                <label for="memo_gubun">처리유형</label>
                                            </div>
                                        </div>
                                        <div class="col-9">
                                            <div class="form-floating">
                                                <input type="text" class="form-control" name="ordno" required />
                                                <label for="floatingInput">주문번호</label>
                                            </div>
                                        </div>

                                        <div class="col-10">
                                            <div class="form-floating">
                                                <textarea class="form-control" placeholder="" name="message" required></textarea>
                                                <label for="message">내용</label>
                                            </div>
                                        </div>
                                        <div class="col-2">
                                            <button type="submit" class="btn btn-primary">기록하기</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <?php
                        if($order_data['pg_provider']=="naverpay"){
                            ?>
                            <div class="card mb-2">
                                <h5 class="card-header bg-secondary text-white font-14">네이버페이 히스토리</h5>
                                <div class="card-body p-1">
                                    <table class="table table-bordered table-sm mb-0">
                                        <tbody>
                                        <?php
                                        $i=0;
                                        foreach($naverpay_history->body->list as $order_history){
                                            $i++;
                                            $order_time = substr($order_history->admissionYmdt, 0, 4) ."-".
                                                substr($order_history->admissionYmdt, 4, 2)."-".
                                                substr($order_history->admissionYmdt, 6, 2)." ".
                                                substr($order_history->admissionYmdt, 8, 2).":".
                                                substr($order_history->admissionYmdt, 10, 2).":".
                                                substr($order_history->admissionYmdt, 12, 2);

                                            if($order_history->primaryPayMeans=="CARD"){
                                                $primaryPayMeans="신용카드";
                                            } else if($order_history->primaryPayMeans=="BANK"){
                                                $primaryPayMeans="계좌이체";
                                            } else if(!$order_history->primaryPayMeans){
                                                if($order_history->npointPayAmount>0){
                                                    $primaryPayMeans="네이버포인트/머니";
                                                } else {
                                                    $primaryPayMeans="";
                                                }
                                            } else {
                                                $primaryPayMeans="";
                                            }
                                            ?>
                                            <tr>
                                                <th class="text-center" style="width:10px;"><?=$i?></th>
                                                <th class="text-center" style="width:180px;"><?=$order_time?></th>
                                                <th>
                                                    <?php
                                                    switch($order_history->admissionTypeCode){
                                                        case "01":
                                                            echo "<span class='text-primary'>결제승인</span>";
                                                            break;
                                                        case "03":
                                                            echo "<span class='text-danger'>전체취소</span>";
                                                            break;
                                                        case "04":
                                                            echo "<span class='text-danger'>부분취소</span>";
                                                            break;
                                                        default:
                                                            echo $order_history->admissionTypeCode;
                                                            break;
                                                    }
                                                    ?>
                                                </th>
                                                <th class="text-left" style="width:100px;"><?=$order_history->admissionState?></th>
                                            </tr>
                                            <tr>
                                                <td colspan="2">결제 수단</td>
                                                <td colspan="2"><?=$primaryPayMeans?></td>
                                            </tr>
                                            <tr>
                                                <td colspan="2" class="fw-bold">총 <?=($order_history->admissionTypeCode=="03"||$order_history->admissionTypeCode=="04")?"취소":"결제"?>금액</td>
                                                <td colspan="2" class="fw-bold"><?=number_format($order_history->totalPayAmount)?> 원</td>
                                            </tr>
                                            <tr>
                                                <td colspan="2" class="">구매자 <?=($order_history->admissionTypeCode=="03"||$order_history->admissionTypeCode=="04")?"취소":"결제"?>금액</td>
                                                <td colspan="2" class=""><?=number_format($order_history->applyPayAmount)?> 원</td>
                                            </tr>
                                            <tr>
                                                <td colspan="2" class="">주 결제 수단 <?=($order_history->admissionTypeCode=="03"||$order_history->admissionTypeCode=="04")?"취소":"결제"?>금액</td>
                                                <td colspan="2" class=""><?=number_format($order_history->primaryPayAmount)?> 원</td>
                                            </tr>
                                            <tr>
                                                <td colspan="2">네이버페이 포인트/머니 <?=($order_history->admissionTypeCode=="03"||$order_history->admissionTypeCode=="04")?"취소":"결제"?>금액</td>
                                                <td colspan="2"><?=number_format($order_history->npointPayAmount)?> 원</td>
                                            </tr>
                                            <tr>
                                                <td colspan="2">기프트카드 <?=($order_history->admissionTypeCode=="03"||$order_history->admissionTypeCode=="04")?"취소":"결제"?>금액</td>
                                                <td colspan="2"><?=number_format($order_history->giftCardPayAmount)?> 원</td>
                                            </tr>
                                            <tr>
                                                <td colspan="2" class="fw-bold">즉시 할인 <?=($order_history->admissionTypeCode=="03"||$order_history->admissionTypeCode=="04")?"취소":"결제"?>금액</td>
                                                <td colspan="2" class="fw-bold"><span class='<?=($order_history->admissionTypeCode=="03"||$order_history->admissionTypeCode=="04")?"text-danger":"text-primary"?>'><?=number_format($order_history->discountPayAmount)?> 원</span></td>
                                            </tr>
                                            <?php
                                            if($order_history->primaryPayMeans=="CARD"){
                                                ?>
                                                <tr>
                                                    <td colspan="2">주 결제 카드사</td>
                                                    <td colspan="2"><?=$adminOrder->getNaverpayCorpName("card", $order_history->cardCorpCode)?></td>
                                                </tr>
                                                <tr>
                                                    <td colspan="2">카드번호</td>
                                                    <td colspan="2"><?=$order_history->cardNo?></td>
                                                </tr>
                                                <tr>
                                                    <td colspan="2">카드승인번호</td>
                                                    <td colspan="2"><?=$order_history->cardAuthNo?></td>
                                                </tr>
                                                <tr>
                                                    <td colspan="2">할부 개월 수</td>
                                                    <td colspan="2"><?=$order_history->cardInstCount?></td>
                                                </tr>
                                                <tr>
                                                    <td colspan="2">카드사 포인트</td>
                                                    <td colspan="2"><?=$order_history->usedCardPoint?></td>
                                                </tr>
                                                <?php
                                            }
                                            ?>
                                            <?php
                                            if($order_history->primaryPayMeans=="BANK"){
                                                ?>
                                                <tr>
                                                    <td colspan="2">주 결제 수단 은행</td>
                                                    <td colspan="2"><?=$adminOrder->getNaverpayCorpName("bank", $order_history->bankCorpCode)?> (<?=$order_history->bankCorpCode?>)</td>
                                                </tr>
                                                <tr>
                                                    <td colspan="2">계좌 번호</td>
                                                    <td colspan="2"><?=$order_history->bankAccountNo?></td>
                                                </tr>
                                                <?php
                                            }
                                            ?>
                                            <?php
                                        }
                                        ?>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <?
                        }
                        ?>


                        <?php
                        if($order_data['pg_provider']=="toss"){
                            ?>
                            <div class="card mb-2">
                                <h5 class="card-header bg-secondary text-white font-14">토스 히스토리</h5>
                                <div class="card-body p-1">
                                    <table class="table table-bordered table-sm mb-0">
                                        <tbody>
                                        <tr>
                                            <?php
                                            switch($toss_history['status']){
                                                case "READY":
                                                    $history_text="준비";
                                                    $th_color="table-dark";
                                                    break;
                                                case "IN_PROGRESS":
                                                    $history_text="인증완료";
                                                    $th_color="table-dark";
                                                    break;
                                                case "WAITING_FOR_DEPOSIT":
                                                    $history_text="입금대기";
                                                    $th_color="table-secondary";
                                                    break;
                                                case "DONE":
                                                    $history_text="승인";
                                                    $th_color="table-success";
                                                    break;
                                                case "CANCELED":
                                                    $history_text="취소";
                                                    $th_color="table-danger";
                                                    break;
                                                case "PARTIAL_CANCELED":
                                                    $history_text="부분취소";
                                                    $th_color="table-danger";
                                                    break;
                                                case "ABORTED":
                                                    $history_text="실패";
                                                    $th_color="table-danger";
                                                    break;
                                                case "EXPIRED":
                                                    $history_text="만료";
                                                    $th_color="table-warning";
                                                    break;
                                            }

                                            ?>
                                            <td colspan="2" class="fw-bold text-center <?=$th_color?>"><?=$history_text?></td>
                                        </tr>
                                        <tr>
                                            <th class="text-left table-light" style="width:100px;">결제 시간</th>
                                            <td class="text-left"><?=date('Y-m-d H:i:s', strtotime($toss_history['requestedAt']))?></td>
                                        </tr>
                                        <tr>
                                            <th class="text-left table-light" style="width:100px;">승인 시간</th>
                                            <td class="text-left" style="width:100px;"><?=date('Y-m-d H:i:s', strtotime($toss_history['approvedAt']))?></th>
                                        </tr>
                                        <tr>
                                            <th class="table-light">부분 취소 가능 여부</th>
                                            <td><?=$toss_history['isPartialCancelable']?"Y":"N"?></td>
                                        </tr>
                                        <tr>
                                            <th class="table-light fw-bold">총 결제금액</th>
                                            <td class="fw-bold"><?=number_format($toss_history['totalAmount'])?> 원</td>
                                        </tr>
                                        <tr>
                                            <th class="table-light fw-bold">취소가능 금액</th>
                                            <td class="fw-bold"><?=number_format($toss_history['balanceAmount'])?> 원</td>
                                        </tr>
                                        <tr>
                                            <th class="table-light">에스크로 여부</th>
                                            <td class=""><?=$toss_history['useEscrow']?"Y":"N"?></td>
                                        </tr>
                                        <tr>
                                            <th class="table-light">결제 수단</th>
                                            <td class="fw-bold table-light"><?=$toss_history['method']?></td>
                                        </tr>
                                        <?php
                                        if($toss_history['card']){
                                            ?>
                                            <tr>
                                                <th class="table-light">결제요청금액</th>
                                                <td><?=number_format($toss_history['card']['amount'])?> 원</td>
                                            </tr>
                                            <tr>
                                                <th class="table-light">카드 발급사</th>
                                                <td><?=$adminOrder->getTossCorpName("card",$toss_history['card']['issuerCode'])?></td>
                                            </tr>
                                            <tr>
                                                <th class="table-light">카드 매입사</th>
                                                <td><?=$adminOrder->getTossCorpName("card",$toss_history['card']['acquirerCode'])?></td>
                                            </tr>
                                            <tr>
                                                <th class="table-light">카드번호</th>
                                                <td><?=$toss_history['card']['number']?></td>
                                            </tr>
                                            <tr>
                                                <th class="table-light">카드사 승인 번호</th>
                                                <td><?=$toss_history['card']['approveNo']?></td>
                                            </tr>
                                            <tr>
                                                <th class="table-light">카드 종류</th>
                                                <td><?=$toss_history['card']['cardType']?></td>
                                            </tr>
                                            <tr>
                                                <th class="table-light">카드 소유자</th>
                                                <td><?=$toss_history['card']['ownerType']?></td>
                                            </tr>
                                            <tr>
                                                <th class="table-light">카드 매입상태</th>
                                                <td><?=$toss_history['card']['acquireStatus']?></td>
                                            </tr>
                                            <?php
                                        }
                                        ?>
                                        <?php
                                        if($toss_history['virtualAccount']){
                                            ?>
                                            <tr>
                                                <th class="table-light">은행</th>
                                                <td><?=$adminOrder->getTossCorpName("bank",$toss_history['virtualAccount']['bankCode'])?></td>
                                            </tr>
                                            <tr>
                                                <th class="table-light">계좌 번호</th>
                                                <td><?=$toss_history['virtualAccount']['accountNumber']?></td>
                                            </tr>
                                            <tr>
                                                <th class="table-light">구매자명</th>
                                                <td><?=$toss_history['virtualAccount']['customerName']?></td>
                                            </tr>
                                            <tr>
                                                <th class="table-light">입금자명</th>
                                                <td><?=$toss_history['virtualAccount']['depositorName']?></td>
                                            </tr>
                                            <tr>
                                                <th class="table-light">입금기한</th>
                                                <td><?=date('Y-m-d H:i:s', strtotime($toss_history['virtualAccount']['dueDate']))?></td>
                                            </tr>
                                            <tr>
                                                <th class="table-light">상태</th>
                                                <td><?=$toss_history['virtualAccount']['refundStatus']?></td>
                                            </tr>
                                            <tr>
                                                <th class="table-light">만료여부</th>
                                                <td><?=$toss_history['virtualAccount']['expired']?></td>
                                            </tr>
                                            <tr>
                                                <th class="table-light">정산</th>
                                                <td><?=$toss_history['virtualAccount']['settlementStatus']?></td>
                                            </tr>
                                            <tr>
                                                <th class="table-light">환불 계좌 정보</th>
                                                <td><?=$toss_history['virtualAccount']['refundReceiveAccount']?></td>
                                            </tr>
                                            <?php
                                        }
                                        ?>
                                        <?php
                                        if($toss_history['giftCertificate']){
                                            ?>
                                            <tr>
                                                <th class="table-light">결제승인번호</th>
                                                <td><?=$toss_history['giftCertificate']['approveNo']?></td>
                                            </tr>
                                            <tr>
                                                <th class="table-light">정산</th>
                                                <td><?=$toss_history['giftCertificate']['settlementStatus']?></td>
                                            </tr>
                                            <?php
                                        }
                                        ?>
                                        <?php
                                        if($toss_history['transfer']){
                                            ?>
                                            <tr>
                                                <th class="table-light">은행</th>
                                                <td><?=$adminOrder->getTossCorpName("bank",$toss_history['transfer']['bankCode'])?></td>
                                            </tr>
                                            <tr>
                                                <th class="table-light">정산</th>
                                                <td><?=$toss_history['transfer']['settlementStatus']?></td>
                                            </tr>
                                            <?php
                                        }
                                        ?>
                                        <?php
                                        if($toss_history['easyPay']){
                                            ?>
                                            <tr>
                                                <th class="table-light">간편결제사</th>
                                                <td><?=$toss_history['easyPay']['provider']?></td>
                                            </tr>
                                            <tr>
                                                <th class="table-light">결제금액</th>
                                                <td><?=$toss_history['easyPay']['amount']?></td>
                                            </tr>
                                            <tr>
                                                <th class="table-light">할인금액</th>
                                                <td><?=$toss_history['easyPay']['discountAmount']?></td>
                                            </tr>
                                            <?php
                                        }
                                        ?>
                                        <tr>
                                            <th class="table-light">영수증</th>
                                            <td><a href="<?=$toss_history['receipt']['url']?>" target="_blank">영수증</a></td>
                                        </tr>
                                        <?php
                                        if($toss_history['discount']){
                                            ?>
                                            <tr>
                                                <th class="table-light">즉시할인금액</th>
                                                <td><?=$toss_history['discount']['amount']?></td>
                                            </tr>
                                            <?php
                                        }
                                        ?>

                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <?
                        } else if($order_data['pg_provider']=="toss_pay"){
                            ?>
                            <div class="card mb-2">
                                <h5 class="card-header bg-secondary text-white font-14">토스페이 조회결과</h5>
                                <div class="card-body p-1">
                                    <table class="table table-bordered table-sm mb-0">
                                        <tbody>
                                        <?php
                                        if($tosspay_history['code']=="-1"){
                                            ?>
                                            <tr>
                                                <th class="table-light">에러코드</th>
                                                <td><?=$tosspay_history['errorCode']?></td>
                                            </tr>
                                            <tr>
                                                <th class="table-light">메세지</th>
                                                <td><?=$tosspay_history['msg']?></td>
                                            </tr>
                                            <?php
                                        }
                                        ?>
                                        <tr>
                                            <?php
                                            switch($tosspay_history['payStatus']){
                                                case "PAY_STANDBY":
                                                    $history_text="결제 대기 중";
                                                    $th_color="table-dark";
                                                    break;
                                                case "PAY_APPROVED":
                                                    $history_text="구매자 인증 완료";
                                                    $th_color="table-dark";
                                                    break;
                                                case "PAY_CANCEL":
                                                    $history_text="결제 취소";
                                                    $th_color="table-danger";
                                                    break;
                                                case "PAY_PROGRESS":
                                                    $history_text="결제 진행 중";
                                                    $th_color="table-secondary";
                                                    break;
                                                case "PAY_COMPLETE":
                                                    $history_text="결제 완료";
                                                    $th_color="table-success";
                                                    break;
                                                case "REFUND_PROGRESS":
                                                    $history_text="환불 진행 중";
                                                    $th_color="table-warning";
                                                    break;
                                                case "REFUND_SUCCESS":
                                                    $history_text="환불 성공";
                                                    $th_color="table-danger";
                                                    break;
                                                case "SETTLEMENT_COMPLETE":
                                                    $history_text="정산 완료";
                                                    $th_color="table-success";
                                                    break;
                                                case "SETTLEMENT_REFUND_COMPLETE":
                                                    $history_text="환불 정산 완료";
                                                    $th_color="table-danger";
                                                    break;
                                            }

                                            ?>
                                            <td colspan="2" class="fw-bold text-center <?=$th_color?>"><?=$history_text?></td>
                                        </tr>
                                        <tr>
                                            <th class="table-light" style="width:200px;">결제 수단</th>
                                            <td class="fw-bold table-light">
                                                <?php
                                                switch($tosspay_history['payMethod']){
                                                    case "TOSS_MONEY":
                                                        echo "토스머니";
                                                        break;
                                                    case "CARD":
                                                        echo "카드";
                                                        break;
                                                    case "TOSSPAY_MONEY":
                                                        echo "토스페이머니";
                                                        break;
                                                    case "ACCOUNT":
                                                        echo "ACCOUNT";
                                                        break;
                                                    case "RESELLER_CARD":
                                                        echo "RESELLER_CARD";
                                                        break;
                                                    case "BNPL":
                                                        echo "BNPL";
                                                        break;
                                                }
                                                ?>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th class="table-light">결제 총 금액</th>
                                            <td><?=number_format($tosspay_history['amount'])?> 원</td>
                                        </tr>
                                        <tr>
                                            <th class="table-light">할인된 금액</th>
                                            <td><?=number_format($tosspay_history['discountedAmount'])?> 원</td>
                                        </tr>
                                        <tr>
                                            <th class="table-light">즉시 할인 적용 금액</th>
                                            <td><?=number_format($tosspay_history['originDiscountAmount'])?> 원</td>
                                        </tr>
                                        <tr>
                                            <th class="table-light">토스 포인트 사용금액</th>
                                            <td><?=number_format($tosspay_history['originPaidPoint'])?> 원</td>
                                        </tr>
                                        <tr>
                                            <th class="table-light">지불수단 승인금액</th>
                                            <td><?=number_format($tosspay_history['paidAmount'])?> 원</td>
                                        </tr>
                                        <tr>
                                            <th class="table-light">환불 가능 잔액</th>
                                            <td><?=number_format($tosspay_history['refundableAmount'])?> 원</td>
                                        </tr>

                                        <?php
                                        if($tosspay_history['payMethod']=="TOSS_MONEY"||$tosspay_history['payMethod']=="ACCOUNT"){
                                            ?>
                                            <tr>
                                                <th class="table-light">은행</th>
                                                <td><?=$adminOrder->getTosspayCorpName("bank",$tosspay_history['accountBankCode'])?></td>
                                            </tr>
                                            <?php
                                        }
                                        ?>
                                        <?php
                                        if($tosspay_history['payMethod']=="ACCOUNT"){
                                            ?>
                                            <tr>
                                                <th class="table-light">계좌 번호</th>
                                                <td><?=$tosspay_history['accountNumber']?></td>
                                            </tr>
                                            <?php
                                        }
                                        ?>
                                        <tr>
                                            <th class="text-left table-light">결제요청시간</th>
                                            <td class="text-left"><?=date('Y-m-d H:i:s', strtotime($tosspay_history['createdTs']))?></td>
                                        </tr>
                                        <tr>
                                            <th class="text-left table-light">결제완료시간</th>
                                            <td class="text-left"><?=date('Y-m-d H:i:s', strtotime($tosspay_history['paidTs']))?></th>
                                        </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div class="card mb-2">
                                <h5 class="card-header bg-secondary text-white font-14">토스페이 히스토리</h5>
                                <div class="card-body p-1">
                                    <table class="table table-bordered table-sm mb-0">
                                        <tbody>
                                        <?php
                                        $refund_num=0;
                                        foreach($tosspay_history['transactions'] as $transactions){
                                            ?>
                                            <tr>
                                                <th class="text-center <?=$transactions['stepType']=="PAY"?'table-success':'table-danger'?>" colspan="2"><?=$transactions['stepType']?></th>
                                            </tr>
                                            <tr>
                                                <th class="text-left table-light" style="width:200px;">transactionId</th>
                                                <td class="text-left" style=""><?=$transactions['transactionId']?></th>
                                            </tr>
                                            <tr>
                                                <th class="text-left table-light" style="">승인금액</th>
                                                <td class="text-left" style=""><?=number_format($transactions['paidAmount'])?> 원</th>
                                            </tr>
                                            <tr>
                                                <th class="text-left table-light" style="">총 거래 금액</th>
                                                <td class="text-left" style=""><?=number_format($transactions['transactionAmount'])?> 원</th>
                                            </tr>
                                            <tr>
                                                <th class="table-light">즉시 할인 적용 금액</th>
                                                <td><?=number_format($transactions['originDiscountAmount'])?> 원</td>
                                            </tr>
                                            <tr>
                                                <th class="table-light">할인 금액</th>
                                                <td><?=number_format($transactions['discountAmount'])?> 원</td>
                                            </tr>
                                            <tr>
                                                <th class="table-light">토스 포인트 사용금액</th>
                                                <td><?=number_format($transactions['originPaidPoint'])?> 원</td>
                                            </tr>
                                            <tr>
                                                <th class="table-light">포인트 사용금액</th>
                                                <td><?=number_format($transactions['pointAmount'])?> 원</td>
                                            </tr>
                                            <tr>
                                                <th class="text-left table-light" style="">요청시간</th>
                                                <td class="text-left" style=""><?=date('Y-m-d H:i:s', strtotime($transactions['regTs']))?></th>
                                            </tr>
                                            <?php
                                            $refund_num++;
                                        }
                                        ?>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <?php
                        }
                        ?>

                    </div>
                </div>
            </div> <!-- container -->
        </div> <!-- content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
<!--키확인 팝업-->
<div id="orderLicence-modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="primary-header-modalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header modal-colored-header bg-primary">
                <h4 class="modal-title" id="primary-header-modalLabel">키확인</h4>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-hidden="true"></button>
            </div>
            <div class="modal-body">
                <div id="licence_result"></div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">닫기</button>

            </div>
        </div>
    </div>
</div>

<!--주문취소 팝업-->
<div id="order-cancel-modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="danger-header-modalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header modal-colored-header bg-danger">
                <h4 class="modal-title" id="danger-header-modalLabel">주문취소</h4>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-hidden="true"></button>
            </div>
            <div class="modal-body">
                <form id="cancelFrm" name="cancelFrm">
                    <input type="hidden" name="mode" id="mode" value="order_item_cancel">
                    <input type="hidden" name="settle_no" id="settle_no" value="<?=$settle_no?>">
                    <input type="hidden" name="delivery_type" name="delivery_type">
                    <div class="form-group">
                        <label for="recipient-name" class="col-sm-2 control-label">주문상품</label>
                        <div class="col-sm-10">
                            <input type="text" class="form-control" id="product_name" name="product_name" readonly>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="recipient-name" class="col-sm-2 control-label">주문번호:</label>
                        <div class="col-sm-10">
                            <input type="text" class="form-control" id="ordno" name="ordno" readonly>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="message-text" class="col-sm-2 control-label">주문처리</label>
                        <div class="col-sm-10">
                            <input type="text" class="form-control" id="order_status" name="order_status" value="주문취소" readonly>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="message-text" class="col-sm-2 control-label">주문시스템</label>
                        <div class="col-sm-10">
                            <input type="text" class="form-control" id="order_system" name="order_system" readonly>
                            <span id="notice" name="notice" class="text-danger"></span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="message-text" class="col-sm-2 control-label">처리자</label>
                        <div class="col-sm-10">
                            <input type="text" class="form-control" id="admin_id" name="admin_id" value="<?=$_SESSION['admin']['admin_id']?>" readonly>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="message-text" class="col-sm-2 control-label">처리사유</label>
                        <div class="col-sm-10">
                            <textarea class="form-control" id="message" name="message"></textarea>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-danger shadow-none" id="btn_order_cancel">취소 완료</button>
            </div>
        </div>
    </div>
</div>

<!--결제 취소 팝업-->
<div id="order-refund-modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="danger-header-modalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header modal-colored-header bg-danger">
                <h4 class="modal-title" id="danger-header-modalLabel">결제취소</h4>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-hidden="true"></button>
            </div>
            <div class="modal-body">
                <form id="tossFrm" name="tossFrm">
                    <input type="hidden" name="mode" value="toss_refund">
                    <input type="hidden" name="settle_no" value="<?=$settle_no?>">
                    <input type="hidden" name="paymentKey" value="<?=$settle_log['payment_key']?>">
                    <div class="form-group row mb-2">
                        <label for="refund_settle_no" class="col-sm-4 control-label">결제번호</label>
                        <div class="col-sm-8">
                            <?=$order_data['settle_no']?>
                        </div>
                    </div>
                    <div class="form-group row mb-2">
                        <label for="message-text" class="col-sm-4 control-label">결제수단</label>
                        <div class="col-sm-8">
                            <?=$adminOrder->getSettlekindLabel($order_data['payment_method'])?>
                        </div>
                    </div>
                    <div class="form-group row mb-2">
                        <label for="message-text" class="col-sm-4 control-label">결제금액</label>
                        <div class="col-sm-8">
                            <?=number_format($settle_log['total_amount'])?> 원
                        </div>
                    </div>
                    <div class="form-group row mb-2">
                        <label for="message-text" class="col-sm-4 control-label">취소가능금액</label>
                        <div class="col-sm-8">
                            <?=number_format($settle_log['balance_amount'])?> 원
                        </div>
                    </div>
                    <div class="form-group row mb-2">
                        <label for="message-text" class="col-sm-4 control-label">취소금액<br>(입력하지 않으면 전액)</label>
                        <div class="col-sm-8">
                            <input type="text" class="form-control" id="cancelAmount" name="cancelAmount" value="">
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-danger shadow-none" id="btn_toss_refund">결제 취소</button>
            </div>
        </div>
    </div>
</div>

<!--결제 취소 팝업-->
<div id="order-tosspay-refund-modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="danger-header-tosspay-modalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header modal-colored-header bg-danger">
                <h4 class="modal-title" id="danger-header-tosspay-modalLabel">결제취소</h4>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-hidden="true"></button>
            </div>
            <div class="modal-body">
                <form id="tosspayFrm" name="tosspayFrm">
                    <input type="hidden" name="mode" value="tosspay_refund">
                    <input type="hidden" name="settle_no" value="<?=$settle_no?>">
                    <input type="hidden" name="payToken" value="<?=$settle_log['payToken']?>">
                    <input type="hidden" name="refundNo" value="REFUND_<?=$refund_num?>_<?=$settle_no?>">


                    <div class="form-group row mb-2">
                        <label for="refund_settle_no" class="col-sm-4 control-label">결제번호</label>
                        <div class="col-sm-8">
                            <?=$order_data['settle_no']?>
                        </div>
                    </div>
                    <div class="form-group row mb-2">
                        <label for="message-text" class="col-sm-4 control-label">결제수단</label>
                        <div class="col-sm-8">
                            <?=$adminOrder->getSettlekindLabel($order_data['payment_method'])?>
                        </div>
                    </div>
                    <div class="form-group row mb-2">
                        <label for="message-text" class="col-sm-4 control-label">주문금액</label>
                        <div class="col-sm-8">
                            <?=number_format($settle_log['amount'])?> 원
                        </div>
                    </div>
                    <div class="form-group row mb-2">
                        <label for="message-text" class="col-sm-4 control-label">결제금액</label>
                        <div class="col-sm-8">
                            <?=number_format($settle_log['paidAmount'])?> 원
                        </div>
                    </div>
                    <div class="form-group row mb-2">
                        <label for="message-text" class="col-sm-4 control-label">취소금액<br>(입력하지 않으면 전액)</label>
                        <div class="col-sm-8">
                            <input type="text" class="form-control" id="cancelAmount" name="cancelAmount" value="">
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-danger shadow-none" id="btn_tosspay_refund">결제 취소</button>
            </div>
        </div>
    </div>
</div>
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>
    $(document).ready(function(){
        $('.btn_delivery_search').bind("click",function(){
            var index = $('.btn_delivery_search').index(this);
            var tracking_no = $('.btn_delivery_search').eq(index).attr("data-trackingno");
            var delivery_code = $('.btn_delivery_search').eq(index).attr("data-deliverycode");
            var $form = $('<form></form>');

            if(delivery_code=="002"){
                $form.attr('action', 'https://service.epost.go.kr/trace.RetrieveDomRigiTraceList.comm');
                $form.attr('method', 'post');
                $form.attr('target', '_blank');
                $form.appendTo('body');

                var sid1 = $('<input type="hidden" value="'+tracking_no+'" name="sid1">');
                $form.append(sid1);
            }else{
                $form.attr('action', 'https://trace.cjlogistics.com/web/detail.jsp');
                $form.attr('method', 'post');
                $form.attr('target', '_blank');
                $form.appendTo('body');

                //var fsp_action = $('<input type="hidden" value="PARC_ACT_002" name="fsp_action">');
                //var fsp_cmd = $('<input type="hidden" value="retrieveInvNoACT2" name="fsp_cmd">');
                var invc_no = $('<input type="hidden" value="'+tracking_no+'" name="slipno">');
                $form.append(invc_no);
            }
            $form.submit();
        });

        //페이코 결제취소
        $("#btn_payco_refund").bind("click",function(){
            if(confirm("해당 PAYCO결제를 취소하시겠습니까?")){
                $.ajax({
                    type: "POST",
                    url: "order_ps.php",
                    data:$("#paycoFrm").serialize(),
                    success:function(data){
                        location.reload();
                    }
                });
            }
        });
        //페이코 결제취소
        $("#btn_payco_cancel").bind("click",function(){
            if(confirm("해당 PAYCO결제를 취소하시겠습니까?")){
                $("#paycoFrm input[name='mode']").val("payco_cancel");
                $.ajax({
                    type: "POST",
                    url: "order_ps.php",
                    data:$("#paycoFrm").serialize(),
                    success:function(data){
                        location.reload();
                    }
                });
            }
        });

        //KCP 결제취소
        $("#btn_kcp_refund").bind("click",function(){
            if(confirm("해당 KCP결제를 취소하시겠습니까?")){
                $.ajax({
                    type: "POST",
                    url: "order_ps.php",
                    data:$("#kcpFrm").serialize(),
                    success:function(data){
                        location.reload();
                    }
                });
            }
        });

        //토스 결제취소
        $("#btn_toss_refund").bind("click",function(){
            var mod_type = $(this).attr("data-modetype");
            $("form[name='tossFrm'] input[name='mod_type']").val(mod_type);
            if(confirm("해당 토스 결제를 취소하시겠습니까?")){
                $.ajax({
                    type: "POST",
                    url: "order_ps.php",
                    data:$("#tossFrm").serialize(),
                    success:function(data){
                        location.reload();
                    }
                });
            }
        });
        //토스페이 결제취소
        $("#btn_tosspay_refund").bind("click",function(){
            if(confirm("해당 토스페이 결제를 취소하시겠습니까?")){
                $.ajax({
                    type: "POST",
                    url: "order_ps.php",
                    data:$("#tosspayFrm").serialize(),
                    success:function(data){
                        location.reload();
                    }
                });
            }
        });

        //네이버페이 결제취소
        $("#btn_naverpay_refund").bind("click",function(){
            if(confirm("해당 네이버페이 결제를 취소하시겠습니까?")){
                $.ajax({
                    type: "POST",
                    url: "order_ps.php",
                    data:$("#naverpayFrm").serialize(),
                    success:function(data){
                        location.reload();
                    }
                });
            }
        });

        $("#btn_order_cancel").bind("click",function(){
            var formURL = "order_ps.php";
            var postData = $("#cancelFrm").serializeArray();
            $(".overlay").show();
            $.ajax({
                url : formURL,
                type: "POST",
                data : postData,
                success:function(data){
                    //console.log(data);
                    location.reload();
                },
                error: function(data) {
                    console.log(data);
                    alert(data);
                }
            });
        });

        $("#btn_point_refund").bind("click",function(){
            var settle_no = $(this).attr("data-settleno");
            var use_emoney = $(this).attr("data-useemoney");
            if(confirm("해당 결제시 할인에 사용된 적립금을 반환(환불)처리 하시겠습니까?")){
                $.ajax({
                    url : "order_ps.php",
                    type: "POST",
                    data : {mode:"point_refund",settle_no:settle_no,use_emoney:use_emoney},
                    success:function(data){
                        location.reload();
                    },
                    error: function(data) {
                        alert(data);
                    }
                });
            }
        });

        $("#btn_order_refund").bind("click",function(){
            var settle_no = $(this).attr("data-settleno");
            var use_emoney = $(this).attr("data-useemoney");
            if(confirm("결제를 취소하고 사용된 적립금을 반환(환불)처리 하시겠습니까?")){
                $.ajax({
                    url : "order_ps.php",
                    type: "POST",
                    data : {mode:"order_refund",settle_no:settle_no,use_emoney:use_emoney},
                    success:function(data){
                        location.reload();
                    },
                    error: function(data) {
                        alert(data);
                    }
                });
            }
        });

        $(".btn_reject").bind("click",function(){
            var settle_no = $(this).attr("data-settleno");
            var ordno = $(this).attr("data-ordno");
            var admin_id = $(this).attr("data-adminid");
            var payment_method = $(this).attr("data-settlemethod");
            if(confirm("해당 취소요청 주문을 반려처리 하시겠습니까?")){
                $.ajax({
                    url : "order_ps.php",
                    type: "POST",
                    data : {mode:"order_reject",settle_no:settle_no,ordno:ordno,admin_id:admin_id,payment_method:payment_method},
                    success:function(data){
                        location.reload();
                    },
                    error: function(data) {
                        alert(data);
                    }
                });
            }
        });

        $("#adminFrm").on("submit", function(e){
            e.preventDefault();

            if(confirm("메모를 기록하겠습니까")){
                $.ajax({
                    url : "order_ps.php",
                    type: "POST",
                    data: $("#adminFrm").serialize(),
                    success:function(data){
                        console.log(data);
//					location.reload();
                    },
                    error: function(data) {
                        console.log(data);
                        alert(data);
                    }
                });
            }
        });

        $(".deliveryFrm").on("submit", function(e){
            e.preventDefault();
            var $form = $(this);

            if(confirm("운송장번호를 입력하시겠습니까?")){
                $.ajax({
                    url: "order_ps.php",
                    type: "POST",
                    data: $form.serialize(),
                    success: function(data){
                        console.log(data);
                        location.reload();
                    },
                    error: function(data) {
                        console.log(data);
                        alert(data);
                    }
                });
            }
        });

        $('#order-cancel-modal').on('show.bs.modal', function (event) {
            var button = $(event.relatedTarget)
            var ordno = button.data('ordno');
            var system = button.data('system');
            var product_name = button.data('productname');
            var delivery_type = button.data('delivery_type');

            var modal = $(this);

            modal.find('.modal-body input[name="ordno"]').val(ordno);
            modal.find('.modal-body input[name="product_name"]').val(product_name);
            modal.find('.modal-body input[name="order_system"]').val(system);
            modal.find('.modal-body input[name="delivery_type"]').val(delivery_type);

            if(system=="Ztorm"){
                modal.find('#notice').text("Ztorm 주문은 Hub에서 별도로 주문취소 하셔야 합니다.");
            } else {
                modal.find('#notice').text("");
            }
        });

        $('#order-refund-modal').on('show.bs.modal', function (event) {

        });


        //자체상품 키확인
        $(".btn_licence_view").bind("click",function(){
            var index = $(".btn_licence_view").index(this);
            var mode = $(".btn_licence_view").eq(index).attr("data-mode");
            var item_order_id = $(".btn_licence_view").eq(index).attr("data-itemorderid");
            $.ajax({
                url : "order_licence.php",
                type: "POST",
                data : {mode:mode,item_order_id:item_order_id},
                success:function(data){
                    $("#orderLicence-modal #licence_result").html(data)
                    $("#orderLicence-modal").modal('show');
                },
                error: function(data) {
                    console.log(data);
                    alert(data);
                }
            });
        });

        $("#order_detail").bind("click",function(){
            var formURL = "order_detail.php";
            var postData = {
                reserveOrderNo: $(this).data('reserveorderno'),
                sellerOrderReferenceKey: $(this).data('sellerorderreferencekey')
            };
            $(".overlay").show();
            $.ajax({
                url : formURL,
                type: "POST",
                data : postData,
                success:function(data){
                    console.log(data);
                    var popup = window.open('', 'orderDetail', 'width=800,height=600,scrollbars=yes');
                    popup.document.write(data);
                    popup.document.close();
                },
                error: function(data) {
                    console.log(data);
                    alert(data);
                }
            });
        });


        $("#btn_settle_no_copy").bind("click",function(){
            var settle_no = $(this).data("settleno");
            navigator.clipboard.writeText(settle_no).then(function() {
                    console.log("Copied to clipboard successfully!");
                },
                function() {
                    console.error("클립보드 사용이 불가능합니다.");
                });
        });

    });
</script>
</body>
</html>