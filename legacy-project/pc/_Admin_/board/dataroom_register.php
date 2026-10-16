<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['board'] = "active";
$page_title = "자료실 파일 등록";
$sidebar_file = "sidebar_board.php";

$mode = filter_input(INPUT_GET, 'mode', FILTER_SANITIZE_STRING);
$idx = filter_input(INPUT_GET, 'idx', FILTER_SANITIZE_STRING);

if(!$mode){
	$mode="register";
}

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

	switch($mode){
		case "modify":
			$query="SELECT * FROM tbl_dataroom WHERE idx=:idx";
			$stmt = $conn->prepare($query);
			$params = array(
				":idx"=>$idx,
			);
			$stmt->execute($params);
			$data = $stmt->fetch();

			$checked['file_type'][$data["file_type"]]="checked";
			$checked['is_encode'][$data["is_encode"]]="checked";
			$checked['encode_type'][$data["encode_type"]]="checked";
			$checked['is_free'][$data["is_free"]]="checked";
			$checked['is_view'][$data["is_view"]]="checked";
		break;
	}

	//신규 등록 시 노출여부 기본값 '숨김(N)'
	if($mode=="register"){
		$checked['is_view']['N']="checked";
	}

}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}
?>
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php'); ?>
<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
<link href="<?=$document_root?>/assets/css/vendor/simplemde.min.css" rel="stylesheet" type="text/css" />
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
						<form enctype="multipart/form-data" id="frm" name="frm" method="post" action="dataroom_ps.php" class="form-horizontal">
							<input type="text" name="mode" value="<?=$mode?>">
							<input type="text" name="idx" value="<?=$data["idx"]?>">
							<div class="card">
								<div class="card-body p-2">
									<div class="row g-0 mb-2 border">
										<label for="file_type" class="col-sm-2 col-form-label bg-secondary text-white ps-2">* 파일유형</label>
										<div class="col-sm-10 p-2">
											<div class="form-check form-check-inline">
												<input type="radio" id="file_type1" name="file_type" class="form-check-input" value="P" <?=$checked['file_type']['P']?>>
												<label class="form-check-label" for="file_type1">한글패치</label>
											</div>
											<div class="form-check form-check-inline">
												<input type="radio" id="file_type2" name="file_type" class="form-check-input" value="C" <?=$checked['file_type']['C']?>>
												<label class="form-check-label" for="file_type2">컨텐츠</label>
											</div>
										</div>
									</div>

									<div class="row g-0 mb-2 border-0">
										<label for="file_name" class="col-sm-2 col-form-label bg-secondary text-white ps-2">* 제공 파일명</label>
										<div class="col-sm-10">
											<input type="text" class="form-control rounded-0" id="file_name" name="file_name" value="<?=$data['file_name']?>">
										</div>
									</div>

									<div class="row g-0 mb-2 border-0">
										<label for="file_url" class="col-sm-2 col-form-label bg-secondary text-white ps-2">* 제공 파일 URL</label>
										<div class="col-sm-10">
											<input type="text" class="form-control rounded-0" id="file_url" name="file_url" value="<?=$data['file_url']?>">
										</div>
									</div>

									<div class="row g-0 mb-2 border">
										<label for="is_encode" class="col-sm-2 col-form-label bg-secondary text-white ps-2">* 암호화 여부</label>
										<div class="col-sm-10 p-2">
											<div class="form-check form-check-inline">
												<input type="radio" id="is_encode_y" name="is_encode" class="form-check-input" value="Y" <?=$checked['is_encode']['Y']?>>
												<label class="form-check-label" for="is_encode_y">Y</label>
											</div>
											<div class="form-check form-check-inline">
												<input type="radio" id="is_encode_n" name="is_encode" class="form-check-input" value="N" <?=$checked['is_encode']['N']?>>
												<label class="form-check-label" for="is_encode_n">N</label>
											</div>
										</div>
									</div>

									<div class="row g-0 mb-2 border">
										<label for="encode_type" class="col-sm-2 col-form-label bg-secondary text-white ps-2">* 암호화 방식</label>
										<div class="col-sm-10 p-2">
											<div class="form-check form-check-inline">
												<input type="radio" id="encode_type_1" name="encode_type" class="form-check-input" value="base64" <?=$checked['encode_type']['base64']?>>
												<label class="form-check-label" for="encode_type_1">base64</label>
											</div>
											<div class="form-check form-check-inline">
												<input type="radio" id="encode_type_2" name="encode_type" class="form-check-input" value="md5" <?=$checked['encode_type']['md5']?>>
												<label class="form-check-label" for="encode_type_2">md5</label>
											</div>
											<div class="form-check form-check-inline">
												<input type="radio" id="encode_type_3" name="encode_type" class="form-check-input" value="N" <?=$checked['encode_type']['N']?>>
												<label class="form-check-label" for="encode_type_3">없음</label>
											</div>
										</div>
									</div>

									<div class="row g-0 mb-2 border">
										<label for="is_free" class="col-sm-2 col-form-label bg-secondary text-white ps-2">* 제공조건</label>
										<div class="col-sm-10 p-2">
											<div class="form-check form-check-inline">
												<input type="radio" id="is_free_y" name="is_free" class="form-check-input" value="Y" <?=$checked['is_free']['Y']?>>
												<label class="form-check-label" for="is_free_y">무료</label>
											</div>
											<div class="form-check form-check-inline">
												<input type="radio" id="is_free_n" name="is_free" class="form-check-input" value="N" <?=$checked['is_free']['N']?>>
												<label class="form-check-label" for="is_free_n">유료</label>
											</div>
										</div>
									</div>

									<div class="row g-0 mb-2 border">
										<label for="is_view" class="col-sm-2 col-form-label bg-secondary text-white ps-2">* 노출여부</label>
										<div class="col-sm-10 p-2">
											<div class="form-check form-check-inline">
												<input type="radio" id="is_view_y" name="is_view" class="form-check-input" value="Y" <?=$checked['is_view']['Y']?>>
												<label class="form-check-label" for="is_view_y">노출</label>
											</div>
											<div class="form-check form-check-inline">
												<input type="radio" id="is_view_n" name="is_view" class="form-check-input" value="N" <?=$checked['is_view']['N']?>>
												<label class="form-check-label" for="is_view_n">숨김</label>
											</div>
										</div>
									</div>

									<div class="row g-0 mb-2 border-0 ">
										<label for="deploy_date" class="col-sm-2 col-form-label bg-secondary text-white ps-2">* 배포일자</label>
										<div class="col-sm-3 px-2">
											<div class="input-group">
												<input type="text" class="form-control rounded-0 date" id="deploy_date" name="deploy_date" placeholder="예)YYYY-MM-DD" value="<?=$data['deploy_date']?>" data-mask-format="0000-00-00">
											</div>
										</div>
									</div>

									<div class="row g-0 mb-2 border-0">
										<label for="file_url" class="col-sm-2 col-form-label bg-secondary text-white ps-2">썸네일</label>
										<div class="col-sm-10">
											<input type="file" class="form-control rounded-0" id="thumbnail" name="thumbnail" value="<?=$data['file_url']?>">
										</div>
										<?php if($mode=="modify"){ ?>
										<div class="col-sm-12 mt-2 text-center">
											<img src="/upload/dataroom/<?=$data['thumbnail']?>"><br><?=$data['thumbnail']?>
										</div>
										<?php } ?>
									</div>

									<div class="row g-0 mb-2 border-0">
										<label for="file_url" class="col-sm-2 col-form-label bg-secondary text-white ps-2">설명</label>
										<div class="col-sm-10">
											<textarea class="form-control rounded-0" id="contents" name="contents"><?=$data['contents']?></textarea>
										</div>
									</div>

								</div>
							</div>
							<div class="row mb-2">
								<div class="text-end">
									<button type="submit" class="btn btn-primary shadow-none">자료실 파일 저장</button>
								</div>
							</div>
						</form>
					</div>
				</div>

			</div><!-- /container-fluid -->
		</div><!-- /content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script src="<?=$document_root?>/assets/js/vendor/simplemde.min.js"></script>
<script src="<?=$document_root?>/assets/js/pages/demo.timepicker.js"></script>
<script>
var simplemde = new SimpleMDE({ element: document.getElementById("contents") });

$(document).ready(function(){
	$("#frm").submit(function( event ) {
		var contents = simplemde.value();
		var new_form = $('#frm');
		new_form.append($('<input/>', {type: 'hidden', name: 'simplemde', value:simplemde.value()}));
		new_form.submit();
		return false;
	});
});
</script>
</body>
</html>
