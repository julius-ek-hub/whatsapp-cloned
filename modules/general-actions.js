import * as helper from './helper.js';
import * as ac from './actions-proper.js';
import * as sw from './serviceWorker.js';

export let chat_action_HTML = function(chat, action, show, title) {
    let area = helper._('#' + chat).child(0);

    if (show)
        area.addChild(helper.make_el('span').attr({
            id: `${action}%${chat}`,
            class: 'material-icons-outlined chat-status',
            title: title
        }).html(action.split('-')[1]).self)
    else
        try {
            helper._(`#${action}%${chat}`).delete();
        } catch (er) {}
}


export let Alert = function(obj) {
    return helper.smoothAlert(obj);
}

export let collectInfo = function(maintitle, collections) {
    return helper.collectInfo(maintitle, collections);
}

export let dp = function(dp, id) {
    return dp == '' ? this.defaultDp : this.root + 'visitors/' + id + '/dp/' + dp;
}

export let username = function(id, tel) {
    if (id == '0001') {
        return 'Julius<span class="material-icons" style="font-size: 14px;color:#007bff">verified</span>'
    }
    let ch = this.chat_id_from_user_id(id);
    if (ch == '') {
        return tel;
    } else {
        let c = this.chats[ch].info.custom_name;
        return c == 0 ? tel : c;
    }
}

export let chat_id_from_user_id = function(id) {
    let set = this.settings;

    let f = 'chat_' + set.id + 'x' + id;
    let s = 'chat_' + id + 'x' + set.id;
    let res = '';
    if (f.in(Object.keys(this.chats))) {
        res = f
    } else if (s.in(Object.keys(this.chats))) {
        res = s;
    }
    return res;
}

export let friendId = function(chat_id) {
    let ids = chat_id.split('_')[1].split('x');
    return ids[0] == this.settings.id ? ids[1] : ids[0];
}

export let pauseRecording = function() {
    let allAudio = [].slice.call(document.querySelectorAll('div audio'));
    let wasPlayinBefore = allAudio.filter(audio => audio.paused == false);
    if (wasPlayinBefore.length > 0) {
        helper._(wasPlayinBefore[0]).parent().previousSibling.child(0).click();
        this.state.playingChat = null;
    }
}

export let check_delete = function(details) {
    let del = details.deleteInfo;
    del = typeof del == 'string' ? JSON.parse(del) : del;
    let ban_ic = '<i class="fa fa-ban"></i> ';
    let si = details.senderId;
    let my_id = this.settings.id;
    let ret = {
        deleted: false,
        by: null,
        message: 'null'
    };
    if (si == null) {
        return ret;
    }
    if (details.isGroup == 1) {
        if (del.deleted == 1 || del.deleted == 2) {
            ret.deleted = true;
        }
        if (del.deleted == 2 && si == my_id) {
            ret.message = ban_ic + '<i>You deleted this message</i>';
            ret.by = my_id;
        } else if (del.deleted == 2 && si != my_id) {
            ret.message = ban_ic + '<i>This message was deleted</i>';
            ret.by = si;
        }
    } else {
        let my_dl = del[my_id];
        let fr_id = this.friendId(details.chatId);
        let fr_dl = del[fr_id];
        if (my_dl == 2 || fr_dl == 2 || fr_dl == 3) {
            ret.deleted = true;
        }
        if (my_dl == 2 && si == my_id) {
            ret.message = ban_ic + '<i>You deleted this message</i>';
            ret.by = my_id;
        } else if ((fr_dl == 2 || fr_dl == 3) && si == fr_id) {
            ret.message = ban_ic + '<i>This message was deleted</i>';
            ret.by = fr_id;
        }
    }
    return ret;
}

