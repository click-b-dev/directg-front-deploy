<?php
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page_title= "그룹 조회";

$idx = filter_input(INPUT_GET, 'idx', FILTER_SANITIZE_STRING);

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	if($idx){
		$query="SELECT * FROM tbl_group WHERE idx=:idx";
		$stmt = $conn->prepare($query);
		$params = array(
			":idx"=>$idx
		);
		$stmt->execute($params);
		$group_info = $stmt->fetch();

		$query="SELECT * FROM tbl_group_item WHERE group_idx=:idx ORDER BY supplier_code, product_name";
		$stmt = $conn->prepare($query);
		$params = array(
			":idx"=>$idx
		);
		$stmt->execute($params);
		$group_item_list = $stmt->fetchAll();

		$query="SELECT COUNT(*) as cnt FROM tbl_group_item WHERE group_idx=:idx";
		$stmt = $conn->prepare($query);
		$params = array(
			":idx"=>$idx
		);
		$stmt->execute($params);
		$result = $stmt->fetch();
		$cnt = $result['cnt'];

		$admin=new Admin($conn);

		$subject =$group_info['subject'];
		$banner =$group_info['banner'];
		$start_date =$group_info['start_date'];
		$end_date =$group_info['end_date'];
		$use_flag =$group_info['use_flag'];
		$reg_date =$group_info['reg_date'];
		$banner_domain =$group_info['banner_domain'];
		$sort =$group_info['sort'];
		$type =$group_info['type'];
		$banner_url =$group_info['banner_url'];
		$pc_banner_url =$group_info['pc_banner_url'];
		$mode = "group_item_register";



	}else{
		$mode= "";
		$checked['pre_delivery']['N']="checked";
		$checked['is_bonus']['N']="checked";
	}

	$type_label = array(
		"1"=>"프로모션",
		"2"=>"타임딜",
		"3"=>"프랜차이즈",
		"99"=>"기타"
	);
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">상품</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">그룹 관리</a></li>
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
								<h3><?=$subject?></h3>
								<table class="table table-centered table-sm table-bordered border caption-top mb-1">
								<? if($pc_banner_url){?>
									<tr>
										<th class="table-light">PC 배너 주소</th>
										<td>
											<a href="<?=$pc_banner_url?>" target="_blank"><img src="<?=$pc_banner_url?>" class="mb-2 img-fluid"></a><br>
											<?=$pc_banner_url?>
										</td>
									</tr>
								<? } ?>

								<? if($banner_url){?>
									<tr>
										<th class="table-light">모바일 배너 주소</th>
										<td>
											<a href="<?=$group_info['banner_url']?>" target="_blank"><img src="<?=$group_info['banner_url']?>" class="mb-2 img-fluid"></a><br>
											<?=$group_info['banner_url']?>
										</td>
									</tr>
								<? } ?>

									<tr>
										<th class="table-light" style="">그룹구분</th>
										<td><?=$type_label[$group_info['type']]?></td>
									</tr>
									<tr>
										<th class="table-light">기간</th>
										<td>
											시작 : <?=date('Y-m-d H:i:s',$group_info['start_date'])?><br>
											종료 : <?=date('Y-m-d H:i:s',$group_info['end_date'])?>
										</td>
									</tr>
									<tr>
										<th class="table-light" style="">사용여부</th>
										<td><?=$group_info['use_flag']?></td>
									</tr>
									<tr>
										<th class="table-light" style="">주소</th>
										<td><a href="https://<?=$_SERVER['HTTP_HOST']?>/game/group_list.html?idx=<?=$idx?>" target="_blank">https://<?=$_SERVER['HTTP_HOST']?>/game/group_list.html?idx=<?=$idx?></a></td>
									</tr>
									</tbody>
								</table>
								<div>
									<h5>총 : <?=number_format($cnt)?> 개</h5>
								</div>
								<form id="frm" name="frm" method="post" action="group_ps.php" enctype="multipart/form-data">
									<div class="mb-3 col-6">
										<input type="file" class="form-control" name="upload_file">
										파일을 첨부하는 경우 검색으로 등록된 상품은 모두 삭제됩니다
									</div>

									<div class="col-8 mb-1">
										<div class="input-group">
											<div class="col-2">
												<select class="form-select" id="search_type" name="search_type">
													<option value="product_name">상품명</option>
													<option value="product_code">옵션상품코드</option>
													<option value="goods_sku">옵션상품 SKU</option>
												</select>
											</div>
											<div class="col-8">
												<input type="text" class="form-control" id="search_value" name="search_value">
											</div>
											<div class="col-2">
												<button type="button" class="btn btn-primary" id="btn_goods_find" name="btn_goods_find">상품검색</button>
											</div>
										</div>
									</div>

									<input type="hidden" name="mode" value="<?=$mode?>">
									<input type="hidden" name="idx" value="<?=$idx?>">
									<table class="table table-centered w-100  nowrap table-sm table-bordered border-light">
										<thead class="table-light">
										<tr>
											<th>대표상품번호</th>
											<th>옵션상품코드</th>
											<th>옵션상품명</th>
											<th>플랫폼</th>
											<th>공급처</th>
											<th>삭제</th>
										<tr>
										</thead>
										<tbody id="group_item">
									<?php
										foreach($group_item_list as $value){
									?>
										<tr>
											<td>
												<input type="hidden" name="title_id[]" value="<?=$value['title_id']?>">
												<input type="hidden" name="product_code[]" value="<?=$value['product_code']?>">
												<input type="hidden" name="product_name[]" value="<?=$value['product_name']?>">
												<input type="hidden" name="product_name_en[]" value="<?=$value['product_name_en']?>">
												<input type="hidden" name="product_platform[]" value="<?=$value['product_platform']?>">
												<input type="hidden" name="goods_sku[]" value="<?=$value['goods_sku']?>">
												<input type="hidden" name="option_type[]" value="<?=$value['option_type']?>">
												<input type="hidden" name="game_type[]" value="<?=$value['game_type']?>">
												<input type="hidden" name="supplier_code[]" value="<?=$value['supplier_code']?>">
												<?=$value['title_id']?>
											</td>
											<td><?=$value['product_code']?></td>
											<td><?=$value['product_name']?></td>
											<td><?=$value['product_platform']?></td>
											<td><?=$admin->getPublisherNameSearch($value['product_code'])?></td>
											<td><button type="button" class="btn btn-danger btn-sm btn-del-row" id="del_<?=$value['product_code']?>">삭제</button></td>
									<?php
										}
									?>
										</tbody>
									</table>
									<div class="float-end">
										<button type="submit" class="btn btn-sm btn-primary btn-lg shadow-none">저장</button>
									</div>
								</form>

							</div> <!-- end card-body -->
						</div> <!-- end card-->
					</div> <!-- end col-->
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

