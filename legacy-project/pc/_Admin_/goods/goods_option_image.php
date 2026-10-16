<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_product_code = filter_input(INPUT_GET, 'search_product_code', FILTER_SANITIZE_STRING);
$search_product_name = filter_input(INPUT_GET, 'search_product_name', FILTER_SANITIZE_STRING);
$search_product_name_en = filter_input(INPUT_GET, 'search_product_name_en', FILTER_SANITIZE_STRING);
$search_appid = filter_input(INPUT_GET, 'search_appid', FILTER_SANITIZE_STRING);
$search_is_view = filter_input(INPUT_GET, 'search_is_view', FILTER_SANITIZE_STRING);
$search_status = filter_input(INPUT_GET, 'search_status', FILTER_SANITIZE_STRING);

$search_publisher_code = filter_input(INPUT_GET, 'search_publisher_code', FILTER_SANITIZE_STRING);
$search_supplier_code = filter_input(INPUT_GET, 'search_supplier_code', FILTER_SANITIZE_STRING);
$search_genre_code = filter_input(INPUT_GET, 'search_genre_code', FILTER_SANITIZE_STRING);

$search_platform = filter_input(INPUT_GET, 'search_platform', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
}

$where = [];

$where[] = " (game_type<>'bundle' and game_type<>'randombox') and product_platform='1' and status<>'3' and display_type<>'bundle'";

if(isset($search_product_code) && $search_product_code<>""){
	$where[] = " product_code ='".$search_product_code."'";
}

if(isset($search_product_name) && $search_product_name<>""){
	$where[] = " product_name like '%".$search_product_name."%'";
}

if(isset($search_product_name_en) && $search_product_name_en<>""){
	$where[] = " product_name_en like '%".$search_product_name_en."%'";
}

if(isset($search_appid) && $search_appid<>""){
	$where[] = "steam_appid ='".$search_appid."'";
}

if(isset($search_is_view) && $search_is_view<>""){
	$where[] = "is_view ='".$search_is_view."'";
}

if(isset($search_publisher_code) && $search_publisher_code<>""){
	$where[] = "publisher_code ='".$search_publisher_code."'";
}

if(isset($search_supplier_code) && $search_supplier_code<>""){
	$where[] = "supplier_code ='".$search_supplier_code."'";
}

if(isset($search_platform) && $search_platform<>""){
	$where[] = "platform_code ='".$search_platform."'";
}

if(isset($search_status) && $search_status<>""){
	$where[] = " status='".$search_status."'";
}

$checked['search_is_view'][$search_is_view] = "checked";
$selected['search_publisher_code'][$search_publisher_code] = "selected";
$selected['search_supplier_code'][$search_supplier_code] = "selected";
$selected['search_platform'][$search_platform] = "selected";
$selected['search_genre_code'][$search_genre_code] = "selected";
$checked['search_age_limit'][$search_age_limit]="checked";
$checked['search_status'][$search_status] = "checked";



