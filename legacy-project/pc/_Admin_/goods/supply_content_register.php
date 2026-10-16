<?
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page_title = "제공 컨텐츠 등록";


try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$admin= new Admin($conn);


	switch($mode){
		case "modify":

		break;
		default:
			$sku = $admin->uuidgen4();
			$title_id = $admin->setGoodsTitleId();
			$mode= "register";

		break;
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">상품</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">제공컨텐츠 관리</a></li>
									<li class="breadcrumb-item active">제공컨텐츠 등록</li>
								</ol>
							</div>
							<h4 class="page-title">제공컨텐츠 등록</h4>
						</div>
					</div>
				</div>     
				<!-- end page title --> 

				<form id="frm" name="frm" method="post" action="title_ps.php" class="form-horizontal" enctype="multipart/form-data">
					<input type="hidden" name="mode" value="<?=$mode?>">
					<input type="hidden" name="title_mode" value="<?=$title_mode?>">
					<input type="hidden" name="page" value="<?=$page?>">
					<input type="hidden" name="search_title_name" value="<?=$search_title_name?>">
					<input type="hidden" name="search_is_view" value="<?=$search_is_view?>">
					<input type="hidden" name="search_publisher_code" value="<?=$search_publisher_code?>">
					<input type="hidden" name="search_platform" value="<?=$search_platform?>">
					<input type="hidden" name="search_age_limit" value="<?=$search_age_limit?>">
					
					<input type="hidden" id="game_rate_text" name="game_rate_text" value="">

					<div class="row mb-2">
						<div class="text-end">
							<button type="submit" class="btn btn-primary shadow-none"><i class="mdi mdi-content-save font-16"></i> 대표상품 등록</button>
						</div>
					</div>
					
					<div class="row">
						<div class="col-6">
							<div class="card">
								<div class="card-body">
									<div class="row mb-2">
										<label for="title_id" class="col-3 col-form-label bg-light">* 제공 컨텐츠 유형</label>
										<div class="col-9">
											<input type="text" class="form-control-plaintext" id="title_id" name="title_id" value="<?=$title_id?>" placeholder="" readonly>
										</div>
									</div>
									<div class="row mb-2">
										<label for="sku" class="col-3 col-form-label bg-light">* 제공 컨텐츠명</label>
										<div class="col-9">
											<input type="text" class="form-control-plaintext" id="sku" name="sku" value="<?=$sku?>" placeholder="" readonly>
										</div>
									</div>
									<div class="row mb-2">
										<label for="title_name" class="col-3 col-form-label bg-light">* 제공 컨텐츠 URL</label>
										<div class="col-9">
											
										</div>
									</div>
									<div class="row mb-2">
										<label for="title_name_en" class="col-3 col-form-label bg-light">* 암호화 여부</label>
										<div class="col-9">
											
										</div>
									</div>
									<div class="row mb-2">
										<label for="title_name_en" class="col-3 col-form-label bg-light"> * 관련상품</label>
										<div class="col-9">

										</div>
									</div>
								</div>
							</div>
						</div>
						<div class="col-6">
						</div>
					</div>
				</form>

				<!-- end row -->   
				
			</div> 
			<!-- container -->

		</div> 
		<!-- content -->

	</div>

</div>
<!-- END wrapper -->

<script>

$(document).ready(function(){
});

</script>

	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>
</body>
</html>
