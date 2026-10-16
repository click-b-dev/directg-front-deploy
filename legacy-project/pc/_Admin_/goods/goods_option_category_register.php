<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";
$sub_sidebar_option['category'] = "active";
$page_title="옵션상품 카테고리 설정";


$mode = filter_input(INPUT_GET, 'mode', FILTER_SANITIZE_STRING);
$product_code = filter_input(INPUT_GET, 'product_code', FILTER_SANITIZE_STRING);

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_product_name = filter_input(INPUT_GET, 'search_product_name', FILTER_SANITIZE_STRING);
$search_is_view = filter_input(INPUT_GET, 'search_is_view', FILTER_SANITIZE_STRING);
$search_platform = filter_input(INPUT_GET, 'search_platform', FILTER_SANITIZE_STRING);
$search_product_platform = filter_input(INPUT_GET, 'search_product_platform', FILTER_SANITIZE_STRING);
$search_status = filter_input(INPUT_GET, 'search_status', FILTER_SANITIZE_STRING);
$search_game_type = filter_input(INPUT_GET, 'search_game_type', FILTER_SANITIZE_STRING);
$search_display_type = filter_input(INPUT_GET, 'search_display_type', FILTER_SANITIZE_STRING);
$genre_code = filter_input(INPUT_GET, 'genre_code', FILTER_SANITIZE_STRING);

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$admin= new Admin($conn);

	if($product_code){
		$query="select * from tbl_goods_item where product_code=:product_code";
		$stmt = $conn->prepare($query);
		$params = array(
			":product_code"=>$product_code
		);
		$stmt->execute($params);
		$goods_option_data = $stmt->fetch();


		$goods_sku = $goods_option_data['goods_sku'];

		$product_name = $goods_option_data['product_name'];
		$product_name_en = $goods_option_data['product_name_en'];
		$steam_appid = $goods_option_data['steam_appid'];
		$game_type = $goods_option_data['game_type'];
	}
	
	$steam_tag_data = $admin->getSteamTagKo($steam_appid);

	$steam_genre = $admin->getSteamGamesGenre($steam_appid);

	//스팀장르정보 조회
	if($steam_genre){
		$genre_data = explode(",",$steam_genre['genre']);
		
		foreach($genre_data as $genre){
			$steam_genre_data[]['genres_name']=$admin->getTagCode(trim($genre));
		}
	}else{
		$genre_data = explode(",",$goods_option_data['genre']);
		foreach($genre_data as $genre){
			$steam_genre_data[]['genres_name']=$genre;
		}
	}

	//스팀 카테고리정보 조회
	$steam_category = $admin->getSteamGamesCategory($steam_appid);
	
	if($steam_category){
		$category_data = explode(",",$steam_category['category']);
		foreach($category_data as $category){
			$steam_category_data[]['category_name']=$admin->getTagCode(trim($category));
		}
		
		if($goods_option_data['delivery_type']=="3"){
			$category_data = explode(",",$goods_option_data['category']);
			foreach($category_data as $category){
				$steam_category_data[]['category_name']=$category;
			}
		}

	}else{
		$category_data = explode(",",$goods_option_data['category']);
		foreach($category_data as $category){
			$steam_category_data[]['category_name']=$category;
		}
	}

	//싱글 플레이어,멀티플레이어,PvP,온라인 PvP,스크린 공유 및 분할 PvP,협동,스크린 공유 및 분할 협동,공유 및 분할 화면,컨트롤러 일부 지원

	$tag_data = $admin->getTagList();

	foreach($tag_data as $key=>$value){
		//if($value['tag_group_code']<>'G0001' && $value['tag_group_code']<>'P1'){
			if($value['tag_code']){
				$tag_list[$value['tag_group_code']][$key]['tag_code']=$value['tag_code'];
				$tag_list[$value['tag_group_code']][$key]['tag_name']=trim($value['tag_name']);

				foreach($steam_tag_data as $steam_tag){
					if($value['tag_group_code']<>'G0001' && $value['tag_group_code']<>'P1'){
						if($tag_list[$value['tag_group_code']][$key]['tag_name']==$steam_tag['tag_name']){
							//echo $steam_tag['tag_name']."<br/>";
							$tag_list[$value['tag_group_code']][$key]['tag_checked']="checked";
						}
					}
				}
			
				if(is_array($steam_category_data)){
					foreach($steam_category_data as $steam_category){
						//echo $steam_category;
						if($tag_list[$value['tag_group_code']][$key]['tag_code']==$steam_category['category_name']){
							//echo $steam_tag['tag_name']."<br/>";
							$tag_list[$value['tag_group_code']][$key]['tag_checked']="checked";
							//echo $steam_category['category_name'];
						}
					}
				}
				
				if(is_array($steam_genre_data)){
					foreach($steam_genre_data as $steam_genre){
						if($tag_list[$value['tag_group_code']][$key]['tag_code']==$steam_genre['genres_name']){
							//echo $steam_tag['tag_name']."<br/>";
							$tag_list[$value['tag_group_code']][$key]['tag_checked']="checked";
						}
					}
				}

			}
	//	}
	}

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

