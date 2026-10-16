<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['event'] = "active";
$sidebar_file = "sidebar_event.php";

$page_title="사은품 이벤트 진행이력";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
}

$where = [];

try{  
	//$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
	$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

	$adminEvent= new AdminEvent($conn_dgkr); 

	$add_where = "";

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

	$orderby = "idx desc";

	$event_gift_list = $adminEvent->getEventGiftList($page,$add_where,$orderby,$param);

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
										<li class="breadcrumb-item"><a href="javascript: void(0);">사은품 관리</a></li>
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
							<div class="d-flex flex-row justify-content-between mb-2">
								<div class="float-start"><? echo number_format($event_gift_list->total_results)?> 개</div>
							</div>

							<div class="table-responsive">
								<table class="table table-centered w-100 nowrap table-sm bg-white table-bordered" id="">
									<colgroup>
										<col width="3%"/>
										<col width="*"/>
										<col width="20%"/>
										<col width="5%"/>
										<col width="17%"/>
										<col width="5%"/>
										<col width="5%"/>
										<col width="5%"/>
										<col width="7%"/>
									</colgroup>
									<thead class="table-light font-13">
										<tr>
											<th class="text-center">번호</th>
											<th class="text-center">이벤트명</th>
											<th class="text-center">사은품명</th>
											<th class="text-center">사은품수량</th>
											<th class="text-center">이벤트 기간</th>
											<th class="text-center">당첨자발표</th>
											<th class="text-center">사은품발송</th>
											<th class="text-center">배송여부</th>
											<th class="text-center">당첨자현황</th>
										</tr>
									</thead>
									<tbody class="font-12 bg-white">
									<?
									if($event_gift_list->success == true){
										$result = $event_gift_list->resultset->fetchAll();

										foreach($result as $value){
											$event_member_data = $adminEvent->getEventLotteryMemberCount($value['idx'],$value['event_per_price']);
											$event_join_data = $adminEvent->getEventLotteryJoinCount($value['idx']);
											$lottery_item_data = $adminEvent->getEventLotteryItem($value['idx']);
									?>
									<tr>
										<td class="text-center px-1"><?=$value['idx']?></td>
										<td class="text-start px-1"><?=$value['title']?></td>
										<td class="text-start px-1"><?=$value['gift_nm']?></td>
										<td class="text-end px-1"><?=number_format($value['gift_count'],0)?></td>
										<td class="text-center px-1"><?=$value['start_dt']?> ~ <?=$value['end_dt']?></td>
										<td class="text-center px-1"><?=$value['event_m_date']?></td>
										<td class="text-center px-1"><?=$value['delivery_date']?></td>
										<td class="text-center px-1"><?=$value['is_delivery']?></td>
										<td class="text-center px-1"><a href="event_gift_member.php?idx=<?=$value['idx']?>" class="btn btn-outline-secondary btn-sm font-12">당첨자현황</a></td>
									</tr>
										<?	
												}
											}
										?>
									</tbody>
								</table>
							</div>

							<div class="text-center mt-3"><?echo $event_gift_list->links_html;?></div>

						</div>
						<!-- end col -->
					</div>
			</div><!-- /container-fluid -->
		</div><!-- /content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

</body>
</html>