try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

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

	$orderby = "release_date desc";

	$admin= new Admin($conn);
	$adminGoods= new AdminGoods($conn); 

	$goods_option_list = $admin->getGoodsOptionList($page,$add_where,$orderby,$param,"50");

	$publisher_data= $admin->getPublisherAllList('all');

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
									<li class="breadcrumb-item"><a href="javascript: void(0);">옵션상품 관리</a></li>
									<li class="breadcrumb-item active">옵션상품 이미지설정</li>
								</ol>
							</div>
							<h4 class="page-title">옵션상품 이미지설정</h4>
						</div>
					</div>
				</div>     
				<!-- end page title --> 

				<div class="row g-2">
					<div class="card">
						<h5 class="card-header bg-secondary text-white">옵션상품 검색필터</h5>
						<div class="card-body">
							<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
								<div class="row mb-2">
									<div class="col-lg-2">
										<div class="row">
											<label for="search_product_code" class="col-sm-5 col-form-label bg-light border">옵션상품코드</label>
											<div class="col-sm-7">
												<input type="text" class="form-control" id="search_product_code" name="search_product_code" placeholder="옵션상품코드" value="<?=$search_product_code?>">
											</div>
										</div>
									</div>
									<div class="col-lg-5">
										<div class="row">
											<label for="search_product_name" class="col-sm-3 col-form-label bg-light border">옵션상품명(국문)</label>
											<div class="col-sm-9">
												<input type="text" class="form-control" id="search_product_name" name="search_product_name" placeholder="옵션상품명(국문)" value="<?=$search_product_name?>">
											</div>
										</div>
									</div>
									<div class="col-lg-5">
										<div class="row">
											<label for="search_product_name_en" class="col-sm-3 col-form-label bg-light border">옵션상품명(영문)</label>
											<div class="col-sm-9">
												<input type="text" class="form-control" id="search_product_name_en" name="search_product_name_en" placeholder="옵션상품명(영문)" value="<?=$search_product_name_en?>">
											</div>
										</div>
									</div>
								</div>

								<div class="row mb-2">
									<div class="col-lg-4">
										<div class="row">
											<label for="search_publisher_code" class="col-sm-4 col-form-label bg-light border">옵션상품 공급처</label>
											<div class="col-sm-8">
												<select id="search_publisher_code" name="search_publisher_code" class="form-select">
													<option value="">:::선택:::</option>
													<?
														foreach($publisher_data as $value){
													?>
													<option value="<?=$value['publisher_code']?>" <?=$selected['search_publisher_code'][$value['publisher_code']]?>>[<?=$value['publisher_code']?>] <?=$value['publisher_name']?></option>
													<?
														}
													?>
												</select>
											</div>
										</div>
									</div>
								</div>
								<div class="row mb-2">
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
													<label class="form-check-label" for="search_is_view_y">예</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_is_view_n" name="search_is_view" class="form-check-input" value="N" <?=$checked['search_is_view']['N']?>>
													<label class="form-check-label" for="search_is_view_n">아니오</label>
												</div>
											</div>
										</div>
									</div>
									<div class="col-lg-6">
										<div class="row">
											<h6 class="col-sm-2 col-form-label col-form-label-sm bg-light border">판매상태</h6>
											<div class="col-sm-8 mt-1">
												<div class="form-check form-check-inline">
													<input type="radio" id="status_9" name="search_status" class="form-check-input"  value="9" <?=$checked['search_status']['9']?>>
													<label class="form-check-label" for="status_9"><span class="badge badge-secondary-lighten font-13">승인대기</span></label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="status_0" name="search_status" class="form-check-input" value="0" <?=$checked['search_status']['0']?>>
													<label class="form-check-label" for="status_0"><span class="badge badge-primary-lighten font-13">판매중</span></label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="status_1" name="search_status" class="form-check-input"  value="1" <?=$checked['search_status']['1']?>>
													<label class="form-check-label" for="status_1"><span class="badge badge-warning-lighten font-13">판매중지</span></label>
												</div>
												
												<div class="form-check form-check-inline">
													<input type="radio" id="status_3" name="search_status" class="form-check-input"  value="3" <?=$checked['search_status']['3']?>>
													<label class="form-check-label" for="status_3"><span class="badge badge-danger-lighten font-13">판매종료</span></label>
												</div>
											</div>
										</div>
									</div>
								</div>

								<div class="row">
									<div class="col-lg-12">
										<div class="float-end">
											<button type="submit" class="btn btn-primary">옵션상품 검색</button>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>

				<div class="row">
					<div class="col-12">
					
						<? echo number_format($goods_option_list->total_results)?> 개
						
						<div class="table-responsive bg-white">
							<table class="table table-centered nowrap table-sm table-bordered" id="">
								<thead class="table-light font-14">
									<tr>
										<th class="text-center" style="width: 6%;">옵션상품<br/>코드</th>
										<th class="text-center" style="width: 25%;">옵션상품명</th>
										<th class="text-center" style="width: 6%;">옵션상품<br/>플랫폼</td>
										<th class="text-center" style="width: 6%;">옵션상품<br/>구분</th>
										<th class="text-center" style="width: 6%;">진열그룹</th>
										<th class="text-center" style="width: 7%;">옵션상품<br/>출시일</th>
										<th class="text-center" style="width: 6%;">판매상태</th>
										<th class="text-center" style="width: 11%;">옵션상품<br/>공급처</td>
										<th class="text-center" style="width: 8%;">header<br/>(460x215)</th>
										<th class="text-center" style="width: 13%;">이미지도메인</th>
									</tr>
								</thead>
								<tbody class="font-13">
								<?
								if($goods_option_list->success == true){
									$result = $goods_option_list->resultset->fetchAll();

									foreach($result as $value){
										$image_chk = $admin->getSteamImageChk($value['steam_appid']);
										
										//스팀 이미지 주소
										$steam_image = $admin->getSteamAppinfo($value['steam_appid']);
								?>
									<tr>
										<td class="text-center"><?=$value['product_code']?></br>
										<?
											echo "(".$value['steam_appid'].")<br/>";
										?>
										</td>
										<td><?=$value['product_name']?><br/><span class="eng"><?=$value['product_name_en']?></span></td>
										<td class="text-center"><?=$admin->getProductPlatform($value['product_platform'])?></td>
										<td class="text-center"><?=$value['game_type']?></td>
										<td class="text-center"><?=$value['display_type']?></td>
										<td class="text-center"><?=substr($value['release_date'],0,10)?></td>
										<td class="text-center"><?=$admin->getProductStatus($value['status'])?></td>
										<td class="text-center"><span class="eng"><?=$adminGoods->getPublisherName($value['supplier_code'])?></span></td>
										<td class="text-center chk_header">
										<?
											if($value['steam_appid']>0){
												$header_path = '/home/dgkrshop/www/upload/product/'.$value['product_code']."/header/header.jpg";
												$header_url = $steam_image['header_image'];
												//https://cdn.cloudflare.steamstatic.com/steam/apps/214320/header.jpg
												if(!file_exists($header_path)){
													if($image_chk['is_header']=="404"){
														echo "<input type='file' name='header_img[]' style='display:none;' /><button type='button' name='button' value='Upload' class='btn btn-success btn-sm shadow-none btn_upload_header' data-productcode='".$value['product_code']."' data-appid='".$value['steam_appid']."'><span class='uil uil-cloud-upload'></span> Upload</button>";
													}else{
														if(file_exists($header_path)){
															echo "O";
										?>
											<button type="button" class="btn btn-secondary btn-sm shadow-none mt-1 btn_img_download" data-productcode="<?=$value['product_code']?>" data-type="header_460x215" data-url="<?=$header_url?>" data-appid="<?=$value['steam_appid']?>">이미지저장</button>
										<?
														}else{
										?>
											<button type="button" class="btn btn-secondary btn-sm shadow-none mt-1 btn_img_download" data-productcode="<?=$value['product_code']?>" data-type="header_460x215" data-url="<?=$header_url?>" data-appid="<?=$value['steam_appid']?>">이미지저장</button>
										<?
														}
													}
												}else{
													echo "O<br/>";
													if($value['display_type']=="basic" || $value['display_type']=="dlc"){
										?>
											<button type="button" class="btn btn-info shadow-none btn_img_download" data-productcode="<?=$value['product_code']?>" data-type="header_460x215" data-url="<?=$header_url?>" data-appid="<?=$value['steam_appid']?>"><i class="uil uil-refresh"></i></button>
										<?
													}
												}
											}else{
										?>

										<?
											}
										?>
										</td>
										<td class="text-center"><?=$value['domain']?></td>
									</tr>
									<?}?>
								<?}?>
								</tbody>
							</table>
						</div>

						<div class="text-center mt-3"><?echo $goods_option_list->links_html;?></div>
					</div> <!-- end col -->
				</div>
				<!-- end row -->   
				
			</div> <!-- container -->

		</div> <!-- content -->

	</div>

