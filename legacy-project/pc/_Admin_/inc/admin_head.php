<!DOCTYPE html>
<html lang="ko">
<head>
	<meta charset="utf-8" />
	<title><?=$page_title?></title>
	<meta name="viewport" content="width=1630">
	<meta content="" name="description" />
	<meta content="H2interactive" name="author" />
	<META HTTP-EQUIV="Pragma" CONTENT="no-cache">
	<META HTTP-EQUIV="Expires" CONTENT="-1">
	<link rel="shortcut icon" href="<?=$document_root?>/assets/images/favicon.ico">
	<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100;300;400;500;700;900&display=swap" rel="stylesheet">
	<link href="<?=$document_root?>/assets/css/icons.min.css" rel="stylesheet" type="text/css" />
	<link href="<?=$document_root?>/assets/css/app.min.css?<?=time()?>" rel="stylesheet" type="text/css" id="light-style" />
	<link href="<?=$document_root?>/assets/css/app-dark.min.css?<?=time()?>" rel="stylesheet" type="text/css" id="dark-style" />
	<link href="<?=$document_root?>/assets/css/vendor/simplemde.min.css" rel="stylesheet" type="text/css" />

	<script>
	function LoadingOverlay(action) {
		let el = document.getElementById('_loading_overlay');
		if (!el) {
			el = document.createElement('div');
			el.id = '_loading_overlay';
			el.innerHTML = '<div style="width:48px;height:48px;border:5px solid #fff;border-top-color:transparent;border-radius:50%;animation:spin .8s linear infinite"></div>';
			el.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:9999;justify-content:center;align-items:center';
			document.head.insertAdjacentHTML('beforeend', '<style>@keyframes spin{to{transform:rotate(360deg)}}</style>');
			document.body.appendChild(el);
		}
		el.style.display = action === 'show' ? 'flex' : 'none';
	}

	function escHtml(str) {
		if (str == null) return '';
		return String(str)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	function renderPaging(options) {
		var page          = parseInt(options.page) || 1;
		var totalPages    = options.totalPages    || 1;
		var totalElements = options.totalElements || 0;
		var baseUrl       = options.baseUrl;
		var params        = options.params        || {};
		var targetPaging  = options.targetPaging  || '#paging';
		var targetTotal   = options.targetTotal   || '#total';
		var perBlock      = options.perBlock      || 10;

		var qs = '';
		$.each(params, function (key, val) {
			if (val !== undefined && val !== null) {
				qs += '&' + encodeURIComponent(key) + '=' + encodeURIComponent(val);
			}
		});

		var start = (Math.ceil(page / perBlock) - 1) * perBlock + 1;
		var end   = (start + perBlock > totalPages) ? totalPages + 1 : start + perBlock;

		var html = '<nav><ul class="pagination justify-content-center">';

		if (start <= 1) {
			html += '<li class="page-item disabled"><a class="page-link">&laquo;</a></li>';
		} else {
			html += '<li class="page-item"><a class="page-link" href="' + baseUrl + '?page=' + (start - perBlock) + qs + '">&laquo;</a></li>';
		}

		for (var i = start; i < end; i++) {
			if (i === page) {
				html += '<li class="page-item active"><a class="page-link" href="#">' + i + '</a></li>';
			} else {
				html += '<li class="page-item"><a class="page-link" href="' + baseUrl + '?page=' + i + qs + '">' + i + '</a></li>';
			}
		}

		if (end > totalPages) {
			html += '<li class="page-item disabled"><a class="page-link">&raquo;</a></li>';
		} else {
			html += '<li class="page-item"><a class="page-link" href="' + baseUrl + '?page=' + end + qs + '">&raquo;</a></li>';
		}

		html += '</ul></nav>';

		$(targetPaging).html(html);
		$(targetTotal).text(totalElements);
	}
	</script>
	<style>
	html { font-family: 'Noto Sans KR', sans-serif; font-size: 16px; }
	table { font-size: 0.875rem; }
	thead th { font-weight: 500; }
	.eng { font-family: "arial"; font-size: 12px; }
	.num { font-family: "tahoma"; font-size: 12px; }
	</style>
</head>
