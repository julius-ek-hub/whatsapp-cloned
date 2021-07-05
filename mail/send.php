
<?php
require '../src/Config.php';
//Make sure to configure Config.php with your email credential and install phpmailer
//in the composer folder before this file can work
//Import PHPMailer classes into the global namespace
//These must be at the top of your script, not inside a function
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

//Load Composer's autoloader
require '../composer/vendor/autoload.php';

//Instantiation and passing `true` enables exceptions
$mail = new PHPMailer(true);

if(isset($_POST['mail']) && !empty($_POST['mail'])) {

    $m = json_decode($_POST['mail']);

    $wrong_addr = trim('<a href="https://www.247-dev.com/mail/remove-email/?uid=' .
    $m->b64_code . '">Click here</a>');
    $bodyLink = empty($m->bodyLink) ? '' : ('<a href="' . $m->bodyLink . '">' . (empty($m->bodyLinkName) ? $m->bodyLink : $m->bodyLinkName) . '</a>');
 
    $important = empty($m->main) ? '' :  
    trim('<div style="background:rgb(37, 211, 102);font-size:2em;color:white;text-align:center;padding:10px;margin:10%;border-radius:10px"> 
    ' . $m->main . '</div>');
    $style = 'style = "padding: 6px 16px;text-decoration:none;display:block;color:rgba(0,0,0,0.8)"';
    $body = trim('
    <table cellspacing="0" cellpadding="10" border="0" style="width:100%;border:2px solid rgba(0, 0, 0, 0.02);border-radius:10px;">
        <tr>
            <td width="280" style="padding:0px">
            <div style="height: 20px;width:100%;"><span style="float:right;padding:5px">{247-dev}</span></div>
             '. $important . '
            <div style="color: rgba(0,0,0,0.8);font-size:1.1em;padding:6px;">
               ' . $m->body . ' <br /> ' . $bodyLink . '
            </div>
            <div style="background:rgba(0,0,0,0.08);margin-top:20px;padding:10px;font-size:small">
            You are receiving this message because this Email was used on our website, If you are not responsible for
             this please ' . $wrong_addr . ' to proceed removing your Email address from our site, Thank you.
            </div>
            <footer style="font-family:Arial, Helvetica, sans-serif; font-size:14px;background-color: rgba(0,0,0,0.08);padding:6px;border-bottom-left-radius:10px;border-bottom-right-radius:10px">
            <div style="text-align:left;font-size:1.5em">
            <span style="color:#f55422;">{247}</span> Developer
            </div>
            <div>
            <h4>Quick Actions &amp; Links</h4>
            <a ' . $style . ' href="http://localhost/247-dev/">Hire Me</a>
            <a ' . $style . ' href="https://www.buymeacoffee.com/julius.ek">Buy me a coffee</a>
            <a ' . $style . ' href="http://localhost/247-dev/">Feedback | How does this website feel?</a>
            <a ' . $style . ' href="http://localhost/247-dev/projects">View Projects</a>
            <a ' . $style . ' href="http://localhost/247-dev/blogs">View Blogs</a>
            </div>
            <div>
            <h4>How can I be of service?</h4>
            <a ' . $style . ' href="http://localhost/247-dev/">Need a Website</a>
            <a ' . $style . ' href="http://localhost/247-dev/">Need me in a team</a>
            <a ' . $style . ' href="http://localhost/247-dev/">Need a Business email address</a>
            <a ' . $style . ' href="http://localhost/247-dev/">Need help with your project</a>
            <a ' . $style . ' href="http://localhost/247-dev/">Advertize on Google, Facebook, YouTube</a>
            </div>
            <div>
            <h4>Get in touch</h4>
            <a ' . $style . ' href="tel:+971528028233"> +971 528 028 233</a>
            <a ' . $style . ' href="mailto:info@247-dev.com"> info@247-dev.com</a>
            <h4>Follow Me</h4>
            <a ' . $style . ' href="http://localhost/247-dev/">Facebook</a>
            <a ' . $style . ' href="http://localhost/247-dev/">YouTube</a>
            <a ' . $style . ' href="http://localhost/247-dev/">Twitter</a>
            </div>
            <div style = "padding: 6px;color:rgba(255,255,255,0.08);text-align:center;">' . date('Y') . 'All rights reserved</div>
            </footer>
            
            </td>
        </tr>
    </table>
    ');
    $bodyAlt = $m->body . ' --- ' . $m->main . ' --- ' . $wrong_addr . ' If we sent this message to a wrong address';


try {
    //Server settings
    $mail->SMTPDebug = false;                                   //Enable verbose debug output
    $mail->isSMTP();                                            //Send using SMTP
    $mail->Host       = MAILER['host'];                         //Set the SMTP server to send through
    $mail->SMTPAuth   = true;                                   //Enable SMTP authentication
    $mail->Username   = MAILER[$m->from]['addr'];               //SMTP username
    $mail->Password   = MAILER[$m->from]['password'];           //SMTP password
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;         //Enable TLS encryption; `PHPMailer::ENCRYPTION_SMTPS` encouraged
    $mail->Port       = MAILER['port'];                         //TCP port to connect to, use 465 for `PHPMailer::ENCRYPTION_SMTPS` above

    //Recipients
    $mail->setFrom(MAILER[$m->from]['addr'], MAILER[$m->from]['name']);
    foreach ($m->receipients as $key => $value) {
        $mail->addAddress($value);
    }
    //Content
    $mail->isHTML(true);                                         //Set email format to HTML
    $mail->Subject = $m->subject;
    $mail->Body    = $body;
    $mail->AltBody = $bodyAlt;

    $mail->send();
    echo 1;
} catch (Exception $e) {
    echo 0;
}

}