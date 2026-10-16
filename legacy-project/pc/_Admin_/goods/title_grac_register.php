<?

$page_title="대표상품 심의정보 설정";
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sub_sidebar_title['grac'] = "active";
$sidebar_file="sidebar_goods.php";

$title_id = filter_input(INPUT_GET, 'title_id', FILTER_SANITIZE_STRING);
$mode = filter_input(INPUT_GET, 'mode', FILTER_SANITIZE_STRING);
$title_mode = filter_input(INPUT_GET, 'title_mode', FILTER_SANITIZE_STRING);
$product_code = filter_input(INPUT_GET, 'product_code', FILTER_SANITIZE_STRING);

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_title_name = filter_input(INPUT_GET, 'search_title_name', FILTER_SANITIZE_STRING);
$search_is_view = filter_input(INPUT_GET, 'search_is_view', FILTER_SANITIZE_STRING);
$search_publisher_code = filter_input(INPUT_GET, 'search_publisher_code', FILTER_SANITIZE_STRING);
$search_platform = filter_input(INPUT_GET, 'search_platform', FILTER_SANITIZE_STRING);
$search_age_limit = filter_input(INPUT_GET, 'search_age_limit', FILTER_SANITIZE_STRING);
$referer = filter_input(INPUT_GET, 'referer', FILTER_SANITIZE_STRING);

