<?php
	include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');

	$_SESSION = array();
	session_destroy();

	go("../index.html");
?>