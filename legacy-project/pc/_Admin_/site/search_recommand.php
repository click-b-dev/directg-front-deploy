<?
$sidebar_file = "sidebar_site.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['site'] = "active";
$page_title="추천 검색어 관리";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_keyword = filter_input(INPUT_GET, 'search_keyword', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
}

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

	$adminSite= new AdminSite($conn);

	//노출 슬롯(sort 1~4) - 슬롯번호 = recommand_sort
	$slot_stmt = $conn->query("select * from tbl_search_recommand where is_del='N' and is_view='Y' order by recommand_sort asc, idx asc");
	$slot_data = $slot_stmt->fetchAll();

	$slots = array(1=>null,2=>null,3=>null,4=>null);
	foreach($slot_data as $r){
		$s = (int)$r['recommand_sort'];
		if($s>=1 && $s<=4 && $slots[$s]===null){
			$slots[$s] = $r;
		}
		//슬롯(1~4) 밖이거나 중복인 노출건은 하단 목록에 노출(슬롯밖)으로 표시됨
	}

	//슬롯에 매핑된 idx (하단 목록 제외용)
	$slot_ids = array();
	foreach($slots as $s){ if($s){ $slot_ids[] = (int)$s['idx']; } }

	//하단: 슬롯에 없는 나머지(비노출 보관 + 노출 슬롯밖) 목록
	$where = array();
	$where[] = " is_del='N'";
	if(count($slot_ids)>0){
		$where[] = " idx not in (".implode(",",$slot_ids).")";
	}
	if($search_keyword){
		$where[] = " keyword like '%".$search_keyword."%'";
	}

	$add_where = "";
	foreach($where as $value){
		$add_where.= " and ".$value;
	}

	foreach($_GET as $key=>$value){
		if($key<>"page" ){
			if($value<>""){
				$param.="&".$key."=".$value;
			}
		}
	}

	$orderby = "is_view desc, recommand_sort asc, idx desc";

	$rest_list = $adminSite->getSearchRecommandList($page,$add_where,$orderby,$param);

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
										<li class="breadcrumb-item"><a href="javascript: void(0);">사이트</a></li>
										<li class="breadcrumb-item active"><?=$page_title?></li>
									</ol>
								</div>
								<h4 class="page-title"><?=$page_title?></h4>
							</div>
						</div>
					</div>
					<!-- end page title -->

					<!-- 노출 슬롯 4칸 -->
					<div class="card">
						<h5 class="card-header bg-secondary text-white">유저페이지 노출 (4칸 고정)</h5>
						<div class="card-body">
							<div class="row g-2">
								<?
									foreach($slots as $n=>$slot){
								?>
								<div class="col-md-3">
									<div class="card h-100 border <?=$slot ? 'border-success' : 'border-secondary'?>">
										<div class="card-header py-1 text-center fw-bold <?=$slot ? 'bg-success text-white' : 'bg-light'?>">추천 검색어 <?=$n?></div>
										<div class="card-body p-2 d-flex flex-column justify-content-between">
											<?if($slot){?>
												<div class="mb-2">
													<div class="fw-bold mb-1 text-center font-14"><?=$slot['keyword']?></div>
													<div class="font-11 text-center mb-1">클릭수 : <?=number_format($slot['click_count'])?></div>
													<div class="font-12" style="word-break:break-all;">
														<?if($slot['link_url']){?>
															<a href="<?=$slot['link_url']?>" target="_blank"><?=$slot['link_url']?></a>
														<?}else{?>
															<a href="/game/game_search_thumb.html?q=<?=$slot['keyword']?>" target="_blank" class="text-muted">/game/game_search_thumb.html?q=<?=$slot['keyword']?></a>
														<?}?>
													</div>
												</div>
												<div>
													<div class="d-grid mb-2">
														<button class="btn btn-sm btn-primary shadow-none btn_slot_register" data-slot="<?=$n?>">+ 등록</button>
													</div>
													<div class="d-flex gap-2">
														<button class="btn btn-sm btn-success shadow-none flex-fill btn_slot_edit" data-idx="<?=$slot['idx']?>" data-keyword="<?=htmlspecialchars($slot['keyword'],ENT_QUOTES)?>" data-link="<?=htmlspecialchars($slot['link_url'],ENT_QUOTES)?>">수정</button>
														<button class="btn btn-sm btn-danger shadow-none flex-fill btn_slot_clear" data-idx="<?=$slot['idx']?>">비우기</button>
													</div>
												</div>
											<?}else{?>
												<div class="text-muted my-3 text-center">(비어있음)</div>
												<div class="d-grid">
													<button class="btn btn-sm btn-primary shadow-none btn_slot_register" data-slot="<?=$n?>">+ 등록</button>
												</div>
											<?}?>
										</div>
									</div>
								</div>
								<?
									}
								?>
							</div>
						</div>
					</div>

					<!-- 검색어 (보관/관리) -->
					<div class="card">
						<h5 class="card-header bg-secondary text-white">검색어</h5>
						<div class="card-body">
							<form class="form-horizontal mb-2" method="get" action="<?=$_SERVER['PHP_SELF']?>">
								<div class="row">
									<div class="col-lg-6">
										<div class="input-group">
											<input type="text" class="form-control" id="search_keyword" name="search_keyword" placeholder="검색어로 찾기" value="<?=$search_keyword?>">
											<button type="submit" class="btn btn-primary shadow-none">검색</button>
										</div>
									</div>
								</div>
							</form>

							<div class="font-12 mb-2"><? echo number_format($rest_list->total_results)?> 개</div>

							<div class="table-responsive">
								<table class="table table-centered w-100 nowrap table-sm table-bordered border-light">
									<colgroup>
										<col width="25%"/>
										<col width="*"/>
										<col width="10%"/>
										<col width="30%"/>
									</colgroup>
									<thead class="table-primary font-13">
										<tr>
											<th class="text-center">추천검색어</th>
											<th class="text-center">링크 URL</th>
											<th class="text-center">클릭수</th>
											<th class="text-center">슬롯 지정 / 관리</th>
										</tr>
									</thead>
									<tbody class="bg-white font-12">
									<?
										if($rest_list->success == true){
											$result = $rest_list->resultset->fetchAll();

											foreach($result as $value){
									?>
										<tr>
											<td class="text-center"><?=$value['keyword']?></td>
											<td class="text-start px-1">
												<?if($value['link_url']){?>
													<a href="<?=$value['link_url']?>" target="_blank"><?=$value['link_url']?></a>
												<?}else{?>
													<a href="/game/game_search_thumb.html?q=<?=$value['keyword']?>" target="_blank" class="text-muted">검색결과 자동(/game/game_search_thumb.html?q=<?=$value['keyword']?>)</a>
												<?}?>
											</td>
											<td class="text-center"><?=number_format($value['click_count'])?></td>
											<td class="text-center">
												<div class="d-flex flex-row justify-content-center align-items-center">
													<select class="form-select form-select-sm w-auto me-1 slot_select">
														<option value="1">추천 검색어 1</option>
														<option value="2">추천 검색어 2</option>
														<option value="3">추천 검색어 3</option>
														<option value="4">추천 검색어 4</option>
													</select>
													<button class="btn btn-success btn-sm shadow-none btn_assign me-1" data-idx="<?=$value['idx']?>">노출</button>
													<button class="btn btn-info btn-sm shadow-none btn_slot_edit me-1" data-idx="<?=$value['idx']?>" data-keyword="<?=htmlspecialchars($value['keyword'],ENT_QUOTES)?>" data-link="<?=htmlspecialchars($value['link_url'],ENT_QUOTES)?>">수정</button>
													<button class="btn btn-danger btn-sm shadow-none btn_delete" data-idx="<?=$value['idx']?>">삭제</button>
												</div>
											</td>
										</tr>
									<?
											}
										}
									?>
									</tbody>
								</table>
							</div>

							<div class="text-center mt-3"><?echo $rest_list->links_html;?></div>
						</div>
					</div>

				</div> <!-- container -->
			</div> <!-- content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->

