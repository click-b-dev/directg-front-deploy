<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page_title= "한글패치 인증정보 확인";

$search_m_id = filter_input(INPUT_GET, 'search_m_id', FILTER_SANITIZE_EMAIL);
$search_patch_goods = filter_input(INPUT_GET, 'search_patch_goods', FILTER_SANITIZE_NUMBER_INT);
$patch_goods = filter_input(INPUT_GET, 'patch_goods', FILTER_SANITIZE_STRING);
$prefix_text = filter_input(INPUT_GET, 'prefix_text', FILTER_SANITIZE_STRING);
$encode_type = filter_input(INPUT_GET, 'encode_type', FILTER_SANITIZE_STRING);

try{  
	$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);

	$admin_goods= new AdminGoods($conn_dgkr); 
	$patch_list = $admin_goods->getKoreanPatchList();

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

$selected['search_patch_goods'][$search_patch_goods] = "selected";
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">한글패치 관리</a></li>
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
							<form id="searchFrm" class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
								<input type="hidden" name="patch_goods" id="patch_goods" value="">
								<input type="hidden" name="prefix_text" id="prefix_text" value="">
								<input type="hidden" name="encode_type" id="encode_type" value="">
								<div class="row g-0 mb-2">
									<div class="col-6">
										<div class="row g-2">
											<label for="search_m_id" class="col-2 col-form-label col-form-label-sm bg-light border">회원아이디</label>
											<div class="col-4">
												<input type="text" class="form-control" id="search_m_id" name="search_m_id" placeholder="" value="<?=$search_m_id?>" required>
											</div>
										</div>
									</div>
									<div class="col-6">
										<div class="row g-2">
											<label for="search_patch_goods" class="col-2 col-form-label col-form-label-sm bg-light border">한글패치상품</label>
											<div class="col-4">
												<select id="search_patch_goods" name="search_patch_goods" class="form-select" required>
													<option value="">:::한글패치선택::::</option>
													<?foreach($patch_list as $value){?>
													<option value="<?=$value['idx']?>" <?=$selected['search_patch_goods'][$value['idx']]?> data-prefix="<?=$value['prefix_text']?>" data-encodetype="<?=$value['encode_type']?>"><?=$value['goods_nm']?></option>
													<?}?>
												</select>
											</div>

										</div>
									</div>
								</div>

								<div class="row">
									<div class="col-lg-12">
										<div class="float-end">
											<button type="submit" class="btn btn-primary shadow-none">회원 검색</button>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>
				
				<div class="row">
					<div class="col-12">
						<div class="card">
							<h5 class="card-header bg-secondary text-white">인증정보 확인</h5>
							<div class="card-body p-0">
								<div class="table-responsive">
									<table class="table table-centered w-100 nowrap table-sm table-bordered" id="">
										<thead class="table-light">
											<tr>
												<th class="text-center">회원고유번호</th>
												<th class="text-center">한글패치상품</th>
												<th class="text-center">한글패치인증 아이디</th>
												<th class="text-center">한글패치인증 비밀번호</th>
												<th class="text-center">한글패치인증 비밀번호 복사</th>
											</tr>
										</thead>
										<tbody class="font-13">
										<?
											$num=1;

											if($search_m_id){
										?>
											<tr>
												<td class="text-center"><?=$num?></td>
												<td class="text-start"><?=$patch_goods?></td>
												<td><?=$search_m_id?></td>
												<td><span class="enc_data"><?=$admin_goods->patchEncDataAdmin($search_m_id,$prefix_text,$encode_type)?></span></td>
												<td class="text-center"><button type="button" class="btn btn-sm btn-secondary shadow-none btn_clipboard" data-clipboard-target=".enc_data">비밀번호 복사</button></td>
											</tr>
									<?		$num++;
											}
										?>
										</tbody>
									</table>
								</div>
							</div> <!-- end card-body-->
						</div> <!-- end card-->
					</div> <!-- end col -->
				</div>
				<!-- end row -->   
				
			</div>
			<!-- container -->

		</div>
		<!-- content -->

	</div>

</div>
<!-- END wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script src="https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/1.7.1/clipboard.min.js"></script>
<script>
window.onload = function(){
	var clipboard = new Clipboard('.btn_clipboard');
};
$(document).ready(function(){
  $("#searchFrm").submit(function(){
	  var index = $("#search_patch_goods option:selected").index();
	  var patch_goods = $("#search_patch_goods option:selected").text();
	  var prefix_text = $("#search_patch_goods option").eq(index).attr("data-prefix");
	  var encode_type = $("#search_patch_goods option").eq(index).attr("data-encodetype");

		if($("#searchValue").val()==""){
			alert("검색할 회원아이디를 입력해주세요.");
			return false;
		}

		if($("#search_patch_goods option:selected").val()==""){
			alert("제공할 패치상품을 선택해주세요.");
			return false;
		}

		$("#patch_goods").val(patch_goods);
		$("#prefix_text").val(prefix_text);
		$("#encode_type").val(encode_type);

	  return true;
  });

  $(".btn_copy").bind("click",function(){
		var index = $(".btn_copy").index(this);
		var patch_id = $(".m_id").eq(index).text();
		var patch_enc_data = $(".enc_data").eq(index).text();
		var patch_source = "패치 아이디 : " + patch_id + "\n 패치 비밀번호 : " + patch_enc_data;
		//window.clipboardData.clearData("Text");
		//window.clipboardData.setData('Text', patch_source);
		//patch_source.execCommand('copy');
		//copy_contents("sourece");
		//copy_contents();
  });
 
});
</script>
</body>
</html>
