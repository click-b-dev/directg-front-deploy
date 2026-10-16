<?
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sub_sidebar_title['screenshot'] = "active";
$sidebar_file="sidebar_goods.php";

$page_title="대표상품 스크린샷 설정";

$title_id = filter_input(INPUT_GET, 'title_id', FILTER_SANITIZE_STRING);


$goods_item_data = array();
try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$admin= new Admin($conn);

	//대표상품 상세정보
	$query="select * from tbl_goods where title_id=:title_id";
	$stmt = $conn->prepare($query);
	$params = array(
		":title_id"=>$title_id
	);
	$stmt->execute($params);

	$title_data = $stmt->fetch();

	//스크린샷
	$screenshot_data = $admin->getTitleScreenshotList($title_id);

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
									<li class="breadcrumb-item active"><?=$page_title?></li>
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
							<h5 class="card-header bg-secondary text-white">대표상품 스크린샷</h5>
							<div class="card-body p-2">
								<div class="d-block mb-3 text-center"><img src="<?=$screenshot_data['0']['url']?>?t=1" class="img-fluid" style="max-width: 812px;" alt="스크린샷" id="screenshot"></div>
								<div id="screenshot_thumbnail" >
									<div class="d-flex flex-row justify-content-start flex-nowrap mb-2">
										<? 
											$num="1";
											foreach($screenshot_data as $screenshot){
										?>
										<div class="text-center me-2">
											<a href="javascript: void(0);">
												<img src="<?=$screenshot['thumbnail']?>" class="img-fluid img-thumbnail p-0 thumbnail_list" style="max-width: 120px;" alt="스크린샷 썸네일" data-url="<?=$screenshot['url']?>">
											</a>
						<?php
							if(!$product_viewer){
						?>
											<button class="btn btn-sm btn-light shadow-none border mt-1 font-12 btn_screenshot_delete" data-titleid="<?=$title_data['title_id']?>" data-screenshotnum="<?=$screenshot['screenshot_num']?>">스크린샷  <?=$num?> 삭제</button>
						<?php
							}
						?>
										</div>
										<?
												$num++;
											}
										?>
									</div>
								</div>
							</div>
							<div class="card-footer">
								<div class="d-flex flex-wrap">
									<?
										//json정보 추출
										$json_path2 =  "/home/dgkrshop/www/upload/apps/apps_".$title_data['steam_appid']."_coming.json";
										$json_path =  "/home/dgkrshop/www/upload/apps/apps_".$title_data['steam_appid'].".json";
										
										if(file_exists($json_path)){
											$json_string = file_get_contents($json_path);
											$json_data = json_decode($json_string, true);

											$screenshot_url = "/home/dgkrshop/www/upload/title/".$title_data['title_id']."/screenshot/";

											foreach($json_data[$title_data['steam_appid']]['data']['screenshots'] as $screenshot_key=>$screenshot_value){
												if($screenshot_key<10){
												$linkArray = "";
												$filename = "";
												$linkArray = explode("/", $screenshot_value['path_full']);
												$filename = $linkArray[count($linkArray)-1];
												$filename = explode("?",$filename);
												$screenshot_path = $screenshot_url.$filename['0'];
												if($screenshot_key<10){
									?>
									<div class="mb-2 px-1">
										<? if(file_exists($screenshot_path)){?>
											<span class="font-13">스크린샷 <?=$screenshot_value['id']+1?> 완료</span>
										<?}else{?>
										<button type="button" class="btn btn-secondary btn-sm shadow-none btn_screenshot_download font-13" data-titleid="<?=$title_data['title_id']?>" data-type='screenshot' data-url="<?=$screenshot_value['path_full']?>" data-thumbnail="<?=$screenshot_value['path_thumbnail']?>" data-num="<?=$screenshot_value['id']+1?>">스크린샷 <?=$screenshot_value['id']+1?> <br/>다운로드</button>
										<div class="result d-none" id="screenshot_<?=$title_data['title_id']?>_<?=$screenshot_value['id']+1?>"><span class="font-13">스크린샷 <?=$screenshot_value['id']+1?> 완료</span></div>
										<?}?>
									</div>
								<?			}
											}
										}
									}else{
										if(file_exists($json_path2)){
											$json_string = file_get_contents($json_path2);
											$json_data = json_decode($json_string, true);

											$screenshot_url = "/home/dgkrshop/www/upload/title/".$title_data['title_id']."/screenshot/";

											foreach($json_data[$title_data['steam_appid']]['data']['screenshots'] as $screenshot_key=>$screenshot_value){
												if($screenshot_key<10){
												$linkArray = "";
												$filename = "";
												$linkArray = explode("/", $screenshot_value['path_full']);
												$filename = $linkArray[count($linkArray)-1];
												$filename = explode("?",$filename);
												$screenshot_path = $screenshot_url.$filename['0'];
								?>
								<div class="mb-2 px-1">
									<? if(file_exists($screenshot_path)){?>
										<span class="font-13">스크린샷 <?=$screenshot_value['id']+1?> 완료</span>
									<?}else{?>
									<button type="button" class="btn btn-secondary btn-sm shadow-none btn_screenshot_download font-13" data-titleid="<?=$title_data['title_id']?>" data-type='screenshot' data-url="<?=$screenshot_value['path_full']?>" data-thumbnail="<?=$screenshot_value['path_thumbnail']?>" data-num="<?=$screenshot_value['id']+1?>">스크린샷 <?=$screenshot_value['id']+1?> <br/>다운로드</button>
									<div class="result d-none" id="screenshot_<?=$title_data['title_id']?>_<?=$screenshot_value['id']+1?>"><span class="font-13">스크린샷 <?=$screenshot_value['id']+1?> 완료</span></div>
									<?}?>
								</div>
							<?				}
											}
										}else{
											echo "스팀 JSON정보 없음";
										}
									}
								?>
								</div>
							</div>
						</div>
						
						<div class="card">
							<h5 class="card-header bg-secondary text-white">대표상품 스크린샷 직접업로드</h5>
							<div class="card-body p-2">
								<div class="mb-2">
									<div class="d-flex flex-row">
										<span class="me-2">스크린샷 크기: 856px * 480px</span>
									</div>
								</div>
								<div class="mb-2">
									<span>스크린샷 썸네일 크기: 112px * 63px</span>
									<!--<button type="button" class="btn btn-secondary btn-sm shadow-none" id="btn_upload_screenshot_thumb" data-titleid="<?=$title_data['title_id']?>" data-type="screenshot_120x90">스크린샷 썸네일 업로드</button>-->
								</div>
								<div class="mb-2">
									<?//print_r($screenshot);?>
									<div class="d-flex flex-row">
										<div class="input-group">
											<input type="file" name="screenshot_img" id="screenshot_img" class="form-control" required>
						<?php
							if(!$product_viewer){
						?>
											<button type="button" class="btn btn-secondary btn-sm shadow-none" id="btn_upload_screenshot" data-titleid="<?=$title_data['title_id']?>" data-type="screenshot_856x480" data-num="<?=$screenshot['screenshot_num']+1?>">스크린샷 업로드</button>
						<?php
							}
						?>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="col-3">
						<div class="card">
							<h5 class="card-header bg-secondary text-white">디스크엔 업로드 상태</h5>
							<div class="text-center p-2">
								<div class="d-flex flex-column">
									<span class="font-12 text-start text-danger">이미지가 안보이면 디스크엔에 업로드 해주세요.</span>
									<span class="font-12 text-start">원본 경로: /upload/title/<?=$title_id?>/screenshot/</span>
									<span class="font-12 text-start">썸네일 경로: /upload/title/<?=$title_id?>/screenshot/thumbnail/</span>
								</div>
							</div>
							<div class="card-body p-2">
								<ul class="list-group">
								<?
									foreach($screenshot_data as $screenshot){
								?>
									<li class="list-group-item">
										<div class="d-flex flex-row align-items-center justify-content-start">
											<div class="me-2"><?=$screenshot['sort']?></div>
											<div class="me-2">
												<img src="https://image.directg.net/<?=$screenshot['thumbnail']?>" class="img-fluid img-thumbnail p-0 thumbnail_list border-0" style="max-width: 120px;" alt="스크린샷 썸네일"><br/>
												<span class="text-center">스크린샷 <?=$screenshot['screenshot_num']?></span>
											</div>
											<div class="d-flex flex-column">
						<?php
							if(!$product_viewer){
						?>
												<button class="btn btn-sm p-0 btn_sort_up" data-idx="<?=$screenshot['idx']?>"><i class='mdi mdi-chevron-up-box mdi-24px'></i></button>
												<button class="btn btn-sm p-0 btn_sort_down" data-idx="<?=$screenshot['idx']?>"><i class='mdi mdi-chevron-down-box mdi-24px'></i></button>
						<?php
							}
						?>
											</div>
										</div>
									</li>
								<?
									}
								?>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</div> <!-- container -->

		</div> <!-- content -->

	</div><!-- /content-page -->
