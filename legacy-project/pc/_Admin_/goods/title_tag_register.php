<?
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sub_sidebar_title['tag'] = "active";
$sidebar_file="sidebar_goods.php";

$title_id = filter_input(INPUT_GET, 'title_id', FILTER_SANITIZE_STRING);
$referer = filter_input(INPUT_GET, 'referer', FILTER_SANITIZE_STRING);
$title_code = filter_input(INPUT_GET, 'title_code', FILTER_SANITIZE_STRING);
$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_sales_status = filter_input(INPUT_GET, 'search_sales_status', FILTER_SANITIZE_STRING);
$search_publisher = filter_input(INPUT_GET, 'search_publisher', FILTER_SANITIZE_STRING);
$search_is_view = filter_input(INPUT_GET, 'search_is_view', FILTER_SANITIZE_STRING);


$referer_url = "title_tag_register.php";

foreach($_GET as $key=>$value){
	if($key<>"page" && $key<>"title_id"){
		if($value<>""){
			$param.="&".$key."=".$value;
		}
	}
}

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$admin= new Admin($conn);


	//대표상품 기본정보
	$title_info = $admin->getTitle($title_id);

	$steam_appid = $title_info['steam_appid'];
	$steam_tag_data = $admin->getSteamTagKo($steam_appid);

	$steam_genre = $admin->getSteamGamesGenre($steam_appid);

	//스팀장르정보 조회
	if($steam_genre){
		$genre_data = explode(",",$steam_genre['genre']);
		
		foreach($genre_data as $genre){
			$steam_genre_data[]['genres_name']=$admin->getTagCode(trim($genre));
		}
	}else{
		$genre_data = explode(",",$title_info['genre']);
		foreach($genre_data as $genre){
			$steam_genre_data[]['genres_name']=$genre;
		}
	}
	
	
	
	$steam_category_result = $admin->getSteamGamesCategory($steam_appid);

	//스팀 카테고리정보 조회
	if($steam_category_result){
		$category_data = explode(",",$steam_category_result['category']);
		foreach($category_data as $category){
			$steam_category_data[]['category_name']=$admin->getTagCode(trim($category));
		}
	}else{
		$category_data = explode(",",$title_info['category']);
		foreach($category_data as $category){
			$steam_category_data[]['category_name']=$category;
		}
	}

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
									<li class="breadcrumb-item active">태그정보 설정</li>
								</ol>
							</div>
							<h4 class="page-title"><?=$title_info['title_name']?> <small>(<?=$title_info['title_name_en']?>)</small></h4>
						</div>
					</div>
				</div>     
				<!-- end page title -->
				
				<div class="row">
					<div class="col-2 mb-2 mb-sm-0">
						<? include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/sub_sidebar_title.php');?>
					</div>
					<div class="col-10">
						<form id="frm" name="frm" method="post" action="title_tag_ps.php" class="form-horizontal">
						<input type="hidden" name="title_id" value="<?=$title_id?>">
						<input type="hidden" name="mode" id="mode" value="tag_save">
						<input type="hidden" name="referer" id="referer" value="<?=$referer_url?>?page=<?=$page?><?=$param?>">
						<input type="hidden" name="page" id="page" value="<?=$page?>">
						<input type="hidden" name="search_is_view" value="<?=$search_is_view?>">
						<input type="hidden" name="search_sales_status" value="<?=$search_sales_status?>">
						<input type="hidden" name="search_publisher" value="<?=$search_publisher?>">
						
						<div class="row mb-2">
							<div class="text-end">
						<?php
							if(!$product_viewer){
						?>
								<button type="submit" class="btn btn-primary shadow-none"><i class="mdi mdi-content-save font-16"></i> 대표상품 태그저장</button>
						<?php
							}
						?>
							</div>
						</div>
							
						<div class="row g-2">
							<div class="col-12">
								<?	if($title_info['title_code']=="33"){?>
								<div class="card">
									<h5 class="card-header  bg-secondary text-white">디지털상품 장르 정보</h5>
									<div class="card-body px-3 py-2 font-13">
										<div class="row mb-2 border-top">
											<?
													foreach($tag_list as $key=>$value){
														$tag_group_info = $admin->getTagGroupInfo($key);
														
														if(substr($key,0,2)=='G0'){
															//print_r($steam_genre_data);
												?>
												<label for="genre" class="col-sm-2 col-form-label bg-light border"><?=$tag_group_info['tags_group_name']?></label>
												<div class="col-sm-10 pt-2 pb-1 border-bottom border-end">
													<?
														foreach($value as $sub_key=>$sub_value){
													?>
													<div class="form-check form-check-inline pb-1">
														<input type="checkbox" id="genre<?=$sub_value['tag_code']?>" name="genre[]" class="form-check-input" value="<?=$sub_value['tag_code']?>" <?=$sub_value['tag_checked']?>>
														<label class="form-check-label" for="genre<?=$sub_value['tag_code']?>"><?=$sub_value['tag_name']?></label>
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
								
								<div class="card">
									<h5 class="card-header  bg-secondary text-white">디지털상품 카테고리 정보</h5>
									<div class="card-body px-3 py-2 font-13">
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
								
								<div class="card">
									<h5 class="card-header  bg-secondary text-white">홀로모델 장르 정보</h5>
									<div class="card-body px-3 py-2 font-13">
										<div class="row mb-2 border-top">
											<?
													foreach($tag_list as $key=>$value){
														$tag_group_info = $admin->getTagGroupInfo($key);
														
														if(substr($key,0,2)=='HG'){
															//print_r($steam_genre_data);
												?>
												<label for="genre" class="col-sm-2 col-form-label bg-light border"><?=$tag_group_info['tags_group_name']?></label>
												<div class="col-sm-10 pt-2 pb-1 border-bottom border-end">
													<?
														foreach($value as $sub_key=>$sub_value){
													?>
													<div class="form-check form-check-inline pb-1">
														<input type="checkbox" id="genre<?=$sub_value['tag_code']?>" name="genre[]" class="form-check-input" value="<?=$sub_value['tag_code']?>" <?=$sub_value['tag_checked']?>>
														<label class="form-check-label" for="genre<?=$sub_value['tag_code']?>"><?=$sub_value['tag_name']?></label>
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
								
								<div class="card">
									<h5 class="card-header  bg-secondary text-white">홀로모델 카테고리 정보</h5>
									<div class="card-body px-3 py-2 font-13">
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
								<?}?>
								
								<?if($title_info['title_code']=="12"){?>
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
								<?}?>
							</div>
						</div>
					</form>
					</div>
				</div>
			</div> <!-- container -->

		</div> <!-- content -->

	</div><!-- /content-page -->
</div><!-- /wrapper -->

<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>

$(document).ready(function(){
	$("form").submit(function(event) {
	});
});

</script>
</body>
</html>
