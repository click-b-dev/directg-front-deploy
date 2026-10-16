<?
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sub_sidebar_title['media'] = "active";
$sidebar_file="sidebar_goods.php";

$title_id = filter_input(INPUT_GET, 'title_id', FILTER_SANITIZE_STRING);


$goods_item_data = array();
try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$admin= new Admin($conn);
	$admin_goods= new AdminGoods($conn);

	//대표상품 상세정보
	$query="select * from tbl_goods where title_id=:title_id";
	$stmt = $conn->prepare($query);
	$params = array(
		":title_id"=>$title_id
	);
	$stmt->execute($params);

	$title_data = $stmt->fetch();

	//동영상정보
	$media_list = $admin->getGoodsMediaList($title_id);
	
	//유튜브 영상조회
	//$tmp = explode(" ",$title_data['title_name_en']);
	if(strpos($title_data['title_name_en'],":")!==false){
		$tmp = explode(":",$title_data['title_name_en']);
		foreach($tmp as $key=>$value){
			if($key=="0"){
				$where[]="title REGEXP '^".trim($value)."'";
			}else{
				$where[]="title REGEXP '".trim($value)."'";
			}
		}
	}else{
		$where[]="title REGEXP '".trim($title_data['title_name_en'])."' or title REGEXP '".str_replace(' ','',$title_data['title_name_en'])."'";
	}

	foreach($where as $value){
		$add_where.=" and ".$value;
	}
	
	$video_list = $admin_goods->getYoutubeVideoSearch($add_where);
	
	if(is_array($media_list)){
		foreach($video_list as $k => $v){
			foreach($media_list as $v2){
				if($v['videoId'] == $v2['youtube_media_id']){
					unset($video_list[$k]);
				}
			}
		}
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">대표상품 관리</a></li>
									<li class="breadcrumb-item active">동영상 설정</li>
								</ol>
							</div>
							<h4 class="page-title"><?=$title_data['title_name']?> <small>(<?=$title_data['title_name_en']?>)</small></h4>
						</div>
					</div>
				</div>     
				<!-- end page title -->
				
				<div class="row">
					<div class="col-2 mb-2 mb-sm-0">
						<? include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/sub_sidebar_title.php');?>
					</div>
					<div class="col-7">
						<div class="card">
							<h5 class="card-header bg-secondary text-white">대표상품 동영상정보</h5>
							<div class="card-body p-2">
								<div class="ratio ratio-16x9">
									<iframe id="media_player" class="embed-responsive-item" src="<?=$media_list[0]['media_url']?>" frameborder="0" allowfullscreen></iframe>
								</div>
								<div class="container">
									<div class="row">
									<?
										foreach($media_list as $value){
									?>
									<div class="col-2">
										<div class="d-block mb-2 text-center">
											<span class="font-12"><?=$value['youtube_media_id']?></span>
										</div>
										<div class="position-relative" style="cursor:pointer">
											<img src="https://img.youtube.com/vi/<?=$value['youtube_media_id']?>/mqdefault.jpg" class="img-fluid img-thumbnail youtube_thumbnail" alt="Product-img" data-mediaid="<?=$value['youtube_media_id']?>">
											<div class="position-absolute top-50 start-50 translate-middle">
												<div class="text-danger">
													<i class="mdi mdi-48px mdi-youtube"></i>
												</div>
											</div>
										</div>
										<div class="d-block mt-2 text-center">
						<?php
							if(!$product_viewer){
						?>
											<button class="btn btn-danger btn-sm btn_youtube_delete" data-mediaid="<?=$value['youtube_media_id']?>" data-youtubeidx="<?=$value['idx']?>">영상삭제</button>
						<?php
							}
						?>
										</div>
									</div>
									<?
										}
									?>
									</div>
								</div>
								<div class="row">
									<div class="col">
										<div class="mt-0 p-3 rounded">
											<form class="needs-validation" novalidate="" name="youtubeFrm" id="youtubeFrm">
												<div class="row">
													<div class="col mb-0 mb-sm-0">
														<div class="input-group">
															<div class="input-group-text">https://www.youtube.com/embed/</div>
															<input type="text" class="form-control" name="youtube_media_id" placeholder="유튜브동영상 아이디를 입력해 주세요." required="">
														</div>
													</div>
													<div class="col-sm-auto">
														<div class="btn-group">
															<div class="d-grid">
						<?php
							if(!$product_viewer){
						?>
																<button type="button" class="btn btn-success shadow-none" id="btn_youtube_register" data-titleid="<?=$title_id?>">영상추가</button>
						<?php
							}
						?>
															</div>
														</div>
													</div> <!-- end col -->
												</div> <!-- end row-->
											</form>
										</div> 
									</div> <!-- end col-->
								</div>
							</div>
							<div class="card-footer p-2">
							<?
								foreach($video_list as $video){
							?>
								<div class="card mb-3">
									<div class="d-flex flex-row">
										<img src="<?=$video['thumbnails']?>" class="img-fluid rounded-start" alt="...">
										<div class="card-body p-2">
											<h5 class="card-title font-14"><?=$video['title']?></h5>
											<p class="card-text">
												<small class="text-body-secondary"><?=$video['videoId']?></small><br/>
												<small class="text-body-secondary"><?=$video['channelTitle']?></small><br/>
												<small class="text-body-secondary">등록일: <?=date('Y-m-d H:i:s',$video['publishedAt'])?>  | 조회수: <?=number_format($video['viewCount'])?></small>
											</p>
										</div>
						<?php
							if(!$product_viewer){
						?>
										<button type="button" class="btn btn-secondary btn-sm shadow-none btn_video_register" data-titleid="<?=$title_id?>" data-videoId="<?=$video['videoId']?>">등록</button>
						<?php
							}
						?>
									</div>
								</div>
							<?
								}
							?>
							</div>
						</div>
					</div>
				</div>
			</div> 
			<!-- container -->
		</div>
		<!-- content -->

	</div>

</div>
<!-- END wrapper -->

<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>

$(document).ready(function(){
	
	
	//유튜브 동영상 주소 등록
	$("#btn_youtube_register").bind("click",function(){
		var title_id = $("#btn_youtube_register").attr("data-titleid");
		var youtube_media_id = $('input[name="youtube_media_id"]').val();
		$.ajax({
			 type: "POST",
			 url: "title_ps.php",
			 data: {mode:"add_youtube",title_id:title_id,youtube_media_id:youtube_media_id},
			 success: function (data, status) {
				//location.href='ezwel_goods_list.php';
				
				alert(data);
				location.reload();
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
	
	//유튜브 동영상 주소 등록2
	$(".btn_video_register").bind("click",function(){
		var index = $(".btn_video_register").index(this);
		var title_id = $(".btn_video_register").eq(index).attr("data-titleid");
		var videoId = $(".btn_video_register").eq(index).attr("data-videoId");
		$.ajax({
			 type: "POST",
			 url: "title_ps.php",
			 data: {mode:"add_youtube",title_id:title_id,youtube_media_id:videoId},
			 success: function (data, status) {
				//location.href='ezwel_goods_list.php';
				alert(data);
				location.reload();
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
	
	//영상 삭제
	$(".btn_youtube_delete").bind("click",function(){
		var index = $(".btn_youtube_delete").index(this);
		var youtube_idx = $(".btn_youtube_delete").eq(index).attr("data-youtubeidx");
		$.ajax({
			 type: "POST",
			 url: "title_ps.php",
			 data: {mode:"delete_youtube",youtube_idx:youtube_idx},
			 success: function (data, status) {
				//location.href='ezwel_goods_list.php';
				
				alert(data);
				location.reload();
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
