<?
$sidebar_file = "sidebar_goods.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";

$page_title= "Youtube 채널 현황";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_channelId = filter_input(INPUT_GET, 'search_channelId', FILTER_SANITIZE_STRING);
$search_channel_name = filter_input(INPUT_GET, 'search_channel_name', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
}

$where = [];

if($search_channelId){
	$where[] = "channelId = '".$search_channelId."'";
}

if($search_channel_name){
	$where[] = "channelTitle REGEXP '".$search_channel_name."'";
}

$param = "";

foreach($_GET as $key=>$value){
	if($key<>"page" ){
		if($value<>""){
			$param.="&".$key."=".$value;
		}
	}
}

$add_where = "";

foreach($where as $value){
	$add_where.= " and ".$value;
}

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$orderby = "videoCount desc";

	$admin_goods= new AdminGoods($conn); 

	$channel_list = $admin_goods->getYoutubeChannelList($page,$add_where,$orderby,$param);

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

$selected['search_type'][$search_type] = "selected";
$checked['bonus_status'][$bonus_status] = "checked";
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">상품</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">Youtube 동영상 관리</a></li>
									<li class="breadcrumb-item active"><?=$page_title?></li>
								</ol>
							</div>
							<h4 class="page-title"><?=$page_title?></h4>
						</div>
					</div>
				</div>     
				<!-- end page title --> 
				
				<div class="row g-2">
					<div class="card">
						<h5 class="card-header bg-secondary text-white">Youtube 채널 검색</h5>
						<div class="card-body">
							<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
								<div class="row">
									<div class="col-3 mb-2">
										<div class="row">
											<label for="search_channelId" class="col-sm-3 col-form-labe col-form-label-sm bg-light border">channelId</label>
											<div class="col-sm-9">
												<input type="text" class="form-control form-control-sm" id="search_channelId" name="search_channelId" placeholder="channelId" value="<?=$search_channelId?>">
											</div>
										</div>
									</div>
									<div class="col-5 mb-2">
										<div class="row">
											<label for="search_channel_name" class="col-sm-3 col-form-labe col-form-label-sm bg-light border">채널명</label>
											<div class="col-sm-9">
												<input type="text" class="form-control form-control-sm" id="search_channel_name" name="search_channel_name" placeholder="채널명" value="<?=$search_channel_name?>">
											</div>
										</div>
									</div>
								</div>
								<div class="row">
									<div class="col-lg-12">
										<div class="float-end">
											<button type="submit" class="btn btn-primary shadow-none">Youtube 채널 검색</button>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>
				
				<div class="row mb-2">
					<div class="col-12">
						<div class="float-start"><? echo number_format($channel_list->total_results)?> 개</div>
						
						<div class="float-end"></div>
					</div>
				</div>

				<div class="row">
					<div class="col-12">
						<div class="card">
							<h5 class="card-header bg-secondary text-white">Youtube 채널 리스트</h5>
							<div class="card-body p-0">
								<div class="table-responsive">
									<table class="table table-centered w-100 nowrap table-sm table-bordered" id="">
										<thead class="table-light">
											<tr>
												<th class="text-center">번호</th>
												<th class="text-center">채널로고</th>
												<th class="text-center">channelId</th>
												<th class="text-center">채널명</th>
												<th class="text-center">채널주소</th>
												<th class="text-center">동영상 뷰수</th>
												<th class="text-center">구독자수</th>
												<th class="text-center">동영상수</th>
												<th class="text-center">비고</th>
											</tr>
										</thead>
										<tbody class="font-12">
										<?
										if($channel_list->success == true){
											$result = $channel_list->resultset->fetchAll();

											$num=1;

											foreach($result as $value){

										?>
											<tr>
												<td class="text-center"><?=$num+($page-1)*50?></td>
												<td class="text-center"><img src="<?=$value['thumbnails']?>"></td>
												<td class="text-center"><?=$value['channelId']?></td>
												<td><?=$value['channelTitle']?></td>
												<td><a href="https://www.youtube.com/<?=$value['customUrl']?>" target="_blank"><?=$value['customUrl']?></a></td>
												<td class="text-end"><?=number_format($value['viewCount'])?></td>
												<td class="text-end"><?=number_format($value['subscriberCount'])?></td>
												<td class="text-end"><?=number_format($value['videoCount'])?></td>
												<td class="text-center table-action">
													<?if($value['customUrl']==""){?>
													<button class="btn btn-sm btn-secondary shadow-none btn_channel_info " data-channelId="<?=$value['channelId']?>">정보 동기화</button>
													<?}?>
												</td>
											</tr>
									<?		$num++;
											}
										}
										?>
										</tbody>
									</table>
								</div>

								<div class="text-center mt-3"><?echo $channel_list->links_html;?></div>
							</div> <!-- end card-body-->
						</div> <!-- end card-->
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
	$(".btn_channel_info").bind("click",function(){
		var index = $(".btn_channel_info").index(this);
		var channelId = $(".btn_channel_info").eq(index).attr("data-channelId");
		$.ajax({
			 type: "GET",
			 url: "youtube_api.php",
			 data: {mode:"channel_info",channelId:channelId},
			 success: function (data, status) {
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