export let highlighChatHead = function(details, new_) {
    let chat = helper._('#' + details.chatId);
    let s = this.settings;
    if (new_) {
        chat.insertBefore(chat.parent().firstChild.self)
    }

    let sname = details.isGroup == 1 ? (details.senderId == s.id ? 'You' : this.username(details.senderId, details.senderInfo.tel)) + ': ' : '';

    let receipt = '',
        lm_receipt = '...';
    if (details.senderId == s.id) {
        let r = ac.messageReceipt(details);
        receipt = '<span class="receipt' + r.receiptCss + '">' + r.receipt + '</span> ';
        lm_receipt = 'from-me'
    }
    let lastM = ac.decorateMessage(details.message.trim().split('\n').join(' ').unescape());
    if (lastM == '') {
        let d = ac.describeFile(details.fileInfo);
        lastM = d.icon + ' ' + d.description;
    }
    let del = this.check_delete(details);
    let inf_ = this.chats[details.chatId].info;
    chat = chat.self;
    let last_mess_holder = chat.childNodes[1].childNodes[1],
        last_date = chat.lastChild.firstChild,
        last_unr = chat.lastChild.lastChild.lastChild;
    last_mess_holder.innerHTML = del.deleted ? del.message : (receipt + '<span class="' + lm_receipt + '">' + sname + helper.reduce(lastM, 60) + '</span>');
    last_date.innerHTML = new Date(details.dateSent).nice_one(true);
    if (details.senderId != s.id && this.openedChat != details.chatId && details.dateSeen == 0) {
        inf_.unread++;
        last_unr.innerHTML = inf_.unread;
        last_unr.style.visibility = 'visible';
        last_date.style.color = 'rgb(37, 211, 102)';
    }
}

export let resolveMinorIssues = function() {
    let oc = this.openedChat;
    return new Promise((res, rej) => {
        if (oc == null) {
            res();
            return;
        }
        let mss = Object.values(this.chats[oc].messages);
        mss.forEach(ms => {
            try {
                let mid = ms.messageId;
                let gui = helper._('#' + mid).lastChild.lastChild.lastChild;
                if (gui.htm() == 'done' && ms.dateSeen != '0' && ms.senderInfo.id == this.settings.id)
                    gui.addClass('seen').html('done_all');
            } catch (e) {}
        })

        res();

    });
}

export let unhighlighChatHead = function(chatId) {

    let inf_ = this.chats[chatId].info;
    let chat = helper._('#' + chatId).self;
    let last_date = chat.lastChild.firstChild,
        last_unr = chat.lastChild.lastChild.lastChild;
    last_unr.innerHTML = 0;
    inf_.unread = 0;
    last_unr.style.visibility = 'hidden';
    last_date.style.color = 'rgba(0, 0, 0, 0.4)';
}
export let updateInnerNotification = function(chatId, destroy) {
    let box = helper._('#chatBox-' + chatId).child(0);
    let badge = box.child(3).child(0).child(1)
    if (destroy) {
        try {
            box.child(1).removeChild(helper._('#inner-notification-' + chatId).parent().self)
        } catch (err) {}
        badge.html()
        badge.self.hidden = true;
    } else {
        try {
            let noti = helper._('#inner-notification-' + chatId);
            let num = Number(noti.child(0).htm());
            noti.child(0).html(num + 1);
            noti.child(1).html(' UNREAD MESSAGES');
            badge.html(num + 1)
        } catch (err) {
            box.child(1).addChild(this.buildMessageGUI(null, 'inner-unread', chatId));
            badge.html(1);
        }
        badge.self.hidden = false;
    }
}

