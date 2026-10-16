<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page_title= "특전제공 상품 관리";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_type = filter_input(INPUT_GET, 'search_type', FILTER_SANITIZE_STRING);
$search_value = filter_input(INPUT_GET, 'search_value', FILTER_SANITIZE_STRING);
$search_date_type = filter_input(INPUT_GET, 'search_date_type', FILTER_SANITIZE_STRING);
$search_date_start = filter_input(INPUT_GET, 'search_date_start', FILTER_SANITIZE_STRING);
$search_date_end = filter_input(INPUT_GET, 'search_date_end', FILTER_SANITIZE_STRING);

$bonus_status = filter_input(INPUT_GET, 'bonus_status', FILTER_SANITIZE_STRING);
$preorder_status = filter_input(INPUT_GET, 'preorder_status', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
}

if($bonus_status==""){
	$bonus_status = "S";
}

if($preorder_status==""){
	$preorder_status = "Y";
}

if($search_type==""){
	$search_type="product_name";
}

if($search_value<>""){
	switch($search_type){
		case "bonus_name":
			$where[] = " a.bonus_name like '%".$search_value."%'";
		break;
		case "product_code":
			$where[] = " c.product_code ='".$search_value."'";
		break;
		case "product_name":
			$where[] = " c.product_name like '%".$search_value."%'";
		break;
	}
}


switch($bonus_status){
	case "C":
		$where[] = "a.bonus_start_date>=UNIX_TIMESTAMP() and a.bonus_end_date>=UNIX_TIMESTAMP()";
	break;
	case "S":
		$where[] = "a.bonus_start_date<=UNIX_TIMESTAMP() and a.bonus_end_date>=UNIX_TIMESTAMP()";
	break;
	case "E":
		$where[] = "a.bonus_start_date<=UNIX_TIMESTAMP() and a.bonus_end_date<=UNIX_TIMESTAMP()";
	break;
}

switch($preorder_status){
	case "Y":
		$where[] = "c.preorder_start<=UNIX_TIMESTAMP() and c.preorder_end>=UNIX_TIMESTAMP()";
	break;
	case "N":
		$where[] = "c.preorder_start<=UNIX_TIMESTAMP() and c.preorder_end<=UNIX_TIMESTAMP()";
	break;
}

$param = "";

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

//echo $add_where;
//exit;

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	

	$orderby = "a.bonus_start_date desc";

	$admin= new Admin($conn); 

	$goods_bonus_list = $admin->getGoodsItemBonusList($page,$add_where,$orderby,$param);

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

