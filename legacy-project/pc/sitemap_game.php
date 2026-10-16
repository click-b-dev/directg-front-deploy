<?
ini_set("display_errors", 0);
$charset = "UTF-8";
header("Content-type: text/xml;charset=$charset");
header("Cache-Control: no-cache, must-revalidate");
header("Pragma: no-cache");

include_once($_SERVER["DOCUMENT_ROOT"].'/lib/lib.php');

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$query="select sku from tbl_goods where is_view='Y' and sales_status='S' order by  release_date desc limit 30";
	$stmt = $conn->prepare($query);
	$stmt->execute();

	$data = $stmt->fetchAll();
}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

echo "<?xml version=\"1.0\" encoding=\"$charset\"?>\n";
?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
<?foreach($data as $value){?>
<url><loc>https://directg.net/game/game_view.html?product_id=<?=$value['sku']?></loc><changefreq>monthly</changefreq></url>
<?}?>
</urlset>