<?
$sidebar_file = "sidebar_promotion.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['promotion'] = "active";

$page_title= "주말특가 프로모션 등록";


$mode = filter_input(INPUT_GET, 'mode', FILTER_SANITIZE_STRING);
$idx = filter_input(INPUT_GET, 'idx', FILTER_SANITIZE_STRING);

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

	if($idx>0){
		$query="select * from tbl_promotion_weekend where idx=:idx";
		$stmt = $conn->prepare($query);
		$params = array(
			":idx"=>$idx,
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		$promotion_week_start = date('Y-m-d H:i:s',$data['promotion_week_start']);
		$promotion_week_end = date('Y-m-d H:i:s',$data['promotion_week_end']);
		
		$promotion_recommand_goods = explode("|",$data['promotion_week_recommand']);
		$promotion_best_goods = explode("|",$data['promotion_week_best']);
		
		$checked['is_view'][$data['is_view']] = "checked";

		$mode = "modify";
	}else{
		$mode = "register";
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">프로모션</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">주말특가 프로모션 관리</a></li>
									<li class="breadcrumb-item active">주말특가 프로모션 등록</li>
								</ol>
							</div>
							<h4 class="page-title">주말특가 프로모션 등록</h4>
						</div>
					</div>
				</div>     
				<!-- end page title --> 

				
				<div class="row">
					<div class="col-9">
						<form id="frm" name="frm" method="post" action="promotion_weekend_ps.php" class="form-horizontal">
							<input type="hidden" name="mode" value="<?=$mode?>">
							<input type="hidden" name="idx" value="<?=$idx?>">
							<div class="card">
								<div class="card-body">
									<div class="mb-2 row">
										<label for="promotion_week_name" class="col-sm-2 col-form-label bg-secondary text-white">* 주말 프로모션 이름</label>
										<div class="col-sm-10">
											<input type="text" class="form-control" id="promotion_week_name" name="promotion_week_name" placeholder="" value="<?=$data['promotion_week_name']?>" required>
										</div>
									</div>
									
									<div class="mb-2 row">
										<label for="promotion_week_date" class="col-sm-2 col-form-label bg-secondary text-white">* 주말 프로모션 기간</label>
										<div class="col-sm-6">
											<div class="input-group">
												<input type="text" class="form-control form-control-sm" id="promotion_week_start" name="promotion_week_start" placeholder="주말 프로모션 시작일" value="<?=$promotion_week_start?>" data-toggle="input-mask" data-mask-format="0000-00-00 00:00:00" required>
												<span class="input-group-text">~</span>
												<input type="text" class="form-control form-control-sm" id="promotion_week_end" name="promotion_week_end" data-toggle="input-mask" data-mask-format="0000-00-00 00:00:00" placeholder="주말 프로모션 종료일" value="<?=$promotion_week_end?>" required>
											</div>
										</div>
									</div>

									<div class="mb-2 row">
										<label for="promotion_week_banner_link" class="col-sm-2 col-form-label bg-secondary text-white">* 배너 링크 URL</label>
										<div class="col-sm-10">
											<input type="text" class="form-control" id="promotion_week_banner_link" name="promotion_week_banner_link" placeholder="" value="<?=$data['promotion_week_banner_link']?>" required>
										</div>
									</div>
									
									<div class="mb-2 row">
										<label for="promotion_week_banner_mobile" class="col-sm-2 col-form-label bg-secondary text-white">* 추천게임</label>
										<div class="col-sm-10">
											<div class="row g-3">
												<div class="col-md-3 text-center">
													<label for="promotion_week_recommand_1" class="form-label">추천게임 1</label>
													<input type="text" class="form-control" id="promotion_week_recommand_1" name="promotion_week_recommand_1" value="<?=$promotion_recommand_goods['0']?>" required>
												</div>
												<div class="col-md-3 text-center">
													<label for="promotion_week_recommand_2" class="form-label">추천게임 2</label>
													<input type="text" class="form-control" id="promotion_week_recommand_2" name="promotion_week_recommand_2" value="<?=$promotion_recommand_goods['1']?>" required>
												</div>
												<div class="col-md-3 text-center">
													<label for="promotion_week_recommand_3" class="form-label">추천게임 3</label>
													<input type="text" class="form-control" id="promotion_week_recommand_3" name="promotion_week_recommand_3" value="<?=$promotion_recommand_goods['2']?>" required>
												</div>
												<div class="col-md-3 text-center">
													<label for="promotion_week_recommand_4" class="form-label">추천게임 4</label>
													<input type="text" class="form-control" id="promotion_week_recommand_4" name="promotion_week_recommand_4" value="<?=$promotion_recommand_goods['3']?>" required>
												</div>
											</div>
										</div>
									</div>
									
									<div class="mb-2 row">
										<label for="promotion_week_banner_mobile" class="col-sm-2 col-form-label bg-secondary text-white align-middle">* 인기게임</label>
										<div class="col-sm-10">
											<div class="row g-3">
												<div class="col-md-2 text-center">
													<label for="promotion_week_best_1" class="form-label">인기게임 1</label>
													<input type="text" class="form-control" id="promotion_week_best_1" name="promotion_week_best_1" value="<?=$promotion_best_goods['0']?>" required>
												</div>
												<div class="col-md-2 text-center">
													<label for="promotion_week_best_2" class="form-label">인기게임 2</label>
													<input type="text" class="form-control" id="promotion_week_best_2" name="promotion_week_best_2" value="<?=$promotion_best_goods['1']?>" required>
												</div>
												<div class="col-md-2 text-center">
													<label for="promotion_week_best_3" class="form-label">인기게임 3</label>
													<input type="text" class="form-control" id="promotion_week_best_3" name="promotion_week_best_3" value="<?=$promotion_best_goods['2']?>" required>
												</div>
												<div class="col-md-2 text-center">
													<label for="promotion_week_best_4" class="form-label">인기게임 4</label>
													<input type="text" class="form-control" id="promotion_week_best_4" name="promotion_week_best_4" value="<?=$promotion_best_goods['3']?>" required>
												</div>
												<div class="col-md-2 text-center">
													<label for="promotion_week_best_5" class="form-label">인기게임 5</label>
													<input type="text" class="form-control" id="promotion_week_best_5" name="promotion_week_best_5" value="<?=$promotion_best_goods['4']?>" required>
												</div>
											</div>
											<div class="row g-3">
												<div class="col-md-2 text-center">
													<label for="promotion_week_best_6" class="form-label ">인기게임 6</label>
													<input type="text" class="form-control" id="promotion_week_best_6" name="promotion_week_best_6" value="<?=$promotion_best_goods['5']?>" required>
												</div>
												<div class="col-md-2 text-center">
													<label for="promotion_week_best_7" class="form-label">인기게임 7</label>
													<input type="text" class="form-control" id="promotion_week_best_7" name="promotion_week_best_7" value="<?=$promotion_best_goods['6']?>" required>
												</div>
												<div class="col-md-2 text-center">
													<label for="promotion_week_best_8" class="form-label">인기게임 8</label>
													<input type="text" class="form-control" id="promotion_week_best_8" name="promotion_week_best_8" value="<?=$promotion_best_goods['7']?>" required>
												</div>
												<div class="col-md-2 text-center">
													<label for="promotion_week_best_9" class="form-label">인기게임 9</label>
													<input type="text" class="form-control" id="promotion_week_best_9" name="promotion_week_best_9" value="<?=$promotion_best_goods['8']?>" required>
												</div>
												<div class="col-md-2 text-center">
													<label for="promotion_week_best_10" class="form-label">인기게임 10</label>
													<input type="text" class="form-control" id="promotion_week_best_10" name="promotion_week_best_10" value="<?=$promotion_best_goods['9']?>" required>
												</div>
											</div>
										</div>
									</div>
									
									<div class="mb-2 row">
										<label for="event_link" class="col-sm-2 col-form-label bg-secondary text-white">* 주말 프로모션 URL</label>
										<div class="col-sm-10">
											<span class="form-control-plaintext">/promotion/promotion_weekend.html</span>
										</div>
									</div>
									
									<div class="mb-2 row">
										<label for="is_view" class="col-sm-2 col-form-label bg-secondary text-white">* 주말 프로모션 노출여부</label>
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
											<button type="submit" class="btn btn-primary shadow-none">주말 프로모션 저장</button>
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
