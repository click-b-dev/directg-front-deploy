<?
//header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 0 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
header("Content-Type: application/vnd.ms-excel; charset=utf-8");
header('Content-Disposition: attachment;filename="'.$_POST['excel_name'].'.xls"'); 


include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

?>
<!DOCTYPE html>
<html class="no-js">
<head>
<meta charset="utf-8" />
<style type="text/css">
body{
	width:100%;
	margin:0;
	padding:0;
	font-family:"Calibri";
}

ul{
	list-style:none;
}

.header{
	margin:5px;
	padding:0;
}

.title{
	margin:0;
	padding:0;
	float:left;
}

.title h2{
	margin:0;
	padding:0;
	font-size:36px;
}
.title p{
	font-size:24px;
	font-weight:bold;
}

.summary{
	width:100%;
	display:block;
	float:left;
	margin:0;
	padding:0;
}

.summary ol{
	margin:15px;
	padding:0;
}

.summary ol li{
	font-size:14px;
	font-weight:bold;
}

.address{
	position:absolute;
	float:right;
	margin:0;
	padding:0;
	width:200px;
}

.address ul{
	margin:0;
	padding:0;
}

.address ul li{
	text-align:right;
	font-size:14px;
}

.container{
	font-size:14px;
}

.container table thead tr th{
	border-top:2px solid;
	border-bottom:2px solid;
	height:50px;
}

.container table tfoot tr th{
	border-top:2px solid;
}

.container table tfoot tr td{
	border-top:2px solid;
	height:25px;
}

.container .royalty{
	width:100%;
	float:right;
	background:yellow;
	height:40px;
	padding-left:10px;
	padding-right:10px;
	font-weight:bold;
	text-align:right;
}

.container .royalty span{
	text-align:right;
}

</style>
</head>
<body>
<div class="container">
<? echo urldecode($_POST['data']); ?>
</div>
</body>
</html>