<?
class Draw{
	private $_db;
	private $goods;
	private $mypage;
	private $promotion;

	//클래스 생성자
	public function __construct(PDO $db){
		$this->_db = $db;
		$this->goods = new Goods($db);
		$this->promotion = new Promotion($db);
		$this->mypage = new Mypage2($db);
	}
	
	//26-01-13(화) 16:08 [이종석] resultset, m_no 를 받아서 출력할 상품정보를 만듬
	public function getProductInfo($datas,$m_no){
		$products=array_column($datas, 'product_code');
		
		if(count($products)>0){

			$wishlist = $this->mypage->getWishlistByProducts($m_no, $products);

			$wish = array();
			foreach($wishlist as $value){
				array_push($wish,$value['product_code']);
			}
			
			$promotions = $this->promotion->getPromotionGoodsPriceByProducts($products);

			foreach($promotions as $promotion){
				$promotion_arr[$promotion['product_code']] = $promotion;
			}

			$titles=$this->goods->getGoodsOptionTitleInfoByProducts($products);
			foreach ($titles as $title) {
				$title_arr[$title['product_code']] = $title;
			}
			
			$add_repays = $this->promotion->getAddrepayGoods($products);
			foreach($add_repays as $add_repay){
				$add_repay_arr[$add_repay['product_code']] = $add_repay;
			}

			$data = array();
			foreach($datas as $value){
				if(isset($promotion_arr[$value['product_code']])){
					if($promotion_arr[$value['product_code']]['sale_price']>0){
						$value['discount'] =$promotion_arr[$value['product_code']]['discount_rate'];
						$value['price'] =$promotion_arr[$value['product_code']]['sale_price'];
					}
					$value['is_promotion']="Y";
					$value['promotion_label']="bg-danger";
					$value['promotion_end']=$promotion_arr[$value['product_code']]['promotion_end'];
				} else {
					$value['is_promotion']="N";
					$value['promotion_label']="bg-primary";
				}

				if(isset($add_repay_arr[$value['product_code']])){
					$value['is_add_repay']="Y";
					$value['repay_point']=number_format($value['repay_point']).$value['repay_type'];
				} else {
					$value['is_add_repay']="N";
				}

				if(in_array($value['product_code'], $wish)){
					$value['wishlist_chk']="Y";
				} else {
					$value['wishlist_chk']="N";
				}

				//대표상품정보 
				$value['title_info']=$title_arr[$value['product_code']];

				switch($value['game_type']){
					case "game":
						$view_url = "/game/game_view.html?product_id=".$value['title_info']['sku']."&sku=".$value['goods_sku']."&platform=".$value['product_platform'];
					break;
					case "holomodels":
						$view_url = "/game/holomodels_view.html?product_id=".$value['title_info']['sku']."&sku=".$value['goods_sku']."&platform=".$value['product_platform'];
						if($value['display_type']=="holomodelsdlc"){
							$view_url = "/game/holomodelsdlc_view.html?sku=".$value['goods_sku']."&platform=".$value['product_platform'];
						}
					break;
					case "dlc":
						if($value['display_type']=="dlc_bundle"){
							$view_url = "/game/dlc_view.html?sku=".$value['goods_sku']."&platform=".$value['product_platform'];
						}else{
							$view_url = "/game/dlc_view.html?sku=".$value['goods_sku']."&platform=".$value['product_platform'];
						}
					break;
					case "music":
						$view_url = "/game/dlc_view.html?sku=".$value['goods_sku']."&platform=".$value['product_platform'];
					break;
					case "bundle":
						$view_url = "/game/bundle_view.html?sku=".$value['goods_sku']."&platform=".$value['product_platform'];
					break;
					case "accessories":
						$view_url = "/game/goods_item_view.html?product_id=".$value['title_info']['sku']."&sku=".$value['goods_sku']."&platform=".$value['product_platform'];
					break;
				}
				$value['view_url']=$view_url;
				array_push($data, $value);
			}
		}
		return $data;
	}
	
	public function drawSmallList($product_codes,$m_no){
		$data = $this->getProductInfo($product_codes,$m_no);

		foreach ($data as $value) {
			include($_SERVER['DOCUMENT_ROOT'].'/game/small_list_inc.php');
		}
	}
	public function drawList($product_codes,$m_no){
		$data = $this->getProductInfo($product_codes,$m_no);

		foreach ($data as $value) {
			include($_SERVER['DOCUMENT_ROOT'].'/game/list_inc.php');
		}
	}

	public function drawThumb($product_codes,$m_no){
		$data = $this->getProductInfo($product_codes,$m_no);

		foreach ($data as $value) {
			include($_SERVER['DOCUMENT_ROOT'].'/game/thumb_inc.php');
		}
	}

	public function drawGrid($product_codes,$m_no){
//debug($product_codes);
//deub($m_no);
		$data = $this->getProductInfo($product_codes,$m_no);

		foreach ($data as $value) {
			include($_SERVER['DOCUMENT_ROOT'].'/game/grid_inc.php');
		}
	}

	//클래스 소멸자
	public function __destruct() {
		$this->_db=null;
		$this->goods=null;
		$this->mypage=null;
		$this->promotion=null;
	}
}
?>