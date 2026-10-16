<?php
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$page         = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_type  = filter_input(INPUT_GET, 'search_type', FILTER_SANITIZE_STRING);
$search_value = trim(filter_input(INPUT_GET, 'search_value', FILTER_SANITIZE_STRING));

$topmenu['goods'] = "active";
$page_title = "공급처 설정";
$sidebar_file = "sidebar_goods.php";

// 검색필터 페이지네이션 적용
foreach ($_GET as $key => $value) {
    if ($key <> "page") {
        if ($value <> "") {
            $param .= "&".$key."=".$value;
        }
    }
}

if (!$page) {
    $page = 1;
}

$where = [];
$add_where = "";

$where[] = " is_view = 'Y'";

if ($search_value) {
    $where[] = " {$search_type} LIKE '%{$search_value}%'";
}

foreach ($where as $value) {
	$add_where .= " AND {$value}";
}

$orderby = " publisher_name ASC";

try {
	$pdo = new PDO($dsn, DB_USER, DB_PASSWORD);
	$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);
	
	$Admin= new Admin($pdo);
	
	$publisher_list = $Admin->getPublisherList($page, $add_where, $orderby, $param);
} catch (PDOException $e) {
	echo 'Error!: '.$e->getMessage();
	die();  
}

$selected['search_type'][$search_type] = "selected";

include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php');
?>
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
					
					<!-- 검색필터 start -->
                    <div class="row">
                        <div class="col-12">
                            <div class="card">
                                <h5 class="card-header bg-secondary text-white">검색필터</h5>
                                <div class="card-body">
                                    <form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
                                        <div class="row mb-2">
                                            <div class="col-lg-6">
                                                <div class="input-group row">
                                                    <label for="" class="col-sm-3 col-form-label bg-light border">공급처명</label>
                                                    <div class="col-sm-3 d-none">
                                                        <select class="form-control" name="search_type" id="search_type">
                                                            <option value="publisher_name" <?=$selected['search_type']['publisher_name']?>>공급처명</option>
                                                        </select>
                                                    </div>
                                                    <div class="col-sm-6">
                                                        <input type="text" class="form-control" id="search_value" name="search_value" placeholder="검색어" value="<?=$search_value?>">
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="row">
                                            <div class="col-lg-12">
                                                <div class="float-end">
                                                    <button type="submit" class="btn btn-primary shadow-none">검색</button>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- 검색필터 end -->

					<div class="d-flex flex-row justify-content-between mb-2 align-items-center">
                        <div class="float-start text-center"><?=number_format($publisher_list->total_results)?> 개</div>
					<?php
						if ($_SESSION['admin']['admin_level'] == "99") {
					?>
						<div class="float-end"><button type="button" class="btn btn-danger shadow-none" data-bs-toggle="modal" data-bs-target="#publisher-modal">공급처 등록</button></div>
					<?php
						}
					?>
                    </div>

					<div class="row">
						<div class="col-12 table-responsive">
							<table class="table table-hover table-centered w-100 nowrap table-sm table-bordered border-light">
								<colgroup>
								<col width="5%"/>
								<col width="5%"/>
								<col width="15%"/>
								<col width="5%"/>
								<col width="20%"/>
								<col width="*"/>
								<col width="5%"/>
								</colgroup>
								<thead class="table-light font-13">
									<tr>
										<th class="text-center">번호</th>
										<th class="text-center">공급처코드</th>
										<th class="text-center">공급처명</th>
										<th class="text-center">사용여부</th>
										<th class="text-center">공급처 홈페이지</th>
										<th class="text-center">공급처 로고 이미지</th>
										<th class="text-center">옵션상품수</th>
									</tr>
								</thead>
								<tbody class="font-12 bg-white">
								<?php
									if ($publisher_list->success == true) {
										$result = $publisher_list->resultset->fetchAll();
										$num=0;

										foreach ($result as $value) {
								?>
									<tr>
										<td class="text-center"><?=$publisher_list->total_results-($page-1)*30-$num?></td>
										<td class="text-center"><?=$value['publisher_code']?></td>
										<td><?=$value['publisher_name']?></td>
										<td class="text-center"><?=$value['is_view']?></td>
										<td class="text-start">
											<a href="<?=$value['publisher_site']?>" target="_blank"><?=$value['publisher_site']?></a>
										</td>
										<td class="text-center">
											<?php if($value['publisher_image']){ ?>
											<img src="<?=$value['publisher_image']?>" class="w-100">
											<?php } ?>
										</td>
										
										<td class="text-end"><?=$Admin->getPublisherGoodsItemCount($value['publisher_code'])?></td>
									</tr>
								<?php
											$num++;
										}
									}
								?>
								</tbody>
							</table>
							<div class="text-center mt-3"><?echo $publisher_list->links_html;?></div>
						</div>
						<!-- end col -->
					</div>
					<!-- end row -->   
				</div><!-- /container-fluid -->
			</div><!-- /content -->
		</div><!-- /content-page -->
	</div><!-- /wrapper -->
<?php
	if ($_SESSION['admin']['admin_level'] == "99") {
?>
	<div id="publisher-modal" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header modal-colored-header bg-secondary">
					<h5 class="modal-title" id="publisherModalLabel">공급처 등록</h5>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-hidden="true"></button>
				</div>
				<div class="modal-body">
					<div class="mb-2 row">
						<label for="" class="col-sm-3 col-form-label bg-light">공급처코드</label>
						<div class="col-sm-9 d-flex align-items-center">
							<!-- <input type="text" id="publisher_code" name="publisher_code" class="form-control"  value="" required> -->
							<span class="text-center">등록시 자동으로 생성</span>
						</div>
					</div>
					<div class="mb-2 row">
						<label for="publisher_name" class="col-sm-3 col-form-label bg-light">공급처명 *</label>
						<div class="col-sm-9">
							<input type="text" id="publisher_name" name="publisher_name" class="form-control"  value="">
						</div>
					</div>
					<div class="mb-2 row">
						<label for="publisher_link" class="col-sm-3 col-form-label bg-light">공급처 홈페이지</label>
						<div class="col-sm-9">
							<input type="text" id="publisher_link" name="publisher_link" class="form-control"  value="">
						</div>
					</div>
					<div class="mb-2 row">
						<label for="publisher_logo" class="col-sm-3 col-form-label bg-light">공급처 로고 이미지</label>
						<div class="col-sm-9">
							<input type="text" id="publisher_logo" name="publisher_logo" class="form-control"  value="">
						</div>
					</div>

					<div class="mb-2 text-center">
						<button class="btn btn-primary shadow-none" type="button" onclick="registerPublisher()">공급처 등록</button>
					</div>
				</div>
			</div><!-- /.modal-content -->
		</div><!-- /.modal-dialog -->
	</div><!-- /.modal -->
<?php
	}
?>
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>
</body>
</html>
<script>
	function registerPublisher() {
		let publisher_name = $("#publisher_name").val();
		let publisher_link = $("#publisher_link").val();
		let publisher_logo = $("#publisher_logo").val();

		if (!publisher_name) {
			alert("공급처명을 입력해주세요.");
			$("#publisher_name").focus();
			return;
		}

		$.ajax({
			type: "POST",
			url: "./publisher_ps.php",
			data: {
				mode: "register",
				publisher_name: publisher_name,
				publisher_link: publisher_link,
				publisher_logo: publisher_logo
			},
			dataType: 'json',
			success: function (data) {
				if (data.success) {
					alert(data.message);
					location.reload();
				} else {
					alert(data.message);
				}
			},
			error: function (data) {
				alert(data.message);
			}
		});
	}
</script>