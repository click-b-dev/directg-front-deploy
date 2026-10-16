<?php
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page_title= "그룹 등록";

$idx = filter_input(INPUT_GET, 'idx', FILTER_SANITIZE_STRING);
$mode = filter_input(INPUT_GET, 'mode', FILTER_SANITIZE_STRING);

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	if($idx){
		$mode= "modify";
		$query="SELECT * FROM tbl_group WHERE idx=:idx";
		$stmt = $conn->prepare($query);
		$params = array(
			":idx"=>$idx
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		$subject =$data['subject'];
		$banner =$data['banner'];
		$start_date =$data['start_date'];
		$end_date =$data['end_date'];
		$use_flag =$data['use_flag'];
		$admin =$data['admin'];
		$reg_date =$data['reg_date'];
		$banner_domain =$data['banner_domain'];
		$sort =$data['sort'];
		$type =$data['type'];
		$banner_url =$data['banner_url'];
		$pc_banner_url =$data['pc_banner_url'];

		$checked['type'][$data['type']]="checked";
		$checked['banner_domain'][$data['banner_domain']]="checked";
		$checked['use_flag'][$data['use_flag']]="checked";
	}else{
		$mode= "register";
		$checked['pre_delivery']['N']="checked";
		$checked['is_bonus']['N']="checked";
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
			<div class="container-fluid">
				<!-- start page title -->
				<div class="row">
					<div class="col-12">
						<div class="page-title-box">
							<div class="page-title-right">
								<ol class="breadcrumb m-0">
									<li class="breadcrumb-item"><a href="javascript: void(0);">홈</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">상품</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">그룹 관리</a></li>
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
						<div class="card">
							<div class="card-body">
								<form id="frm" name="frm" method="post" action="group_ps.php" enctype="multipart/form-data">
									<input type="hidden" name="mode" value="<?=$mode?>">
									<input type="hidden" name="idx" value="<?=$idx?>">
									<input type="hidden" name="banner_img" value="<?=$banner?>">

									<div class="row mb-2">
										<label for="type" class="col-2 col-form-label bg-light">그룹 구분</label>
										<div class="col-10">
											<div class="form-check form-check-inline mt-2">
												<input type="radio" id="type_1" name="type" class="form-check-input" value="1" <?=$checked['type']['1']?>>
												<label class="form-check-label" for="type_1">프로모션</label>
											</div>
											<div class="form-check form-check-inline mt-2">
												<input type="radio" id="type_2" name="type" class="form-check-input" value="2" <?=$checked['type']['2']?>>
												<label class="form-check-label" for="type_2">타임딜</label>
											</div>
											<div class="form-check form-check-inline mt-2">
												<input type="radio" id="type_3" name="type" class="form-check-input" value="3" <?=$checked['type']['3']?>>
												<label class="form-check-label" for="type_3">프랜차이즈</label>
											</div>
											<div class="form-check form-check-inline mt-2">
												<input type="radio" id="type_99" name="type" class="form-check-input" value="99" <?=$checked['type']['99']?>>
												<label class="form-check-label" for="type_99">기타</label>
											</div>
										</div>
									</div>

									<div class="row mb-2">
										<label for="subject" class="col-2 col-form-label bg-light">* 그룹명</label>
										<div class="col-10">
											<input type="text" class="form-control" id="subject" name="subject" placeholder="" value="<?=$subject?>">
										</div>
									</div>

									<div class="row mb-2">
										<label for="is_bonus" class="col-2 col-form-label bg-light"> 기간<br>EX) <?=date('Y-m-d H:i:s')?></label>

										<div class="col-10 row">
											<div class="col-2">
												<label for="start_date" class="form-label">시작</label>
												<input type="text" id="start_date" name="start_date" class="form-control" value="<?=$mode=="modify"?date('Y-m-d H:i:s', $data['start_date']):''?>" placeholder="<?=date('Y-m-d H:i:s')?>" aria-label="<?=date('Y-m-d H:i:s')?>">
											</div>

											<div class="col-2">
												<label for="end_date" class="form-label">종료</label>
												<input type="text" id="end_date" name="end_date" class="form-control" value="<?=$mode=="modify"?date('Y-m-d H:i:s',$data['end_date']):''?>" placeholder="<?=date('Y-m-d H:i:s')?>" aria-label="<?=date('Y-m-d H:i:s')?>">
											</div>
										</div>
									</div>

									<div class="row mb-2">
										<label for="is_bonus" class="col-2 col-form-label bg-light">PC 배너 URL</label>
										<div class="col-10">
											<!--<input type="file" class="form-control" name="upload_file"> <br/>-->
											<input type="text" class="form-control mb-2" id="pc_banner_url" name="pc_banner_url" placeholder="https://image.directg.net/upload/banner/sample.jpg" value="<?=$pc_banner_url?>">

											<? if($pc_banner_url){?>
											<img src="<?=$pc_banner_url?>" class="img-fluid">
											<? } ?>
										</div>
									</div>
<!--
									<div class="row mb-2">
										<label for="is_bonus" class="col-2 col-form-label bg-light">배너 이미지 호스팅</label>
										<div class="col-10">
											<div class="form-check form-check-inline mt-2">
												<input type="radio" id="domain_dgkr" name="banner_domain" class="form-check-input" value="/" <?=$checked['banner_domain']['/']?>>
												<label class="form-check-label" for="domain_dgkr">웹서버</label>
											</div>
											<div class="form-check form-check-inline mt-2">
												<input type="radio" id="domain_diskn" name="banner_domain" class="form-check-input" value="https://image.directg.net/" <?=$checked['banner_domain']['https://image.directg.net/']?>>
												<label class="form-check-label" for="domain_diskn">이미지호스팅 (diskn)</label>
											</div>
										</div>
									</div>
-->
									<div class="row mb-2">
										<label for="is_bonus" class="col-2 col-form-label bg-light">사용여부</label>
										<div class="col-10">
											<div class="form-check form-check-inline mt-2">
												<input type="radio" id="use_flag_y" name="use_flag" class="form-check-input" value="Y" <?=$checked['use_flag']['Y']?>>
												<label class="form-check-label" for="use_flag_y">예</label>
											</div>
											<div class="form-check form-check-inline mt-2">
												<input type="radio" id="use_flag_n" name="use_flag" class="form-check-input" value="N" <?=$checked['use_flag']['N']?>>
												<label class="form-check-label" for="use_flag_n">아니오</label>
											</div>
										</div>
									</div>

									<div class="row mb-2">
										<label for="subject" class="col-2 col-form-label bg-light">모바일 배너 URL</label>
										<div class="col-10">
											<input type="text" class="form-control mb-2" id="banner_url" name="banner_url" placeholder="https://image.directg.net/upload/banner/sample.jpg" value="<?=$banner_url?>">

											<? if($banner_url){?>
											<img src="<?=$banner_url?>" class="img-fluid">
											<? } ?>
										</div>
									</div>

									<div class="float-start">
										<a href="./group_list.php" type="button" class="btn btn-sm btn-danger btn-lg shadow-none">목록</a>
									</div>
									<div class="float-end">
										<button type="submit" class="btn btn-sm btn-primary btn-lg shadow-none">저장</button>
									</div>
								</form>
							</div> <!-- end card-body -->
						</div> <!-- end card-->
					</div> <!-- end col-->
				</div>
			</div>
			<!-- /container-fluid -->
		</div>
		<!-- /content -->
	</div>
	<!-- /content-page -->
</div>
<!-- /wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>
</body>
</html>
