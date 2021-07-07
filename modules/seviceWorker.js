import * as helper from './helper.js';

/**
 * Get all countries in the world from the server
 */
export function getAllCountries() {
    return new Promise((res, rej) => {
        helper.Request('src/actions.php?countries').then(respond => {
            res(JSON.parse(respond));
        }).catch(err => {
            rej(err)
        })
    })

}

/**
 * Get all user's info from the db
 */

export function getUser(id) {
    let ik = helper.url_query_string_value('invite');
    return new Promise((res, rej) => {
        helper.Request('src/actions.php', {
            user_info: id,
            invitation_code: ik == null ? 0 : ik,
            date: new Date().UTC_DATE()
        }).then(respond => {
            if (respond != 0) {
                res(JSON.parse(respond));
            } else {
                rej()
            }
        })
    })
}

/**
 * Login an old user
 */

export function Login(details) {
    return new Promise((res, rej) => {
        helper.Request('src/actions.php', {
            login: details
        }).then(respond => {
            if (respond == 1)
                res();
            else
                rej()
        })
    })
}

/**
 * Check if user exists from telephone number.
 */

export function checkIfUserExists(tel) {
    return new Promise((res, rej) => {
        helper.Request('src/actions.php', {
            user_exists: tel.trim()
        }).then(respond => {
            if (respond == 0)
                res(0);
            else
                res(JSON.parse(respond));
        }).catch(err => {
            rej(err)
        })
    })
}

//Get verified email of user for PIN reset

export function emailForReset(tel) {
    return new Promise((res, rej) => {
        helper.Request('src/actions.php', {
            verified_email: tel.trim()
        }).then(respond => {
            res(respond)
        }).catch(err => {
            rej(err)
        })
    })
}

// Reset PIN

export function resetPIN(em, pin) {
    return new Promise((res, rej) => {
        helper.Request('src/actions.php', {
            reset_pin: JSON.stringify({
                pin: pin,
                email: em.trim()
            })
        }).then(respond => {
            if (respond == 1)
                res()
            else
                rej()
        }).catch(err => {
            rej(err)
        })
    })
}

/**
 * Add a new visitor to the db
 */

export function add_visitor(info) {
    let ik = helper.url_query_string_value('invite');
    return new Promise((res, rej) => {
        info.tel = info.telcode + info.tel;
        delete info.telcode;
        info['date_joined'] = new Date().UTC_DATE();
        info['lastseen'] = info.date_joined;
        helper.Request('src/actions.php', {
            new_visitor: JSON.stringify(info),
            invitation_code: ik == null ? 0 : ik.trim()
        }).then(respond => {
            res(JSON.parse(respond));
        }).catch(err => {
            console.log(err)
            rej(err)
        })
    })
}

/**
 * The final stage whether or not the user chooses to upload a dp
 */
export function finishedRegister(btn, visitor_info) {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
    return new Promise((res, rej) => {
        add_visitor(visitor_info).then(resp => {
            setTimeout(() => {
                btn.disabled = false;
                btn.innerHTML = 'Finish';
                let load = new helper.Modal().Loading('Getting things ready... <i class="fa fa-spinner fa-pulse"></i>');
                setTimeout(() => {
                    load.loader.close();
                    res(resp)
                }, 10000)
            }, 2000)
        }).catch(err => {
            console.log(err)
            rej(err)
        })
    })
}

/**
 * Getting all chats from the db
 */

export function getChats(id) {
    return new Promise((res, rej) => {
        helper.Request('src/actions.php', {
            chat_ids: id
        }).then(response => {

            res(JSON.parse(response))
        }).catch(err => {
            console.log(err)
            rej(err)
        })
    })
}

/**
 * Getting all information about a particular chat by its ID
 */

export function getChatInfo(chat_id, visitor_id) {
    return new Promise((resolve, reject) => {
        helper.Request('src/actions.php', {
            chat_info: chat_id,
            visitor_id: visitor_id,
            date: new Date().UTC_DATE()
        }).then(resp => {
            resolve(JSON.parse(resp));
        }).catch(err => {
            reject(err)
        })
    })

}

