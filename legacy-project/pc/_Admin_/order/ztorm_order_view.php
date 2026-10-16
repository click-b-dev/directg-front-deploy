<?php
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$search_type  = trim(filter_input(INPUT_GET, 'search_type', FILTER_SANITIZE_STRING));
$search_value = trim(filter_input(INPUT_GET, 'search_value', FILTER_SANITIZE_STRING));

$topmenu['order'] = "active";
$sidebar_file = "sidebar_order.php";
$page_title = "Ztorm 주문조회";

$order_info = "";

try {
    if ($search_value) {
        if ($search_type == "item_order_id") {
            $pdo = new PDO($dsn, DB_USER, DB_PASSWORD);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

            $AdminOrder= new AdminOrder($pdo); 
            $rst = $AdminOrder->getOrderZtormSuccess(1, " AND customer_product_id = {$search_value}", 1, "");
            $ordno = $rst->resultset->fetchAll()[0]['ordno'];
            
            if ($ordno === NULL) {
                $ordno = 0;
            }
        } else {
            $ordno = $search_value;
        }

        $Ztorm = new Ztorm();
        $params = array(
            "RetailerOrderID" => $ordno
        );

        ob_start();
        $rst = $Ztorm->runGetOrder($params);
        $ztorm_error = ob_get_clean();

        if ($rst->ErrorCode == 0) {
            $order_info = $rst->Value->Order;
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
										<li class="breadcrumb-item"><a href="javascript: void(0);">Ztorm 주문 관리</a></li>
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
                                                <th class="text-center">CountryCode</th>
                                                <td><?=$order_info->CountryCode?></td>
                                            </tr>
                                            <tr>
                                                <th class="text-center">CustomerIP</th>
                                                <td><?=$order_info->CustomerIP?></td>
                                            </tr>
                                            <tr>
                                                <th class="text-center">EndTime</th>
                                                <td><?=date('Y-m-d H:i:s', (int)$order_info->EndTime->UnixTimestamp)?></td>
                                            </tr>
                                            <tr>
                                                <th class="text-center">IsTest</th>
                                                <td><?=$order_info->IsTest?></td>
                                            </tr>
                                            <tr>
                                                <th class="text-center">IsRefund</th>
                                                <td><?=$order_info->IsRefund?></td>
                                            </tr>
                                            <tr>
                                                <th class="text-center">RetailerCustomerID</th>
                                                <td><?=$order_info->RetailerCustomerID?></td>
                                            </tr>
                                            <tr>
                                                <th class="text-center">RetailerOrderID</th>
                                                <td><?=$order_info->RetailerOrderID?></td>
                                            </tr>
                                            <tr>
                                                <th class="text-center">CustomerProductID</th>
                                                <td><?=$order_info->Contents->OrderContent->CustomerProducts->CustomerProductID?></td>
                                            </tr>
                                            <tr>
                                                <th class="text-center">IsRefunded</th>
                                                <td><?=$order_info->Contents->OrderContent->IsRefunded?></td>
                                            </tr>
                                            <tr>
                                                <th class="text-center">ProductID</th>
                                                <td><?=$order_info->Contents->OrderContent->ProductID?></td>
                                            </tr>
                                            <tr>
                                                <th class="text-center">ProductPriceExVAT</th>
                                                <td>
                                                    <?=number_format((int)$order_info->Contents->OrderContent->ProductPriceExVAT->Value)?>
                                                    <?=$order_info->Contents->OrderContent->ProductPriceExVAT->Currency?>
                                                </td>
                                            </tr>
                                            <tr>
                                                <th class="text-center">ProductPriceIncVAT</th>
                                                <td>
                                                    <?=number_format((int)$order_info->Contents->OrderContent->ProductPriceIncVAT->Value)?>
                                                    <?=$order_info->Contents->OrderContent->ProductPriceIncVAT->Currency?>
                                                </td>
                                            </tr>
                                            <tr>
                                                <th class="text-center">VATPercent</th>
                                                <td><?=$order_info->Contents->OrderContent->VATPercent?></td>
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
                            <?=$ztorm_error?> : 주문 정보를 찾을 수 없습니다.
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