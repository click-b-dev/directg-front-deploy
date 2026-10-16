<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page_title="프랜차이즈 관리";

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$admin= new Admin($conn); 

	$franchise_list = $admin->getFranchiseList();

	//프랜차이즈별 상품수 현황
//	$goods_franchise_count = $admin->getGoodsFranchiseCount();

	$franchise_data = array();

	foreach($franchise_list as $value){
		$franchise_data[$value['idx']]['franchise_name']= $value['franchise_name'];
	}

	/*
	foreach($goods_franchise_count as $value){
		switch($value['game_type']){
			case "game": //기본게임(대표상품)
				$title_count[$value['franchise_idx']]['game'] += $value['cc'];
			break;
			case "2": //기본게임+DLC번들
				//$title_count[$value['franchise_idx']]['package'] += $value['cc'];
			break;
			case "dlc": //DLC
				$title_count[$value['franchise_idx']]['dlc'] += $value['cc'];
			break;
			case "4": //DLC번들
				//$title_count[$value['franchise_idx']]['dlc'] += $value['cc'];
			break;
			case "8": //멀티팩
				//$title_count[$value['franchise_idx']]['package'] += $value['cc'];
			break;
		}
		$franchise_data[$value['franchise_idx']]['title_count']= $title_count[$value['franchise_idx']];
	}
	*/

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php'); ?>
<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
<!-- Begin page -->
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">상품</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">코드 관리</a></li>
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
								<div class="row mb-2">
									<div class="col-lg-3">
										<div class="row">
											<label for="search_publisher_code" class="col-sm-3 col-form-label bg-light border">퍼블리셔</label>
											<div class="col-sm-9">

											</div>
										</div>
									</div>
								</div>
								<div class="row">
									<div class="col-lg-12">
										<div class="float-end">
											<button type="submit" class="btn btn-primary">검색</button>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>

				<div class="row">
					<div class="col-12">
						<table class="table table-centered nowrap table-sm table-bordered" id="">
						<thead class="table-light">
							<tr>
								<th class="text-center">번호</th>
								<th class="text-center">고유코드</th>
								<th class="text-center">프랜차이즈명</th>
								<th class="text-center">대표상품수</th>
								<th class="text-center">옵션상품수<br/>(기본게임포함)</th>
								<th class="text-center">옵션상품수<br/>(DLC)</th>
								<th class="text-center">비고</th>
							</tr>
						</thead>
						<tbody>
						<?
							$num=1;
							foreach($franchise_data as $key=>$value){
						?>
						<tr>
							<td class="text-center"><?=$num?></td>
							<td class="text-center"><?=$key?></td>
							<td><?=$value['franchise_name']?></td>
							<td class="text-end"><?=$value['title_count']['game']?></td>
							<td class="text-end"><?=$value['title_count']['package']?></td>
							<td class="text-end"><?=$value['title_count']['dlc']?></td>
							<td></td>
						</tr>
						<?
								$num++;
							}
						?>
						</tbody>
						</table>
					</div>
				</div>
				<!-- end row -->
			</div><!-- /container-fluid -->
		</div><!-- /content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

</body>
</html>
