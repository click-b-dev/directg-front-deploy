<?
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$num = filter_input(INPUT_POST, 'num', FILTER_SANITIZE_STRING);
$title_id = filter_input(INPUT_POST, 'title_id', FILTER_SANITIZE_STRING);
$image_type = filter_input(INPUT_POST, 'image_type', FILTER_SANITIZE_STRING);
$image_url = filter_input(INPUT_POST, 'image_url', FILTER_SANITIZE_STRING);
$thumbnail_url = filter_input(INPUT_POST, 'thumbnail_url', FILTER_SANITIZE_STRING);
$appid = filter_input(INPUT_POST, 'appid', FILTER_SANITIZE_STRING);

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$admin= new Admin($conn);

	switch($image_type){
		case "header_460x215":
			if($title_id){
				$filename = $title_id.".jpg";
				
				$header_path = '/home/dgkrshop/www/upload/title/'.$title_id."/header";
				
				$header_url = $header_path."/".$filename;
				if(file_exists($header_url)){
					//unlink($header_url);
				}
				
				if(!is_dir($header_path)){
					$oldumask = umask(0);
					mkdir($header_path, 0777,true);
					//chmod($header_path,0777);
					umask($oldumask);
				}
				copy($image_url, $header_url);
			}
			
			if($appid){
				$filename2 = "header.jpg";
				$header_path2 = '/home/dgkrshop/www/upload/apps/header/'.$appid;
				if(!file_exists($header_path2)){
					mkdir($header_path2, 0777,true);
				}
				copy($image_url, $header_path2."/".$filename2);
			}

			$s_query = "insert into steam_image_chk set appid=:appid,is_header=:is_header,reg_date=now() ON DUPLICATE KEY UPDATE update_date=now(),is_header=:is_header";
			$stmt = $conn->prepare($s_query);
			$s_params = array(
				":appid"=>$appid,
				":is_header"=>$admin->remoteFileExist($image_url),
			);
			$stmt->execute($s_params);
		break;
		case "hero_374x448":
			$linkArray = explode("/", $image_url);
			$filename = $linkArray[count($linkArray)-1];
			$image_path = '/home/dgkrshop/www/upload/title/'.$title_id."/hero";
			if(!file_exists($image_path)){
				mkdir($image_path, 0777,true);
			}
			copy($image_url, $image_path."/".$filename);

			$image_path2 = '/home/dgkrshop/www/upload/apps/hero/'.$appid;
			if(!file_exists($image_path2)){
				mkdir($image_path2, 0777,true);
			}
			copy($image_url, $image_path2."/".$filename);

			$s_query = "insert into steam_image_chk set appid=:appid,is_hero=:is_hero,reg_date=now() ON DUPLICATE KEY UPDATE update_date=now(),is_hero=:is_hero";
			$stmt = $conn->prepare($s_query);
			$s_params = array(
				":appid"=>$appid,
				":is_hero"=>$admin->remoteFileExist($image_url),
			);
			$stmt->execute($s_params);
		break;
		case "capsule_231x87":
			$filename = "capsule_231x87.jpg";
			$image_path = '/home/dgkrshop/www/upload/title/'.$title_id."/capsule";
			
			if(!is_dir($image_path)){
				$oldumask = umask(0);
				mkdir($image_path, 0777,true);
				umask($oldumask);
			}
			
			copy($image_url, $image_path."/".$filename);

			$image_path2 = '/home/dgkrshop/www/upload/apps/capsule/'.$appid;
			
			if(!is_dir($image_path2)){
				$oldumask = umask(0);
				mkdir($image_path2, 0777,true);
				//chmod($image_path2,0777);
				umask($oldumask);
			}
				
			copy($image_url, $image_path2."/".$filename);

			$s_query = "insert into steam_image_chk set appid=:appid,is_capsule_231=:is_capsule_231,reg_date=now() ON DUPLICATE KEY UPDATE update_date=now(),is_capsule_231=:is_capsule_231";
			$stmt = $conn->prepare($s_query);
			$s_params = array(
				":appid"=>$appid,
				":is_capsule_231"=>$admin->remoteFileExist($image_url),
			);
			$stmt->execute($s_params);
		break;
		case "capsule_616x353":
			$linkArray = explode("/", $image_url);
			$filename = $linkArray[count($linkArray)-1];
			$image_path = '/home/dgkrshop/www/upload/title/'.$title_id."/capsule";
			
			if(!is_dir($image_path)){
				$oldumask = umask(0);
				mkdir($image_path, 0777,true);
				//chmod($header_path,0777);
				umask($oldumask);
			}
				
			copy($image_url, $image_path."/".$filename);

			$s_query = "insert into steam_image_chk set appid=:appid,is_capsule_616=:is_capsule_616,reg_date=now() ON DUPLICATE KEY UPDATE update_date=now(),is_capsule_616=:is_capsule_616";
			$stmt = $conn->prepare($s_query);
			$s_params = array(
				":appid"=>$appid,
				":is_capsule_616"=>$admin->remoteFileExist($image_url),
			);
			$stmt->execute($s_params);

		break;
		case "library_600x900":
			$filename = "library_600x900.jpg";
			$image_path = '/home/dgkrshop/www/upload/title/'.$title_id."/library";
			
			if(!is_dir($image_path)){
				$oldumask = umask(0);
				mkdir($image_path, 0777,true);
				chmod($header_path,0777);
				umask($oldumask);
			}
			
			copy($image_url, $image_path."/".$filename);

			$s_query = "insert into steam_image_chk set appid=:appid,is_library=:is_library,reg_date=now() ON DUPLICATE KEY UPDATE update_date=now(),is_library=:is_library";
			$stmt = $conn->prepare($s_query);
			$s_params = array(
				":appid"=>$appid,
				":is_library"=>$admin->remoteFileExist($image_url),
			);
			$stmt->execute($s_params);

		break;
		case "screenshot":
			$linkArray = explode("/", $image_url);
			$filename = $linkArray[count($linkArray)-1];
			$filename = explode("?",$filename);

			$image_path = '/home/dgkrshop/www/upload/title/'.$title_id."/screenshot/";
			$thumbnail_path = '/home/dgkrshop/www/upload/title/'.$title_id."/screenshot/thumbnail/";

			if(!file_exists($image_path)){
				mkdir($image_path, 0777,true);
				chmod($image_path,0777);
			}

			if(!file_exists($thumbnail_path)){
				mkdir($thumbnail_path, 0777,true);
				chmod($thumbnail_path,0777);
			}
			//copy($image_url, $image_path."/".$filename['0']);
			//스크린샷 썸네일 저장

				//스크린샷 썸네일 저장 크기 수정(112 * 63)
				$admin->resizeImage('120','90','90',$thumbnail_url,$thumbnail_path,$filename['0']);
				
				//스크린샷 리사이징
				$admin->resizeImage('856','480','90',$image_url,$image_path,$filename['0']);

				$file_type = getimagesize($image_url);

				$query = "insert into tbl_goods_screenshot set screenshot_num=:screenshot_num,title_id=:title_id,file_name=:file_name,file_size=:file_size,file_type=:file_type,url=:url,thumbnail=:thumbnail,reg_date=now()";
				$stmt = $conn->prepare($query);
				$params = array(
					':screenshot_num'=>$num,
					':title_id'=>$title_id,
					':file_name'=>$filename['0'],
					':file_size'=>filesize('/home/dgkrshop/www/upload/title/'.$title_id.'/screenshot/'.$filename['0']),
					':file_type'=>$file_type['mime'],
					':url'=>'/upload/title/'.$title_id.'/screenshot/'.$filename['0'],
					':thumbnail'=>'/upload/title/'.$title_id.'/screenshot/thumbnail/'.$filename['0'],
				);
				$stmt->execute($params);
		break;
		case "screenshot_delete":
			$screenshot_num = filter_input(INPUT_POST, 'screenshot_num', FILTER_SANITIZE_STRING);
			$query = "select idx,url,thumbnail,file_name from tbl_goods_screenshot where title_id=:title_id and screenshot_num=:screenshot_num";
			$stmt = $conn->prepare($query);
			$params = array(
				':title_id'=>$title_id,
				':screenshot_num'=>$screenshot_num,
			);
			$stmt->execute($params);
			$data = $stmt->fetch();
			
			//$data['thumbnail'];
			
			$file_path = "/home/dgkrshop/www/upload/title/".$title_id."/screenshot/".$data['file_name'];
			$thumbnail_path = "/home/dgkrshop/www".$data['thumbnail'];
			
			if (unlink($file_path)) {
				//echo "파일이 성공적으로 삭제되었습니다.";
			} else {
				//echo "파일 삭제에 실패했습니다.";
			}
			
			if (unlink($thumbnail_path)) {
				//echo "파일이 성공적으로 삭제되었습니다.";
			} else {
				//echo "파일 삭제에 실패했습니다.";
			}
			
			$d_query ="delete from tbl_goods_screenshot where idx=:idx";
			$stmt = $conn->prepare($d_query);
			$d_params = array(
				':idx'=>$data['idx'],
			);
			$stmt->execute($d_params);
			
		break;
	}

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>