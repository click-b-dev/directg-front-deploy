<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page_title = "Genba 퍼블리셔 관리";

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$orderby = "ReleaseDate desc,DigitalReleaseDate desc";

	$adminGoods= new AdminGoods($conn);

	$genba_publisher = $adminGoods->getGenbaPublisherList();

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
									<li class="breadcrumb-item"><a href="javascript: void(0);">Genba 관리</a></li>
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
							<h5 class="card-header bg-secondary text-white">Genba 퍼블리셔 현황</h5>
							<div class="card-body p-0">
								<div class="table-responsive border border-1">
									<form>
									<table class="table table-centered w-100 nowrap table-sm table-bordered table-striped" id="">
										<thead class="table-light font-14">
											<tr>
												<th class="text-center">번호</th>
												<th class="text-center">Publisher</th>
												<th class="text-center">sku수</th>
												<th class="text-center">Status</th>
											</tr>
										</thead>
										<tbody class="font-12">
										<?
											$num=1;

											foreach($genba_publisher as $value){
										?>
											<tr>
												<td class="text-center"><?=$num?></td>
												<td class="text-start"><?=$value['publisher']?></td>
												<td class="text-end"><?=$value['cc']?></td>
												<td class="text-center">
													<input type="checkbox" class="is_status" id="publisher<?=$num?>" name="publisher" value="<?=$value['publisher']?>" data-switch="primary" <?=($value['status']=="Y")?"checked":""?>/>
													<label for="publisher<?=$num?>" data-on-label="Yes" data-off-label="No"></label>
												</td>
											</tr>
									<?		$num++;
												$total+=$value['cc'];
											}
										?>
										</tbody>
										<tfoot class="table-light">
										<tr>
											<th class="text-center" colspan="2">합계</th>
											<th class="text-end"><?=number_format($total)?></th>
											<th></th>
										</tr>
										</tfoot>
									</table>
									</form>
								</div>
							</div> <!-- end card-body-->
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

<script>
$(document).ready(function(){
	$('input[name="publisher"]').change(function() {
		var publisher = $(this).val();              // value
		var checked = $(this).prop('checked');  // checked 상태 (true, false)
		var $label = $(this).next();            // find a label element
		if(checked){
			var status = "Y";
		}else{
			var status = "N";
		}

		$.ajax({
			 type: "POST",
			 url: "genba_ps.php",
			 data: {mode:"publisher_config",publisher:publisher,status:status},
			 success: function (data, status) {
				alert(data);
				//location.reload();

			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
});
</script>
</body>
</html>