export let chooseFile = function(chosen = false, defaultCaption = helper.make_el('textarea').self) {
    let self = this;
    if (this.state.needUpload.length > 0) {
        this.Alert('Please wait for current upload to finish..');
        return;
    }
    let files_to_be_uploaded = [];

    ac.choose_file({ multiple: true, accept: 'image/*' }, chosen).then(files => {
        let container = helper.make_el('div').class('preview-container');
        let w = new helper.Modal();
        let head = helper.make_el('div').class('preview-head').addChild([
            helper.make_el('button').attr({
                class: 'btn',
                style: { color: 'white' },
                onclick: () => {
                    files_to_be_uploaded = [];
                    w.close();
                }
            }).html('<span class="material-icons-outlined">west</span>').self,
            helper.make_el('span').html(' Preview').self
        ]);
        let textarea = helper.make_el('textarea').attr({
            class: 'form-control textarea  caption',
            placeholder: 'Add a caption...',
            onkeyup: (e) => {
                helper.auto_grow(e.target, 38, 100)
            },
            onkeydown: (e) => {
                if (self.settings.enter_button == 1 && e.key == 'Enter') {
                    send()
                }
            }
        }).setHeight('38px').self;

        function send() {
            defaultCaption.value = '';
            if (!chosen) {
                ac.typingMessage(defaultCaption);
            }
            self.addMessage(null, textarea);
        }

        let body = helper.make_el('div').class('preview-body');
        let foot = helper.make_el('div').class('preview-foot')
        let typingZone = helper.make_el('div').class('input-group-prepend caption-zone').addChild([
            textarea,
            helper.make_el('button').attr({
                style: { position: 'absolute' },
                class: 'btn btn-send-caption',
                onclick: (e) => {
                    //Time to send image files....
                    let keys = Object.keys(files_to_be_uploaded);
                    if (keys.length > 0) {
                        for (let i = 0; i < keys.length; i++) {
                            let fu = new helper.File_(files_to_be_uploaded[keys[i]]);
                            self.state.needUpload.push({ type: fu.description().value.toLocaleLowerCase(), file: fu.file });
                        }
                        send();
                    }
                    w.close();
                }
            }).html('Send').self
        ]);

        let slideContainer = helper.make_el('div').class('foot-slide-holder');
        foot.addChild([typingZone.self, slideContainer.self])
        container.addChild([head.self, body.self, foot.self]);
        let count_selectd = 0;
        for (let i = 0; i < files.length; i++) {
            if (count_selectd >= 10) {
                break;
            }
            let f = new helper.File_(files[i]);
            if (!f.isImage()) {
                continue;
            }
            if (count_selectd == 0) {
                body.addChild(f.tag().id('previewshow_0').class('opened-preview').attr({ controls: true }).style({ maxHeight: innerHeight + 'px' }).self)
            }
            slideContainer.addChild(helper.make_el('div').class('preview-foot-img-container').addChild([f.tag().attr({
                    id: 'previewfoot_' + i,
                    onclick: (e) => {
                        let el = helper._(e.target.cloneNode(true)).id('previewshow_' + i).addClass('opened-preview').self;
                        body.truncate();
                        body.addChild(el);
                        structurize();
                    }
                }).self,
                helper.make_el('span').attr({
                    class: 'material-icons-outlined text-danger rounded-circle',
                    style: {
                        position: 'absolute',
                        right: '0',
                        background: 'white',
                        cursor: 'pointer'
                    },
                    onclick: () => {
                        delete files_to_be_uploaded['file_' + i];
                        let this_id = 'previewshow_' + i;
                        let container = helper._('#previewfoot_' + i).parent();
                        let opened = body.child(0).Id;
                        if (opened == this_id) {
                            if (container.has_nextSibling) {
                                container.nextSibling.child(0).click();
                                container.delete();
                            } else if (container.has_previousSibling) {
                                container.previousSibling.child(0).click();
                                container.delete();
                            } else {
                                w.close();
                            }
                        } else {
                            container.delete();
                        }
                    }
                }).html('close').self
            ]).self);
            files_to_be_uploaded['file_' + i] = f.file;
            count_selectd++;
        }
        w.add_content(container.self);
        let structurize = () => {
            [].slice.call(document.querySelectorAll('.opened-preview')).forEach(el => {
                el.style.maxHeight = innerHeight + 'px';
            })
            if (innerWidth < 700) {
                container.style({
                    width: '100%',
                    marginLeft: '0%'
                })
            } else {
                container.style({
                    width: '50%',
                    marginLeft: '25%'
                })
            }

        }

        w.open();
        structurize();
        window.resize_callbacks.push(structurize);
        if (Object.keys(files_to_be_uploaded).length == 0) {
            w.close();
            self.bottomInfo('Files were filtered, you have nothing to upload!', 'error');
        }

        textarea.value = defaultCaption.value;
        helper.auto_grow(textarea, 38, 100);
    })

}

export let block = function(chat, blc) {
    let s = this.settings;
    if (blc != 0 && blc != s.id && s.blocked_by.indexOf(chat) == -1) {
        s.blocked_by.push(chat);
        _block(false);
    } else if (blc == 0 || blc == s.id) {
        let ind = s.blocked_by.indexOf(chat);
        if (ind != -1) {
            s.blocked_by.splice(ind, 1);
            _block(true);
        }
    }

    function _block(bool) {
        try {
            helper._('#chatBox-' + chat).child(0).child(5).self.hidden = bool;
        } catch (err) {}
    }
}

export let openConversation = function(details) {

    let cid = this.chat_id_from_user_id(details.senderInfo.id);
    if (cid == '') {
        sw.addPublicUser(this.settings.id, details.senderInfo.id).then(result => {
            if (this.openedChat != null) {
                this.closeChat('chatBox-' + this.openedChat, 'right');
            }
            this.chats[result.chat_id] = { info: result, messages: {} };
            this.prepareChat({ info: result, messages: {} });
            this.openChat(result.chat_id);
        }).catch(err => {
            this.bottomInfo('You can\'t DM this person because you are not friends and the account is private', 'error');
        })
    } else {
        if (this.openedChat != null) {
            this.closeChat('chatBox-' + this.openedChat, 'right');
        }
        this.openChat(cid);
    }
}