/**
 * Getting messages for particular chat from the database
 */

export function loadMessages(chat_id, visitor, otherInfo) {
    return new Promise((res, rej) => {
        helper.Request('src/actions.php', {
            bring_messages_for: chat_id,
            date: new Date().UTC_DATE(),
            visitor: visitor,
            otherInfo: JSON.stringify(otherInfo)
        }).then(result => {
            res(JSON.parse(result));
        }).catch(err => {
            console.log(err)
            rej(err)
        })
    })
}

/**
 * Sending message to the database
 */

export function sendMessage(details) {
    details.dateSent = new Date().UTC_DATE();
    return new Promise((resolve, reject) => {
        helper.Request('src/actions.php', {
            new_message: JSON.stringify(details)
        }).then(respond => {
            resolve(JSON.parse(respond));
        }).catch(err => {
            reject(err)
        })
    })
}

/**
 * Sending message files before sending message, that is if available
 */
export function uploadMessageFile(file, visitor, type, callback) {
    let f = new helper.File_(file);
    return new Promise((res, rej) => {
        let attached = JSON.stringify({
            visitor: visitor,
            type: type,
            name: f.name.i
        })
        f.upload({ progressHandler: callback, destination: 'src/actions.php?message_file=' + attached }).then(respond => {

            res(respond.trim());
        }).catch(err => {
            rej()
        })
    })
}

/**
 * Check for new messages
 */

export function checkNewMessage(visitor, opened_caht) {
    return new Promise((res, rej) => {
        let now = new Date().UTC_DATE();
        helper.Request('src/actions.php', {
            check_new_message: visitor,
            currently_opened_chat: opened_caht == null ? '' : opened_caht,
            date: now
        }).then(resp => {
            res(JSON.parse(resp));
        }).catch(err => {
            rej(err)
        })
    })

}

export function deleteChat(chat, user) {
    return new Promise((res, rej) => {
        helper.Request('src/actions.php', {
            delete_chat: JSON.stringify({
                user: user,
                chat: chat
            })
        }).then(resp => {
            if (resp == 1)
                res()
            else
                rej()
        }).catch(err => {
            rej(err)
        })
    })
}

/**
 * Update unseen messages' receipts to 'Seen' when user opens a chat
 */

export function updateReceipt(chat, messageId, user) {
    return new Promise((res, rej) => {
        let date = new Date().UTC_DATE();
        helper.Request('src/actions.php', {
            change_receipt: JSON.stringify({
                chat: chat,
                type: 'dateSeen',
                date: new Date().UTC_DATE(),
                messageId: messageId,
                user: user
            })
        }).then(resp => {
            res(date)
        })
    })
}

/**
 * Check if there is any update from the other person or chat. Maybe your massage is read or received .. 
 */

export function check4messageUpdates(chat, messageId, visitor) {
    return new Promise((res, rej) => {
        helper.Request('src/actions.php', {
            check_unread_message: JSON.stringify({
                chat: chat,
                messageId: messageId,
                senderId: visitor
            })
        }).then(resp => {
            res(JSON.parse(resp));
        }).catch(err => {
            rej(err)
        })
    })
}

/**
 * Check if friend deletes message(s) for everyone so update can be done instantly
 */

export function checkDeleted(chat, messageId, friend) {
    return new Promise((res, rej) => {
        helper.Request('src/actions.php', {
            check_deleted_message: JSON.stringify({
                chat: chat,
                messageId: messageId,
                friend: friend
            })
        }).then(resp => {
            res(resp)
        }).catch(err => {
            rej(err)
        })
    })
}

/**
 * Updating my lastseen every 1s
 */

export function updateLastSeen(id, setting) {
    return new Promise((res, rej) => {
        if (setting == 0) {
            res();
            return;
        }
        helper.Request('src/actions.php', {
            set_last_seen: id,
            date: new Date().UTC_DATE()
        }).then(resp => {
            res()
        }).catch(err => {
            res()
        })
    })
}

