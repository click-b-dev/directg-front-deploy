<?php
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$mode  = filter_input(INPUT_GET, 'mode', FILTER_SANITIZE_STRING);
$sno   = filter_input(INPUT_GET, 'sno', FILTER_SANITIZE_STRING);
$param = filter_input(INPUT_GET, 'param', FILTER_SANITIZE_STRING);

if ($mode == "update") {
    $action = "수정";
} else {
    $action = "등록";
}

$topmenu['promotion'] = "active";
$page_title = "오프라인 쿠폰 {$action}";
$sidebar_file = "sidebar_promotion.php";

if (!$mode) {
    $mode = "register";
}

try {
    $pdo = new PDO($dsn_dgkr, DGKR_USER, DGKR_PASSWORD);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

    $AdminPromotion = new AdminPromotion($pdo);

    if ($mode == "update") {
        $offline_coupon_info = $AdminPromotion->getOfflineCouponInfo($sno);
    }
} catch (PDOException $e) {
    echo 'Error!: '.$e->getMessage();
    die();
}

$selected['code_type'][$offline_coupon_info['code_type']?:"DYNAMIC"] = "checked";
$selected['issuePerPersonLimitYn'][$offline_coupon_info['issuePerPersonLimitYn']=="Y"?"Y":"N"] = "checked";
$back_btn = "./offline_coupon_list.php".($param?"?".base64_decode($param):"");

