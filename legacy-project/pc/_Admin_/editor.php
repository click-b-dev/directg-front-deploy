<?
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$page_title = "대표상품 상세보기";

$json_path =  "/home/dgkrshop/www/upload/apps/apps_3112260.json";


if(file_exists($json_path)){
	$json_string = file_get_contents($json_path);
	$json_data = json_decode($json_string, true);

	$header_image = $json_data['3112260']['data']['header_image'];
	$capsule_image = $json_data['3112260']['data']['capsule_image'];
	$capsule_imagev5 = $json_data['3112260']['data']['capsule_imagev5'];

	$about_the_game = $json_data['3112260']['data']['about_the_game'];
	//echo $header_image;
}
?>
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php'); ?>
<body>
<link href="https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css" rel="stylesheet" />

<!-- Create the editor container -->
<div id="editor"><?=htmlspecialchars_decode($about_the_game)?></div>

<script src="<?=$document_root?>/assets/js/vendor.min.js"></script>
<script src="<?=$document_root?>/assets/js/app.min.js"></script>

<!-- Include the Quill library -->
<script src="https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.js"></script>

<!-- Initialize Quill editor -->
<script>
	const toolbarOptions = [
	  ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
	  ['blockquote', 'code-block'],
	  ['link', 'image', 'video', 'formula'],

	  [{ 'header': 1 }, { 'header': 2 }],               // custom button values
	  [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
	  [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
	  [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
	  [{ 'direction': 'rtl' }],                         // text direction

	  [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
	  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

	  [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
	  [{ 'font': [] }],
	  [{ 'align': [] }],

	  ['clean']                                         // remove formatting button
	];
  const quill = new Quill('#editor', {
	modules: {
		toolbar: toolbarOptions
	},
    theme: 'snow'
  });
</script>
</body>
</html>
