<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['board'] = "active";
$page_title = "자주묻는질문 등록";
$sidebar_file = "sidebar_board.php";

$mode = filter_input(INPUT_GET, 'mode', FILTER_SANITIZE_STRING);
$idx = filter_input(INPUT_GET, 'idx', FILTER_SANITIZE_STRING);

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

	switch($mode){
		case "register":
			$faq_data['question'] ="";
			$faq_data['answer'] ="";
		break;
		case "modify":
			$query="select * from tbl_faq where idx=:idx";
			$stmt = $conn->prepare($query);
			$params = array(
				":idx"=>$idx,
			);
			$stmt->execute($params);
			$data = $stmt->fetch();

			$faq_data['question'] =$data["question"];
			$faq_data['answer'] =htmlspecialchars_decode($data["answer"]);
			$checked['faq_type'][$data['faq_type']]="checked";
		break;
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">자주묻는질문 관리</a></li>
									<li class="breadcrumb-item active">자주묻는질문 등록</li>
								</ol>
							</div>
							<h4 class="page-title">자주묻는질문 등록</h4>
						</div>
					</div>
				</div>
				<!-- end page title -->

				<div class="row">
					<div class="col-12">
						<form id="frm" name="frm" method="post" action="faq_ps.php" class="form-horizontal">
							<input type="hidden" name="mode" value="<?=$mode?>">
							<input type="hidden" name="idx" value="<?=$idx?>">
							<div class="card">
								<div class="card-body p-2">
									<div class="mb-2 row">
										<label for="faq_type" class="col-sm-1 col-form-label bg-secondary text-white">* 구분</label>
										<div class="col-sm-11">
											<div class="btn-group" role="group" aria-label="Basic radio toggle button group">
												<input type="radio" class="btn-check" name="faq_type" id="item_cd_1" autocomplete="off" value="S01" <?=$checked['faq_type']['S01']?>><label class="btn btn-outline-primary" for="item_cd_1">이용방법</label>
												<input type="radio" class="btn-check" name="faq_type" id="item_cd_2" autocomplete="off" value="M01" <?=$checked['faq_type']['M01']?>><label class="btn btn-outline-primary" for="item_cd_2">계정, 회원</label>
												<input type="radio" class="btn-check" name="faq_type" id="item_cd_3" autocomplete="off" value="O01" <?=$checked['faq_type']['O01']?>><label class="btn btn-outline-primary" for="item_cd_3">주문, 결제</label>
												<input type="radio" class="btn-check" name="faq_type" id="item_cd_4" autocomplete="off" value="O03" <?=$checked['faq_type']['O03']?>><label class="btn btn-outline-primary" for="item_cd_4">취소, 환불</label>
												<input type="radio" class="btn-check" name="faq_type" id="item_cd_5" autocomplete="off" value="O02" <?=$checked['faq_type']['O02']?>><label class="btn btn-outline-primary" for="item_cd_5">제품 코드(키)</label>
												<input type="radio" class="btn-check" name="faq_type" id="item_cd_6" autocomplete="off" value="S02" <?=$checked['faq_type']['S02']?>><label class="btn btn-outline-primary" for="item_cd_6">게임 등록</label>
												<input type="radio" class="btn-check" name="faq_type" id="item_cd_7" autocomplete="off" value="G02" <?=$checked['faq_type']['G02']?>><label class="btn btn-outline-primary" for="item_cd_7">구성, DLC</label>
												<input type="radio" class="btn-check" name="faq_type" id="item_cd_8" autocomplete="off" value="G03" <?=$checked['faq_type']['G03']?>><label class="btn btn-outline-primary" for="item_cd_8">특전</label>
												<input type="radio" class="btn-check" name="faq_type" id="item_cd_9" autocomplete="off" value="S04" <?=$checked['faq_type']['S04']?>><label class="btn btn-outline-primary" for="item_cd_9">게임 실행</label>
												<input type="radio" class="btn-check" name="faq_type" id="item_cd_10" autocomplete="off" value="S03" <?=$checked['faq_type']['S03']?>><label class="btn btn-outline-primary" for="item_cd_10">게임 설치</label>
												<input type="radio" class="btn-check" name="faq_type" id="item_cd_11" autocomplete="off" value="G04" <?=$checked['faq_type']['G04']?>><label class="btn btn-outline-primary" for="item_cd_11">한글</label>
												<input type="radio" class="btn-check" name="faq_type" id="item_cd_12" autocomplete="off" value="O04" <?=$checked['faq_type']['O04']?>><label class="btn btn-outline-primary" for="item_cd_12">가격</label>
												<input type="radio" class="btn-check" name="faq_type" id="item_cd_13" autocomplete="off" value="G01" <?=$checked['faq_type']['G01']?>><label class="btn btn-outline-primary" for="item_cd_13">상품</label>
												<input type="radio" class="btn-check" name="faq_type" id="item_cd_14" autocomplete="off" value="O05" <?=$checked['faq_type']['O05']?>><label class="btn btn-outline-primary" for="item_cd_14">할인</label>
												<input type="radio" class="btn-check" name="faq_type" id="item_cd_15" autocomplete="off" value="E01" <?=$checked['faq_type']['E01']?>><label class="btn btn-outline-primary" for="item_cd_15">기타</label>
												<input type="radio" class="btn-check" name="faq_type" id="item_cd_16" autocomplete="off" value="M02" <?=$checked['faq_type']['M02']?>><label class="btn btn-outline-primary" for="item_cd_16">포인트</label>
											</div>
										</div>
									</div>

									<div class="mb-2 row">
										<label for="question" class="col-sm-1 col-form-label bg-secondary text-white">* 질문</label>
										<div class="col-sm-11">
											<input type="text" class="form-control form-control-sm" id="question" name="question" value="<?=$faq_data['question']?>">
										</div>
									</div>

									<div class="mb-2 row">
										<label for="answer" class="col-sm-1 col-form-label bg-secondary text-white">* 답변</label>
										<div class="col-sm-11">
											<textarea id="answer" name="answer" class="form-control"><?=$faq_data['answer']?></textarea>
										</div>
									</div>

									<div class="row mb-2">
										<div class="text-end">
											<button type="submit" class="btn btn-primary shadow-none">자주묻는질문 저장</button>
										</div>
									</div>
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
<script>
var simplemde = new SimpleMDE({ element: document.getElementById("answer") });
</script>
</body>
</html>
