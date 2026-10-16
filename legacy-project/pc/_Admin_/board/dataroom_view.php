<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

use HTMLToMarkdown\HtmlConverter;

$topmenu['board'] = "active";
$page_title = "자료실 파일 상세보기";
$sidebar_file = "sidebar_board.php";

$mode = filter_input(INPUT_GET, 'mode', FILTER_SANITIZE_STRING);
$idx = filter_input(INPUT_GET, 'idx', FILTER_SANITIZE_STRING);

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

	$query="select * from tbl_dataroom where idx=:idx";
	$stmt = $conn->prepare($query);
	$params = array(
		":idx"=>$idx,
	);
	$stmt->execute($params);
	$data = $stmt->fetch();

	$parsedown= new Parsedown();
	$converter = new HtmlConverter();
}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}
?>
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php'); ?>
<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
<style>
#content img { width: 100%; }
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">게시판</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">자료실 관리</a></li>
									<li class="breadcrumb-item active"><?=$page_title?></li>
								</ol>
							</div>
							<h4 class="page-title"><?=$page_title?></h4>
						</div>
					</div>
				</div>
				<!-- end page title -->

				<div class="row">
					<div class="col-8">
						<table class="table table-bordered table-centered table-sm">
							<tbody class="bg-white font-14">
							<tr>
								<th class="bg-secondary text-white" scope="row" style="width:15%">파일유형</th>
								<td class=""><?=($data['file_type']=="P"?"한글패치":"컨텐츠")?></td>
							</tr>
							<tr>
								<th class="bg-secondary text-white" scope="row">제공 파일명</th>
								<td><?=$data['file_name']?></td>
							</tr>
							<tr>
								<th class="bg-secondary text-white" scope="row">제공 파일 URL</th>
								<td><?=$data['file_url']?></td>
							</tr>
							<tr>
								<th class="bg-secondary text-white" scope="row">설명</th>
								<td><?=str_replace("&#13;&#10;","<br/>",$parsedown->text($data['contents']))?></td>
							</tr>
							<tr>
								<th class="bg-secondary text-white" scope="row">암호화 여부</th>
								<td><?=$data['is_encode']?></td>
							</tr>
							<tr>
								<th class="bg-secondary text-white" scope="row">암호화 방식</th>
								<td><?=$data['encode_type']?></td>
							</tr>
							<tr>
								<th class="bg-secondary text-white" scope="row">제공조건</th>
								<td><?=$data['is_free']?></td>
							</tr>
							<tr>
								<th class="bg-secondary text-white" scope="row">배포일자</th>
								<td><?=$data['deploy_date']?></td>
							</tr>
							<tr>
								<th class="bg-secondary text-white" scope="row">썸네일</th>
								<td><img src="/upload/dataroom/<?=$data['thumbnail']?>"></td>
							</tr>
							</tbody>
						</table>
					</div>
					<div class="col-4">
						<?if($data['is_free']=="N"){?>
						<div class="card">
							<h5 class="card-header bg-secondary text-white">자료실 제공상품 설정</h5>
							<div class="card-body p-2">
								<div class="card mb-2">
									<?
										foreach($notice_product as $sub_value){
									?>
									<div class="row g-0 align-items-center border-bottom">
										<div class="col-md-4">
											<img src="/upload/apps/capsule/<?=$sub_value['steam_appid']?>/capsule_231x87.jpg" class="img-fluid" alt="...">
										</div>
										<div class="col-md-8">
											<div class="card-body p-1 ps-2">
												<div class="card-widgets">
													<button type="button" class="btn btn-sm btn_product_delete" data-goodsku="<?=$sub_value['goods_sku']?>"><i class="mdi mdi-close"></i></button>
												</div>
												<h5 class="card-title font-14 mb-0"><?=$sub_value['product_name']?></h5>
												<p class="card-text mb-0"><small class="text-muted"><?=$sub_value['product_name_en']?></small></p>
												<p class="card-text">
													<span class="badge bg-secondary font-12 fw-normal"><span class="eng"><?=$admin->getProductPlatform($sub_value['product_platform'])?></span></span>
													<span class="badge bg-dark font-12 fw-normal"><span class="num"><?=$sub_value['release_date']?></span></span>
													<span class="badge bg-secondary font-12 fw-normal"><span class="eng"><?=$admin->getPublisherName($sub_value['publisher_code'])?></span></span>
												</p>
											</div>
										</div>
									</div>
									<?
										}
									?>
								</div>
							</div>
							<div class="card-footer px-2">
								<div class="row g-2 mb-0">
									<div class="col-9">
										<input type="text" class="form-control form-control-sm" name="search_value" id="search_value" placeholder="검색할 옵션상품명을 입력해 주세요">
									</div>
									<div class="col-3">
										<button type="button" class="btn btn-dark btn-sm shadow-none" id="btn_goods_find" data-idx="<?=$idx?>">옵션상품 검색</button>
									</div>
								</div>
							</div>
						</div>
						<?}?>
						<div class="card">
							<h5 class="card-header bg-secondary text-white">수정이력</h5>
							<div class="card-body p-1">
								<table class="table table-bordered table-centered mb-0 table-sm">
									<thead class="font-14">
										<tr>
											<th class="text-center">수정일자</th>
											<th class="text-center">수정자</th>
										</tr>
									</thead>
									<tbody class="font-14">
										<tr>
											<td></td>
											<td></td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>

			</div><!-- /container-fluid -->
		</div><!-- /content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<!--옵션상품 검색 팝업-->
