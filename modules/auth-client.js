import * as helper from './helper.js';
import * as sw from './serviceWorker.js';
window.streaming = [];
/**
 * Validate telephone numbers during signup
 */

export function validateNumber(btn, type) {
    let input = helper._(btn).parent().self.previousSibling;
    let err = helper._(btn).parent().parent().parent().child(0).child(1);
    let value = input.value.trim();
    btn.disabled = true;
    return new Promise((res, rej) => {
        if (!type) {
            if (!value.empty()) {
                if (isNaN(value) || !value.length.in_range(5, 16)) {
                    err.html('We don\'t think this number is valid, Just try another please.');
                    btn.disabled = false;
                } else {
                    err.html('');
                    res(value)
                }
            } else {
                err.html('We need your number');
                btn.disabled = false;
            }
        }
    })
}
/**
 * Confirm that the user enters the correct PIN
 */

export function confirmOTP(btn, original, type) {
    let input = helper._(btn).parent().self.previousSibling;
    let err = helper._(btn).parent().parent().parent().child(0).child(1);
    let value = input.value.trim();
    btn.disabled = true;
    return new Promise((res, rej) => {
        if (!type) {
            if (!value.empty()) {
                if (isNaN(value) || value.length != 6) {
                    err.html('Invalid PIN!.');
                    btn.disabled = false;
                } else if (value == original) {
                    err.html('');
                    res()
                } else {
                    err.html('We do not recognize this PIN!');
                    btn.disabled = false;
                }
            } else {
                err.html('Please enter your PIN!');
                btn.disabled = false;
            }
        }
    })
}

/**
 * Verifying an Old user
 */

export function verifyUser(btn, info) {
    let input = helper._(btn).parent().previousSibling;
    let err = helper._(btn).parent().parent().parent().child(0).child(1);
    let value = input.self.value.trim();
    btn.disabled = true;
    return new Promise((res, rej) => {
        if (!value.empty()) {
            if (isNaN(value) || value.length != 6) {
                err.html('Invalid PIN!');
                btn.disabled = false;
            } else {
                btn.innerHTML = ('<span class="spinner-border spinner-border-sm"></span> Progressing..');
                sw.Login(JSON.stringify({ tel: info.telcode + info.tel, pin: value })).then(() => {
                    err.html('');
                    btn.innerHTML = ('Success');
                    res();
                }).catch(() => {
                    btn.innerHTML = ('Login');
                    err.html('This PIN does not match the phone number you provided!');
                    btn.disabled = false;
                })
            }
        } else {
            err.html('We need this Info!');
            btn.disabled = false;
        }
    })
}

/**
 * Check if the sound system / sound effects is ready
 */

export function prepareUtilities(mainRoot) {
    helper._(document.body).addChild([
        helper.make_el('audio').attr({
            id: 'message-sent-sound',
            hidden: 'true',
            class: 'sound'
        }).addChild(helper.make_el('source').attr({
            src: `${mainRoot}sounds/whatsapp-message-sent-sound.mp3`,
            type: 'audio/mp3'
        }).self).self,
        helper.make_el('audio').attr({
            id: 'message-received-sound',
            hidden: 'true',
            class: 'sound'
        }).addChild(helper.make_el('source').attr({
            src: `${mainRoot}sounds/whatsapp-message-received-inline.mp3`,
            type: 'audio/mp3'
        }).self).self,
        helper.make_el('audio').attr({
            id: 'message-alert',
            hidden: 'true',
            class: 'sound'
        }).addChild(helper.make_el('source').attr({
            src: `${mainRoot}sounds/iphone-ding-sound.mp3`,
            type: 'audio/mp3'
        }).self).self,
        helper.make_el('audio').attr({
            id: 'caller-tune',
            hidden: 'true',
            class: 'sound',
            loop: true
        }).addChild(helper.make_el('source').attr({
            src: `${mainRoot}sounds/caller-tune.mp3`,
            type: 'audio/mp3'
        }).self).self,
        helper.make_el('audio').attr({
            id: 'incoming-call',
            hidden: 'true',
            class: 'sound',
            loop: true
        }).addChild(helper.make_el('source').attr({
            src: `${mainRoot}sounds/incoming-call.mp3`,
            type: 'audio/mp3',
        }).self).self,
        helper.make_el('input').attr({
            type: 'file',
            id: 'file_picker',
            hidden: 'true'
        }).self
    ])
    let sounds = [].slice.call(document.getElementsByClassName('sound'));
    return Promise.all(sounds.map(function(el) {
        return new Promise(function(resolve, reject) {
            el.addEventListener('canplaythrough', resolve);
        });
    }));
}

