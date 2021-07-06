# WhatsApp Clone

This is my very first project on Github. A fully functioning full stack Web App.
I call it WhatsApp Clone because it is like WhatsApp except that its crapier.
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

4. If you want to host this project on a life server, you need to have your own copy of fontawesome link. If you don't have a copy, then [register with Font Awesome](https://fontawesome.com/start "font awesome") by providing only email to acquire an absolutely free link for the project. Replace your link with [this one](https://github.com/julius-ek-hub/whatsapp-clone/blob/b6a90a955782b8ea92fb90b4ae74ccc7f145b587/src/Config.php#L92 "font awesome"). Make sure is Font Awesome 5. Your link would look like

```html
<script
  src="https://kit.fontawesome.com/yourcode.js"
  crossorigin="anonymous"
></script>
```
