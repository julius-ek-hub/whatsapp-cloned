# WhatsApp Clone

This is my very first project on Github. A fully functioning full stack Web App.
I call it WhatsApp Clone because it looks like WhatsApp except that its a little crappier.
It is completely free to clone or download and modify for any use whatsoever.
The entire App runs on a single page, the JavaScript is pure with no Libraries or Frameworks. So it's beginner friendly.

## Configurations

When you download or clone this project, there are a few things you must change in order for it to work

1. Change the value of `ROOT` in [src/Config.php](https://github.com/julius-ek-hub/whatsapp-clone/blob/b6a90a955782b8ea92fb90b4ae74ccc7f145b587/src/Config.php#L2 "root") to match the name of the the root directory parenting the entire project.

2. Optionally change `THEME_COL` value in [src/Config.php](https://github.com/julius-ek-hub/whatsapp-clone/blob/b6a90a955782b8ea92fb90b4ae74ccc7f145b587/src/Config.php#L4 "THEME_COL") to the color of your choice. This is the browser's addres bar background color.

3. Change the `CONN` values in [src/Config.php](https://github.com/julius-ek-hub/whatsapp-clone/blob/b6a90a955782b8ea92fb90b4ae74ccc7f145b587/src/Config.php#L9 "Config.php") to match the settings of your local or remote Database connections. Eg.

```php
define('CONN', array(
    'HOST' => 'localhost',
    'DBNAME' => 'whatsapp_clone_db',
    'DBUSER' => 'root',
    'PASSWORD' => 'Qtrr454&^FGg676'
));
```

The Database enviroment would be dynamically created from your values here. Make sure not to use a Database name `DBNAME` that already exists else its not a problem though because it'll use the one you have created, just make sure it is void of tables so you don't get confused or it contains a table that the project may at one time try to create in the database dynamically thereby causing errors.

4. If you want mailing to function, like when user reports, rates, adds email etc. The you need to do some stuffs.

- First if you don't have a composer installed in your machine, you need to download it [here](https://getcomposer.org/Composer-Setup.exe "Get composer") and install then...
- Open your command prompt/command line as administrator then change directory upto ./composer folder in the project then type `composer require phpmailer/phpmailer` to install phpmailer in the composer directory. Having issues? [Read this](https://github.com/PHPMailer/PHPMailer "phpmailer") or [Contact Me](https://github.com/PHPMailer/PHPMailer)
- Edit the `MAILER` in [src/Config.php](https://github.com/julius-ek-hub/whatsapp-clone/blob/3687fbc7055834e6d6e0fe078915a50d244dd0e2/src/Config.php#L23 "MAILER") with your credentials. This is where you will be extracting your `from` addresses.

5. If you want to host this project on a life server, you need to have your own copy of fontawesome link. If you don't have a copy, then [register with Font Awesome](https://fontawesome.com/start "font awesome") by providing only email to acquire an absolutely free link for the project. Replace your link with [this one](https://github.com/julius-ek-hub/whatsapp-clone/blob/b6a90a955782b8ea92fb90b4ae74ccc7f145b587/src/Config.php#L92 "font awesome"). Make sure its Font Awesome 5. Your link would look like below

```html
<script
  src="https://kit.fontawesome.com/yourcode.js"
  crossorigin="anonymous"
></script>
```

6. If you have cloned this project out of the UAE or have a different time zone from the UAE then you may want to change `date_default_timezone_set('Asia/Dubai')` in [src/actions.php](https://github.com/julius-ek-hub/whatsapp-clone/blob/3687fbc7055834e6d6e0fe078915a50d244dd0e2/src/actions.php#L2 "Time zone") to the value of your time zone. This doesn't really matter just leave it if you don't know. Its main purpose is that at any point if I need to get `time()` (int), it should be the same for everyone.