include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php');
?>
<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
    <div class="wrapper">
    <?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_start.php'); ?>
        <div class="content-page">
            <!-- Start Content-->
            <div class="content">
                <div class="container-fluid">
                    <!-- start page title -->
                    <div class="row">
                        <div class="col-12">
                            <div class="page-title-box">
                                <div class="page-title-right">
                                    <ol class="breadcrumb m-0">
                                        <li class="breadcrumb-item"><a href="javascript: void(0);">홈</a></li>
                                        <li class="breadcrumb-item"><a href="javascript: void(0);">프로모션</a></li>
                                        <li class="breadcrumb-item"><a href="javascript: void(0);">오프라인 쿠폰 관리</a></li>
                                        <li class="breadcrumb-item active"><?=$page_title?></li>
                                    </ol>
                                </div>
                                <h4 class="page-title"><?=$page_title?></h4>
                            </div>
                        </div>
                    </div>
                    <!-- end page title -->
                    
                    <!-- start form -->
                    <form id="frm" name="frm" method="POST" action="./offline_coupon_ps.php" class="form-horizontal" enctype="multipart/form-data">
                        <input type="hidden" name="mode" value="<?=$mode?>">
                        <input type="hidden" name="sno" value="<?=$sno?>">

                        <div class="row">
                            <div class="col-8">
                                <div class="card border border-1">
                                    <div class="card-header bg-secondary text-white fw-bold font-15">오프라인 쿠폰 기본정보</div>
                                    <div class="card-body">
                                        <div class="mb-2 row">
                                            <label for="coupon_name" class="col-sm-2 col-form-label bg-light">* 쿠폰명</label>
                                            <div class="col-sm-6">
                                                <input type="text" id="coupon_name" name="coupon_name" class="form-control" value="<?=$offline_coupon_info['coupon_name']?>" required>
                                            </div>
                                        </div>
                                        <div class="mb-2 row">
                                            <label for="reason" class="col-sm-2 col-form-label bg-light">* 쿠폰 사유</label>
                                            <div class="col-sm-6">
                                                <input type="text" id="reason" name="reason" class="form-control" value="<?=$offline_coupon_info['reason']?>" required>
                                            </div>
                                        </div>
                                        <div class="mb-2 row">
                                            <label for="issueLimitCnt" class="col-sm-2 col-form-label bg-light">* 쿠폰 발행 수량</label>
                                            <div class="col-sm-2">
                                                <input type="number" id="issueLimitCnt" name="issueLimitCnt" class="form-control" value="<?=$offline_coupon_info['issueLimitCnt']?>" required>
                                            </div>
                                            <div class="col-sm-2 px-0 d-flex align-items-center">
                                                <span class="text-center">장</span>
                                            </div>
                                        </div>
                                        <div class="mb-2 row">
                                            <label for="sdate" class="col-sm-2 col-form-label bg-light">* 쿠폰 사용기간</label>
                                            <div class="col-sm-6">
                                                <div class="input-group">
                                                    <input type="datetime-local" id="sdate" name="sdate" class="form-control" value="<?=$offline_coupon_info['sdate']?>" required>
                                                    <span class="input-group-text">~</span>
                                                    <input type="datetime-local" id="edate" name="edate" class="form-control" value="<?=$offline_coupon_info['edate']?>" required>
                                                    <button type="button" class="bg-transparent border-0" onclick="$('#sdate').val('');$('#edate').val('')">
                                                        <i class="mdi mdi-delete-outline fs-4"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="mb-2 row">
                                            <label for="partner" class="col-sm-2 col-form-label bg-light">* 쿠폰 사용처</label>
                                            <div class="col-sm-6">
                                                <input type="text" id="partner" name="partner" class="form-control" value="<?=$offline_coupon_info['partner']?>" required>
                                            </div>
                                        </div>
                                        
                                    </div>

                                    <div class="card-header bg-secondary text-white fw-bold font-15">오프라인 쿠폰 발급정보</div>
                                    <div class="card-body">
                                        <div class="mb-2 row">
                                            <label for="coupon_name" class="col-sm-2 col-form-label bg-light">* 발급 유형</label>
                                            <div class="col-sm-6 mt-1">
                                                <div class="form-check form-check-inline">
                                                    <input type="radio" id="code_type2" name="code_type" class="form-check-input" value="STATIC" <?=$selected['code_type']['STATIC']?> required <?=($mode=="update")?"disabled":""?>>
                                                    <label class="form-check-label" for="code_type2">지정코드 발급</label>
                                                </div>
                                                <div class="form-check form-check-inline">
                                                    <input type="radio" id="code_type3" name="code_type" class="form-check-input" value="DYNAMIC" <?=$selected['code_type']['DYNAMIC']?> required <?=($mode=="update")?"disabled":""?>>
                                                    <label class="form-check-label" for="code_type3">난수코드 발급</label>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="mb-2 row">
                                            <label for="promotion_code" class="col-sm-2 col-form-label bg-light"><span id="req_mark">*</span> 프로모션코드</label>
                                            <div class="col-sm-6">
                                                <input type="text" id="promotion_code" name="promotion_code" class="form-control" value="<?=$offline_coupon_info['promotion_code']?>" required>
                                            </div>
                                        </div>
                                        <div class="mb-2 row">
                                            <label for="coupon_name" class="col-sm-2 col-form-label bg-light">* 인당 발급 제한</label>
                                            <div class="col-sm-6 mt-1">
                                                <div class="form-check form-check-inline">
                                                    <input type="radio" id="issuePerPersonLimitYn2" name="issuePerPersonLimitYn" class="form-check-input limit-radio" value="Y" <?=$selected['issuePerPersonLimitYn']['Y']?> required>
                                                    <label class="form-check-label" for="issuePerPersonLimitYn2">발급 무제한</label>
                                                </div>
                                                <div class="form-check form-check-inline">
                                                    <input type="radio" id="issuePerPersonLimitYn3" name="issuePerPersonLimitYn" class="form-check-input limit-radio" value="" <?=$selected['issuePerPersonLimitYn']['N']?> required>
                                                    <label class="form-check-label" for="issuePerPersonLimitYn3">발급 제한</label>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="mb-2 row limit-fields">
                                            <label for="issuePerPersonLimitCnt" class="col-sm-2 col-form-label bg-light">기간전체 발급제한</label>
                                            <div class="col-sm-2">
                                                <input type="number" id="issuePerPersonLimitCnt" name="issuePerPersonLimitCnt" class="form-control" value="<?=$offline_coupon_info['issuePerPersonLimitCnt']?:1?>" min="1">
                                            </div>
                                            <div class="col-sm-2 px-0 d-flex align-items-center">
                                                <span class="text-center">장</span>
                                            </div>
                                        </div>
                                        <div class="mb-2 row limit-fields">
                                            <label for="dailyIssuePerPersonLimitCnt" class="col-sm-2 col-form-label bg-light">1일 발급제한</label>
                                            <div class="col-sm-2">
                                                <input type="number" id="dailyIssuePerPersonLimitCnt" name="dailyIssuePerPersonLimitCnt" class="form-control" value="<?=$offline_coupon_info['dailyIssuePerPersonLimitCnt']?>">
                                            </div>
                                            <div class="col-sm-2 px-0 d-flex align-items-center">
                                                <span class="text-center">장</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="card-header bg-secondary text-white fw-bold font-15">오프라인 쿠폰 포인트설정</div>
                                    <div class="card-body">
                                        <div class="mb-2 row">
                                            <label for="coupon_price" class="col-sm-2 col-form-label bg-light">* 포인트</label>
                                            <div class="col-sm-2">
                                                <input type="number" id="coupon_price" name="coupon_price" class="form-control" value="<?=$offline_coupon_info['coupon_price']?>" required>
                                            </div>
                                            <div class="col-sm-2 px-0 d-flex align-items-center">
                                                <span class="text-center">원</span>
                                            </div>
                                        </div>
                                    </div>
                                    <!-- end card-body-->
                                </div>
                                <div class="col-2 mx-auto mb-2">
                                    <a href="<?=$back_btn?>" class="btn btn-secondary shadow-none">목록</a>
                                    <button type="submit" class="btn btn-primary shadow-none"><?=$action?></button>
                                </div>
                            </div>
                        </div>
                    </form>
                    <!-- end form -->
                </div>
            </div>
            <!-- content -->
        </div>
    </div> <!-- /wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>
</body>
</html>
<script type="text/javascript">
    $(document).ready(function() {
        function togglePromotionRequired() {
            var selectedValue = $('input[name="code_type"]:checked').val();
            
            if (selectedValue === 'STATIC') {
                $('#promotion_code').prop('required', true);
                $('#req_mark').text('*').show();
            } else {
                $('#promotion_code').prop('required', false);
                $('#req_mark').text('').hide();
            }
        }

        // 라디오 버튼 클릭 이벤트
        $(document).on('change', 'input[name="code_type"]', function() {
            togglePromotionRequired();
        });

        // 초기 실행
        togglePromotionRequired();

        function toggleLimitFields() {
            var selectedValue = $('input[name="issuePerPersonLimitYn"]:checked').val();
            
            if (selectedValue === "") {
                // 발급 제한일 때 보여줌
                $('.limit-fields').show();
                // $('.limit-fields input').prop('required', true);
            } else {
                // 무제한일 때 숨김
                $('.limit-fields').hide();
                // $('.limit-fields input').val('').prop('required', false); // 값 초기화가 필요하다면 주석 해제
            }
        }

        // 라디오 변경 이벤트
        $(document).on('change', 'input[name="issuePerPersonLimitYn"]', function() {
            toggleLimitFields();
        });

        // 초기 로드 시 실행
        toggleLimitFields();
    });
</script>