export let deleteChat = function() {
    let s = this.settings;
    let cid = this.openedChat;
    if (cid == `chat_0001x${s.id}`) {
        this.bottomInfo('Sorry you can\'t delete this chat!', 'error');
        return;
    }
    new helper.Modal().Confirm({
        title: 'Please Confirm!',
        content: '<hr>You will never see this chat again but will not be deleted for your partner, ' +
            'just in case your partner texts you, the entire conversation will come back but if the he deletes too, then the ' +
            'chat shall really be deleted for both of you... It\'s crazy I know.<hr>',
        acceptText: 'Proceed',
        rejectText: 'Cancel'
    }).then(() => {
        sw.deleteChat(cid, s.id).then(() => {
            helper._('#' + cid).delete();
            helper._('#chatBox-' + cid).delete();
            this.openedChat = null;
            this.bottomInfo('Chat deleted!', 'success');
        }).catch(() => {
            this.bottomInfo('Failed!', 'error');
        })
    }).catch(() => {})
}

export let exportChat = function() {

    let messages = Object.keys(this.chats[this.openedChat].messages);
    if (messages.length == 0) {
        this.bottomInfo('Empty conversation', 'error');
        return;
    }
    let self = this;
    let w = new helper.Modal();
    w.touch_close = true;
    let head = helper.make_el('div').class('h3').html('<i class="fa fa-download"></i> Export chat');
    let foot = helper.make_el('div').addChild(
        helper.make_el('button').attr({
            class: 'btn btn-light float-right',
            onclick: () => { w.close() }
        }).html('Cancel').self
    );
    let clss = 'btn btn-primary m-2 w-25';
    let xml_btn = helper.make_el('button').attr({
        class: clss,
        onclick: () => {
            beginExport('xml', xml_btn);
        }
    }).html('XML');

    let txt_btn = helper.make_el('button').attr({
        class: clss,
        onclick: () => {
            beginExport('txt', txt_btn);
        }
    }).html('TEXT');

    let json_btn = helper.make_el('button').attr({
        class: clss,
        onclick: () => {
            beginExport('json', json_btn);
        }
    }).html('JSON');

    function change_btn_state(enable) {
        [xml_btn, txt_btn, json_btn].forEach(btn => {
            if (enable)
                btn.enable();
            else
                btn.disable()
        })
    }

    function beginExport(extension, btn) {
        change_btn_state(false)
        btn.html('please hold...')
        let ch = self.openedChat;
        sw.exportChat(ch, extension).then(resp => {
            change_btn_state(true);
            btn.html(extension.toUpperCase());
            w.close();
            ac.sm_download(`${self.mainRoot}tmp/${resp}`, `247-dev.com_chat_${self.settings.username.split(' ')[0]}_&_${self.chats[ch].info.username.split(' ')[0]}`, extension);
        }).catch(err => {
            change_btn_state(true)
            btn.html(extension.toUpperCase());
            self.bottomInfo('Download failed!', 'error');
        })
    }
    let bodyM = helper.make_el('div').style({
        background: 'white',
        display: 'inline-block',
        borderRadius: '8px'
    }).addChild([
        head.self,
        helper.make_el('div').class('p-2').html('Click to download conversation in any of the three formats below').self,
        helper.make_el('div').style({
            padding: '5px'
        }).addChild([
            xml_btn.self,
            txt_btn.self,
            json_btn.self
        ]).self,
        foot.self
    ])
    w.add_content(bodyM.self);
    let structurize = function() {
        bodyM.style({ maxHeight: innerHeight + 'px' });
        if (innerWidth < 700)
            bodyM.setWidth((innerWidth - innerWidth % 50) + 'px')
        else
            bodyM.setWidth('700px')
    }
    structurize();
    window.resize_callbacks.push(structurize)
    w.open()
}