/* Check if user is still logged in with cookie */

export function loggedIn() {
    return helper.cookie('uid');
}

/**
 * The file picker function, selects files and return them, can accept file types argument too
 */

export function choose_file(attr, chosen) {
    attr = attr ? attr : {};
    return new Promise((resolve, reject) => {
        if (chosen) {
            resolve([chosen])
            return;
        }
        let fp = helper._('#file_picker').attr(attr).self
        fp.onclick = function() {
            this.value = ''
        }
        fp.onchange = function() {
            resolve(this.files)
        }
        fp.click()
    })
}

/**
 * If the user chooses not to (skip uploading dp || changing username from Visitor)
 */

export function finish_up(btn, dp_to_be_uploaded, visitor_info) {
    let input = helper._(btn).parent().self.previousSibling;
    let err = helper._(btn).parent().parent().parent().child(0).child(1);
    let name = input.value.trim();
    return new Promise((res, rej) => {

        if (name == '' && dp_to_be_uploaded == null) {
            err.html('We would need a name or dp');
            rej()
        } else {
            if (name != '') {
                if (!name.split(' ').join('').split('').all_in(helper.letters.concat(helper.numbers))) {
                    err.html('Invalid Username, only letters and numbers allowed!.')
                    rej();
                    return;
                } else {
                    err.html('')
                    visitor_info.username = name;
                }
            }
            if (dp_to_be_uploaded != null) {
                //there is dp to upload
                let f = new helper.File_(dp_to_be_uploaded);
                f.upload({
                    destination: 'src/actions.php?new_visitor_dp=' + f.name.i,
                    progressHandler: (props) => {
                        btn.innerHTML = props.percentage + '% <span class="spinner-border spinner-border-sm"></span>';
                    }
                }).then(respond => {
                    respond = JSON.parse(respond);
                    visitor_info.dp = respond.dp;
                    visitor_info.id = respond.id;
                    res(visitor_info)
                }).catch(e => {
                    err.html('Faild to upload dp, unknown error occured!')
                    rej()
                })

            } else {
                //there is no dp to upload
                res(visitor_info)
            }
        }
    })
}

/**
 * Monitoring when the user is typing so as to hide or show some functionalities
 */

export function typingMessage(el) {
    let val = el.value,
        holder = helper._(el).parent(),
        c = holder.self.lastChild,
        a = holder.child(4).self,
        send = holder.parent().self.lastChild,
        env = send.lastChild,
        mic = send.firstChild;
    if (!val.empty()) {
        c.style.right = '-40px';
        a.style.right = '4px';
        el.style.width = 'calc(100% - 50px)';
        mic.style.display = 'none';
        env.style.display = 'block';
        helper._(send).attr({
            'can-record': 'false',
            title: 'Click to send message'
        });
    } else {
        c.style.right = '4px';
        a.style.right = '40px';
        el.style.width = 'calc(100% - 84px)';
        mic.style.display = 'block';
        env.style.display = 'none';
        helper._(send).attr({
            'can-record': 'true',
            title: 'Click to start recording voice notes'
        });
    }
    helper.auto_grow(el, 38, 100);
}

/**
 * Producing nice readable dates
 */

