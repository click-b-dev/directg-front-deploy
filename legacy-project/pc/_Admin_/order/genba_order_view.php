<?php
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$search_type  = trim(filter_input(INPUT_GET, 'search_type', FILTER_SANITIZE_STRING));
$search_value = trim(filter_input(INPUT_GET, 'search_value', FILTER_SANITIZE_STRING));

$topmenu['order'] = "active";
$sidebar_file = "sidebar_order.php";
$page_title = "Genba 주문조회";

$order_info = "";

try {
    if ($search_value) {
        $pdo = new PDO($dsn, DB_USER, DB_PASSWORD);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

        $AdminOrder= new AdminOrder($pdo); 

        $Genba = new Genba("Live");

        if ($search_type == "client_transaction_id") {
            ob_start();
            $rst = $Genba->runGenbaGetOrderByCtidAsync($search_value);
            $genba_error = ob_get_clean();
        } else {
            if ($search_type == "item_order_id") {
                $ordno = $search_value;
            } else {
                $order_tmp = $AdminOrder->getOrderItemGenba($search_value);

                if ($order_tmp[0]['ID'] != "") {
                    $ordno = $order_tmp[0]['ID'];
                }
            }

            if ($ordno) {
                ob_start();
                $rst = $Genba->runGenbaGetOrderAsync($ordno);
                $genba_error = ob_get_clean();
            }
        }
        
        if ($rst->ID != "") {
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
										<li class="breadcrumb-item"><a href="javascript: void(0);">Genba 주문 관리</a></li>
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
                                                            <option value="client_transaction_id" <?=$selected['search_type']['client_transaction_id']?>>ClientTransactionID</option>
                                                        </select>
                                                    </div>
                                                    <div class="col-sm-6 ps-0">
                                                        <input type="text" class="form-control" id="search_value" name="search_value" value="<?=$search_value?>">
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
                                            <col style="width: 30%; background-color: #f8f9fa;">
                                            <col style="width: 70%;">
                                        </colgroup>
                                        <tbody>
                                            <tr>
                                                <th class="text-center">ClientTransactionID</th>
                                                <td><?=$order_info->ClientTransactionID?></td>
                                            </tr>
                                            <tr>
                                                <th class="text-center">Order ID</th>
                                                <td><?=$order_info->ID?></td>
                                            </tr>
                                            <tr>
                                                <th class="text-center">ReservationID</th>
                                                <td><?=$order_info->ReservationID?></td>
                                            </tr>
                                            <tr>
                                                <th class="text-center">Sku</th>
                                                <td><?=$order_info->Sku?></td>
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
                                                <th class="text-center">State*</th>
                                                <td><?=$order_info->State?></td>
                                            </tr>
                                            <tr>
                                                <th class="text-center">CommunicatedBuyingPrice</th>
                                                <td>
                                                    <?=number_format((int)$order_info->CommunicatedBuyingPrice->Amount)?>
                                                    <?=$order_info->CommunicatedBuyingPrice->CurrencyCode?>
                                                </td>
                                            </tr>
                                            <tr>
                                                <th class="text-center">ActualBuyingPrice</th>
                                                <td>
                                                    <?=number_format((int)$order_info->ActualBuyingPrice->Amount)?>
                                                    <?=$order_info->ActualBuyingPrice->CurrencyCode?>
                                                </td>
                                            </tr>
                                            <tr>
                                                <th class="text-center">SellingPrice</th>
                                                <td>
                                                    <del><?=number_format((int)$order_info->SellingPrice->GrossAmount)?> <?=$order_info->SellingPrice->CurrencyCode?><br></del>
                                                    <?=number_format((int)$order_info->SellingPrice->NetAmount)?> <?=$order_info->SellingPrice->CurrencyCode?>                                                        
                                                </td>
                                            </tr>
                                            
                                            <tr>
                                                <th class="text-center">Keys</th>
                                                <td class="nested-container">
                                                    <table class="sub-table">
                                                        <colgroup>
                                                            <col class="sub-col-key">
                                                            <col class="sub-col-val">
                                                        </colgroup>
                                                        <tbody>
                                                    <?php foreach ($order_info->Keys as $value) { ?>
                                                            <tr>
                                                                <td>Code</td>
                                                                <td><?=$value->Code?></td>
                                                            </tr>
                                                            <tr>
                                                                <td>KeyType</td>
                                                                <td><?=$value->KeyType?></td>
                                                            </tr>
                                                            <tr>
                                                                <td>Sku</td>
                                                                <td><?=$value->Sku?></td>
                                                            </tr>
                                                            <tr>
                                                                <td>ProductName</td>
                                                                <td><?=$value->ProductName?></td>
                                                            </tr>
                                                    <?php } ?>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
								</div>
							</div>
                            <!-- Personal-Information -->
						</div>
                        <div class="col-xl-6">
                            <div class="card">
                                <div class="card-header">
                                    <b>State</b>
                                </div>
                                <ul class="list-group list-group-flush">
                                    <li class="list-group-item">0 : 주문이 백그라운드에서 처리 중이며, 완료될 때까지 시리얼 번호가 포함되지 않습니다.</li>
                                    <li class="list-group-item">1 : 주문에 아직 시리얼 번호가 없으며, 제품이 출시되는 즉시 상태가 변경됩니다.</li>
                                    <li class="list-group-item">2 : 주문이 완료되었으며 응답에서 시리얼 번호를 확인할 수 있습니다.</li>
                                    <li class="list-group-item">3 : 주문이 반환되었으며 더 이상 시리얼 번호가 표시되지 않습니다.</li>
                                    <li class="list-group-item">4 : 이 상태는 일반적으로 주문 초기 처리가 진행 중일 때만 발생합니다.</li>
                                </ul>
                            </div>
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