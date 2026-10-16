<?
$sidebar_file = "sidebar_promotion.php";
	header('Content-Type: text/html; charset=UTF-8');
	ini_set( "display_errors", 1 );
	error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

	include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
	$topmenu['promotion'] = "active";

	$page_title="할인 프로모션 동기화";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
}

$where = [];

//$where[] = "timestampdiff(second,now(),promotion_start)<'0' and timestampdiff(second,now(),promotion_end)>='0'";

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);

	$add_where = "";

	foreach($where as $value){
		$add_where.= " and ".$value;
	}

	foreach($_GET as $key=>$value){
		if($key<>"page" ){
			if($value<>""){
				$param.="&".$key."=".$value;
			}
		}
	}

	$orderby = "start_dt desc,end_dt desc";

	$admin_promotion= new AdminPromotion($conn_dgkr); 

	$promotion_list = $admin_promotion->getPromotionSchedule($page,$add_where,$orderby,$param);

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
<!-- Start Content-->
				<div class="container-fluid">
					<!-- start page title -->
					<div class="row">
						<div class="col-12">
							<div class="page-title-box">
								<div class="page-title-right">
									<ol class="breadcrumb m-0">
										<li class="breadcrumb-item"><a href="javascript: void(0);">홈</a></li>
										<li class="breadcrumb-item"><a href="javascript: void(0);">프로모션</a></li>
										<li class="breadcrumb-item"><a href="javascript: void(0);">프로모션 관리</a></li>
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
							<div class="mb-2"><? echo number_format($promotion_list->total_results)?> 개</div>
							
							<div class="table-responsive bg-white">
								<table class="table table-centered dt-responsive nowrap table-sm table-bordered" id="">
									<thead class="table-light">
										<tr>
											<th class="text-center">프로모션번호</th>
											<th class="text-center">프로모션명</th>
											<th class="text-center" style="width:150px">등록일</th>
											<th class="text-center" style="width:150px">시작일자</th>
											<th class="text-center" style="width:150px">종료일자</th>
											<th class="text-center" style="width:80px">노출상태</th>
											<th class="text-center" style="width:90px">미리보기</th>
											<th class="text-center" style="width:120px">동기화</th>
										</tr>
									</thead>
									<tbody class="font-13">
								<?
									if($promotion_list->success == true){
										$result = $promotion_list->resultset->fetchAll();

										foreach($result as $value){
								?>
									<tr>
										<td class="text-center"><?=$value['idx']?></td>
										<td class="text-start"><?=$value['subject']?></td>
										<td class="text-center p-0"><span class="num"><?=$value['reg_date']?></span></td>
										<td class="text-center p-0"><span class="num"><?=$value['start_dt']?></span></td>
										<td class="text-center p-0"><span class="num"><?=$value['end_dt']?></span></td>
										<td class="text-center"><?=$value['flag']?></td>
										<td class="text-center p-0"><button type="button" class="btn btn-warning text-white btn-sm shadow-none">미리보기</button></td>
										<td class="text-center"><button type="button" class="btn btn-outline-primary btn-sm btn_copy" data-no="<?=$value['idx']?>" data-start="<?=$value['start_dt']?>" data-end="<?=$value['end_dt']?>">동기화</button></td>
									</tr>
								<?
										}
									}
								?></tbody>
								</table>
							</div>

							<div class="text-center mt-3"><?echo $promotion_list->links_html;?></div>

						</div> <!-- end col -->
					</div>
					<!-- end row --> 

				</div> <!-- container -->
			</div> <!-- content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>
$(document).ready(function(){
	$(".btn_copy").bind("click",function(){
		var index = $(".btn_copy").index(this);
		var event_no = $(".btn_copy").eq(index).attr("data-no");
		var start_dt = $(".btn_copy").eq(index).attr("data-start");
		var end_dt = $(".btn_copy").eq(index).attr("data-end");
		
		$.ajax({
			 type: "GET",
			 url: "promotion_sync.php",
			 data: {event_no:event_no,start_dt:start_dt,end_dt:end_dt},
			 success: function (data, status) {
				//location.href='ezwel_goods_list.php';
				location.reload();
				//alert(data);
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
