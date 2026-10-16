<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page_title = "Valutn 상품 조회";



$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$connectionGuid = filter_input(INPUT_GET, 'connectionGuid', FILTER_SANITIZE_STRING);
$productGUID = filter_input(INPUT_GET, 'productGUID', FILTER_SANITIZE_STRING);

if($page==""){
	$page=1;
}

$vaultn = new Vaultn();
$result = $vaultn->runProductRetrieveAll($productGUID,$page);

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
									<li class="breadcrumb-item"><a href="javascript: void(0);">Valutn 관리</a></li>
									<li class="breadcrumb-item active"><?=$page_title?></li>
								</ol>
							</div>
							<h4 class="page-title">ConnectionProduct (Retrieve all products by connection)</h4>
						</div>
					</div>
				</div>
				<!-- end page title -->
				<?
					print_r($result);
				?>
				<div class="row">
					<div class="col-12">
						<table class="table table-centered w-100 table-sm table-bordered caption-top" id="">
							<colgroup>
								<col width="20%"/>
								<col width="*"/>
							</colgroup>
							<tbody>
							<?
								foreach($result->products as $value){
									foreach($value->productCoreAttributes as $sub_key=>$sub_value){
							?>
								<tr>
									<th class="table-light text-center"><?=$sub_key?></th>
									<td class="text-start font-12"><?=$sub_value?></td>
								</tr>
							<?
									}
									foreach($value->productTypeAttributes as $sub_key=>$sub_value){
							?>
								<tr>
									<th class="table-light text-center"><?=$sub_key?></th>
									<td class="text-start font-12"><? print_r($sub_value)?></td>
								</tr>
							<?
									}

									foreach($value->skus as $sub_key=>$sub_value){
							?>
								<tr>
									<th class="table-light text-center"><?=$sub_key?></th>
									<td class="text-start font-12"><? print_r($sub_value)?></td>
								</tr>
							<?
									}

									foreach($value->assets as $sub_key=>$sub_value){
							?>
								<tr>
									<th class="table-light text-center"><?=$sub_key?></th>
									<td class="text-start font-12"><? print_r($sub_value)?></td>
								</tr>
							<?
									}
								}
							?>
							</tbody>
						</table>
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
