# WhatsApp Clone

This is my very first project on Github. A fully functioning full stack Web App.
I call it WhatsApp Clone because it is like WhatsApp except that its crapier.
It is completely free to clone or download and modify for any use whatsoever.
The entire App runs on a single page, the JavaScript is pure with no Libraries or Frameworks. So it's beginner friendly.

## Configurations

When you download or clone this project, there are a few things you must change in order for it to work

1. Change the `CONN` values for the [src/Config.php](https://github.com/julius-ek-hub/whatsapp-clone/blob/b6a90a955782b8ea92fb90b4ae74ccc7f145b587/src/Config.php#L9 "Config.php") to match the settings of your local or remote Database connections. Eg.

```php
define('CONN', array(
    'HOST' => 'localhost',
    'DBNAME' => 'whatsapp_clone_db',
    'DBUSER' => 'root',
    'PASSWORD' => 'Qtrr454&^FGg676'
));
```

The Database enviroment would be dynamically created from your values here. Make sure not to use a Database name `DBNAME` that already exists else its not a problem though because we'll use the one you have created, just make sure its void of tables so you don't get confused or it contains a table that the project may at one time try to create in the database dynamically and therefore causes errors.
