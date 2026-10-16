<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['event'] = "active";
$sidebar_file = "sidebar_event.php";

$page_title="포인트 지급 이벤트";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_flag = filter_input(INPUT_GET, 'search_flag', FILTER_SANITIZE_STRING);
$search_status = filter_input(INPUT_GET, 'search_status', FILTER_SANITIZE_STRING);
$search_key = filter_input(INPUT_GET, 'search_key', FILTER_SANITIZE_STRING);
$search_value = filter_input(INPUT_GET, 'search_value', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
}

$where = [];

if($search_flag){
	$where[] = "repay_flag='".$search_flag."'";
}

if($search_value){
	switch($search_key){
		case "search_name":
			$where[] = " (b.product_name like '%".$search_value."%' or b.product_name_en like '%".$search_value."%')";
		break;
		case "search_product_code":
			$where[] = " b.product_code ='".$search_value."'";
		break;
	}
}

switch($search_status){
	case "end":
		$where[] = " start_dt<'".date('Y-m-d H:i:s')."' and end_dt<'".date('Y-m-d H:i:s')."'";
	break;
	case "ing":
		$where[] = " start_dt<'".date('Y-m-d H:i:s')."' and end_dt>'".date('Y-m-d H:i:s')."'";
	break;
	case "upcoming":
		$where[] = " start_dt>'".date('Y-m-d H:i:s')."' and end_dt>'".date('Y-m-d H:i:s')."'";
	break;
}

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

	$adminEvent= new AdminEvent($conn); 

	$add_where = "";

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

	$orderby = "a.start_dt desc,a.end_dt desc";

	$event_point_list = $adminEvent->getEventPointList($page,$add_where,$orderby,$param);

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

$checked['search_flag'][$search_flag]="checked";
$checked['search_status'][$search_status]="checked";
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
										<li class="breadcrumb-item"><a href="javascript: void(0);">이벤트</a></li>
										<li class="breadcrumb-item"><a href="javascript: void(0);">추가 포인트 지급 관리</a></li>
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
							<h5 class="card-header bg-secondary text-white">검색필터</h5>
							<div class="card-body">
								<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
									<div class="row">
										<div class="col-lg-5 mb-2">
											<div class="input-group row">
												<select class="form-select col-sm-3" name="search_key" id="search_key">
													<option value="search_name" <?=$selected['search_key']['search_name']?>>옵션상품명</option>
													<option value="search_product_code" <?=$selected['search_key']['search_product_code']?>>옵션상품명코드</option>
												</select>
												<div class="col-sm-9">
													<input type="text" class="form-control" id="search_value" name="search_value" placeholder="검색어" value="<?=$search_value?>">
												</div>
											</div>
										</div>
										<div class="col-lg-3">
											<div class="row">
												<label for="search_flag" class="col-sm-5 col-form-label-sm bg-light border font-14 px-1">추가 포인트 지급여부</label>
												<div class="col-sm-7">
													<div class="form-check form-check-inline mt-1">
														<input type="radio" id="search_flag_y" name="search_flag" class="form-check-input" value="Y" <?=$checked['search_flag']['Y']?>>
														<label class="form-check-label font-14" for="search_flag_y">예</label>
													</div>
													<div class="form-check form-check-inline mt-1">
														<input type="radio" id="search_flag_n" name="search_flag" class="form-check-input" value="N" <?=$checked['search_flag']['N']?>>
														<label class="form-check-label font-14" for="search_flag_n">아니오</label>
													</div>
												</div>
											</div>
										</div>
											<div class="col-lg-4">
											<div class="row">
												<label for="search_status" class="col-sm-3 col-form-label-sm bg-light border font-14 px-1">진행상태</label>
												<div class="col-sm-9">
													<div class="form-check form-check-inline mt-1">
														<input type="radio" id="search_status_1" name="search_status" class="form-check-input" value="upcoming" <?=$checked['search_status']['upcoming']?>>
														<label class="form-check-label font-14" for="search_status_1">진행예정</label>
													</div>
													<div class="form-check form-check-inline mt-1">
														<input type="radio" id="search_status_2" name="search_status" class="form-check-input" value="ing" <?=$checked['search_status']['ing']?>>
														<label class="form-check-label font-14" for="search_status_2">진행중</label>
													</div>
													<div class="form-check form-check-inline mt-1">
														<input type="radio" id="search_status_3" name="search_status" class="form-check-input" value="end" <?=$checked['search_status']['end']?>>
														<label class="form-check-label font-14" for="search_status_3">종료</label>
													</div>
												</div>
											</div>
										</div>
									</div>

									<div class="row">
										<div class="col-lg-12">
											<div class="float-end">
												<button type="submit" class="btn btn-primary shadow-none">검색</button>
											</div>
										</div>
									</div>
								</form>
							</div>
						</div>
					</div>

					<div class="row">
						<div class="col-12">
							<div class="d-flex flex-row justify-content-between mb-2">
								<div class="float-start"><? echo number_format($event_point_list->total_results)?> 개</div>
							</div>

							<div class="table-responsive">
								<table class="table table-centered w-100 nowrap table-sm bg-white table-bordered" id="">
									<colgroup>
										<col width="3%"/>
										<col width="*"/>
										<col width="10%"/>
										<col width="20%"/>
										<col width="10%"/>
										<col width="10%"/>
									</colgroup>
									<thead class="table-light font-13">
										<tr>
											<th class="text-center">번호</th>
											<th class="text-center">옵션상품정보</th>
											<th class="text-center">추가 포인트 지급여부</th>
											<th class="text-center">추가 포인트 지급기간</th>
											<th class="text-center">추가 포인트 정보</th>
											<th class="text-center">진행상태</th>
										</tr>
									</thead>
									<tbody class="font-12 bg-white">
									<?
									if($event_point_list->success == true){
										$result = $event_point_list->resultset->fetchAll();

										foreach($result as $value){
									?>
									<tr>
										<td class="text-center px-1"><?=$value['idx']?></td>
										<td class="text-start px-1">[<?=$value['product_code']?>] <?=$value['product_name']?></td>
										<td class="text-center px-1"><?=$value['repay_flag']?></td>
										<td class="text-center px-1"><?=$value['start_dt']?> ~ <?=$value['end_dt']?></td>
										<td class="text-center px-1">
											<?
											if($value['repay_type']=="%"){
											?>
												주문금액의 <?=$value['repay_point']?> <?=$value['repay_type']?>
											<?
												}else{
											?>
												<?=number_format($value['repay_point'])?> <?=$value['repay_type']?>
											<?
												}
											?>
										</td>
										<td class="text-center px-1">
											<?
												if($value['end_dt']>=date('Y-m-d H:i:s') and $value['start_dt']<=date('Y-m-d H:i:s')){
													echo  "진행중";
												}elseif($value['end_dt']<date('Y-m-d H:i:s')){
													echo "종료";
												}else{
													echo "진행예정";
												}
											?>
										</td>
									</tr>
										<?	
												}
											}
										?>
									</tbody>
								</table>
							</div>

							<div class="text-center mt-3"><?echo $event_point_list->links_html;?></div>

						</div>
						<!-- end col -->
					</div>
			</div><!-- /container-fluid -->
		</div><!-- /content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

</body>
</html>
