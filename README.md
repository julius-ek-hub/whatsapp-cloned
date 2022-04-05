# WhatsApp Clone

A fully functioning full stack Web App.

Call it WhatsApp Clone because it looks like WhatsApp except that its crappy.
the JavaScript is pure with no Libraries or Frameworks. 

## Configurations

When you download or clone this project, there are a few things you must change in order for it to work

1. Change the `CONN` values in `src/Config.php`  to match the settings of your local or remote Database connections. Eg.

```php
define('CONN', array(
    'HOST' => 'hostname', //eg localhost
    'DBNAME' => 'dbname',
    'DBUSER' => 'dbuser', // eg root
    'PASSWORD' => 'password'
));
```

The Database enviroment would be dynamically created from your values above. Make sure not to use a Database name (`DBNAME`) that already exists else its not a problem though because it'll use the one you have created, just make sure it is void of tables so you don't get confused or it contains a table that the project may at one time try to create in the database dynamically thereby causing errors.


2. If you want to host this project on a life server, then

   - You need to have your own copy of fontawesome link. If you don't have a copy, then [register with Font Awesome](https://fontawesome.com/start "font awesome") by providing only email to acquire an absolutely free link for the project. Replace the link in `src/Config.php` with the one you get. Make sure its Font Awesome 5. Your link would look like below

   ```html
   <script
     src="https://kit.fontawesome.com/yourcode.js"
     crossorigin="anonymous"
   ></script>
   ```

   - Be the first to register when the App is ready so as to have the `id` 0001 or by any means make sure as the owner, your `id` is 0001 because `autoWelcomeMessage` would be sent to any new user whose `id` is not 0001

3. [Register for free](https://www.tenor.com "Tenor GIF") with tenor to get a free api key and then replace the api_key in `modules/serviceWorker.js` with the one you get from [tenor.com](https://www.tenor.com "Tenor GIF"). This is needed to be able to send GIFs

[Check my site](https://www.247-dev.com "247 Developer")