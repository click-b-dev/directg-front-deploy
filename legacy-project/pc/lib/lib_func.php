<?
function html_print($str){
	$str = str_replace("&#60;","<",$str);
	$str = str_replace("&#62;",">",$str);
	$str = str_replace("&#34;",'"',$str);
	$str = str_replace("&#38;","&",$str);
	$str = str_replace("&amp;","&",$str);
	//$str = str_replace("&nbsp;"," ",$str);
	//$str = str_replace("&lt;","<",$str);
	//$str = str_replace("&gt;",">",$str);
	
	return $str;
}

function html_print2($str){
	$str = str_replace("&#60;","<",$str);
	$str = str_replace("&#62;",">",$str);
	$str = str_replace("&#34;",'"',$str);
	$str = str_replace("&#38;","&",$str);
	$str = str_replace("&amp;","&",$str);
	$str = str_replace("\"","",$str);
	$str = str_replace("&lt;","<",$str);
	$str = str_replace("&gt;",">",$str);
	
	return $str;
}

function html_print3($str){
	$str = str_replace("&#60;","<",$str);
	$str = str_replace("&#62;",">",$str);
	$str = str_replace("&#34;",'"',$str);
	$str = str_replace("&#38;","&",$str);
	$str = str_replace("&amp;","&",$str);
	$str = str_replace("\"","",$str);
	$str = str_replace("&lt;","<",$str);
	$str = str_replace("&gt;",">",$str);
	$str = str_replace("&#13;&#10;","<br>",$str);
	
	return $str;
}

function html_removal($str){
	$str = str_replace("&#39;","",$str);
	$str = str_replace("&#34;","",$str);
	$str = str_replace("&amp;","",$str);
	$str = str_replace("&quot;","",$str);
	$str = str_replace("&apos;","",$str);
	$str = str_replace("&lt;","<",$str);
	$str = str_replace("&gt;",">",$str);
	return $str;
}

### 예외 처리
function msg($msg,$code=null,$target='')
{
	echo '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">';
	echo "<script>alert('$msg')</script>";
	switch (getType($code)){
		case "null":
			return;
		case "integer":
			if ($code) echo "<script>history.go($code)</script>";
			exit;
		case "string":
			if ($code=="close") echo "<script>window.close()</script>";
			else if($code=='parentClose') {
				echo "<script>parent.window.close()</script>";
			}
			else go($code,$target);
			exit;
	}
}

function go($url,$target='')
{
	if ($target) $target .= ".";
	//echo '<meta http-equiv="Content-Type" content="text/html; charset=euc-kr">';
	echo "<script>{$target}location.replace('$url')</script>";
	exit;
}

function get_client_ip_env() {
	$ipaddress = '';
	if (getenv('HTTP_CLIENT_IP'))
		$ipaddress = getenv('HTTP_CLIENT_IP');
	else if(getenv('HTTP_X_FORWARDED_FOR'))
		$ipaddress = getenv('HTTP_X_FORWARDED_FOR');
	else if(getenv('HTTP_X_FORWARDED'))
		$ipaddress = getenv('HTTP_X_FORWARDED');
	else if(getenv('HTTP_FORWARDED_FOR'))
		$ipaddress = getenv('HTTP_FORWARDED_FOR');
	else if(getenv('HTTP_FORWARDED'))
		$ipaddress = getenv('HTTP_FORWARDED');
	else if(getenv('REMOTE_ADDR'))
		$ipaddress = getenv('REMOTE_ADDR');
	else
		$ipaddress = 'UNKNOWN';
 
	return $ipaddress;
}

function debug($data){
	print "<xmp style=\"display:block;font:9pt 'Bitstream Vera Sans Mono, Courier New';background:#202020;color:#D2FFD2;padding:10px;margin:5px;\">";
	print_r($data);
	print "</xmp>";
}
?>