<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['event'] = "active";
$sidebar_file = "sidebar_event.php";

$page_title= "이벤트 게시판 수정";


$mode = filter_input(INPUT_GET, 'mode', FILTER_SANITIZE_STRING);
$idx = filter_input(INPUT_GET, 'idx', FILTER_SANITIZE_STRING);

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

	if($idx>0){
		//이벤트 정보
		$query="select * from tbl_event where idx=:idx";
		$stmt = $conn->prepare($query);
		$params = array(
			":idx"=>$idx,
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		$start_date = date('Y-m-d H:i',$data['start_date']);
		$end_date = date('Y-m-d H:i',$data['end_date']);
		
		//이벤트 상품 목록
		$event_goods_query="select * from tbl_event_goods where event_no=:event_no order by product_name asc";
		$stmt = $conn->prepare($event_goods_query);
		$params = array(
			":event_no"=>$idx,
		);
		$stmt->execute($params);
		$event_goods_data = $stmt->fetchAll();

		$mode = "modify";
		$checked['gubun'][$data["event_gubun"]]="checked";
		$checked['is_view'][$data["is_view"]]="checked";
		$checked['show_promotion'][$data["show_promotion"]]="checked";
		$selected['event_link_target'][$data["event_link_target"]] = "selected";
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
					<div class="col-8">
						<form id="frm" name="frm" method="post" action="event_board_ps.php" class="form-horizontal">
							<input type="hidden" name="mode" value="modify">
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
					<div class="col-4">
						<div class="card">
							<div class="card-header bg-secondary text-white fw-bold font-14">이벤트 배너</div>
							<img src="<?=$data['event_banner']?>" class="img-fluid">
						</div>
						
						<div class="card">
							<div class="card-header bg-secondary text-white fw-bold font-14">이벤트 상품</div>
							<div class="card-body p-0 font-12">
								<ul class="list-group">
								<?
									foreach($event_goods_data as $event_goods){
								?>
									<li class="list-group-item d-flex justify-content-between align-items-center">
										<div><?=$event_goods['product_code']?> / <?=$event_goods['product_name']?></div>
										<button class="btn btn-sm btn_event_goods_delete" data-idx="<?=$event_goods['idx']?>"><i class="mdi mdi-delete font-16"></i></button>
									</li>
								<?
									}
								?>
								</ul>
							</div>
							<div class="card-footer px-1">
								<div class="d-flex flex-row">
									<div class="input-group">
										<input type="input" name="search_value" id="search_value" class="form-control form-control-sm" required placeholder="검색할 옵션상품명이나 옵션상품코드를 입력해 주세요">
										<button type="button" class="btn btn-secondary btn-sm shadow-none" id="btn_option_find" data-idx="<?=$data['idx']?>" >옵션상품 검색</button>
									</div>
								</div>
							</div>
						</div>


						<div class="card">
							<div class="card-header bg-secondary text-white fw-bold font-14">그룹상품 가져오기</div>
							<div class="card-footer px-1">
								<div class="d-flex flex-row">
									<div class="input-group">
										<input type="input" name="search_group_code" id="search_group_code" class="form-control form-control-sm" required placeholder="검색할 그룹코드를 입력해 주세요">
										<button type="button" class="btn btn-secondary btn-sm shadow-none" id="btn_group_find" data-idx="<?=$data['idx']?>" >그룹 검색</button>
									</div>
								</div>
							</div>
						</div>


					</div>
				</div>

			</div><!-- /container-fluid -->
		</div><!-- /content -->
	</div><!-- /content-page -->

	<!--옵션상품 검색 팝업-->
	<div id="option-modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="option-modalLabel" aria-hidden="true">
			<div class="modal-dialog modal-lg" style="max-width:1100px">
				<div class="modal-content">
					<div class="modal-header modal-colored-header bg-primary">
						<h4 class="modal-title" id="option-modalLabel">옵션상품 검색결과</h4>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-hidden="true"></button>
					</div>
					<div class="modal-body p-0">
						<form class="form-horizontal">
							<input type="hidden" name="event_no" id="event_no">
							<table class="table table-border mb-0 table-sm" id="option_info">
							<thead class="table-dark font-14">
							<tr>
								<th class="text-center" style="width:80px">옵션상품<br/>번호</th>
								<th class="text-center" style="width:350px">옵션상품명<br/>(영문명)</th>
								<th class="text-center" style="width:100px">플랫폼</th>
								<th class="text-center" style="width:150px">퍼블리셔</th>
								<th class="text-center" style="width:150px">게임옵션<br/>(번들옵션)</th>
								<th class="text-center" style="width:100px">판매상태</th>
								<th class="text-center" style="width:100px">비고</th>
							</tr>
							</thead>
							<tbody class="font-13">
							</tbody>
							</table>
						</form>
					</div>
				</div><!-- /.modal-content -->
			</div><!-- /.modal-dialog -->
	</div><!-- /.modal -->

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
	
	//옵션상품  game 검색
	$("#btn_option_find").bind("click",function(){
		var event_no = $(this).attr("data-idx");
		var search_value = $("#search_value").val();

		if(search_value==""){
			alert("검색할 옵션상품명이나 옵션상품코드를 입력해주세요.");
			return;
		}

		$.ajax({
			 type: "POST",
			 url: "event_board_ps.php",
			 data: {mode:"goods_option_search",search_value:search_value,event_no:event_no},
			 success: function (data, status) {
				$("#option-modal input[name='event_no']").val(event_no);
				$("#option-modal #option_info tbody").html(data);
				$("#option-modal").modal('show');
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	
	//옵션상품  game 검색
	$("#btn_group_find").bind("click",function(){
		var event_no = $(this).attr("data-idx");
		var search_value = $("#search_group_code").val();

		if(search_value==""){
			alert("검색할 그룹코드를 입력해주세요.");
			return;
		}

		$.ajax({
			 type: "POST",
			 url: "event_board_ps.php",
			 data: {mode:"group_search",search_value:search_value,event_no:event_no},
			 success: function (data, status) {
				$("#option-modal input[name='event_no']").val(event_no);
				$("#option-modal #option_info tbody").html(data);
				$("#option-modal").modal('show');
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	
	//이벤트 옵션상품 추가
	$(document).on('click', '#option-modal .btn_option_add', function(e){
		e.preventDefault();
		var index = $('.btn_option_add').index(this);
		var event_no =  $("#option-modal #event_no").val();
		var product_code = $("#option-modal input[name='product_code[]']").eq(index).val();
		var product_name = $("#option-modal input[name='product_name[]']").eq(index).val();
		
		$.ajax({
			 type: "POST",
			 url: "event_board_ps.php",
			 data: {mode:"event_goods_add",product_code:product_code,product_name:product_name,event_no:event_no},
			 success: function (data, status) {
				//alert(data);
				$("#option-modal").modal('hide');
				//$("#package-modal").removeData('bs.modal').find(".modal-content").html('');
				location.reload();
				
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
	
	//이벤트 옵션상품 삭제
	$(".btn_event_goods_delete").bind("click",function(){
		var index = $(".btn_event_goods_delete").index(this);
		var idx = $(".btn_event_goods_delete").eq(index).attr("data-idx");
		
		if(confirm("해당 이벤트 옵션상품을 삭제하시겠습니까?")){
			$.ajax({
				 type: "POST",
				 url: "event_board_ps.php",
				 data: {mode:"event_goods_delete",idx:idx},
				 success: function (data, status) {
					location.reload();
				 },
				error: function(data){
					 alert(data);
				 }
			});
		}
	});

	//이벤트 옵션상품 추가
	$(document).on('click', '#option-modal .btn_option_add_all', function(e){
		e.preventDefault();
		var index = $('.btn_option_add_all').index(this);
		var event_no =  $("#option-modal #event_no").val();
		var group_code = $(this).attr("data-group-code");

		$.ajax({
			 type: "POST",
			 url: "event_board_ps.php",
			 data: {mode:"group_item_add",group_code:group_code,event_no:event_no},
			 success: function (data, status) {
				$("#option-modal").modal('hide');
//				location.reload();
console.log(data);
				
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
});

</script>
</body>
</html>
