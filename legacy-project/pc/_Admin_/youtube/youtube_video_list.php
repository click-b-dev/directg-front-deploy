<?
$sidebar_file = "sidebar_goods.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";

$page_title= "Youtube 비디오 현황";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_videoId = filter_input(INPUT_GET, 'search_videoId', FILTER_SANITIZE_STRING);
$search_title = filter_input(INPUT_GET, 'search_title', FILTER_SANITIZE_STRING);
$search_channelId = filter_input(INPUT_GET, 'search_channelId', FILTER_SANITIZE_STRING);
$search_channel_name = filter_input(INPUT_GET, 'search_channel_name', FILTER_SANITIZE_STRING);
$ytRating = filter_input(INPUT_GET, 'ytRating', FILTER_SANITIZE_STRING);
$is_sync = filter_input(INPUT_GET, 'is_sync', FILTER_SANITIZE_STRING);


if(!$page){
	$page=1;
}

$where = [];

if($is_sync=="Y"){
	$where[] = "title is null";
}

if($search_videoId){
	$where[] = " videoId='".$search_videoId."'";
}

if($search_channelId){
	$where[] = " channelId='".$search_channelId."'";
}

if($search_title){
	$where[] = "title REGEXP '".$search_title."'";
}

if($search_channel_name){
	$where[] = "channelTitle REGEXP '".$search_channel_name."'";
}