export function niceDate(date, type) {
    let now = new Date();
    let now_ = now.format('d/m/y', 'local');
    let then = new Date(date);
    let then_ = then.format('d/m/y', 'local');
    let ret = then.format('M d');
    if (now_ == then_) {
        ret = 'Today';
    } else {
        now_ = now_.split('/').map(el => { return Number(el) });
        then_ = then_.split('/').map(el => { return Number(el) });
        if (then_[2] == now_[2]) {
            if (now_[1] == then_[1] && now_[0] - then_[0] == 1) {
                ret = 'Yesterday';
            }
        } else {
            ret = then_;
        }
    }
    return ret;
}

/**
 * Detecting the swipe right on messages during mobile reply
 */
export function detectMobileContextMenu(e) {
    let still_touching = true;
    return new Promise((res, rej) => {
        setTimeout(() => {
            if (still_touching)
                res()
            else
                rej()
        }, 500);
        ['touchmove', 'touchend'].forEach(evt => {
            helper._(e.target)[evt](() => {
                still_touching = false;
            })
        })
    })
}

/**
 * Producing message receipt
 */
export function messageReceipt(details) {
    let receiptClass = '',
        receiptClassCss = ' material-icons-outlined';
    if (details.isGroup == 1) {
        receiptClass = details.dateSent != '0' ? 'done' : 'pending';
    } else {
        if (details.dateSeen != 0) {
            receiptClass = 'done_all';
            receiptClassCss = ' material-icons-outlined seen';
        } else {
            receiptClass = details.dateReceived != '0' ? 'done_all' :
                details.dateSent != '0' ? 'done' :
                'pending';
        }
    }
    return { receipt: receiptClass, receiptCss: receiptClassCss };
}

export function messageActionsPc(e, target, myId) {
    return new Promise((res, rej) => {
        /*We make our own menu*/
        let s = new helper.Modal().RequestSelection();
        s.add_search = false;
        s.title = '';
        let si = target.senderInfo.id;
        s.options = [{ id: 'sel', value: '<i class="fa fa-check-circle-o"></i> Select' }];
        if (target.isGroup == 0 || (target.isGroup == 1 && si == myId)) {
            s.options.push({ id: 'del', value: '<i class="fa fa-trash"></i> Delete' });
        }
        if (target != undefined) {
            let del = typeof target.deleteInfo == 'string' ? JSON.parse(target.deleteInfo) : target.deleteInfo;

            let deleted = true;
            if (target.isGroup == 1 && del.deleted == 0) {
                deleted = false;
            } else {
                let part = Object.keys(del);
                let fr = part[0] == myId ? part[1] : part[0];
                if (del[myId] == 0 && String(del[fr]).in(['1', '0']))
                    deleted = false;
            }
            if (!deleted) {
                s.options.push({ id: 'rep', value: '<i class="fa fa-mail-reply"></i> Reply' });
                s.options.push({ id: 'forward', value: '<i class="fa fa-mail-forward"></i> Forward' });
                if (!target.message.empty()) {
                    s.options.push({ id: 'copy', value: '<i class="fa fa-clone"></i> Copy text' });
                }
                s.options.push({ id: 'share', value: '<i class="fa fa-share-alt"></i> Share' });
                if (si == myId) {
                    s.options.push({ id: 'info', value: '<i class="fa fa-exclamation-circle"></i> Info' })
                }
            }
            if (target.senderInfo.id != myId && target.isGroup == 1) {
                s.options.push({ id: 'open', value: `<i class="fa fa-envelope"></i> Message ${target.senderInfo.senderName}` })
            }
        }
        s.request().then(resp => {
            res(resp)
        }).catch(err => {})
    })
}

/**
 * Inner chat scroller showing function
 */

export function innerScrollTo(btn, show, defaultNum) {
    if (show) {
        btn.self.hidden = false;
    } else {
        btn.self.hidden = true;
    }
    if (defaultNum)
        btn.child(0).child(1).html(0).self.hidden = true;
}

/**
 * Voice message method using navigator.mediaDevices.getUserMedia
 */