<!-- 슬롯 등록/수정 모달 -->
<div class="modal fade" id="slotModal" tabindex="-1" aria-hidden="true">
	<div class="modal-dialog">
		<div class="modal-content">
			<form id="slotForm" method="post" action="search_recommand_ps.php">
				<input type="hidden" name="mode" id="slot_mode" value="">
				<input type="hidden" name="slot" id="slot_no" value="">
				<input type="hidden" name="idx" id="slot_idx" value="">
				<div class="modal-header">
					<h5 class="modal-title" id="slotModalLabel">추천검색어 등록</h5>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				<div class="modal-body">
					<div class="mb-3">
						<label for="modal_keyword" class="form-label">* 추천검색어</label>
						<input type="text" class="form-control" id="modal_keyword" name="keyword" placeholder="추천검색어" required>
					</div>
					<div class="mb-3">
						<label for="modal_link_url" class="form-label">링크 URL</label>
						<input type="text" class="form-control" id="modal_link_url" name="link_url" placeholder="비우면 검색결과로 자동 연결 (/game/game_search_thumb.html?q=검색어)">
					</div>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-secondary shadow-none" data-bs-dismiss="modal">취소</button>
					<button type="submit" class="btn btn-primary shadow-none">저장</button>
				</div>
			</form>
		</div>
	</div>
