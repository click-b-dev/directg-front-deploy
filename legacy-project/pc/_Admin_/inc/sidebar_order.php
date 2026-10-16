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
			<li class="side-nav-item">
				<a href="<?=$document_root?>/order/dashboard_order.php" class="side-nav-link">
					<i class="uil-comments-alt"></i>
					<span>주문 대시보드 </span>
				</a>
			</li>
			
			<!--
			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarOrder" aria-expanded="false" aria-controls="sidebarOrder" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>주문 관리 v1</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse show" id="sidebarOrder">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/order/order_ready.php">주문결제대기 리스트</a>
						</li>
						<li>
							<a href="<?=$document_root?>/order/order_end.php">주문결제완료 리스트</a>
						</li>
						<li>
							<a href="<?=$document_root?>/order/order_cancel_request.php">주문취소요청 리스트</a>
						</li>
						<li>
							<a href="<?=$document_root?>/order/order_cancel_end.php">주문취소완료 리스트</a>
						</li>
						<li>
							<a href="<?=$document_root?>/order/order_delete.php">주문삭제대상 리스트</a>
						</li>
					</ul>
				</div>
			</li>
			-->
			
			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarPayment" aria-expanded="false" aria-controls="sidebarPayment" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>결제 관리 v2</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarPayment">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/order/order_step1.php">입금대기 리스트</a>
						</li>
						<li>
							<a href="<?=$document_root?>/order/order_step2.php">결제완료 리스트</a>
						</li>
						<li>
							<a href="<?=$document_root?>/order/order_vbank.php">가상계좌 리스트</a>
						</li>
						<!--
						<li>
							<a href="<?=$document_root?>/order/order_sync.php">결제내역 동기화</a>
						</li>-->
					</ul>
				</div>
			</li>
			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarOrder" aria-expanded="false" aria-controls="sidebarOrder" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>주문 관리 v2</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse =" id="sidebarOrder">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/order/order_all.php">주문통합 리스트</a>
						</li>
						<li>
							<a href="<?=$document_root?>/order/order_ready.php">주문대기 리스트</a>
						</li>
						<li>
							<a href="<?=$document_root?>/order/order_success.php">주문완료 리스트</a>
						</li>
						<li>
							<a href="<?=$document_root?>/order/order_cancel_request.php">취소요청 리스트</a>
						</li>
						<li>
							<a href="<?=$document_root?>/order/order_cancel_complete.php">취소완료 리스트</a>
						</li>
                        <li>
                            <a href="<?=$document_root?>/order/order_old_list.php">과거주문 리스트</a>
                        </li>
					</ul>
				</div>
			</li>
			
			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarOrderDelivery" aria-expanded="false" aria-controls="sidebarOrderDelivery" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>배송 주문 관리 v2</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarOrderDelivery">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/order/order_shipment_all.php">배송통합 리스트</a>
						</li>
						<li>
							<a href="<?=$document_root?>/order/order_shipment_pending.php">배송대기 리스트</a>
						</li>
						<li>
							<a href="<?=$document_root?>/order/order_shipment_ready.php">배송준비 리스트</a>
						</li>
						<li>
							<a href="<?=$document_root?>/order/order_shipment_shipping.php">배송중 리스트</a>
						</li>
						<li>
							<a href="<?=$document_root?>/order/order_shipment_delivered.php">배송완료 리스트</a>
						</li>
						<li>
							<a href="<?=$document_root?>/order/order_shipment_confirm.php">구매확정 리스트</a>
						</li>
					</ul>
				</div>
			</li>
			
			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarOrderAsset" aria-expanded="false" aria-controls="sidebarOrderAsset" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>Asset 주문 관리</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarOrderAsset">
					<ul class="side-nav-second-level">
						<!--
						<li>
							<a href="<?=$document_root?>/order/order_asset_preorder.php">Asset 예약주문</a>
						</li>
						-->
						<li>
							<a href="<?=$document_root?>/order/order_asset_success.php">Asset 주문완료</a>
						</li>
						<li>
							<a href="<?=$document_root?>/order/order_asset_key.php">Asset 주문조회</a>
						</li>
						<li>
							<a href="<?=$document_root?>/order/order_asset_key_bulk.php">Asset 주문 일괄조회</a>
						</li>
						<!--
						<li>
							<a href="<?=$document_root?>/order/order_asset_fail.php">Asset 주문실패</a>
						</li>
						-->
					</ul>
				</div>
			</li>
			
			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarOrderZtorm" aria-expanded="false" aria-controls="sidebarOrderZtorm" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>Ztorm 주문 관리</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarOrderZtorm">
					<ul class="side-nav-second-level">
						<!--
						<li>
							<a href="<?=$document_root?>/order/order_ztorm_pending.php">Ztorm 주문대기</a>
						</li>
						-->
						<li>
							<a href="<?=$document_root?>/order/order_ztorm_success.php">Ztorm 주문완료</a>
						</li>
						<!--
						<li>
							<a href="<?=$document_root?>/order/order_ztorm_fail.php">Ztorm 주문실패</a>
						</li>
						-->
						<li>
							<a href="<?=$document_root?>/order/ztorm_order_view.php">Ztorm 주문조회</a>
						</li>
					</ul>
				</div>
			</li>
			
			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarOrderGenba" aria-expanded="false" aria-controls="sidebarOrderGenba" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>Genba 주문 관리</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarOrderGenba">
					<ul class="side-nav-second-level">
						<!--
						<li>
							<a href="<?=$document_root?>/order/order_genba_preorder.php">Genba 예약주문</a>
						</li>
						-->
						<li>
							<a href="<?=$document_root?>/order/order_genba_success.php">Genba 주문완료</a>
						</li>
						<!--
						<li>
							<a href="<?=$document_root?>/order/order_genba_fail.php">Genba 주문실패</a>
						</li>
						-->
						<li>
							<a href="<?=$document_root?>/order/genba_order_view.php">Genba 주문조회</a>
						</li>
					</ul>
				</div>
			</li>
			
			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarOrderVaultn" aria-expanded="false" aria-controls="sidebarOrderVaultn" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>Vaultn 주문 관리</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarOrderVaultn">
					<ul class="side-nav-second-level">
						<!--
						<li>
							<a href="<?=$document_root?>/order/order_vaultn_preorder.php">Vaultn 예약주문</a>
						</li>
						-->
						<li>
							<a href="<?=$document_root?>/order/order_vaultn_success.php">Vaultn 주문완료</a>
						</li>
						<!--
						<li>
							<a href="<?=$document_root?>/order/order_vaultna_fail.php">Vaultn 주문실패</a>
						</li>
						-->
						<!--
						<li>
							<a href="<?=$document_root?>/order/order_vaultna_cancel.php">Vaultn 주문취소</a>
						</li>
						-->
						<li>
							<a href="<?=$document_root?>/order/vaultn_order_view.php">Vaultn 주문조회</a>
						</li>
					</ul>
				</div>
			</li>
			

			<!--
			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarExchange" aria-expanded="false" aria-controls="sidebarExchange" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>반품/교환 관리 v2</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarExchange">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/order/order_exchange_request.php">반품/교환 요청 리스트</a>
						</li>
						<li>
							<a href="<?=$document_root?>/order/order_exchange_completed.php">반품/교환 완료 리스트</a>
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