<?
$page_title="제공컨텐츠 현황";

header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_value = filter_input(INPUT_GET, 'search_value', FILTER_SANITIZE_SPECIAL_CHARS);
$search_supply_content_type = filter_input(INPUT_GET, 'search_supply_content_type', FILTER_SANITIZE_STRING);
$search_is_encode = filter_input(INPUT_GET, 'search_is_encode', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
}

$where = [];
$param = "";

//제공 컨텐츠명 조회
if($search_value){
	$where[] = " supply_content like '%".$search_value."%'";
}

if($search_supply_content_type){
	$where[] = " supply_content_type='".$search_supply_content_type."'";
}

if($search_is_encode){
	$where[] = " is_encode='".$search_is_encode."'";
}

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$add_where = "";


	foreach($where as $value){
		$add_where.= " and ".$value;
	}

	foreach($_GET as $key=>$value){
		if($key<>"page" && $key<>"title_id"){
			if($value<>""){
				$param.="&".$key."=".$value;
			}
		}
	}

	$orderby = "title_id desc";

	$admin= new Admin($conn); 
	$adminGoods= new AdminGoods($conn); 
	$supply_content_list = $adminGoods->getSupplyContentList($page,$add_where,$orderby,$param,'30');

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

$checked['search_supply_content_type'][$search_supply_content_type]="checked";
$checked['search_is_encode'][$search_is_encode]="checked";

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
									<li class="breadcrumb-item"><a href="javascript: void(0);">제공컨텐츠 관리</a></li>
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
						<h5 class="card-header bg-secondary text-white">제공컨텐츠 조회</h5>
						<div class="card-body py-2">
							<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
								<div class="row mb-2">
									<div class="col-lg-5">
										<div class="row">
											<label for="search_value" class="col-sm-3 col-form-label bg-light border">제공 컨텐츠명</label>
											<div class="col-sm-9">
												<input type="text" class="form-control" id="search_value" name="search_value" placeholder="제공 컨텐츠명" value="<?=$search_value?>">
											</div>
										</div>
									</div>
									<div class="col-lg-3">
										<div class="row">
											<label for="search_supply_content_type" class="col-sm-4 col-form-label col-form-label-sm bg-light border">제공 컨텐츠 유형</label>
											<div class="col-sm-8 pt-1">
												<div class="form-check form-check-inline">
													<input type="radio" id="search_supply_content_type_p" name="search_supply_content_type" class="form-check-input" value="P" <?=$checked['search_supply_content_type']['P']?>>
													<label class="form-check-label" for="search_supply_content_type_p">한글패치</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_supply_content_type_c" name="search_supply_content_type" class="form-check-input" value="C" <?=$checked['search_supply_content_type']['C']?>>
													<label class="form-check-label" for="search_supply_content_type_c">컨텐츠</label>
												</div>
											</div>
										</div>
									</div>
									<div class="col-lg-3">
										<div class="row">
											<label for="search_is_encode" class="col-sm-4 col-form-label col-form-label-sm bg-light border">암호화 여부</label>
											<div class="col-sm-8 pt-1">
												<div class="form-check form-check-inline">
													<input type="radio" id="search_is_encode_y" name="search_is_encode" class="form-check-input" value="Y" <?=$checked['search_is_encode']['Y']?>>
													<label class="form-check-label" for="search_is_encode_y">암호화 있음</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_is_encode_n" name="search_is_encode" class="form-check-input" value="N" <?=$checked['search_is_encode']['N']?>>
													<label class="form-check-label" for="search_is_encode_n">암호화 없음</label>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div class="row mb-2">
									<div class="col-lg-6">
										<div class="float-end">
											<button type="submit" class="btn btn-primary shadow-none">제공컨텐츠 조회</button>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>

				<div class="row mb-2">
					<div class="col-12">
						<div class="float-start"><? echo number_format($supply_content_list->total_results)?> 개</div>
					</div>
				</div>
				
					<div class="row">
					<div class="col-12">
						<div class="card">
							<h5 class="card-header bg-secondary text-white">제공 컨텐츠 현황</h5>
							<div class="card-body p-0">
								<div class="table-responsive">
									<table class="table table-centered w-100 nowrap table-sm table-bordered" id="">
										<colgroup>
											<col width="3%"/>
											<col width="5%"/>
											<col width="18%"/>
											<col width="*"/>
											<col width="6%"/>
											<col width="34%"/>
										</colgroup>
										<thead class="table-light font-13">
											<tr>
												<th class="text-center">번호</th>
												<th class="text-center">유형</th>
												<th class="text-center">제공 컨텐츠명</th>
												<th class="text-center">제공 컨텐츠 URL</th>
												<th class="text-center">암호화 정보</th>
												<th class="text-center">제공 상품정보</th>
											</tr>
										</thead>
										<tbody class="font-12">
										<?
										if($supply_content_list->success == true){
											$result = $supply_content_list->resultset->fetchAll();

											$num=1;

											foreach($result as $value){
												$supply_content_goods = $adminGoods->getSupplyContentGoodsList($value['idx']);
										?>
											<tr>
												<td class="text-center"><?=$num+($page-1)*30?></td>
												<td class="text-center"><?=($value['supply_content_type']=="P")?"한글패치":"컨텐츠"?></td>
												<td class="text-start"><?=$value['supply_content']?></td>
												<td class="text-start px-1"><?=$value['supply_content_url']?></td>
												<td class="text-center"><?=($value['is_encode']=="Y")?"암호화 있음":"암호화 없음"?><?if($value['is_encode']=="Y"){?><br/>(<?=$value['encode_type']?>)<?}?></td>
												<td class="px-1">
												<?
													foreach($supply_content_goods as $sub_value){
														if($sub_value['is_free']=="Y"){
															echo $sub_value['goods_code']." / ".$sub_value['goods_nm']." / ".$sub_value['asset_id'];
															echo " / <span class='label label-info'>무료제공</span><br/>";
														}else{
															echo $sub_value['goods_code']." / ".$sub_value['goods_nm']." / ".$sub_value['asset_id']."<br/>";
															
														}
														
													}
												?>
												</td>
											</tr>
									<?		$num++;
											}
										}
										?>
										</tbody>
									</table>
								</div>

								<div class="text-center mt-3"><?echo $bonus_list->links_html;?></div>
							</div> <!-- end card-body-->
						</div> <!-- end card-->
					</div> <!-- end col -->
				</div>

				<div class="text-center mt-3"><?echo $supply_content_list->links_html;?></div>
				
			</div> <!-- container -->

		</div> <!-- content -->


	</div>

</div>
<!-- END wrapper -->

<script>
$(document).ready(function(){

});
</script>
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>
</body>
</html>