export let askMediaPermission = function(type) {

    let message = 'send voice notes.',
        obj = 'Camera',
        icon = 'photo_camera',
        obj2 = { video: true };
    if (type == 'c') {
        message = 'send still photos and do fake video calls.';
    }

    if (type == 'm') {
        obj = 'Microphone';
        obj2 = { audio: true };
        icon = 'mic_none';
    }

    let bodyM = helper.make_el('div').style({
        display: 'inline-block',
        background: 'white',
        padding: '6px',
        borderRadius: '10px'
    });
    let logo = helper.make_el('div').class('text-center text-secondary')
        .html(`<span class="material-icons-outlined" style="font-size:38px">${icon}</span>`);
    let title = helper.make_el('div').class('text-center m-2').html(`Grant access to ${obj}!`);

    let description = helper.make_el('div').class('text-secondary p-1').style({
        fontSize: '1.1em',
        borderRadius: '10px'
    }).html(
        `Grant this project the permission to use your ${obj} so you can be able to ${message}`
    );

    bodyM.addChild([logo.self, title.self, description.self]);

    let al = this.Alert({
        body: bodyM.self,
        width: innerWidth > 700 ? 30 : 80,
        direction: innerWidth > 700 ? 'left' : 'top',
        buttonRight: helper.make_el('button').attr({
            class: 'btn btn-light float-right',
            onclick: () => {
                al.delete()
                ac.mediaAccessPermission(obj2).then((f) => {
                    this.Alert({
                        body: `You can now ${message}`,
                        cancelText: 'Ok'
                    })
                }).catch(err => {
                    this.mediaErrorAnnounce(type);
                })
            }
        }).html('Grant'),
        cancelText: 'Deny',
        strict: innerWidth > 700 ? true : false
    })
}

export let openCamera = function() {
    ac.checkPermission({ name: 'camera' }).then(res => {
        if (res == 'granted') {
            let self = this;
            let w = new helper.Modal();
            let status = helper.make_el('div').class('call-status p-4').html('Opening Camera...');
            let videoStremHolder = helper.make_el('video').attr({
                muted: 'muted',
                style: {
                    objectFit: 'cover',
                    height: '100%',
                    maxWidth: '100%',
                    transform: 'rotateY(180deg)'
                }
            }).self;
            let btnClose = helper.make_el('button').attr({
                class: 'call-hide btn btn-hide-call btn-light float-right',
                style: { color: 'red', zIndex: '+10' },
                onclick: () => {
                    closeCam()
                }
            }).html('<i class="fa fa-close"></i>').disable();
            let btnPic = helper.make_el('button').attr({
                class: 'btn btn-light rounded-circle btn-cam',
                onclick: () => {
                    takepicture()
                    closeCam()
                }
            }).style({
                position: 'absolute',
                bottom: '20px'
            }).html('<i class="fa fa-camera"></i>').disable()
            let body = helper.make_el('div').style({
                position: 'relative'
            }).addChild([
                videoStremHolder,
                helper.make_el('div').style({
                    position: 'absolute',
                    top: '0',
                    bottom: '0',
                    width: '100%',
                    background: 'transparent',
                }).addChild([
                    helper.make_el('div').style({
                        background: 'transparent',
                        height: '230px',
                        textAlign: 'center',
                    }).addChild([
                        btnClose.self,
                        status.self
                    ]).self,

                    btnPic.self
                ]).self
            ]);
            let bodyM = helper.make_el('div').style({
                background: 'rgba(0,0,0,0.8)',
                display: 'inline-block',
            }).addChild(body.self)
            let closeCam = function() {
                w.close();
                ac.clearStream();
            }
            let takepicture = function() {
                let w = innerWidth,
                    h = videoStremHolder.videoHeight / (videoStremHolder.videoWidth / w)
                let canvas = helper.make_el('canvas').attr({
                    height: h + 'px',
                    width: w + 'px',
                    hidden: true,
                }).appendTo(document.body);
                var context = canvas.self.getContext('2d');
                context.drawImage(videoStremHolder, 0, 0, w, h);
                canvas.self.toBlob((blob) => {
                    self.chooseFile(new File([blob], new Date().getTime() + "capture.jpg", { type: "image/jpeg" }))
                }, 'image/jpeg');
                canvas.delete()
            }

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
                    status.delete();
                };
                btnClose.enable();
                btnPic.enable();
            }).catch(err => {
                closeCam();
                this.mediaErrorAnnounce('c');
            })
        } else if (res == 'prompt') {
            this.askMediaPermission('c');
        } else {
            this.mediaErrorAnnounce('c');
        }
    }).catch(() => { this.askMediaPermission('c'); })
}

