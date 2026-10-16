$(function() {
	$('#btn_filter').on('click', function(){
		goodsFilter();
	});
	
	$('#sort').on('change', function() {
		goodsFilter();
	});
	
	$("#btn_reset").on('click', function() {
		$('#sidebar input[type="checkbox"], #sidebar input[type="radio"]').prop('checked', false);
	});
	
	var goodsFilter = function(){
		var is_promotion = $('input[name=is_promotion]:checked').val();
		var is_preorder = $('input[name=is_preorder]:checked').val();
		var is_bonus = $('input[name=is_bonus]:checked').val();
		var is_repay = $('input[name=is_repay]:checked').val();
		var game_type = $('input[name=game_type]:checked').val();
		var search_platform = $('input[name=platform]:checked').val();
		var genre_code = $('input[name=genre_code]:checked').val();

		var interface_korean = $('input[name=interface_korean]:checked').val();
		var spoken_korean = $('input[name=spoken_korean]:checked').val();
		var exclusive_korean = $('input[name=exclusive_korean]:checked').val();
		
		var search_price = $('input[name=search_price]:checked').val();
		var sort = $('select[name=sort] option:selected').val();

		var search_tags = [];
		$("input[name=category_code]:checked").each(function(){
			var chk_tag = $(this).val();
			search_tags.push(chk_tag);
		});

		var new_form = $('<form></form>');
		new_form.attr("name", "test_form");
		new_form.attr("method", "get");
		new_form.attr("action", "");

		if(is_promotion){
			new_form.append($('<input/>', {type: 'hidden', name: 'is_promotion', value: is_promotion}));
		}
		if(is_preorder){
			new_form.append($('<input/>', {type: 'hidden', name: 'is_preorder', value: is_preorder}));
		}
		if(is_bonus){
			new_form.append($('<input/>', {type: 'hidden', name: 'is_bonus', value: is_bonus}));
		}
		if(is_repay){
			new_form.append($('<input/>', {type: 'hidden', name: 'is_repay', value: is_repay}));
		}
		if(game_type){
			new_form.append($('<input/>', {type: 'hidden', name: 'game_type', value: game_type}));
		}
		if(search_platform){
			new_form.append($('<input/>', {type: 'hidden', name: 'platform', value: search_platform}));
		}
		if(genre_code){
			new_form.append($('<input/>', {type: 'hidden', name: 'genre_code', value: genre_code}));
		}
		if(interface_korean){
			new_form.append($('<input/>', {type: 'hidden', name: 'interface_korean', value: interface_korean}));
		}
		if(exclusive_korean){
			new_form.append($('<input/>', {type: 'hidden', name: 'exclusive_korean', value: exclusive_korean}));
		}
		if(spoken_korean){
			new_form.append($('<input/>', {type: 'hidden', name: 'spoken_korean', value: spoken_korean}));
		}
		if(search_tags){
			new_form.append($('<input/>', {type: 'hidden', name: 'category_code', value: search_tags}));
		}
		if(search_price){
			new_form.append($('<input/>', {type: 'hidden', name: 'search_price', value: search_price}));
		}
		new_form.append($('<input/>', {type: 'hidden', name: 'sort', value: sort}));
		new_form.appendTo('body');
		new_form.submit();
	}

});