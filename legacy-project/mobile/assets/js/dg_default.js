$(window).bind("pageshow", function(event) {

    if (event.originalEvent.persisted) {

        document.location.reload();

    }

	// Go Back Button
	$(".goBack").bind("click",function () {
		window.history.go(-1);
	});

});