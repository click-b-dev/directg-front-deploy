<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['event'] = "active";
$sidebar_file = "sidebar_event.php";

$page_title="이벤트게시판";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$is_view = filter_input(INPUT_GET, 'is_view', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
}

$where = [];

$start_date = date('Y-m-d');
$end_date = date("Y-m-d", strtotime($treatDateEnd.' -0day'));


try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

	$adminBoard= new AdminBoard($conn); 
	$parsedown= new Parsedown();

	$add_where = "";

	if ($is_view != "") {
		$where[] = " is_view = '{$is_view}'";
	}

	foreach($where as $value){
		$add_where.= " and ".$value;
	}

	//echo $add_where;

	foreach($_GET as $key=>$value){
		if($key<>"page" ){
			if($value<>""){
				$param.="&".$key."=".$value;
			}
		}
	}

	$orderby = "is_view desc,start_date desc";

	$event_list = $adminBoard->getEventList($page,$add_where,$orderby,$param);

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

$event_gubun_text = array(
	"1"=>"예약구매",
	"2"=>"네이버페이 즉시할인",
	"3"=>"토스 즉시할인",
	"4"=>"네이버페이 포인트 쿠폰",
	"5"=>"당첨자발표",
	"6"=>"DGKR 포인트",
);

$selected['is_view'][$is_view] = "selected";
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">이벤트게시판 관리</a></li>
									<li class="breadcrumb-item active">이벤트게시판 목록</li>
								</ol>
							</div>
							<h4 class="page-title">이벤트게시판 목록</h4>
						</div>
					</div>
				</div>     
				<!-- end page title --> 

				<div class="d-flex flex-row justify-content-between mb-2">
					<div class="float-start"><?=number_format($event_list->total_results)?> 개</div>
					<div class="float-end"><a href="<?=$document_root?>/event/event_board_register.php" class="btn btn-danger shadow-none">이벤트 게시판 등록</a></div>
				</div>

				<div class="row">
					<div class="col-10">
						<div class="container">
							<?
								if($event_list->success == true){
									$result = $event_list->resultset->fetchAll();

									foreach($result as $value){
								?>
							<div class="card mb-4">
								<div class="card-header p-2">
									<div class="float-start">
										<span>노출 기간</span>: <?=date('Y-m-d H:i:s',$value['start_date'])?> ~ <?=date('Y-m-d H:i:s',$value['end_date'])?>
										<span class="badge bg-secondary font-14"><?=($value['is_view']=="Y")?"노출함":"노출안함"?></span>
										
										<div class="d-block mt-1">
											<span class="fw-bold pe-1">프로모션 노출 여부</span>
											<span class="badge bg-secondary font-14"><?=($value['show_promotion']=="Y")?"노출함":"노출안함"?></span>
										</div>
									</div>
									<div class="float-end">
										<?if($value['event_gubun']<>'5'){?>
										<a href="../statistics/event/event_order_count.php?event_no=<?=$value['idx']?>" target="_blank" class="btn btn-sm btn-info shadow-none me-1">이벤트 통계</a>
										<?}?>
										
										<a href="event_board_modify.php?idx=<?=$value['idx']?>" class="btn btn-sm btn-light shadow-none border"> <i class="mdi mdi-square-edit-outline font-14"></i> 이벤트 수정</a>
									</div>
								</div>
								<div class="card-body p-0">
									<div class="card mb-0 rounded-0">
										<div class="row g-0">
											<div class="col-md-5">
												<a href="<?=$value['event_link_url']?>" target="_blank"><img src="<?=$value['event_banner']?>" class="img-fluid rounded-0 h-100"></a>
											</div>
											<div class="col-md-7">
												<div class="card-body p-2">
													<span class="badge bg-secondary mb-2"><?=$event_gubun_text[$value['event_gubun']]?></span>
													<h4 class="card-title mb-3"><?=$value['subject']?></h4>
													<div class="event_contents"><?=$parsedown->text(htmlspecialchars_decode($value['contents'],ENT_NOQUOTES))?></div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
							<?
									}
								}
							?>
						</div>
						<div class="text-center mt-3"><?echo $event_list->links_html;?></div>

					</div>
					<!-- end col -->
					
					<div class="col-2">
						<form id="search-form" class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
							<span class="fw-bold d-block mb-1">이벤트 노출 여부</span>
							<select class="form-select" name="is_view" onchange="this.form.submit()">
								<option value="">전체</option>
								<option value="Y" <?=$selected['is_view']['Y']?>>노출함</option>
								<option value="N" <?=$selected['is_view']['N']?>>노출안함</option>
							</select>
						</form>
					</div>
				</div>


			</div><!-- /container-fluid -->
		</div><!-- /content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

</body>
</html>