<?

$page_title = "심의정보 동기화";

header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$admin= new Admin($conn);

	//게등의 심의신청자 리스트
	$entname_list = $admin->getGRACEntnameList();

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
									<li class="breadcrumb-item"><a href="javascript: void(0);">상품관리</a></li>
									<li class="breadcrumb-item active">심의정보 동기화</li>
								</ol>
							</div>
							<h4 class="page-title">심의정보 동기화</h4>
						</div>
					</div>
				</div>
				<!-- end page title -->

				<div class="row">
					<div class="col-12">
						<div class="card">
							<div class="card-body">
								<div class="table-responsive">
									<table class="table table-centered w-100 nowrap table-sm table-bordered" id="">
										<thead class="table-light">
											<tr>
												<th class="text-center">번호</th>
												<th class="text-center">심의업체명</th>
												<th class="text-center">게임수</th>
												<th class="text-center">동기화일자</th>
												<th class="text-center" style="width: 250px;">비고</th>
											</tr>
										</thead>
										<tbody>
										<?
											$num=1;
											foreach($entname_list as $value){
										?>
											<tr>
												<td class="text-center"><?=$num?></td>
												<td><?=$value['entname']?></td>
												<td class="text-end"><?=$value['tcount']?></td>
												<td class="text-center"><?=$value['batch_date']?></td>
												<td class="text-center table-action"><button class="btn btn-sm btn-secondary btn_grac_batch" data-entname="<?=$value['entname']?>">심의정보 동기화</button></td>
											</tr>
											<?
													$num++;
												}
											?>
										</tbody>
									</table>
								</div>

								<div class="text-center mt-3"><?//echo $goods_special_list->links_html;?></div>
							</div> <!-- end card-body-->
						</div> <!-- end card-->
					</div> <!-- end col -->
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
<script>
$(document).ready(function(){
	$(".btn_grac_batch").bind("click",function(){
		var index = $(".btn_grac_batch").index(this);
		var entname = $(".btn_grac_batch").eq(index).attr("data-entname");
		$.ajax({
			 type: "POST",
			 url: "grac_ps.php",
			 data: {mode:"grac_batch",entname:entname},
			 success: function (data, status) {
				//location.href='ezwel_goods_list.php';
				location.reload();
				//alert(data);
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