$dsn = 'mysql:host='.DB_HOST.';dbname='.DB_DB.';port=3306;charset=utf8';
try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$admin= new Admin($conn);

	$mode= "modify";
	$query="select * from tbl_goods where title_id=:title_id";
	$stmt = $conn->prepare($query);
	$params = array(
		":title_id"=>$title_id
	);
	$stmt->execute($params);
	$data = $stmt->fetch();

	$title_id = $data['title_id'];
	$sku = $data['sku'];

	$game_rate_array = array();
	 for ($i = 0; $i < mb_strlen($data['game_rate'],"UTF-8"); $i++) {
		$char = mb_substr ($data['game_rate'], $i, 1, 'UTF-8');
		if($char=="1"){
			array_push ($game_rate_array, "checked");
		}else{
			array_push ($game_rate_array, "");
		}
		
	}
	
	$title_name = $data['title_name'];
	$title_name_en = $data['title_name_en'];
	$steam_appid = $data['steam_appid'];
	$release_date = $data['release_date'];
	$rateno = $data['rateno'];
	$coming_soon_date = $data['coming_soon_date'];

	$checked['is_view'][$data['is_view']]="checked";
	$checked['sales_status'][$data['sales_status']]="checked";
	$checked['interface_korean'][$data['interface_korean']]="checked";
	$checked['spoken_korean'][$data['spoken_korean']]="checked";
	$checked['exclusive_korean'][$data['exclusive_korean']]="checked";
	$checked['coming_soon'][$data['coming_soon']]="checked";

	$checked['age_limit'][$data['age_limit']]="checked";
	$checked['orgname'][$data['orgname']]="checked";


	$checked['domain'][$data['domain']]="checked";

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
									<li class="breadcrumb-item"><a href="javascript: void(0);">상품</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">대표상품 관리</a></li>
									<li class="breadcrumb-item active">심의정보 설정</li>
								</ol>
							</div>
							<h4 class="page-title"><?=$title_name?> <small>(<?=$title_name_en?>)</small></h4>
						</div>
					</div>
				</div>     
				<!-- end page title --> 
				
				<div class="row">
					<div class="col-2 mb-2 mb-sm-0">
						<? include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/sub_sidebar_title.php');?>
					</div>
					<div class="col-10">
						<form id="frm" name="frm" method="post" action="title_ps.php" class="form-horizontal" enctype="multipart/form-data">
							<input type="hidden" name="mode" id="mode" value="<?=$mode?>">
							<input type="hidden" name="title_mode" value="<?=$title_mode?>">
							<input type="hidden" name="page" value="<?=$page?>">
							<input type="hidden" name="search_title_name" value="<?=$search_title_name?>">
							<input type="hidden" name="search_is_view" value="<?=$search_is_view?>">
							<input type="hidden" name="search_publisher_code" value="<?=$search_publisher_code?>">
							<input type="hidden" name="search_platform" value="<?=$search_platform?>">
							<input type="hidden" name="search_age_limit" value="<?=$search_age_limit?>">
							<input type="hidden" name="referer" value="<?=$referer?>">
							<input type="hidden" name="title_id" value="<?=$title_id?>">
							
							<input type="hidden" id="game_rate_text" name="game_rate_text" value="">
							<div class="card">
								<h5 class="card-header  bg-secondary text-white">대표상품 심의정보</h5>
								<div class="card-body font-13">
									<div class="row mb-2">
										<label for="rateno" class="col-2 col-form-label bg-light border">* 등급분류번호</label>
										<div class="col-6">
											<div class="input-group">
												<input type="text" class="form-control" id="rateno" name="rateno" placeholder="등급분류번호" aria-label="등급분류번호" value="<?=$rateno?>">
												<button class="btn btn-sm btn-dark shadow-none" type="button">심의정보검색</button>
											</div>
										</div>
									</div>
									<div class="row mb-2">
										<label for="age_limit" class="col-2 col-form-label bg-light border">* 결정등급</label>
										<div class="col-10">
											<div class="form-check form-check-inline mt-1">
												<input type="radio" id="age_limit10" name="age_limit" class="form-check-input" value="10" <?=$checked['age_limit']['10']?>>
												<label class="form-check-label" for="age_limit10">전체 이용가</label>
											</div>
											<div class="form-check form-check-inline mt-1">
												<input type="radio" id="age_limit12" name="age_limit" class="form-check-input" value="12" <?=$checked['age_limit']['12']?>>
												<label class="form-check-label" for="age_limit12">12세이용가</label>
											</div>
											<div class="form-check form-check-inline mt-1">
												<input type="radio" id="age_limit15" name="age_limit" class="form-check-input" value="15" <?=$checked['age_limit']['15']?>>
												<label class="form-check-label" for="age_limit15">15세이용가</label>
											</div>
											<div class="form-check form-check-inline mt-1">
												<input type="radio" id="age_limit19" name="age_limit" class="form-check-input" value="19" <?=$checked['age_limit']['19']?>>
												<label class="form-check-label" for="age_limit19">청소년이용불가</label>
											</div>
										</div>
									</div>
									<div class="row">
										<label for="title_name_en" class="col-2 col-form-label bg-light border"> 내용정보표시</label>
										<div class="col-10">
											<div class="form-check form-check-inline mt-1">
												<input type="checkbox" id="game_rate64" name="game_rate[]" class="form-check-input" value="64" <?=$game_rate_array['0']?>>
												<label class="form-check-label" for="game_rate64">선정성</label>
											</div>
											<div class="form-check form-check-inline mt-1">
												<input type="checkbox" id="game_rate32" name="game_rate[]" class="form-check-input" value="32" <?=$game_rate_array['1']?>>
												<label class="form-check-label" for="game_rate32">폭력성</label>
											</div>
											<div class="form-check form-check-inline mt-1">
												<input type="checkbox" id="game_rate16" name="game_rate[]" class="form-check-input" value="16" <?=$game_rate_array['2']?>>
												<label class="form-check-label" for="game_rate16">공포</label>
											</div>
											<div class="form-check form-check-inline mt-1">
												<input type="checkbox" id="game_rate8" name="game_rate[]" class="form-check-input" value="8" <?=$game_rate_array['3']?>>
												<label class="form-check-label" for="game_rate8">언어의부적절성</label>
											</div>
											<div class="form-check form-check-inline mt-1">
												<input type="checkbox" id="game_rate4" name="game_rate[]" class="form-check-input" value="4" <?=$game_rate_array['4']?>>
												<label class="form-check-label" for="game_rate4">약물</label>
											</div>
											<div class="form-check form-check-inline mt-1">
												<input type="checkbox" id="game_rate2" name="game_rate[]" class="form-check-input" value="2" <?=$game_rate_array['5']?>>
												<label class="form-check-label" for="game_rate2">범죄</label>
											</div>
											<div class="form-check form-check-inline mt-1">
												<input type="checkbox" id="game_rate1" name="game_rate[]" class="form-check-input" value="1" <?=$game_rate_array['6']?>>
												<label class="form-check-label" for="game_rate1">사행성</label>
											</div>
										</div>
									</div>
								</div>
								<div class="card-footer p-1">
									<div class="text-end">
						<?php
							if(!$product_viewer){
						?>
										<button type="button" class="btn btn-secondary btn-sm shadow-none" id="btn_grac_save"><i class="mdi mdi-content-save font-16"></i> 대표상품 심의정보 저장</button>
						<?php
							}
						?>
									</div>
								</div>
							</div>
						</form>
					</div>
				</div>

				<!-- end row -->   
				
			</div> 
			<!-- container -->

		</div> 
		<!-- content -->

	</div>

</div>
<!-- END wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>

$(document).ready(function(){
	//대표상품 기본정보 저장
	 $("form").submit(function(event) {
		 var dec = 0;
		$('input[name="game_rate[]"]').each(function(index, item){
			if($(this).prop('checked')){
				dec +=parseInt($(this).val());
			}
		});
		console.log(dec.toString(2));
		$("#game_rate_text").val(dec.toString(2));
		//return false;
	});

	//대표상품 출시정보 저장
	$("#btn_release_save").bind("click",function(){
		$("#mode").val("release_save");
		$("#frm").submit();
		
	});

	//대표상품 장르 저장
	$("#btn_genre_save").bind("click",function(){
		$("#mode").val("genre_save");
		$("#frm").attr("action","title_ps.php");
		$("#frm").submit();
		
	});

	//대표상품 카테고리 저장
	$("#btn_category_save").bind("click",function(){
		$("#mode").val("category_save");
		$("#frm").submit();
	});

	//대표상품 심의정보 저장
	$("#btn_grac_save").bind("click",function(){
		$("#mode").val("grac_save");
		$("#frm").attr("action","title_ps.php");
		$("#frm").submit();
	});
});

</script>

</body>
</html>