export function preparerecording(cancel, send, timings, whatsapp) {
    let startTime = 0,
        updateRecordTime, count = 0,
        canceled = false,
        recoder;
    let chat = JSON.stringify(whatsapp.openedChat); // clone current chatid
    pauseAllAudio(whatsapp.openedChat);
    return new Promise((res, rej) => {
        let cancel_real = () => {
            canceled = true;
            if (recoder && recoder.state == 'recording') {
                recoder.stop();
            } else {
                rej()
            }
        }
        cancel.onclick = () => {
            cancel_real()
        }
        let checkChatChange = setInterval(() => {
            //checks if another chat get opened while recording
            if (JSON.parse(chat) != whatsapp.openedChat) {
                clearInterval(checkChatChange);
                cancel_real()
            }
        }, 500)

        getStream({ audio: true }).then(mediaStream => {
            recoder = new MediaRecorder(mediaStream);
            let chunks = [];
            recoder.start();
            startTime = new Date().getTime();
            updateRecordTime = setInterval(() => {

                count++;
                send.hidden = false;
                timings.html(message_time(count));
                sw.setTyping('i', whatsapp, true);
                if (count >= 300) {
                    send.click()
                }
            }, 1000)
            recoder.ondataavailable = (ev) => {
                chunks.push(ev.data);
            }

            send.onclick = () => {
                if (recoder.state == 'recording')
                    recoder.stop();
                else
                    rej();
            }
            cancel.onclick = () => {
                canceled = true;
                if (recoder.state == 'recording')
                    recoder.stop();
                else
                    rej();
            }
            recoder.onstop = () => {
                clearInterval(updateRecordTime);
                if (canceled) {
                    rej();
                    return;
                }
                let duration = (new Date().getTime() - startTime) / 1000;
                if (duration > 1) {
                    let blob = new Blob(chunks, { type: 'audio/ogg' });
                    res({ file: new File([blob], 'new-record.ogg', { type: 'audio/ogg', lastModified: Date.now() }), duration: duration });
                } else {
                    rej()
                }

            }
        }).catch(err => {

            rej(err)
        })

    })
}

/**
 * Now let's play our media files
 */

export function play(button, media, f, whatsapp) {
    let currentTimeDisplay = media.nextSibling;
    let updatePlayedTime;
    if (!f.played) { f['played'] = 0 };
    let chatBox = helper._(media).parent().parent().parent().parent().parent().parent().parent().parent().parent().self.id;
    let allAudio = [].slice.call(document.querySelectorAll(`div#${chatBox} audio`));
    let playing = allAudio.indexOf(media);
    let wasPlayinBefore = allAudio.filter(audio => audio.paused == false);
    if (wasPlayinBefore.length > 0 && allAudio.indexOf(wasPlayinBefore[0]) != playing) {
        wasPlayinBefore[0].pause();
        wasPlayinBefore[0].parentElement.previousSibling.firstChild.innerHTML = '<i class ="fa fa-play"></i>';
        wasPlayinBefore[0].nextSibling.innerText = message_time(f.duration);
        whatsapp.playingChat = null;
    }
    if (media.paused) {
        try { media.play(); } catch (e) { return }
        button.innerHTML = '<i class ="fa fa-pause"></i>';
        let range = media.previousSibling;
        updatePlayedTime = setInterval(() => {
            f.played++;
        }, 1000)
        whatsapp.playingChat = whatsapp.openedChat;
        media.ontimeupdate = (e) => {
            let ct = media.currentTime;
            let tt = media.duration;

            if (ct == Infinity || tt == Infinity) {
                ct = f.played;
                tt = f.duration
            }
            media = e.target;
            range.value = (ct / tt) * 100;
            currentTimeDisplay.innerText = message_time(ct == 0 ? f.duration : ct)
        }
        media.onended = () => {
            whatsapp.playingChat = null;
            range.value = 0;
            media.currentTime = 0.0;
            f.played = 0;
            clearInterval(updatePlayedTime);
            button.innerHTML = '<i class ="fa fa-play"></i>';
            currentTimeDisplay.innerText = message_time(f.duration);
            let nextInd = playing + 1;
            if (nextInd < allAudio.length) {
                let next = allAudio[nextInd];

                if (helper._(media).parent(6).nextSibling.child(0).Id == helper._(next).parent(5).Id) {
                    helper.scroll_to_message(helper._(next).parent(6).self, 'smooth');
                    next.parentElement.previousSibling.firstChild.click();
                }
            }
        }
        range.oninput = () => {
            let md = media.duration;
            let ct = (range.value / 100) * (md == Infinity ? f.duration : md);
            media.currentTime = ct;
            currentTimeDisplay.innerText = message_time(ct)
            f.played = ct;
        }
    } else {
        whatsapp.playingChat = null;
        media.pause();
        button.innerHTML = '<i class ="fa fa-play"></i>';
        clearInterval(updatePlayedTime);
        currentTimeDisplay.innerText = message_time(f.duration)
    }
}

