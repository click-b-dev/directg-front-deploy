<?
$sidebar_file = "sidebar_site.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['site'] = "active";

$page_title= "추천 및 특집 수정";


$mode = filter_input(INPUT_GET, 'mode', FILTER_SANITIZE_STRING);
$idx = filter_input(INPUT_GET, 'idx', FILTER_SANITIZE_STRING);

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

	if($idx>0){
		$query="select * from tbl_main_recommand where idx=:idx";
		$stmt = $conn->prepare($query);
		$params = array(
			":idx"=>$idx,
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		$recommand_start = date('Y-m-d H:i:s',$data['recommand_start']);
		$recommand_end = date('Y-m-d H:i:s',$data['recommand_end']);
		
		$recommand_goods_1 = $data['recommand_goods_1'];
		$recommand_goods_2 = $data['recommand_goods_2'];
		$recommand_goods_3 = $data['recommand_goods_3'];
		$recommand_goods_4 = $data['recommand_goods_4'];
		
		$checked['is_view'][$data['is_view']] = "checked";
		$selected['recommand_banner_target'][$data['recommand_banner_target']] = "selected";

		$mode = "modify";
	}
	
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
<!-- Start Content-->
			<div class="container-fluid">
				<!-- start page title -->
				<div class="row">
					<div class="col-12">
						<div class="page-title-box">
							<div class="page-title-right">
								<ol class="breadcrumb m-0">
									<li class="breadcrumb-item"><a href="javascript: void(0);">홈</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">사이트</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">추천 및 특집 관리</a></li>
									<li class="breadcrumb-item active">추천 및 특집 수정</li>
								</ol>
							</div>
							<h4 class="page-title">추천 및 특집 수정</h4>
						</div>
					</div>
				</div>     
				<!-- end page title --> 

				
				<div class="row">
					<div class="col-9">
						<form id="frm" name="frm" method="post" action="main_recommand_ps.php" class="form-horizontal">
							<input type="hidden" name="mode" value="<?=$mode?>">
							<input type="hidden" name="idx" value="<?=$idx?>">
							<div class="card">
								<div class="card-body">
									<div class="mb-2 row">
										<label for="recommand_name" class="col-sm-2 col-form-label bg-secondary text-white">* 추천 및 특집 제목</label>
										<div class="col-sm-10">
											<input type="text" class="form-control" id="recommand_name" name="recommand_name" placeholder="" value="<?=$data['recommand_name']?>" required>
										</div>
									</div>
									
									<div class="mb-2 row">
										<label for="recommand_date" class="col-sm-2 col-form-label bg-secondary text-white">* 추천 및 특집 기간</label>
										<div class="col-sm-6">
											<div class="input-group">
												<input type="text" class="form-control form-control-sm" id="recommand_start" name="recommand_start" placeholder="추천 및 특집 시작일" value="<?=$recommand_start?>" data-toggle="input-mask" data-mask-format="0000-00-00 00:00:00" required>
												<span class="input-group-text">~</span>
												<input type="text" class="form-control form-control-sm" id="recommand_end" name="recommand_end" data-toggle="input-mask" data-mask-format="0000-00-00 00:00:00" placeholder="추천 및 특집 종료일" value="<?=$recommand_end?>" required>
											</div>
										</div>
									</div>
									
									<div class="mb-2 row">
										<label for="recommand_banner" class="col-sm-2 col-form-label bg-secondary text-white">* 추천 및 특집 배너</label>
										<div class="col-sm-10">
											<input type="text" class="form-control" id="recommand_banner" name="recommand_banner" placeholder="디스크엔 URL" value="<?=$data['recommand_banner']?>" required>
										</div>
									</div>

									<div class="mb-2 row">
										<label for="recommand_banner_link" class="col-sm-2 col-form-label bg-secondary text-white">* 추천 및 특집 링크 URL</label>
										<div class="col-sm-10">
											<div class="row">
												<div class="input-group">
													<div class="col-sm-10">
														<input type="text" id="recommand_banner_link" name="recommand_banner_link" class="form-control" value="<?=$data['recommand_banner_link']?>" placeholder="추천 및 특집 배너 링크 URL" required="">
													</div>
													<div class="col-sm-2">
														<select id="recommand_banner_target" name="recommand_banner_target" class="form-select" required="">
															<option value="">:::타겟선택:::</option>
															<option value="_self" <?=$selected['recommand_banner_target']['_self']?>>현재창</option>
															<option value="_blank" <?=$selected['recommand_banner_target']['_blank']?>>새창</option>
														</select>
													</div>
												</div>
											</div>
										</div>
									</div>
									
									<div class="mb-2 row">
										<label for="recommand_goods" class="col-sm-2 col-form-label bg-secondary text-white">* 추천 및 특집 상품</label>
										<div class="col-sm-10">
											<div class="row g-3">
												<div class="col-md-3 text-center">
													<label for="recommand_goods_1" class="form-label">상품 1</label>
													<input type="text" class="form-control" id="recommand_goods_1" name="recommand_goods_1" value="<?=$recommand_goods_1?>" required>
												</div>
												<div class="col-md-3 text-center">
													<label for="recommand_goods_2" class="form-label">상품 2</label>
													<input type="text" class="form-control" id="recommand_goods_2" name="recommand_goods_2" value="<?=$recommand_goods_2?>" required>
												</div>
												<div class="col-md-3 text-center">
													<label for="recommand_goods_3" class="form-label">상품 3</label>
													<input type="text" class="form-control" id="recommand_goods_3" name="recommand_goods_3" value="<?=$recommand_goods_3?>" required>
												</div>
												<div class="col-md-3 text-center">
													<label for="recommand_goods_4" class="form-label">상품 4</label>
													<input type="text" class="form-control" id="recommand_goods_4" name="recommand_goods_4" value="<?=$recommand_goods_4?>" required>
												</div>
											</div>
										</div>
									</div>
									
									<div class="mb-2 row">
										<label for="is_view" class="col-sm-2 col-form-label bg-secondary text-white">* 추천 및 특집 노출여부</label>
										<div class="col-sm-10 border p-2">
											<div class="form-check form-check-inline">
												<input type="radio" id="is_view_y" name="is_view" class="form-check-input" value="Y" <?=$checked['is_view']['Y']?>>
												<label class="form-check-label" for="is_view_y">예</label>
											</div>
											<div class="form-check form-check-inline">
												<input type="radio" id="is_view_n" name="is_view" class="form-check-input" value="N" <?=$checked['is_view']['N']?>>
												<label class="form-check-label" for="is_view_n">아니오</label>
											</div>
										</div>
									</div>

									<div class="mb-2 row">
										<div class="text-end">
											<button type="submit" class="btn btn-primary shadow-none">추천 및 특집 저장</button>
										</div>
									</div>

								</div>
							</div>
						</form>
					</div>
				</div>

			</div> <!-- container -->
		</div> <!-- content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>

$(document).ready(function(){
	$("#frm").submit(function( event ) {

	/* var new_form = $('<form></form>');
        new_form.attr("name", "test_form");
        new_form.attr("method", "post");
        new_form.attr("action", "goods_ps.php");
        new_form.attr("target", "_blank");
        new_form.append($('<input/>', {type: 'hidden', name: 'simplemde', value:simplemde1.value()}));
        new_form.appendTo('body');
        new_form.submit();
	 return false;
	 */
	});
});

</script>
</body>
</html>
