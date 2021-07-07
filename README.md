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
- Edit the `MAILER` in [src/Config.php](https://github.com/julius-ek-hub/whatsapp-clone/blob/3687fbc7055834e6d6e0fe078915a50d244dd0e2/src/Config.php#L23 "MAILER") with your credentials. This is where you will be extracting your `from` addresses. When you send an email from the client (JS), the `from` property would only accept any of admin, info, no_rep .... You can add more emails if you have, following the same order and then refer to it from the client side using the main property and the rest will be automatically taken.
- To send from a Gmail account, you need to take the following steps.

  1. You have to change the security settings by going to [Google Account security settings.](https://myaccount.google.com/intro/security "Google Account security settings")
  2. Make sure that 2-Step-Verification is disabled or off.
  3. Turn ON the "Less Secure App access" or [click here](https://myaccount.google.com/intro/security "Turn ON Less Secure App"). Below is an example of Gmail configuration

  ```php
  // Google's smtp sever address is smtp.gmail.com and the port is 587. This port may likely be the same for all smtp severs

  define('MAILER', array(
    'admin' => array(
        'name' => 'WhatsApp Clone Admin',
        'addr' => 'johndoe@gmail.com',
        'password' => 'mygmailpassword'
    ),

    // Add as many gmail addresses as you want to use

    'host' => 'smtp.gmail.com',
    'port' => 587
    ));
  ```

  The above configuration will only work for Google mails. That is, you can send _from_ only gmail but can send _to_ any email address

- To send from other smtp servers, make sure to find the smtp server address, the smtp port which would likely be 587 and then know your email password. Then replace with the configurations above. You can find all that in your account with the domain name provider

[Learm more about SMTP](https://www.pepipost.com/blog/what-is-smtp)

5. If you want to host this project on a life server, then

   - You need to have your own copy of fontawesome link. If you don't have a copy, then [register with Font Awesome](https://fontawesome.com/start "font awesome") by providing only email to acquire an absolutely free link for the project. Replace your link with [this one](https://github.com/julius-ek-hub/whatsapp-clone/blob/b6a90a955782b8ea92fb90b4ae74ccc7f145b587/src/Config.php#L92 "font awesome"). Make sure its Font Awesome 5. Your link would look like below

   ```html
   <script
     src="https://kit.fontawesome.com/yourcode.js"
     crossorigin="anonymous"
   ></script>
   ```

   - Be the first to register when the App is ready so as to have the `id` 0001 or by any means make sure as the owner, your `id` is 0001 because [automatic messages](https://github.com/julius-ek-hub/whatsapp-clone/blob/3687fbc7055834e6d6e0fe078915a50d244dd0e2/modules/gui.js#L1600 "autoWelcomeMessage") would be sent to any new user whose `id` is not 0001

6. If you have cloned this project out of the UAE or have a different time zone from the UAE then you may want to change `date_default_timezone_set('Asia/Dubai')` in [src/actions.php](https://github.com/julius-ek-hub/whatsapp-clone/blob/3687fbc7055834e6d6e0fe078915a50d244dd0e2/src/actions.php#L2 "Time zone") to the value of your time zone. This doesn't really matter just leave it if you don't know. Its main purpose is that at any point if I need to get `time()` (int), it should be the same for everyone.
7. [Register for free](https://www.tenor.com "Tenor GIF") with tenor to get a free api key and then replace the api_key in [modules/serviceWorker.js searchGIF](https://github.com/julius-ek-hub/whatsapp-clone/blob/7c9cf9776057cce2d2b3369c3f14a64e07d918b5/modules/seviceWorker.js#L833 "searchGIF") with the one you get from [tenor.com](https://www.tenor.com "Tenor GIF"). This is needed to be able to send GIFs
8. Change `receipients` value in [modules/gui.js Line 6281](https://github.com/julius-ek-hub/whatsapp-clone/blob/3687fbc7055834e6d6e0fe078915a50d244dd0e2/modules/gui.js#L6281 "searchGIF") to your preferred email address. This could be any address. If you don't want to receive email when a user reports someone, then you can change this function to send it to your database instead for later review.
9. Change the value of `mainRoot` in [modules/app.js Line 15](https://github.com/julius-ek-hub/whatsapp-clone/blob/7c9cf9776057cce2d2b3369c3f14a64e07d918b5/app.js#L15 "mainRoot") to match the name of the the root directory parenting the entire project.

## Gallery

- Registration

![Select your country](https://www.247-dev.com/projects/whatsapp-clone/images/233eee.png "Countries")

- App - Large screen

![App - large screen](https://www.247-dev.com/projects/whatsapp-clone/images/75656.png)

- App small screen

![App - small screen](https://www.247-dev.com/projects/whatsapp-clone/images/fdvdfvdf.png)
