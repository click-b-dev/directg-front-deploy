<?php
$rawBody = file_get_contents("php://input"); // 본문을 불러옴
$getData = array(json_decode($rawBody)); // 데이터를 변수에 넣고

error_log("\r\n[".date('Y.m.d H:i:s')."]\n".print_r($_POST,true)."\n", 3,"/home/dgkrshop/www/log/genba/webhook/webhook2.log");
error_log("\r\n[".date('Y.m.d H:i:s')."]\n".print_r($getData,true)."\n", 3,"/home/dgkrshop/www/log/genba/webhook/webhook2.log");
?>