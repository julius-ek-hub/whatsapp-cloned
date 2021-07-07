<?php

define('ROOT', 'http://localhost/whatsapp-clone');
// Color of the addres bar
define('THEME_COL', '#1BA691');
// Keywords for SEO
define('KEY_WORDS', 'codes, coding, projects, blogs, programming, js, javascript, IT, python, PHP');

//Database connection settings
define('CONN', array(
    'HOST' => 'localhost',
    'DBNAME' => 'whatsapp_clone_db',
    'DBUSER' => 'root',
    'PASSWORD' => ''
));

/**
 * After installing phpmailer, you have to edit this array to your email credentials.
 * When you send an email from the client (JS), the `from` property would only accept any of admin, info, no_rep .... 
 * You can add more emails if you have, following the same order and then refer to it from the client side using the 
 * main property and the rest will be automatically taken.
 */
define('MAILER', array(
    'admin' => array(
        'name' => 'WhatsApp Clone Admin',
        'addr' => 'username@youremailprovider.theirextension', //eg james@website.com
        'password' => 'password-to-this-email'
    ),
    'info' => array(
        'name' => 'Infomation',
        'addr' => 'info@youremailprovider.theirextension', //eg info@247-dev.com
        'password' => 'password-to-this-email'
    ),
    'no_rep' => array(
        'name' => '247-dev',
        'addr' => 'do-not-reply@youremailprovider.theirextension', // eg no-reply@google.com
        'password' => 'password-to-this-email'
    ),
    'host' => 'yourhostingcompany', // eg smtp.hostinger.com, smtp.gmail.com
    'port' => 587 //mostly 587
    ));

//This function returns the appropriate meta tags, cool when when you have multiple pages 
function head_meta($d){
    $ds = $d['description'];
    $tn = $d['image'];
    $t = $d['title'];
    $url = $d['url'];
    $typ = $d['type'];
    $tc = $d['theme-col'];
    $ROOT = ROOT;  
    $data = <<< _END
    
    <title>$t</title>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="$tc">

    <!-- SEO -->

    <meta name="description" content="$ds"/>
    <meta property="image" content="$tn" />

    <!-- Social -->
    <!-- Facebook OpenGrap -->

    <meta property="og:type" content="$typ" />
    <meta property="og:title" content="$t" />
    <meta property="og:description" content="$ds" />
    <meta property="og:image" content="$tn" />
    <meta property="og:url" content="$url" />
    <meta property="og:site_name" content="247 Developer" />

    <!-- Twitter -->

    <meta name="twitter:title" content="$t">
    <meta name="twitter:description" content="$ds">
    <meta name="twitter:image" content="$tn">
    <meta name="twitter:site" content="247 Developer">
    <meta name="twitter:creator" content="@247Developer">

_END;
return $data;
}

// Repeated links for multiple pages
function head_urls($d){
    $ROOT = ROOT;
    $gcss = $d['global_css'] ? '<link rel="stylesheet" href="' . ROOT. '/css/global.css">' : '';
    $data = <<< _END

    <script src="https://kit.fontawesome.com/d26d3e999a.js" crossorigin="anonymous"></script>
    <link rel="preload" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" as="style">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
    <link href="https://fonts.googleapis.com/css?family=Material+Icons|Material+Icons+Outlined|Material+Icons+Two+Tone|Material+Icons+Round|Material+Icons+Sharp" rel="stylesheet">
    <link rel="stylesheet" href="$ROOT/css/helper.css">
    $gcss
 
_END;

return $data;
}
?>