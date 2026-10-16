<?
spl_autoload_register(function($className) {
  $dirs = array(
        'classes/',
    );

    foreach($dirs as $dir) {
		$file = str_replace('\\', DIRECTORY_SEPARATOR, $className).'.php';
        if(file_exists(__DIR__ . '/../' . $dir. $file)) {
            require_once(__DIR__ . '/../' . $dir. $file);
            return;
        }
    }
    throw new Exception('Can not load class : ' . $className);

});
?>
