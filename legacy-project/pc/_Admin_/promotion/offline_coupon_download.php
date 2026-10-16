<?php
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$sno = filter_input(INPUT_GET, 'sno', FILTER_SANITIZE_NUMBER_INT);

try {
    $pdo = new PDO($dsn_dgkr, DGKR_USER, DGKR_PASSWORD);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

    $AdminPromotion = new AdminPromotion($pdo);

    $offline_coupon_info = $AdminPromotion->getOfflineCouponInfo($sno);

    if (!$offline_coupon_info) {
        echo "잘못된 요청입니다.";
        exit;
    }

    $code_list = $AdminPromotion->getCouponCodeList($sno);

    foreach ($code_list AS $value) {
        $txt_content .= "{$value['number']}\n";
    }

    $file_name = "{$offline_coupon_info['coupon_name']}_쿠폰코드_".date('Ymd').".txt";

    header('Content-Type: text/plain; charset=utf-8');
    header('Content-Disposition: attachment; filename="'.rawurlencode($file_name).'"');
    header('Cache-Control: max-age=0');

    echo $txt_content;
    exit;
} catch (PDOException $e) {
    echo 'Error!: '.$e->getMessage();
    die();
}
?>