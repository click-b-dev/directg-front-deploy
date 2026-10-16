<?php
// admin 세션체크
include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$filename = "설문조사결과_".date('Ymd').".csv";
// ini_set( "display_errors", 1 );
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="' . $filename . '";');

$idx = $_POST['idx'];

if (!$idx) {
    echo "잘못된 요청입니다";
    exit;
}

try {
    $pdo = new PDO($dsn_dgkr, DGKR_USER, DGKR_PASSWORD);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

    $AdminBoard = new AdminBoard($pdo);

    $etc_answer_list = $AdminBoard->getEtcAnswerList($idx, 1, "", true);
} catch (PDOException $e) {
    echo "Error!: {$e->getMessage()}";
    die();
}

$output = fopen('php://output', 'w');
echo "\xEF\xBB\xBF"; // 한글 깨짐 방지 BOM

// fputcsv($output, array('주문일자','결제번호','주문번호','회원아이디','상품정보','주문금액','결제일자','결제방법','PG','결제상태','주문상태','키확인'));

foreach($etc_answer_list as $value){
    fputcsv($output, array(
        $value['answer_text'], $value['m_id']
    ));
}
fclose($output);
?>
