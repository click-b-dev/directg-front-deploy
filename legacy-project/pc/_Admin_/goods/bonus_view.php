<?
$document_root= "/backend";
$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page_title= "특전 상세보기";

error_reporting(E_ALL & ~E_DEPRECATED & ~E_STRICT & ~E_NOTICE);
include_once($_SERVER['DOCUMENT_ROOT'].'/backend/conf/conf.php');
include_once($_SERVER['DOCUMENT_ROOT'].'/backend/lib/lib.php');

$bonus_no = filter_input(INPUT_GET, 'bonus_no', FILTER_SANITIZE_STRING);
$mode = filter_input(INPUT_GET, 'mode', FILTER_SANITIZE_STRING);

$dsn = 'mysql:host='.DB_HOST.';dbname='.DB_DB.';port=3306;charset=utf8';
try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$admin= new Admin($conn);
	$parsedown= new Parsedown();

	$query="select * from tbl_bonus where bonus_no=:bonus_no";
	$stmt = $conn->prepare($query);
	$params = array(
		":bonus_no"=>$bonus_no
	);
	$stmt->execute($params);
	$data = $stmt->fetch();

	$bonus_name =$data['bonus_name'];

	$bonus_start_date =$data['bonus_start_date'];
	$bonus_end_date =$data['bonus_end_date'];
	$pre_delivery_date =$data['pre_delivery_date'];

	$bonus_info = $data['bonus_info'];

	$bonus_asset = str_replace("&#34;",'"',htmlspecialchars_decode($data['bonus_asset']));
	$bonus_asset_list = json_decode($bonus_asset,true);

	$bonus_goods_item = $admin->getBonusGoodsItem($data['bonus_no']);

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
				
				<div class="row">
					<div class="col-8">
						<div class="card">
							<h5 class="card-header bg-secondary text-white">특전 정보</h5>
							<div class="card-body">
								<dl class="row mb-2">
									<dt class="col-2 bg-light border border-1 px-2 py-1 m-0 mb-2">특전 제공방식</dt>
									<dd class="col-10 border border-start-0 px-2 py-1 m-0 mb-2"><?=$data['bonus_delivery_type']?></dd>
									<dt class="col-2 bg-light border border-1 px-2 py-1 m-0 mb-2">특전명</dt>
									<dd class="col-10 border border-start-0 px-2 py-1 m-0 mb-2"><?=$data['bonus_name']?></dd>

									<? if($data['bonus_delivery_type']=="2"){?>
									<dt class="col-2 bg-light border border-1 px-2 py-1 m-0 mb-2">특전 Asset 설정</dt>
									<dd class="col-10 border border-start-0 px-2 py-1 m-0 mb-2">
										<div class="card mb-0">
											<div class="card-body p-0">
												<div class="table-responsive mt-0">
													<table class="table table-bordered table-centered mb-0 table-sm" id="asset_list">
														<colgroup>
															<col width="100px"/>
															<col width="100px"/>
															<col width="100px"/>
															<col/>
														<colgroup>
														<thead class="table-light font-13">
															<tr>
																<th class="text-center">Asset 유형</th>
																<th class="text-center">Asset 플랫폼</th>
																<th class="text-center">Asset ID</th>
																<th class="text-center">Asset 이름</th>
															</tr>
														</thead>
														<tbody class="font-13">
														<?
															foreach($bonus_asset_list as $sub_value){
														?>
														<tr>
															<td class="text-center"><?=$sub_value['asset_type']?></td>
															<td class="text-center"><?=$sub_value['asset_platform']?></td>
															<td class="text-center"><?=$sub_value['asset_id']?></td>
															<td class="text-start"><?=$sub_value['asset_name']?></td>
														</tr>
														<?
															}
														?>
														</tbody>
													</table>
												</div>
											</div>
										</div>
									</dd>
									<?}?>

									<dt class="col-2 bg-light border border-1 px-2 py-1 m-0 mb-2">* 특전준비수량</dt>
									<dd class="col-10 border border-start-0 px-2 py-1 m-0 mb-2"><?=$data['bonus_count']?></dd>

									<dt class="col-2 bg-light border border-1 px-2 py-1 m-0 mb-2">* 특전 설명</dt>
									<dd class="col-10 border border-start-0 px-2 py-1 m-0 mb-2">
										<div id="etc"><?=$parsedown->text($data['bonus_info'])?></div>
									</dd>
								</dl>

							</div> <!-- end card-body -->
						</div>
					</div> 
					<div class="col-4">
						<div class="card">
							<h5 class="card-header bg-secondary text-white">특전 제공상품</h5>
							<div class="card-body p-0">
								<ul class="list-group">
								<?
									foreach($bonus_goods_item as $sub_value){
								?>
								<li class="list-group-item">[<?=$sub_value['product_code']?>] <?=$sub_value['product_name']?></li>
								<?
									}
								?>
								</ul>
							</div>
						</div>
					</div>
				</div>
				
			</div> 
			<!-- container -->

		</div> 
		<!-- content -->

	</div><!-- /content-page -->

	<!--Asset 검색결과 팝업-->
	<div id="asset-modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="asset-modalLabel" aria-hidden="true">
			<div class="modal-dialog modal-lg" style="max-width:1000px">
				<div class="modal-content">
					<div class="modal-header modal-colored-header bg-primary">
						<h4 class="modal-title" id="asset-modalLabel">Asset 검색결과</h4>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-hidden="true"></button>
					</div>
					<div class="modal-body p-0">
						<form class="form-horizontal">
							<table class="table table-striped mb-0" id="asset_info">
							<thead class="table-dark">
							<tr>
								<th class="text-center" style="width:80px">Asset 유형</th>
								<th class="text-center" style="width:70px">Asset 플랫폼</th>
								<th class="text-center" style="width:70px">Asset ID</th>
								<th class="text-center" style="width:300px">Asset name</th>
								<th class="text-center" style="width:100px">비고</th>
							</tr>
							</thead>
							<tbody>
							</tbody>
							</table>
						</form>
					</div>
				</div><!-- /.modal-content -->
			</div><!-- /.modal-dialog -->
		</div><!-- /.modal -->

