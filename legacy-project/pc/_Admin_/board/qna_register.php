<?php
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['board'] = "active";
$page_title = "고객문의";
$sidebar_file = "sidebar_board.php";

$mode = filter_input(INPUT_GET, 'mode', FILTER_SANITIZE_STRING);
$idx = filter_input(INPUT_GET, 'idx', FILTER_SANITIZE_STRING);

if (!$mode) {
    $mode = "update";
}

try {
    $conn_dgkr = new PDO($dsn_dgkr, DGKR_USER, DGKR_PASSWORD);

    $conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);
    $admin = new Admin($conn_dgkr);
    $parsedown = new Parsedown();

    $query = "SELECT * FROM tbl_qna WHERE idx = :idx";
    $stmt = $conn_dgkr->prepare($query);
    $params = array(
        ":idx" => $idx,
    );
    $stmt->execute($params);
    $data = $stmt->fetch();

    $file_query = "SELECT * FROM tbl_file WHERE table_name = 'tbl_qna' AND puid = :notice_idx";
    $stmt = $conn_dgkr->prepare($file_query);
    $params = array(
        ":notice_idx" => $idx,
    );
    $stmt->execute($params);
    $file_data = $stmt->fetchAll();

    $q_string = [];

    foreach ($_GET as $key => $value) {
        if ($key == "idx") {
            continue;
        } else {
            $q_string[] = "{$key}={$value}";
        }
    }

    $q_string = implode("&", $q_string);
} catch (PDOException $e) {
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

				<form id="frm" name="frm" method="post" action="./qna_ps.php" class="form-horizontal">
					<input type="hidden" name="mode" value="<?=$mode?>">
					<input type="hidden" name="idx" value="<?=$data["idx"]?>">
					<input type="hidden" name="answer" value="">
				</form>

				<!-- start page title -->
				<div class="row">
					<div class="col-12">
						<div class="page-title-box">
							<div class="page-title-right">
								<ol class="breadcrumb m-0">
									<li class="breadcrumb-item"><a href="javascript: void(0);">홈</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">게시판</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">문의하기 관리</a></li>
									<li class="breadcrumb-item active">문의하기 답변</li>
								</ol>
							</div>
							<h4 class="page-title">문의하기 답변</h4>
						</div>
					</div>
				</div>
				<!-- end page title -->

				<div class="row">
					<div class="col-12">
						<table class="table table-bordered table-centered table-sm" style="border: 1px solid #dbe0e5;">
							<tbody class="bg-white font-14">
								<tr>
									<th class="table-light" scope="row">작성자</th>
									<td class=""><?=$data['user_id']?></td>
									<th class="table-light" scope="row">작성일</th>
									<td><?=$data['reg_date']?></td>
								</tr>
								<tr>
									<th class="table-light" scope="row">제목</th>
									<td colspan="3"><?=$data['subject']?></td>
								</tr>
								<tr>
									<th class="table-light" scope="row">내용</th>
									<td colspan="3"><?=$parsedown->text(htmlspecialchars_decode(nl2br($data['contents'])))?></td>
								</tr>
								<tr>
									<th class="table-light" scope="row">첨부파일</th>
									<td colspan="3">
										<?php
										foreach($file_data as $file) {
											?>
											<ul class="pdl0" id="uploadBox">
												<li class="form-inline mgb5" style="width:100%">
													<img src="<?=$file['reg_date']>'2025-08-19 00:00:00'?"https://directg.net":""?>/upload/qna/<?=$file['filename']?>" style="max-width:1280px;">
												</li>
											</ul>
											<?php
										}
										?>
									</td>
								</tr>
								<tr>
									<th class="table-light" scope="row">답변</th>
									<td colspan="3">
										<textarea id="answer" name="" class="form-control rounded-0" style="height: 400px;"><?=$data['answer']?></textarea>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>

				<div class="text-center">
					<a href="./qna_list.php<?=($q_string)?"?{$q_string}":""?>" class="btn btn-primary">목록가기</a>
					<button type="button" id="btn_answer_save" class="btn btn-primary shadow-none">답변하기</button>
				</div>

			</div><!-- /container-fluid -->
		</div><!-- /content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js" integrity="sha384-nvAa0+6Qg9clwYCGGPpDQLVpLNn0fRaROjHqs13t4Ggj3Ez50XnGQqc/r8MhnRDZ" crossorigin="anonymous"></script>
<script type="text/javascript" src="<?=$document_root?>/smarteditor2/js/service/HuskyEZCreator.js" charset="utf-8"></script>
<script>
    let oEditors = [];
    let sLang = "ko_KR";

    nhn.husky.EZCreator.createInIFrame({
        oAppRef: oEditors,
        elPlaceHolder: "answer",
        sSkinURI: "/_Admin_/smarteditor2/SmartEditor2Skin.html",
        htParams : {
            bUseToolbar : true,
            bUseVerticalResizer : true,
            bUseModeChanger : true,
            bSkipXssFilter : true,
            fOnBeforeUnload : function(){},
            I18N_LOCALE : sLang
        },
        fOnAppLoad : function(){},
        fCreator: "createSEditor2"
    });

    $(document).ready(function(){
        $("#btn_answer_save").bind("click",function(){
            oEditors.getById["answer"].exec("UPDATE_CONTENTS_FIELD", []);
            let answer = oEditors.getById["answer"].getIR();
            $('input[name="answer"]').val(answer);

            $('#frm').submit();
        });
    });
</script>
</body>
</html>
