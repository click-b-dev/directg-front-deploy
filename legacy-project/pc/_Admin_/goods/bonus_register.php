<?

header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page_title= "특전 등록";

$bonus_no = filter_input(INPUT_GET, 'bonus_no', FILTER_SANITIZE_STRING);
$mode = filter_input(INPUT_GET, 'mode', FILTER_SANITIZE_STRING);

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	if($bonus_no){
		$mode= "modify";
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

		if($data['bonus_delivery_type']==="2"){
			$bonus_asset_config ="";
		}else{
			$bonus_asset_config ="d-none";
		}

		
		$bonus_asset = str_replace("&#34;",'"',htmlspecialchars_decode($data['bonus_asset']));
		$bonus_asset_list = json_decode($bonus_asset,true);

		$checked['bonus_delivery_type'][$data['bonus_delivery_type']]="checked";
		$checked['pre_delivery'][$data['pre_delivery']]="checked";
		$checked['is_bonus'][$data['is_bonus']]="checked";

	}else{
		$mode= "register";

		$bonus_name ="";
		$bonus_info = "";
		$bonus_start_date = "";
		$bonus_end_date = "";
		$pre_delivery_date = "";
		$bonus_asset_list = [];

		$bonus_asset_config ="d-none";

		$checked['pre_delivery']['N']="checked";
		$checked['is_bonus']['N']="checked";
	}

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
					<div class="col-12">
						<div class="card">
							<div class="card-body">
								<form id="frm" name="frm" method="post" action="bonus_ps.php" class="">
									<input type="hidden" name="mode" value="<?=$mode?>">
									<input type="hidden" name="bonus_no" value="<?=$bonus_no?>">

									<div class="row mb-2">
										<label for="bonus_delivery_type" class="col-2 col-form-label bg-light">* 특전 제공방식</label>
										<div class="col-10">
											<div class="form-check form-check-inline mt-2">
												<input type="radio" id="bonus_delivery_type_1" name="bonus_delivery_type" class="form-check-input" value="1" <?=$checked['bonus_delivery_type']['1']?>>
												<label class="form-check-label" for="bonus_delivery_type_1">특전키 포함</label>
											</div>
											<div class="form-check form-check-inline mt-2">
												<input type="radio" id="bonus_delivery_type_2" name="bonus_delivery_type" class="form-check-input" value="2" <?=$checked['bonus_delivery_type']['2']?>>
												<label class="form-check-label" for="bonus_delivery_type_2">별도키 제공</label>
											</div>
											<div class="form-check form-check-inline mt-2">
												<input type="radio" id="bonus_delivery_type_3" name="bonus_delivery_type" class="form-check-input" value="3" <?=$checked['bonus_delivery_type']['3']?>>
												<label class="form-check-label" for="bonus_delivery_type_3">다운로드 컨텐츠</label>
											</div>
										</div>
									</div>

									<div class="row mb-2">
										<label for="bonus_name" class="col-2 col-form-label bg-light">* 특전명</label>
										<div class="col-10">
											<input type="text" class="form-control" id="bonus_name" name="bonus_name" placeholder="" value="<?=$bonus_name?>">
										</div>
									</div>

									<div class="row mb-2 <?=$bonus_asset_config?>" id="bonus_asset_config">
										<textarea name="bonus_asset" id="bonus_asset" style="display:none"><?=$data['bonus_asset']?></textarea>
										<label for="bonus_asset" class="col-2 col-form-label bg-light">특전 Asset 설정</label>
										<div class="col-10">
											<div class="card">
												<div class="card-body p-0">
													<div class="table-responsive mt-0">
														<table class="table table-bordered table-centered mb-0 table-sm" id="asset_list">
															<colgroup>
																<col width="100px"/>
																<col width="100px"/>
																<col width="100px"/>
																<col/>
																<col width="100px"/>
															<colgroup>
															<thead class="table-light font-13">
																<tr>
																	<th class="text-center">Asset 유형</th>
																	<th class="text-center">Asset 플랫폼</th>
																	<th class="text-center">Asset ID</th>
																	<th class="text-center">Asset 이름</th>
																	<th class="text-center">비고</th>
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
																<td class="text-center"><button type="button" class="btn btn-link btn_asset_delete"><i class="mdi mdi-delete mdi-18px"></i> </button></td>
															</tr>
															<?
																}
															?>
															</tbody>
														</table>
													</div>
												</div>
												<div class="card-footer font-13 border-top-0">
													<div class="row mb-0">
														<div class="col-3">
															<select id="search_type" name="search_type" class="form-select form-select-sm">
																<option value="1">Asset_id</option>
															</select>
														</div>
														<div class="col-6">
															<input type="text" class="form-control form-control-sm " id="search_value" name="search_value"  placeholder="Asset ID를 입력해 주세요">
														</div>
														<div class="col-3">
															<button type="button" class="btn btn-sm btn-dark shadow-none" id="btn_asset_find">Asset 검색</button>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>

									<div class="row mb-2">
										<label for="is_bonus" class="col-2 col-form-label bg-light">* 특전 제공여부</label>
										<div class="col-10">
											<div class="form-check form-check-inline mt-2">
												<input type="radio" id="is_bonus_y" name="is_bonus" class="form-check-input" value="Y" <?=$checked['is_bonus']['Y']?>>
												<label class="form-check-label" for="is_bonus_y">예</label>
											</div>
											<div class="form-check form-check-inline mt-2">
												<input type="radio" id="is_bonus_n" name="is_bonus" class="form-check-input" value="N" <?=$checked['is_bonus']['N']?>>
												<label class="form-check-label" for="is_bonus_n">아니오</label>
											</div>
										</div>
									</div>

									<div class="row mb-2">
										<label for="bonus_count" class="col-2 col-form-label bg-light">* 특전 준비수량</label>
										<div class="col-2">
											<div class="input-group">
												<input type="text" class="form-control" id="bonus_count" name="bonus_count" placeholder="특전진행수량" value="<?=$bonus_count?>">
											</div>
										</div>
									</div>

									<!--<div class="row mb-2">
										<label for="pre_delivery" class="col-2 col-form-label bg-light">* 사전제공 여부</label>
										<div class="col-10">
											<div class="form-check form-check-inline mt-2">
												<input type="radio" id="pre_delivery_y" name="pre_delivery" class="form-check-input" value="Y" <?=$checked['pre_delivery']['Y']?>>
												<label class="form-check-label" for="pre_delivery_y">예</label>
											</div>
											<div class="form-check form-check-inline mt-2">
												<input type="radio" id="pre_delivery_n" name="pre_delivery" class="form-check-input" value="N" <?=$checked['pre_delivery']['N']?>>
												<label class="form-check-label" for="pre_delivery_n">아니오</label>
											</div>
										</div>
									</div>

									<div class="row mb-2 d-none" id="pre_delivery_config">
										<label for="pre_delivery_date" class="col-2 col-form-label bg-light"> 사전제공일자</label>
										<div class="col-3">
											<div class="input-group">
												<input type="text" class="form-control" id="pre_delivery_date" name="pre_delivery_date" placeholder="사전제공 시작일자" value="<?=$pre_delivery_date?>">
											</div>
										</div>
									</div>-->

									<div class="mb-2 row">
										<label for="bonus_info" class="col-2 col-form-label bg-light">* 특전 설명</label>
										<div class="col-10">
											<textarea id="bonus_info" class="form-control" name="bonus_info"><?=$bonus_info?></textarea>
										</div>
									</div>

									<div class="float-end">
										<button type="submit" class="btn btn-sm btn-primary btn-lg shadow-none">특전 저장</button>
									</div>
								</form>

							</div> <!-- end card-body -->
						</div> <!-- end card-->
					</div> <!-- end col-->
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

	//Asset 삭제
	$(".btn_asset_delete").bind("click",function(){
		var index = $(".btn_asset_delete").index(this);
		var bonus_asset_content = $("#bonus_asset").val();
		var bonus_asset_data = JSON.parse(bonus_asset_content);

		console.log(bonus_asset_data);
			
		//선택된 배열 삭제
		bonus_asset_data.splice(index,1);

		if(bonus_asset_data.length==0){
			$("#bonus_asset").val("");
		}else{
			$("#bonus_asset").val(JSON.stringify(bonus_asset_data));
		}
		$(".btn_asset_delete").eq(index).parent().parent().remove();
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
		//var bonus_asset = JSON.parse($("#bonus_asset").val());
		var bonus_asset_content = $("#bonus_asset").val();

		if(bonus_asset_content==""){
			var bonus_asset_data = new Array();
		}else{
			var bonus_asset_data = JSON.parse(bonus_asset_content);
		}

		//console.log(bonus_asset_data);
		
		var data = new Object();
		data.asset_type = asset_type ;
		data.asset_platform = asset_platform;
		data.asset_id = asset_id;
		data.asset_name = asset_name;
		bonus_asset_data.push(data) ;

		var jsonData = JSON.stringify(bonus_asset_data) ;

		$("#bonus_asset").val(jsonData);

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
