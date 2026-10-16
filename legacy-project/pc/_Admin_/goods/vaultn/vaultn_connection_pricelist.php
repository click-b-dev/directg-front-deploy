<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page_title = "Valutn 프로모션 현황";

error_reporting(E_ALL & ~E_DEPRECATED & ~E_STRICT & ~E_NOTICE);
header('Content-Type: text/html; charset=UTF-8');

$connectionGuid = filter_input(INPUT_GET, 'connectionGuid', FILTER_SANITIZE_STRING);

$vaultn = new Vaultn();
$result = $vaultn->runConnectionPriceList($connectionGuid);

print_r($result);
exit;
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
							<h4 class="page-title">ConnectionPromotion</h4>
						</div>
					</div>
				</div>
				<!-- end page title -->

				<div class="row">
					<div class="col-12">
						<div class="card">
							<div class="card-body">
								<table class="table table-bordered table-sm">
									<thead class="table-light font-12">
									<tr>
										<th class="text-center">guid</th>
										<th class="text-center">title</th>
										<th class="text-center">validFrom</th>
										<th class="text-center">validTo</th>
										<th class="text-center">동기화</th>
									</tr>
									</thead>
									<tbody class="font-12">
									<?
										foreach($result as $value){
										//	if(strpos($value->title, "H2") !== false || $connectionGuid=="7502c959-8306-43e3-be24-62d1c612435d"){
									?>
									<tr>
										<td class="text-center"><a href="vaultn_connection_promotion_view.php?connectionGuid=<?=$connectionGuid?>&promotionGuid=<?=$value->guid?>"><?=$value->guid?></a></td>
										<td><?=$value->title?></td>
										<td class="text-center"><?=date("Y-m-d H:i:s",strtotime('+9 hours',strtotime($value->validFrom)))?></td>
										<td class="text-center"><?=date("Y-m-d H:i:s",strtotime('+9 hours',strtotime($value->validTo)))?></td>
										<td class="text-center"><button class='btn btn-outline-secondary btn-sm btn_vaultn_sync' data-connectionGuid='<?=$connectionGuid?>' data-promotionGuid='<?=$value->guid?>'>동기화</button></td>
									</tr>
									<?
										//	}
										}
									?>
									</tbody>
								</table>
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