export function play_sound(whatsapp, kind, cid, stop) {
    if (stop || cid.split('_')[0] == 'group') {
        whatsapp.sounds[kind].pause();
        whatsapp.sounds[kind].currentTime = 0.0;
        return;
    }
    let check1 = whatsapp.settings.other_sounds == 1;
    if (kind == 'incomingCall') {
        check1 = whatsapp.settings.notification_sound == 1;
    }
    if (!cid.in(whatsapp.settings.muted_chats) && check1) {
        try { whatsapp.sounds[kind].play(); } catch (e) {};
    }
}
/**
 * Detecting folder name from file type
 */

export function folder(filetype) {
    let ret;
    switch (filetype) {
        case 'record':
            ret = 'Recordings'
            break;
        case 'picture':
            ret = 'Pictures';
            break;
        default:
            ret = 'Documents'
            break;
    }
    return ret;
}

/**
 * Short description of files
 */

export function describeFile(file) {
    file = typeof file == 'string' ? JSON.parse(file) : file;
    let ret = { icon: '<i class="fa fa-warning text-muted"></i>', description: 'Unknown' };
    if (file.type == 'record') {
        ret.icon = '<i class="fa fa-microphone text-muted"></i>';
        ret.description = 'Voice';
    } else if (file.type == 'picture') {
        ret.icon = '<i class="fa fa-camera text-muted"></i>';
        ret.description = 'Photo';
    } else if (file.type == 'gif') {
        ret.icon = '<span class="material-icons-outlined">gif</span>';
        ret.description = '';
    }
    return ret;
}

export function lastSeen(date) {
    let now = new Date(new Date().UTC_DATE());
    let then = new Date(date);
    if ((now.getTime() - then.getTime()) / 1000 <= 2) {
        return 'Online'
    } else {
        return `Active: ${then.format('d/m/y', 'local')} ${then.format('h:ia')}`;
    }
}

/**
 * Deleting messages
 */

export function deleteMessage(how, whatsapp, single) {
    let myid = whatsapp.settings.id;
    let messages = whatsapp.chats[whatsapp.openedChat].messages;
    let all = single ? single : whatsapp.state.selecting.selected;
    all.forEach(el => {
        let m = messages[el];
        let di = m.deleteInfo;
        messages[el].deleteInfo = typeof di == 'string' ? JSON.parse(di) : di;
        sw.deleteMessage(m, how, myid).then(() => {
            messages[el].deleteInfo[m.isGroup == 1 ? 'deleted' : myid] = how;
            let mess = helper._('#' + el);
            if (how == 1 || how == 3) {
                let box = mess.parent();
                let psibling = helper._(box.self.previousSibling);
                let nsibling = helper._(box.self.nextSibling);
                box.delete();


                if ((!nsibling && psibling.child(0).self.className.includes('m-date')) ||
                    (nsibling && nsibling.child(0).self.className.includes('m-date') &&
                        psibling.child(0).self.className.includes('m-date') &&
                        psibling.self.previousSibling.childNodes[0].className.includes('security'))) {
                    psibling.delete();
                } else if (nsibling && nsibling.child(0).self.className.includes('m-date') && psibling.child(0).self.className.includes('m-date')) {
                    psibling.delete();
                }

            } else {
                mess.addClass('deleted').
                html('<span class="text-muted"><i class="fa fa-ban"></i> <i>You deleted this message</i></span>');
            }
        })
    });
}


