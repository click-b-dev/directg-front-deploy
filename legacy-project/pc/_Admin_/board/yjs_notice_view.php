<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['board'] = "active";
$page_title = "공지사항 등록";
$sidebar_file = "sidebar_board.php";

$mode = filter_input(INPUT_GET, 'mode', FILTER_SANITIZE_STRING);
$idx = filter_input(INPUT_GET, 'idx', FILTER_SANITIZE_STRING);


try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);
	$admin= new Admin($conn);
	$parsedown= new Parsedown();

	$query="select * from tbl_notice where idx=:idx";
	$stmt = $conn->prepare($query);
	$params = array(
		":idx"=>$idx,
	);
	$stmt->execute($params);
	$data = $stmt->fetch();

	$product_query="select a.product_name,a.product_name_en,a.steam_appid,a.publisher_code,a.release_date,a.product_platform,a.goods_sku from tbl_goods_item a inner join tbl_notice_goods b on a.goods_sku=b.goods_sku where b.notice_idx=:notice_idx";
	$stmt = $conn->prepare($product_query);
	$params = array(
		":notice_idx"=>$idx,
	);
	$stmt->execute($params);
	$notice_product = $stmt->fetchAll();

}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}

$gubun_array = array(
	"1"=>"제품코드(키) 발송",
	"2"=>"프로모션/이벤트",
	"3"=>"상품 출시/판매",
	"4"=>"기타",
);
?>
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php'); ?>
<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
<style>
dt { font-weight: 500; }
label { font-weight: 500; }
blockquote { margin: 0 0 1rem; }
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">공시사항 관리</a></li>
									<li class="breadcrumb-item active">공지사항 미리보기</li>
								</ol>
							</div>
							<h4 class="page-title">공지사항 미리보기</h4>
						</div>
					</div>
				</div>
				<!-- end page title -->

				<div class="row">
					<div class="col-8">
						<table class="table table-bordered table-centered table-sm">
							<tbody class="bg-white font-14">
							<tr>
								<th class="table-active" scope="row">구분</th>
								<td class=""><?=$gubun_array[$data['notice_type']]?></td>
							</tr>
							<tr>
								<th class="table-active" scope="row">제목</th>
								<td><?=$data['subject']?></td>
							</tr>
							<tr>
								<th class="table-active" scope="row">내용</th>
								<td><div class="p-2" id="content"><?=str_replace("&#13;&#10;","<br/>",$parsedown->text(htmlspecialchars_decode($data['contents'],ENT_NOQUOTES)))?></div>
								<?=htmlspecialchars_decode($parsedown->text($data['contents']))?>
								</td>
							</tr>
							<tr>
								<th class="table-active w-20" scope="row" style="width:10%">고정 여부</th>
								<td><?=$data['is_notice']?></td>
							</tr>
							<tr>
								<th class="table-active" scope="row">작성일자</th>
								<td><?=$data['reg_date']?> (<?=$data['admin_id']?>)</td>
							</tr>
							<tr>
								<th class="table-active" scope="row">노출여부</th>
								<td><?=$data['is_view']?></td>
							</tr>
							<tr>
								<th class="table-active" scope="row">배포일자</th>
								<td><?=$data['deploy_date']?></td>
							</tr>
							</tbody>
						</table>
					</div>
				</div>

			</div><!-- /container-fluid -->
		</div><!-- /content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<!--타이틀 검색 팝업-->
<div id="product-modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="product-modalLabel" aria-hidden="true">
	<div class="modal-dialog modal-lg" style="max-width:1000px">
		<div class="modal-content">
			<div class="modal-header modal-colored-header bg-primary">
				<h4 class="modal-title" id="bundle-modalLabel">옵션상품 검색결과</h4>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-hidden="true"></button>
			</div>
			<div class="modal-body p-0">
				<form class="form-horizontal">
					<input type="hidden" name="notice_idx" id="notice_idx" value="">
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
		var notice_idx = $('#btn_goods_find').attr("data-idx");
		if(search_value==""){
			alert("검색할 대표상품명을 입력해주세요.");
			return;
		}

		$.ajax({
			 type: "POST",
			 url: "notice_ps.php",
			 data: {mode:"product_search",search_value:search_value},
			 success: function (data, status) {
				$("#product-modal #title_info tbody").html(data);
				$("#product-modal").modal('show');
				$("#product-modal #notice_idx").val(notice_idx);
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	$(document).on('click', '#product-modal .btn_product_add', function(e){
		e.preventDefault();
		var index = $('.btn_product_add').index(this);
		var notice_idx = $("#product-modal #notice_idx").val();
		var goods_sku = $("#product-modal input[name='goods_sku[]']").eq(index).val();
		$.ajax({
			 type: "POST",
			 url: "notice_ps.php",
			 data: {mode:"product_add",notice_idx:notice_idx,goods_sku:goods_sku},
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
