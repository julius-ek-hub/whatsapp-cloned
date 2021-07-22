# WhatsApp Clone

This is my very first project on Github. A fully functioning full stack Web App.
I call it WhatsApp Clone because it looks like WhatsApp except that its a little crappier.
It is completely free to clone or download and modify for any use whatsoever.
The entire App runs on a single page, the JavaScript is pure with no Libraries or Frameworks. So it's beginner friendly. If you have read through this already, then go ahead and [launch the App](https://www.247-dev.com/projects/whatsapp-clon/app) and try to test all it's fetures found [here](https://www.247-dev.com/projects/whatsapp-clon/). Then come back and download or clone

## Configurations

When you download or clone this project, there are a few things you must change in order for it to work

1. Change the value of `ROOT` in [src/Config.php](https://github.com/julius-ek-hub/whatsapp-clone/blob/99d0f42603434ac06142498875077ad2291aa01d/src/Config.php#L3 "root") to match the name of the the root directory parenting the entire project.

2. Optionally change `THEME_COL` value in [src/Config.php](https://github.com/julius-ek-hub/whatsapp-clone/blob/99d0f42603434ac06142498875077ad2291aa01d/src/Config.php#L5 "THEME_COL") to the color of your choice. This is the browser's addres bar background color.

3. Change the `CONN` values in [src/Config.php](https://github.com/julius-ek-hub/whatsapp-clone/blob/99d0f42603434ac06142498875077ad2291aa01d/src/Config.php#L10 "Config.php") to match the settings of your local or remote Database connections. Eg.

```php
define('CONN', array(
    'HOST' => 'localhost',
    'DBNAME' => 'whatsapp_clone_db',
    'DBUSER' => 'root',
    'PASSWORD' => 'Qtrr454&^FGg676'
));
```

The Database enviroment would be dynamically created from your values above. Make sure not to use a Database name (`DBNAME`) that already exists else its not a problem though because it'll use the one you have created, just make sure it is void of tables so you don't get confused or it contains a table that the project may at one time try to create in the database dynamically thereby causing errors.

4. If you want mailing to function, like when user reports, rates, adds email etc. Then you need to do some stuffs.

- First if you don't have a composer installed in your machine, you need to download it [here](https://getcomposer.org/Composer-Setup.exe "Get composer") and install then...
- Open your command prompt/line as administrator then change directory upto ./composer folder in the project or if you use vscode, then open the composer folder in the integrated terminal. In either ways, type `composer require phpmailer/phpmailer` to install phpmailer in the composer directory. Having issues? [Read this](https://github.com/PHPMailer/PHPMailer "phpmailer") or [Contact Me](https://wa.me/971566366808)
- Edit the `MAILER` in [src/Config.php](https://github.com/julius-ek-hub/whatsapp-clone/blob/99d0f42603434ac06142498875077ad2291aa01d/src/Config.php#L23 "MAILER") with your credentials. This is where you will be extracting your `from` addresses. When you send an email from the client (JS), the `from` property would only accept any of admin, info, no_rep .... You can add more emails if you have, following the same order and then refer to it from the client side using the main property and the rest will be automatically taken.
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

- To send from other smtp servers, make sure to find the smtp server address, the smtp port which would likely be 587 and then know your email password. Then replace in the configurations above. You can find all that in your account with the domain name provider

[Learm more about SMTP](https://www.pepipost.com/blog/what-is-smtp)

5. If you want to host this project on a life server, then

   - You need to have your own copy of fontawesome link. If you don't have a copy, then [register with Font Awesome](https://fontawesome.com/start "font awesome") by providing only email to acquire an absolutely free link for the project. Replace the link in [src/Config.php](https://github.com/julius-ek-hub/whatsapp-clone/blob/99d0f42603434ac06142498875077ad2291aa01d/src/Config.php#L93 "font awesome link") with the one you get. Make sure its Font Awesome 5. Your link would look like below

   ```html
   <script
     src="https://kit.fontawesome.com/yourcode.js"
     crossorigin="anonymous"
   ></script>
   ```

   - Be the first to register when the App is ready so as to have the `id` 0001 or by any means make sure as the owner, your `id` is 0001 because [automatic messages](https://github.com/julius-ek-hub/whatsapp-clone/blob/99d0f42603434ac06142498875077ad2291aa01d/modules/message.js#L5 "autoWelcomeMessage") would be sent to any new user whose `id` is not 0001

6. If you have cloned this project out of the UAE or have a different time zone from the UAE then you may want to change `date_default_timezone_set('Asia/Dubai')` in [src/actions.php](https://github.com/julius-ek-hub/whatsapp-clone/blob/99d0f42603434ac06142498875077ad2291aa01d/src/actions.php#L3 "Time zone") to the value of your time zone. This doesn't really matter just leave it if you don't know. Its main purpose is that at any point if I need to get `time()` (int), it should be the same for everyone.
7. [Register for free](https://www.tenor.com "Tenor GIF") with tenor to get a free api key and then replace the api_key in [modules/serviceWorker.js searchGIF](https://github.com/julius-ek-hub/whatsapp-clone/blob/99d0f42603434ac06142498875077ad2291aa01d/modules/serviceWorker.js#L831 "searchGIF") with the one you get from [tenor.com](https://www.tenor.com "Tenor GIF"). This is needed to be able to send GIFs
8. Change `receipients` value in [modules/general-actions.js Line 913](https://github.com/julius-ek-hub/whatsapp-clone/blob/99d0f42603434ac06142498875077ad2291aa01d/modules/general-actions.js#L913 "searchGIF") to your preferred email address. This could be any address. If you don't want to receive email when a user reports someone, then you can change this function to send it to your database instead for later review.
9. Change the value of `mainRoot` in [./app.js Line 21](https://github.com/julius-ek-hub/whatsapp-clone/blob/99d0f42603434ac06142498875077ad2291aa01d/app.js#L21 "mainRoot") to match the name of the the root directory parenting the entire project.

## Gallery

- App - Large screen

![App - large screen](https://www.247-dev.com/projects/whatsapp-clone/images/preview-1.png)

- App - Small screen

![App - small screen](https://www.247-dev.com/projects/whatsapp-clone/images/fdvdfvdf.png)

## [View main gallery](https://www.247-dev.com/projects/whatsapp-clone/images/ "WhatsApp Clone gallery")

## [Watch how it works on YouTube](https://www.youtube.com/channel/UCyfzaf7uohrk_a1NTdWzakg/ "YouTube Video")

## [Go live](https://www.247-dev.com/projects/whatsapp-clone/app/ "WhatsApp Clone Live")

## [Follow on Twitter](https://twitter.com/247developer/ "Follow on Twitter")

## [Subscribe to YouTube channel](https://www.youtube.com/channel/UCyfzaf7uohrk_a1NTdWzakg?sub_confirmation=1 "Subscribe")

## [Buy me a coffee](https://www.buymeacoffee.com/julius.ek "Buy me coffee")