export function getStream(type) {
    return new Promise((res, rej) => {
        let getUserMedia = navigator.mediaDevices;
        if (getUserMedia === undefined || !getUserMedia) {
            getUserMedia = navigator;
        }
        if (getUserMedia === undefined || !getUserMedia) {
            rej(Error('getUserMedia not supported'));
            return;
        }
        getUserMedia.getUserMedia(type).then(mediaStream => {
            window.streaming.push(mediaStream);
            res(mediaStream)
        }).catch(err => {
            rej(err)
        })
    })
}

export function mediaAccessPermission(media) {
    let permission4Moz = (value) => {
        if ('video' in media) {
            document.cookie = 'mozCamPermission=' + value;
        } else {
            document.cookie = 'mozMicPermission=' + value;
        }
    }
    return new Promise((res, rej) => {
        if (navigator.getUserMedia || navigator.mediaDevices.getUserMedia) {
            let getUserMedia = navigator.mediaDevices;
            if (getUserMedia === undefined || !getUserMedia) {
                getUserMedia = navigator;
            }
            getUserMedia.getUserMedia(media).then(mediaStream => {
                mediaStream.getTracks().forEach(function(track) {
                    track.stop();
                });
                permission4Moz('granted');
                res();
            }).catch(err => {
                permission4Moz('denied');
                rej(err)
            })
        } else {
            rej(err);
        }
    })
}

export function checkPermission(obj) {
    return new Promise((res, rej) => {
        try {
            navigator.permissions.query(obj).then(function(result) {
                res(result.state);
            }).catch(err => {
                let mozPerm = helper.cookie(obj.name == 'microphone' ? 'mozMicPermission' : 'mozCamPermission');
                if (mozPerm)
                    res(mozPerm)
                else
                    rej()
            })
        } catch (err) {
            rej();
        }
    })
}

export function clearStream() {
    window.streaming.forEach(stream => {
        stream.getTracks().forEach(function(track) {
            track.stop();
        })
    })
}

export function message_time(duration) {
    let float = (int) => {
        let str = int.toString();
        return (str.length == 1 ? `0${str}` : str)
    }
    let ret = duration;
    if (duration <= 59) {
        ret = `00: ${float(Math.floor(duration))}`;
    } else if (duration > 59 && duration <= 3599) {
        ret = float(Math.floor(duration / 60)) + ':' + float(Math.floor(duration % 60));
    }
    return ret;
}

export function pauseAllAudio(chat) {
    [].slice.call(document.querySelectorAll(`div#chatBox-${chat} audio`)).forEach(audio => {
        if (!audio.paused) {
            audio.parentElement.previousSibling.childNodes[0].click();
        }
    });
}

export function checkBlock(settings, chat) {
    if (settings.blocked_chats.includes(chat) || settings.blocked_by.includes(chat))
        return true;
    else
        return false;
}

