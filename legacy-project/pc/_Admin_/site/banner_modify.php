<?
$sidebar_file = "sidebar_site.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['site'] = "active";

$page_title= "메인배너 수정";

$idx = filter_input(INPUT_GET, 'idx', FILTER_SANITIZE_STRING);


try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$query="select * from tbl_main_banner where idx=:idx";
	$param = array(
			":idx"=>$idx,
		);
		$stmt = $conn->prepare($query);
		$stmt->execute($param);
		$data=$stmt->fetch();
		
		$start_date = date('Y-m-d H:i:s',$data['banner_start']);
		$end_date = date('Y-m-d H:i:s',$data['banner_end']);
		
		$selected['banner_target'][$data['banner_target']]="selected";
		$checked['flag'][$data['flag']]="checked";
		$checked['bannerPeriodOutputFl'][$data['bannerPeriodOutputFl']]="checked";
        $checked['show_prod_info'][$data['show_prod_info']] = "checked";
        $checked['show_sale_info'][$data['show_sale_info']] = "checked";
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">사이트 관리</a></li>
									<li class="breadcrumb-item active"><?=$page_title?></li>
								</ol>
							</div>
							<h4 class="page-title"><?=$page_title?></h4>
						</div>
					</div>
				</div>     
				<!-- end page title --> 
				
				<div class="row">
					<div class="col-9">
						<div class="card">
							<div class="card-body">
								<form id="bannerFrm" name="bannerFrm" method="post" action="banner_proc.php">
									<input type="hidden" name="mode" value="modify">
									<input type="hidden" name="idx" value="<?=$data['idx']?>">
									<div class="mb-2 row">
										<label for="banner_title" class="col-sm-2 col-form-label bg-light">* 메인배너 제목</label>
										<div class="col-sm-10">
											<input type="text" id="banner_title" name="banner_title" class="form-control" value="<?=$data['banner_title']?>" placeholder="메인배너 제목" required="">
										</div>
									</div>
									<div class="mb-2 row">
										<label for="banner_pc" class="col-sm-2 col-form-label bg-light">* 메인배너 PC URL</label>
										<div class="col-sm-10">
											<input type="text" id="banner_pc" name="banner_pc" class="form-control" value="<?=$data['banner_pc']?>" placeholder="디스크엔 이미지 URL" required="">
										</div>
									</div>
									<div class="mb-2 row">
										<label for="banner_mobile" class="col-sm-2 col-form-label bg-light">* 메인배너 모바일 URL</label>
										<div class="col-sm-10">
											<input type="text" id="banner_mobile" name="banner_mobile" class="form-control" value="<?=$data['banner_mobile']?>" placeholder="디스크엔 이미지 URL" required="">
										</div>
									</div>
									<div class="mb-2 row">
										<label for="product_code" class="col-sm-2 col-form-label bg-light">옵션상품코드</label>
										<div class="col-sm-10">
											<div class="row">
												<div class="col-sm-4">
													<input type="text" id="product_code" name="product_code" class="form-control" value="<?=$data['product_code']?>" placeholder="옵션상품코드" maxlength="8">
												</div>
												<div class="col-sm-3">
													<button class="btn btn-light shadow-none border" id="btn_banner_link_auto">링크 URL 자동생성</button>
												</div>
											</div>
										</div>
									</div>
									<div class="mb-2 row">
										<label for="banner_link" class="col-sm-2 col-form-label bg-light">* 메인배너 링크 URL</label>
										<div class="col-sm-10">
											<div class="row">
												<div class="input-group">
													<div class="col-sm-10">
														<input type="text" id="banner_link" name="banner_link" class="form-control" value="<?=$data['banner_link']?>" placeholder="메인배너 링크 URL" required="">
													</div>
													<div class="col-sm-2">
														<select id="banner_target" name="banner_target" class="form-select" required="">
															<option value="">:::타겟선택:::</option>
															<option value="_self" <?=$selected['banner_target']['_self']?>>현재창</option>
															<option value="_blank" <?=$selected['banner_target']['_blank']?>>새창</option>
														</select>
													</div>
												</div>
											</div>
										</div>
									</div>
									
									<div class="mb-2 row">
										<label for="banner_publisher" class="col-sm-2 col-form-label bg-light">* 메인배너 퍼블리셔</label>
										<div class="col-sm-6">
											<input type="text" id="banner_publisher" name="banner_publisher" class="form-control" value="<?=$data['banner_publisher']?>" placeholder="메인배너 퍼블리셔" required="">
										</div>
									</div>
									
									<div class="mb-2 row">
										<label for="flag" class="col-sm-2 col-form-label bg-light">* 메인배너 노출여부</label>
										<div class="col-sm-6">
											<div class="form-check form-check-inline mt-1">
												<input type="radio" id="flag_y" name="flag" class="form-check-input" value="Y" <?=$checked['flag']['Y']?>>
												<label class="form-check-label" for="flag_y">예</label>
											</div>
											<div class="form-check form-check-inline">
												<input type="radio" id="flag_n" name="flag" class="form-check-input" value="N" <?=$checked['flag']['N']?>>
												<label class="form-check-label" for="flag_n">아니오</label>
											</div>
										</div>
									</div>
									
									<div class="mb-2 row">
										<label for="banner_date" class="col-sm-2 col-form-label bg-light">* 메인배너 기간</label>
										<div class="col-sm-6">
											<div class="row mb-2">
												<div class="col-sm-12">
													<div class="form-check form-check-inline mt-1">
														<input type="radio" id="bannerPeriodOutputFl_n" name="bannerPeriodOutputFl" class="form-check-input" value="N" <?=$checked['bannerPeriodOutputFl']['N']?>>
														<label class="form-check-label" for="bannerPeriodOutputFl_n">상시노출</label>
													</div>
													<div class="form-check form-check-inline mt-1">
														<input type="radio" id="bannerPeriodOutputFl_y" name="bannerPeriodOutputFl" class="form-check-input" value="Y" <?=$checked['bannerPeriodOutputFl']['Y']?>>
														<label class="form-check-label" for="bannerPeriodOutputFl_y">기간노출</label>
													</div>
												</div>
											</div>
											<?
												if($data['bannerPeriodOutputFl']=="Y"){
													$bannerPeriodDate_area="display:block";
												}else{
													$bannerPeriodDate_area="display:none";
												}
											?>
											<div class="row" id="bannerPeriodDate" style="<?=$bannerPeriodDate_area?>">
												<div class="input-group">
													<input type="text" class="form-control form-control-sm" id="banner_start" name="banner_start" placeholder="메인배너 시작일자" value="<?=$start_date?>" data-toggle="input-mask" data-mask-format="0000-00-00 00:00:00">
													<span class="input-group-text">~</span>
													<input type="text" class="form-control form-control-sm" id="banner_end" name="banner_end" data-toggle="input-mask" data-mask-format="0000-00-00 00:00:00" placeholder="메인배너 종료일자" value="<?=$end_date?>" >
												</div>
											</div>
										</div>
									</div>
									
									<div class="mb-2 row">
										<label for="banner_sort" class="col-sm-2 col-form-label bg-light">* 메인배너 순서</label>
										<div class="col-sm-2">
											<input type="text" id="banner_sort" name="banner_sort" class="form-control" value="<?=$data['banner_sort']?>" placeholder="메인배너 순서" required="">
										</div>
									</div>

                                     <div class="mb-2 row">
										<label for="show_prod_info" class="col-sm-2 col-form-label bg-light">* 상품정보 노출여부</Br><small class="text-muted">(라벨, 상품명)</small></label>
										<div class="col-sm-6">
											<div class="form-check form-check-inline mt-1">
												<input type="radio" id="show_prod_info1" name="show_prod_info" class="form-check-input" value="Y" <?=$checked['show_prod_info']['Y']?>>
												<label class="form-check-label" for="show_prod_info1">예</label>
											</div>
											<div class="form-check form-check-inline">
												<input type="radio" id="show_prod_info2" name="show_prod_info" class="form-check-input" value="N" <?=$checked['show_prod_info']['N']?>>
												<label class="form-check-label" for="show_prod_info2">아니오</label>
											</div>
										</div>
									</div>

                                    <div class="mb-2 row">
										<label for="show_sale_info" class="col-sm-2 col-form-label bg-light">* 판매정보 노출여부</Br><small class="text-muted">(퍼블리셔, 가격, 출시일)</small></label>
										<div class="col-sm-6">
											<div class="form-check form-check-inline mt-1">
												<input type="radio" id="show_sale_info1" name="show_sale_info" class="form-check-input" value="Y" <?=$checked['show_sale_info']['Y']?>>
												<label class="form-check-label" for="show_sale_info1">예</label>
											</div>
											<div class="form-check form-check-inline">
												<input type="radio" id="show_sale_info2" name="show_sale_info" class="form-check-input" value="N" <?=$checked['show_sale_info']['N']?>>
												<label class="form-check-label" for="show_sale_info2">아니오</label>
											</div>
										</div>
									</div>
									
									<div class="mb-2 row">
										<div class="text-end">
											<button type="submit" class="btn btn-primary shadow-none">메인배너 저장</button>
										</div>
									</div>
								</form>
							</div> <!-- end card-body -->
						</div> <!-- end card-->
					</div>
					<div class="col-3">
						<div class="card">
							<div class="card-header bg-secondary text-white fw-bold font-14">메인배너 PC</div>
							<img src="<?=$data['banner_pc']?>" class="img-fluid">
						</div>
						
						<div class="card">
							<div class="card-header bg-secondary text-white fw-bold font-14">메인배너 모바일</div>
							<img src="<?=$data['banner_mobile']?>" class="img-fluid">
						</div>
					</div>
				</div>
				
			</div> <!-- container -->

		</div> <!-- content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>
$(document).ready(function(){
	$("#btn_banner_link_auto").bind("click",function(e){
		e.preventDefault();
		var product_code = $("#product_code").val();

		if(product_code==""){
			alert("옵션상품코드를 입력해 주세요");
			return false;
		}

		$.ajax({
			 type: "POST",
			 url: "banner_proc.php",
			 data: {mode:"banner_link_search",product_code:product_code},
			 success: function (data, status) {
				$("#banner_link").val(data);
				//alert(data);
				return false;
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
	
	$("input[name='bannerPeriodOutputFl']").bind("change",function(){
		if ($("input[name='bannerPeriodOutputFl']:checked").val() == 'N') {
			 $('#bannerPeriodDate').hide();
			 $('#banner_start').attr('required', false);
			 $('#banner_end').attr('required', false);
		}else {
			 $('#bannerPeriodDate').show();
			 $('#banner_start').attr('required', true);
			 $('#banner_end').attr('required', true);
		}
	});

});

</script>

</body>
</html>
