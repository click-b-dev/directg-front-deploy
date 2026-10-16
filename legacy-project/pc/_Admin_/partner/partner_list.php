<?
$sidebar_file = "sidebar_partner.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
$topmenu['partner'] = "active";

$page_title="파트너 계정 관리";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_publisher_name = filter_input(INPUT_GET, 'search_publisher_name', FILTER_SANITIZE_STRING);
$report_term = filter_input(INPUT_GET, 'report_term', FILTER_SANITIZE_STRING);
$is_system = filter_input(INPUT_GET, 'is_system', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
}

$where = [];

if($search_publisher_name){
	$where[] = " publisher_name like '%".$search_publisher_name."%'";
}

if($report_term){
	$where[] = "report_term='".$report_term."'";
}

if($is_system){
	$where[] = "is_system='".$is_system."'";
}

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

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	
	$adminPartner= new AdminPartner($conn);
	
	$orderby = " a.idx desc";
	$partner_member_list = $adminPartner->getPartnerMemberList($page,$add_where,$orderby,$param,'50');
	
	$publisher_data= $adminPartner->getSupplierList();

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
									<li class="breadcrumb-item"><a href="javascript: void(0);">파트너</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">파트너 관리</a></li>
									<li class="breadcrumb-item active"><?=$page_title?></li>
								</ol>
							</div>
							<h4 class="page-title"><?=$page_title?></h4>
						</div>
					</div>
				</div>     
				<!-- end page title --> 
				
				<div class="d-flex flex-row justify-content-between mb-2">
					<div class="float-start"><? echo number_format($partner_member_list->total_results)?> 개</div>
					<div class="float-end"><a href="partner_member_register.php" class="btn btn-danger shadow-none" >파트너 계정 등록</a></div>
				</div>
				
				<div class="row">
					<div class="col-12">
						<table class="table table-centered w-100  nowrap table-sm table-bordered border-light" id="" cellpadding="0" cellpadding="0">
							<thead class="table-light">
								<tr>
									<th class="text-center">번호</th>
									<th class="text-center">파트너</th>
									<th class="text-center">파트너 담당자</th>
									<th class="text-center">파트너 담당자 계정</th>
									<th class="text-center">계정상태</th>
									<th class="text-center">정보수정</th>
								</tr>
							</thead>
							<tbody class="bg-white font-12">
							<?
							if($partner_member_list->success == true){
								$result = $partner_member_list->resultset->fetchAll();
								
								$num = 0;

								foreach($result as $value){
							?>
								<tr>
									<td class="text-center"><?=$partner_member_list->total_results-($num+($page-1)*20)?></td>
									<td class="text-start"><?=$value['publisher_name']?></td>
									<td class="text-center"><?=$value['name']?></td>
									<td class="text-center"><a href="partner_member_view.php?idx=<?=$value['idx']?>"><?=$value['id']?></a></td>
									<td class="text-center"><?=($value['flag']=="Y")?"접속가능":"접속불가"?></td>
									<td class="text-center"></td>
								</tr>
							<?		
										$num++;
									}
								}
							?>
							</tbody>
						</table>
						<div class="text-center mt-3 fs-5"><?echo $partner_member_list->links_html;?></div>
					</div> 
				</div>
				
			</div> <!-- container -->
		</div> <!-- content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

</body>
</html>