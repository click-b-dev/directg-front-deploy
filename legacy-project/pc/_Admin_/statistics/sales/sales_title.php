<?
$sidebar_file = "sidebar_statistics.php";
//*https://apexcharts.com/javascript-chart-demos/heatmap-charts/basic/*/
?>
<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
	$topmenu['statistics'] = "active";
	$page_title="타이틀별 매출현황";


	$search_publisher = filter_input(INPUT_GET, 'search_publisher', FILTER_SANITIZE_STRING);
	$search_year = filter_input(INPUT_GET, 'search_year', FILTER_SANITIZE_STRING);
	
	if(!$search_year){
		$search_year = date('Y');
		$publisher_year=$search_year;
	}

	if($search_publisher){
		//$search_year="";
		$publisher_year="2023";
		$search_year="2023";
	}

	$start_date = $search_year."-01-01";
	$end_date = $search_year."-12-31";


try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$admin= new Admin($conn); 

	$publisher_data= $admin->getPublisherAllList($publisher_year);

	//타이틀 목록
	if($search_publisher){
		$title_query = "select title_id,title_name,publisher_code,publisher,is_view,release_date from tbl_goods where publisher_code=:publisher_code";
		//$stmt = $conn->prepare($title_query);
		$params = array(
			":publisher_code"=>$search_publisher,
		);
		//$stmt->execute($params);
		//$title_data = $stmt->fetchAll();
	}else{
		$title_query = "select title_id,title_name,publisher_code,publisher,is_view,release_date from tbl_goods where date_format(release_date,'%Y')<=:search_year";
		//$stmt = $conn->prepare($title_query);
		$params = array(
			":search_year"=>$search_year
		);
		//$stmt->execute($params);
		//$title_data = $stmt->fetchAll();
	}
	

	$title_array = array();

	/*
	foreach($title_data as $value){
		$title_array[$value['title_id']]['title_id']=$value['title_id'];
		$title_array[$value['title_id']]['title_name']=$value['title_name'];
		$title_array[$value['title_id']]['release_date']=$value['release_date'];
		$title_array[$value['title_id']]['is_view']=$value['is_view'];
		$title_array[$value['title_id']]['publisher']=$value['publisher'];
		$title_array[$value['title_id']]['total_count']=0;
		$title_array[$value['title_id']]['total_price']=0;
	}
	*/

	//타이틀별 매출현황
	if($search_publisher){
		$query = "select b.product_code,b.product_name,b.publisher_code,b.product_type,sum(a.sales_count)as total_count,sum(a.sales_count*a.unit_price)as total_price from tbl_sales a inner JOIN tbl_goods_item b on a.product_code=b.product_code where b.publisher_code=:publisher_code and b.game_type<>'randombox' group by b.product_code order by b.product_code asc";
		$params = array(
			":publisher_code"=>$search_publisher
		);
		$stmt = $conn->prepare($query);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
	}else{
		$query = "select b.product_code,b.product_name,b.publisher_code,b.game_type,b.bundle_type,sum(a.sales_count)as total_count,sum(a.sales_count*a.unit_price)as total_price from tbl_sales a inner JOIN tbl_goods_item b on a.product_code=b.product_code where date_format(a.ord_ymd,'%Y')=:order_year and b.game_type<>'randombox' group by a.product_code order by a.product_code asc";
		$params = array(
			":order_year"=>$search_year
		);
		$stmt = $conn->prepare($query);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
	}
	
	
	foreach($data as $key=>$value){
		//$title_id = $admin->getGameTitleID($value['product_code']);
		//if($title_id){
			
			switch($value['game_type']){
				case "game": //기본게임
					$title_info = $admin->getTitleGame($value['product_code']);
					$title_id=$title_info['title_id'];
					$title_array[$title_id]['game_count']+=$value['total_count'];
					$title_array[$title_id]['game_price']+=$value['total_price'];
				break;
				case "dlc":
					$title_info = $admin->getTitleDLC($value['product_code']);
					$title_id=$title_info['title_id'];
					$title_array[$title_id]['dlc_count']+=$value['total_count'];
					$title_array[$title_id]['dlc_price']+=$value['total_price'];
				break;
				case "music"://DLC
					$title_info = $admin->getTitleDLC($value['product_code']);
					$title_id=$title_info['title_id'];
					$title_array[$title_id]['dlc_count']+=$value['total_count'];
					$title_array[$title_id]['dlc_price']+=$value['total_price'];
				break;
				case "bundle":
					switch($value['bundle_type']){
						case "1"://기본게임+DLC번들
							$title_info = $admin->getTitleEdition($value['product_code']);
							$title_id=$title_info['title_id'];
							$title_array[$title_id]['game_count']+=$value['total_count'];
							$title_array[$title_id]['game_price']+=$value['total_price'];
						break;
						case "3"://멀티팩
							$title_array[$title_id]['game_count']+=$value['total_count'];
							$title_array[$title_id]['game_price']+=$value['total_price'];
						break;
						case "4"://DLC번들
							$title_info = $admin->getTitleDLC($value['product_code']);
							$title_id=$title_info['title_id'];
							$title_array[$title_id]['dlc_count']+=$value['total_count'];
							$title_array[$title_id]['dlc_price']+=$value['total_price'];
						break;
					}
					
				break;
				case "randombox"://기본게임 멀티팩.
					//$title_array[$title_id]['game_count']+=$value['total_count'];
					//$title_array[$title_id]['game_price']+=$value['total_price'];
				break;
			}

			$title_array[$title_id]['title_name']=$title_info['title_name'];
			$title_array[$title_id]['publisher']=$title_info['publisher'];
			$title_array[$title_id]['release_date']=$title_info['release_date'];
			$title_array[$title_id]['total_count']+=$value['total_count'];
			$title_array[$title_id]['total_price']+=$value['total_price'];

			$title_array[$title_id]['product_data'][]=array(
				"product_code"=>$value['product_code'],
				"product_name"=>$value['product_name'],
				"product_type"=>$value['product_type'],
				"supplier_code"=>$value['supplier_code'],
				"sales_count"=>$value['total_count'],
				"sales_price"=>$value['total_price'],
			);
		//}
	}

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

