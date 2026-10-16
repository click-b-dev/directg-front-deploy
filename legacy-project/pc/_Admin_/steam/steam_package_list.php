<?
$sidebar_file = "sidebar_goods.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";

$page_title="스팀 Package 현황";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_packageid = filter_input(INPUT_GET, 'search_packageid', FILTER_SANITIZE_STRING);
$search_name = filter_input(INPUT_GET, 'search_name', FILTER_SANITIZE_STRING);
$search_title_id = filter_input(INPUT_GET, 'search_title_id', FILTER_SANITIZE_STRING);
$search_app_type = filter_input(INPUT_GET, 'search_app_type', FILTER_SANITIZE_STRING);


	if(!$page){
		$page=1;
	}

	$where = [];
	$param ="";

	//$where[] = " discount_percent is null";

	if(isset($search_packageid) && $search_packageid<>""){
		$where[] = " packageid='".$search_packageid."'";
	}

	if(isset($search_name) && $search_name<>""){
		$where[] = "package_name like '%".$search_name."%'";
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

	$orderby = "package_coming_soon desc,package_release desc,package_name desc";
	//$orderby = "package_name asc";


try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$admin= new Admin($conn); 

	$app_package_list = $admin->getSteamAppPackage($page,$add_where,$orderby,$param);

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
						<h5 class="card-header bg-secondary text-white">스팀 Package 검색필터</h5>
						<div class="card-body">
							<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
								<div class="row">
									<div class="col-3 mb-2">
										<div class="row">
											<label for="search_packageid" class="col-sm-5 col-form-label col-form-label-sm bg-light border">스팀 packageid</label>
											<div class="col-sm-7">
												<input type="text" class="form-control form-control-sm" id="search_packageid" name="search_packageid" placeholder="스팀 packageid" value="<?=$search_packageid?>">
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

				<div class="mb-2"><? echo number_format($app_package_list->total_results)?> 개</div>

				<div class="row">
					<div class="col-12">
						<div class="table-responsive">
							<table class="table table-centered nowrap table-sm table-bordered" id="">
								<thead class="table-dark font-13">
									<tr>
										<th class="text-center">번호</th>
										<th class="text-center" style="width: 100px;">Package ID<br/>(App ID)</th>
										<th class="text-center">Package Name</th>
										<th class="text-center" style="width: 100px;">출시일</th>
										<th class="text-center" style="width: 100px;">판매구분</th>
										<th class="text-center" style="width: 130px;">포함된 APP수</th>
										<th class="text-center" style="width: 100px;">initial</th>
										<th class="text-center" style="width: 100px;">final</th>
										<th class="text-center" style="width: 100px;">옵션상품코드</th>
										<th class="text-center" style="width: 160px;">비고</th>
										<th class="text-center" style="width: 100px;">삭제</th>
									</tr>
								</thead>
								<tbody class="font-12">
							<?
								if($app_package_list->success == true){
									$result = $app_package_list->resultset->fetchAll();
									$num =1;
									foreach($result as $value){
											//관련기본게임
										//$game_data = $admin->getSteamBasicGame($value['steam_appid']);
										//echo "[".$game_data."] ";
										//$basic_game = $admin->getSteamAppinfo($game_data);
										//echo $basic_game['name'];
										
							?>
									<tr>
										<td class="text-center"><?=($page-1)*50+$num?></td>
										<td class="text-center"><?=$value['packageid']?><br/>(<?=$value['appid']?>)</td>
										<td><?=$value['package_name']?></td>
										<td class="text-center"><?=$value['package_release']?></td>
										<td class="text-center"><?=($value['package_coming_soon']=="1")?"<span class='text-danger'>예약판매</span>":"일반판매"?></td>
										<td  class="text-end"><?=number_format($value['cc'])?></td>
										<td class="text-end"><?=number_format($value['price_initial']/100)?></td>
										<td class="text-end"><?=number_format($value['price_final']/100)?></td>
										<td class="text-center">
										<?
											$goods_option = $admin->getGoodsOptionPackageInfo($value['packageid']);
											switch($goods_option['display_type']){
												case "basic":
													echo "기본게임";
												break;
												case "dlc":
													echo "DLC";
												break;
												case "music":
													echo "DLC";
												break;
												case "edition":
													echo "에디션";
												break;
											}
										?>
										</td>
										<td class="text-center">
										<button class="btn btn-sm btn-secondary shadow-none btn_steam_package" data-packageid="<?=$value['packageid']?>"><?=$package['packageid']?> 동기화</button>
										<br/>
										<?if($value['batch_date']){?>
												(<?=date('Y-m-d H:i:s',$value['batch_date'])?>)
										<?}else{?>
											<strong class="text-danger">업데이트 필요</strong>
										<?}?>
										</td>
										<td class="text-center"><button class="btn btn-sm btn-danger shadow-none btn_steam_package_delete" data-packageid="<?=$value['packageid']?>">삭제</button></td>
									</tr>
							<?
											$num++;
										}
									}
								?>
								</tbody>
							</table>
						</div>

						<div class="text-center mt-3"><?echo $app_package_list->links_html;?></div>

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
	$(".btn_steam_package").bind("click",function(){
		var index = $(".btn_steam_package").index(this);
		var packageids = $(".btn_steam_package").eq(index).attr("data-packageid");
		//var appid = $(".btn_steam_package").eq(index).attr("data-appid");
		$.ajax({
			 type: "GET",
			 url: "get_steam_package_info.php",
			 data: {mode:"steam_sync",packageids:packageids},
			 success: function (data, status) {
				alert(data);
				location.reload();
				//alert("완료");
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	$(".btn_steam_package_delete").bind("click",function(){
		var index = $(".btn_steam_package_delete").index(this);
		var packageids = $(".btn_steam_package_delete").eq(index).attr("data-packageid");
		$.ajax({
			 type: "GET",
			 url: "steam_package_delete.php",
			 data: {packageids:packageids},
			 success: function (data, status) {
				location.reload();
				//alert("완료");
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
