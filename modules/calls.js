import * as helper from './helper.js';
import * as ac from './actions-proper.js';
import * as sw from './serviceWorker.js';

export let videoCall = function(properties) {

    let s = this.settings;
    let cid = properties.chatId;
    let chat = this.chats[cid];
    let name = this.username(properties.id, properties.name);
    chat.info.custom_name == 0 ? chat.info.tel : chat.info.custom_name;

    if (ac.checkBlock(s, cid)) {
        this.bottomInfo('Can\'t call this user...', 'error');
        return;
    }

    if (this.state.recording) {
        this.bottomInfo('Can\'t make calls, recording is in progress...', 'error');
        return;
    }
    ac.checkPermission({ name: 'camera' }).then(res => {
        if (res == 'granted') {

            let self = this;
            self.state.calling = true;
            let w = new helper.Modal();
            let call_status = helper.make_el('div').class('call-status').html('Opening Camera...');
            let close = function(message, timeout, type = 'e') {
                call_status.html(message);
                ac.play_sound(self, 'callerTune', cid, true);
                setTimeout(() => {
                    try { w.close(); } catch (e) {}
                    ac.clearStream();
                    sw.setCallStatus(s.id, properties.id, type).then(() => {
                        self.state.calling = false;
                        self.checkIncomingCall();
                    }).catch(er => {
                        self.state.calling = false;
                        self.checkIncomingCall();
                    });
                }, timeout);
            }
            let btnEnd = helper.make_el('button').attr({
                class: 'btn btn-light rounded-circle btn-cancel-call',
                onclick: () => {
                    close('Call ended', 1000);
                }
            }).style({
                position: 'absolute',
                bottom: '10px'
            }).html('<i class="fa fa-phone"></i>').disable();
            let videoStremHolder = helper.make_el('video').attr({
                muted: 'muted',
                style: {
                    objectFit: 'cover',
                    height: '100%',
                    maxWidth: '100%',
                    transform: 'rotateY(180deg)'
                }
            }).self;
            let body = helper.make_el('div').style({
                position: 'relative'
            }).addChild([
                videoStremHolder,
                helper.make_el('div').style({
                    position: 'absolute',
                    top: '0',
                    bottom: '0',
                    width: '100%',
                    background: 'rgba(0,0,0,0.4)',
                }).addChild([
                    helper.make_el('div').style({
                        background: 'transparent',
                        height: '230px',
                        textAlign: 'center',
                    }).addChild([
                        helper.make_el('div').class('incoming-dp pt-2').addChild(
                            helper.make_el('img').attr({
                                src: properties.dp,
                                style: {
                                    objectFit: 'cover',
                                    width: '100px',
                                    height: '100px',
                                    marginTop: '20px',
                                    marginBottom: '10px',
                                    borderRadius: '50px'
                                }
                            }).self
                        ).self,
                        helper.make_el('div').class('call-name').html(name).self,
                        call_status.self
                    ]).self,

                    btnEnd.self
                ]).self
            ]);
            let bodyM = helper.make_el('div').style({
                background: 'white',
                display: 'inline-block',
            }).addChild(body.self)
            w.add_content(bodyM.self);
            let structurize = function() {
                bodyM.setHeight(innerHeight + 'px');
                body.setHeight(innerHeight + 'px')
                if (innerWidth < 700)
                    bodyM.setWidth(innerWidth + 'px')
                else
                    bodyM.setWidth('700px')
            }
            structurize();
            window.resize_callbacks.push(structurize)
            w.open();
            ac.getStream({ video: true }).then(stream => {
                var videoOnly = new MediaStream(stream.getVideoTracks());
                videoStremHolder.srcObject = videoOnly;
                videoStremHolder.onloadedmetadata = function(e) {
                    videoStremHolder.play();
                    call_status.html('Connecting...');
                    tryCalling();
                    btnEnd.enable();
                };
            }).catch(err => {
                close('Camera not found!', 2000);
            })
            let tryCalling = function() {
                sw.outgoingCall(s.id, properties.id, 'v').then((resp) => {
                    if (resp == 1) {
                        beginCall();
                    } else if (resp == 0) {
                        call_status.html('On another call, please wait...');
                        setTimeout(() => {
                            tryCalling();
                        }, 1000);
                    } else {
                        close('Can\'t connect, call ended!', 2000);
                    }
                }).catch(err => {
                    close('Can\'t connect, call ended!', 2000);
                });
            }

            let beginCall = function() {

                call_status.html('Calling');
                let st = new Date().getTime();
                ac.play_sound(self, 'callerTune', cid);

                let checkStatus = () => {
                    setTimeout(() => {

                        sw.checkCallStatus(s.id, properties.id).then(resp => {
                            let end = new Date().getTime();
                            switch (resp) {
                                case 'r':
                                    call_status.html('Ringing');
                                    if ((end - st) / 1000 > 60) {
                                        close('No answer', 2000, 'e');
                                    } else {
                                        checkStatus();
                                    }
                                    break;
                                case 'c':
                                    checkStatus();
                                    break;
                                case 'd':
                                    close('Declined', 2000, 'e');
                                    break;
                                case '0':
                                case 0:
                                    if ((end - st) / 1000 > 5) {
                                        close(name + ' is not available', 2000, 'e');
                                    } else {
                                        checkStatus();
                                    }
                                    break;
                                default:
                                    close('Call failed!', 2000, 'e')
                                    break;
                            }
                        }).catch(err => {
                            close('Call failed!', 2000, 'e')
                        })
                    }, 1000);
                }
                checkStatus();
            }

        } else if (res == 'prompt') {
            this.askMediaPermission('c');
        } else {
            this.mediaErrorAnnounce('c');
        }
    }).catch(() => { this.askMediaPermission('c'); })
}

