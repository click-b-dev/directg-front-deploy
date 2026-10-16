<?

ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
header('Content-Type: text/html; charset=UTF-8');
include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$admin= new Admin($conn);
	$adminGoods= new AdminGoods($conn);

	switch($mode){
		case "file_register":
			// 파일타입 및 확장자 체크
			$fileTypeExt = explode("/", $_FILES['promotion_file']['type']);

			// 파일 타입 
			$fileType = $fileTypeExt[0];

			// 파일 확장자
			$fileExt = $fileTypeExt[1];

			// 확장자 검사
			$extStatus = false;

			switch($fileExt){
				case 'vnd.openxmlformats-officedocument.spreadsheetml.sheet':
					$extStatus = true;
				break;
				case "csv":
					$extStatus = true;
				break;
				default:
					echo "엑셀파일 확장자(xls,xlsx,csv)외에는 사용이 불가합니다."; 
					exit;
				break;
			}

			if($extStatus){
				if($_FILES['promotion_file']['tmp_name']){
					//대표상품 header이미지 폴더생성
					$promotion_path = $_SERVER['DOCUMENT_ROOT'].'/_Admin_/promotion/tmp/';

					$file_info = pathinfo($_FILES['promotion_file']['name']);
					
					$extension = $file_info['extension'];
					$promotion_file_name = date('YmdHis').".".$extension;
					$promotion_upload = $promotion_path."/".$promotion_file_name;

					if($promotion_upload){
						move_uploaded_file($_FILES['promotion_file']['tmp_name'], $promotion_upload);
					}
				}
			}

			//업로드된 엑셀파일 읽기
			require_once $_SERVER['DOCUMENT_ROOT']."/../PHPExcel-1.8/Classes/PHPExcel.php"; // PHPExcel.php을 불러옴.	
			$objPHPExcel = new PHPExcel();	
			require_once $_SERVER['DOCUMENT_ROOT']."./../PHPExcel-1.8/Classes/PHPExcel/IOFactory.php"; // IOFactory.php을 불러옴.
			$filename = $_SERVER['DOCUMENT_ROOT'].'/_Admin_/promotion/tmp/'.$promotion_file_name; // 읽어들일 엑셀 파일의 경로와 파일명을 지정한다.


			try {	// 업로드 된 엑셀 형식에 맞는 Reader객체를 만든다.	
				$objReader = PHPExcel_IOFactory::createReaderForFile($filename);
				// 읽기전용으로 설정
				$objReader->setReadDataOnly(true);		// 엑셀파일을 읽는다
				$objExcel = $objReader->load($filename);		// 첫번째 시트를 선택
				$objExcel->setActiveSheetIndex(0);
				$objWorksheet = $objExcel->getActiveSheet();
				$rowIterator = $objWorksheet->getRowIterator();

				foreach ($rowIterator as $row) { // 모든 행에 대해서
					$cellIterator = $row->getCellIterator();
					$cellIterator->setIterateOnlyExistingCells(false); 
				}

				$maxRow = $objWorksheet->getHighestRow();

				for ($i = 2 ; $i <= $maxRow ; $i++) {
					$promotion_start = $objWorksheet->getCell('A' . $i)->getValue(); //프로모션 시작일
					$promotion_end = $objWorksheet->getCell('B' . $i)->getValue(); //프로모션 종료일
					$product_code = $objWorksheet->getCell('C' . $i)->getValue(); //옵션상품코드
					$product_name = $objWorksheet->getCell('D' . $i)->getValue(); //옵션상품명
					$product_srp = $objWorksheet->getCell('E' . $i)->getValue(); //퍼블리셔 SRP
					$promotion_srp = $objWorksheet->getCell('F' . $i)->getValue(); //퍼블리셔 승인 SRP
					$p_discount_rate = $objWorksheet->getCell('G' . $i)->getValue(); //퍼블리셔 승인 할인율
					$consumer_price = $objWorksheet->getCell('H' . $i)->getValue(); //DG 소비자가
					$sale_price = $objWorksheet->getCell('I' . $i)->getValue(); //DG 할인판매가
					$discount_rate = $objWorksheet->getCell('J' . $i)->getValue(); //DGKR 할인율

					// 날짜 형태의 셀을 읽을때는 toFormattedString를 사용			
					$promotion_start = PHPExcel_Style_NumberFormat::toFormattedString($promotion_start, 'YYYY-MM-DD hh:mm:ss');
					$promotion_end = PHPExcel_Style_NumberFormat::toFormattedString($promotion_end, 'YYYY-MM-DD hh:mm:ss');
					
					$start_date= strtotime($promotion_start);
					$end_date=strtotime($promotion_end);
					
					if($product_code<>""){
						//퍼블리셔 코드 조회
						$publisher_code = $adminGoods->getGoodsItemPublisher($product_code);
						
						$query="insert into tbl_promotion_schedule set product_code=:product_code,promotion_start=:promotion_start,promotion_end=:promotion_end,promotion_srp=:promotion_srp,p_discount_rate=:p_discount_rate,consumer_price=:consumer_price,discount_rate=:discount_rate,sale_price=:sale_price,publisher_code=:publisher_code,reg_date=now(),start_date=:start_date,end_date=:end_date ON DUPLICATE KEY UPDATE p_discount_rate=:p_discount_rate,discount_rate=:discount_rate,sale_price=:sale_price,publisher_code=:publisher_code";
						$param = array(
							":product_code"=>$product_code,
							":promotion_start"=>$promotion_start,
							":promotion_end"=>$promotion_end,
							":promotion_srp"=>$promotion_srp,
							":p_discount_rate"=>round($p_discount_rate*100),
							":consumer_price"=>$consumer_price,
							":discount_rate"=>round($discount_rate*100),
							":sale_price"=>$sale_price,
							":start_date"=>$start_date,
							":end_date"=>$end_date,
							":publisher_code"=>$publisher_code,
						);
						$stmt = $conn->prepare($query);
						$stmt->execute($param);
						//print_r($param);
					}
				}	
				
				go("promotion_ready.php");

			} catch (exception $e) {	
				print_r($e);
				echo '엑셀파일을 읽는도중 오류가 발생하였습니다.<br/>';
			}
		break;
		case "register":
		break;
		case "delete": //개별삭제
			$idx = filter_input(INPUT_POST, 'idx', FILTER_SANITIZE_STRING);
			
			$query = "delete from tbl_promotion_schedule where idx=:idx";
			$param = array(
				":idx"=>$idx
			);
			
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
		break;
		case "delete_all": //전체삭제
			$query = "delete from tbl_promotion_schedule where confirm='N'";
			$stmt = $conn->prepare($query);
			$stmt->execute();
		break;
		case "confirm": //승인처리
			$query = "update tbl_promotion_schedule set  confirm='Y' where confirm='N'";
			$stmt = $conn->prepare($query);
			$stmt->execute();
		break;
	}

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>