export function checkLastSeen(id) {
    return new Promise((res, rej) => {
        helper.Request('src/actions.php', {
            check_last_seen: id
        }).then(respond => {
            res(respond)
        }).catch(err => {
            rej(err)
        })
    })
}

export function checkTyping(id) {
    return new Promise((res, rej) => {
        helper.Request('src/actions.php', {
            check_typing: id
        }).then(respond => {
            res(JSON.parse(respond))
        }).catch(err => {
            rej(err)
        })
    })
}

export function getMessageInfo(info) {
    return new Promise((res, rej) => {
        helper.Request('src/actions.php', {
            message_info: JSON.stringify(info)
        }).then(respond => {
            res(JSON.parse(respond));
        }).catch(err => {
            rej(err)
        })
    })
}

export function setTyping(key, whatsapp, recording) {
    if (recording || helper.letters.includes(key.toLowerCase()) || helper.numbers.includes(key.toLowerCase())) {
        helper.Request('src/actions.php', {
            set_typing: JSON.stringify({
                id: whatsapp.settings.id,
                chat: whatsapp.openedChat,
                message: recording ? 'recording audio' : 'typing',
                date: new Date().UTC_DATE()
            })
        })
    }
}

export function deleteMessage(mess, how, me) {
    return new Promise((res, rej) => {
        helper.Request('src/actions.php', {
            delete_message: JSON.stringify({
                chat: mess.chatId,
                messageId: mess.messageId,
                how: how,
                user: me
            })
        }).then((e) => {
            console.log(e)
            res()
        })
    })
}


export function forwardMessages(arrMessageIds, arrChatIds, currChat, me) {
    return new Promise((res, rej) => {
        helper.Request('src/actions.php', {
            forward_messages: JSON.stringify({
                messages: arrMessageIds,
                receivers: arrChatIds,
                currentChat: currChat,
                user: me,
                date: new Date().UTC_DATE()
            })
        }).then(respond => {
            if (respond == 1)
                res();
            else
                rej();
        }).catch(err => {
            rej()
        })
    })
}

export function logOut(id) {
    return new Promise((res, rej) => {
        helper.Request('src/actions.php', {
            logout: id
        }).then((resp) => {
            res(resp)
        }).catch(err => {
            rej(err)
        })
    })
}

export function checkIncomingCall(id) {
    return new Promise((res, rej) => {
        helper.Request('src/actions.php', {
            incoming_call: id
        }).then((resp) => {
            if (resp != 0) {
                res(JSON.parse(resp));
            } else {
                rej(0)
            }
        }).catch(err => {
            rej(err)
        })
    })
}

export function outgoingCall(from, to, type) {
    return new Promise((res, rej) => {
        helper.Request('src/actions.php', {
            outgoing_call: JSON.stringify({
                from: from,
                to: to,
                type: type
            })
        }).then((resp) => {
            res(resp)
        }).catch(err => {
            rej(err)
        })
    })
}

export function checkCallStatus(from, to) {
    return new Promise((res, rej) => {
        helper.Request('src/actions.php', {
            call_status: JSON.stringify({
                from: from,
                to: to
            })
        }).then((resp) => {
            res(resp.trim())
        }).catch(err => {
            rej(err)
        })
    })
}

export function setCallStatus(from, to, value) {
    return new Promise((res, rej) => {
        helper.Request('src/actions.php', {
            set_status: JSON.stringify({
                from: from,
                to: to,
                value: value
            })
        }).then((resp) => {
            if (resp == 1)
                res()
            else
                rej()
        }).catch(err => {
            rej(err)
        })
    })
}

export function blockContact(id, visitor) {
    return new Promise((res, rej) => {
        helper.Request('src/actions.php', {
            block_chat: JSON.stringify({
                user: visitor,
                chat: id,
                cell: 'blocked'
            })
        }).then((resp) => {
            resp = JSON.parse(resp);
            if (resp.error == 0)
                res(resp.value);
            else
                rej()
        }).catch(err => {
            rej()
        })
    })
}