$referer = "goods_option_category_register.php";

//print_r($tag_list);
//print_r($checked);
//exit;

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
									<li class="breadcrumb-item active"><?=$page_title?></li>
								</ol>
							</div>
							<h4 class="page-title"><?=$goods_option_data['product_name']?>(<?=$goods_option_data['product_name_en']?>)</h4>
						</div>
					</div>
				</div>     
				<!-- end page title --> 
				<div class="row">
					<div class="col-2 mb-2 mb-sm-0">
						<? include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/sub_sidebar_option.php');?>
					</div>
					<div class="col-10">
						<form id="frm" name="frm" method="post" action="goods_option_category_ps.php" class="form-horizontal">
							<input type="hidden" name="mode" value="<?=$mode?>">
							<input type="hidden" name="product_code" value="<?=$product_code?>">
							<input type="hidden" name="search_status" value="<?=$search_status?>">
							<input type="hidden" name="search_product_platform" value="<?=$search_product_platform?>">
							<input type="hidden" name="search_product_name" value="<?=$search_product_name?>">
							<input type="hidden" name="search_game_type" value="<?=$search_game_type?>">
							<input type="hidden" name="search_display_type" value="<?=$search_display_type?>">
							<input type="hidden" name="referer" value="<?=$referer?>">
							<input type="hidden" name="page" value="<?=$page?>">
							<input type="hidden" name="genre_code" value="<?=$genre_code?>">

							<div class="row mb-2">
								<div class="text-end">
<?php
	if(!$product_viewer){
?>
									<button type="submit" class="btn btn-primary shadow-none"><i class="mdi mdi-content-save font-16"></i> 옵션상품 카테고리저장</button>
<?php
	}
