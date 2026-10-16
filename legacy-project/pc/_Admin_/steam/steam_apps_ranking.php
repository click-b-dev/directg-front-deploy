<?


$sidebar_file = "sidebar_goods.php";
$page_title = "스팀 Apps 평가수 순위";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_year = filter_input(INPUT_GET, 'search_year', FILTER_SANITIZE_NUMBER_INT);
$search_publisher = filter_input(INPUT_GET, 'search_publisher', FILTER_SANITIZE_STRING);
$is_free = filter_input(INPUT_GET, 'is_free', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
}

$where = [];
$param = "";

//$orderby = "diff_per_day desc,a.recommendations desc";
$orderby = "a.recommendations desc";

if(isset($search_year) && $search_year<>""){
	$where[] = " date_format(a.release_date,'%Y') ='".$search_year."'";
	$orderby = "a.recommendations desc";
}

if(isset($is_free) && $is_free<>""){
		$where[] = " a.is_free<>'".$is_free."'";
	}

if(isset($search_publisher) && $search_publisher<>""){
	$publisher_text = explode(' ',$search_publisher);
	$search_publisher_label = implode(" +",$publisher_text);
	$search_publisher_label = "+".$search_publisher_label;

	//echo  $search_publisher_label;
	if(strlen($search_publisher)<3){
		//$where[] = " a.publisher like'".$search_publisher."%'";
	}else{
		//$where[] = " MATCH(a.publisher) AGAINST('".$search_publisher_label."' IN BOOLEAN MODE)";
	}
	
	$where[] = " a.publisher like'".$search_publisher."%'";
	$orderby = "a.recommendations desc";
}

