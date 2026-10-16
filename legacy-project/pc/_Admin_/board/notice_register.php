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

	if($idx>0){
		$mode="modify";
		$query="select * from tbl_notice where idx=:idx";
		$stmt = $conn->prepare($query);
		$params = array(
			":idx"=>$idx,
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		$notice_data['subject'] =$data["subject"];
		$notice_data['contents'] =htmlspecialchars_decode($data["contents"]);

		$checked['is_notice'][$data["is_notice"]]="checked";
		$checked['is_view'][$data["is_view"]]="checked";
		$checked['notice_type'][$data["notice_type"]]="checked";
	}else{
		$gubun = "1";
		$mode="regitster";
		$checked['notice_type'][$gubun]="checked";
	}

}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}
?>
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php'); ?>
<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
<link href="<?=$document_root?>/assets/css/vendor/simplemde.min.css" rel="stylesheet" type="text/css" />
<style>
.CodeMirror { font-size: 0.875rem; }
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
									<li class="breadcrumb-item active">공지사항 등록</li>
								</ol>
							</div>
							<h4 class="page-title">공지사항 등록</h4>
						</div>
					</div>
				</div>
				<!-- end page title -->

				<div class="row">
					<div class="col-8">
						<form id="frm" name="frm" method="post" action="notice_ps.php" class="form-horizontal">
							<input type="hidden" name="mode" value="<?=$mode?>">
							<input type="hidden" name="idx" value="<?=$data["idx"]?>">
							<div class="card">
								<div class="card-body p-0">
									<div class="row g-0 mb-2 border">
										<label for="notice_type" class="col-sm-2 col-form-label bg-secondary text-white ps-2">* 공지사항 구분</label>
										<div class="col-sm-10 p-2">
											<div class="form-check form-check-inline">
												<input type="radio" id="notice_type1" name="notice_type" class="form-check-input" value="1" <?=$checked['notice_type']['1']?>>
												<label class="form-check-label" for="notice_type1">제품코드(키) 발송</label>
											</div>
											<div class="form-check form-check-inline">
												<input type="radio" id="notice_type2" name="notice_type" class="form-check-input" value="2" <?=$checked['notice_type']['2']?>>
												<label class="form-check-label" for="notice_type2">프로모션</label>
											</div>
											<div class="form-check form-check-inline">
												<input type="radio" id="notice_type3" name="notice_type" class="form-check-input" value="3" <?=$checked['notice_type']['3']?>>
												<label class="form-check-label" for="notice_type3">상품 출시/판매</label>
											</div>
											<div class="form-check form-check-inline">
												<input type="radio" id="notice_type4" name="notice_type" class="form-check-input" value="4" <?=$checked['notice_type']['4']?>>
												<label class="form-check-label" for="notice_type4">기타</label>
											</div>
										</div>
									</div>

									<div class="row g-0 mb-2 border-0">
										<label for="subject" class="col-sm-2 col-form-label bg-secondary text-white ps-2">* 공지사항 제목</label>
										<div class="col-sm-10">
											<input type="text" class="form-control rounded-0" id="subject" name="subject" value="<?=$notice_data['subject']?>">
										</div>
									</div>

									<div class="row g-0 mb-2 border-0">
										<label for="contents" class="col-sm-2 col-form-label bg-secondary text-white ps-2">* 공지사항 내용</label>
										<div class="col-sm-10 px-2">
											<textarea id="contents" name="contents" class="form-control rounded-0"><?=htmlspecialchars_decode($notice_data['contents'],ENT_NOQUOTES)?></textarea>
										</div>
									</div>

									<div class="row g-0 mb-2 border">
										<label for="is_notice" class="col-sm-2 col-form-label bg-secondary text-white ps-2">* 고정 여부</label>
										<div class="col-sm-10 p-2">
											<div class="form-check form-check-inline">
												<input type="radio" id="is_notice_y" name="is_notice" class="form-check-input" value="Y" <?=$checked['is_notice']['Y']?>>
												<label class="form-check-label" for="is_notice_y">예</label>
											</div>
											<div class="form-check form-check-inline">
												<input type="radio" id="is_notice_n" name="is_notice" class="form-check-input" value="N" <?=$checked['is_notice']['N']?>>
												<label class="form-check-label" for="is_notice_n">아니오</label>
											</div>
										</div>
									</div>

									<div class="row g-0 mb-2 border">
										<label for="is_view" class="col-sm-2 col-form-label bg-secondary text-white ps-2">* 노출 여부</label>
										<div class="col-sm-10 p-2">
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

									<div class="row g-0 mb-2 border-0 ">
										<label for="deploy_date" class="col-sm-2 col-form-label bg-secondary text-white ps-2">* 배포일자</label>
										<div class="col-sm-3 px-2">
											<div class="input-group">
												<input type="text" class="form-control rounded-0 date" id="deploy_date" name="deploy_date" placeholder="배포일자 예)YYYY-MM-DD H:i:s" value="<?=$data['deploy_date']?>" data-mask-format="0000-00-00 00:00:00">
											</div>
										</div>
									</div>

								</div>
							</div>
							<div class="row mb-2">
								<div class="text-end">
									<button type="submit" class="btn btn-primary shadow-none">공지사항 저장</button>
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
</script>
</body>
</html>