$selected['search_type'][$search_type] = "selected";
$checked['bonus_status'][$bonus_status] = "checked";
$checked['preorder_status'][$preorder_status] = "checked";
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">특전제공 관리</a></li>
									<li class="breadcrumb-item active"><?=$page_title?></li>
								</ol>
							</div>
							<h4 class="page-title"><?=$page_title?></h4>
						</div>
					</div>
				</div>     
				<!-- end page title --> 

				<div class="row g-0">
					<div class="card">
						<h5 class="card-header bg-secondary text-white">검색필터</h5>
						<div class="card-body p-3">
							<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
								<div class="row g-0 mb-2">
									<div class="col-6">
										<div class="row g-2">
											<label for="search" class="col-2 col-form-label col-form-label-sm bg-light border">검색어</label>
											<div class="col-4">
												<select id="search_type" name="search_type" class="form-select">
													<option value="bonus_name" <?=$selected['search_type']['bonus_name']?>>특전명</option>
													<option value="product_name" <?=$selected['search_type']['product_name']?>>옵션상품명</option>
													<option value="product_code" <?=$selected['search_type']['product_code']?>>옵션상품코드</option>
												</select>
											</div>
											<div class="col-6">
												<input type="text" class="form-control" id="search_value" name="search_value" placeholder="" value="<?=$search_value?>">
											</div>
										</div>
									</div>
								</div>

								<div class="row g-0 mb-2">
									<div class="col-6">
										<div class="row g-2">
											<label for="bonus_status" class="col-2 col-form-label col-form-label-sm bg-light border">지급상태</label>
											<div class="col-10">
												<div class="form-check form-check-inline mt-1">
													<input class="form-check-input" type="radio" id="bonus_status_c" name="bonus_status" value="C" <?=$checked['bonus_status']['C']?>>
													<label class="form-check-label" for="bonus_status_c">예정</label>
												</div>
												<div class="form-check form-check-inline">
													<input class="form-check-input" type="radio" id="bonus_status_s" name="bonus_status" value="S" <?=$checked['bonus_status']['S']?>>
													<label class="form-check-label" for="bonus_status_s">진행중</label>
												</div>
												<div class="form-check form-check-inline">
													<input class="form-check-input" type="radio" id="bonus_status_e" name="bonus_status" value="E" <?=$checked['bonus_status']['E']?>>
													<label class="form-check-label" for="bonus_status_e">종료</label>
												</div>
											</div>
										</div>
									</div>
									<div class="col-6">
										<div class="row g-2">
											<label for="preorder_status" class="col-2 col-form-label col-form-label-sm bg-light border">구매상태</label>
											<div class="col-10">
												<div class="form-check form-check-inline mt-1">
													<input class="form-check-input" type="radio" id="preorder_status_y" name="preorder_status" value="Y" <?=$checked['preorder_status']['Y']?>>
													<label class="form-check-label" for="preorder_status_y">예약구매</label>
												</div>
												<div class="form-check form-check-inline">
													<input class="form-check-input" type="radio" id="preorder_status_n" name="preorder_status" value="N" <?=$checked['preorder_status']['N']?>>
													<label class="form-check-label" for="preorder_status_n">일반구매</label>
												</div>
											</div>
										</div>
									</div>
								</div>

								<div class="row">
									<div class="col-lg-12">
										<div class="float-end">
											<button type="submit" class="btn btn-primary shadow-none">특전 검색</button>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>

				<div class="d-flex flex-row justify-content-between mb-2">
					<div class="float-start"><? echo number_format($goods_bonus_list->total_results)?> 개</div>
					<div class="float-end"></div>
				</div>

				<div class="row">
					<div class="col-12">
						<div class="card">
							<div class="card-body p-0">
								<div class="table-responsive">
									<table class="table table-centered w-100 nowrap table-sm table-bordered" id="">
										<thead class="table-light">
											<tr>
												<th class="text-center">옵션상품코드</th>
												<th class="text-center">옵션상품명</th>
												<th class="text-center">특전제공방식</th>
												<th class="text-center">특전명</th>
												<th class="text-center">특전제공 시작일자</th>
												<th class="text-center">특전제공 종료일자</th>
												<th class="text-center">출시일자</th>
												<th class="text-center">지급상태</th>
												<th class="text-center">구매상태</th>
												<th class="text-center">비고</th>
											</tr>
										</thead>
										<tbody class="font-13">
										<?
										if($goods_bonus_list->success == true){
											$result = $goods_bonus_list->resultset->fetchAll();

											foreach($result as $value){
												$bonus_asset = str_replace("&#34;",'"',htmlspecialchars_decode($value['bonus_asset']));
												$bonus_asset_list = json_decode($bonus_asset,true);
										?>
											<tr>
												<td class="text-center"><?=$value['product_code']?></td>
												<td class="text-start"><?=$value['product_name']?></td>
												<td class="text-center">
												<?
													switch($value['bonus_delivery_type']){
														case "1":
															echo "특전key 포함";
														break;
														case "2":
															echo "별도key 제공";
														break;
														case "3":
															echo "다운로드 컨텐츠";
														break;
													}
												?>
												</td>
												<td class="text-start">
													<span><?=$value['bonus_name']?></span>
													<?
													if(is_array($bonus_asset_list)){
														foreach($bonus_asset_list  as $sub_value){
													?>
													<span class="d-block ps-1 font-12">=> [<?=$sub_value['asset_id']?>] <?=$sub_value['asset_name']?></span>
													<?
														}
													}
													?>
												</td>
												<td class="text-center"><?=date("Y-m-d H:i",$value['bonus_start_date'])?></td>
												<td class="text-center"><?=date("Y-m-d H:i",$value['bonus_end_date'])?></td>
												<td class="text-center"><?=$value['release_date']?></td>
												<td class="text-center">
												<?
													if($value['bonus_start_date']>time()){
														echo "예정";
													}elseif($value['bonus_start_date']<=time() && $value['bonus_end_date']>=time()){
														echo "진행중";
													}else{
														echo "종료";
													}
												?>
												</td>
												<td class="text-center">
													<?
														if($value['preorder_start']<=time() && $value['preorder_end']>=time() ){
															echo "예약구매";
														}else{
															echo "일반구매";
														}
													?>
												</td>
												<td class="text-center table-action">	<a href="<?=$document_root?>/goods/goods_option_preorder_register.php?product_code=<?=$value['product_code']?>" class="action-icon" title="특전제공 수정"> <i class="mdi mdi-square-edit-outline"></i></a></td>
													
											</tr>
											<?}?>
										<?}?>
										</tbody>
									</table>
								</div>

								<div class="text-center mt-3"><?echo $goods_bonus_list->links_html;?></div>
							</div> <!-- end card-body-->
						</div> <!-- end card-->
					</div> <!-- end col -->
				</div>
				<!-- end row -->   
				
			</div>
			<!-- container -->

		</div>
		<!-- content -->

	</div><!-- /content-page -->
</div><!-- /wrapper -->
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>
</body>
</html>
