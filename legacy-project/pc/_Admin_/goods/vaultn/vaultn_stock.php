<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page_title = "Valutn 재고확인";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);

if($page==""){
	$page=1;
}

$vaultn = new Vaultn();
$result = $vaultn->runVaultnStock($page);
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
							<h4 class="page-title"><?=$page_title?></h4>
						</div>
					</div>
				</div>
				<!-- end page title -->

				<div class="row">
					<div class="col-12">
						<div>총: <?=number_format($result->recordCount)?></div>
						<div class="table-responsive">
							<table class="table table-centered w-100 table-sm table-bordered caption-top" id="">
								<thead class="table-dark font-13">
									<tr>
										<th class="text-center" >sku</th>
										<th class="text-center" style="">isKeyless</th>
										<th class="text-center" >title</th>
										<th class="text-center" >ownedUnits</th>
										<th class="text-center" style="">totalAvailableUnits</th>
										<th class="text-center" style="">connections</th>
									</tr>
								</thead>
								<tbody class="font-12">
							<?

								//print_r($result);
								//echo "<br/>";

								//print_r($sub_value->recordCount);
								//print_r($sub_value->pageIndex);
								//print_r($sub_value->pageSize);

								foreach($result->stockLevelInformation as $sub_value){
									//print_r($sub_value);
							?>
							<tr>
								<td><?=$sub_value->sku?></td>
								<td class="text-center"><?=$sub_value->isKeyless?></td>
								<td><?=$sub_value->title?></td>
								<td class="text-center"><?=$sub_value->ownedUnits?></td>
								<td class="text-end"><?=number_format($sub_value->totalAvailableUnits)?></td>
								<td>
								<?
									if(is_array($sub_value->connections)){

								?>
									<table class="table table-bordered table-sm">
										<thead class="table-light font-12">
										<tr>
											<th>connectionGuid</th>
											<th>connectionName</th>
											<th>reservedUnits</th>
											<th>networkUnits</th>
											<th>totalAvailableUnits</th>
										</tr>
										</thead>
										<tbody class="font-12">
									<?
											foreach($sub_value->connections as $connections){
									?>
										<tr>
											<td><?=$connections->connectionGuid?></td>
											<td class="text-center"><?=$connections->connectionName?></td>
											<td class="text-end"><?=number_format($connections->reservedUnits)?></td>
											<td class="text-end"><?=number_format($connections->networkUnits)?></td>
											<td class="text-end"><?=number_format($connections->totalAvailableUnits)?></td>
										</tr>
									<?
										}
									?>
										</tbody>
										</table>
									<?
									}
									?>
								</td>
							</tr>
							<?
								}
							?>
								</tbody>
							</table>
						</div>
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
