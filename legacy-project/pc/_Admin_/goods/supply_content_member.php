<?
$page_title="회원별 제공컨텐츠 조회";

header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$search_key = filter_input(INPUT_GET, 'search_key', FILTER_SANITIZE_STRING);
$search_value = filter_input(INPUT_GET, 'search_value', FILTER_SANITIZE_EMAIL);

$where = [];
$param = "";

try  {
		$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
		$adminGoods= new AdminGoods($conn); 
		
		if($search_value){
			switch($search_key){
				case "m_no":
					/*
					$query= "call sp_supply_goods_chk3(:m_no,@Result)";
					$stmt = $conn->prepare($query);
					$params = array(
						":m_no" => $searchValue,
					);
					$stmt->execute($params);
					$supply_content_member = $stmt->fetchAll();
					*/
				break;
				case "search_m_id":
					$m_query= "select m_no from directgames.tbl_member where m_id=:m_id";
					$stmt = $conn->prepare($m_query);
					$params = array(
						":m_id" => $search_value,
					);
					$stmt->execute($params);
					$m_no = $stmt->fetchColumn();

					if($search_value){
						if($m_no>'0'){
							$query= "call directgames.sp_supply_goods_chk4(:m_no,@Result)";
							$stmt = $conn->prepare($query);
							$params = array(
								":m_no" => $m_no,
							);
							$stmt->execute($params);
							$supply_content_member = $stmt->fetchAll();
						}
						
						$query= "call sp_supply_content_chk(:m_id,@Result)";
						$stmt = $conn->prepare($query);
						$params = array(
							":m_id" => $search_value,
						);
						$stmt->execute($params);
						$supply_content_list_v2= $stmt->fetchAll();
						
						//제공 컨텐츠 내역정보 통합
						$arr_all = array_merge($supply_content_member, $supply_content_list_v2);
						
						array_multisort(array_column($arr_all, 'supply_content'), SORT_DESC,$arr_all, SORT_DESC);
						
						
						$arr_tmp = array_column($arr_all, 'supply_content');
						$arr_tmp = array_unique($arr_tmp);
						
						$arr_all = array_intersect_key($arr_all, $arr_tmp);
						$supply_content_list_all = array_values($arr_all);
					}
					
				break;
			}
		}
	}catch (PDOException $e){  
		echo 'Error!: '.$e->getMessage();  
		die();  
	}

$patch_auth = array(
	"1"=> array(
		"encode_type"=>"base64",
		"prefix_text"=>"DO2_H2->"
	),
	"14"=> array(
		"encode_type"=>"md5",
		"prefix_text"=>"PREY-H2-PROJECT:"
	),
	"3"=> array(
		"encode_type"=>"md5",
		"prefix_text"=>"DO2_DLC_1-H2-PROJECT:"
	),
	"9"=> array(
		"encode_type"=>"md5",
		"prefix_text"=>"Wolfen2-H2-PROJECT:"
	),
	"13"=> array(
		"encode_type"=>"md5",
		"prefix_text"=>"PREY-DLC1-H2-PROJECT:"
	),
	"15"=> array(
		"encode_type"=>"md5",
		"prefix_text"=>"PREY-DELUXE-H2-PROJECT:"
	),
);
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">제공컨텐츠 관리</a></li>
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
						<h5 class="card-header bg-secondary text-white">회원검색</h5>
						<div class="card-body py-2">
							<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
								<div class="row mb-2">
									<div class="col-lg-6">
										<div class="input-group row">
											<select class="form-select col-sm-3" name="search_key" id="search_key">
												<option value="search_m_id" <?=$selected['search_key']['search_m_id']?>>회원아이디</option>
												<!--<option value="search_m_no" <?=$selected['search_key']['search_m_no']?>>회원고유번호</option>-->
											</select>
											<div class="col-sm-9">
												<input type="text" class="form-control" id="search_value" name="search_value" placeholder="검색어" value="<?=$search_value?>">
											</div>
										</div>
									</div>
									<div class="col-lg-6">
										<div class="float-end">
											<button type="submit" class="btn btn-primary shadow-none">회원 조회</button>
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
							<h5 class="card-header bg-secondary text-white">제공컨텐츠 현황</h5>
							<div class="card-body p-0">
								<div class="table-responsive">
									<table class="table table-centered w-100 nowrap table-sm table-bordered" id="">
										<colgroup>
											<col width="3%"/>
											<col width="5%"/>
											<col width="20%"/>
											<col width="*"/>
											<col width="5%"/>
											<col width="5%"/>
										</colgroup>
										<thead class="table-light font-13">
											<tr>
												<th class="text-center">번호</th>
												<th class="text-center">제공컨텐츠 유형</th>
												<th class="text-center">제공 컨텐츠명</th>
												<th class="text-center">제공 컨텐츠 URL</th>
												<th class="text-center">암호화 여부</th>
												<th class="text-center">암호화 방식</th>
											</tr>
										</thead>
										<tbody class="font-12">
										<?
											$num="1";
											foreach($supply_content_list_all as $sub_value){
										?>
										<tr>
											<td class="text-center"><?=$num++?></td>
											<td class="text-center"><?=($sub_value['supply_content_type']=="P")?"한글패치":"컨텐츠"?></td>
											<td><?=$sub_value['supply_content']?></td>
											<td><?=$sub_value['supply_content_url']?></td>
											<td class="text-center"><?=$sub_value['is_encode']?></td>
											<td class="text-center"><?=$sub_value['encode_type']?></td>
										</tr>
										<?
												if($sub_value['is_encode']=="Y"){
											?>
											<tr>
												<th class="text-center bg-light" colspan="2">한글패치 인증정보</th>
												<td colspan="4">
													<div class="d-flex flex-row align-items-center">
														<div class="me-2"><strong>아이디</strong>: <?=$search_value?></div>
														<div class="me-2"><strong>비밀번호</strong>: <span class="enc_data<?=$num?>"><?=$adminGoods->patchEncDataAdmin($search_value,$patch_auth[$sub_value['idx']]['prefix_text'],$sub_value['encode_type'])?></span></div>
														<div class="me-2"><button type="button" class="btn btn-secondary btn-sm btn_clipboard shadow-none" data-clipboard-target=".enc_data<?=$num?>">비밀번호 복사</button></div>
													</div>
												</td>
											</tr>
											<?
												}
											?>
										<?
											}
										?>
										</tbody>
									</table>
								</div>

							</div> <!-- end card-body-->
						</div> <!-- end card-->
					</div> <!-- end col -->
				</div>
				
			</div> <!-- container -->

		</div> <!-- content -->


	</div>

</div>
<!-- END wrapper -->

<script>
$(document).ready(function(){

});
</script>
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>
</body>
</html>
