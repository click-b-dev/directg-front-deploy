<?
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$num = filter_input(INPUT_POST, 'num', FILTER_SANITIZE_STRING);
$product_code = filter_input(INPUT_POST, 'product_code', FILTER_SANITIZE_STRING);
$image_type = filter_input(INPUT_POST, 'image_type', FILTER_SANITIZE_STRING);
$image_url = filter_input(INPUT_POST, 'image_url', FILTER_SANITIZE_STRING);
$thumbnail_url = filter_input(INPUT_POST, 'thumbnail_url', FILTER_SANITIZE_STRING);
$appid = filter_input(INPUT_POST, 'appid', FILTER_SANITIZE_STRING);

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$admin= new Admin($conn);

	switch($image_type){
		case "screenshot":
			$linkArray = explode("/", $image_url);
			$filename = $linkArray[count($linkArray)-1];
			$filename = explode("?",$filename);

			$image_path = '/home/dgkrshop/www/upload/screenshot/'.$product_code."/";
			$thumbnail_path = '/home/dgkrshop/www/upload/screenshot/'.$product_code."/thumbnail/";
			
			if(!is_dir($image_path)){
				$oldumask = umask(0);
				mkdir($image_path, 0777,true);
				chmod($image_path,0777);
				umask($oldumask);
			}
			
			if(!is_dir($thumbnail_path)){
				$oldumask = umask(0);
				mkdir($thumbnail_path, 0777,true);
				chmod($thumbnail_path,0777);
				umask($oldumask);
			}

				//스크린샷 썸네일 저장 크기 수정(112 * 63)
				$admin->resizeImage('112','63','90',$thumbnail_url,$thumbnail_path,$filename['0']);
				
				//스크린샷 리사이징
				$admin->resizeImage('856','480','90',$image_url,$image_path,$filename['0']);

				$file_type = getimagesize($image_url);

				$query = "insert into tbl_goods_item_screenshot set screenshot_num=:screenshot_num,product_code=:product_code,file_name=:file_name,file_size=:file_size,file_type=:file_type,url=:url,thumbnail=:thumbnail,reg_date=now()";
				$stmt = $conn->prepare($query);
				$params = array(
					':screenshot_num'=>$num,
					':product_code'=>$product_code,
					':file_name'=>$filename['0'],
					':file_size'=>filesize('/home/dgkrshop/www/upload/screenshot/'.$product_code.'/'.$filename['0']),
					':file_type'=>$file_type['mime'],
					':url'=>'/upload/screenshot/'.$product_code.'/'.$filename['0'],
					':thumbnail'=>'/upload/screenshot/'.$product_code.'/thumbnail/'.$filename['0'],
				);
				$stmt->execute($params);
		break;
		case "screenshot_delete":
			$screenshot_num = filter_input(INPUT_POST, 'screenshot_num', FILTER_SANITIZE_STRING);
			$query = "select idx,url,thumbnail from tbl_goods_item_screenshot where product_code=:product_code and screenshot_num=:screenshot_num";
			$stmt = $conn->prepare($query);
			$params = array(
				':product_code'=>$product_code,
				':screenshot_num'=>$screenshot_num,
			);
			$stmt->execute($params);
			$data = $stmt->fetch();
			
			$file_path = "/home/dgkrshop/www".$data['url'];
			$thumbnail_path = "/home/dgkrshop/www".$data['thumbnail'];
			
			if (unlink($file_path)) {
				echo "파일이 성공적으로 삭제되었습니다.";
			} else {
				//echo "파일 삭제에 실패했습니다.";
			}
			
			if (unlink($thumbnail_path)) {
				echo "파일이 성공적으로 삭제되었습니다.";
			} else {
				//echo "파일 삭제에 실패했습니다.";
			}
			
			$d_query ="delete from tbl_goods_item_screenshot where idx=:idx";
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