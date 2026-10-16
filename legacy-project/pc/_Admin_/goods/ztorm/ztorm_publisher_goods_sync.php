<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$PublisherID = filter_input(INPUT_GET, 'PublisherID', FILTER_SANITIZE_STRING);
$Status = filter_input(INPUT_GET, 'Status', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
}

$mode ="";

$params = array(
	"Offset"=>($page-1)*50,
	"Length"=>"50",
	"PublisherID"=>$PublisherID,
	"Status"=>$Status,
);
$ztorm = new Ztorm($mode);
$response = $ztorm->runGetProducts($params);

/*
*/

foreach($response->Value->Product as $value){
	if($value->Status=="Discontinued"){
		echo $value->ID." / ".$value->Status."<br/>";
	}else{
		echo $value->ID." / ".$value->Name." / ".$value->PublisherID." / ".$value->PublisherName." / ".$value->RegionTag." / ".$value->Status."<br/>";
	}
	
	//print_r($value);
}
//print_r($response);
?>