<?php
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$search_type  = trim(filter_input(INPUT_GET, 'search_type', FILTER_SANITIZE_STRING));
$search_value = trim(filter_input(INPUT_GET, 'search_value', FILTER_SANITIZE_STRING));

$topmenu['order'] = "active";
$sidebar_file = "sidebar_order.php";
$page_title = "Vaultn 주문조회";

$order_info = "";

try {
    if ($search_value) {
        $pdo = new PDO($dsn, DB_USER, DB_PASSWORD);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

        $AdminOrder= new AdminOrder($pdo); 

        if ($search_type == "item_order_id") {
            $ordno = $search_value;
        } else {
            $order_tmp = $AdminOrder->getOrderItemVaultn($search_value);

            if ($order_tmp[0]['orderId'] != "") {
                $ordno = $order_tmp[0]['orderId'];
            }
        }

        if ($ordno) {
            $Vaultn = new Vaultn();

            ob_start();
            $rst = $Vaultn->runRetrieveOrder($ordno);
            $vaultn_error = ob_get_clean();
        }

        if ($rst->orderId != "") {
            $order_info = $rst;
        } else {
            $order_info = null;
        }
    }
} catch (PDOException $e) {
	echo 'Error!: '.$e->getMessage();
	die();
}

$selected['search_type'][$search_type] = "selected";

include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php');

?>
<style>
    .col-label { width: 30%; }
    .col-value { width: 70%; }
    .text-break {
        word-break: break-all; /* GUID가 화면 밖으로 넘치지 않게 방지 */
    }

    /* 중첩 데이터 레이아웃 */
    .nested-container {
        padding: 16px !important;
        background-color: #ffffff;
    }

    /* 내부 정렬용 미니 테이블 */
    .sub-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 16px;
    }
    .sub-table td {
        padding: 2px 0 !important;
        border: none !important; /* 내부 테이블 테두리 제거 */
    }
    .sub-col-key {
        width: 40%;
        color: #6c757d;
    }
    .sub-col-val {
        width: 60%;
    }

    /* priceListDetails 전용 하위 카드 디자인 */
    .nested-card {
        background-color: #f1f3f5;
        padding: 14px;
        border-radius: 4px;
        border: 1px solid #e9ecef;
    }
    .nested-card .card-title {
        font-weight: bold;
        margin-bottom: 10px;
        color: #343a40;
    }
    .size-sm {
        font-size: 13px; /* 하위 데이터는 살짝 작게 조절 */
    }
    .size-sm td {
        padding: 1px 0 !important;
    }