<div id="product-modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="product-modalLabel" aria-hidden="true">
	<div class="modal-dialog modal-lg" style="max-width:1000px">
		<div class="modal-content">
			<div class="modal-header modal-colored-header bg-primary">
				<h4 class="modal-title" id="bundle-modalLabel">옵션상품 검색결과</h4>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-hidden="true"></button>
			</div>
			<div class="modal-body p-0">
				<form class="form-horizontal">
					<input type="hidden" name="dataroom_idx" id="dataroom_idx" value="">
					<table class="table table-striped table-border mb-0 table-sm" id="title_info">
					<thead class="table-dark font-14">
					<tr>
						<th class="text-center" style="width:200px">옵션상품 sku</th>
						<th class="text-center" style="width:100px">옵션상품 유형</th>
						<th class="text-center" style="width:350px">옵션상품명<br/>(영문)</th>
						<th class="text-center" style="width:150px">퍼블리셔</th>
						<th class="text-center" style="width:100px">플랫폼</th>
						<th class="text-center" style="width:100px">비고</th>
					</tr>
					</thead>
					<tbody class="font-13">
					</tbody>
					</table>
				</form>
			</div>
		</div><!-- /.modal-content -->
	</div><!-- /.modal-dialog -->
</div><!-- /.modal -->

<script>
$(document).ready(function(){
	$("#btn_goods_find").bind("click",function(){
		var search_value = $("#search_value").val();
		var dataroom_idx = $('#btn_goods_find').attr("data-idx");
		if(search_value==""){
			alert("검색할 대표상품명을 입력해주세요.");
			return;
		}

		$.ajax({
			 type: "POST",
			 url: "dararoom_ps.php",
			 data: {mode:"product_search",search_value:search_value},
			 success: function (data, status) {
				$("#product-modal #title_info tbody").html(data);
				$("#product-modal").modal('show');
				$("#product-modal #dataroom_idx").val(dataroom_idx);
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	$(document).on('click', '#product-modal .btn_product_add', function(e){
		e.preventDefault();
		var index = $('.btn_product_add').index(this);
		var dataroom_idx = $("#product-modal #dataroom_idx").val();
		var goods_sku = $("#product-modal input[name='goods_sku[]']").eq(index).val();
		$.ajax({
			 type: "POST",
			 url: "dararoom_ps.php",
			 data: {mode:"product_add",dataroom_idx:dataroom_idx,goods_sku:goods_sku},
			 success: function (data, status) {
				$("#title-modal").modal('hide');
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