export function muteContact(id, visitor) {
    return new Promise((res, rej) => {
        helper.Request('src/actions.php', {
            mute_chat: JSON.stringify({
                user: visitor,
                chat: id,
                cell: 'muted'
            })
        }).then((resp) => {
            resp = JSON.parse(resp);
            if (resp.error == 0)
                res(resp.value);
            else
                rej()
        }).catch(err => {
            rej()
        })
    })
}

window.url_info_on_request = [];
export function get_page_info(url, zone_id) {
    url = encodeURI(url);
    var proxyurl = "src/actions.php?page_info=" + url;
    window.url_info_on_request.push({ id: zone_id, url: proxyurl, url_: url });
    if (window.url_info_on_request.length == 1) {
        start_getting(0)
    }

    function start_getting(index) {
        if (index >= window.url_info_on_request.length) {
            window.url_info_on_request = [];
            return;
        }
        let current = window.url_info_on_request[index]
        let zid = current.id;
        let _url = current.url;
        let title_ = current.url_;
        helper.Request(_url).then(response => {
            try {
                const doc = new DOMParser().parseFromString(response, "text/html");
                const meta = doc.querySelectorAll('meta');
                let siteProps = { title: '', description: '', img: '', url: title_, site_name: '' }
                meta.forEach(m => {
                    let prop = m.getAttribute('property');
                    let prop_alt = m.getAttribute('name');
                    let val = m.getAttribute('content')
                    if (prop == 'og:title') {
                        siteProps.title = val;
                    } else if (prop_alt && prop_alt == 'description') {
                        siteProps.description = val;
                    } else if (prop && prop == 'og:description') {
                        siteProps.description = val;
                    } else if (prop && prop == 'og:image') {
                        siteProps.img = val;
                    } else if (prop && prop == 'og:site_name') {
                        siteProps.site_name = '~' + val;
                    }
                })
                if (siteProps.title.empty()) {
                    siteProps.title = doc.querySelectorAll('title')[0].innerText;
                }
                if (siteProps.url.empty()) {
                    siteProps.url = url;
                }
                let zone = helper._('#' + zid).attr({
                    class: 'message-url-info',
                    href: siteProps.url
                });
                if (!siteProps.description.empty() || !siteProps.title.empty()) {
                    let wl = '100%',
                        wr = '0px',
                        img_tag = '';
                    if (!siteProps.img.empty()) {
                        wl = '70%';
                        wr = '30%';
                        img_tag = '<img src = "' + siteProps.img + '">'
                    }

                    zone.addChild([
                        helper.make_el('div').class('site-info').addChild([
                            helper.make_el('div').setWidth(wl).class('site-title').html(siteProps.title).self,
                            helper.make_el('div').setWidth(wr).class('site-img').html(img_tag).self
                        ]).self,
                        helper.make_el('div').class('site-description').html(helper.reduce(siteProps.description, 100)).self,
                        helper.make_el('div').class('site-name').addChild([
                            helper.make_el('span').class('site-url').html(new URL(siteProps.url).origin).self,
                            helper.make_el('span').class('badge site-name-sm').html(siteProps.site_name).self
                        ]).self
                    ])
                } else {
                    zone.delete();
                }
            } catch (err) {
                try { helper._('#' + zid).delete(); } catch (err) {}
            }
            start_getting(index + 1);
        }).catch(err => {
            start_getting(index + 1);
        })
    }
}

export function getPublicUsers(me, last) {
    return new Promise((res, rej) => {
        helper.Request('src/actions.php', {
            public_users: JSON.stringify({
                user: me,
                last: last
            })
        }).then(result => {

            res(JSON.parse(result))
        }).catch(err => {
            rej(err)
        })
    })
}

