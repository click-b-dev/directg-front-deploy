<?
header("Content-Type: application/json; charset=utf-8");
include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/lib/lib.php');
error_reporting(0); //JSON 출력이 notice로 깨지지 않도록

//select2 원격검색용 — 판매이력(tbl_sales) 있는 옵션상품을 상품코드/상품명으로 검색해 상위 N개만 반환
//- q(검색어)가 있으면: 코드/상품명 검색 (+공급처 필터)
//- q가 없고 supplier_code만 있으면: 해당 공급처 판매상품 목록을 타이핑 전에도 반환
$q  = trim((string)filter_input(INPUT_GET, "q", FILTER_SANITIZE_STRING));
$sc = trim((string)filter_input(INPUT_GET, "supplier_code", FILTER_SANITIZE_STRING));

$has_q  = ($q !== "");
$has_sc = ($sc !== "" && $sc !== "0");

$results = array();

if($has_q || $has_sc){
	try{
		$conn = new PDO($dsn, DB_USER, DB_PASSWORD);
		$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		$admin = new Admin($conn);

		if(!$has_q && $has_sc){
			//[공급처만 선택 — 타이핑 전] 해당 공급처(판매당시)에서 판매된 상품 목록 (등록/미등록 모두)
			$sql = "select sp.product_code,
					coalesce(b.product_name, b.product_name_en,(select t2.product_name from tbl_sales t2 where t2.product_code=sp.product_code order by t2.ord_ymd desc limit 1)) as product_name,
					b.product_platform,b.product_code as cur_code
				from (select distinct product_code from tbl_sales where supplier_code=:sc) sp
				left join tbl_goods_item b on sp.product_code=b.product_code
				order by product_name
				limit 100";
			$stmt = $conn->prepare($sql);
			$stmt->execute(array(":sc"=>$sc));
			foreach($stmt->fetchAll() as $r){
				$tail = ($r['cur_code']===null) ? "미등록" : $admin->getProductPlatform($r['product_platform']);
				$results[] = array(
					"id"   => $r['product_code'],
					"text" => "[".$r['product_code']."] ".$r['product_name']." (".$tail.")"
				);
			}
		}else{
			//[검색어 입력] 상품코드/상품명 검색 (+공급처 필터)
			$like   = "%".$q."%";  //등록상품: 코드/이름 부분일치
			$likep  = $q."%";      //미등록상품: 코드 prefix (인덱스 range scan)
			$seen   = array();

			//1) 등록상품(소형 테이블 tbl_goods_item) — 코드/상품명 검색 + 판매이력 존재(+공급처)
			$sc_cond1 = $has_sc ? " and coalesce(x.supplier_code,b.supplier_code)=:sc" : "";
			$sql1 = "select b.product_code,b.product_name,b.product_name_en,b.product_platform
				from tbl_goods_item b
				where (b.product_code like :kw or b.product_name like :kw or b.product_name_en like :kw)
				  and exists(select 1 from tbl_sales x where x.product_code=b.product_code".$sc_cond1.")
				order by b.product_name
				limit 30";
			$stmt = $conn->prepare($sql1);
			$p1 = array(":kw"=>$like);
			if($has_sc){ $p1[":sc"]=$sc; }
			$stmt->execute($p1);
			foreach($stmt->fetchAll() as $r){
				$seen[$r['product_code']] = true;
				$results[] = array(
					"id"   => $r['product_code'],
					"text" => "[".$r['product_code']."] ".$r['product_name']." (".$admin->getProductPlatform($r['product_platform']).")"
				);
			}

			//2) 미등록상품(현재 tbl_goods_item에 없음) — 상품코드 prefix로만 검색(+공급처). 남은 자리만 채움
			if(count($results) < 30){
				$sc_cond2 = $has_sc ? " and supplier_code=:sc" : "";
				$sql2 = "select ts.product_code,
						(select t2.product_name from tbl_sales t2 where t2.product_code=ts.product_code order by t2.ord_ymd desc limit 1) as product_name
					from (select distinct product_code from tbl_sales where product_code like :kwp".$sc_cond2.") ts
					left join tbl_goods_item b on ts.product_code=b.product_code
					where b.product_code is null
					limit 30";
				$stmt = $conn->prepare($sql2);
				$p2 = array(":kwp"=>$likep);
				if($has_sc){ $p2[":sc"]=$sc; }
				$stmt->execute($p2);
				foreach($stmt->fetchAll() as $r){
					if(isset($seen[$r['product_code']])){ continue; }
					$results[] = array(
						"id"   => $r['product_code'],
						"text" => "[".$r['product_code']."] ".$r['product_name']." (미등록)"
					);
					if(count($results) >= 30){ break; }
				}
			}
		}
	}catch(PDOException $e){
		//오류 시 빈 결과 반환
	}
}

echo json_encode(array("results"=>$results));