export let shareActions = function(ik) {
    let link = this.root + '?invite=' + ik;
    return [
        helper.make_el('button').attr({
            title: 'Share on Facebook',
            class: 'btn btn-light rounded-circle round-btn'
        }).html('<span class="material-icons-outlined">facebook</span>').self,
        helper.make_el('a').attr({
            class: 'btn btn-light rounded-circle round-btn',
            href: 'https://wa.me/?text=' + link,
            target: '_blank',
            title: 'Share on the Real WhatsApp'
        }).html('<i class="fa fa-whatsapp"></i>').self,
        helper.make_el('a').attr({
            class: 'btn btn-light rounded-circle round-btn',
            href: 'https://twitter.com/share?url=' + link,
            target: '_blank',
            title: 'Share on Twitter'
        }).html('<i class="fa fa-twitter"></i>').self,
        helper.make_el('a').attr({
            class: 'btn btn-light rounded-circle round-btn',
            href: 'mailto:?subject=Join me test this project - WhatsApp Clone&body=WhatsApp Clone built using pure JavaScript, join me test it and win the chance to get the entire source codes with documentations. Here is the link to test with me: ' + link,
            target: '_blank',
            title: 'Share by Email'
        }).html('<span class="material-icons-outlined">email</span>').self,
        helper.make_el('button').attr({
            class: 'btn btn-light rounded-circle round-btn',
            title: 'Share in other ways according to your device',
            onclick: () => {
                helper.webShare({
                    title: 'Join me test this project - WhatsApp Clone',
                    text: 'WhatsApp Clone built using pure JavaScript, join me test it and win the chance to get the entire source codes with documentations',
                    url: link
                }).then(() => { console.log('shared') }).catch(er => {
                    this.copyMessage(link);
                })
            }
        }).html('<i class="fa fa-share-alt"></i>').self,
        helper.make_el('button').attr({
            class: 'btn btn-light rounded-circle round-btn',
            title: 'Copy your link to clipboard',
            onclick: () => {
                this.copyMessage(link);
            }
        }).html('<i class="fa fa-copy"></i>').self
    ];
}

export let add_public_user = function(btn) {
    btn = helper._(btn).unfocus();
    let self = this;
    let s = this.settings;
    let loadmore = 'Load more...';
    let loading = 'Please wait... <i class="fa fa-spinner fa-pulse"></i>';
    let tab = helper.make_el('table').class('table-public-users w-100');
    let alt = helper.make_el('div').class('add-public-user-links-container').addChild(this.shareActions(s.invitation_key));
    let loader = helper.make_el('button').attr({
        class: 'btn btn-light',
        style: {
            fontSize: 'medium',
            padding: '6px'
        },
        onclick: () => {
            getUsers();
        }
    }).html(loading);
    let container = helper.make_el('div').addChild([
        helper.make_el('div').class('h4').html('Add Public Chat').self,
        helper.make_el('hr').self,
        alt.self,
        helper.make_el('hr').self,
        tab.html('<tbody></tbody>').self,
        loader.self
    ])
    this.Alert({
        body: container.self,
        width: 50,
        direction: 'bottom',
        buttonRight: '',
        cancelText: 'Done',
    })


    let available_public_chats = [];

    function addUser(user) {
        tab.child(0).addChild(
            helper.make_el('tr').addChild([
                helper.make_el('td').setWidth('50px').addChild(
                    helper.make_el('img').attr({
                        src: self.dp(user.dp, user.id),
                        class: 'dp',
                        onclick: (e) => { new helper.Modal().expandElement(e.target) }
                    }).self
                ).self,

                helper.make_el('td').addChild([
                    helper.make_el('span').class('font-weight-bolder').html(user.tel).self,
                    helper.make_el('div').class('text-muted').html(user.about.unescape()).self
                ]).self,

                helper.make_el('td').setWidth('120px').addChild(helper.make_el('button').attr({
                    class: 'btn btn-primary btn-add-public-user',
                    onclick: (e) => {
                        let bt = helper._(e.target).html('Hang on... <i class="fa fa-spinner fa-pulse"></i>').disable()
                        sw.addPublicUser(s.id, user.id).then(result => {
                            self.chats[result.chat_id] = { info: result, messages: {} };
                            self.prepareChat({ info: result, messages: {} });
                            bt.style({ background: 'transparent', color: 'rgba(0,0,0,0.6)' }).html('You are now friends');
                        })
                    }
                }).html('Add to chats').self).self
            ]).self
        )
        available_public_chats.push(user);
    }

    function getUsers() {

        let last = available_public_chats.length == 0 ? 0 : Math.max(...available_public_chats.map(el => { return Number(el.id) }));

        loader.html(loading).disable();
        sw.getPublicUsers(s.id, last).then(res => {
            res.forEach(u => { addUser(u) });
        }).catch(err => {
            self.bottomInfo('Connection Error', 'error')
        }).finally(() => {
            loader.html(loadmore).enable();
        })
    }

    getUsers();
}
