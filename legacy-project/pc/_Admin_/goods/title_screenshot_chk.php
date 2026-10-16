<?
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_title_id = filter_input(INPUT_GET, 'search_title_id', FILTER_SANITIZE_STRING);
$search_title_name = filter_input(INPUT_GET, 'search_title_name', FILTER_SANITIZE_STRING);
$search_title_name_en = filter_input(INPUT_GET, 'search_title_name_en', FILTER_SANITIZE_STRING);
$search_appid = filter_input(INPUT_GET, 'search_appid', FILTER_SANITIZE_STRING);
$search_is_view = filter_input(INPUT_GET, 'search_is_view', FILTER_SANITIZE_STRING);

$search_publisher_code = filter_input(INPUT_GET, 'search_publisher_code', FILTER_SANITIZE_STRING);
$search_supplier_code = filter_input(INPUT_GET, 'search_supplier_code', FILTER_SANITIZE_STRING);
$search_genre_code = filter_input(INPUT_GET, 'search_genre_code', FILTER_SANITIZE_STRING);

$search_platform = filter_input(INPUT_GET, 'search_platform', FILTER_SANITIZE_STRING);
$search_domain = filter_input(INPUT_GET, 'search_domain', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
}

$where = [];

$where[]=" title_code<>'12'";

if(isset($search_title_id) && $search_title_id<>""){
	$where[] = " title_id ='".$search_title_id."'";
}

if(isset($search_title_name) && $search_title_name<>""){
	$where[] = " title_name like '%".$search_title_name."%'";
}

if(isset($search_title_name_en) && $search_title_name_en<>""){
	$where[] = " title_name_en like '%".$search_title_name_en."%'";
}

if(isset($search_appid) && $search_appid<>""){
	$where[] = "steam_appid ='".$search_appid."'";
}

if(isset($search_is_view) && $search_is_view<>""){
	$where[] = "is_view ='".$search_is_view."'";
}

if(isset($search_domain) && $search_domain<>""){
	$where[] = "domain ='".$search_domain."'";
}

if(isset($search_supplier_code) && $search_supplier_code<>""){
	$where[] = "supplier_code ='".$search_supplier_code."'";
}

if(isset($search_platform) && $search_platform<>""){
	$where[] = "platform_code ='".$search_platform."'";
}

if(isset($search_genre_code) && $search_genre_code<>""){
	$where[] = "genre_code ='".$search_genre_code."'";
}

if(isset($search_age_limit) && $search_age_limit<>""){
	$where[] = " age_limit='".$search_age_limit."'";
}

$checked['search_is_view'][$search_is_view] = "checked";
$selected['search_publisher_code'][$search_publisher_code] = "selected";
$selected['search_supplier_code'][$search_supplier_code] = "selected";
$selected['search_platform'][$search_platform] = "selected";
$selected['search_genre_code'][$search_genre_code] = "selected";
$checked['search_age_limit'][$search_age_limit]="checked";

$where[] = " sales_status<>'E'";

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

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

	$orderby = "title_id desc";

	$admin= new Admin($conn); 

	$goods_list = $admin->getGoodsList($page,$add_where,$orderby,$param);

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