</div>
<!-- END wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>
/*
const theButton = document.querySelector(".btn_steam_sync");
document.querySelector(".btn_steam_sync").addEventListener("click", () => {
	theButton.classList.add("loading");
});
*/
$(document).ready(function(){
	
	//스팀이미지 다운로드
	$(".btn_img_download").bind("click",function(){
		var index = $(".btn_img_download").index(this);
		var product_code= $(".btn_img_download").eq(index).attr("data-productcode");
		var image_type= $(".btn_img_download").eq(index).attr("data-type");
		var image_url= $(".btn_img_download").eq(index).attr("data-url");
		var appid= $(".btn_img_download").eq(index).attr("data-appid");
		
		$(".btn_img_download").eq(index).html("<div class='spinner-border spinner-border-sm text-light' role='status'></div>")
		$.ajax({
			 type: "POST",
			 url: "../steam/steam_image_download2.php",
			 data: {product_code:product_code,image_type:image_type,image_url:image_url,appid:appid},
			 success: function (data, status) {
				 //location.reload();
				 //alert(data);
				  alert(data);
				$(".btn_img_download").eq(index).parent().html("O")
				
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//header 이미지 업로드
	$(".btn_upload_header").bind("click",function(e){
		var index = $(".btn_upload_header").index(this);
		var title_id =$(".btn_upload_header").eq(index).attr("data-titleid");
		var steam_appid =$(".btn_upload_header").eq(index).attr("data-appid");
		var form = new FormData();
		e.preventDefault();
		$('input[name="header_img[]"]').eq(index).click();
		$('input[name="header_img[]"]').eq(index).bind("change",function(obj){
			var header_img = $(this).val();
			form.append( "header_img", $('input[name="header_img[]').eq(index)[0].files[0]);
			form.append( "title_id", title_id);
			form.append( "mode", "header_upload");
			form.append( "appid", steam_appid);
			$.ajax({
				type: "POST",
				processData : false,
				contentType : false,
				url: "goods_option_ps.php",
				data: form,
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

	//capsule 이미지 업로드
	$(".btn_upload_capsule").bind("click",function(e){
		var index = $(".btn_upload_capsule").index(this);
		var title_id =$(".btn_upload_capsule").eq(index).attr("data-titleid");
		var steam_appid =$(".btn_upload_capsule").eq(index).attr("data-appid");
		var form = new FormData();
		e.preventDefault();
		$('input[name="capsule_img[]"]').eq(index).click();
		$('input[name="capsule_img[]"]').eq(index).bind("change",function(obj){
			var header_img = $(this).val();
			form.append( "capsule_img", $('input[name="capsule_img[]').eq(index)[0].files[0]);
			form.append( "title_id", title_id);
			form.append( "mode", "capsule_upload");
			form.append( "appid", steam_appid);
			$.ajax({
				type: "POST",
				processData : false,
				contentType : false,
				url: "goods_option_ps.php",
				data: form,
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
});
</script>
</body>
</html>
