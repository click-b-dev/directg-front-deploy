<div class="leftside-menu">
	<!-- LOGO -->
	<a href="/_Admin_/main.php" class="logo text-center logo-light">
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
			<!--
			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarMember" aria-expanded="false" aria-controls="sidebarMember" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>회원 분석</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarMember">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/statistics/member/member_country_count.php">접속국가별 회원 통계</a>
						</li>
						<li>
							<a href="<?=$document_root?>/statistics/member/member_login_count.php">회원로그인 통계</a>
						</li>
						<li>
							<a href="<?=$document_root?>/statistics/member/member_join_count.php">회원가입 통계</a>
						</li>
						<li>
							<a href="<?=$document_root?>/statistics/member/member_point.php">회원포인트 통계</a>
						</li>
					</ul>
				</div>
			</li>
			-->

			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarGoods" aria-expanded="false" aria-controls="sidebarGoods" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>상품 분석</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarGoods">
					<ul class="side-nav-second-level">
						<!--
						<li>
							<a href="<?=$document_root?>/statistics/goods/goods_supplier_count.php">공급처별 상품현황</a>
						</li>
						<li>
							<a href="<?=$document_root?>/statistics/goods/goods_preorder_count.php">예약판매 상품현황</a>
						</li>
						-->
						<li>
							<a href="<?=$document_root?>/statistics/goods/title_ranking.php">인기타이틀 순위</a>
						</li>
						<li>
							<a href="<?=$document_root?>/statistics/goods/metacritic_score.php">Metacritic Score</a>
						</li>
						<!--
						<li>
							<a href="<?=$document_root?>/statistics/goods/goods_cart_count.php">장바구니 통계</a>
						</li>
						<li>
							<a href="<?=$document_root?>/statistics/goods/goods_wishlist_count.php">위시리스트 통계</a>
						</li>
						-->
					</ul>
				</div>
			</li>

			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarOrder" aria-expanded="false" aria-controls="sidebarOrder" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>주문 분석</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarOrder">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/statistics/order/order_day_count.php">일별 주문집계</a>
						</li>
						<li>
							<a href="<?=$document_root?>/statistics/order/order_month_count.php">월별 주문집계</a>
						</li>
						<li>
							<a href="<?=$document_root?>/statistics/order/order_title_count.php">대표상품별 주문통계</a>
						</li>
						<li>
							<a href="<?=$document_root?>/statistics/order/order_goods_count.php">옵션상품별 주문통계</a>
						</li>
						<li>
							<a href="<?=$document_root?>/statistics/order/order_publisher_count.php">공급처 주문통계</a>
						</li>
						<li>
							<a href="<?=$document_root?>/statistics/order/order_goods_publisher_count.php">공급처 - 옵션상품 통계</a>
						</li>
						<li>
							<a href="<?=$document_root?>/statistics/order/sales_goods_day.php">기간별 주문통계</a>
						</li>
						<!--
						<!--
						<li>
							<a href="<?=$document_root?>/statistics/order/order_retail_count.php">실물상품별 주문현황</a>
						</li>
						-->
						<!--
						<li>
							<a href="<?=$document_root?>/statistics/order/goods_ranking.php">누적판매순위</a>
						</li>
						-->
					</ul>
				</div>
			</li>
			
			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarOrderAsset" aria-expanded="false" aria-controls="sidebarOrderAsset" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>Asset 주문 분석</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarOrderAsset">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/statistics/order/order_asset_day_count.php">Asset 일별 주문현황</a>
						</li>
						<li>
							<a href="<?=$document_root?>/statistics/order/order_asset_month_count.php">Asset 월별 주문현황</a>
						</li>
						<!--
						<li>
							<a href="<?=$document_root?>/statistics/order/asset_publisher_count.php">Asset 퍼블리셔 주문현황</a>
						</li>
						-->
						<!--
						<li>
							<a href="<?=$document_root?>/statistics/order/order_asset_total_count.php">Asset 누적 주문현황</a>
						</li>
						-->
					</ul>
				</div>
			</li>
			
			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarOrderZtorm" aria-expanded="false" aria-controls="sidebarOrderZtorm" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>Ztorm 주문 분석</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarOrderZtorm">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/statistics/order/order_ztorm_day_count.php">Ztorm 일별 주문현황</a>
						</li>
						<li>
							<a href="<?=$document_root?>/statistics/order/order_ztorm_month_count.php">Ztorm 월별 주문현황</a>
						</li>
						<!--
						<li>
							<a href="<?=$document_root?>/statistics/order/order_ztorm_day_count.php">[X] Ztorm 누적 주문현황</a>
						</li>
						-->
					</ul>
				</div>
			</li>
			
			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarOrderGenba" aria-expanded="false" aria-controls="sidebarOrderGenba" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>Genba 주문 분석</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarOrderGenba">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/statistics/order/order_genba_day_count.php">Genba 일별 주문현황</a>
						</li>
						<li>
							<a href="<?=$document_root?>/statistics/order/order_genba_month_count.php">Genba 월별 주문현황</a>
						</li>
						<li>
							<a href="<?=$document_root?>/statistics/order/genba_publisher_count.php">Genba 퍼블리셔 주문현황</a>
						</li>
						<li>
							<a href="<?=$document_root?>/statistics/order/genba_total_count.php">Genba 누적 주문현황</a>
						</li>
					</ul>
				</div>
			</li>
			
			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarOrderVaultn" aria-expanded="false" aria-controls="sidebarOrderVaultn" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>Vaultn 주문 분석</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarOrderVaultn">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/statistics/order/order_vaultn_day_count.php">Vaultn 일별 주문현황</a>
						</li>
						<li>
							<a href="<?=$document_root?>/statistics/order/order_vaultn_month_count.php">Vaultn 월별 주문현황</a>
						</li>
						<li>
							<a href="<?=$document_root?>/statistics/order/vaultn_total_count.php">Vaultn 누적 주문현황</a>
						</li>
						<li>
							<a href="<?=$document_root?>/statistics/order/order_vaultn_month_count_compare.php">VaultN 월별 주문현황(리포트 비교용)</a>
						</li>
					</ul>
				</div>
			</li>

			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarOrderHolomodels" aria-expanded="false" aria-controls="sidebarOrderHolomodels" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>홀로 모델 주문 분석</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarOrderHolomodels">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/statistics/order/order_holomodels_count.php">홀로 모델 월별 주문현황</a>
						</li>
					</ul>
				</div>
			</li>

			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarSales" aria-expanded="false" aria-controls="sidebarSales" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>결제 분석</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarSales">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/statistics/sales/sales_day.php">일별 매출현황</a>
						</li>
						<li>
							<a href="<?=$document_root?>/statistics/sales/sales_month.php">월별 매출현황</a>
						</li>
						<li>
							<a href="<?=$document_root?>/statistics/sales/sales_pg.php">PG별 결제현황</a>
						</li>
						<li>
							<a href="<?=$document_root?>/statistics/sales/sales_settlekind.php">[X] 결제수단별 결제현황</a>
						</li>
						<!--
						<li>
							<a href="<?=$document_root?>/statistics/sales/sales_title.php">[X] 타이틀별 매출현황</a>
						</li>
						
						<li>
							<a href="<?=$document_root?>/statistics/sales/sales_publisher.php">[X] 공급처별 매출현황</a>
						</li>
						-->
						<li>
							<a href="<?=$document_root?>/statistics/sales/sales_emoney.php">[X] 포인트 적립/사용 현황</a>
						</li>
					</ul>
				</div>
			</li>
			
			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarPromotion" aria-expanded="false" aria-controls="sidebarPromotion" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>할인 프로모션 분석</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarPromotion">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/statistics/promotion/promotion_report.php">할인 프로모션 주문통계</a>
						</li>
					</ul>
				</div>
			</li>
			
			<!--
			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarEzwel" aria-expanded="false" aria-controls="sidebarEzwel" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>제휴DG 분석</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarEzwel">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/statistics/partnership/goods_publisher.php">[X] 방문자통계</a>
						</li>
						<li>
							<a href="<?=$document_root?>/statistics/partnership/goods_publisher.php">[X] 고객사별 회원통계</a>
						</li>
						<li>
							<a href="<?=$document_root?>/statistics/partnership/goods_publisher.php">[X] 상품별 주문통계</a>
						</li>
						<li>
							<a href="<?=$document_root?>/statistics/partnership/goods_publisher.php">[X] 퍼블리셔별 주문통계</a>
						</li>
						<li>
							<a href="<?=$document_root?>/statistics/partnership/goods_publisher.php">[X] 일별 매출통계</a>
						</li>
						<li>
							<a href="<?=$document_root?>/statistics/partnership/goods_publisher.php">[X] 월별 매출통계</a>
						</li>
						<li>
							<a href="<?=$document_root?>/statistics/partnership/goods_publisher.php">[X] 고객사별 매출통계</a>
						</li>
					</ul>
				</div>
			</li>
			-->
			<!--
			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarPromotion" aria-expanded="false" aria-controls="sidebarPromotion" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>프로모션 분석</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarPromotion">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/statistics/promotion/promotion_report.php">[X] 프로모션 진행이력</a>
						</li>
							<li>
							<a href="<?=$document_root?>/statistics/promotion/promotion_sales_report.php">[X] 프로모션별 판매현황</a>
						</li>
						<li>
							<a href="<?=$document_root?>/statistics/promotion/promotion_title_report.php">[X] 대표상품별 판매현황</a>
						</li>
						<li>
							<a href="<?=$document_root?>/statistics/promotion/promotion_goods_option_report.php">[X] 옵션상품별 판매현황</a>
						</li>
					</ul>
				</div>
			</li>
			-->
			<!--
			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarRandombox" aria-expanded="false" aria-controls="sidebarRandombox" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>랜덤박스 통계</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarRandombox">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/statistics/order/randombox_history.php">[X] 랜덤박스 진행현황</a>
						</li>
						<li>
							<a href="<?=$document_root?>/statistics/order/randombox_report.php">[X] 랜덤박스 리포트</a>
						</li>
					</ul>
				</div>
			</li>
			-->
		</ul>

		<!-- End Sidebar -->

		<div class="clearfix"></div>

	</div>
	<!-- Sidebar -left -->

</div>