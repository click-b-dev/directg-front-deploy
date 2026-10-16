<?
$sidebar_file = "sidebar_promotion.php";
	header('Content-Type: text/html; charset=UTF-8');
	ini_set( "display_errors", 1 );
	error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

	include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
	$topmenu['promotion'] = "active";

	$page_title="할인 프로모션 등록";


$idx = filter_input(INPUT_GET, 'idx', FILTER_SANITIZE_STRING);

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	if($idx){
		$mode = "modify";

		$query="select * from tbl_promotion where idx=:idx";
		$stmt = $conn->prepare($query);
		$params = array(
			":idx"=>$idx
		);
		$stmt->execute($params);

		$promotion_data = $stmt->fetch();

		$promotion_nm = $promotion_data['promotion_nm'];
		$promotion_start = $promotion_data['promotion_start'];
		$promotion_end = $promotion_data['promotion_end'];
		$flag = $promotion_data['flag'];
		$domain = $promotion_data['domain'];
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
										<li class="breadcrumb-item"><a href="javascript: void(0);">할인 프로모션</a></li>
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
							<form class="form-horizontal" method="post" enctype="multipart/form-data" action="promotion_ps.php">
								<input type="hidden" name="mode" value="file_register">
								<div class="card">
									<h5 class="card-header bg-secondary text-white">할인 프로모션 업로드</h5>
									<div class="card-body">
										<div class="row mb-2">
											<div class="col-lg-6">
												<div class="row mb-2">
													<label for="promotion_nm" class="col-sm-3 col-form-label bg-light border">할인 프로모션 업로드</label>
													<div class="col-sm-9">
														<input type="file" class="form-control" id="promotion_file" name="promotion_file" placeholder="할인 프로모션 업로드파일" required>
													</div>
												</div>
											</div>
											<div class="col-lg-6">
												<button type="submit" class="btn btn-primary shadow-none">할인 프로모션 업로드</button>
											</div>
										</div>
									</div>
								</div>
							</form>
						</div>
						<!-- end col -->
					</div>
					<!-- end row -->   
				</div> <!-- container -->
			</div> <!-- content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

</body>
</html>
