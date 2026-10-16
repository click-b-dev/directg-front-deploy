<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
ini_set('max_input_vars', 9000);
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$idx = filter_input(INPUT_POST, 'idx', FILTER_SANITIZE_STRING);

$type = filter_input(INPUT_POST, 'type', FILTER_SANITIZE_STRING);
$subject = filter_input(INPUT_POST, 'subject', FILTER_SANITIZE_STRING);
$start_date = filter_input(INPUT_POST, 'start_date', FILTER_SANITIZE_STRING);
$end_date = filter_input(INPUT_POST, 'end_date', FILTER_SANITIZE_STRING);
$banner_domain = filter_input(INPUT_POST, 'banner_domain', FILTER_SANITIZE_STRING);
$use_flag = filter_input(INPUT_POST, 'use_flag', FILTER_SANITIZE_STRING);
$sort = filter_input(INPUT_POST, 'sort', FILTER_SANITIZE_STRING);
$banner_img = filter_input(INPUT_POST, 'banner_img', FILTER_SANITIZE_STRING);
$banner_url = filter_input(INPUT_POST, 'banner_url', FILTER_SANITIZE_STRING);
$pc_banner_url = filter_input(INPUT_POST, 'pc_banner_url', FILTER_SANITIZE_STRING);

if($_FILES['upload_file']['name']){
	$file_name = $_FILES['upload_file']['name'];
	$temp_name = $_FILES['upload_file']['tmp_name'];
}

$uploaddir = $_SERVER['DOCUMENT_ROOT'].'/upload/banner/';
if(!file_exists($uploaddir)){
	mkdir($uploaddir, '0777',true);
}


