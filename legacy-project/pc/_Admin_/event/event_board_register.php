<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['event'] = "active";
$sidebar_file = "sidebar_event.php";

$page_title= "이벤트 게시판 등록";


$mode = filter_input(INPUT_GET, 'mode', FILTER_SANITIZE_STRING);
$idx = filter_input(INPUT_GET, 'idx', FILTER_SANITIZE_STRING);

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

	if($idx>0){
		$query="select * from tbl_event where idx=:idx";
		$stmt = $conn->prepare($query);
		$params = array(
			":idx"=>$idx,
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		$start_date = date('Y-m-d H:i',$data['start_date']);
		$end_date = date('Y-m-d H:i',$data['end_date']);

		$mode = "modify";
		$checked['gubun'][$data["event_gubun"]]="checked";
		$checked['is_view'][$data["is_view"]]="checked";
		$selected['event_link_target'][$data["event_link_target"]] = "selected";
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">이벤트 게시판 관리</a></li>
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
						<form id="frm" name="frm" method="post" action="event_board_ps.php" class="form-horizontal">
							<input type="hidden" name="mode" value="<?=$mode?>">
							<input type="hidden" name="idx" value="<?=$idx?>">
							<div class="card">
								<div class="card-body">
									<div class="mb-2 row">
										<label for="gubun" class="col-sm-2 col-form-label bg-secondary text-white">* 이벤트 구분</label>
										<div class="col-sm-10 border p-2">
											<div class="form-check form-check-inline">
												<input type="radio" id="gubun1" name="gubun" class="form-check-input" value="1" <?=$checked['gubun']['1']?>>
												<label class="form-check-label" for="gubun1">예약구매</label>
											</div>
											<div class="form-check form-check-inline">
												<input type="radio" id="gubun2" name="gubun" class="form-check-input" value="2" <?=$checked['gubun']['2']?>>
												<label class="form-check-label" for="gubun2">네이버페이 즉시할인</label>
											</div>
											<div class="form-check form-check-inline">
												<input type="radio" id="gubun3" name="gubun" class="form-check-input" value="3" <?=$checked['gubun']['3']?>>
												<label class="form-check-label" for="gubun3">토스 즉시할인</label>
											</div>
											<div class="form-check form-check-inline">
												<input type="radio" id="gubun4" name="gubun" class="form-check-input" value="4" <?=$checked['gubun']['4']?>>
												<label class="form-check-label" for="gubun4">네이버페이 포인트 쿠폰</label>
											</div>
											<div class="form-check form-check-inline">
												<input type="radio" id="gubun6" name="gubun" class="form-check-input" value="6" <?=$checked['gubun']['6']?>>
												<label class="form-check-label" for="gubun6">DGKR 포인트</label>
											</div>
											<div class="form-check form-check-inline">
												<input type="radio" id="gubun5" name="gubun" class="form-check-input" value="5" <?=$checked['gubun']['5']?>>
												<label class="form-check-label" for="gubun5">당첨자발표</label>
											</div>
											<div class="form-check form-check-inline">
												<input type="radio" id="gubun9" name="gubun" class="form-check-input" value="9" <?=$checked['gubun']['9']?>>
												<label class="form-check-label" for="gubun9">기타</label>
											</div>
										</div>
									</div>

									<div class="mb-2 row">
										<label for="subject" class="col-sm-2 col-form-label bg-secondary text-white">* 이벤트 기간</label>
										<div class="col-sm-6">
											<div class="input-group">
												<input type="text" class="form-control form-control-sm" id="start_date" name="start_date" placeholder="이벤트시작일" value="<?=$start_date?>">
												<span class="input-group-text">~</span>
												<input type="text" class="form-control form-control-sm" id="end_date" name="end_date" placeholder="이벤트종료일" value="<?=$end_date?>">
											</div>
										</div>
									</div>

									<div class="mb-2 row">
										<label for="subject" class="col-sm-2 col-form-label bg-secondary text-white">* 이벤트 제목</label>
										<div class="col-sm-10">
											<input type="text" class="form-control" id="subject" name="subject" placeholder="" value="<?=$data['subject']?>">
										</div>
									</div>

									<div class="mb-2 row">
										<label for="contents" class="col-sm-2 col-form-label bg-secondary text-white">* 이벤트 내용</label>
										<div class="col-sm-10">
											<textarea id="contents" name="contents" class="form-control"><?=htmlspecialchars_decode($data['contents'],ENT_NOQUOTES)?></textarea>
										</div>
									</div>
									<div class="mb-2 row">
										<label for="event_notes" class="col-sm-2 col-form-label bg-secondary text-white">* 이벤트 유의사항</label>
										<div class="col-sm-10">
											<textarea id="event_notes" name="event_notes" class="form-control"><?=htmlspecialchars_decode($data['event_notes'],ENT_NOQUOTES)?></textarea>
										</div>
									</div>
									
									<div class="mb-2 row">
										<label for="event_banner" class="col-sm-2 col-form-label bg-secondary text-white">* 이벤트 배너 URL</label>
										<div class="col-sm-10">
											<input type="text" class="form-control" id="event_banner" name="event_banner" placeholder="" value="<?=$data['event_banner']?>" required>
										</div>
									</div>
									
									<div class="mb-2 row">
										<label for="event_link" class="col-sm-2 col-form-label bg-secondary text-white">* 이벤트 링크 URL</label>
										<div class="col-sm-10">
											<div type="row g-2">
												<div class="input-group">
													<div class="col-sm-2 me-2">
														 <select id="event_link_target" name="event_link_target" class="form-select">
															<option value="_self" <?=$selected['event_link_target']['_self']?>>현재창</option>
															<option value="_blank" <?=$selected['event_link_target']['_blank']?>>새창</option>
														</select>
													</div>
													<div class="col-sm-9">
														<input type="text" class="form-control" id="event_link_url" name="event_link_url" placeholder="도메인 제외입력" value="<?=$data['event_link_url']?>" required>
													</div>
												</div>
											</div>
										</div>
									</div>
									
									<div class="mb-2 row">
										<label for="is_view" class="col-sm-2 col-form-label bg-secondary text-white">* 이벤트 노출 여부</label>
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
										<label for="show_promotion" class="col-sm-2 col-form-label bg-secondary text-white">* 프로모션 노출 여부</label>
										<div class="col-sm-10 border p-2">
											<div class="form-check form-check-inline">
												<input type="radio" id="show_promotion_y" name="show_promotion" class="form-check-input" value="Y" <?=$checked['show_promotion']['Y']?>>
												<label class="form-check-label" for="show_promotion_y">예</label>
											</div>
											<div class="form-check form-check-inline">
												<input type="radio" id="show_promotion_n" name="show_promotion" class="form-check-input" value="N" <?=$checked['show_promotion']['N']?>>
												<label class="form-check-label" for="show_promotion_n">아니오</label>
											</div>
										</div>
									</div>

									<div class="mb-2 row">
										<div class="text-end">
											<button type="submit" class="btn btn-primary shadow-none">이벤트 저장</button>
										</div>
									</div>

								</div>
							</div>
						</form>
					</div>
					<div class="col-3">
					</div>
				</div>

			</div><!-- /container-fluid -->
		</div><!-- /content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<!-- SimpleMDE js -->
<script src="<?=$document_root?>/assets/js/vendor/simplemde.min.js"></script>

<script>
var simplemde = new SimpleMDE({ element: document.getElementById("contents") });
var simplemde2 = new SimpleMDE({ element: document.getElementById("event_notes") });

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