<!--검색 팝업-->
<div id="asset-modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="goods-modalLabel" aria-hidden="true">
	<div class="modal-dialog modal-lg" style="max-width:1400px">
		<div class="modal-content">
			<div class="modal-header modal-colored-header bg-primary">
				<h4 class="modal-title" id="goods-modalLabel">상품 검색결과</h4>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-hidden="true"></button>
			</div>
			<div class="modal-body p-0">
				<form class="form-horizontal">
				<div id="asset_info"></div>
				<!--
					<table class="table table-striped mb-0" id="asset_info">
					<thead class="table-dark">
					<tr>
						<th class="text-center" style="">옵션상품번호</th>
						<th class="text-center" style="">옵션상품명</th>
						<th class="text-center" style="">플랫폼</th>
						<th class="text-center" style="">옵션상품 유형</th>
						<th class="text-center" style="">옵션상품 구분</th>
					</tr>
					</thead>
					<tbody>
					</tbody>
					</table>
				-->
				</form>
			</div>
		</div><!-- /.modal-content -->
	</div><!-- /.modal-dialog -->
</div><!-- /.modal -->

<script>
$(document).ready(function(){
	$("#btn_goods_find").bind("click",function(){
		var product_code = $(this).attr("data-productcode");
		var search_type = $("#search_type option:selected").val();
		var search_value = $("#search_value").val();

		if(search_value==""){
			alert("검색어를 입력해주세요.");
			return;
		}

		$.ajax({
			 type: "POST",
			 url: "group_ps.php",
			 data: {mode:"goods_search",search_type:search_type,search_value:search_value},
			 success: function (data, status) {
				$("#asset-modal #asset_info").html(data);
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
});

$("#asset-modal").on("click", "#group_submit", function() {
	var product_code = [];
	var goods_sku = [];
	var product_name = [];
	var title_id = [];
	var title_sku = [];
	$("input[name='chk[]']:checked").each(function() {
		product_code.push($(this).val());
		goods_sku.push($(this).data("goodssku"));
		product_name.push($(this).data("productname"));
		title_id.push($(this).data("titleid"));
		title_sku.push($(this).data("sku"));
	});

});


$("#asset-modal").on("click", "#group_submit", function() {
	var rows = "";

	$("input[name='chk[]']:checked").each(function() {
		var product_code = $(this).val();
		var goods_sku    = $(this).data("goodssku");
		var product_name = $(this).data("productname");
		var title_id     = $(this).data("titleid");
		var title_sku    = $(this).data("sku");
		var platform     = $(this).data("platform");
		var product_name_en = $(this).data("productnameen");
		var product_platform = $(this).data("productplatform");
		var option_type = $(this).data("optiontype");
		var game_type = $(this).data("gametype");
		var supplier_code = $(this).data("suppliercode");
		var supplier_name = $(this).data("suppliername");

		rows += `
			<tr>
				<td>
					<input type='hidden' name='title_id[]' value='${title_id}'>
					<input type='hidden' name='product_code[]' value='${product_code}'>
					<input type='hidden' name='product_name[]' value='${product_name}'>
					<input type='hidden' name='product_name_en[]' value='${product_name_en}'>
					<input type='hidden' name='product_platform[]' value='${product_platform}'>
					<input type='hidden' name='goods_sku[]' value='${goods_sku}'>
					<input type='hidden' name='option_type[]' value='${option_type}'>
					<input type='hidden' name='game_type[]' value='${game_type}'>
					<input type='hidden' name='supplier_code[]' value='${supplier_code}'>
					${title_id}
				</td>
				<td>${product_code}</td>
				<td>${product_name}</td>
				<td>${product_platform}</td>
				<td>${supplier_name}</td>
				<td><button type='button' class='btn btn-danger btn-sm btn-del-row' id='del_${product_code}'>삭제</button></td>
			</tr>
		`;
	});

	// tbody 에 행 추가
	$("#group_item").append(rows);

	// 모달 닫기
	$("#asset-modal").modal("hide");
});

$(document).on("click", ".btn-del-row", function() {
	$(this).closest("tr").remove();
});
</script>
</body>
</html>
