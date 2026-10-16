<?
include_once($_SERVER["DOCUMENT_ROOT"].'/lib/lib.php');

$page_title="결제취소";
$resultCode = filter_input(INPUT_GET, 'resultCode', FILTER_SANITIZE_STRING);
$resultMessage = filter_input(INPUT_GET, 'resultMessage', FILTER_SANITIZE_STRING);

?>
<!DOCTYPE html>
<!doctype html>
<html lang="ko">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, viewport-fit=cover" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="theme-color" content="#000000">
<title><?=$page_title?></title>
<meta name="description" content="">
<meta name="keywords" content="" />
<link rel="icon" type="image/png" href="/assets/img/favicon.png" sizes="32x32">
<link rel="apple-touch-icon" sizes="180x180" href="/assets/img/icon/192x192.png">
<link rel="manifest" href="/manifest.json">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100;300;400;500;700;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/style.css?t=<?=date('YmdHis')?>">
<link href="https://fonts.googleapis.com/css2?family=Material+Icons" rel="stylesheet">

<link rel="stylesheet" href="/assets/css/dg_style.css?t=<?=date('YmdHis')?>">

</head>

<body>
<body class="dark-mode-active">
<!-- App Header -->
<? include_once($_SERVER["DOCUMENT_ROOT"].'/inc/sub_header.html'); ?>
<!-- * App Header -->

<!-- App Capsule -->
<div id="appCapsuleSub" class="full-height">
	<div class="section full px-3 pt-2">
		<div class="card">
			<div class="card-body">
				<div class="text-center"><?=$resultMessage?></div>
			</div>
		</div>
	</div>
</div>
<!-- * App Capsule -->

<!-- App Bottom Menu -->
<? include_once($_SERVER["DOCUMENT_ROOT"].'/inc/bottom_menu.html'); ?>
<!-- * App Bottom Menu -->

<!-- App Sidebar -->
<? include_once($_SERVER["DOCUMENT_ROOT"].'/inc/sidebar.html'); ?>
<!-- * App Sidebar -->


<!-- ============== Js Files ==============  -->
<!-- Bootstrap -->
<script src="/assets/js/lib/bootstrap.bundle.min.js"></script>
<!-- Ionicons -->
<script type="module" src="https://cdn.jsdelivr.net/npm/ionicons@latest/dist/ionicons/ionicons.esm.js"></script>
<!-- Splide -->
<script src="/assets/js/plugins/splide/splide.min.js"></script>
<!-- ProgressBar js -->
<script src="/assets/js/plugins/progressbar-js/progressbar.min.js"></script>

<script src="/assets/js/lib/jquery-3.4.1.min.js"></script>

<!-- Base Js File -->
<script src="/assets/js/base.js"></script>

</body>
</html>
