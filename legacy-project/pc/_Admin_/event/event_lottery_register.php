<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['event'] = "active";
$sidebar_file = "sidebar_event.php";

$page_title= "추첨 이벤트  등록";


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
			<div class="container-fluid">
				<!-- start page title -->
				<div class="row">
					<div class="col-12">
						<div class="page-title-box">
							<div class="page-title-right">
								<ol class="breadcrumb m-0">
									<li class="breadcrumb-item"><a href="javascript: void(0);">홈</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">이벤트</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">추첨 이벤트 관리</a></li>
									<li class="breadcrumb-item active"><?=$page_title?></li>
								</ol>
							</div>
							<h4 class="page-title"><?=$page_title?></h4>
						</div>
					</div>
				</div>     
				<!-- end page title --> 

				
				<div class="row">
					<div class="col-10">
						<form id="frm" name="frm" method="post" action="event_lottery_ps.php" class="form-horizontal">
							<input type="hidden" name="mode" value="<?=$mode?>">
							<input type="hidden" name="idx" value="<?=$idx?>">
							<div class="card">
								<div class="card-body">
									<div class="mb-2 row">
										<label for="event_name" class="col-sm-2 col-form-label bg-secondary text-white">* 이벤트명</label>
										<div class="col-sm-10">
											<input type="text" class="form-control form-control-sm" id="event_name" name="event_name" placeholder="" value="<?=$data['event_name']?>" required>
										</div>
									</div>
									
									<div class="mb-2 row">
										<label for="event_date" class="col-sm-2 col-form-label bg-secondary text-white">* 이벤트 기간</label>
										<div class="col-sm-6">
											<div class="input-group">
												<input type="text" class="form-control form-control-sm" id="event_start_dt" name="event_start_dt" placeholder="이벤트시작일" value="<?=$event_start_dt?>" required>
												<span class="input-group-text">~</span>
												<input type="text" class="form-control form-control-sm" id="event_end_dt" name="event_end_dt" placeholder="이벤트종료일" value="<?=$event_end_dt?>" required>
											</div>
										</div>
									</div>
									
									<div class="mb-2 row">
										<label for="event_gift" class="col-sm-2 col-form-label bg-secondary text-white">* 사은품명</label>
										<div class="col-sm-10">
											<input type="text" class="form-control form-control-sm" id="event_gift" name="event_gift" placeholder="" value="<?=$data['event_gift']?>" required>
										</div>
									</div>
									
									<div class="mb-2 row">
										<label for="event_gift_count" class="col-sm-2 col-form-label bg-secondary text-white">* 사은품 진행수량</label>
										<div class="col-sm-2">
											<input type="text" class="form-control form-control-sm" id="event_gift_count" name="event_gift_count" placeholder="" value="<?=$data['event_gift_count']?>" required>
										</div>
									</div>


								</div>
								<div class="card-footer">
									<div class="text-end">
										<button type="submit" class="btn btn-primary btn-sm">이벤트 등록</button>
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

<script>

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