//$sales_list = array();

foreach($title_array as $key=>$value){
	$sales_list[]= array(
		'title_id'=> $key,
		'title_name'=> $value['title_name'],
		'release_date'=> $value['release_date'],
		'publisher'=> $value['publisher'],
		'game_count'=> $value['game_count'],
		'game_price'=> $value['game_price'],
		'dlc_count'=> $value['dlc_count'],
		'dlc_price'=> $value['dlc_price'],
		'total_count'=> $value['total_count'],
		'total_price'=> $value['total_price'],
		'product_data'=> $value['product_data'],
	);
	
}


//array_multisort($total_price, SORT_DESC,$title_id,SORT_ASC,$title_array);
$result1 = arr_sort($sales_list,'total_price','desc');

//print_r($result1);
//exit;
	
	//exit;

	$selected['search_publisher'][$search_publisher] = "selected";
	$selected['search_year'][$search_year] = "selected";

	//print_r($cursor);
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
										<li class="breadcrumb-item"><a href="javascript: void(0);">통계</a></li>
										<li class="breadcrumb-item"><a href="javascript: void(0);">매출분석</a></li>
										<li class="breadcrumb-item active"><?=$page_title?></li>
									</ol>
								</div>
								<h4 class="page-title"><?=$page_title?></h4>
							</div>
						</div>
					</div>     
					<!-- end page title --> 

					<div class="row">
						<div class="col-12">
							<div class="card">
								<div class="card-body">
									<form class="row row-cols-lg-auto g-3 align-items-center mb-3" action="<?=$_SERVER["PHP_SELF"]?>" method="get">
										<div class="col-lg-2">
											<div class="row">
												<label for="search_year" class="col-sm-3 col-form-label bg-light border">연도</label>
												<div class="col-sm-9">
													<select class="form-select" id="search_year" name="search_year">
														<option value="">:::년도:::</option>
														<?
															for($i=2013;$i<=date('Y');$i++){
														?>
														<option value="<?=$i?>" <?=$selected['search_year'][$i]?>><?=$i?>년</option>
														<?
															}
														?>
													</select>
												</div>
											</div>
										</div>
										<div class="col-lg-3">
											<div class="row">
												<label for="search_publisher" class="col-sm-3 col-form-label bg-light border">공급처</label>
												<div class="col-sm-9">
													<select id="search_publisher" name="search_publisher" class="form-select">
														<option value="">:::선택:::</option>
														<?
															foreach($publisher_data as $value){
														?>
														<option value="<?=$value['publisher_code']?>" <?=$selected['search_publisher'][$value['publisher_code']]?>><?=$value['publisher_name']?></option>
														<?
															}
														?>
													</select>
												</div>
											</div>
										</div>
										<div class="col-7">
											<div class="col-auto">
												<button class="input-group-text btn-primary shadow-none" type="submit">검색</button>
											</div>
										</div>
									</form>

									<div class="table-responsive">
										<table class="table table-bordered table-centered w-100  nowrap table-sm">
											<thead class="table-dark font-14">
											<tr>
												<th class="text-center" style="width:60px">순위</th>
												<th class="text-center" style="width:220px">공급처명</th>
												<th class="text-center">대표상품코드</th>
												<th class="text-center">타이틀명</th>
												<th class="text-center" style="width:100px">출시일</th>
												<th class="text-center" style="width:100px">Game<br/>주문수량</th>
												<th class="text-center" style="width:130px">Game<br/>주문금액</th>
												<th class="text-center" style="width:100px">DLC<br/>주문수량</th>
												<th class="text-center" style="width:130px">DLC<br/>주문금액</th>
												<th class="text-center" style="width:100px">합계<br/>주문수량</th>
												<th class="text-center" style="width:130px">합계<br/>주문금액</th>
											</tr>
											</thead>
											<tbody class="font-14">
											<?
												$ranking = 1;
												foreach($result1 as $key=>$value){
													if($value['total_price']>0){
											?>
											<tr>
												<td class="text-center"><?=$ranking++?></td>
												<td class=""><span class="eng font-13"><?=$value['publisher']?></span></td>
												<td class="text-center">
													<span><?=$value['title_id']?></span>
													<?
														if($value['title_id']==""){
														print_r($value['product_data']);
														}
													?>
												</td>
												<td class="text-start"><span><?=$value['title_name']?></span></td>
												<td class="text-center"><span><?=$value['release_date']?></span></td>
												<td class="text-end"><span class="num"><?=number_format($value['game_count'])?></span></td>
												<td class="text-end"><span class="num"><?=number_format($value['game_price'])?></span>원</td>
												<td class="text-end"><span class="num"><?=number_format($value['dlc_count'])?></span></td>
												<td class="text-end"><span class="num"><?=number_format($value['dlc_price'])?></span>원</td>
												<td class="text-end"><span class="num"><?=number_format($value['total_count'])?></span></td>
												<td class="text-end"><span class="num"><?=number_format($value['total_price'])?></span>원</td>
											</tr>
											<?	
													$game_total_count+=$value['game_count'];
													$game_total_price+=$value['game_price'];
													$dlc_total_count+=$value['dlc_count'];
													$dlc_total_price+=$value['dlc_price'];
													$total_count+=$value['total_count'];
													$total_price+=$value['total_price'];
													}
												}
											?>
											</tbody>
											<tfoot class="table-dark">
											<tr>
												<th class="text-center" colspan="5">합계</th>
												<td class="text-end"><?=number_format($game_total_count)?></td>
												<td class="text-end"><?=number_format($game_total_price)?></td>
												<td class="text-end"><?=number_format($dlc_total_count)?></td>
												<td class="text-end"><?=number_format($dlc_total_price)?></td>
												<td class="text-end"><?=number_format($total_count)?></td>
												<td class="text-end"><?=number_format($total_price)?></td>
											</tr>
											</tfoot>
										</table>
									</div>
								</div>
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
