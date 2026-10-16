<?php
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$mode           = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$sno            = filter_input(INPUT_POST, 'sno', FILTER_SANITIZE_NUMBER_INT);
$coupon_name    = filter_input(INPUT_POST, 'coupon_name', FILTER_SANITIZE_STRING);
$reason         = filter_input(INPUT_POST, 'reason', FILTER_SANITIZE_STRING);
$issueLimitCnt  = filter_input(INPUT_POST, 'issueLimitCnt', FILTER_SANITIZE_NUMBER_INT);
$sdate          = filter_input(INPUT_POST, 'sdate', FILTER_SANITIZE_STRING);
$edate          = filter_input(INPUT_POST, 'edate', FILTER_SANITIZE_STRING);
$partner        = filter_input(INPUT_POST, 'partner', FILTER_SANITIZE_STRING);
$code_type      = filter_input(INPUT_POST, 'code_type', FILTER_SANITIZE_STRING);
$coupon_price   = filter_input(INPUT_POST, 'coupon_price', FILTER_SANITIZE_NUMBER_INT);
$promotion_code = filter_input(INPUT_POST, 'promotion_code', FILTER_SANITIZE_STRING);
$issuePerPersonLimitYn = filter_input(INPUT_POST, 'issuePerPersonLimitYn', FILTER_SANITIZE_STRING);
$issuePerPersonLimitCnt = filter_input(INPUT_POST, 'issuePerPersonLimitCnt', FILTER_SANITIZE_NUMBER_INT);
$dailyIssuePerPersonLimitCnt = filter_input(INPUT_POST, 'dailyIssuePerPersonLimitCnt', FILTER_SANITIZE_NUMBER_INT);

try {
    $pdo = new PDO($dsn_dgkr, DGKR_USER, DGKR_PASSWORD);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

    switch ($mode) {
        case "register" :
            $qry = "INSERT INTO tbl_offline_coupon
                    SET
                        `coupon_name`   = :coupon_name,
                        `reason`        = :reason,
                        `issueLimitCnt` = :issueLimitCnt,
                        `sdate`         = :sdate,
                        `edate`         = :edate,
                        `partner`       = :partner,
                        `code_type`     = :code_type,
                        `coupon_price`  = :coupon_price,
                        `promotion_code`        = :promotion_code,
                        `issuePerPersonLimitYn` = :issuePerPersonLimitYn,
                        `issuePerPersonLimitCnt` = :issuePerPersonLimitCnt,
                        `dailyIssuePerPersonLimitCnt` = :dailyIssuePerPersonLimitCnt,
                        `currency`      = '원',
                        `status`        = 1,
                        `regdt`         = NOW()";
            $param = array(
                'coupon_name' => $coupon_name,
                'reason' => $reason,
                'issueLimitCnt' => $issueLimitCnt,
                'sdate' => $sdate,
                'edate' => $edate,
                'partner' => $partner,
                'code_type' => $code_type,
                'coupon_price' => $coupon_price,
                'promotion_code' => $promotion_code,
                'issuePerPersonLimitYn' => $issuePerPersonLimitYn?:NULL,
                'issuePerPersonLimitCnt' => $issuePerPersonLimitCnt,
                'dailyIssuePerPersonLimitCnt' => $dailyIssuePerPersonLimitCnt
            );
            $stmt = $pdo->prepare($qry);
            $stmt->execute($param);

            $coupon_sno = $pdo->lastInsertId();

            if ($coupon_sno) {
                $AdminPromotion = new AdminPromotion($pdo);
				//수량만큼 쿠폰번호 생성후 발급
				$AdminPromotion->setPaperCoupon($coupon_sno, $issueLimitCnt, $code_type, $promotion_code);

                echo "<script>alert('저장되었습니다.')</script>";
            } else {
                echo "<script>alert('error')</script>";
            }

            go($_SERVER['HTTP_REFERER']);
            break;
        case "update" :
            $qry = "UPDATE tbl_offline_coupon
                    SET
                        `coupon_name`   = :coupon_name,
                        `reason`        = :reason,
                        `issueLimitCnt` = :issueLimitCnt,
                        `sdate`         = :sdate,
                        `edate`         = :edate,
                        `partner`       = :partner,
                        `code_type`     = :code_type,
                        `coupon_price`  = :coupon_price,
                        `promotion_code`        = :promotion_code,
                        `issuePerPersonLimitYn` = :issuePerPersonLimitYn,
                        `issuePerPersonLimitCnt` = :issuePerPersonLimitCnt,
                        `dailyIssuePerPersonLimitCnt` = :dailyIssuePerPersonLimitCnt
                    WHERE sno = :sno";
            $param = array(
                'coupon_name' => $coupon_name,
                'reason' => $reason,
                'issueLimitCnt' => $issueLimitCnt,
                'sdate' => $sdate,
                'edate' => $edate,
                'partner' => $partner,
                'code_type' => $code_type,
                'coupon_price' => $coupon_price,
                'promotion_code' => $promotion_code,
                'issuePerPersonLimitYn' => $issuePerPersonLimitYn?:NULL,
                'issuePerPersonLimitCnt' => $issuePerPersonLimitCnt,
                'dailyIssuePerPersonLimitCnt' => $dailyIssuePerPersonLimitCnt,
                'sno' => $sno
            );
            $stmt = $pdo->prepare($qry);
            $stmt->execute($param);

            if ($stmt->rowCount() > 0) {
                echo "<script>alert('수정되었습니다.')</script>";
            } else {
                echo "<script>alert('error')</script>";
            }

            go($_SERVER['HTTP_REFERER']);
            break;
    }
} catch (PDOException $e) {
    echo 'Error!: '.$e->getMessage();
    die();
}
?>