export function addPublicUser(me, him) {
    return new Promise((res, rej) => {
        helper.Request('src/actions.php', {
            new_public_chat: JSON.stringify({
                user: me,
                new: him,
                date: new Date().UTC_DATE()
            })
        }).then(result => {
            if (result == 0)
                rej()
            else
                res(JSON.parse(result))
        })
    })
}

export function start_live_updates() {

    start();

    function start(index = 0) {

        let cbs = window.interval_functions;

        if (index >= cbs.length) {
            setTimeout(() => {
                start();
            }, 1000);
            return;
        }

        try {
            cbs[index].run().then(() => {
                start(index + 1);
            });
        } catch (err) {
            start(index + 1)
        }
    }
}

export function updateWallpaper(me, new_) {
    return new Promise((res, rej) => {
        helper.Request('src/actions.php', {
            new_wall_paper: JSON.stringify({
                user: me,
                new: new_
            })
        }).then(result => {
            res()
        })
    }).catch(err => {
        rej()
    })
}

export function deleteDp(all, id, reset) {
    return new Promise((res, rej) => {
        if (all.length == 0) {
            rej()
        }
        helper.Request('src/actions.php', {
            delete_dp: JSON.stringify({
                dps: all,
                user: id,
                reset: reset
            })
        }).then(result => {
            console.log(result)
            if (result == 1)
                res()
            else
                rej()
        })
    }).catch(err => {
        rej()
    })
}

export function deleteWp(all, id, reset) {
    return new Promise((res, rej) => {
        if (all.length == 0) {
            rej()
        }
        helper.Request('src/actions.php', {
            delete_wp: JSON.stringify({
                dps: all,
                user: id,
                reset: reset
            })
        }).then(result => {
            if (result == 1)
                res()
            else
                rej()
        })
    }).catch(err => {
        rej()
    })
}

export function updateProfile(props) {
    props['chat'] = props.chat == undefined ? '' : props.chat;
    let loading = new helper.Modal().Loading('Hang on...');
    return new Promise((res, rej) => {
        helper.Request('src/actions.php', {
            update_profile: JSON.stringify(props)
        }).then(result => {
            loading.loader.close()
            if (props.cell == 'tel' && result == 0)
                rej('Telephone number has been taken!')
            else
                res()
        }).catch(err => {
            loading.loader.close()
            rej(err)
        })
    })
}

export function deleteAccout(me) {
    let loading = new helper.Modal().Loading('We are removing your account... <span class="material-icons-outlined">loop</span>');
    return new Promise((res, rej) => {
        helper.Request('src/actions.php', {
            delete_account: me
        }).then(result => {
            loading.loader.close()
            if (result == 1)
                res()
            else
                rej(result)
        }).catch(err => {
            loading.loader.close()
            rej(err)
        })
    })
}

export function exportChat(chat, extension) {
    return new Promise((res, rej) => {
        helper.Request('src/actions.php', {
            export_chat: JSON.stringify({
                chat: chat,
                extension: extension
            })
        }).then(result => {
            result = JSON.parse(result);
            if (result.error == 0)
                res(result.value)
            else
                rej(result)
        }).catch(err => {
            rej(err)
        })
    })
}

export function searchGIF(search) {
    return new Promise((res, rej) => {
        helper.Request(`https://g.tenor.com/v1/search?q=${search}&key=${'api_key'}&limit=50`).then(resp => {
            res(typeof resp == 'object' ? resp : JSON.parse(resp))
        }).catch(err => {
            rej(err)
        })
    })
}

export function email(email) {
    return new Promise((res, rej) => {
        let ld = new helper.Modal().Loading('Hang on... <i class="fa fa-spinner fa-spin" style="font-size:24px"></i>');
        helper.Request('mail/send.php', {
            mail: JSON.stringify(email)
        }).then(response => {
            ld.loader.close();
            if (response == 1)
                res()
            else
                rej(response)
        }).catch(err => {
            rej(err + ', Error => ' + response);
            ld.loader.close();
            helper.smoothAlert('<div class = "text-danger">Send fail, try again</div>');
        })
    })
}