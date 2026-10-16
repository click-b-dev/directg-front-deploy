<?
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$num = filter_input(INPUT_POST, 'num', FILTER_SANITIZE_STRING);
$product_code = filter_input(INPUT_POST, 'product_code', FILTER_SANITIZE_STRING);
$image_type = filter_input(INPUT_POST, 'image_type', FILTER_SANITIZE_STRING);
$image_url = filter_input(INPUT_POST, 'image_url', FILTER_SANITIZE_STRING);
$appid = filter_input(INPUT_POST, 'appid', FILTER_SANITIZE_STRING);
$packageid = filter_input(INPUT_POST, 'packageid', FILTER_SANITIZE_STRING);

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$admin= new Admin($conn);

	switch($image_type){
		case "header_460x215":
			if($product_code){
				$filename = "header.jpg";
				
				$header_path = $_SERVER['DOCUMENT_ROOT'].'/upload/product/'.$product_code."/header";
				
				$header_url = $header_path."/".$filename;
				if(file_exists($header_url)){
					unlink($header_url);
				}

				if(!is_dir($header_path)){
					$oldumask = umask(0);
					mkdir($header_path, 0777,true);
					//chmod($header_path,0777);
					umask($oldumask);
				}
				copy($image_url, $header_path."/".$filename);

				$s_query = "insert into steam_package_image_chk set packageid=:packageid,is_header=:is_header,reg_date=now() ON DUPLICATE KEY UPDATE update_date=now(),is_header=:is_header";
				$stmt = $conn->prepare($s_query);
				$s_params = array(
					":packageid"=>$packageid,
					":is_header"=>$admin->remoteFileExist($image_url),
				);
				$stmt->execute($s_params);
			}

		break;
		case "capsule_231x87":
			$filename = "capsule_231x87.jpg";
			$image_path = $_SERVER['DOCUMENT_ROOT'].'/upload/product/'.$product_code."/capsule";
			if(!is_dir($image_path)){
				$oldumask = umask(0);
				mkdir($image_path, 0777,true);
				//chmod($header_path,0777);
				umask($oldumask);
			}
			copy($image_url, $image_path."/".$filename);

			$s_query = "insert into steam_package_image_chk set packageid=:packageid,is_capsule_231=:is_capsule_231,reg_date=now() ON DUPLICATE KEY UPDATE update_date=now(),is_capsule_231=:is_capsule_231";
			$stmt = $conn->prepare($s_query);
			$s_params = array(
				":packageid"=>$packageid,
				":is_capsule_231"=>$admin->remoteFileExist($image_url),
			);
			$stmt->execute($s_params);
		break;
	}

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>