</div><!-- /wrapper -->

<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>
var simplemde = new SimpleMDE({
	element: document.getElementById("bonus_info")
});

$(document).ready(function(){
	$("#btn_asset_find").bind("click",function(){
		var product_code = $(this).attr("data-productcode");
		var search_type = $("#search_type option:selected").val();
		var asset_id = $("#search_value").val();

		if(search_value==""){
			alert("Asset ID를 입력해주세요.");
			return;
		}

		$.ajax({
			 type: "POST",
			 url: "bonus_ps.php",
			 data: {mode:"asset_search",search_type:search_type,asset_id:asset_id},
			 success: function (data, status) {
				//$("#asset-modal input[name='product_code']").val(product_code);
				$("#asset-modal #asset_info tbody").html(data);
				$("#asset-modal").modal('show');
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//Asset 검색결과(Asset 구성추가)
	$(document).on('click', '#asset-modal .btn_asset_add', function(e){
		e.preventDefault();
		var index = $('.btn_asset_add').index(this);
		var asset_id = $("#asset-modal input[name='asset_id[]']").eq(index).val();
		var asset_name = $("#asset-modal input[name='asset_name[]']").eq(index).val();
		var asset_type = $("#asset-modal input[name='asset_type[]']").eq(index).val();
		var asset_platform = $("#asset-modal input[name='asset_platform[]']").eq(index).val();
		var result_html = "";

		result_html+="<tr>";
		result_html+="<td><input type='text' class='form-control' name='asset_type[]' value='"+asset_type+"' readonly /></td>";
		result_html+="<td><input type='text' class='form-control' name='asset_platform[]' value='"+asset_platform+"' readonly /></td>";
		result_html+="<td><input type='text' class='form-control' name='asset_id[]'  value='"+asset_id+"' readonly /></td>";
		result_html+="<td><input type='text' class='form-control' name='asset_name[]' value='"+asset_name+"' readonly /></td>";
		result_html+="<td></td>";
		result_html+="</tr>";
		
		$("#asset_list tbody").append(result_html);
		$("#asset-modal").modal('hide');
	});

	$("#frm").submit(function( event ) {

		//var new_form = $('<form></form>');
		//new_form.attr("name", "test_form");
		//new_form.attr("method", "post");
		//new_form.attr("action", "bonus_ps.php");
		//new_form.attr("target", "_blank");
		//new_form.append($('<input/>', {type: 'hidden', name: 'bonus_info', value:simplemde.value()}));
		//new_form.appendTo('body');
		//new_form.submit();
		//return false;
	});

	$('input[name="bonus_delivery_type"]').bind("click",function(){
		var bonus_delivery_type = $('input[name="bonus_delivery_type"]:checked').val();
		if(bonus_delivery_type=="2"){
			$("#bonus_asset_config").removeClass("d-none");
			$("#bonus_asset_config").show();
		}else{
			$("#bonus_asset_config").removeClass("d-block");
			$("#bonus_asset_config").hide();
		}
	});

	$('input[name="pre_delivery"]').bind("click",function(){
		var pre_delivery = $('input[name="pre_delivery"]:checked').val();
		if(pre_delivery=="Y"){
			$("#pre_delivery_config").removeClass("d-none");
			$("#pre_delivery_config").show();
			
		}else{
			$("#pre_delivery_config").removeClass("d-block");
			$("#pre_delivery_config").hide();
			
		}
	});
});

</script>

</body>
</html>
