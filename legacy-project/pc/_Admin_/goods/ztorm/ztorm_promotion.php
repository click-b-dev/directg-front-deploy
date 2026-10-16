<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page_title = "Ztorm 프로모션 현황";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
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

	$orderby = "c.valid_from desc";

	$adminGoods= new AdminGoods($conn);

	$ztorm_promotion = $adminGoods->getZtormPromotion($page,$add_where,$orderby,$param);

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
									<li class="breadcrumb-item"><a href="javascript: void(0);">Ztorm API</a></li>
									<li class="breadcrumb-item active"><?=$page_title?></li>
								</ol>
							</div>
							<h4 class="page-title"><?=$page_title?></h4>
						</div>
					</div>
				</div>
				<!-- end page title -->

				<div class="row mb-2">
					<div class="col-12">
						<div class="float-start"><? echo number_format($ztorm_promotion->total_results)?> 개</div>

						<div class="float-end"><button type="button" class="btn btn-sm btn-primary shadow-none" id="btn_promotion_sync">Ztorm 캠페인 동기화</button></div>
					</div>
				</div>

				<div class="row">
					<div class="col-12">
						<table class="table table-centered w-100  nowrap table-sm table-bordered border-light" id="" cellpadding="0" cellpadding="0">
						<thead class="table-light font-13">
							<tr>
								<th class="text-center">옵션상품코드</th>
								<th class="text-center">옵션상품명</th>
								<th class="text-center">Item ID</th>
								<th class="text-center">Item Name</th>
								<th class="text-center">공급처</th>
								<th class="text-center">SRP</th>
								<th class="text-center">Discount</th>
								<th class="text-center">Discount SRP</th>
								<th class="text-center">시작일</th>
								<th class="text-center">종료일</th>
							</tr>
						</thead>
						<tbody class="font-12 bg-white">
							<?
							if($ztorm_promotion->success == true){
								$result = $ztorm_promotion->resultset->fetchAll();

								$num=0;

								foreach($result as $value){
							?>
							<tr>
								<td class="text-center"><?=$value['product_code']?></td>
								<td class="text-start"><?=$value['product_name']?></td>
								<td class="text-center"><?=$value['item_id']?></td>
								<td class="text-start"><?=$value['item_name']?></td>
								<td class="text-start"><?=$value['item_publisher']?></td>
								<td class="text-end"><?=number_format($value['product_srp'],0)?></td>
								<td class="text-center"><?=$value['percent']?>%</td>
								<td class="text-end"><?=number_format($value['product_srp']*(1-$value['percent']/100),0)?></td>
								<td class="text-center"><?=$value['promotion_start']?></td>
								<td class="text-center"><?=$value['promotion_end']?></td>
							</tr>
						<?
								}
							}
						?>
						</tbody>
						</table>
					</div>
					<!-- end col -->
					<div class="text-center mt-3"><?echo $ztorm_promotion->links_html;?></div>
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

<div id="ztorm-modal" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header modal-colored-header bg-primary">
				<h5 class="modal-title" id="topModalLabel">Ztorm 상품 등록</h5>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-hidden="true"></button>
			</div>
			<div class="modal-body">
				<form method="get" action="get_steam_game_info.php" class="ps-3 pe-3" class="form-horizontal">
					<div class="mb-2 row">
						<label for="zt_item_id" class="col-sm-3 col-form-label bg-light">ProductID</label>
						<div class="col-sm-9">
							<input type="text" id="zt_item_id" name="zt_item_id" class="form-control"  value="" required>
						</div>
					</div>

					<div class="mb-2 text-center">
						<button class="btn btn-primary shadow-none" type="button" id="btn_ztorm_register">Ztorm 상품 추가</button>
					</div>
				</form>
			</div>
		</div><!-- /.modal-content -->
	</div><!-- /.modal-dialog -->
</div><!-- /.modal -->

<script>
$(document).ready(function(){
	//Ztorm 프로모션 동기화
	$("#btn_promotion_sync").bind("click",function(){
		$.ajax({
			 type: "GET",
			 url: "ztorm_api.php",
			 data: {api_type:"promotion"},
			 success: function (data, status) {
				location.reload();

			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//RRP조회
	$(".btn_rrp_search").bind("click",function(){
		var index = $(".btn_rrp_search").index(this);
		var zt_item_id = $(".btn_rrp_search").eq(index).attr("data-itemid");
		$.ajax({
			 type: "GET",
			 url: "ztorm_api.php",
			 data: {api_type:"rrp_search",zt_item_id:zt_item_id},
			 success: function (data, status) {
				alert(data);
				location.reload();

			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//공급가조회
	$(".btn_ppr_search").bind("click",function(){
		var index = $(".btn_ppr_search").index(this);
		var zt_item_id = $(".btn_ppr_search").eq(index).attr("data-itemid");
		$.ajax({
			 type: "GET",
			 url: "ztorm_api.php",
			 data: {api_type:"ppr_search",zt_item_id:zt_item_id},
			 success: function (data, status) {
				alert(data);
				location.reload();

			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//Ztorm 상품등록
	$("#btn_ztorm_register").bind("click",function(){
		var zt_item_id = $("input[name='zt_item_id']").val();
		$.ajax({
			 type: "GET",
			 url: "ztorm_api.php",
			 data: {api_type:"product_add",zt_item_id:zt_item_id},
			 success: function (data, status) {
				alert(data);
				//alert("완료");
				location.reload();
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
