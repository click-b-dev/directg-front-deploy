<?
$sidebar_file = "sidebar_goods.php";
$page_title="스팀 Game 현황";

header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_appid = filter_input(INPUT_GET, 'search_appid', FILTER_SANITIZE_STRING);
$search_name = filter_input(INPUT_GET, 'search_name', FILTER_SANITIZE_STRING);
$search_title_id = filter_input(INPUT_GET, 'search_title_id', FILTER_SANITIZE_STRING);
$search_app_type = filter_input(INPUT_GET, 'search_app_type', FILTER_SANITIZE_STRING);


	if(!$page){
		$page=1;
	}

	$where = [];
	$param ="";

	$where[] = " a.app_type='game' and a.publisher<>'BANDAI NAMCO Entertainment' and a.publisher<>'Warner Bros. Interactive Entertainment' and a.publisher<>'Ubisoft'  and a.publisher<>'Bandai Namco Entertainment Inc.' and a.publisher<>'Electronic Arts' ";

	if(isset($search_appid) && $search_appid<>""){
		$where[] = " a.steam_appid='".$search_appid."'";
	}

	if(isset($search_name) && $search_name<>""){
		$where[] = "a.name like '%".$search_name."%'";
	}

	if(isset($search_app_type) && $search_app_type<>"all"){
		$where[] = " a.app_type='".$search_app_type."'";
		if($search_app_type<>'game'){
		//$where[] = " batch_date is null";
		}
	}else{
		$search_app_type = "all";
	}

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

	$orderby = "coming_soon desc,coming_soon_date desc,release_date desc";
	//$orderby = "batch_date asc";
	//$orderby = "a.batch_date desc,a.release_date desc";

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$admin= new Admin($conn); 

	$goods_list = $admin->getSteamGame($page,$add_where,$orderby,$param);

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