switch($banner_domain){
	case "diskn":
		$banner_domain="https://image.directg.net/";
	break;
	case "dgkr":
		$banner_domain="/";
	break;
}

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	switch($mode){
		case "register":
			if($temp_name){
				move_uploaded_file($temp_name, $uploaddir.$file_name);
			}
			
			$query = "INSERT INTO tbl_group SET subject=:subject,banner=:banner,start_date=:start_date,end_date=:end_date,use_flag=:use_flag,admin=:admin,reg_date=NOW(),banner_domain=:banner_domain,sort=:sort,type=:type,banner_url=:banner_url,pc_banner_url=:pc_banner_url";
			$stmt = $conn->prepare($query);
			$params = array(
				":subject"=>$subject,
				":banner"=>$file_name,
				":start_date"=>strtotime($start_date),
				":end_date"=>strtotime($end_date),
				":use_flag"=>$use_flag,
				":admin"=>$_SESSION['admin']['admin_id'],
				":banner_domain"=>$banner_domain,
				":sort"=>$sort,
				":type"=>$type,
				":banner_url"=>$banner_url,
				":pc_banner_url"=>$pc_banner_url
			);
			$stmt->execute($params);
			$last_idx=$conn->lastInsertId();

			go("group_view.php?idx=".$last_idx);
		break;
		case "modify":
			if($_FILES['upload_file']['name']){
				$file_name = $_FILES['upload_file']['name'];
				$temp_name = $_FILES['upload_file']['tmp_name'];

				unlink($uploaddir.$banner_img);
				move_uploaded_file($temp_name, $uploaddir.$file_name);
				$file_query = ",banner=:banner";
				$file_params = array(":banner"=>$file_name);
			}

			$query = "UPDATE tbl_group SET subject=:subject".$file_query.",start_date=:start_date,end_date=:end_date,use_flag=:use_flag,banner_domain=:banner_domain,sort=:sort,type=:type,banner_url=:banner_url,pc_banner_url=:pc_banner_url WHERE idx=:idx";
			$stmt = $conn->prepare($query);
			$params = array(
				":subject"=>$subject,
				":start_date"=>strtotime($start_date),
				":end_date"=>strtotime($end_date),
				":use_flag"=>$use_flag,
				":banner_domain"=>$banner_domain,
				":sort"=>$sort,
				":type"=>$type,
				":banner_url"=>$banner_url,
				":pc_banner_url"=>$pc_banner_url,
				":idx"=>$idx
			);
			
			if(!empty($file_params)){
				$params = array_merge($params, $file_params);
			}
			
			$stmt->execute($params);
			go("group_register.php?idx=".$idx);
		break;

		case "goods_search":
			$search_type = filter_input(INPUT_POST, 'search_type', FILTER_SANITIZE_STRING);
			$search_value = filter_input(INPUT_POST, 'search_value', FILTER_SANITIZE_STRING);
			$page="1";

			$where = array();
			$param = "";
			
			$admin= new Admin($conn);
			$adminGoods= new AdminGoods($conn);
			
			switch($search_type){
				case "product_name":
					if(isset($search_value) && $search_value<>""){
						$where[] = " product_name like '%".$search_value."%'";
					}
					$add_where = "";
				break;
				case "product_code":
					if(isset($search_value) && $search_value<>""){
						$where[] = " product_code = '".$search_value."'";
					}
				break;
				case "goods_sku":
					if(isset($search_value) && $search_value<>""){
						$where[] = " goods_sku = '".$search_value."'";
					}
				break;
			}
			foreach($where as $value){
				$add_where.= " and ".$value;
			}

			$orderby = "product_code desc";
			$goods_option_list = $admin->getGoodsOptionList($page,$add_where,$orderby,$param,'50');
?>
				<div class="d-flex flex-row justify-content-between mb-2">
					<div class="float-start"><? echo number_format($goods_option_list->total_results)?> 개</div>
				</div>

				<div class="row">
					<div class="col-12">
						<table class="table table-centered w-100  nowrap table-sm table-bordered border-light table-striped" id="" cellpadding="0" cellpadding="0">
							<thead class="table-light">
								<tr>
									<th class="text-center" style="width:50px">checkbox</th>
									<th class="text-center" style="width:100px">옵션상품코드</th>
									<th class="text-center" style="width:260px">SKU</th>
									<th class="text-center">옵션상품명</th>
									<th class="text-center" style="width:90px">플랫폼</th>
									<th class="text-center" style="width:200px">공급처</th>
									<th class="text-center" style="width:80px">판매상태</th>
								</tr>
							</thead>
							<tbody>
							<?
							if($goods_option_list->success == true){
								$result = $goods_option_list->resultset->fetchAll();
								foreach($result as $value){
									if($value['game_type']=="bundle"){
										$title_info=$admin->getTitleBundle($value['product_code']);
									} else {
										$title_info=$adminGoods->getTitleInfo($value['product_code']);
									}
									
							?>
								<tr class="">
									<td class="text-center"><label for="chk_<?=$value['product_code']?>">
										<input type="checkbox" id="chk_<?=$value['product_code']?>" name="chk[]" value="<?=$value['product_code']?>" data-goodssku="<?=$value['goods_sku']?>" data-productname="<?=$value['product_name']?>" data-titleid="<?=$title_info['title_id']?>" data-sku="<?=$title_info['sku']?>" data-productplatform="<?=$adminGoods->getPlatformName($value['product_platform'])?>" data-productnameen="<?=$value['product_name']?>" data-optiontype="<?=$value['option_type']?>" data-gametype="<?=$value['game_type']?>" data-suppliercode="<?=$value['supplier_code']?>" data-suppliername="<?=$admin->getPublisherNameSearch($value['product_code'])?>">
									</label></td>
									<td class="text-center"><label for="chk_<?=$value['product_code']?>">
										<?=$value['product_code']?>
									</label></td>
									<td class="text-center"><label for="chk_<?=$value['product_code']?>">
										<span class="font-12"><?=$value['goods_sku']?></span></label>
									</td>
									<td>
										<label for="chk_<?=$value['product_code']?>"><?=$value['product_name']?><br/>
										<small>(<?=$value['product_name_en']?>)</small>
									</label></td>
									<td class="text-center"><label for="chk_<?=$value['product_code']?>">
										<?=$adminGoods->getPlatformName($value['product_platform'])?>
									</label></td>
									<td class="text-center"><label for="chk_<?=$value['product_code']?>">
										<?=$admin->getPublisherNameSearch($value['product_code'])?>
									</label></td>
									<td class="text-center"><label for="chk_<?=$value['product_code']?>">
										<?=$admin->getProductStatus($value['status'])?>
									</label></td>
								</tr>
								<?	
										}
									}
								?>
							</tbody>
						</table>
						<div class="float-end">
							<button type="button" class="btn btn-danger shadow-none" id="group_submit">그룹추가</button>
						</div>
					</div> <!-- end col -->
				</div>
<?php
		break;
		case "group_item_register":
			$admin= new Admin($conn);
			$adminGoods= new AdminGoods($conn);

			$product_code = filter_input(INPUT_POST, 'product_code', FILTER_DEFAULT, FILTER_FORCE_ARRAY);
			$title_id = filter_input(INPUT_POST, 'title_id', FILTER_DEFAULT, FILTER_FORCE_ARRAY);
			$product_name = filter_input(INPUT_POST, 'product_name', FILTER_DEFAULT, FILTER_FORCE_ARRAY);
			$product_name_en = filter_input(INPUT_POST, 'product_name_en', FILTER_DEFAULT, FILTER_FORCE_ARRAY);
			$product_platform = filter_input(INPUT_POST, 'product_platform', FILTER_DEFAULT, FILTER_FORCE_ARRAY);
			$goods_sku = filter_input(INPUT_POST, 'goods_sku', FILTER_DEFAULT, FILTER_FORCE_ARRAY);
			$supplier_code = filter_input(INPUT_POST, 'supplier_code', FILTER_DEFAULT, FILTER_FORCE_ARRAY);
			$option_type = filter_input(INPUT_POST, 'option_type', FILTER_DEFAULT, FILTER_FORCE_ARRAY);
			$game_type = filter_input(INPUT_POST, 'game_type', FILTER_DEFAULT, FILTER_FORCE_ARRAY);

			if($_FILES['upload_file']['name']){	//파일로 업로드 하는 경우
				// 파일타입 및 확장자 체크
				$fileTypeExt = explode("/", $_FILES['upload_file']['type']);

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
					if($temp_name){
						move_uploaded_file($temp_name, $uploaddir.$file_name);
					}
				}

				//업로드된 엑셀파일 읽기
				require_once $_SERVER['DOCUMENT_ROOT']."/../PHPExcel-1.8/Classes/PHPExcel.php"; // PHPExcel.php을 불러옴.	
				$objPHPExcel = new PHPExcel();	
				require_once $_SERVER['DOCUMENT_ROOT']."./../PHPExcel-1.8/Classes/PHPExcel/IOFactory.php"; // IOFactory.php을 불러옴.
				$filename = $uploaddir.$file_name; // 읽어들일 엑셀 파일의 경로와 파일명을 지정한다.

				try {	// 업로드 된 엑셀 형식에 맞는 Reader객체를 만든다.
					if($idx>0){
						$query = "DELETE FROM tbl_group_item WHERE group_idx=:idx";
						$params = array(
							":idx"=>$idx
						);
						$stmt = $conn->prepare($query);
						$stmt->execute($params);
					}

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

					for ($i = 1 ; $i <= $maxRow ; $i++) {
						$product_code = $objWorksheet->getCell('A' . $i)->getValue(); //옵션상품 코드
						
						$product_list = $admin->getGoodsItemSearch("3",$product_code);

						foreach($product_list as $value){
							$product_code = $value['product_code'];
							$product_name = $value['product_name'];
							$product_name_en = $value['product_name_en'];
							$product_platform = $admin->getProductPlatform($value['product_platform']);
							$goods_sku = $value['goods_sku'];
							$supplier_code = $value['supplier_code'];
							$option_type = $value['option_type'];
							$game_type = $value['game_type'];
							
							if($game_type=="bundle"){
								$title_info=$admin->getTitleBundle($product_code);
								$title_id=$title_info['title_id'];
							} else {
								$title_info=$adminGoods->getTitleInfo($product_code);
								$title_id=$title_info['title_id'];
							}
							
							if(!$title_id){
								$title_id="";
							}

							if($product_code && $goods_sku){
								$query = "INSERT INTO tbl_group_item 
											SET group_idx=:idx,
											product_code=:product_code,
											title_id=:title_id,
											product_name=:product_name,
											product_name_en=:product_name_en,
											product_platform=:product_platform,
											reg_date=NOW(),
											goods_sku=:goods_sku,
											supplier_code=:supplier_code,
											option_type=:option_type,
											game_type=:game_type";
								$params = array(
									":idx" => $idx,
									":product_code"     => $product_code,
									":title_id"         => $title_id,
									":product_name"     => $product_name,
									":product_name_en"  => $product_name_en,
									":product_platform" => $product_platform,
									":goods_sku"        => $goods_sku,
									":supplier_code"    => $supplier_code,
									":option_type"      => $option_type,
									":game_type"        => $game_type
								);

								$stmt = $conn->prepare($query);
								$stmt->execute($params);
							}
						}
					}
					unlink($uploaddir.$file_name);
				} catch (exception $e) {
					print_r($e);
					echo '엑셀파일을 읽는도중 오류가 발생하였습니다.<br/>';
				}
			} else {	// 파일X 직접등록
				if($idx>0){
					$query = "DELETE FROM tbl_group_item WHERE group_idx=:idx";
					$params = array(
						":idx"=>$idx
					);
					$stmt = $conn->prepare($query);
					$stmt->execute($params);
				}
				$count = count($product_code);
				for ($i = 0; $i < $count; $i++) {
					$query = "INSERT INTO tbl_group_item 
							SET group_idx=:idx,
								product_code=:product_code,
								title_id=:title_id,
								product_name=:product_name,
								product_name_en=:product_name_en,
								product_platform=:product_platform,
								reg_date=NOW(),
								goods_sku=:goods_sku,
								supplier_code=:supplier_code,
								option_type=:option_type,
								game_type=:game_type";

				$product_list = $admin->getGoodsItemSearch("3",$product_code[$i]);
				foreach($product_list as $value){
					$supplier_code = $value['supplier_code'];
				}

					$stmt = $conn->prepare($query);
					$params = array(
						":idx"     => $idx,
						":product_code"     => $product_code[$i],
						":title_id"         => $title_id[$i],
						":product_name"     => $product_name[$i],
						":product_name_en"  => $product_name_en[$i],
						":product_platform" => $product_platform[$i],
						":goods_sku"        => $goods_sku[$i],
						":supplier_code"    => $supplier_code,
						":option_type"      => $option_type[$i],
						":game_type"        => $game_type[$i],
					);
					$stmt->execute($params);
					$last_idx = $conn->lastInsertId();
				}
			}
			go("group_view.php?idx=".$idx);
		break;
	}

}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}
?>