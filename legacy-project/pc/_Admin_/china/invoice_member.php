<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['china'] = "active";
$sidebar_file = "sidebar_china.php";

$page_title = "중국 결제자 리스트";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_name = filter_input(INPUT_GET, 'search_name', FILTER_SANITIZE_STRING);
$search_email = filter_input(INPUT_GET, 'search_email', FILTER_SANITIZE_STRING);

if(!$page){
$page=1;
}

$where = [];

foreach($_GET as $key=>$value){
	if($key<>"page" ){
		if($value<>""){
			$param.="&".$key."=".$value;
		}
	}
}



if($search_name){
	$where[] = " name like '%".$search_name."%'";
}

if($search_email){
	$where[] = " email ='".$search_email."'";
}

foreach($where as $value){
	$add_where.= " and ".$value;
}

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	//$orderby = "settle_no desc";

	$china= new China($conn); 
	$invoice_member = $china->getChinaInvoiceMember($page,$add_where,$orderby,$param);

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
									<li class="breadcrumb-item"><a href="javascript: void(0);">중국결제</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">중국 결제 관리</a></li>
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
						<div class="card-body py-2">
							<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
								<div class="row mb-2">
									<div class="col-lg-4">
										<div class="row">
											<label for="search_name" class="col-sm-3 col-form-label bg-light border">이름</label>
											<div class="col-sm-9">
												<input type="text" class="form-control" id="search_name" name="search_name" placeholder="이름" value="<?=$search_name?>">
											</div>
										</div>
									</div>
									<div class="col-lg-4">
										<div class="row">
											<label for="search_email" class="col-sm-3 col-form-label bg-light border">이메일</label>
											<div class="col-sm-9">
												<input type="text" class="form-control" id="search_email" name="search_email" placeholder="이메일" value="<?=$search_email?>">
											</div>
										</div>
									</div>
									<div class="col-lg-4">
										<div class="float-end">
											<button type="submit" class="btn btn-primary shadow-none">검색</button>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>
				
				<div class="d-flex flex-row justify-content-between mb-2">
					<div class="float-start"><? echo number_format($invoice_member->total_results)?> 명</div>
					<div class="float-end"><button type="button" class="btn btn-outline-danger" data-bs-toggle="modal" data-bs-target="#signup-modal">중국 결제자 등록</button></div>
				</div>
				
				<div class="row">
					<div class="col-12">
						<table class="table table-centered w-100  nowrap table-sm table-bordered border-light" id="" cellpadding="0" cellpadding="0">
							<thead class="table-light">
								<tr>
									<th class="text-center">번호</th>
									<th class="text-center">이메일(아이디)</th>
									<th class="text-center">이름</th>
									<th class="text-center">마지막 접속일자</th>
									<th class="text-center">비밀번호 초기화</th>
								</tr>
							</thead>
							<tbody class="bg-white font-12">
							<?
							if($invoice_member->success == true){
								$result = $invoice_member->resultset->fetchAll();
								
								$num = 0;

								foreach($result as $value){
							?>
								<tr>
									<td class="text-center"><?=$invoice_member->total_results-($num+($page-1)*20)?></td>
									<td class="text-center"><?=$value['email']?></td>
									<td class="text-center"><?=$value['name']?></td>
									<td class="text-center"><?=$value['login_date']?></td>
									<td class="text-center"><button type="button" class="btn btn-outline-dark btn-sm btn_pwd_reset" data-idx="<?=$value['idx']?>">초기화</button></td>
								</tr>
							<?		$num++;
									}
								}
							?>
							</tbody>
							<tfoot>
							<tr>
								<td colspan="5" class="text-end">(초기화 비밀번호는 <?=date('Ymd')?>)</td>
							</tr>
							</tfoot>
						</table>
						<div class="text-center mt-3"><?echo $invoice_member->links_html;?></div>
					</div> 
				</div>
					
			</div><!-- /container-fluid -->
		</div><!-- /content -->
	</div><!-- /content-page -->

	<div id="signup-modal" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header modal-colored-header bg-primary">
					<h4 class="modal-title" id="standard-modalLabel">중국 결제자 등록</h4>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-hidden="true"></button>
				</div>
				<div class="modal-body">
					<form class="ps-3 pe-3" method="POST" action="invoice_member_ps.php" autocomplete="one-time-code">
						<input type="hidden" name="mode" value="register">
						<div class="mb-3">
							<label for="email" class="form-label">* 이메일</label>
							<input class="form-control" type="text" id="email" name="email" required value="" autocomplete="one-time-code">
						</div>
						
						<div class="mb-3">
							<label for="name" class="form-label">* 이름</label>
							<input class="form-control" type="text" id="name"  name="name" required value="" autocomplete="one-time-code">
						</div>

						<div class="mb-3">
							<label for="pwd" class="form-label">비밀번호</label>
							<input class="form-control" type="password" required id="pwd" name="pwd" value="" autocomplete="one-time-code">
						</div>

						<div class="mb-3 text-center">
							<button class="btn btn-primary" type="submit">중국 결제자 등록</button>
						</div>
					</form>

				</div>
			</div>
		</div>
	</div>

</div><!-- /wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>
$(document).ready(function(){
	$(".btn_pwd_reset").bind("click",function(){
		var index = $(".btn_pwd_reset").index(this);
		var idx = $(".btn_pwd_reset").eq(index).attr("data-idx");
		
		if(confirm("해당 회원의 비밀번호를 초기화 하시겠습니까?")){
			$.ajax({
					type: "POST",
					url: "invoice_member_ps.php",
					data: {mode:"pwd_reset",idx:idx},
					success:function(data){
						//location.reload();
						alert(data);
					},
					 error: function(data) {
						//에러코드
						alert(data);
						return false;
					}
				});
		}
	});
});
</script>
</body>
</html>