if($ytRating){
	$where[] = " ytRating='".$ytRating."'";
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

	if($is_sync=="Y"){
		$orderby = "title asc";
	}else{
		$orderby = "publishedAt desc";
	}
	

	$admin_goods= new AdminGoods($conn); 

	$video_list = $admin_goods->getYoutubeVideoList($page,$add_where,$orderby,$param);

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

$checked['ytRating'][$ytRating] = "checked";

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
						<h5 class="card-header bg-secondary text-white">Youtube 비디오 검색</h5>
						<div class="card-body">
							<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
								<div class="row">
									<div class="col-3 mb-2">
										<div class="row">
											<label for="search_videoId" class="col-sm-3 col-form-labe col-form-label-sm bg-light border">videoId</label>
											<div class="col-sm-9">
												<input type="text" class="form-control form-control-sm" id="search_videoId" name="search_videoId" placeholder="videoId" value="<?=$search_videoId?>">
											</div>
										</div>
									</div>
									<div class="col-5 mb-2">
										<div class="row">
											<label for="search_title" class="col-sm-3 col-form-labe col-form-label-sm bg-light border">동영상 제목</label>
											<div class="col-sm-9">
												<input type="text" class="form-control form-control-sm" id="search_title" name="search_title" placeholder="동영상 제목" value="<?=$search_title?>">
											</div>
										</div>
									</div>
									<div class="col-4 mb-2">
										<div class="row">
											<label for="search_channel_name" class="col-sm-3 col-form-labe col-form-label-sm bg-light border">채널명</label>
											<div class="col-sm-9 mt-1">
												<input type="text" class="form-control form-control-sm" id="search_channel_name" name="search_channel_name" placeholder="채널명" value="<?=$search_channel_name?>">
											</div>
										</div>
									</div>
								</div>
								<div class="row">
									<div class="col-3 mb-2">
										<div class="row">
											<label for="ytRating" class="col-sm-5 col-form-label col-form-label-sm bg-light border">연령 제한 콘텐츠</label>
											<div class="col-sm-7">
												<div class="form-check form-check-inline mt-1">
													<input type="checkbox" id="is_free" name="ytRating" class="form-check-input" value="ytAgeRestricted" <?=$checked['ytRating']['ytAgeRestricted']?>>
													<label class="form-check-label" for="ytRating">ytAgeRestricted</label>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div class="row">
									<div class="col-lg-12">
										<div class="float-end">
											<button type="submit" class="btn btn-primary shadow-none">Youtube 비디오 검색</button>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>
				
				<div class="row mb-2">
					<div class="col-12">
						<div class="float-start"><? echo number_format($video_list->total_results)?> 개</div>
						
						<div class="float-end"><button type="button" class="btn btn-info shadow-none" data-bs-toggle="modal" data-bs-target="#app-modal">Youtube 비디오 추가</button></div>
					</div>
				</div>

				<div class="row">
					<div class="col-12">
						<div class="card">
							<h5 class="card-header bg-secondary text-white">Youtube 동영상 리스트</h5>
							<div class="card-body p-0">
								<div class="table-responsive">
									<table class="table table-centered w-100 nowrap table-sm table-bordered" id="">
										<thead class="table-light">
											<tr>
												<th class="text-center">번호</th>
												<th class="text-center">videoId</th>
												<th class="text-center">썸네일</th>
												<th class="text-center">동영상제목</th>
												<th class="text-center">등록일</th>
												<th class="text-center">동영상 뷰수</th>
												<th class="text-center">좋아요 수</th>
												<th class="text-center">연령 제한 콘텐츠</th>
												<th class="text-center">동영상재생</th>
												<th class="text-center">동기화</th>
											</tr>
										</thead>
										<tbody class="font-12">
										<?
										if($video_list->success == true){
											$result = $video_list->resultset->fetchAll();

											$num=1;

											foreach($result as $value){

										?>
											<tr>
												<td class="text-center"><?=$num+($page-1)*20?></td>
												<td class="text-center"><?=$value['videoId']?></td>
												<td class="text-center"><img src="<?=$value['thumbnails']?>"></td>
												<td>
													<figure>
														<blockquote class="blockquote">
															<p class="font-14"><?=$value['title']?> (<?=$value['defaultAudioLanguage']?>)</p>
														</blockquote>
														<figcaption class="blockquote-footer">
															<?=$value['channelTitle']?>
														</figcaption>
													</figure>
												</td>
												<td class="text-center"><?=date('Y-m-d H:i:s',$value['publishedAt'])?></td>
												<td class="text-end"><?=number_format($value['viewCount'])?></td>
												<td class="text-end"><?=number_format($value['likeCount'])?></td>
												<td class="text-center"><?=$value['ytRating']?></td>
												<td class="text-center table-action"><a href="#" class="btn btn-default btn_video" data-toggle="modal" data-target="#dynamicVideoModal" data-videoId="<?=$value['videoId']?>" >VIDEO</a>
												</td>
												<td class="text-center">
													<? if($value['viewCount']==""){?>
													<button type="button" class="btn btn-light shadow-none btn_video_sync" data-videoId="<?=$value['videoId']?>">동기화</button>
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

								<div class="text-center mt-3"><?echo $video_list->links_html;?></div>
							</div> <!-- end card-body-->
						</div> <!-- end card-->
					</div> <!-- end col -->
				</div>
				<!-- end row -->   
				
			</div> <!-- container -->

		</div> <!-- content -->
</div>
	
	<div id="app-modal" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header modal-colored-header bg-primary">
					<h5 class="modal-title" id="topModalLabel">Youtube 비디오 등록</h5>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-hidden="true"></button>
				</div>
				<div class="modal-body">
					<form method="get" action="youtube_api.php" class="ps-3 pe-3" class="form-horizontal">
					<input type="hidden" name="mode" value="video_info">
						<div class="mb-2 row">
							<label for="product_code" class="col-sm-3 col-form-label bg-light">videoId</label>
							<div class="col-sm-9">
								<input type="text" id="videoId" name="videoId" class="form-control"  value="" required>
							</div>
						</div>

						<div class="mb-2 text-center">
							<button class="btn btn-primary shadow-none" type="button" id="btn_video_register">Youtube 비디오 등록</button>
						</div>
					</form>
				</div>
			</div><!-- /.modal-content -->
		</div><!-- /.modal-dialog -->
	</div><!-- /.modal -->
</div><!-- /wrapper -->
<div class="modal fade" id="dynamicVideoModal" tabindex="-1" aria-hidden="true">
	<div class="modal-dialog modal-lg">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title"></h5>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
			</div>
			<div class="modal-body p-0">
				<div id="playerFrame">
					<div id="player"></div>
				</div>
			</div>
			<!--<div class="modal-footer">
				<button type="button" class="btn-dark" id="playBtn">Play</button>
				<button type="button" class="btn-dark" id="pauseBtn">Pause</button>
			</div>-->
		</div>
	</div>
</div>
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>
$(document).ready(function(){
	//Youtube 비디오 등록
	$("#btn_video_register").bind("click",function(){
		var videoId = $("input[name='videoId']").val();
		$.ajax({
			 type: "GET",
			 url: "youtube_api.php",
			 data: {mode:"video_info",videoId:videoId},
			 success: function (data, status) {
				alert(data);
				//alert("완료");
				location.reload();
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
	
	//동영상 동기화
	$('.btn_video_sync').bind("click",function () {
		var index = $('.btn_video_sync').index(this);
		var videoId = $('.btn_video_sync').eq(index).attr("data-videoId");
		
		$.ajax({
			 type: "GET",
			 url: "youtube_api.php",
			 data: {mode:"video_info",videoId:videoId},
			 success: function (data, status) {
				alert(data);
				//alert("완료");
				location.reload();
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
	
	$('.btn_video').bind("click",function () {
		var index = $('.btn_video').index(this);
		var videoId = $('.btn_video').eq(index).attr("data-videoId");
		
		$("#dynamicVideoModal").modal('show');
		clickPlay(videoId);
	});
	
	function clickPlay(videoId) {
	  $.getScript("https://www.youtube.com/iframe_api", function () {
		loadVideo(videoId);
	  });
	}
	
	function loadVideo(videoId) {
	  var player;
	  window.YT.ready(function () {
		player = new window.YT.Player("player", {
		  height: "456",
		  width: "812",
		  videoId:videoId,
		  events: {
			onReady: onPlayerReady,
			onStateChange: onPlayerStateChange
		  }
		});
	  });

	  function onPlayerReady(event) {
		event.target.playVideo();
		//$('#clickPlay').hide();
	  }

	  function onPlayerStateChange(event) {
		var videoStatuses = Object.entries(window.YT.PlayerState)
		console.log(videoStatuses.find(status => status[1] === event.data)[0])
	  }
	}
});
</script>
</body>
</html>