export let audioCall = function(properties) {
    let s = this.settings;
    let cid = properties.chatId;
    if (ac.checkBlock(s, cid)) {
        this.bottomInfo('Can\'t call this user...', 'error');
        return;
    }
    if (this.state.recording) {
        this.bottomInfo('Can\'t make calls, recording is in progress...', 'error');
        return;
    }
    this.state.calling = true;
    let self = this;


    let name = this.username(properties.id, properties.name);

    let w = new helper.Modal();
    let call_status = helper.make_el('div').class('call-status').html('Connecting...');

    let close = function(message, timeout, type = 'e') {
        call_status.html(message)
        ac.play_sound(self, 'callerTune', cid, true);
        setTimeout(() => {
            try { w.close(); } catch (e) {}
            ac.clearStream();
            sw.setCallStatus(s.id, properties.id, type).then(() => {
                self.state.calling = false;
                self.checkIncomingCall();
            }).catch(er => {
                self.state.calling = false;
                self.checkIncomingCall();
            });
        }, timeout);
    }

    let head = helper.make_el('div').style({
        background: 'rgb(18, 140, 126)',
        height: '100px',
        textAlign: 'center'
    }).addChild([
        helper.make_el('div').class('call-name pt-2').html(name).self,
        call_status.self
    ]);
    let foot = helper.make_el('div').class('call-foot').style({
        background: 'rgb(18, 140, 126)',
        height: '70px',
    }).addChild([
        helper.make_el('button').class('btn btn-light').html('<i class="fa fa-volume-up"></i>').self,
        helper.make_el('button').style({
            margin: '0 20% 0 20%'
        }).class('btn btn-light text-muted').html('<i class="fa fa-video-camera"></i>').self,
        helper.make_el('button').class('btn btn-light').html('<i class="fa fa-microphone"></i>').self
    ]);
    let body = helper.make_el('div').style({
        position: 'relative'
    }).addChild([
        helper.make_el('img').attr({
            src: properties.dp,
            style: {
                objectFit: 'cover',
                width: '100%',
                height: '100%'
            }
        }).self,
        helper.make_el('div').style({
            position: 'absolute',
            top: '0',
            bottom: '0',
            width: '100%',
            background: 'rgba(0,0,0,0.2)',
        }).addChild(
            helper.make_el('button').attr({
                class: 'btn btn-light rounded-circle btn-cancel-call',
                onclick: () => {
                    close('Call ended!', 2000, 'e');
                }
            }).style({
                position: 'absolute',
                bottom: '10px'
            }).html('<i class="fas fa-phone"></i>').self
        ).self
    ]);
    let bodyM = helper.make_el('div').style({
        background: 'white',
        display: 'inline-block',
    }).addChild([
        head.self,
        body.self,
        foot.self
    ])
    w.add_content(bodyM.self);
    let structurize = function() {
        bodyM.setHeight(innerHeight + 'px');
        body.setHeight((innerHeight - 170) + 'px')
        if (innerWidth < 700)
            bodyM.setWidth(innerWidth + 'px')
        else
            bodyM.setWidth('700px')
    }
    structurize();
    window.resize_callbacks.push(structurize)
    w.open();
    let tryCalling = function() {
        sw.outgoingCall(s.id, properties.id, 'a').then((resp) => {
            if (resp == 1) {
                beginCall();
            } else if (resp == 0) {
                call_status.html('On another call, please wait...');
                setTimeout(() => {
                    tryCalling();
                }, 1000);
            } else {
                close('Can\'t connect, call ended!', 2000, 'e');
            }
        }).catch(err => {
            close('Can\'t connect, call ended!', 2000, 'e');
        });
    }

    let beginCall = function() {

        call_status.html('Calling');
        let st = new Date().getTime();
        ac.play_sound(self, 'callerTune', cid);
        let checkStatus = () => {
            setTimeout(() => {

                sw.checkCallStatus(s.id, properties.id).then(resp => {
                    let end = new Date().getTime();
                    switch (resp) {
                        case 'r':
                            call_status.html('Ringing');
                            if ((end - st) / 1000 > 60) {
                                close('No answer!', 2000, 'e');
                            } else {
                                checkStatus();
                            }
                            break;
                        case 'c':
                            checkStatus();
                            break;
                        case 'd':
                            close('Declined!', 2000, 'e');
                            break;
                        case '0':
                        case 0:
                            if ((end - st) / 1000 > 5) {
                                close(name + ' is not available', 2000, 'e');
                            } else {
                                checkStatus();
                            }
                            break;
                        default:
                            close('Call ended!', 2000, 'e');
                            break;
                    }
                })
            }, 1000);
        }
        checkStatus();
    }
    tryCalling();
}

