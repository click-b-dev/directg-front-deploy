<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['china'] = "active";
$sidebar_file = "sidebar_china.php";

$page_title = "중국 결제 주문서 작성";

$mode = filter_input(INPUT_GET, 'mode', FILTER_SANITIZE_STRING);
$settle_no = filter_input(INPUT_GET, 'settle_no', FILTER_SANITIZE_STRING);

if(!$mode){
	$mode = "register";
	$ord_ymd = date('Y-m-d');
}

$dsn = 'mysql:host='.DB_HOST.';dbname='.DB_DB.';port=3306;charset=utf8';
try{ 
	
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	
	$china= new China($conn);
	
	//회원목록
	$query = "select idx,name,email from directgames.tbl_invoice_member order by idx desc";
	$stmt = $conn->prepare($query);
	$stmt->execute();
	$member_data = $stmt->fetchAll();
	

	//주문서 정보
	$query = "select * from directgames.tbl_invoice_order where settle_no=:settle_no";
	$params = array(
		":settle_no"=>$settle_no
	);
	$stmt = $conn->prepare($query);
	$stmt->execute($params);
	$order_data = $stmt->fetch();

	//주문상품정보
	$query2 = "select * from directgames.tbl_invoice_order_item where settle_no=:settle_no order by order_num asc";
	$params = array(
		":settle_no"=>$settle_no
	);
	$stmt = $conn->prepare($query2);
	$stmt->execute($params);
	$order_item_data = $stmt->fetchAll();
	
	//결제로그
	$query3 = "select * from directgames.tbl_kcp_log_invoice where merchant_uid=:merchant_uid order by settle_count asc";
	$params = array(
		":merchant_uid"=>$settle_no
	);
	$stmt = $conn->prepare($query3);
	$stmt->execute($params);
	$log_data = $stmt->fetchAll();

	$checked['settlekind'][$order_data['settlekind']] = "checked";

	$ord_ymd = $order_data['ord_ymd'];

	//배송지정보
	$address_query = "select * from directgames.tbl_invoice_address where settle_no=:settle_no order by idx asc";
	$params = array(
					':settle_no'=>$settle_no
				);
	$stmt = $conn->prepare($address_query);
	$stmt->execute($params);
	$address_data = $stmt->fetchAll();
	
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
				
				<div class="d-flex flex-row justify-content-end mb-2">
					<button type="button" class="btn btn-danger shadow-none" id="btn_invoice_save">주문서 저장</button>
				</div>
				
				<form class="row" name="invoiceFrm" id="invoiceFrm" method="POST" action="invoice_ps.php">
					<input type="hidden" name="mode" value="modify">
					<input type="hidden" name="settlekind" value="">
					<div class="col-6">
						<div class="card border mb-3">
							<h5 class="card-header bg-light">주문자 정보</h5>
							<div class="card-body p-2">
								<div class="mb-2 row">
									<label for="member_search" class="col-sm-2 col-form-label">중국 결제자 조회</label>
									<div class="col-sm-10">
										<button type="button" class="btn btn-secondary btn-sm shadow-none" data-bs-toggle="modal" data-bs-target="#member-modal" id="member_search">결제자 조회</button>
									</div>
								</div>
								<div class="mb-2 row">
									<label for="orderName" class="col-sm-2 col-form-label">주문자명</label>
									<div class="col-sm-4">
									<input type="text" class="form-control" id="orderName" name="orderName" value="<?=$order_data['orderName']?>" autocomplete="off" required>
									</div>
								</div>
								<div class="mb-2 row">
									<label for="orderEmail" class="col-sm-2 col-form-label">이메일</label>
									<div class="col-sm-6">
									<input type="email" class="form-control" id="orderEmail" name="orderEmail" value="<?=$order_data['orderEmail']?>" autocomplete="off" required>
									</div>
								</div>
							</div>
						</div>
						
						<div class="card border mb-3">
							<h5 class="card-header bg-light">결제설정</h5>
							<div class="card-body p-2">
								<div class="mb-2 row">
									<label for="settle_count" class="col-sm-2 col-form-label">결제분할</label>
									<div class="col-sm-2">
										<div class="input-group">
											<input type="text" class="form-control" id="settle_count" name="settle_count" value="<?=$order_data['settle_count']?>">
											<div class="input-group-text">회</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						
						<div class="card border mb-3">
							<h5 class="card-header bg-light">결제이력</h5>
							<div class="table-responsive mt-3">
								<table class="table table-sm table-bordered">
									<thead class="table-light">
										<tr>
											<th class="text-center">회차</th>
											<th class="text-center">결제일</th>
											<th class="text-center">PG사</th>
											<th class="text-center">PG주문번호</th>
											<th class="text-center">결제수단</th>
											<th class="text-center">결제금액</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td></td>
											<td></td>
											<td></td>
											<td></td>
											<td></td>
											<td></td>
										</tr>
									</tbody>
									<tfoot>
										<tr>
											<th colspan="2" class="text-center">잔금합계</th>
											<td></td>
											<td></td>
											<td></td>
											<td></td>
										</tr>
									</tfoot>
								</table>
							</div>
						</div>
					</div>
					<div class="col-6">
						<div class="card">
							<h5 class="card-header bg-secondary text-white">주문상품 설정</h5>
							<div class="card-body p-0">
								<table class="table table-bordered table-centered mb-0 table-sm" id="invoice_goods">
									<colgroup>
										<col width="7%"/>
										<col width="*"/>
										<col width="8%" />
										<col width="10%" />
										<col width="15%" />
										<col width="10%"/>
									</colgroup>
									<thead class="table-light font-13">
										<tr>
											<th class="text-center">플랫폼</th>
											<th class="text-center">상품명</th>
											<th class="text-center">수량</th>
											<th class="text-center">판매가</th>
											<th class="text-center">합계</th>
											<th class="text-center">삭제</th>
										</tr>
									</thead>
									<tbody class="font-12">
									<?
										foreach($order_item_data as $order_item){
									?>
									<tr>
										<td class="text-center"><?=$order_item['platform']?></td>
										<td><?=$order_item['product_nm']?></td>
										<td><?=$order_item['qty']?></td>
										<td class="text-end"><?=number_format($order_item['price'])?></td>
										<td class="text-end"><?=number_format($order_item['qty']*$order_item['price'])?></td>
										<td></td>
									</tr>
									<?
										}
									?>
									</tbody>
								</table>
							</div>
							<div class="card-footer">
								<div class="row">
									<div class="col-10">
										<div class="input-group">
											<div class="col-3">
												<select class="form-select " id="search_platform" name="search_platform" required>
													<option value="" >::: 플랫폼 선택 :::</option>
													<option value="PS4" <?=$selected['search_platform']['PS4']?>>PS4</option>
													<option value="PS5" <?=$selected['search_platform']['PS5']?>>PS5</option>
													<option value="XB1" <?=$selected['search_platform']['XB1']?>>XB1</option>
													<option value="XBX" <?=$selected['search_platform']['XBX']?>>XBX</option>
													<option value="NSW" <?=$selected['search_platform']['NSW']?>>NSW</option>
													<option value="NSW" <?=$selected['search_platform']['NSW2']?>>NSW2</option>
												</select>
											</div>
											<div class="col-9"><input type="text" class="form-control" name="search_value" id="search_value" placeholder="검색할 상품명을 입력해 주세요" value=""></div>
										</div>
									</div>
									<div class="col-2">
										<div class="text-center">
											<button type="button" class="btn btn-dark shadow-none" id="btn_goods_search">상품검색</button>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div class="card border mb-3">
							<h5 class="card-header bg-light">주문정보</h5>
							<div class="card-body p-2">
								<div class="mb-2 row">
									<label for="settle_no" class="col-sm-2 col-form-label">결제번호</label>
									<div class="col-sm-4">
										<div class="input-group">
											<input type="text" class="form-control" id="settle_no" name="settle_no" value="<?=$order_data['settle_no']?>">
										</div>
									</div>
								</div>
								<div class="mb-2 row">
									<label for="ord_ymd" class="col-sm-2 col-form-label">주문일자</label>
									<div class="col-sm-4">
										<div class="input-group">
											<input type="text" class="form-control" id="ord_ymd" name="ord_ymd" value="<?=$order_data['ord_ymd']?>" >
										</div>
									</div>
								</div>
								<div class="mb-2 row">
									<label for="settle_price" class="col-sm-2 col-form-label">결제금액</label>
									<div class="col-sm-4">
										<div class="input-group">
											<input type="text" class="form-control" id="settle_price" name="settle_price" value="<?=$order_data['settle_price']?>" readonly>
										</div>
									</div>
								</div>
							</div>
						</div>
						
						<div class="card border mb-3">
							<h5 class="card-header bg-light">배송지 정보</h5>
							<div class="table-responsive mt-3">
								<table class="table table-sm table-bordered">
									<thead class="table-light">
										<tr>
											<th class="text-center">번호</th>
											<th class="text-center">이름</th>
											<th class="text-center">우편번호</th>
											<th class="text-center">주소</th>
											<th class="text-center">전화번호</th>
											<th class="text-center">수정</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td></td>
											<td></td>
											<td></td>
											<td></td>
											<td></td>
											<td></td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</form>
					
			</div><!-- /container-fluid -->
		</div><!-- /content -->
	</div><!-- /content-page -->

	<div id="member-modal" class="modal fade" tabindex="-1" role="dialog">
		<div class="modal-dialog modal-lg">
			<div class="modal-content">
				<div class="modal-header modal-colored-header bg-primary">
					<h4 class="modal-title" id="standard-modalLabel">중국 결제자 현황</h4>
					<button type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>
				<div class="modal-body">
					<div class="row">
						<div class="col-12">
							<table class="table table-centered w-100  nowrap table-sm table-bordered border-light" id="" cellpadding="0" cellpadding="0">
								<colgroup>
									<col width="10%"/>
									<col width="20%"/>
									<col width="*"/>
								</colgroup>
								<thead class="table-light">
									<tr>
										<th class="text-center">선택</th>
										<th class="text-center">이름</th>
										<th class="text-center">이메일</th>
									</tr>
								</thead>
								<tbody class="bg-white font-12">
								<?
									foreach($member_data as $member){
								?>
									<tr id="tr_<?=$member['idx']?>">
										<td class="text-center"><input type="radio" name="idx[]" value="<?=$member['idx']?>" data-name="<?=$member['name']?>" data-email="<?=$member['email']?>" ></td>
										<td class="text-start"><span name="name_<?=$member['idx']?>"><?=$member['name']?></span></td>
										<td class="text-start"><span name="email_<?=$member['idx']?>"><?=$member['email']?></span></td>
									</tr>
								<?		
									}
								?>
								</tbody>
							</table>
						</div>
					</div>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-dark shadow-none" id="btn_member_choice">선택완료</button>
				</div>
			</div>
		</div>
	</div>
	
	<!--주문상품 검색 팝업-->
	<div id="goods-modal" class="modal fade" tabindex="-1" role="dialog">
		<div class="modal-dialog modal-lg" style="max-width:1100px">
			<div class="modal-content">
				<div class="modal-header modal-colored-header bg-primary">
					<h4 class="modal-title" id="goods-modalLabel">주문상품 검색결과</h4>
					<button type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>
				<div class="modal-body p-0">
					<form class="form-horizontal">
						<table class="table table-striped table-border mb-0 table-sm" id="goods_info">
						<colgroup>
							<col width="10%"/>
							<col width="*"/>
							<col width="10%"/>
							<col width="10%"/>
							<col width="13%"/>
						</colgroup>
						<thead class="table-dark font-14">
						<tr>
							<th class="text-center">플랫폼</th>
							<th class="text-center">상품명</th>
							<th class="text-center">수량</th>
							<th class="text-center">판매가</th>
							<th class="text-center">합계</th>
						</tr>
						</thead>
						<tbody class="font-13">
						</tbody>
						</table>
					</form>
				</div>
			</div>
		</div>
	</div>
</div><!-- /wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>
$(document).ready(function(){
	$(document).on('hide.bs.modal', function () {
	  //모달이 꺼질때 모든 버튼 인풋 셀렉트 텍스트 에어리어의 포커스를 날린다.
		$('button, input, select, textarea').each(function () {
			$(this).blur();
		});
	});
	
	
	//중국 결제자 선택
	$(document).on('click', '#member-modal #btn_member_choice', function(e){
		e.preventDefault();
		var self = $('#member-modal input[name="idx[]"]:checked');
		
		if($('#member-modal input[name="idx[]"]').is(":checked")==false){
			alert("중국 결제자를 선택해 주세요.");
			$("#member-modal").modal('show');
		}else{
			var name = self.data('name');
			var email = self.data('email')
			
			$("#orderName").val(name);
			$("#orderEmail").val(email);
			$("#member-modal").modal('hide');
		}
	});
	
	$("#btn_goods_search").bind("click",function(){
		var search_platform = $("#search_platform option:selected").val();
		
		var search_value = $("#search_value").val();
		
		if(search_platform==""){
			alert("플랫폼을 선택해주세요.");
			return;
		}

		if(search_value==""){
			alert("검색할 상품명을 입력해주세요.");
			return;
		}
		$.ajax({
			 type: "POST",
			 url: "invoice_goods_ps.php",
			 data: {mode:"invoice_goods_search",search_value:search_value,search_platform:search_platform},
			 success: function (data, status) {
				$("#goods-modal #goods_info tbody").html(data);
				$("#goods-modal").modal('show');
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
	
	//상품 추가
	$(document).on('click', '#goods-modal .btn_goods_add', function(e){
		e.preventDefault();
		var index = $('.btn_goods_add').index(this);
		var platform = $("#goods-modal input[name='platform[]']").eq(index).val();
		var goods_nm = $("#goods-modal input[name='goods_nm[]']").eq(index).val();
		var qty = $("#goods-modal input[name='qty[]']").eq(index).val();
		var price = $("#goods-modal input[name='price[]']").eq(index).val();
		
		let inputContainer = document.getElementById('invoiceFrm');
		
		let newInput1 = document.createElement('input');
		let newInput2 = document.createElement('input');
		let newInput3 = document.createElement('input');
		let newInput4 = document.createElement('input');
		
		newInput1.type = 'hidden';
		newInput1.name = 'platform[]';
		newInput1.value = platform;
		inputContainer.appendChild(newInput1);
		
		newInput2.type = 'hidden';
		newInput2.name = 'goods_nm[]';
		newInput2.value = goods_nm;
		inputContainer.appendChild(newInput2);
		
		newInput3.type = 'hidden';
		newInput3.name = 'qty[]';
		newInput3.value = qty;
		inputContainer.appendChild(newInput3);

		newInput4.type = 'hidden';
		newInput4.name = 'price[]';
		newInput4.value = price;
		
		inputContainer.appendChild(newInput4);
		
		
		var html = "<tr><td>"+platform+"</td><td>"+goods_nm+"</td><td>"+qty+"</td><td class='text-end'>"+comma(price)+"</td><td class='text-end'>"+comma(qty*price)+"</td><td class='text-center'><button type='button' class='btn btn-sm btn-outline-secondary btn_goods_delete'>삭제</button></td></tr>";
		
		$("#invoice_goods tbody").append(html);
		 settlePrice();
		$("#goods-modal").modal('hide');
	});
	
	//주문상품 삭제
	$(document).on('click', '.btn_goods_delete', function(e){
		var index = $(".btn_goods_delete").index(this);
		//alert(index);
		$("#invoice_goods tbody tr").eq(index).remove();
		$("input[name='platform[]']").eq(index).remove();
		$("input[name='goods_nm[]']").eq(index).remove();
		$("input[name='qty[]']").eq(index).remove();
		$("input[name='price[]']").eq(index).remove();
		settlePrice();
	});
	
	//주문서 저장
	$("#btn_invoice_save").bind("click",function(){
		if($("#orderName").val()==""){
			alert("주문자명을 입력해 주세요.");
			return false;
		}
		
		if($("#orderEmail").val()==""){
			alert("주문자이메일을 입력해 주세요.");
			return false;
		}
		
		if($("#settle_price").val()=="0" || $("#settle_price").val()==""){
			alert("주문상품을 설정해 주세요.");
			return false;
		}
		$("#invoiceFrm").submit();
	});
});

	//총 결제금액
function settlePrice(){
	var settle_price = 0;
	$("#invoice_goods tbody tr").each(function(index){
		var ea = $("input[name='qty[]']").eq(index).val();
		var price = $("input[name='price[]']").eq(index).val();
		
		settle_price+=ea*price;
		console.log(index);
	});

	$("#settle_price").val(settle_price);
	console.log(settle_price);
}

function comma(str) {
	str = String(str);
	return str.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
}
 
//콤마풀기
function uncomma(str) {
	str = String(str);
	return str.replace(/[^\d]+/g, '');
}
</script>
</body>
</html>