$selected['search_year'][$search_year] = "selected";

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$admin= new Admin($conn); 

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

	

	//$orderby = " a.metacritic_score desc,a.recommendations desc";

	//$query = "select appid,name,app_type,release_date,is_free,metacritic_score,recommendations,consumer_price,price,coming_soon,supported_languages,batch_date,recommendations/DATEDIFF(now(),release_date)as diff_per_day,DATEDIFF(now(),release_date)as diff,metacritic_score from steam_app_list where app_type='game' and recommendations>0 ";
	
	$data = $admin->getSteamAppRanking($page,$add_where,$orderby,$param);

	//퍼블리셔
	$query = "select b.publisher_name from steam_game a inner join steam_game_publisher b on a.steam_appid=b.appid where a.app_type='game' and a.coming_soon<>'1' group by b.publisher_name";
	$stmt = $conn->prepare($query);
	$stmt->execute();
	$publisher_list = $stmt->fetchAll();

	$selected['search_publisher'][$search_publisher] = "selected";
	$checked['is_free'][$is_free] = "checked";

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
									<li class="breadcrumb-item"><a href="javascript: void(0);">스팀 동기화</a></li>
									<li class="breadcrumb-item active">스팀 Apps 평가수 순위</li>
								</ol>
							</div>
							<h4 class="page-title">스팀 Apps 평가수 순위</h4>
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
									<div class="col-md-2">
										<div class="row">
											<label for="search_year" class="col-sm-5 col-form-labe col-form-label-sm bg-light border">스팀 출시연도</label>
											<div class="col-sm-7">
												<select class="form-select" id="search_year" name="search_year">
													<option value="">::선택::</option>
													<? for($i=2005;$i<=date('Y');$i++){?>
													<option value="<?=$i?>" <?=$selected['search_year'][$i]?>><?=$i?></option>
													<?}?>
												</select>
											</div>
										</div>
									</div>
									<div class="col-md-4 mb-2">
										<div class="row">
											<label for="search_appid" class="col-sm-3 col-form-labe col-form-label-sm bg-light border">퍼블리셔</label>
											<div class="col-sm-9">
												<select id="search_publisher" name="search_publisher" class="form-select">
													<option value="">:::선택:::</option>
													<?
														foreach($publisher_list as $sub_value){
															$publisher_name = strip_tags(htmlspecialchars_decode($sub_value['publisher_name']));
													?>
													<option value="<?=$publisher_name?>" <?=$selected['search_publisher'][$publisher_name]?>><?=$publisher_name?></option>
													<?
														}
													?>
												</select>
											</div>
										</div>
									</div>
									<div class="col-2 mb-2">
										<div class="row">
											<label for="is_free" class="col-sm-5 col-form-label col-form-label-sm bg-light border">무료여부</label>
											<div class="col-sm-7">
												<div class="form-check form-check-inline mt-1">
													<input type="checkbox" id="is_free" name="is_free" class="form-check-input" value="1" <?=$checked['is_free']['1']?>>
													<label class="form-check-label" for="is_free">무료제외</label>
												</div>
											</div>
										</div>
									</div>
									<div class="offset-md-2 col-md-2">
										<div class="float-end">
											<button type="submit" class="btn btn-primary shadow-none">스팀 Apps 검색</button>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>
				
				<div class="row mb-2">
					<div class="col-md-12">
						<span class="">총 <?=number_format($data->total_results)?></span>건
					</div>
				</div>

				<div class="grid">
					<?	$ranking = 1;
						if($data->success == true){
							$result = $data->resultset->fetchAll();
							foreach($result as $value){
					?>
					<div class="item">
						<div class="card">
							<div class="card-body p-2">
								<h5 class="card-title font-13 ps-3"><?=$value['name']?>
									<span class="position-absolute top-0 start-0 badge bg-danger font-14"><?=$ranking+(50*($page-1))?></span>
								</h5>
								<h6 class="card-subtitle text-muted ps-3">APPID: <?=$value['appid']?></h6>
							</div>
							<div class="position-relative">
								<img class="img-fluid" src="/upload/apps/header/<?=$value['appid']?>/header.jpg?t=<?=time()?>" alt="<?=$value['name']?>">
								<div  class="position-absolute top-0 start-0">
								<?
									$steam_support_language = str_replace('*음성이 지원되는 언어','',$value['supported_languages']);
									$steam_support_language = explode(",",strip_tags($steam_support_language));

									foreach($steam_support_language as $language){
										$language = str_replace('*음성이 지원되는 언어','',$language);
										//echo $language."<br/>";
										//echo $language."<br/>";
										if(strpos($language, "한국어")){
											echo "<span class='badge bg-success text-light font-12 fw-normal me-1'>인터페이스/자막 한글</span>";
											$interface_korean = "Y";
										}

										if(strpos($language, "한국어*")){
											echo "<span class='badge bg-primary text-light font-12 fw-normal '>음성 한글</span>";
											$spoken_korean ="Y";
											$interface_korean = "Y";
										}
									}
								?>
								</div>
							</div>
							<div class="card-body p-1">
								<table class="table table-centered nowrap table-sm table-bordered border caption-top mb-0">
									<tbody class="font-12">
									<tr>
										<th class="table-light" style="width:80px">개발사</th>
										<td><a href="steam_apps_list_all.php?search_developer=<?=$value['developer']?>&search_app_type=game" target="_blank"><?=$value['developer']?></a></td>
									</tr>
									<tr>
										<th class="table-light" style="width:80px">퍼블리셔</th>
										<td><a href="steam_apps_ranking.php?search_publisher=<?=$value['publisher']?>"><?=$value['publisher']?></a></td>
									</tr>
									<tr>
										<th class="table-light" style="width:80px">출시일</th>
										<td><?=$value['release_date']?></td>
									</tr>
									<tr>
										<th class="table-light" style="width:80px">장르</th>
										<td>
											<?
											//스팀장르정보 조회
											$steam_genre_data = $admin->getSteamAppsGenre($value['appid']);

											foreach($steam_genre_data as $genre){
												echo "<span class='badge bg-dark text-light font-11 fw-normal me-1 mb-1'>".$genre['genres_name']."</span>";
											}

											//스팀 카테고리정보 조회
											//$steam_category_data = $admin->getSteamGamesCategory($steam_appid);

											?>
										</td>
									</tr>
									<tr>
										<th class="table-light" style="width:80px">평가수</th>
										<td><?=number_format($value['recommendations'])?><br/> (일평균: <?=number_format($value['diff_per_day'],3)?>)</td>
									</tr>
									<tr>
										<th class="table-light" style="width:80px">가격정보</th>
										<td><?=number_format($value['consumer_price']/100)?> (<?=number_format($value['price']/100)?>)</td>
									</tr>
									<tr>
										<th class="table-light" style="width:80px">Metacritic</th>
										<td><strong><?=number_format($value['metacritic_score'])?></strong></td>
									</tr>
									<tr>
										<th class="table-light" style="width:80px">Package</th>
										<td>
										<?
											$package_data = $admin->getSteamPackageAll($value['appid']);
										?>
										<?=count($package_data)?> 개
										</td>
									</tr>
									<tr>
										<th class="table-light" style="width:80px">DLC</th>
										<td>
										<?
											$dlc_data = $admin->getSteamDLCAll($value['appid']);
										?>
										<?=count($dlc_data)?> 개
										</td>
									</tr>
									</tbody>
								</table>

								<!--<div class="list-group">
									<?
										if($value['appid']>0){
											

											foreach($package_data as $package){
												if($package['package_name']){
									?>
									<div class="list-group-item row align-content-end p-1">
										<div class="d-flex align-content-end flex-wrap px-0">
											<div class="col align-text-bottom"><span class="font-12"><?=$package['package_name']?></span></div>
											<div class="col-auto d-flex flex-column ms-auto">
												<s class="text-end font-11 num"><?=number_format($package['price_initial']/100)?></s>
												<span class="text-end font-12 num"><?=number_format($package['price_final']/100)?></span>
											</div>
										</div>
									</div>
									<?
												}else{
									?>
									<button class="btn btn-sm btn-secondary btn_steam_package shadow-none" data-packageid="<?=$package['packageid']?>" data-appid="<?=$value['appid']?>"><?=$package['packageid']?> 동기화</button>
									<?		}
											}
										}
									?>
								</div>-->

								
								<!--<div class="list-group">
									<div class="d-flex w-100 justify-content-between">
										<h5 class="mb-1">DLC</h5>
									</div>
									<?
										if($value['appid']>0){
											$dlc_data = $admin->getSteamDLCAll($value['appid']);
											foreach($dlc_data as $dlc){
												$dlc_name= $admin->getSteamAppinfoAll($dlc['dlc_appid']);
												if($dlc_name){
									?>
									<p class="mb-1 font-13"><?=$dlc_name?></p>
									<?
												}else{
									?>
									<button class="btn btn-sm btn-secondary btn_steam_sync shadow-none" data-appid="<?=$dlc['dlc_appid']?>" ><?=$dlc['dlc_appid']?> 동기화</button>
									<?		}
											}
										}
									?>
								</div>-->
							</div> <!-- end card-body-->
							<div class="card-footer p-1">
								<div class="d-flex align-items-center">
									<small>업데이트 일자: <?=$value['batch_date']?></small>
									<div class="d-flex ms-auto"><button type="button" class="btn btn-primary shadow-none btn_steam_sync" data-appid="<?=$value['appid']?>"><i class="uil uil-refresh"></i></button></div>
								</div>
							</div>
						</div>
					</div>
					<?
								$ranking++;
							}
						}
					?>
				</div>

				
				<div class="text-center mt-3"><?echo $data->links_html;?></div>
				
			</div> <!-- container -->

		</div> <!-- content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
