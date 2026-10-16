<?
	ini_set( "display_errors", 1 );
	error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
	header('Content-Type: text/html; charset=UTF-8');

	include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
	
	$json = file_get_contents("/home/dgkrshop/www/pc/_Admin_/steam/metacritic.json"); //test.json 파일 읽어옴
	$data = json_decode($json, true); // JSON을 PHP 배열로 변환
	
	//print_r($data);
	
	$num = 1;
	foreach($data['data'] as $key=>$value){
		//print_r($value);
		
		echo $num." ".$value['name']['0']." / ".$value['metascore']['0']."<br/>";
		//echo $value['url']['0'];
		//echo $value['metascore']['0'];
		$num++;
	}
?>