<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['stock'] = "active";
$page_title = "공급처별 Asset현황";
$sidebar_file = "sidebar_stock.php";


try{
	$conn = new PDO($dsn, DB_USER, DB_PASSWORD);
	$admin = new Admin($conn);

	$asset_publisher_item = array();
	$asset_publisher       = $admin->getAssetCodeList('PUBL');
	$asset_type            = $admin->getAssetCodeList('ASTP');
	$asset_publisher_count = $admin->getAssetPublisherCount();

	foreach($asset_publisher as $value){
		$asset_publisher_item[$value['name']]['publisher_code'] = $value['code_id'];
		$asset_publisher_item[$value['name']]['publisher_name'] = $value['name'];
		$asset_publisher_item[$value['name']]['total'] = 0;
	}

	foreach($asset_publisher_count as $value){
		$asset_publisher_item[$value['publisher']]['publisher_name'] = $value['publisher'];
		$asset_type_count[$value['publisher']][$value['assetType']] = $value['cc'];
		$asset_publisher_item[$value['publisher']]['count'] = $asset_type_count[$value['publisher']];
		$asset_publisher_item[$value['publisher']]['total'] += $value['cc'];
	}
}catch(PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}

function DescSort($item1, $item2){
	if($item1['total'] == $item2['total']) return 0;
	return ($item1['total'] < $item2['total']) ? 1 : -1;
}
usort($asset_publisher_item, 'DescSort');
usort($asset_type, function($a, $b){ return strcmp($a['code_id'], $b['code_id']); });
?>
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php'); ?>
<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
<style>
table { width: 100%; }
table > thead > tr { background:#464e59; border: 0px solid #464e59; }
table > thead > tr > th { font-weight: 400; border: 1px solid #464e59; z-index:1000; background:#464e59; }
table > tbody > tr > td { text-align: center; border: 1px solid #464e59; background:#464e59; }
.table-bordered>:not(caption)>* { border-color:#464e59; border-width: 1px 0; }
.table-box { height: 700px; overflow: auto; }
.fixedHeader { position: sticky; top: -1px; }
</style>
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">재고관리</a></li>
									<li class="breadcrumb-item active"><?=$page_title?></li>
								</ol>
							</div>
							<h4 class="page-title"><?=$page_title?></h4>
						</div>
					</div>
				</div>
				<!-- end page title -->

				<div class="row">
					<div class="col-12 mb-2">
						총 <strong id="total" class="text-danger"><?=number_format(count($asset_publisher_item))?></strong> 개
					</div>
				</div>

				<div class="row">
					<div class="col-12">
						<div class="card">
							<div class="table-box-wrap">
								<div class="table-box">
									<table class="table table-sm table-centered table-bordered mb-0" id="table_list">
										<thead class="table-dark fixedHeader">
											<tr>
												<th class="text-center" rowspan="2" scope="col">번호</th>
												<th class="text-center" rowspan="2" scope="col">Asset <br/>공급처코드</th>
												<th class="text-center" rowspan="2" scope="col">Asset <br/>공급처명</th>
												<th class="text-center" colspan="10" scope="col">Asset 등록수량</th>
												<th class="text-center" rowspan="2" scope="col">합계</th>
											</tr>
											<tr>
												<?foreach($asset_type as $sub_value){?>
												<th class="text-center font-14" scope="col"><?=$sub_value['name']?></th>
												<?}?>
											</tr>
										</thead>
										<tbody>
										<?
											$num = 1;
											foreach($asset_publisher_item as $key => $value){
										?>
											<tr>
												<td class="text-center"><?=$num?></td>
												<td class="text-center"><?=$value['publisher_code']?></td>
												<td class="text-start"><?=$value['publisher_name']?></td>
												<?
													foreach($asset_type as $sub_key => $sub_value){
												?>
												<td class="text-end"><?=number_format($value['count'][$sub_value['name']])?></td>
												<?
														$total_asset_type[$sub_key] += $value['count'][$sub_value['name']];
													}
												?>
												<td class="text-end bg-light"><?=number_format($value['total'])?></td>
											</tr>
										<?
											$num++;
											$total += $value['total'];
										}
										?>
										</tbody>
										<tfoot class="table-light">
											<tr>
												<th colspan="3" class="text-center">합계</th>
												<th class="text-end"><?=number_format($total_asset_type['0'])?></th>
												<th class="text-end"><?=number_format($total_asset_type['1'])?></th>
												<th class="text-end"><?=number_format($total_asset_type['2'])?></th>
												<th class="text-end"><?=number_format($total_asset_type['3'])?></th>
												<th class="text-end"><?=number_format($total_asset_type['4'])?></th>
												<th class="text-end"><?=number_format($total_asset_type['5'])?></th>
												<th class="text-end"><?=number_format($total_asset_type['6'])?></th>
												<th class="text-end"><?=number_format($total_asset_type['7'])?></th>
												<th class="text-end"><?=number_format($total_asset_type['8'])?></th>
												<th class="text-end"><?=number_format($total_asset_type['9'])?></th>
												<th class="text-end"><?=number_format($total)?></th>
											</tr>
										</tfoot>
									</table>
								</div>
							</div>
						</div>
					</div>
				</div>

			</div><!-- /container-fluid -->
		</div><!-- /content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

</body>
</html>