export function decorateMessage(message) {
    window.b = '';
    window.u = '';
    window.s = '';
    window.i = '';
    window.b_points = [];
    window.u_points = [];
    window.s_points = [];
    window.i_points = [];
    let all_s = ['*', '-', '`', '_'];
    let all_p = ['b_points', 'u_points', 's_points', 'i_points'];
    let all_v = ['b', 'u', 's', 'i'];
    for (let i = 0; i < message.length; i++) {
        let char = message[i];
        let ind = all_s.indexOf(char);
        let check_1 = (message[i - 1] != ' ' || message[i + 1] != ' ');
        let check_2 = (all_s.includes(message[i - 1]) && all_s.includes(message[i + 1])) ||
            (all_s.includes(message[i - 1]) && !all_s.includes(message[i + 1])) ||
            (!all_s.includes(message[i - 1]) && all_s.includes(message[i + 1]))
        if (ind != -1 && (check_1 || check_2)) {
            if (check_2) {
                if (typeof window[all_v[ind]] == 'number' && Math.abs(i - window[all_v[ind]]) > 1) {
                    window[all_p[ind]].push([window[all_v[ind]], i]);
                    window[all_v[ind]] = '';
                } else {
                    window[all_v[ind]] = i;
                }
                continue;
            }
            if (i == 0 || message[i - 1] == ' ') {
                window[all_v[ind]] = i;
            } else if (i == (message.length - 1) || message[i + 1] == ' ') {
                if (typeof window[all_v[ind]] == 'number')
                    window[all_p[ind]].push([window[all_v[ind]], i]);
                window[all_v[ind]] = '';
            }
        }
    }

    let overAll = [];

    let add_to_overAll = function(dec) {
        let tags = {
            'b_points': ['<b>', '</b>'],
            'u_points': ['<u>', '</u>'],
            's_points': ['<strike>', '</strike>'],
            'i_points': ['<i>', '</i>']
        }
        if (window[dec].length != 0) {
            for (let b of window[dec]) {
                overAll[b[0]] = tags[dec][0];
                overAll[b[1]] = tags[dec][1];
            }
        }
    }

    all_p.forEach(p => {
        add_to_overAll(p);
    })

    return message.replace_at(overAll);
}

export function addLinksToMessage(message) {
    message = message.split('\n').join(' <br /> ');
    let firstURL = '';
    let url_zone_id = 'url_' + new Date().UTC_TIME() + helper.random(10000, 90000);
    let m_arr = message.split(' ');
    let res = '';
    let all_s = ['*', '-', '`', '_'];
    for (let m of m_arr) {
        let arr = [];
        let dec = m;
        if (!dec.empty() && dec[0].in(all_s)) {
            arr[0] = '';
        }
        if (!dec.empty() && dec[dec.length - 1].in(all_s)) {
            arr[dec.length - 1] = '';
        }

        dec = dec.replace_at(arr);

        if (m.isEmail() || dec.isEmail()) {
            m = `<a target = "_blank" href = "mailto:${dec}"> ${m} </a>`;
        } else if ((!isNaN(m) || !isNaN(dec)) && String(dec).length.in_range(6, 15)) {
            m = `<a href = "tel:${dec}"> ${m} </a>`;
        } else if (m.isURL() || dec.isURL()) {
            let url = helper.good_url(dec);
            m = `<a target = "_blank" href = "${url}"> ${m} </a>`;
            if (firstURL.empty())
                firstURL = url;
        } else if (m.toLowerCase().includes('julius') || m.toLowerCase().includes('ekane')) {
            m = `<a target = "_blank" href = "${[
                `https://www.youtube.com/channel/UCyfzaf7uohrk_a1NTdWzakg`,
                `https://stackoverflow.com/users/12869226/julius`,
                `https://github.com/julius-ek-hub`,
                `https://www.facebook.com/julius.ekane.946/`
            ][helper.random(0, 3)]}"> ${m} </a>`;
        }

        res += ' ' + m;
    }

    if (firstURL.empty())
        return res.trim();
    else {
        res = `<a target = "_blank" id="${url_zone_id}"></a> ${res.trim()}`;
        sw.get_page_info(firstURL, url_zone_id);
        return res;
    }

}

export function wallpaper_style(whatsapp) {
    let str = whatsapp.settings.wallpaper;
    let ret = {
        backgroundColor: '#eee45f',
        backgroundImage: `url(${whatsapp.defaultBg})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover'
    };
    if (str.split('.').length == 1 && str != 'default') {
        ret.backgroundColor = str;
        ret.backgroundImage = 'unset';
    } else if (str.split('.').length > 1) {
        ret.backgroundImage = `url(${whatsapp.root}visitors/${whatsapp.settings.id}/wallpapers/${str})`;
    }
    return ret;
}

export function sm_download(file, custom_name, ext) {
    helper.blob(file).then(b => {
        helper.make_el('a').attr({
            hidden: 'true',
            href: b,
            download: `${custom_name}.${ext}`
        }).appendTo(document.body).click().delete();

        window.URL.revokeObjectURL(b);
    }).catch(err => console.log('Download failed'));

}