?>
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php'); ?>
<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
<!-- Begin page -->
<div class="wrapper">
	<!-- ========== Left Sidebar Start ========== -->
	<? include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/sidebar_goods.php');?>
	<!-- Left Sidebar End -->

	<!-- Start Page Content here -->
	<!-- ============================================================== -->

	<div class="content-page">
		<div class="content">
			<!-- Topbar Start -->
			<? include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/topbar.php');?>
			<!-- end Topbar -->

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
									<li class="breadcrumb-item active">대표상품 스크린샷설정</li>
								</ol>
							</div>
							<h4 class="page-title">대표상품 스크린샷설정</h4>
						</div>
					</div>
				</div>     
				<!-- end page title --> 

				<div class="row g-2">
					<div class="card">
						<h5 class="card-header bg-secondary text-white">검색필터</h5>
						<div class="card-body">
							<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
								<div class="row mb-2">
									<div class="col-lg-2">
										<div class="row">
											<label for="search_title_id" class="col-sm-5 col-form-label bg-light border">대표상품코드</label>
											<div class="col-sm-7">
												<input type="text" class="form-control" id="search_title_id" name="search_title_id" placeholder="대표상품코드" value="<?=$search_title_id?>">
											</div>
										</div>
									</div>
									<div class="col-lg-5">
										<div class="row">
											<label for="search_title_name" class="col-sm-3 col-form-label bg-light border">대표상품명(국문)</label>
											<div class="col-sm-9">
												<input type="text" class="form-control" id="search_title_name" name="search_title_name" placeholder="대표상품명(국문)" value="<?=$search_title_name?>">
											</div>
										</div>
									</div>
									<div class="col-lg-5">
										<div class="row">
											<label for="search_title_name_en" class="col-sm-3 col-form-label bg-light border">대표상품명(영문)</label>
											<div class="col-sm-9">
												<input type="text" class="form-control" id="search_title_name_en" name="search_title_name_en" placeholder="대표상품명(영문)" value="<?=$search_title_name_en?>">
											</div>
										</div>
									</div>
								</div>

								<div class="row mb-2">
									<div class="col-lg-3">
										<div class="row">
											<label for="search_publisher" class="col-sm-3 col-form-label bg-light border">퍼블리셔</label>
											<div class="col-sm-9">
												<input type="text" class="form-control" id="search_publisher" name="search_publisher" placeholder="퍼블리셔" value="<?=$search_publisher?>">
											</div>
										</div>
									</div>

									<div class="col-lg-3">
										<div class="row">
											<label for="search_appid" class="col-sm-5 col-form-label bg-light border">Steam APP ID</label>
											<div class="col-sm-7">
												<input type="text" class="form-control" id="search_appid" name="search_appid" placeholder="Steam APP ID" value="<?=$search_appid?>">
											</div>
										</div>
									</div>
									<div class="col-lg-3">
										<div class="row">
											<label for="search_is_view" class="col-sm-4 col-form-label bg-light border">진열상태</label>
											<div class="col-sm-8 pt-1">
												<div class="form-check form-check-inline">
													<input type="radio" id="search_is_view_y" name="search_is_view" class="form-check-input" value="Y" <?=$checked['search_is_view']['Y']?>>
													<label class="form-check-label" for="search_is_view_y">진열함</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_is_view_n" name="search_is_view" class="form-check-input" value="N" <?=$checked['search_is_view']['N']?>>
													<label class="form-check-label" for="search_is_view_n">진열안함</label>
												</div>
											</div>
										</div>
									</div>
								</div>

								<div class="row">
									<div class="col-lg-12">
										<div class="float-end">
											<button type="submit" class="btn btn-primary">대표상품 검색</button>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>

				<div class="row">
					<div class="col-12">
						<div><? echo number_format($goods_list->total_results)?> 개</div>
						<div class="table-responsive">
							<table class="table table-centered nowrap table-sm table-bordered" id="">
								<thead class="table-light font-13">
									<tr>
										<th class="text-center" style="width: 7%;">대표상품코드<br/><span class="eng">(Steam AppID)</span></th>
										<th class="text-center" style="width: 20%;">대표상품 sku</th>
										<th class="text-center" style="width: *;">대표상품명</th>
										<th class="text-center" style="width: 7%;">대표상품 출시일</th>
										<th class="text-center" style="width: 10%">페이지 보기</th>
									</tr>
								</thead>
								<tbody class="font-12">
								<?
								if($goods_list->success == true){
									$result = $goods_list->resultset->fetchAll();

									foreach($result as $value){
										$screenshot_data = $admin->getTitleScreenshotList($value['title_id']);
								?>
									<tr>
										<td class="text-center">
											<span class="eng"><?=$value['title_id']?></span><br/>
											<span class="num">(<?=$value['steam_appid']?>)</span><br/>
											<?	
												switch($value['sales_status']){
													case "S":
														echo "판매중";
													break;
													case "C":
														echo "판매예정";
													break;
													case "E":
														echo "판매종료";
													break;
												}
											?>
										</td>
										<td><?=$value['sku']?></td>
										<td><?=$value['title_name']?><br/><small class="eng"><?=$value['title_name_en']?></small></td>
										<td class="text-center"><span class="num font-13"><?=$value['release_date']?></span></td>
										<td class="text-center">
											<a href="/game/game_view.html?product_id=<?=$value['sku']?>" target="_blank" class="btn btn-sm btn-dark shadow-none">페이지 이동</a>
										</td>
									</tr>
									<tr>
										<th class="text-center bg-light">스크린샷</th>
										<td colspan="4">
											<div class="d-flex flex-wrap">
											<?
												//json정보 추출
												$json_path =  $_SERVER['DOCUMENT_ROOT']."/upload/apps/apps_".$value['steam_appid'].".json";
												if(file_exists($json_path)){
													$json_string = file_get_contents($json_path);
													$json_data = json_decode($json_string, true);

													$screenshot_url = $_SERVER['DOCUMENT_ROOT']."/upload/title/".$value['title_id']."/screenshot/";

													foreach($json_data[$value['steam_appid']]['data']['screenshots'] as $screenshot_key=>$screenshot_value){
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
													<button type="button" class="btn btn-secondary btn-sm shadow-none btn_screenshot_download font-13" data-titleid="<?=$value['title_id']?>" data-type='screenshot' data-url="<?=$screenshot_value['path_full']?>" data-thumbnail="<?=$screenshot_value['path_thumbnail']?>" data-num="<?=$screenshot_value['id']+1?>">스크린샷 <?=$screenshot_value['id']+1?> <br/>다운로드</button>
													<div class="result d-none" id="screenshot_<?=$value['title_id']?>_<?=$screenshot_value['id']+1?>"><span class="font-13">스크린샷 <?=$screenshot_value['id']+1?> 완료</span></div>
													<?}?>
												</div>
											<?		}
													}
												}else{
													$json_path2 =  $_SERVER['DOCUMENT_ROOT']."/upload/apps/apps_".$value['steam_appid']."_coming.json";
													if(file_exists($json_path2)){
														$json_string = file_get_contents($json_path2);
														$json_data = json_decode($json_string, true);

														$screenshot_url = $_SERVER['DOCUMENT_ROOT']."/upload/title/".$value['title_id']."/screenshot/";
														foreach($json_data[$value['steam_appid']]['data']['screenshots'] as $screenshot_key=>$screenshot_value){
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
													<button type="button" class="btn btn-secondary btn-sm shadow-none btn_screenshot_download font-13" data-titleid="<?=$value['title_id']?>" data-type='screenshot' data-url="<?=$screenshot_value['path_full']?>" data-thumbnail="<?=$screenshot_value['path_thumbnail']?>" data-num="<?=$screenshot_value['id']+1?>">스크린샷 <?=$screenshot_value['id']+1?> <br/>다운로드</button>
													<div class="result d-none" id="screenshot_<?=$value['title_id']?>_<?=$screenshot_value['id']+1?>"><span class="font-13">스크린샷 <?=$screenshot_value['id']+1?> 완료</span></div>
													<?}?>
												</div>
											<?
															}
														}
													}else{
														echo "스팀 JSON정보 없음";
														echo "<button class='btn btn-info btn-sm shadow-none btn_steam_sync' data-appid='".$value['steam_appid']."' data-titleid='".$value['title_id']."'>스팀 동기화</button>";
													}
												}
											?>
											</div>
											
										</td>
									</tr>
									<?}?>
								<?}?>
								</tbody>
							</table>
						</div>

						<div class="text-center mt-3"><?echo $goods_list->links_html;?></div>
					</div> <!-- end col -->
				</div>
				<!-- end row -->   
				
			</div> <!-- container -->

		</div> <!-- content -->
	</div>

	<!-- ============================================================== -->
	<!-- End Page content -->
	<!-- ============================================================== -->


</div>
<!-- END wrapper -->



<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>
<script>
$(document).ready(function(){
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
	
	//게임설명 동기화
	$(".btn_steam_sync").bind("click",function(){
		var index = $(".btn_steam_sync").index(this);
		var appids = $(".btn_steam_sync").eq(index).attr("data-appid");
		var title_id = $(".btn_steam_sync").eq(index).attr("data-titleid");
		$.ajax({
			 type: "GET",
			 url: "../steam/get_steam_game_info.php",
			 data: {mode:"steam_sync",appids:appids,title_id:title_id},
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
