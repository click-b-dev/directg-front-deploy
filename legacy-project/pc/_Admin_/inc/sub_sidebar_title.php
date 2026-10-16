<div class="nav flex-column nav-pills bg-nav-pills mb-2" id="v-pills-tab" aria-orientation="vertical">
	<a class="nav-link <?=$sub_sidebar_title['view']?> rounded-0 " id="v-pills-view-tab"  href="title_view.php?title_id=<?=$title_id?>">
		<i class="mdi mdi-home-variant d-md-none d-block"></i>
		<span class="d-none d-md-block">상세보기</span>
	</a>
	<a class="nav-link <?=$sub_sidebar_title['modify']?> rounded-0 fw-500" id="v-pills-profile-tab" href="title_modify.php?title_id=<?=$title_id?>" >
		<i class="mdi mdi-account-circle d-md-none d-block"></i>
		<span class="d-none d-md-block">기본정보 설정</span>
	</a>
	<a class="nav-link <?=$sub_sidebar_title['attribute_set']?> rounded-0 fw-500" id="v-pills-profile-tab" href="title_attribute_set_register.php?title_id=<?=$title_id?>" >
		<i class="mdi mdi-account-circle d-md-none d-block"></i>
		<span class="d-none d-md-block">상품정보 제공고시 설정</span>
	</a>
	
	<?if($data['title_code']=="33"){?>
	<a class="nav-link <?=$sub_sidebar_title['grac']?> rounded-0 fw-500" id="v-pills-settings-tab"  href="title_grac_register.php?title_id=<?=$title_id?>" >
		<i class="mdi mdi-settings-outline d-md-none d-block"></i>
		<span class="d-none d-md-block">심의정보 설정</span>
	</a>
	<?}?>
	<a class="nav-link <?=$sub_sidebar_title['tag']?> rounded-0 fw-500" id="v-pills-tag-tab"  href="title_tag_register.php?title_id=<?=$title_id?>" >
		<i class="mdi mdi-settings-outline d-md-none d-block"></i>
		<span class="d-none d-md-block">태그정보 설정</span>
	</a>
	<a class="nav-link <?=$sub_sidebar_title['media']?> rounded-0 fw-500" id="v-pills-media-tab"  href="title_media_register.php?title_id=<?=$title_id?>" >
		<i class="mdi mdi-settings-outline d-md-none d-block"></i>
		<span class="d-none d-md-block">동영상 설정</span>
	</a>
	<a class="nav-link <?=$sub_sidebar_title['screenshot']?> rounded-0 fw-500" id="v-pills-screenshot-tab"  href="title_screenshot_register.php?title_id=<?=$title_id?>" >
		<i class="mdi mdi-settings-outline d-md-none d-block"></i>
		<span class="d-none d-md-block">스크린샷 설정</span>
	</a>
	<a class="nav-link <?=$sub_sidebar_title['image']?> rounded-0 fw-500" id="v-pills-image-tab"  href="title_image_register.php?title_id=<?=$title_id?>" >
		<i class="mdi mdi-settings-outline d-md-none d-block"></i>
		<span class="d-none d-md-block">이미지 설정</span>
	</a>
	<a class="nav-link <?=$sub_sidebar_title['description_v2']?> rounded-0 fw-500" id="v-pills-settings-tab"  href="title_description_register_v2.php?title_id=<?=$title_id?>" >
		<i class="mdi mdi-settings-outline d-md-none d-block"></i>
		<span class="d-none d-md-block">상세설명 설정</span>
	</a>
	<!-- <a class="nav-link <?=$sub_sidebar_title['description']?> rounded-0 fw-500" id="v-pills-settings-tab"  href="title_description_register.php?title_id=<?=$title_id?>" >
		<i class="mdi mdi-settings-outline d-md-none d-block"></i>
		<span class="d-none d-md-block">상세설명 설정( v1 )</span>
	</a> -->
	<a class="nav-link <?=$sub_sidebar_title['option']?> rounded-0 fw-500" id="v-pills-settings-tab"  href="title_option_register.php?title_id=<?=$title_id?>" >
		<i class="mdi mdi-settings-outline d-md-none d-block"></i>
		<span class="d-none d-md-block">관련상품 설정</span>
	</a>
	<!--
	<a class="nav-link rounded-0 fw-500" id="v-pills-settings-tab"  href="title_related.php?title_id=<?=$title_id?>" >
		<i class="mdi mdi-settings-outline d-md-none d-block"></i>
		<span class="d-none d-md-block">연관상품</span>
	</a>
		<a class="nav-link rounded-0 fw-500" id="v-pills-settings-tab"  href="../steam/steam_app_meta.php?appid=<?=$title_data['steam_appid']?>" >
		<i class="mdi mdi-settings-outline d-md-none d-block"></i>
		<span class="d-none d-md-block">Steam 정보</span>
	</a>
	<a class="nav-link rounded-0 fw-500" id="v-pills-settings-tab"  href="title_tag_register.php?title_id=<?=$title_id?>" >
		<i class="mdi mdi-settings-outline d-md-none d-block"></i>
		<span class="d-none d-md-block">메타크리틱 설정</span>
	</a>-->
</div>