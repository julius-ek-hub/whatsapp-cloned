/**
 * WhatsApp Clone by Julius Ekane.
 * This Project is only for educational purpose, you shall not use it for bad reasons,
 * Free to use and edit.
 */

import WhatsAppClone from './modules/all-modules.js';
import { _ } from './modules/helper.js';
import {
    getAllCountries,
    getUser,
    add_visitor
} from './modules/serviceWorker.js';
import { prepareUtilities, loggedIn } from './modules/actions-proper.js';

$(document).ready(() => {

    let w = new WhatsAppClone();
    w.init();
    w.addProperties({ mainRoot: 'http://localhost/whatsapp-clone/' });
    w.addProperties({ root: 'http://localhost/whatsapp-clone/' });
    let welcome = w.welcomeScreen();
    welcome.launch();
    getAllCountries().then(resp => {
        prepareUtilities(w.mainRoot, welcome.skip).finally(() => {

            /**
             * After loading all countries and sound effects, we are ready to.
             */
            w.addProperties({
                countries: resp,
                chats: {},
                defaultDp: w.root + 'images/default-dp.jpg',
                defaultBg: w.root + 'images/default-bg.jpg',
                openedChat: null,
                openedChats: [],
                messages_loaded: [],
                state: {
                    replyingTo: 0,
                    recording: false,
                    calling: false,
                    playingChat: null,
                    needUpload: [],
                    selecting: {
                        selecting: false,
                        selected: []
                    }
                },
                sounds: {
                    receivedIn: _('#message-received-sound').self,
                    receivedOut: _('#message-alert').self,
                    sent: _('#message-sent-sound').self,
                    incomingCall: _('#incoming-call').self,
                    callerTune: _('#caller-tune').self
                },
                colors: ['#eee45f', '#cccd45', '#bb34dc', '#beed34', '#bbbced', '#34ddea', '#4dddaa', '#bbbccc', '#005f6a', '#9e0018', '#fce']

            })

            /**
             * We check if there is an existing user for this browser
             */

            if (loggedIn()) {
                getUser(loggedIn()).then(resp => {
                    w.setEnvironment(resp, welcome);
                }).catch(() => {
                    //Probably there are some browser storage issues
                    w.Alert('<div class="text-danger h5" style="padding: 10px;background:rgba(255,0,0,0.2)">' +
                        '<i class="fa fa-warning"></i> Something is not right!,</div>' +
                        '<p>Try clearing your browser\'s cookies and cached files.</p>');
                })
            } else {
                welcome.destroy(1000);
                let v = w.Verify(),
                    rn = v.requestNumber(),
                    co = v.confirmOTP(),
                    sd = v.setDp(),
                    rl = v.requestLogin();

                //Request user number first
                rn.request().then(resp => {
                    rn.destroy();
                    //If we don't know this number

                    if (resp == 0) {

                        co.request().then(() => {
                            co.destroy();

                            sd.request().then((resp) => {
                                resp.btn.disabled = false;
                                let info = resp.info;
                                sd.destroy();

                                add_visitor(info).then(resp => {
                                    window.location.reload();
                                })

                            })

                        })

                    } else {
                        //If we recognize the number, then have to be sure it's the person by asking for PIN used to sign up
                        rl.request().then(() => {
                            window.location.reload();
                        })
                    }
                })
            }
        }).catch(e => {
            w.bottomInfo(`Error preparing utilities: ${e}`, 'error');
        })


    }).catch(err => {

        console.error(err)
        w.bottomInfo('Connection failed!', 'error')
    })
})