</div>

	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>
$(document).ready(function(){
	//슬롯 등록/교체 (모달 - 새 검색어 입력)
	$(".btn_slot_register").bind("click",function(){
		var slot = $(this).attr("data-slot");
		$("#slot_mode").val("slot_register");
		$("#slot_no").val(slot);
		$("#slot_idx").val("");
		$("#modal_keyword").val("");
		$("#modal_link_url").val("");
		$("#slotModalLabel").text("추천 검색어 "+slot+" 등록");
		$("#slotModal").modal('show');
	});

	//슬롯 검색어 내용수정 (모달)
	$(".btn_slot_edit").bind("click",function(){
		$("#slot_mode").val("modify");
		$("#slot_no").val("");
		$("#slot_idx").val($(this).attr("data-idx"));
		$("#modal_keyword").val($(this).attr("data-keyword"));
		$("#modal_link_url").val($(this).attr("data-link"));
		$("#slotModalLabel").text("추천검색어 수정");
		$("#slotModal").modal('show');
	});

	//슬롯 비우기 (노출해제, 보관)
	$(".btn_slot_clear").bind("click",function(){
		var idx = $(this).attr("data-idx");
		if(confirm("이 슬롯을 비우시겠습니까? (검색어는 비노출 목록으로 이동)")){
			$.ajax({
				type:"POST", url:"search_recommand_ps.php",
				data:{mode:"slot_clear",idx:idx},
				success:function(d){ location.reload(); },
				error:function(d){ alert(d); }
			});
		}
	});

	//비노출 검색어를 슬롯에 노출
	$(".btn_assign").bind("click",function(){
		var idx = $(this).attr("data-idx");
		var slot = $(this).closest("td").find(".slot_select").val();
		if(confirm("슬롯 "+slot+"에 노출하시겠습니까? (해당 슬롯의 기존 검색어는 비노출 처리)")){
			$.ajax({
				type:"POST", url:"search_recommand_ps.php",
				data:{mode:"slot_assign",idx:idx,slot:slot},
				success:function(d){ location.reload(); },
				error:function(d){ alert(d); }
			});
		}
	});

	//완전삭제
	$(".btn_delete").bind("click",function(){
		var idx = $(this).attr("data-idx");
		if(confirm("해당 추천검색어를 완전히 삭제하시겠습니까?")){
			$.ajax({
				type:"POST", url:"search_recommand_ps.php",
				data:{mode:"delete",idx:idx},
				success:function(d){ location.reload(); },
				error:function(d){ alert(d); }
			});
		}
	});
});
</script>
</body>
</html>
