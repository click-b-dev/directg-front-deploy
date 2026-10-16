<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page_title = "Genba 프로모션 조회";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$promotion_status = filter_input(INPUT_GET, 'promotion_status', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
}

if(!$promotion_status){
	$promotion_status = "Scheduled";
}

$where = [];

switch($promotion_status){
	case "Scheduled": //진행예정
		$where[] = " fromDate>DATE_SUB(NOW(), INTERVAL 9 HOUR) and toDate>DATE_SUB(NOW(), INTERVAL 9 HOUR)";
		$results_per_page="50";
	break;
	case "Live": //진행중
		$where[] = " fromDate<=DATE_SUB(NOW(), INTERVAL 9 HOUR) and toDate>=DATE_SUB(NOW(), INTERVAL 9 HOUR)";
		$results_per_page="50";
	break;
	case "Completed": //종료
		$where[] = " fromDate<DATE_SUB(NOW(), INTERVAL 9 HOUR) and toDate<DATE_SUB(NOW(), INTERVAL 9 HOUR)";
		$results_per_page="20";
	break;
}

$param = "";

foreach($_GET as $key=>$value){
	if($key<>"page" ){
		if($value<>""){
			$param.="&".$key."=".$value;
		}
	}
}

$add_where = "";

foreach($where as $value){
	$add_where.= " and ".$value;
}

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$orderby = "fromDate asc,toDate asc,Name asc";

	$adminGoods= new AdminGoods($conn);

	$genba_promotion = $adminGoods->getGenbaPromotionSchedule($page,$add_where,$orderby,$param,$results_per_page);

	//print_r($genba_promotion);

}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}

$checked['promotion_status'][$promotion_status] = "checked";
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

				<div class="row g-0">
					<div class="card">
						<h5 class="card-header bg-secondary text-white">검색필터</h5>
						<div class="card-body">
							<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
								<div class="row g-2">
									<div class="col-8">
										<div class="row">
											<label for="promotion_status" class="col-3 col-form-label bg-light border">프로모션 상태</label>
											<div class="col-9">
												<div class="form-check form-check-inline mt-1">
													<input type="radio" id="promotion_status_1" name="promotion_status" class="form-check-input" value="Scheduled" <?=$checked['promotion_status']['Scheduled']?>>
													<label class="form-check-label" for="promotion_status_1">진행예정</label>
												</div>
												<div class="form-check form-check-inline mt-1">
													<input type="radio" id="promotion_status_2" name="promotion_status" class="form-check-input" value="Live" <?=$checked['promotion_status']['Live']?>>
													<label class="form-check-label" for="promotion_status_2">진행중</label>
												</div>
												<div class="form-check form-check-inline mt-1">
													<input type="radio" id="promotion_status_3" name="promotion_status" class="form-check-input" value="Completed" <?=$checked['promotion_status']['Completed']?>>
													<label class="form-check-label" for="promotion_status_3">종료</label>
												</div>
											</div>
										</div>
									</div>
									<div class="col-4">
										<div class="float-end">
											<button type="submit" class="btn btn-primary shadow-none">Genba 프로모션 검색</button>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>

				<div class="row mb-2">
					<div class="col-12">
						<div class="float-start"><? echo number_format($genba_promotion->total_results)?> 개</div>

						<div class="float-end">
							<button type="button" class="btn btn-info btn-sm shadow-none" id="btn_genba_promotion_sync">Genba 프로모션 동기화</button>
							<button type="button" class="btn btn-warning btn-sm shadow-none" id="btn_genba_promotion_sync_reset">처음부터 동기화</button>
							<button type="button" class="btn btn-success btn-sm shadow-none" id="btn_genba_promotion_download">Genba 프로모션 다운로드</button>
						</div>
					</div>
				</div>

				<form id="downloadFrm" name="downloadFrm" method="post" action="genba_ps.php" target="_blank">
					<input type="hidden" name="mode" value="download">
				</form>

				<div class="row">
					<div class="col-12">
						<div class="card">
							<h5 class="card-header bg-secondary text-white">Genba 프로모션 일정</h5>
							<div class="card-body p-0">
								<div class="table-responsive">
									<table class="table table-centered w-100 nowrap table-sm table-bordered" id="">
										<thead class="table-light font-13">
											<tr>
												<th class="text-center">번호</th>
												<th class="text-center">Promotion ID</th>
												<th class="text-center">Promotion Name</th>
												<th class="text-center">From</th>
												<th class="text-center">To</th>
												<th class="text-center">Products</th>
											</tr>
										</thead>
										<tbody class="font-12">
										<?
										if($genba_promotion->success == true){
											$result = $genba_promotion->resultset->fetchAll();

											$num=1;

											foreach($result as $value){
										?>
											<tr>
												<td class="text-center"><?=$num+($page-1)*$results_per_page?></td>
												<td class="text-center"><?=$value['PromotionId']?></td>
												<td class="text-start"><?=$value['Name']?></td>
												<td class="text-center"><?=date("Y-m-d H:i:s",strtotime('+9 hours',strtotime($value['fromDate'])))?></td>
												<td class="text-center"><?=date("Y-m-d H:i:s",strtotime('+9 hours',strtotime($value['toDate'])))?></td>
												<td class="text-center"><?=$value['cc']?></td>
											</tr>
									<?		$num++;
											}
										}
										?>
										</tbody>
									</table>
								</div>

								<div class="text-center mt-3"><?echo $genba_promotion->links_html;?></div>
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
	function genbaPromotionSync(reset){
		var data = {api_type:"promotion"};
		if(reset){ data.reset = "1"; }
		LoadingOverlay("show");
		$.ajax({
			 type: "GET",
			 url: "genba_api.php",
			 data: data,
			 success: function (data, status) {
				alert(data);
				location.reload();

			 },
			error: function(data){
				 alert(data);
			 },
			complete: function(){ LoadingOverlay("hide"); }
		});
	}
	$("#btn_genba_promotion_sync").bind("click",function(){
		genbaPromotionSync(false);
	});
	$("#btn_genba_promotion_sync_reset").bind("click",function(){
		if(confirm("처음부터 다시 동기화하시겠습니까? (1페이지부터)")){
			genbaPromotionSync(true);
		}
	});
	$("#btn_genba_promotion_download").bind("click",function(){
		$("#downloadFrm").submit();
	});
});
</script>
</body>
</html>
