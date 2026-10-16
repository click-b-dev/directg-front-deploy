<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page_title = "Valutn 프로모션 현황";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
}

$where = [];

foreach($_GET as $key=>$value){
	if($key<>"page" ){
		if($value<>""){
			$param.="&".$key."=".$value;
		}
	}
}

//$where[] = " find_in_set(status,'0,1,9')";

$add_where = "";

foreach($where as $value){
	$add_where.= " and ".$value;
}


try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

	$orderby = "validFrom desc,validTo desc";

	$adminGoods= new AdminGoods($conn);

	$vaultn_promotion = $adminGoods->getVaultnPromotionList($page,$add_where,$orderby,$param);


}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}
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
						<div class="d-flex flex-row justify-content-between mb-2">
							<div class="float-start"><? echo number_format($vaultn_promotion->total_results)?> 개</div>
						</div>
						<div class="card">
							<h5 class="card-header bg-secondary text-white">Vaultn Product</h5>
								<div class="table-responsive">
									<table class="table table-centered w-100 dt-responsive nowrap table-sm table-bordered" id="">
										<thead class="table-light font-13">
											<tr>
												<th class="text-center">No</th>
												<th class="text-center">promotion name</th>
												<th class="text-center">validFrom</th>
												<th class="text-center">validTo</th>
												<th class="text-center">product<br/>(sku)</th>
												<th class="text-center">discountPercentage</th>
												<th class="text-center">discountSrp<br/>(Srp)</th>
												<th class="text-center">discountPurchasePrice<br/>(purchasePrice)</th>
												<th class="text-center">비고</th>
											</tr>
										</thead>
										<tbody class="font-12">
										<?
										if($vaultn_promotion->success == true){
											$result = $vaultn_promotion->resultset->fetchAll();

											$num =0;
											foreach($result as $value){
										?>
											<tr>
												<td class="text-center"><?=$vaultn_promotion->total_results-($num+($page-1)*30)?></td>
												<td><?=$value['title']?></td>
												<td class="text-center"><?=$value['validFrom']?></td>
												<td class="text-center"><?=$value['validTo']?></td>
												<td class="text-start"><?=$value['product_name']?><br/>(<?=$value['sku']?>)</td>
												<td class="text-center"><?=$value['discountPercentage']?></td>
												<td class="text-end"><?=number_format($value['srp']*(1-$value['discountPercentage']/100))?><br/>(<?=number_format($value['srp'])?>)</td>
												<td class="text-end"><?=number_format($value['purchasePrice']*(1-$value['discountPercentage']/100),2)?><br/>(<?=number_format($value['purchasePrice'],2)?>)</td>
												<td class="text-center"><?=$value['reg_date']?><br/>(<?=$value['update_date']?>)</td>
											</tr>
											<?
														$num++;
													}
												}
											?>
										</tbody>
									</table>
								</div>

								<div class="text-center mt-3"><?echo $vaultn_promotion->links_html;?></div>
						</div> <!-- end card-->
					</div> <!-- end col -->
				</div>
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
