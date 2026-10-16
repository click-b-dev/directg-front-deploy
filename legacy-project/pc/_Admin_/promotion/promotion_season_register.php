<?
$sidebar_file = "sidebar_promotion.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['promotion'] = "active";


$mode = filter_input(INPUT_GET, 'mode', FILTER_SANITIZE_STRING);
$idx = filter_input(INPUT_GET, 'idx', FILTER_SANITIZE_STRING);

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

	if($idx>0){
		$page_title= "대규모 프로모션 수정";
		
		$query="select * from tbl_promotion_season where idx=:idx";
		$stmt = $conn->prepare($query);
		$params = array(
			":idx"=>$idx,
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		$promotion_season_start = date('Y-m-d H:i:s',$data['promotion_season_start']);
		$promotion_season_end = date('Y-m-d H:i:s',$data['promotion_season_end']);
		
		$promotion_recommand_goods = explode("|",$data['promotion_season_recommand']);
		$promotion_best_goods = explode("|",$data['promotion_season_best']);
		$promotion_max_discount_goods = explode("|",$data['promotion_max_discount']);
		$promotion_price_5000_goods = explode("|",$data['promotion_price_5000']);
		$promotion_price_10000_goods = explode("|",$data['promotion_price_10000']);
		$promotion_add_repay_goods = explode("|",$data['promotion_add_repay']);
		
		$checked['is_view'][$data['is_view']] = "checked";
		$checked['notice_view'][$data['notice_view']] = "checked";

		$mode = "modify";
	}else{
		$page_title= "대규모 프로모션 등록";
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">대규모 프로모션 관리</a></li>
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
						<form id="frm" name="frm" method="post" action="promotion_season_ps.php" class="form-horizontal">
							<input type="hidden" name="mode" value="<?=$mode?>">
							<input type="hidden" name="idx" value="<?=$idx?>">
							<div class="card">
								<div class="card-body">
									<div class="mb-2 row">
										<label for="promotion_season_name" class="col-sm-2 col-form-label bg-secondary text-white">* 대규모 프로모션 이름</label>
										<div class="col-sm-10">
											<input type="text" class="form-control" id="promotion_season_name" name="promotion_season_name" placeholder="" value="<?=$data['promotion_season_name']?>" required>
										</div>
									</div>
									
									<div class="mb-2 row">
										<label for="promotion_season_date" class="col-sm-2 col-form-label bg-secondary text-white">* 대규모 프로모션 기간</label>
										<div class="col-sm-6">
											<div class="input-group">
												<input type="text" class="form-control form-control-sm" id="promotion_season_start" name="promotion_season_start" placeholder="대규모 프로모션 시작일" value="<?=$promotion_season_start?>" data-toggle="input-mask" data-mask-format="0000-00-00 00:00:00" required>
												<span class="input-group-text">~</span>
												<input type="text" class="form-control form-control-sm" id="promotion_season_end" name="promotion_season_end" data-toggle="input-mask" data-mask-format="0000-00-00 00:00:00" placeholder="대규모 프로모션 종료일" value="<?=$promotion_season_end?>" required>
											</div>
										</div>
									</div>
									
									<div class="mb-2 row">
										<label for="promotion_season_banner_pc" class="col-sm-2 col-form-label bg-secondary text-white">* PC 배너 URL<br/>(1296 * 500)</label>
										<div class="col-sm-10">
											<input type="text" class="form-control" id="promotion_season_banner_pc" name="promotion_season_banner_pc" placeholder="" value="<?=$data['promotion_season_banner_pc']?>" required>
										</div>
									</div>
									
									<div class="mb-2 row">
										<label for="promotion_season_banner_mobile" class="col-sm-2 col-form-label bg-secondary text-white">* 모바일 배너 URL<br/>(720 * 720)</label>
										<div class="col-sm-10">
											<input type="text" class="form-control" id="promotion_season_banner_mobile" name="promotion_season_banner_mobile" placeholder="" value="<?=$data['promotion_season_banner_mobile']?>" required>
										</div>
									</div>

									<div class="mb-2 row">
										<label for="promotion_season_banner_link" class="col-sm-2 col-form-label bg-secondary text-white">* 배너 링크 URL</label>
										<div class="col-sm-10">
											<input type="text" class="form-control" id="promotion_season_banner_link" name="promotion_season_banner_link" placeholder="" value="<?=$data['promotion_season_banner_link']?>" required>
										</div>
									</div>
									
									<div class="mb-2 row">
										<label for="promotion_season_recommand_banner" class="col-sm-2 col-form-label bg-secondary text-white">* 추천 및 특집 배너 URL<br/>(640 * 573)</label>
										<div class="col-sm-10">
											<input type="text" class="form-control" id="promotion_season_recommand_banner" name="promotion_season_recommand_banner" placeholder="" value="<?=$data['promotion_season_recommand_banner']?>" required>
										</div>
									</div>
									
									<div class="mb-2 row">
										<label for="promotion_season_banner_mobile" class="col-sm-2 col-form-label bg-secondary text-white">* 대규모 프로모션 추천게임</label>
										<div class="col-sm-10">
											<div class="row g-3">
												<div class="col-md-3 text-center">
													<label for="promotion_season_recommand_1" class="form-label">추천게임 1</label>
													<input type="text" class="form-control" id="promotion_season_recommand_1" name="promotion_season_recommand_1" value="<?=$promotion_recommand_goods['0']?>" required>
												</div>
												<div class="col-md-3 text-center">
													<label for="promotion_season_recommand_2" class="form-label">추천게임 2</label>
													<input type="text" class="form-control" id="promotion_season_recommand_2" name="promotion_season_recommand_2" value="<?=$promotion_recommand_goods['1']?>" required>
												</div>
												<div class="col-md-3 text-center">
													<label for="promotion_season_recommand_3" class="form-label">추천게임 3</label>
													<input type="text" class="form-control" id="promotion_season_recommand_3" name="promotion_season_recommand_3" value="<?=$promotion_recommand_goods['2']?>" required>
												</div>
												<div class="col-md-3 text-center">
													<label for="promotion_season_recommand_4" class="form-label">추천게임 4</label>
													<input type="text" class="form-control" id="promotion_season_recommand_4" name="promotion_season_recommand_4" value="<?=$promotion_recommand_goods['3']?>" required>
												</div>
											</div>
										</div>
									</div>
									
									<div class="mb-2 row">
										<label for="promotion_season_banner_mobile" class="col-sm-2 col-form-label bg-secondary text-white align-middle">* 대규모 프로모션 인기게임</label>
										<div class="col-sm-10">
											<div class="row g-3">
												<div class="col-md-2 text-center">
													<label for="promotion_season_best_1" class="form-label">인기게임 1</label>
													<input type="text" class="form-control" id="promotion_season_best_1" name="promotion_season_best_1" value="<?=$promotion_best_goods['0']?>" required>
												</div>
												<div class="col-md-2 text-center">
													<label for="promotion_season_best_2" class="form-label">인기게임 2</label>
													<input type="text" class="form-control" id="promotion_season_best_2" name="promotion_season_best_2" value="<?=$promotion_best_goods['1']?>" required>
												</div>
												<div class="col-md-2 text-center">
													<label for="promotion_season_best_3" class="form-label">인기게임 3</label>
													<input type="text" class="form-control" id="promotion_season_best_3" name="promotion_season_best_3" value="<?=$promotion_best_goods['2']?>" required>
												</div>
												<div class="col-md-2 text-center">
													<label for="promotion_season_best_4" class="form-label">인기게임 4</label>
													<input type="text" class="form-control" id="promotion_season_best_4" name="promotion_season_best_4" value="<?=$promotion_best_goods['3']?>" required>
												</div>
												<div class="col-md-2 text-center">
													<label for="promotion_season_best_5" class="form-label">인기게임 5</label>
													<input type="text" class="form-control" id="promotion_season_best_5" name="promotion_season_best_5" value="<?=$promotion_best_goods['4']?>" required>
												</div>
											</div>
											<div class="row g-3">
												<div class="col-md-2 text-center">
													<label for="promotion_season_best_6" class="form-label ">인기게임 6</label>
													<input type="text" class="form-control" id="promotion_season_best_6" name="promotion_season_best_6" value="<?=$promotion_best_goods['5']?>" required>
												</div>
												<div class="col-md-2 text-center">
													<label for="promotion_season_best_7" class="form-label">인기게임 7</label>
													<input type="text" class="form-control" id="promotion_season_best_7" name="promotion_season_best_7" value="<?=$promotion_best_goods['6']?>" required>
												</div>
												<div class="col-md-2 text-center">
													<label for="promotion_season_best_8" class="form-label">인기게임 8</label>
													<input type="text" class="form-control" id="promotion_season_best_8" name="promotion_season_best_8" value="<?=$promotion_best_goods['7']?>" required>
												</div>
												<div class="col-md-2 text-center">
													<label for="promotion_season_best_9" class="form-label">인기게임 9</label>
													<input type="text" class="form-control" id="promotion_season_best_9" name="promotion_season_best_9" value="<?=$promotion_best_goods['8']?>" required>
												</div>
												<div class="col-md-2 text-center">
													<label for="promotion_season_best_10" class="form-label">인기게임 10</label>
													<input type="text" class="form-control" id="promotion_season_best_10" name="promotion_season_best_10" value="<?=$promotion_best_goods['9']?>" required>
												</div>
											</div>
										</div>
									</div>
									
									<div class="mb-2 row">
										<label for="promotion_max_discount" class="col-sm-2 col-form-label bg-secondary text-white">* 역대 최대할인 설정</label>
										<div class="col-sm-10">
											<div class="row g-3">
												<div class="col-md-2 text-center">
													<label for="promotion_max_discount_1" class="form-label">역대 최대할인 1</label>
													<input type="text" class="form-control" id="promotion_max_discount_1" name="promotion_max_discount_1" value="<?=$promotion_max_discount_goods['0']?>" required>
												</div>
												<div class="col-md-2 text-center">
													<label for="promotion_max_discount_2" class="form-label">역대 최대할인 2</label>
													<input type="text" class="form-control" id="promotion_max_discount_2" name="promotion_max_discount_2" value="<?=$promotion_max_discount_goods['1']?>" required>
												</div>
												<div class="col-md-2 text-center">
													<label for="promotion_max_discount_3" class="form-label">역대 최대할인 3</label>
													<input type="text" class="form-control" id="promotion_max_discount_3" name="promotion_max_discount_3" value="<?=$promotion_max_discount_goods['2']?>" required>
												</div>
											</div>
										</div>
									</div>

									<div class="mb-2 row">
										<label for="promotion_max_discount_link" class="col-sm-2 col-form-label bg-secondary text-white">* 역대 최대할인 배너 링크 URL</label>
										<div class="col-sm-10">
											<input type="text" class="form-control" id="promotion_max_discount_link" name="promotion_max_discount_link" placeholder="" value="<?=$data['promotion_max_discount_link']?>" required>
										</div>
									</div>

									<div class="mb-2 row">
										<label for="promotion_add_repay" class="col-sm-2 col-form-label bg-secondary text-white">* 추가 포인트 적립</label>
										<div class="col-sm-10">
											<div class="row g-3">
												<div class="col-md-2 text-center">
													<label for="promotion_add_repay_1" class="form-label">추가 포인트 적립 1</label>
													<input type="text" class="form-control" id="promotion_add_repay_1" name="promotion_add_repay_1" value="<?=$promotion_add_repay_goods['0']?>" required>
												</div>
												<div class="col-md-2 text-center">
													<label for="promotion_add_repay_2" class="form-label">추가 포인트 적립 2</label>
													<input type="text" class="form-control" id="promotion_add_repay_2" name="promotion_add_repay_2" value="<?=$promotion_add_repay_goods['1']?>" required>
												</div>
												<div class="col-md-2 text-center">
													<label for="promotion_add_repay_3" class="form-label">추가 포인트 적립 3</label>
													<input type="text" class="form-control" id="promotion_add_repay_3" name="promotion_add_repay_3" value="<?=$promotion_add_repay_goods['2']?>" required>
												</div>
											</div>
										</div>
									</div>
									
									<div class="mb-2 row">
										<label for="promotion_add_repay_link" class="col-sm-2 col-form-label bg-secondary text-white">* 추가 포인트 적립 배너 링크 URL</label>
										<div class="col-sm-10">
											<input type="text" class="form-control" id="promotion_add_repay_link" name="promotion_add_repay_link" placeholder="" value="<?=$data['promotion_add_repay_link']?>" required>
										</div>
									</div>
									
									<div class="mb-2 row">
										<label for="promotion_price_5000" class="col-sm-2 col-form-label bg-secondary text-white">* 대규모 프로모션 5천원 미만 게임</label>
										<div class="col-sm-10">
											<div class="row g-3">
												<div class="col-md-2 text-center">
													<label for="promotion_price_5000_1" class="form-label">5천원 미만 게임 1</label>
													<input type="text" class="form-control" id="promotion_price_5000_1" name="promotion_price_5000_1" value="<?=$promotion_price_5000_goods['0']?>" required>
												</div>
												<div class="col-md-2 text-center">
													<label for="promotion_price_5000_2" class="form-label">5천원 미만 게임 2</label>
													<input type="text" class="form-control" id="promotion_price_5000_2" name="promotion_price_5000_2" value="<?=$promotion_price_5000_goods['1']?>" required>
												</div>
												<div class="col-md-2 text-center">
													<label for="promotion_price_5000_3" class="form-label">5천원 미만 게임 3</label>
													<input type="text" class="form-control" id="promotion_price_5000_3" name="promotion_price_5000_3" value="<?=$promotion_price_5000_goods['2']?>" required>
												</div>
												<div class="col-md-2 text-center">
													<label for="promotion_price_5000_4" class="form-label">5천원 미만 게임 4</label>
													<input type="text" class="form-control" id="promotion_price_5000_4" name="promotion_price_5000_4" value="<?=$promotion_price_5000_goods['3']?>" required>
												</div>
												<div class="col-md-2 text-center">
													<label for="promotion_price_5000_5" class="form-label">5천원 미만 게임 5</label>
													<input type="text" class="form-control" id="promotion_price_5000_5" name="promotion_price_5000_5" value="<?=$promotion_price_5000_goods['4']?>" required>
												</div>
											</div>
										</div>
									</div>
									
									<div class="mb-2 row">
										<label for="promotion_price_10000" class="col-sm-2 col-form-label bg-secondary text-white">* 대규모 프로모션 1만원 미만 게임</label>
										<div class="col-sm-10">
											<div class="row g-3">
												<div class="col-md-2 text-center">
													<label for="promotion_price_10000_1" class="form-label">1만원 미만 게임 1</label>
													<input type="text" class="form-control" id="promotion_price_10000_1" name="promotion_price_10000_1" value="<?=$promotion_price_10000_goods['0']?>" required>
												</div>
												<div class="col-md-2 text-center">
													<label for="promotion_price_10000_2" class="form-label">1만원 미만 게임 2</label>
													<input type="text" class="form-control" id="promotion_price_10000_2" name="promotion_price_10000_2" value="<?=$promotion_price_10000_goods['1']?>" required>
												</div>
												<div class="col-md-2 text-center">
													<label for="promotion_price_10000_3" class="form-label">1만원 미만 게임 3</label>
													<input type="text" class="form-control" id="promotion_price_10000_3" name="promotion_price_10000_3" value="<?=$promotion_price_10000_goods['2']?>" required>
												</div>
												<div class="col-md-2 text-center">
													<label for="promotion_price_10000_4" class="form-label">1만원 미만 게임 4</label>
													<input type="text" class="form-control" id="promotion_price_10000_4" name="promotion_price_10000_4" value="<?=$promotion_price_10000_goods['3']?>" required>
												</div>
												<div class="col-md-2 text-center">
													<label for="promotion_price_10000_5" class="form-label">1만원 미만 게임 5</label>
													<input type="text" class="form-control" id="promotion_price_10000_5" name="promotion_price_10000_5" value="<?=$promotion_price_10000_goods['4']?>" required>
												</div>
											</div>
										</div>
									</div>
									
									<div class="mb-2 row">
										<label for="event_link" class="col-sm-2 col-form-label bg-secondary text-white">* 대규모 프로모션 URL</label>
										<div class="col-sm-10">
											<span class="form-control-plaintext">/promotion/promotion_season.html</span>
										</div>
									</div>
									
									<div class="mb-2 row">
										<label for="notice_title" class="col-sm-2 col-form-label bg-secondary text-white">프로모션 공지 제목</label>
										<div class="col-sm-10">
											<input type="text" class="form-control" id="notice" name="notice_title" placeholder="" value="<?=$data['notice_title']?>">
										</div>
									</div>
									<div class="mb-2 row">
										<label for="notice_btn_title" class="col-sm-2 col-form-label bg-secondary text-white">프로모션 공지 버튼명</label>
										<div class="col-sm-10">
											<input type="text" class="form-control" id="notice_btn_title" name="notice_btn_title" placeholder="" value="<?=$data['notice_btn_title']?>">
										</div>
									</div>
									<div class="mb-2 row">
										<label for="notice_btn_url" class="col-sm-2 col-form-label bg-secondary text-white">프로모션 공지 버튼 URL</label>
										<div class="col-sm-10">
											<input type="text" class="form-control" id="notice_btn_url" name="notice_btn_url" placeholder="" value="<?=$data['notice_btn_url']?>">
										</div>
									</div>
									<div class="mb-2 row">
										<label for="notice_view_y" class="col-sm-2 col-form-label bg-secondary text-white">프로모션 공지 영역 노출여부</label>
										<div class="col-sm-10 border p-2">
											<div class="form-check form-check-inline">
												<input type="radio" id="notice_view_y" name="notice_view" class="form-check-input" value="Y" <?=$checked['notice_view']['Y']?>>
												<label class="form-check-label" for="notice_view_y">예</label>
											</div>
											<div class="form-check form-check-inline">
												<input type="radio" id="notice_view_n" name="notice_view" class="form-check-input" value="N" <?=$checked['notice_view']['N']?>>
												<label class="form-check-label" for="notice_view_n">아니오</label>
											</div>
										</div>
									</div>

									<div class="mb-2 row">
										<label for="is_view" class="col-sm-2 col-form-label bg-secondary text-white">* 대규모 프로모션 노출여부</label>
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
											<button type="submit" class="btn btn-primary shadow-none">대규모 프로모션 저장</button>
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