export let incomingCall = function(properties) {
    let s = this.settings;
    let self = this;
    let chat = this.chats['chat_' + s.id + 'x' + properties.id];
    if (!chat) {
        chat = this.chats['chat_' + properties.id + 'x' + s.id];
    }
    let cid = chat.info.chat_id;
    let name = this.username(properties.id, chat.info.tel);
    let w = new helper.Modal();
    let head = helper.make_el('div').style({
        background: 'rgb(18, 140, 126)',
        height: '230px',
        textAlign: 'center',
    }).addChild([
        helper.make_el('div').class('call-top').addChild(
            helper.make_el('span').html('<span class="material-icons-outlined">no_encryption</span> <span>Unencripted Call</span>').self
        ).self,
        helper.make_el('div').class('incoming-dp').addChild(
            helper.make_el('img').attr({
                src: this.dp(properties.dp, properties.id),
                style: {
                    objectFit: 'cover',
                    width: '100px',
                    height: '100px',
                    marginTop: '20px',
                    marginBottom: '10px',
                    borderRadius: '50px'
                }
            }).self
        ).self,
        helper.make_el('div').class('call-name').html(name).self,
        helper.make_el('div').class('call-status').html(properties.type == 'v' ? 'WhatsApp Clone video call' : 'WhatsApp Clone voice call').self
    ]);

    function end_call(how) {
        try { w.close(); } catch (e) {}
        ac.play_sound(self, 'incomingCall', cid, true);
        sw.setCallStatus(properties.id, s.id, how).then(() => {
            self.state.calling = false;
            self.checkIncomingCall();
        })
    }

    let ta = helper.make_el('textarea').id('quickreply-' + cid).hide();

    function quickMessage(e) {
        ta.self.value = e.target.innerText;
        self.addMessage(null, ta.self);
        end_call('d');
    }

    let body = helper.make_el('div').style({
        position: 'relative',
        background: 'rgb(18, 140, 126)'
    }).addChild(

        helper.make_el('div').style({
            position: 'absolute',
            top: '0',
            bottom: '0',
            width: '100%',
            background: 'rgba(0,0,0,0.5)',
        }).addChild(
            helper.make_el('div').style({
                position: 'absolute',
                bottom: '10px',
                textAlign: 'center',
                width: '100%'
            }).addChild([
                helper.make_el('button').attr({
                    class: 'btn btn-light rounded-circle btn-cancel-call',
                    onclick: () => {
                        end_call('d');
                    }
                }).html('<i class="fa fa-phone"></i>').self,
                helper.make_el('button').attr({
                    class: 'btn btn-light rounded-circle btn-answer-call',
                    onclick: () => {
                        w.close()
                    }
                }).html('<i class="fa fa-phone"></i>').self,
                helper.make_el('button').attr({
                    class: 'btn btn-light rounded-circle btn-text-call',
                    'data-toggle': 'dropdown'
                }).html('<span class="material-icons-outlined">perm_phone_msg</span>').self,
                helper.make_el('div').class('dropdown-menu').addChild([
                    helper.make_el('button')
                    .class('btn btn-light dropdown-item')
                    .clicked((e) => { quickMessage(e) })
                    .html('Can\'t talk right now').self,
                    helper.make_el('button')
                    .class('btn btn-light dropdown-item')
                    .clicked((e) => { quickMessage(e) })
                    .html('Call me later').self,
                    helper.make_el('button')
                    .class('btn btn-light dropdown-item')
                    .clicked((e) => { quickMessage(e) })
                    .html('I am in a meeting').self,
                    helper.make_el('button')
                    .class('btn btn-light dropdown-item')
                    .clicked((e) => { quickMessage(e) })
                    .html('I am driving').self
                ]).self,
                ta.self
            ]).self
        ).self);
    let bodyM = helper.make_el('div').style({
        background: 'white',
        display: 'inline-block',
    }).addChild([
        head.self,
        body.self
    ])
    w.add_content(bodyM.self);
    let structurize = function() {
        bodyM.setHeight(innerHeight + 'px');
        body.setHeight((innerHeight - 230) + 'px')
        if (innerWidth < 700)
            bodyM.setWidth(innerWidth + 'px')
        else
            bodyM.setWidth('700px')
    }
    structurize();
    window.resize_callbacks.push(structurize)
    w.open();
    this.state.calling = true;

    let checkStatus = () => {
        setTimeout(() => {
            sw.checkCallStatus(properties.id, s.id).then(resp => {
                if (resp != 'r') {
                    end_call('e');
                } else {
                    checkStatus();
                }
            })
        }, 1000);
    }
    checkStatus();
    ac.play_sound(self, 'incomingCall', cid, false);
}

export let checkIncomingCall = function() {
    let self = this;
    let check = function() {
        if (!window.navigator.onLine) {
            setTimeout(check, 5000);
            return;
        }
        if (!self.state.calling) {
            setTimeout(() => {
                sw.checkIncomingCall(self.settings.id).then(resp => {
                    self.incomingCall({ chatName: resp.chatName, dp: resp.dp, id: resp.id, type: resp.type });
                }).catch((err) => {
                    if (err == 0)
                        check();
                    else
                    //Connection error
                        console.log('can\'t fetch new calls => ' + err);
                });
            }, 1000);
        }
    }
    check()
}