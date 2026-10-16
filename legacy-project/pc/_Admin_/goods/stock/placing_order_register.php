<?
//사용x
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_ALL & ~E_DEPRECATED & ~E_STRICT & ~E_NOTICE);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['stock'] = "active";
$sidebar_file = "sidebar_stock.php";

$page_title = "발주서 등록";

$asset_name = filter_input(INPUT_GET, 'asset_name', FILTER_SANITIZE_STRING);
$publisherCd = filter_input(INPUT_GET, 'publisherCd', FILTER_SANITIZE_STRING);
$productTypeCd = filter_input(INPUT_GET, 'productTypeCd', FILTER_SANITIZE_STRING);
$platformCd = filter_input(INPUT_GET, 'platformCd', FILTER_SANITIZE_STRING);
$assetTypeCd = filter_input(INPUT_GET, 'assetTypeCd', FILTER_SANITIZE_STRING);
$stock = filter_input(INPUT_GET, 'stock', FILTER_SANITIZE_STRING);

$selected['productTypeCd'][$productTypeCd] ="selected";
$selected['assetTypeCd'][$assetTypeCd] ="selected";
$selected['platformCd'][$platformCd] ="selected";
$selected['publisherCd'][$publisherCd] ="selected";

$where = [];

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$admin= new Admin($conn);

	$asset_publisher =$admin->getAssetCodeList('PUBL');
	$asset_platform =$admin->getAssetCodeList('PLFM');
	$product_type =$admin->getAssetCodeList('PDTP');
	$asset_type =$admin->getAssetCodeList('ASTP');

	if(isset($asset_id) && $asset_id<>""){
		$where[] = " asset_id ='".$asset_id."'";
	}

	if(isset($asset_name) && $asset_name<>""){
		$where[] = " asset_name like '%".$asset_name."%'";
	}

	if(isset($stock) && $stock<>""){
		$where[] = " stock <='".$stock."'";
	}

	if(isset($publisherCd) && $publisherCd<>""){
		$where[] = " publisher ='".$admin->getAssetCodeInfo($publisherCd)."'";
	}

	if(isset($platformCd) && $platformCd<>""){
		$where[] = " platform ='".$admin->getAssetCodeInfo($platformCd)."'";
	}

	$add_where = "";

	foreach($where as $value){
		$add_where.= " and ".$value;
	}

	if($publisherCd){
		$asset_placing_order = $admin->getAssetPublisherPlacingOrder($add_where);
	}

	//발주가능상품조회

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
			<div class="container-fluid">
				<!-- start page title -->
				<div class="row">
					<div class="col-12">
						<div class="page-title-box">
							<div class="page-title-right">
								<ol class="breadcrumb m-0">
									<li class="breadcrumb-item"><a href="javascript: void(0);">홈</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">재고</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">구매관리</a></li>
									<li class="breadcrumb-item active"><?=$page_title?></li>
								</ol>
							</div>
							<h4 class="page-title"><?=$page_title?></h4>
						</div>
					</div>
				</div>
				<!-- end page title -->

				<div class="row g-2">
					<div class="col-12">
						<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
							<div class="card">
								<h5 class="card-header bg-secondary text-white">발주 정보</h5>
								<div class="card-body">
									<div class="row mb-2">
										<div class="col-lg-4">
											<div class="row">
												<label for="publisherCd" class="col-sm-4 col-form-label bg-light border">Asset 공급처</label>
												<div class="col-sm-8">
													<select class="form-select" name="publisherCd" id="publisherCd">
													<option value="">::: Asset 공급처 선택 :::</option>
													<?
														foreach($asset_publisher as $value){
													?>
													<option value="<?=$value['code_id']?>" <?=$selected['publisherCd'][$value['code_id']]?>><?=$value['name']?></option>
													<?
														}
													?>
												</select>
												</div>
											</div>
										</div>
										<div class="col-lg-4">
											<div class="row">
												<label for="reg_date" class="col-sm-4 col-form-label bg-light border">발주일자</label>
												<div class="col-sm-8 position-relative" id="reg_date">
													<input type="text" class="form-control" name="reg_date" id="reg_date" value="<?=date('Y-m-d')?>" data-provide="datepicker" data-date-container="#reg_date" data-date-format="yyyy-mm-dd">
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>

							<div class="card">
								<h5 class="card-header bg-secondary text-white">발주대상 조건검색</h5>
								<div class="card-body">
									<div class="row mb-2">
										<div class="col-lg-6">
											<div class="row">
												<label for="asset_name" class="col-sm-2 col-form-label bg-light border">Asset 이름</label>
												<div class="col-sm-10">
													<input type="text" class="form-control" id="asset_name" name="asset_name" placeholder="검색할 Asset 이름" value="<?=$asset_name?>">
												</div>
											</div>
										</div>
										<div class="col-lg-3">
											<div class="row">
												<label for="platformCd" class="col-sm-4 col-form-label bg-light border">Asset 플랫폼</label>
												<div class="col-sm-8">
													<select id="platformCd" name="platformCd" class="form-select">
														<option value="">::: Asset 플랫폼 선택 :::</option>
														<?
															foreach($asset_platform as $value){
														?>
														<option value="<?=$value['code_id']?>" <?=$selected['platformCd'][$value['code_id']]?>><?=$value['name']?></option>
														<?
															}
														?>
													</select>
												</div>
											</div>
										</div>
										<div class="col-lg-3">
											<div class="row">
												<label for="stock" class="col-sm-4 col-form-label bg-light border">안전재고이하</label>
												<div class="col-sm-8">
													<input type="text" class="form-control" id="stock" name="stock" data-toggle="touchspin" value="50" type="text" data-step="10" data-decimals="0">
												</div>
											</div>
										</div>
									</div>

									<div class="row">
										<div class="col-lg-12">
											<div class="text-center">
												<button type="submit" class="btn btn-primary btn-lg shadow-none">발주대상 조회</button>
											</div>
										</div>
									</div>

								</div>
							</div>
						</form>
					</div>
				</div>


				<div class="row g-2">
					<div class="col-12">
						<div class="card">
							<h5 class="card-header bg-secondary text-white">발주 상품 목록</h5>
							<div class="card-body">
								<table class="table table-sm table-centered table-bordered mb-0" id="asset_list" cellspacing="0" cellpadding="0">
								<thead class="table-dark">
									<tr>
										<th class="text-center">번호</th>
										<th class="text-center">DGKR <br/>Asset ID</th>
										<th class="text-center">Asset 이름</th>
										<th class="text-center">Asset 유형</th>
										<th class="text-center">Asset 형식</th>
										<th class="text-center">Asset 플랫폼</th>
										<th class="text-center">재고</th>
										<th class="text-center">업데이트 일자</th>
										<th class="text-center" style="width:100px">발주수량</th>
										<th class="text-center">삭제</th>
									</tr>
								</thead>
								<tbody>
								<?
								if($publisherCd){
									$num=1;
									foreach($asset_placing_order as $value){
										//최근 진행된 프로모션 이력
										$last_promotion_data = $admin->getLastPromotionGoodsSales($value['asset_id']);
										if($last_promotion_data['promotion_idx']){
											$last_promotion_info = $admin->getPromotionInfo($last_promotion_data['promotion_idx']);
											$last_promotion_name = $last_promotion_info['promotion_nm'];
											$last_promotion_start = $last_promotion_info['promotion_start'];
											$last_promotion_end = $last_promotion_info['promotion_end'];

											$date1 = strtotime($last_promotion_info['promotion_start']);
											$date2 = strtotime($last_promotion_info['promotion_end']);

											$diff =  $date2 - $date1;

											$event_term = $diff/(60*60)/24;
										}else{
											$last_promotion_name = "<span class='text-danger'>집계된 정보가 없음</span>";
											$last_promotion_start = "";
											$last_promotion_end = "";
										}
								?>
								<tr>
									<td class="text-center"><?=$num?></td>
									<td class="text-center"><?=$value['asset_id']?></td>
									<td><?=$value['asset_name']?></td>
									<td class="text-center"><?=$value['productType']?></td>
									<td class="text-center"><?=$value['assetType']?></td>
									<td class="text-center"><?=$value['platform']?></td>
									<td class="text-end"><?=number_format($value['stock'])?></td>
									<td class="text-center"><?=$value['batch_date']?></td>
									<td class="text-center">
										<input type="text" name="qty[]" class="form-control">
									</td>
									<td class="text-center"><button type="button" class="btn btn-danger btn-sm shadow-none btn_delete">삭제</button></td>
								</tr>
								<tr class="">
									<td colspan="12" class="p-0">
										<div class="">
											<dl class="d-flex flex-row justify-content-start align-items-center align-self-center mb-0">
												<dt class="p-2 bg-light">최근 진행된 프로모션</dt>
												<dd class="p-2 flex-fill mb-0"><?=$last_promotion_name?></dd>
												<dt class="p-2 bg-light">진행기간</dt>
												<dd class="p-2 mb-0"><?=$last_promotion_start?> ~ <?=$last_promotion_end?> ( <strong><?=round($event_term,2)?></strong> 일간)</dd>
												<dt class="p-2 bg-light">판매수량</dt>
												<dd class="p-2 mb-0"><?=round($last_promotion_data['cc'],2)?> 개</dd>
												<dt class="p-2 bg-light">일일평균</dt>
												<dd class="p-2 mb-0">
													<?if($event_term>0){?>
													<?=round($last_promotion_data['cc']/$event_term,2)?> 개
													<?}?>
												</dd>
												<dt class="p-2 bg-light">발주수량</dt>
												<dd class="p-0 mb-0 px-1">
													<div class="row g-0">
														<div class="col-sm-6">
														<input type="text" name="p_date[]" class="form-control" style="width:80px;">
														</div>
													</div>
												</dd>
												<dt class="p-2 bg-light">판매예상</dt>
												<dd class="p-2 mb-0">
												<?if($event_term>0){?>
												<?=round($last_promotion_data['cc']/$event_term,2)*7?>개
											 <?}?>

												</dd>
											</dl>
										</div>
									</td>
								</tr>
								<?	$num++;
									}
								}
								?>
								</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>

				<div class="row mb-3">
					<div class="col-lg-12">
						<div class="text-center">
							<button type="button" class="btn btn-primary btn-lg shadow-none">선택상품 발주</button>
						</div>
					</div>
				</div>

			</div>
			<!-- /container-fluid -->
		</div>
		<!-- /content -->
	</div>
	<!-- /content-page -->
</div>
<!-- /wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>
$(document).ready(function () {
	$(".btn_delete").bind("click",function(){
		$(this).parent().parent().remove();
	});
});
</script>
</body>
</html>
