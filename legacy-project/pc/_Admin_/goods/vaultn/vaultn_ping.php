<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page_title = "Vaultn 연결 확인";

$vaultn = new Vaultn();
?>
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php'); ?>
<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">상품</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">Vaultn 관리</a></li>
									<li class="breadcrumb-item active"><?=$page_title?></li>
								</ol>
							</div>
							<h4 class="page-title"><?=$page_title?></h4>
						</div>
					</div>
				</div>
				<!-- end page title -->

				<div class="row">
					<div class="col-12">
						<div class="card">
							<div class="card-body">
							<?

								$result = $vaultn->runVaultnPingPost();
								print_r($result);
/*
			$ip = get_client_ip_env();
			$sku = "FUNC-GA-STE-DUNEAWAKEN-STA-FASIX";
			$price = "45800";
			$ordno="P1755595481_1";
			$m_no="121876";

			$params = array(
				"sku"=>$sku,
				"ipAddress"=>$ip,
				"salesPriceGross"=>$price,
				"clientOrderReference"=>$ordno,
				"clientCustomerReference"=>$m_no,
			);
								?>

								<?php
print_r($params);
$aa=json_encode($params);
print_r($aa);

$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$order = new Order($conn);
$order_item = $order->getOrderItem("P1755597586");
$sub_value['item_id']="FUNC-GA-STE-DUNEAWAKEN-STA-FASIX";

foreach($order_item as $value){
	$params = array(
		"sku"=>$sub_value['item_id'],
		"ipAddress"=>$ip,
		"salesPriceGross"=>$value['price'],
		"clientOrderReference"=>$value['ordno'],
		"clientCustomerReference"=>(string)$value['m_no'],
	);
	$aa=json_encode($params);
echo "<Br>";
echo "<Br>";
	print_r($aa);
}
*/
?>
							</div>
							<!-- end card-body-->
						</div>
						<!-- end card-->
					</div>
					<!-- end col -->
				</div>
				<!-- end row -->
			</div>
			<!-- /container-fluid -->
		</div>
		<!-- /content -->
	</div>
	<!-- /content-page -->
</div>
<!-- /wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>
</body>
</html>