</style>
<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
	<!-- Begin page -->
	<div class="wrapper">
		<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_start.php'); ?>
		<div class="content-page">
			<div class="content">
				<div class="container-fluid">
					<!-- start page title -->
					<div class="row">
						<div class="col-12">
							<div class="page-title-box">
								<div class="page-title-right">
									<ol class="breadcrumb m-0">
										<li class="breadcrumb-item"><a href="javascript: void(0);">홈</a></li>
										<li class="breadcrumb-item"><a href="javascript: void(0);">주문</a></li>
										<li class="breadcrumb-item"><a href="javascript: void(0);">Vaultn 주문 관리</a></li>
										<li class="breadcrumb-item active"><?=$page_title?></li>
									</ol>
								</div>
								<h4 class="page-title"><?=$page_title?></h4>
							</div>
						</div>
					</div>     
					<!-- end page title -->
					
					<!-- 검색필터 start -->
                    <div class="row">
                        <div class="col-xl-6">
                            <div class="card">
                                <h5 class="card-header bg-secondary text-white">검색필터</h5>
                                <div class="card-body">
                                    <form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
                                        <div class="row mb-2">
                                            <div class="col-lg-12">
                                                <div class="input-group row">
                                                    <label for="" class="col-sm-3 col-form-label bg-light border">검색어</label>
                                                    <div class="col-sm-3">
                                                        <select class="form-select" name="search_type">
                                                            <option value="ordno" <?=$selected['search_type']['ordno']?>>주문번호</option>
                                                            <option value="item_order_id" <?=$selected['search_type']['item_order_id']?>>Item Order ID</option>
                                                        </select>
                                                    </div>
                                                    <div class="col-sm-6 ps-0">
                                                        <input type="text" class="form-control" id="search_value" name="search_value" placeholder="주문번호" value="<?=$search_value?>">
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="row">
                                            <div class="col-lg-12">
                                                <div class="float-end">
                                                    <button type="submit" class="btn btn-primary shadow-none">검색</button>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- 검색필터 end -->
                    <?php if($order_info) { ?>
					<div class="row">
                        <div class="col-xl-6">
							<!-- Personal-Information -->
							<div class="card">
								<div class="card-body">
                                    <table class="table table-bordered" style="margin-bottom: 0px;">
                                        <colgroup>
                                            <col class="col-label">
                                            <col class="col-value">
                                        </colgroup>
                                        <tbody>
                                            <tr>
                                                <th class="text-center">orderId</th>
                                                <td><?=$order_info->orderId?></td>
                                            </tr>
                                            <tr>
                                                <th class="text-center">clientOrderReference</th>
                                                <td><?=$order_info->clientOrderReference?></td>
                                            </tr>
                                            <tr>
                                                <th class="text-center">clientCustomerReference</th>
                                                <td><?=$order_info->clientCustomerReference?></td>
                                            </tr>
                                            <tr>
                                                <th class="text-center">Created</th>
                                                <td>
                                                <?php
                                                    $CreatedDt = new DateTime($order_info->Created, new DateTimeZone('UTC'));
                                                    $CreatedDt->setTimezone(new DateTimeZone('Asia/Seoul'));

                                                    echo $CreatedDt->format('Y-m-d H:i:s');
                                                ?>
                                                </td>
                                            </tr>
                                            <tr>
                                                <th class="text-center">status</th>
                                                <td><?=$order_info->status?></td>
                                            </tr>
                                            <tr>
                                                <th class="text-center">orderDetails</th>
                                                <td class="nested-container">
                                                    <table class="sub-table">
                                                        <colgroup>
                                                            <col class="sub-col-key">
                                                            <col class="sub-col-val">
                                                        </colgroup>
                                                        <tbody>
                                                <?php
                                                $orderDetails = $order_info->orderDetails;
                                                $priceListDetails = $order_info->orderDetails->priceListDetails;
                                                ?>
                                                            <tr>
                                                                <td>salesCurrency</td>
                                                                <td><?=$orderDetails->salesCurrency?></td>
                                                            </tr>
                                                            <tr>
                                                                <td>salesCountry</td>
                                                                <td><?=$orderDetails->salesCountry?></td>
                                                            </tr>
                                                            <tr>
                                                                <td>salesCountryCode</td>
                                                                <td><?=$orderDetails->salesCountryCode?></td>
                                                            </tr>
                                                            <tr>
                                                                <td>salesPriceGross</td>
                                                                <td><?=number_format((int)$orderDetails->salesPriceGross)?></td>
                                                            </tr>
                                                            <tr>
                                                                <td>salesPriceNet</td>
                                                                <td><?=$orderDetails->salesPriceNet?number_format((int)$orderDetails->salesPriceNet):""?></td>
                                                            </tr>
                                                            <tr>
                                                                <td>appliedDiscountPercentage</td>
                                                                <td><?=$orderDetails->appliedDiscountPercentage?></td>
                                                            </tr>
                                                            <tr>
                                                                <td>appliedDiscountAmount</td>
                                                                <td><?=$orderDetails->appliedDiscountAmount?number_format((int)$orderDetails->appliedDiscountAmount):""?></td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                    
                                                    <div class="nested-card">
                                                        <div class="card-title">priceListDetails</div>
                                                        <table class="sub-table size-sm">
                                                            <colgroup>
                                                                <col class="sub-col-key">
                                                                <col class="sub-col-val">
                                                            </colgroup>
                                                            <tbody>
                                                                <tr>
                                                                    <td>publisherName</td>
                                                                    <td><?=$priceListDetails->publisherName?></td>
                                                                </tr>
                                                                <tr>
                                                                    <td>publisherGuid</td>
                                                                    <td class="text-break"><?=$priceListDetails->publisherGuid?></td>
                                                                </tr>
                                                                <tr>
                                                                    <td>priceModel</td>
                                                                    <td><?=$priceListDetails->priceModel?></td>
                                                                </tr>
                                                                <tr>
                                                                    <td>priceListGuid</td>
                                                                    <td class="text-break"><?=$priceListDetails->priceListGuid?></td>
                                                                </tr>
                                                                <tr>
                                                                    <td>countryCode</td>
                                                                    <td><?=$priceListDetails->countryCode?></td>
                                                                </tr>
                                                                <tr>
                                                                    <td>srpCurrency</td>
                                                                    <td><?=$priceListDetails->srpCurrency?></td>
                                                                </tr>
                                                                <tr>
                                                                    <td>purchasePriceCurrency</td>
                                                                    <td><?=$priceListDetails->purchasePriceCurrency?></td>
                                                                </tr>
                                                                <tr>
                                                                    <td>baseSRP</td>
                                                                    <td><?=number_format((int)$priceListDetails->baseSRP)?></td>
                                                                </tr>
                                                                <tr>
                                                                    <td>discountedSRP</td>
                                                                    <td><?=number_format((int)$priceListDetails->discountedSRP)?></td>
                                                                </tr>
                                                                <tr>
                                                                    <td>netDiscountedSRP</td>
                                                                    <td><?=number_format((float)$priceListDetails->netDiscountedSRP, 2)?></td>
                                                                </tr>
                                                                <tr>
                                                                    <td>priceListVAT</td>
                                                                    <td><?=$priceListDetails->priceListVAT?></td>
                                                                </tr>
                                                                <tr>
                                                                    <td>basePurchasePrice</td>
                                                                    <td><?=number_format((float)$priceListDetails->basePurchasePrice, 2)?></td>
                                                                </tr>
                                                                <tr>
                                                                    <td>promoPercentage</td>
                                                                    <td><?=$priceListDetails->promoPercentage?></td>
                                                                </tr>
                                                                <tr>
                                                                    <td>netPurchasePrice</td>
                                                                    <td><?=number_format((float)$priceListDetails->netPurchasePrice, 2)?></td>
                                                                </tr>
                                                                <tr>
                                                                    <td>estimatedMargin</td>
                                                                    <td><?=number_format((float)$priceListDetails->estimatedMargin, 2)?></td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
								</div>
							</div>
                            <!-- Personal-Information -->
						</div>
                    </div>
                    <?php } else if ($order_info === null) { ?>
                        <div class="alert alert-danger" role="alert">
                            <?=$genba_error?> : 주문 정보를 찾을 수 없습니다.
                        </div>
                    <?php } ?>
					<!-- end row -->   
				</div><!-- /container-fluid -->
			</div><!-- /content -->
		</div><!-- /content-page -->
	</div><!-- /wrapper -->

    <?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>
</body>
</html>