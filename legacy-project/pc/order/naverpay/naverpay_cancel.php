<?
include_once($_SERVER["DOCUMENT_ROOT"].'/lib/lib.php');

$page_title="결제취소";
$resultCode = filter_input(INPUT_GET, 'resultCode', FILTER_SANITIZE_STRING);
$resultMessage = filter_input(INPUT_GET, 'resultMessage', FILTER_SANITIZE_STRING);

?>
<!DOCTYPE html>
<html lang="ko" data-bs-theme="dark">
<head>
<meta charset="utf-8" />
<title><?=$page_title?></title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta content="" name="description" />
<meta content="H2interactive" name="author" />
<!-- App favicon -->
<link rel="shortcut icon" href="/favicon.ico">

<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100;300;400;500;700;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg==" crossorigin="anonymous" referrerpolicy="no-referrer" />

<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-SgOJa3DmI69IUzQ2PVdRZhwQ+dy64/BUtbMJw1MZ8t5HZApcHrRKUc4W0kG879m7" crossorigin="anonymous">
<link href="/templete/assets/dist/css/custom.css?t=<?=time()?>" rel="stylesheet">

<link href="/assets/css/directg.css?t=<?=time()?>" rel="stylesheet" type="text/css" />

<style>

</style>
</head>

<body>
<div class="wrapper">
	<? include_once($_SERVER['DOCUMENT_ROOT'].'/templete/inc/header.html');?>
	
	<main class="mb-5">
		<div class="container">
			<div class="row g-2 my-3">
				<div class="col-12">
					<?=$resultMessage?>
				</div>
			</div>
		</div>
	</main>
	<!-- End Page content -->

	<? include_once($_SERVER['DOCUMENT_ROOT'].'/templete/inc/footer.html');?>

</div>
<!-- END wrapper -->

<script src="https://code.jquery.com/jquery-3.7.1.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/js/bootstrap.bundle.min.js" integrity="sha384-k6d4wzSIapyDyv1kpU366/PK5hCdSbCRGRCMv+eplOQJWyd1fbcAu9OCUj5zNLiq" crossorigin="anonymous"></script>

</body>
</html>