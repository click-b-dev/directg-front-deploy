<?
$sidebar_file = "sidebar_statistics.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['statistics'] = "active";
$page_title="Metacritic Score";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_year = filter_input(INPUT_GET, 'search_year', FILTER_SANITIZE_NUMBER_INT);

$selected['search_year'][$search_year] = "selected";

if(!$page){
	$page=1;
}

$where = [];

if(isset($search_year) && $search_year<>""){
	$where[] = " date_format(a.release_date,'%Y') ='".$search_year."'";
}


try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	//$add_where = " and is_view<>'D'";

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

	$orderby = "metacritic_score desc";

	$goods= new AdminGoods($conn); 

	$metacritic_score = $goods->getGoodsMetacriticScore($page,$add_where,$orderby,$param);

	//$publisher_data= $admin->getPublisherList();

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
										<li class="breadcrumb-item"><a href="javascript: void(0);">통계</a></li>
										<li class="breadcrumb-item"><a href="javascript: void(0);">상품분석</a></li>
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
						<h5 class="card-header bg-secondary text-white">대표상품 검색필터</h5>
						<div class="card-body">
							<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
								<div class="row mb-2">
									<div class="col-lg-2">
										<div class="row">
											<label for="search_title_id" class="col-sm-5 col-form-label bg-light border">출시연도</label>
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
								</div>
								<div class="row">
									<div class="col-md12">
										<div class="float-end">
											<button type="submit" class="btn btn-primary shadow-none"> 검색</button>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>

					<? echo number_format($metacritic_score->total_results)?> 개

					<div class="row g-0">
						<div class="col-12">
							<div class="card">
								<div class="card-body p-0">
									<div class="table-responsive">
										<table class="table table-bordered table-centered w-100 table-sm">
											<thead class="table-dark font-13">
											<tr>
												<th class="text-center">순위</th>
												<th class="text-center">Steam APP ID</th>
												<th class="text-center">name</th>
												<th class="text-center">App Type</th>
												<th class="text-center">퍼블리셔</th>
												<th class="text-center">출시일</th>
												<th class="text-center">스팀 평가수</th>
												<th class="text-center">Metacritic Score</th>
												
												<th class="text-center">Metacritic URL</th>
											</tr>
											</thead>
											<tbody class="font-12">
											<?
												
												if($metacritic_score->success == true){
													$result = $metacritic_score->resultset->fetchAll();
													$ranking = 1;
													foreach($result as $value){
											?>
											<tr>
												<td class="text-center"><?=$ranking+(100*($page-1))?></td>
												<td class="text-center"><?=$value['appid']?></td>
												<td><?=$value['name']?></td>
												<td  class="text-center"><?=$value['app_type']?></td>
												<td><?=$value['publisher']?></td>
												<td class="text-center"><?=$value['release_date']?></td>
												<td class="text-end"><?=number_format($value['recommendations'])?></td>
												<td class="text-center"><?=$value['metacritic_score']?></td>
												<td class="text-center"><a href="<?=$value['metacritic_url']?>" class="btn btn-outline-secondary btn-sm" target="_blank">바로가기</a></td>
											</tr>
											<?
														$ranking++;
													}
												}
											?>
											</tbody>
										</table>
									</div>
								</div>
								<div class="text-center mt-3"><?echo $metacritic_score->links_html;?></div>
								<!-- end card-body-->
							</div>
							<!-- end card-->
						</div>
						<!-- end col -->
					</div>
					<!-- end row -->   
				</div> <!-- container -->
			</div> <!-- content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

</body>
</html>