$checked['search_app_type'][$search_app_type] = "checked";
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">스팀 동기화</a></li>
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
						<h5 class="card-header bg-secondary text-white">스팀 Apps 검색필터</h5>
						<div class="card-body">
							<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
								<div class="row">
									<div class="col-2 mb-2">
										<div class="row">
											<label for="search_appid" class="col-sm-5 col-form-label col-form-label-sm bg-light border">스팀 APPID</label>
											<div class="col-sm-7">
												<input type="text" class="form-control form-control-sm" id="search_appid" name="search_appid" placeholder="스팀 APPID" value="<?=$search_appid?>">
											</div>
										</div>
									</div>
									<div class="col-4 mb-2">
										<div class="row">
											<label for="search_name" class="col-sm-3 col-form-label col-form-label-sm bg-light border">스팀 상품명</label>
											<div class="col-sm-9">
												<input type="text" class="form-control form-control-sm" id="search_name" name="search_name" placeholder="스팀 상품명" value="<?=$search_name?>">
											</div>
										</div>
									</div>
									<div class="col-2 mb-2">
										<div class="row">
											<div class="col-lg-12">
												<div class="float-end">
													<button type="submit" class="btn btn-primary shadow-none">스팀 Apps 검색</button>
												</div>
											</div>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>

				<div class="mb-2"><? echo number_format($goods_list->total_results)?> 개</div>

				<div class="row">
					<div class="col-12">
						<div class="table-responsive">
							<table class="table table-centered nowrap table-sm table-bordered" id="">
								<thead class="table-dark font-13">
									<tr>
										<th class="text-center">번호</th>
										<th class="text-center" style="width: 90px;">스팀<br/>APPID</th>
										<th class="text-center" style="width: 90px;">스팀유형</th>
										<th class="text-center">스팀 상품명</th>
										<th class="text-center" style="width: 130px;">퍼블리셔</th>
										<th class="text-center" style="width: 130px;">출시일</th>
										<th class="text-center" style="width: 130px;">관련 Package 수</th>
										<th class="text-center" style="width: 130px;">관련 DLC 수</th>
										<th class="text-center" style="width: 100px;">스팀<br/>가격정보</th>
										<th class="text-center" style="width: 120px;">스팀<br/>평가정보</th>
										<th class="text-center" style="width: 100px;">대표상품코드</th>
										<th class="text-center" style="width: 160px;">비고</th>
									</tr>
								</thead>
								<tbody class="font-12">
							<?
								if($goods_list->success == true){
									$result = $goods_list->resultset->fetchAll();
									$num = 1;
									foreach($result as $value){
							?>
									<tr>
										<td class="text-center"><?=($page-1)*50+$num?></td>
										<td class="text-center"><?=$value['steam_appid']?></td>
										<td class="text-center"><?=$value['app_type']?></td>
										<td>
											<p><?=$value['name']?></p>
											<?
												$supported_languages = explode(",",strip_tags($value['supported_languages']));
												
												//print_r($supported_languages);
												foreach($supported_languages as $sub_value){
													if(trim($sub_value)=="한국어"){
														echo "<span class='badge bg-secondary font-11 fw-normal'>인터페이스/자막</span>";
														$interface_korean = "Y";
													}

													if(trim($sub_value)=="한국어*"){
														echo "<span class='badge bg-secondary font-11 fw-normal'>인터페이스/자막</span> <span class='badge bg-secondary font-11 fw-normal'>음성</span>";
														$spoken_korean ="Y";
														$interface_korean = "Y";
													}
												}
											?>
										</td>
										<td class="text-center"><?=$value['publisher']?></td>
										<td class="text-center">
											<?//=($value['coming_soon'])?$value['coming_soon_date']:$value['release_date']?>
											<?=$value['release_date']?><br/>
											(<?=$value['coming_soon_date']?>)
										</td>
										<td  class="text-end">
										<?
											$package_data = $admin->getSteamPackage($value['steam_appid']);
											echo count($package_data);
										?>
										</td>
										<td  class="text-end">
										<?
											$dlc_data = $admin->getSteamDLCList($value['steam_appid']);
											echo count($dlc_data);
										?>
										</td>
										<td class="text-end"><?=number_format($value['consumer_price']/100)?><br/>(<?=number_format($value['price']/100)?>)</td>
										<td class="text-center">
											<?
												$review_info=$admin->getSteamReviewInfo($value['steam_appid']);
										
												echo $review_info['review_score']."<br/>(".$review_info['review_score_desc'].")";
											?>
											<?if($review_info['review_score']==""){?>
											<button class="btn btn-sm btn-secondary shadow-none btn_review_steam_all" data-appid="<?=$value['steam_appid']?>" data-titleid="<?=$value['title_id']?>">평가 동기화</button>
											<?}?>
										</td>
										<td class="text-center"><?=$value['title_id']?></td>
										<td class="text-center">
										<button class="btn btn-sm btn-secondary shadow-none btn_steam_game" data-appid="<?=$value['steam_appid']?>"><?=$value['steam_appid']?> 동기화</button>
										<br/>(<?=$value['batch_date']?>)
										</td>
									</tr>
							<?		
											$num++;
										}
									}
								?>
								</tbody>
							</table>
						</div>

						<div class="text-center mt-3"><?echo $goods_list->links_html;?></div>

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
	$(".btn_steam_game").bind("click",function(){
		var index = $(".btn_steam_game").index(this);
		var appids = $(".btn_steam_game").eq(index).attr("data-appid");
		$.ajax({
			 type: "GET",
			 url: "get_steam_game_info.php",
			 data: {mode:"btn_steam_sync",appids:appids},
			 success: function (data, status) {
				//location.href='ezwel_goods_list.php';
				alert(data);
				location.reload();
				//alert("완료");
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
	
	//리뷰 동기화 - steam 전체
	$(".btn_review_steam_all").bind("click",function(){
		var index = $(".btn_review_steam_all").index(this);
		var appids = $(".btn_review_steam_all").eq(index).attr("data-appid");
		$.ajax({
			 type: "GET",
			 url: "get_steam_review.php",
			 data: {purchase_type:"all",appids:appids,language:"all"},
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
