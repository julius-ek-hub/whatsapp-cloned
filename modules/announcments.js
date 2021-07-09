import * as helper from './helper.js';

export let mediaErrorAnnounce = function(type) {
    let device = new helper.Modal().mobile ? 'Phone' : 'PC';
    let icon = 'no_photography',
        message = 'Camera and Microphone not found!!';
    if (type == 'c') {
        message = 'Camera not found!';
    }
    if (type == 'm') {
        icon = 'mic_off';
        message = 'Microphone not found!';
    }
    let bodyM = helper.make_el('div').style({
        display: 'inline-block',
        background: 'white',
        padding: '6px',
        borderRadius: '10px'
    });
    let logo = helper.make_el('div').class('text-center text-secondary')
        .html(`<span class="material-icons-outlined" style="font-size:38px">${icon}</span>`);
    let title = helper.make_el('div').class('text-center m-2').html(message);
    let obj = type == 'c' ? 'camera' : 'microphone';
    let description = helper.make_el('div').class('text-secondary p-1').style({
        fontSize: '1.1em',
        borderRadius: '10px'
    }).html(
        `We found it hard to connect to your  ${obj} 
         and for that reason you might not be able to test some of the webRTC functionalities, its not a problem though since we still have a lot more to test. 
         Just in case you want to really test this part of the project then you have to try the following after being sure that your ${device} has ${obj} ..
        <div class = "p-2 m-1" style="background:rgba(0,255,0, 0.07)">
        - Grant this project the permission to use your ${obj} by going to the settings on your browser depending on which browser you use.<br />
        - Enable your browser to use your ${device}'s ${obj} from your ${device}'s settings<br />
        - Update your browser<br />
        - Use a different browser (Chrome, Firefox, Opera, Ms Edge are recommended) <br />
        - Check that another App is not using your ${device}'s ${obj}
        </div>
        If you use iOS or Mac OS, then things might be a little different.
        <div  class = "p-2 m-1 text-info" style="background:rgba(255,0,0, 0.07)">
        NB: If you have done any of the above, you have  to refresh your browser to make it effective.
        </div>
        <p>If none of the obove helps then I\'m sorry, there is no more help to offer. Thanks</p>`
    );

    bodyM.addChild([logo.self, title.self, description.self]);
    this.Alert({
        body: bodyM.self,
        width: 90,
        direction: 'top',
        cancelText: 'Got it'
    })
}

export let bottomInfo = function(message, type) {
    let icon = '',
        bg = 'lightgreen';
    if (type == 'error') {
        icon = '<i class = "fa fa-warning text-danger"></i> ';
    }
    if (type == 'success') {
        icon = '<i class = "fa fa-check text-success"></i> ';
        bg = 'white'
    }
    let info = helper.make_el('div').style({
        position: 'fixed',
        bottom: '-60px',
        with: '100%',
        right: '0',
        left: '0',
        zIndex: window.lastZindex += 8,
        textAlign: 'center',
        transition: '0.3s bottom'
    }).addChild(helper.make_el('div').style({
        display: 'inline-block',
        background: bg,
        padding: '5px 10px',
        borderRadius: '16px'
    }).html(icon + message).self).appendTo(document.body);
    info.style({ bottom: '60px' });
    setTimeout(() => {
        info.delete();
        window.lastZindex -= 8
    }, 4000);
}

export let welcomeScreen = function() {
    let wn = new helper.Modal({
        bg: 'white'
    });

    let top = helper.make_el('h2').attr({
        class: 'wc-wlcm-up font-weight-light'
    }).html('WhatsApp Clone').self;

    let delayance = helper.make_el('div');
    let middle = helper.make_el('div').attr({
        class: 'wc-wlcm-middle'
    }).addChild([
        helper.make_el('img').attr({
            src: this.root + 'images/whatsapp-logo.png',
            alt: 'WhatsApp Logo',
            class: 'logo'
        }).self,
        helper.make_el('div').attr({
            class: 'wc-wlcm-loading'
        }).html('Welcome... <i class="fa fa-spinner fa-pulse"></i>').self,
        delayance.self
    ]).self

    let bottom = helper.make_el('div').attr({
        class: 'wc-wlcm-down'
    }).addChild([
        helper.make_el('span').html('From').self,
        helper.make_el('h6').attr({
            style: {
                fontWeight: 'light'
            }
        }).html('247-dev.com').self
    ]).self

    let body = helper.make_el('div').addChild([top, middle, bottom]).self
    wn.add_content(body)

    return {
        launch: () => { wn.open(); },
        destroy: (timeout) => {
            if (timeout) {
                setTimeout(() => {
                    wn.close();
                }, timeout)
            } else {
                wn.close()
            }
        },
        delayance: delayance
    }
}

export let informUser = function() {
    if (helper.cookie('informed_ed')) {
        return;
    }
    let icon = 'emoji_people',
        message = 'Hi';
    let bodyM = helper.make_el('div').style({
        display: 'inline-block',
        background: 'white',
        padding: '6px',
        borderRadius: '10px'
    });
    let logo = helper.make_el('div').class('text-center text-secondary')
        .html(`<span class="material-icons-outlined" style="font-size:38px">${icon}</span>`);
    let title = helper.make_el('div').class('text-center m-2').html(message);
    let description = helper.make_el('div').class('text-secondary p-1').style({
        fontSize: '1.1em',
        borderRadius: '10px'
    }).html(
        `So excited to have you around, trust me you are gonna like it. Source codes are free, it's up to you to support my work
         <div style="background: rgba(255,0,0,0.1)" class="p-2 text-danger">
         <div class="h6"><i class="fa fa-warning"></i> DISCLAIMER/NB.</div>
         This is a web project and it is entirely on a single page so while still on it, never use the browser's back button or the phone's back button, 
         else they will take you to the page you were before the project. If you wish to navigate or browse around, allways use the custom buttons 
         shown in the app. <br />
         - If you want to remain logged in, do not clear your browser's cache<br />
         - If you use iOS or MAC OS device then you might face some issues especially when taking still photos <br />
         </div> 
         <p>
         Please do not forget to do at least one of the following after getting the codes: <br />
         - Rate my work, from the menu,<br />
         - Leave a message in the group chat <br />
         - Subscribe to my YouTube Channel <br />
         - Like/Follow on Facebook/twitter <br />
         - Share this project with a friend <br />
         - Buy me a coffe
         </p>`
    );

    bodyM.addChild([logo.self, title.self, description.self]);
    this.Alert({
        body: bodyM.self,
        width: 90,
        direction: 'top',
        cancelText: 'Got it'
    })
    helper.set_cookie('informed_ed', true, 10);
}