?>
								</div>
							</div>

							<div class="row">
								<div class="col-12">
									<div class="card">
										<h5 class="card-header  bg-secondary text-white">게임 카테고리</h5>
										<div class="card-body">
											<div class="row mb-2 border-top">
												<?
														foreach($tag_list as $key=>$value){
															$tag_group_info = $admin->getTagGroupInfo($key);
															//print_r($tag_group_info);
															if(substr($key,0,1)=='C'){
													?>
													<label for="category" class="col-sm-2 col-form-label bg-light border"><?=$tag_group_info['tags_group_name']?></label>
													<div class="col-sm-10 pt-2 pb-1 border-bottom border-end">
														<?
															foreach($value as $sub_key=>$sub_value){
														?>
														<div class="form-check form-check-inline pb-1">
															<input type="checkbox" id="category<?=$sub_value['tag_code']?>" name="category[]" class="form-check-input" value="<?=$sub_value['tag_code']?>" <?=$sub_value['tag_checked']?>>
															<label class="form-check-label" for="category<?=$sub_value['tag_code']?>"><?=$sub_value['tag_name']?></label>
														</div>
														<?
															}
														?>
													</div>
													<?	}
														}
													?>
											</div>
										</div>
									</div>
								</div>
							</div>
							
							<div class="row">
								<div class="col-12">
									<div class="card">
										<h5 class="card-header  bg-secondary text-white">홀로모델 카테고리</h5>
										<div class="card-body">
											<div class="row mb-2 border-top">
												<?
														foreach($tag_list as $key=>$value){
															$tag_group_info = $admin->getTagGroupInfo($key);
															//print_r($tag_group_info);
															if(substr($key,0,2)=='HC'){
													?>
													<label for="category" class="col-sm-2 col-form-label bg-light border"><?=$tag_group_info['tags_group_name']?></label>
													<div class="col-sm-10 pt-2 pb-1 border-bottom border-end">
														<?
															foreach($value as $sub_key=>$sub_value){
														?>
														<div class="form-check form-check-inline pb-1">
															<input type="checkbox" id="category<?=$sub_value['tag_code']?>" name="category[]" class="form-check-input" value="<?=$sub_value['tag_code']?>" <?=$sub_value['tag_checked']?>>
															<label class="form-check-label" for="category<?=$sub_value['tag_code']?>"><?=$sub_value['tag_name']?></label>
														</div>
														<?
															}
														?>
													</div>
													<?	}
														}
													?>
											</div>
										</div>
									</div>
								</div>
							</div>

							<div class="row">
								<div class="col-12">
									<div class="card">
										<h5 class="card-header  bg-secondary text-white">PS액세서리 카테고리</h5>
										<div class="card-body px-3 py-2 font-13">
											<div class="row mb-2 border-top">
												<?
													foreach($tag_list as $key=>$value){
														$tag_group_info = $admin->getTagGroupInfo($key);
														//print_r($tag_group_info);
														if(substr($key,0,1)=='P'){
												?>
												<label for="category" class="col-sm-2 col-form-label bg-light border"><?=$tag_group_info['tags_group_name']?></label>
												<div class="col-sm-10 pt-2 pb-1 border-bottom border-end">
													<?
														foreach($value as $sub_key=>$sub_value){
													?>
													<div class="form-check form-check-inline pb-1">
														<input type="checkbox" id="category<?=$sub_value['tag_code']?>" name="category[]" class="form-check-input" value="<?=$sub_value['tag_code']?>" <?=$sub_value['tag_checked']?>>
														<label class="form-check-label" for="category<?=$sub_value['tag_code']?>"><?=$sub_value['tag_name']?></label>
													</div>
													<?
														}
													?>
												</div>
												<?	}
													}
												?>
											</div>
										</div>
									</div>
								</div>
							</div>
							
							<div class="row">
								<div class="col-12">
									<div class="card">
										<h5 class="card-header  bg-secondary text-white">Razer (레이저) 카테고리</h5>
										<div class="card-body px-3 py-2 font-13">
											<div class="row mb-2 border-top">
												<?
													foreach($tag_list as $key=>$value){
														$tag_group_info = $admin->getTagGroupInfo($key);
														//print_r($tag_group_info);
														if(substr($key,0,1)=='R'){
												?>
												<label for="category" class="col-sm-2 col-form-label bg-light border"><?=$tag_group_info['tags_group_name']?></label>
												<div class="col-sm-10 pt-2 pb-1 border-bottom border-end">
													<?
														foreach($value as $sub_key=>$sub_value){
													?>
													<div class="form-check form-check-inline pb-1">
														<input type="checkbox" id="category<?=$sub_value['tag_code']?>" name="category[]" class="form-check-input" value="<?=$sub_value['tag_code']?>" <?=$sub_value['tag_checked']?>>
														<label class="form-check-label" for="category<?=$sub_value['tag_code']?>"><?=$sub_value['tag_name']?></label>
													</div>
													<?
														}
													?>
												</div>
												<?	}
													}
												?>
											</div>
										</div>
									</div>
								</div>
							</div>

						</form>
					</div>
				</div>
				<!-- end row -->   
				
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
	 $("form").submit(function(event) {
		 var dec = 0;
		$('input[name="tag[]"]').each(function(index, item){
			if($(this).prop('checked')){
				dec +=parseInt($(this).val());
			}
		});
	});
});

</script>

</body>
</html>
