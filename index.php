<?php
include 'src/Config.php';
include 'src/abs-classes/DBC.class.php';
$description = 'Try testing this project built using only PHP, MySQL, JavaScript and HTML5/CSS3';
$thumbnail = './images/whatsapp-logo.png';
if (isset($_GET['invite']) && !empty($_GET['invite'])) {
    $ik = $_GET['invite'];
    $db = new DBC(CONN);
    try {
		$info = $db->exec("SELECT id, username, dp, tel, country FROM visitors WHERE invitation_key = '$ik'");
        if($info->num_rows == 1){
        $info = $info->fetch_assoc();
        $country = $db->exec("SELECT nicename FROM country WHERE iso = '" . $info['country'] . "'")->fetch_assoc()['nicename'];
        $description = ($info['username'] == 'Visitor' ? $info['tel'] : $info['username']) . ' from ' . $country . ' will like to test WhatsApp Clone with you';
        if(!empty($info['dp'])){
            $thumbnail = './visitors/' . $info['id'] . '/dp/' . $info['dp'];
         }
        }
    } catch (MYSQLException $e) {}
}
?>
<!DOCTYPE html>
<html lang = "en">
<head>
    <?php
     echo head_meta(array(
        'description' => $description,
        'image' => $thumbnail,
        'keywords' => 'whatsapp, projects, javascript, php, mysql',
        'title' => 'WhatsApp Clone | App',
        'type' => 'app',
        'theme-col' => THEME_COL,
    ));
   
     echo head_urls(array(
        'global_css' => false
    ));
    ?>
    <link rel="stylesheet" href="./css/style.css">
</head>

<body>
    <script type="module" src="./app.js"></script>
    <script nomodule>
        document.write('This browser does not support modules');
    </script>
    <noscript>
        Please enable JavaScript on your browser
    </noscript>
 

</body>

</html>