</div><!-- /wrapper -->

<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>
<script>

$(document).ready(function(){
	$(".thumbnail_list").bind("click",function(){
		var index = $(".thumbnail_list").index(this);
		var url = $(".thumbnail_list").eq(index).attr("data-url");
		$("#screenshot").attr("src",url);
	});
		
	//스팀 스크린샷 다운로드
	$(".btn_screenshot_download").bind("click",function(){
		var index = $(".btn_screenshot_download").index(this);
		var title_id= $(".btn_screenshot_download").eq(index).attr("data-titleid");
		var image_type= $(".btn_screenshot_download").eq(index).attr("data-type");
		var image_url= $(".btn_screenshot_download").eq(index).attr("data-url");
		var thumbnail_url= $(".btn_screenshot_download").eq(index).attr("data-thumbnail");
		var num = $(".btn_screenshot_download").eq(index).attr("data-num");
		$.ajax({
			 type: "POST",
			 url: "../steam/steam_image_download.php",
			 data: {title_id:title_id,image_type:image_type,image_url:image_url,thumbnail_url:thumbnail_url,num:num},
			 success: function (data, status) {
				 //console.log($(this));
				 $('.btn_screenshot_download').eq(index).remove();
				 $('#screenshot_'+title_id+"_"+num).removeClass('d-none');
				 $('#screenshot_'+title_id+"_"+num).addClass('d-block');
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
	
	//스크린샷 삭제
	$(".btn_screenshot_delete").bind("click",function(){
		var index = $(".btn_screenshot_delete").index(this);
		var title_id= $(".btn_screenshot_delete").eq(index).attr("data-titleid");
		var screenshot_num = $(".btn_screenshot_delete").eq(index).attr("data-screenshotnum");
		$.ajax({
			 type: "POST",
			 url: "../steam/steam_image_download.php",
			 data: {title_id:title_id,image_type:"screenshot_delete",screenshot_num:screenshot_num},
			 success: function (data, status) {
				 //console.log($(this));
				 //location.reload();
				 alert(data);
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
	
	
	//스크린샷 직접 업로드
	$("#btn_upload_screenshot").bind("click",function(e){
		var title_id =$("#btn_upload_screenshot").attr("data-titleid");
		var num =$("#btn_upload_screenshot").attr("data-num");
		var form = new FormData();
		var inputFile = $("input[name='screenshot_img']");
		var files = inputFile[0].files;
		e.preventDefault();
		form.append( "title_id", title_id);
		form.append( "num", num);
		form.append( "mode", "screenshot_upload");

		for(var i =0;i<files.length;i++){
			form.append("screenshot_img", files[i]);
		}

		$.ajax({
			type: "POST",
			processData : false,
			contentType : false,
			url: "title_ps.php",
			data: form,
			 success: function (data, status) {
				alert(data);
				 location.reload();
				//alert(data);
				
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
	
	//스크린샷  썸네일 직접 업로드
	$("#btn_upload_screenshot_thumb").bind("click",function(e){
		var title_id =$("#btn_upload_screenshot_thumb").attr("data-titleid");
		var form = new FormData();
		var inputFile = $("input[name='screenshot_thumb']");
		var files = inputFile[0].files;
		e.preventDefault();
		form.append( "title_id", title_id);
		form.append( "mode", "screenshot_thumb_upload");

		for(var i =0;i<files.length;i++){
			form.append("screenshot_thumb", files[i]);
		}

		$.ajax({
			type: "POST",
			processData : false,
			contentType : false,
			url: "title_ps.php",
			data: form,
			 success: function (data, status) {
				alert(data);
				 location.reload();
				//alert(data);
				
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
	
	//정렬순서 위로증가
	$(".btn_sort_up").bind("click",function(){
		var index = $(".btn_sort_up").index(this);
		var idx =  $(".btn_sort_up").eq(index).attr("data-idx");
		$.ajax({
			 type: "POST",
			 url: "title_ps.php",
			 data: {mode:"screenshot_sort_up",idx:idx},
			 success: function (data, status) {
				location.reload();
				//alert(data);
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
	
	//정렬순서 아래로 감소
	$(".btn_sort_down").bind("click",function(){
		var index = $(".btn_sort_down").index(this);
		var idx =  $(".btn_sort_down").eq(index).attr("data-idx");
		
		$.ajax({
			 type: "POST",
			 url: "title_ps.php",
			 data: {mode:"screenshot_sort_down",idx:idx},
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
