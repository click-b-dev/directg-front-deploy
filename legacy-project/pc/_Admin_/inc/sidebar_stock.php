<link rel="stylesheet" href="https://icons.getbootstrap.kr/assets/font/bootstrap-icons.css">
<div class="leftside-menu">
	<!-- LOGO -->
	<a href="<?=$document_root?>/main.php" class="logo text-center logo-light">
		<span class="logo-lg">
			<img src="<?=$document_root?>/assets/images/H2_DG_BI_nm_160x37.png" alt="로고" >
		</span>
		<span class="logo-sm">
			<img src="<?=$document_root?>/assets/images/H2_DG_BI_nm_160x37.png" alt="로고" >
		</span>
	</a>

	<div class="h-100" id="leftside-menu-container" data-simplebar>
		<!--- Sidemenu -->
		<ul class="side-nav">
			<li class="side-nav-item">
				<a href="<?=$document_root?>/goods/stock/dashboard_stock.php" class="side-nav-link">
					<i class="uil uil-dashboard font-22"></i>
					<span> 재고 대시보드 </span>
				</a>
			</li>

			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarAsset" aria-expanded="true" aria-controls="sidebarAsset" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>Asset 서버 관리(API)</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse show" id="sidebarAsset">
					<ul class="side-nav-second-level">
							<li>
							<a href="<?=$document_root?>/goods/asset/asset_list.php">Asset 현황</a>
						</li>
						<li>
							<a href="<?=$document_root?>/goods/asset/asset_register.php">Asset 등록</a>
						</li>
						<!--
						<li>
							<a href="<?=$document_root?>/goods/asset/asset_search.php">Asset ID조회</a>
						</li>
						-->
						<li>
							<a href="<?=$document_root?>/goods/asset/asset_reserve_list.php">Asset 예약현황</a>
						</li>
						<li>
							<a href="<?=$document_root?>/goods/asset/asset_download_list.php">Asset 다운로드</a>
						</li>
						<!--
						<li>
							<a href="<?=$document_root?>/goods/asset/asset_publisher.php">공급처별 Asset현황</a>
						</li>
						-->
						<li>
							<a href="<?=$document_root?>/goods/asset/asset_code_list.php">Asset Code 현황</a>
						</li>
						<li>
							<a href="<?=$document_root?>/goods/asset/asset_code_register.php">Asset Code 등록</a>
						</li>
					</ul>
				</div>
			</li>

			<!--<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarBuy" aria-expanded="true" aria-controls="sidebarBuy" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>구매관리</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse show" id="sidebarBuy">
					<ul class="side-nav-second-level">
					<li>
						<a href="<?=$document_root?>/goods/stock/placing_order_register.php">발주</a>
					</li>
					<li>
						<a href="<?=$document_root?>/goods/stock/placing_order.php">발주현황</a>
					</li>
					<li>
						<a href="<?=$document_root?>/goods/stock/asset_stock_in_confirm.php">입고처리</a>
					</li>
					<li>
						<a href="<?=$document_root?>/goods/stock/asset_stock_in.php">입고현황</a>
					</li>
					<li>
						<a href="#">반품현황</a>
					</li>
					<li>
						<a href="<?=$document_root?>/goods/stock/placing_order_asset.php">Asset별 구매현황</a>
					</li>
					<li>
						<a href="<?=$document_root?>/goods/stock/placing_order_publisher.php">공급처별 구매현황</a>
					</li>
					</ul>
				</div>
			</li>-->

			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarVaultn" aria-expanded="true" aria-controls="sidebarVaultn" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>Vaultn 재고(API)</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse show" id="sidebarVaultn">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/goods/stock/vaultn_stock.php">Vaultn 재고현황</a>
						</li>
					</ul>
				</div>
			</li>

			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarPointNexus" aria-expanded="true" aria-controls="sidebarPointNexus" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>PointNexus 재고(API)</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse show" id="sidebarPointNexus">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/goods/stock/pointnexus_stock.php">PointNexus 재고현황</a>
						</li>
					</ul>
				</div>
			</li>

			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarStock" aria-expanded="true" aria-controls="sidebarStock" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>재고 관리(DB)</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse show" id="sidebarStock">
					<ul class="side-nav-second-level">
						<!--<li>
							<a href="<?=$document_root?>/goods/stock/asset_stock_info.php">통합재고현황</a>
						</li>-->
						<li>
							<a href="<?=$document_root?>/goods/stock/asset_stock.php">Asset 재고현황</a>
						</li>
						<li>
							<a href="<?=$document_root?>/goods/stock/goods_option_stock.php">옵션상품 재고현황</a>
						</li>
						<li>
							<a href="<?=$document_root?>/goods/stock/goods_promotion_stock.php">할인 프로모션 재고현황</a>
						</li>
						<li>
							<a href="<?=$document_root?>/goods/stock/asset_stock_random.php">Asset 랜덤박스 재고현황</a>
						</li>
					<!--	<li>
							<a href="<?=$document_root?>/goods/stock/asset_stock_publisher.php">Asset 공급처별 재고현황</a>
						</li>-->
						<!--<li>
							<a href="<?=$document_root?>/goods/stock/asset_stock_special.php">Asset 특전 재고현황</a>
						</li>
						-->
						<!--<li>
							<a href="<?=$document_root?>/goods/stock/asset_stock_basic.php">기초재고등록</a>
						</li>-->
					<!--	<li>
							<a href="<?=$document_root?>/goods/stock/goods_item_stock.php">옵션상품 재고현황</a>
						</li>
						<li>
							<a href="<?=$document_root?>/goods/stock/goods_bundle_stock.php">번들상품 재고현황</a>
						</li>
						<li>
							<a href="<?=$document_root?>/goods/stock/asset_stock_move.php">시스템별 재고현황</a>
						</li>
						<li>
							<a href="<?=$document_root?>/goods/stock/asset_stock_move.php">재고이동현황</a>
						</li>
						<li>
							<a href="<?=$document_root?>/goods/stock/asset_stock_move_register.php">재고이동등록</a>
						</li>
						<li>
							<a href="<?=$document_root?>/goods/stock/asset_stock_move_register.php">재고자산명세서</a>
						</li>-->
					</ul>
				</div>
			</li>
			
			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarStockGenba" aria-expanded="true" aria-controls="sidebarStockGenba" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>Genba Webhook Log</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse show" id="sidebarStockGenba">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/goods/stock/genba_avaliability.php">availability log</a>
						</li>
					</ul>
				</div>
			</div>
		</ul>

		<!-- End Sidebar -->

		<div class="clearfix"></div>

	</div>
	<!-- Sidebar -left -->

</div>