<!-- third party js -->
<script src="<?=$document_root?>/assets/js/vendor/jquery.dataTables.min.js"></script>
<script src="<?=$document_root?>/assets/js/vendor/dataTables.bootstrap5.js"></script>
<script src="<?=$document_root?>/assets/js/vendor/dataTables.responsive.min.js"></script>
<script src="<?=$document_root?>/assets/js/vendor/responsive.bootstrap5.min.js"></script>
<script src="<?=$document_root?>/assets/js/vendor/dataTables.checkboxes.min.js"></script>

<!-- third party js ends -->

<!-- demo app -->
<script src="<?=$document_root?>/assets/js/pages/demo.products.js?1"></script>
<!-- end demo js-->

	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>
$(document).ready(function(){
	$(".btn_steam_package").bind("click",function(){
		var index = $(".btn_steam_package").index(this);
		var packageids = $(".btn_steam_package").eq(index).attr("data-packageid");
		var appid = $(".btn_steam_package").eq(index).attr("data-appid");
		$.ajax({
			 type: "GET",
			 url: "get_steam_package_info.php",
			 data: {mode:"steam_sync",packageids:packageids,appid:appid},
			 success: function (data, status) {
				//location.href='ezwel_goods_list.php';
				location.reload();
				//alert("완료");
				//alert(data);
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
		$.ajax({
			 type: "GET",
			 url: "get_steam_app_info.php",
			 data: {mode:"steam_sync",appids:appids},
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
