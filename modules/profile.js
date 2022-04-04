import * as helper from './helper.js';
import * as ac from './actions-proper.js';
import * as sw from './serviceWorker.js';

export let openProfile = function(chat_id) {
    if (chat_id && chat_id.split('_')[0] == 'group') {
        return;
    }
    let myId = this.settings.id;
    let w = new helper.Modal();
    let self = this;
    let settings = this.settings;
    let editing = null;
    let edit_icon = '<span class="material-icons-outlined">edit</span>';
    let visibility = 'visible';
    let enter_toggle = 'toggle_off';
    let enter_toggle_class = 'text-muted';
    let auto_toggle = 'toggle_off';
    let auto_toggle_class = 'text-muted';
    if (chat_id) {
        visibility = 'hidden';
        i = this.chats[chat_id].info;
        settings = {
            dp: i.dp,
            wallpaper: 'default',
            account_type: i.account_type,
            invitation_key: i.invite_key,
            date_joined: i.date_joined,
            read_receipt: 1,
            notification_sound: 1,
            public_last_seen: 1,
            blocked_chats: [],
            muted_chats: [],
            username: i.custom_name == 0 ? i.username : i.custom_name,
            tel: i.tel,
            id: i.id,
            about: i.about,
            country: i.country,
            wallpapers: [],
            removed: i.partner_removed
        }
    }

    let reset_choice = (new_) => {
        document.querySelectorAll('button.chat_bg_option').forEach(el => {
            helper._(el).lastChild.hide()
        });
        sw.updateWallpaper(settings.id, new_).then(() => {
            settings.wallpaper = new_;
            if (self.openedChat != null) {
                helper._('#chatBox-' + self.openedChat).child(0).style(ac.wallpaper_style(self));
            }
            self.bottomInfo('Wallpaper updated successfully', 'success');
        })
    }

    let edit_info = function(id) {
        let text_arr = ['profile_name', 'profile_tel', 'profile_about'];

        if (settings.id != settings.id && ['profile_name', null].indexOf(id) == -1) {
            return;
        }

        if (text_arr.indexOf(editing) != -1) {
            let holder = helper._('#' + editing).attr({
                contenteditable: 'false',
                style: {
                    outline: 'none',
                    borderBottom: 'none',
                }
            });
            let val = holder.value();
            switch (editing) {
                case 'profile_name':

                    if (val.split('').all_in(helper.letters.concat(helper.numbers).concat([' '])) && !val.empty() && val.length.in_range(1, 30)) {
                        if (val != settings.username)
                            sw.updateProfile({ user: settings.id, cell: 'username', value: val, chat: chat_id, owner: self.settings.id }).then(() => {
                                if (chat_id) {
                                    self.chats[chat_id].info.custom_name = val;
                                    helper._('#' + chat_id).child(1).child(0).html(val);
                                    helper._('#chatBox-' + chat_id).child(0).child(0).child(0).child(0).child(0).child(1).child(0).child(0).html(val);
                                    self.refreshMessages(chat_id);
                                } else {
                                    settings.username = val;
                                }

                                self.bottomInfo('Name updated successfully!', 'success')
                            }).catch(err => {
                                self.bottomInfo('Name update failed!', 'error')
                            })
                    } else {
                        self.bottomInfo('Invalid name!', 'error')
                        holder.html(self.username(settings.id, settings.username))
                    }
                    break;

                case 'profile_about':
                    if (!val.empty() && val.length.in_range(1, 200)) {
                        val = val.escape();
                        if (val != settings.about.unescape())
                            sw.updateProfile({ user: settings.id, cell: 'about', value: val, chat: chat_id }).then(() => {
                                settings.about = val;
                                self.bottomInfo('Updated successfully!', 'success')
                            }).catch(err => {
                                self.bottomInfo('Update failed!', 'error')
                            })
                    } else {
                        self.bottomInfo('Invalid input', 'error')
                        holder.html(settings.about.unescape());
                    }
                    break;

                case 'profile_tel':
                    if (!val.empty() && val.isTel()) {
                        if (val != settings.tel)
                            sw.updateProfile({ user: settings.id, cell: 'tel', value: val, chat: chat_id }).then(() => {
                                settings.tel = val;
                                self.bottomInfo('Updated successfully!', 'success')
                            }).catch(err => {
                                self.bottomInfo('Update failed! Error: ' + err, 'error')
                            })
                    } else {
                        self.bottomInfo('Invalid input', 'error')
                        holder.html(settings.tel);
                    }

            }
        }

        if (text_arr.indexOf(id) != -1) {
            helper._('#' + id).attr({
                contenteditable: 'true',
                style: {
                    outline: 'none',
                    borderBottom: '1.5px solid rgb(52, 183, 241)',
                }
            }).self.focus();
            editing = id;
            if (id == 'profile_tel') {

                let cc = '+' + self.countries[settings.country.toUpperCase()].phonecode;

                function add_cc(e) {
                    let new_v = e.target.innerText;
                    if (new_v.length <= cc.length) {
                        e.target.innerHTML = cc;
                    }
                }
                helper._('#profile_tel').attr({
                    onkeyup: (e) => {
                        add_cc(e)
                    },
                    oncut: (e) => {
                        setTimeout(() => {
                            add_cc(e)
                        }, 100)
                    }
                })
            }
        }


        let options = {
            profile_receipt: {
                settings_id: 'readReceipt',
                title: 'Read Receipt',
                options: [
                    { id: '1', value: 'Enable' },
                    { id: '0', value: 'Disable' }
                ],
                html: { html_1: 'Enabled', html_0: 'Disabled' },
                db_cell: 'read_receipt'
            },
            profile_sound: {
                settings_id: 'notificationSounds',
                title: 'Notification Sounds',
                options: [
                    { id: '1', value: 'Enable' },
                    { id: '0', value: 'Disable' }
                ],
                html: { html_1: 'Enabled', html_0: 'Disabled' },
                db_cell: 'notification_sound'
            },
            profile_othersound: {
                settings_id: 'other_sounds',
                title: 'Other Sounds',
                options: [
                    { id: '1', value: 'Enable' },
                    { id: '0', value: 'Disable' }
                ],
                html: { html_1: 'Enabled', html_0: 'Disabled' },
                db_cell: 'other_sounds'
            },
            profile_last_seen: {
                settings_id: 'publicLastSeen',
                title: 'Last Seen',
                options: [
                    { id: '1', value: 'Public' },
                    { id: '0', value: 'Private' }
                ],
                html: { html_1: 'Public', html_0: 'Private' },
                db_cell: 'public_last_seen'
            },
            profile_acc_type: {
                settings_id: 'accountType',
                title: 'Account Type',
                options: [
                    { id: '1', value: 'Public' },
                    { id: '0', value: 'Private' }
                ],
                html: { html_1: 'Public', html_0: 'Private' },
                db_cell: 'account_type'
            },

        }
        if (Object.keys(options).includes(id)) {
            let active = options[id];
            let sel = new helper.Modal().RequestSelection();
            sel.touch_close = true;
            sel.title = active.title;
            sel.options = active.options;
            sel.request().then(resp => {
                if (resp != settings[options[id].settings_id]) {
                    sw.updateProfile({ user: settings.id, cell: active.db_cell, value: resp, chat: undefined }).then(() => {
                        settings[options[id].settings_id] = resp;
                        helper._('#' + id).html(active.html['html_' + resp]);
                        self.bottomInfo(active.title + ' updated successfully!', 'success')
                    }).catch(err => {
                        self.bottomInfo(active.title + ' update failed!', 'error')
                    })
                }
            }).catch(err => {})
        } else if (id == 'profile_enterBTN' || id == 'profile_autoR') {
            let target = id == 'profile_enterBTN' ? 'enter_button' : 'auto_refresh_chat';
            let val = settings[target] == 1 ? 0 : 1;
            sw.updateProfile({ user: settings.id, cell: target, value: val, chat: undefined }).then(() => {
                settings[target] = val;
                if (val == 1) {
                    helper._('#' + id).removeClass('text-muted').addClass('text-primary').html('toggle_on');
                } else {
                    helper._('#' + id).removeClass('text-primary').addClass('text-muted').html('toggle_off');
                }

                self.bottomInfo('Updated was successfull!', 'success')
            }).catch(err => {
                self.bottomInfo('Update failed!', 'error')
            })
        }

    }

    let muted_blocked_count = (type) => {
        let obj = type == 'block' ? settings.blocked_chats : settings.muted_chats;
        let word = type == 'block' ? ' Blocked' : ' Muted'
        return obj.length + word + ' chat' + (obj.length == 1 ? '' : 's')
    }

    let chat_inner_text_for_menu_item = (chat, menu_item) => {
        try {
            let ddm = helper._('#chatBox-' + chat).child(0).child(0).child(0).child(0).lastChild.lastChild.lastChild;
            if (menu_item == 'block')
                ddm.child(2).html('Block');
            else
                ddm.child(0).html('Mute');
        } catch (err) {}
    }

    let solidColors = () => {
        let all = [];

        self.colors.forEach(col => {

            let colBtn = helper.make_el('button').attr({
                class: 'btn chat_bg_option',
                style: {
                    background: col,
                    height: '50px',
                    width: '50px',
                    margin: '0 0 5px 5px',
                    borderRadius: '25px'
                },
                onclick: () => {
                    reset_choice(col);
                    colBtn.child(0).show();
                }
            }).addChild(helper.make_el('span').attr({
                class: 'material-icons-outlined',
                style: {
                    background: 'white',
                    borderRadius: '12px',
                    padding: '1px',
                }
            }).hide().html('check').self);

            if (settings.wallpaper == col) {
                colBtn.child(0).show();
            }
            all.push(colBtn.self)
        });
        return all;
    }

    let pictureWp = () => {

        let fileChooser = helper.make_el('button').attr({
            class: 'btn',
            style: {
                height: '50px',
                width: '50px',
                margin: '0 0 5px 5px',
                borderRadius: '25px',
                border: '1px solid royalblue'
            },
            onclick: () => {
                ac.choose_file({ accept: 'image/*' }).then(files => {
                    let f = new helper.File_(files[0]);
                    let loader = new helper.Modal().Loading('Hang on..');
                    f.upload({ destination: 'src/actions.php?cg_wallpaper=' + f.name.i + '&user_id=' + settings.id, progressHandler: () => {} }).then(done => {
                        done = JSON.parse(done);
                        settings.wallpapers.push(done.dp);
                        loader.loader.close()
                    }).catch(er => {
                        loader.loader.close();
                        self.bottomInfo('Failed', 'error');
                    })
                    let wp_d = helper.make_el('button').attr({
                        class: 'btn chat_bg_option',
                        style: {
                            height: '50px',
                            width: '50px',
                            margin: '0 0 5px 5px',
                            borderRadius: '25px',
                            border: '1px solid royalblue',
                            overflow: 'hidden',
                            padding: '0px',
                            position: 'relative'
                        },
                        onclick: () => {
                            reset_choice(f.name.i);
                            wp_d.lastChild.show();
                        }
                    }).addChild([
                        helper.make_el('img').attr({
                            src: f.URL,
                            style: {
                                objectFit: 'cover',
                                height: '50px',
                                width: '50px',
                                borderRadius: '25px',
                            }
                        }).self,
                        helper.make_el('span').attr({
                            class: 'material-icons-outlined',
                            style: {
                                background: 'white',
                                borderRadius: '12px',
                                padding: '1px',
                                position: 'absolute',
                                right: '10px',
                                top: '10px',
                            }
                        }).hide().html('check').self
                    ]);

                    fileChooser.parent().addChild(wp_d.self)
                })
            }
        }).html('<span class="material-icons-outlined">add_photo_alternate</span>');


        let wp_opt = function(type, src) {
            let wp_div = helper.make_el('button').attr({
                class: 'btn chat_bg_option',
                style: {
                    height: '50px',
                    width: '50px',
                    margin: '0 0 5px 5px',
                    borderRadius: '25px',
                    border: '1px solid royalblue',
                    overflow: 'hidden',
                    padding: '0px',
                    position: 'relative'
                },
                onclick: () => {
                    reset_choice(src);
                    wp_div.lastChild.show().self.style.visibility = 'visible';
                }
            }).addChild([
                helper.make_el('img').attr({
                    src: type == 'default' ? self.defaultBg : (self.root + 'visitors/' + settings.id + '/wallpapers/' + src),
                    style: {
                        objectFit: 'cover',
                        height: '50px',
                        width: '50px',
                        borderRadius: '25px',
                    }
                }).self,
                helper.make_el('span').attr({
                    class: 'material-icons-outlined',
                    style: {
                        background: 'white',
                        borderRadius: '12px',
                        padding: '1px',
                        position: 'absolute',
                        right: '10px',
                        top: '10px',
                        visibility: settings.wallpaper == src ? 'visible' : 'hidden'
                    }
                }).html('check').self
            ])

            return wp_div.self;
        }

        let all = [fileChooser.self];

        all.push(wp_opt('default', 'default'));

        if (settings.wallpapers.length > 0) {
            settings.wallpapers.forEach(wp => {
                all.push(wp_opt('custom', wp))
            })

        }
        return all;
    }

    let head = helper.make_el('div').style({
        background: 'rgba(0,0,0,0.02)',
        height: '40px',
        position: 'relative'
    }).addChild([
        helper.make_el('button').attr({
            class: 'btn btn-light has_click_event',
            style: { position: 'absolute', left: '0' },
            onclick: () => {
                w.close()
            }
        }).html('<span class="material-icons-outlined has_click_event">arrow_back</span>').self,
        helper.make_el('span').style({ fontSize: '1.3em' }).html('Profile').self
    ]);

    let mainBody = helper.make_el('div').attr({
        style: {
            background: 'white',
        },
        onclick: (e) => {
            let el = e.target;
            if (el.innerHTML != 'edit' && el.id != editing && !el.className.includes('has_click_event'))
                edit_info(null);
        }
    });
    let subBody = helper.make_el('div').style({ overflowY: 'auto' });

    let dp_zone = helper.make_el('img').attr({
        style: {
            objectFit: 'cover',
            height: '200px',
            width: '200px',
            borderRadius: '100px',
            marginTop: '20px',
            boxShadow: 'rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px'
        },
        src: this.dp(settings.dp, settings.id),
        onclick: (e) => {
            if (myId != settings.id) {
                new helper.Modal().expandElement(e.target);
                return;
            }
            let rs = new helper.Modal().RequestSelection();
            rs.title = '';
            rs.options = [
                { id: 'view_pic', value: 'View Picture' },
                { id: 'change_pic', value: 'Upload new picture' }
            ];
            rs.request().then(resp => {
                if (resp == 'view_pic')
                    new helper.Modal().expandElement(e.target);
                else {
                    ac.choose_file({ accept: 'image/*' }).then(files => {
                        let f = new helper.File_(files[0]);
                        if (!f.isImage()) {
                            self.bottomInfo('Invalid file, only JPEG, PNG, JPG', 'error');
                            return;
                        }
                        let ld = new helper.Modal().Loading('Hang on... <span class="spinner-border spinner-border-sm"></span>');

                        f.upload({
                            destination: 'src/actions.php?update_dp=' + f.name.i + '&user_id=' + settings.id,
                            progressHandler: (props) => {}
                        }).then(respond => {
                            settings.dp = f.name.i;
                            e.target.src = this.dp(f.name.i, settings.id);
                            settings.dps.push(f.name.i)
                            add_dp(f.name.i);
                            ld.loader.close();
                        }).catch(e => {
                            ld.loader.close();
                            self.bottomInfo('Failed to update dp', 'error');
                        })
                    })
                }
            }).catch(er => {})
        }
    });

    let all_dps = helper.make_el('div').style({
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        overflowX: 'auto',
        padding: '5px',
    });

    let reset_dp = function() {
        document.querySelectorAll('button.btn-profile-dp').forEach(el => {
            helper._(el).lastChild.hide();
        });
    }

    function add_dp(dp) {
        reset_dp()
        let dp_div = helper.make_el('button').attr({
            class: 'btn btn-profile-dp',
            style: {
                height: '50px',
                width: '50px',
                margin: '0 0 5px 5px',
                borderRadius: '25px',
                border: '1px solid royalblue',
                overflow: 'hidden',
                padding: '0px',
                position: 'relative'
            },
            onclick: () => {
                if (settings.dp != dp) {
                    sw.updateProfile({ cell: 'dp', user: settings.id, value: dp }).then(() => {
                        settings.dp = dp;
                        reset_dp(dp);
                        dp_div.lastChild.show().self.style.visibility = 'visible';
                        dp_zone.self.src = dp_div.child(0).self.src;
                    }).catch(() => {
                        self.bottomInfo('Failed to upadate dp', 'error');
                    });
                }
            }
        }).addChild([
            helper.make_el('img').attr({
                src: self.dp(dp, settings.id),
                style: {
                    objectFit: 'cover',
                    height: '50px',
                    width: '50px',
                    borderRadius: '25px',
                }
            }).self,
            helper.make_el('span').attr({
                class: 'material-icons-outlined',
                style: {
                    background: 'white',
                    borderRadius: '12px',
                    padding: '1px',
                    position: 'absolute',
                    right: '10px',
                    top: '10px',
                    visibility: settings.dp == dp ? 'visible' : 'hidden'
                }
            }).html('check').self
        ]);

        all_dps.addChild(dp_div.self);
    }


    let dpDiv = helper.make_el('div').style({
        textAlign: 'center',
        minHeight: '240px'
    }).addChild([
        dp_zone.self,
        helper.make_el('div').class('profile-values-container').addChild([
            helper.make_el('div').html('<span class="material-icons-outlined">collections</span>').self,
            helper.make_el('div').class('profile-values text-center').addChild([
                helper.make_el('span').class('text-muted').html('Choose from older Dps').self,
                all_dps.self
            ]).self,
            helper.make_el('div').attr({
                class: 'has_click_event',
                title: 'Delete either selected or unselected',
                onclick: () => {
                    if (settings.dps.length == 0 || settings.dp == '') {
                        self.bottomInfo('You don\'t have any Dp', 'error');
                        return;
                    }
                    let sel = new helper.Modal().RequestSelection();
                    sel.title = 'What do you want to do?'
                    sel.options = [
                        { id: 'sel', value: 'Delete current Dp <span class="text-muted text-sm">(Your dp will be globally removed, you have to add another)</span>' }
                    ];
                    if (settings.dps.length > 1) {
                        sel.options.push({ id: 'unsel', value: 'Delete all Dps except the current one' });
                    }
                    sel.request().then(resp => {
                            if (resp == 'sel') {
                                sw.deleteDp([settings.dp], settings.id, 1).then(() => {
                                    dp_zone.self.src = self.defaultDp;
                                    document.querySelectorAll('button.btn-profile-dp').forEach(el => {
                                        let dp_z = helper._(el).firstChild;
                                        let src_arr = dp_z.self.src.split('/')
                                        if (src_arr[src_arr.length - 1] == settings.dp)
                                            helper._(el).delete();
                                    });
                                    settings.dps = settings.dps.filter(dp => {
                                        return dp != settings.dp;
                                    });
                                    settings.dp = ''
                                    this.bottomInfo('Done', 'success')
                                }).catch(err => {
                                    this.bottomInfo('Failed', 'error');
                                })

                            } else {
                                sw.deleteDp(settings.dps.filter(dp => { return dp != settings.dp }), self.id, 0).then(() => {
                                    document.querySelectorAll('button.btn-profile-dp').forEach(el => {
                                        let dp_z = helper._(el).firstChild;
                                        let src_arr = dp_z.self.src.split('/')
                                        if (src_arr[src_arr.length - 1] != settings.dp)
                                            helper._(el).delete();
                                    });
                                    settings.dps = [settings.dp];
                                    this.bottomInfo('Done', 'success')
                                }).catch(err => {
                                    this.bottomInfo('Failed', 'error');
                                })
                            }
                        }).catch(err => {})
                        //
                }
            }).style({ visibility: 'visible' }).html('<span class="material-icons-outlined text-danger">delete</span>').self
        ]).self,
    ]);

    if (settings.id == myId) {
        if (settings.dps.length > 0)
            settings.dps.forEach(dp => {
                add_dp(dp);
            });

        if (settings.enter_button == 1) {
            enter_toggle = 'toggle_on';
            enter_toggle_class = 'text-primary';
        }

        if (settings.auto_refresh_chat == 1) {
            auto_toggle = 'toggle_on';
            auto_toggle_class = 'text-primary';
        }

    } else {
        all_dps.parent().parent().delete()
    }

    let nameDive = helper.make_el('div').class('profile-values-container').addChild([
        helper.make_el('div').html('<span class="material-icons-outlined">person</span>').self,
        helper.make_el('div').class('profile-values').addChild([
            helper.make_el('span').class('text-muted').html('Name').self,
            helper.make_el('div').id('profile_name').html(self.username(settings.id, settings.username)).self,
            helper.make_el('div').class('text-muted')
            .html(chat_id ? 'You can customize this name if you don\'t want number to be displayed!' :
                'This name will be visible to all your contacts').self
        ]).self,
        helper.make_el('div').attr({
            class: 'has_click_event',
            onclick: () => {
                if (settings.id != '0001')
                    edit_info('profile_name');
            }
        }).style({ visibility: 'visible' }).html(edit_icon).self
    ])

    let aboutDiv = helper.make_el('div').class('profile-values-container').addChild([
        helper.make_el('div').html('<span class="material-icons-outlined">info</span>').self,
        helper.make_el('div').class('profile-values').addChild([
            helper.make_el('span').class('text-muted').html('About').self,
            helper.make_el('div').id('profile_about').html(settings.about.unescape()).self
        ]).self,
        helper.make_el('div').attr({
            class: 'has_click_event',
            onclick: () => {
                edit_info('profile_about');
            }
        }).style({ visibility: visibility }).html(edit_icon).self
    ])

    let telDiv = helper.make_el('div').class('profile-values-container').addChild([
        helper.make_el('div').html('<span class="material-icons-outlined">phone</span>').self,
        helper.make_el('div').class('profile-values').addChild([
            helper.make_el('span').class('text-muted').html('Phone').self,
            helper.make_el('div').id('profile_tel').html(settings.tel).self
        ]).self,
        helper.make_el('div').attr({
            class: 'has_click_event',
            onclick: () => {
                edit_info('profile_tel');
            }
        }).style({ visibility: visibility }).html(edit_icon).self
    ])

    let countryDiv = helper.make_el('div').class('profile-values-container').addChild([
        helper.make_el('div').html('<span class="material-icons-outlined">flag</span>').self,
        helper.make_el('div').class('profile-values').addChild([
            helper.make_el('span').class('text-muted').html('Country').self,
            helper.make_el('div').html(self.countries[settings.country.toUpperCase()].nicename).self
        ]).self
    ]);

    let blockedConts = helper.make_el('div').class('profile-values-container').addChild([
        helper.make_el('div').html('<span class="material-icons-outlined">block</span>').self,
        helper.make_el('div').attr({
            class: 'profile-values',
            onclick: () => {
                let tab = new helper.Modal().Table();
                tab.title = 'Bloked chats';
                tab.defaultContent = 'No Blocked Chats!';
                if (settings.blocked_chats.length > 0) {

                    let conatainer = helper.make_el('table').class('table-blocked-users').style({ width: '100%' }).addChild(helper.make_el('tbody').self);
                    settings.blocked_chats.forEach(el => {
                        let p = self.chats[el].info;
                        conatainer.child(0).addChild(helper.make_el('tr').addChild([
                            helper.make_el('td').setWidth('50px').addChild(
                                helper.make_el('img').attr({
                                    src: self.dp(p.dp, p.id),
                                    class: 'dp'
                                }).self
                            ).self,

                            helper.make_el('td').addChild([
                                helper.make_el('span').class('font-weight-bolder').html(p.tel).self,
                                helper.make_el('div').class('text-muted').html(p.about.unescape()).self
                            ]).self,

                            helper.make_el('td').setWidth('120px').addChild(helper.make_el('button').attr({
                                class: 'btn btn-primary btn-add-public-user',
                                onclick: (e) => {
                                    let bt = helper._(e.target).html('Hang on... <i class="fa fa-spinner fa-pulse"></i>').disable()
                                    sw.blockContact(el, settings.id).then(ret => {
                                        bt.style({ background: 'transparent', color: 'rgba(0,0,0,0.6)' }).html('Chat Unblocked');
                                        let ind_b = settings.blocked_chats.indexOf(el);
                                        settings.blocked_chats.splice(ind_b, 1);
                                        chat_inner_text_for_menu_item(el, 'block');
                                        self.chat_action_HTML(el, 'action-block', false, '');
                                        helper._('#profile_blocked').html(muted_blocked_count('block'));
                                        self.bottomInfo('Unblock successfull', 'success');
                                    }).catch(err => {
                                        // console.log(err)
                                    })
                                }
                            }).html('Unblock').self).self
                        ]).self)
                    })
                    tab.options.push(conatainer.self)
                }

                tab.launch().then(res => {}).catch(err => {})
            }
        }).addChild([
            helper.make_el('span').class('text-muted').html('Blocked chats').self,
            helper.make_el('div').id('profile_blocked').html(muted_blocked_count('block')).self
        ]).self
    ]);

    let mutedConts = helper.make_el('div').class('profile-values-container').addChild([
        helper.make_el('div').html('<span class="material-icons-outlined">volume_off</span>').self,
        helper.make_el('div').attr({
            class: 'profile-values',
            onclick: () => {
                let tab = new helper.Modal().Table();
                tab.title = 'Muted chats';
                tab.defaultContent = 'No Muted Chats!';
                if (settings.muted_chats.length > 0) {

                    let conatainer = helper.make_el('table').class('table-muted-users').style({ width: '100%' }).addChild(helper.make_el('tbody').self);

                    settings.muted_chats.forEach(el => {

                        let p = self.chats[el].info;
                        conatainer.child(0).addChild(helper.make_el('tr').addChild([
                            helper.make_el('td').setWidth('50px').addChild(
                                helper.make_el('img').attr({
                                    src: self.dp(p.dp, p.id),
                                    class: 'dp'
                                }).self
                            ).self,

                            helper.make_el('td').addChild([
                                helper.make_el('span').class('font-weight-bolder').html(p.tel).self,
                                helper.make_el('div').class('text-muted').html(p.about.unescape()).self
                            ]).self,

                            helper.make_el('td').setWidth('120px').addChild(helper.make_el('button').attr({
                                class: 'btn btn-primary btn-add-public-user',
                                onclick: (e) => {
                                    let bt = helper._(e.target).html('Hang on... <i class="fa fa-spinner fa-pulse"></i>').disable()
                                    sw.muteContact(el, settings.id).then(ret => {
                                        bt.style({ background: 'transparent', color: 'rgba(0,0,0,0.6)' }).html('Chat Unmuted');
                                        let ind_b = settings.muted_chats.indexOf(el);
                                        settings.muted_chats.splice(ind_b, 1);
                                        chat_inner_text_for_menu_item(el, 'mute');
                                        self.chat_action_HTML(el, 'action-notifications_off', false, '');
                                        helper._('#profile_muted').html(muted_blocked_count('muted'));
                                        self.bottomInfo('Unmute successfull', 'success');
                                    }).catch(err => {
                                        // console.log(err)
                                    })
                                }
                            }).html('Unmute').self).self
                        ]).self)
                    })

                    tab.options.push(conatainer.self);
                }
                tab.launch().then(res => {}).catch(err => {})
            }
        }).addChild([
            helper.make_el('span').class('text-muted').html('Muted chats').self,
            helper.make_el('div').id('profile_muted').html(muted_blocked_count('muted')).self
        ]).self
    ]);

    let wallPP = helper.make_el('div').class('profile-values-container').addChild([
        helper.make_el('div').html('<span class="material-icons-outlined">wallpaper</span>').self,
        helper.make_el('div').class('profile-values').addChild([
            helper.make_el('span').class('text-muted').html('Wallpaper').self,
            helper.make_el('div').html('Solid colors').self,
            helper.make_el('div').style({
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                overflowX: 'auto',
                padding: '5px'
            }).addChild(solidColors()).self,

            helper.make_el('div').style({ marginTop: '10px' }).html('Photos <span class="text-muted">(When you upload a new photo, select it after upload, to use. It must be checked to indicate <b>active</b>)</span>').self,

            helper.make_el('div').style({
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                overflowX: 'auto',
                padding: '5px'
            }).addChild(pictureWp()).self,
        ]).self,

        helper.make_el('div').attr({
            class: 'has_click_event',
            title: 'Delete either selected or unselected',
            onclick: () => {
                if (settings.wallpapers.length == 0) {
                    self.bottomInfo('You don\'t have any custom wallpaper', 'error');
                    return;
                }
                let sel = new helper.Modal().RequestSelection();
                sel.title = 'What do you want to do?'
                if (settings.wallpaper.split('.').length > 1) {
                    sel.options.push({ id: 'curr', value: 'Delete current Wallpaper <span class="text-muted text-sm">(Your wallpaper will reset to default)</span>' });
                    sel.options.push({ id: 'all', value: 'Delete all custom wallpapers except current' });
                } else {
                    sel.options.push({ id: 'all', value: 'Delete all custom wallpapers' });
                }

                sel.request().then(resp => {
                        if (resp == 'all') {
                            sw.deleteWp(settings.wallpapers.filter(wp => { return wp != settings.wallpaper }), settings.id, 0).then(() => {
                                document.querySelectorAll('button.chat_bg_option').forEach(el => {
                                    let dp_z = helper._(el).firstChild;
                                    if (dp_z.self.tagName == 'IMG') {
                                        let src_arr = dp_z.self.src.split('/');
                                        let src = src_arr[src_arr.length - 1];
                                        if (src != settings.wallpaper && src != 'default-bg.jpg') {
                                            helper._(el).delete();
                                        }

                                    }
                                });
                                settings.wallpapers = settings.wallpapers.filter(wp => {
                                    return (wp == settings.wallpaper && wp != 'default');
                                });

                                this.bottomInfo('Done', 'success')
                            }).catch(err => {
                                this.bottomInfo('Failed', 'error');
                            })

                        } else {
                            sw.deleteWp([settings.wallpaper], settings.id, 1).then(() => {
                                reset_choice('default');
                                document.querySelectorAll('button.chat_bg_option').forEach(el => {
                                    let wp_z = helper._(el).firstChild;
                                    if (wp_z.self.tagName == 'IMG') {
                                        let src_arr = wp_z.self.src.split('/');
                                        let src = src_arr[src_arr.length - 1];
                                        if (src == settings.wallpaper)
                                            helper._(el).delete();
                                        if (src == 'default-bg.jpg') {
                                            wp_z.nextSibling.show().self.style.visibility = 'visible';
                                        }
                                    }
                                });
                                settings.wallpapers = settings.wallpapers.filter(wp => {
                                    return wp != settings.wallpaper;
                                });

                                settings.wallpaper = 'default';

                                this.bottomInfo('Done', 'success')
                            }).catch(err => {
                                this.bottomInfo('Failed', 'error');
                            })
                        }
                    }).catch(err => {})
                    //
            }
        }).style({ visibility: 'visible' }).html('<span class="material-icons-outlined text-danger">delete</span>').self
    ]);

    let enterBtnEqualsSend = helper.make_el('div').class('profile-values-container').addChild([
        helper.make_el('div').html('<span class="material-icons-outlined">keyboard_return</span>').self,
        helper.make_el('div').class('profile-values').addChild([
            helper.make_el('span').html('Enter button equals send').self,
            helper.make_el('div').class('text-muted').html(
                'By toggling this on, whenever you press the Enter button when typing a message, it sends the message. This is good only for PCs'
            ).self
        ]).self,
        helper.make_el('div').attr({
            class: 'has_click_event',
            onclick: () => {
                edit_info('profile_enterBTN');
            }
        }).style({ visibility: visibility }).html('<span class="material-icons-outlined ' + enter_toggle_class + '" id = "profile_enterBTN">' + enter_toggle + '</span>').self
    ]);

    let autoRefreshChat = helper.make_el('div').class('profile-values-container').addChild([
        helper.make_el('div').html('<span class="material-icons-outlined">autorenew</span>').self,
        helper.make_el('div').class('profile-values').addChild([
            helper.make_el('span').html('Auto-refresh chat').self,
            helper.make_el('div').class('text-muted').html(
                'By toggling this on, whenever there seem to be an issue with a chat, it refreshes automatically. You can turn this off and refresh a chat manually when you want by going to the chat\'s menu'
            ).self
        ]).self,
        helper.make_el('div').attr({
            class: 'has_click_event',
            onclick: () => {
                edit_info('profile_autoR');
            }
        }).style({ visibility: visibility }).html('<span class="material-icons-outlined ' + auto_toggle_class + '" id = "profile_autoR">' + auto_toggle + '</span>').self
    ]);

    let readRec = helper.make_el('div').class('profile-values-container').addChild([
        helper.make_el('div').html('<span class="material-icons-outlined">done_all</span>').self,
        helper.make_el('div').attr({
            onclick: () => {
                edit_info('profile_receipt');
            }
        }).class('profile-values').addChild([
            helper.make_el('span').class('text-muted').html('Read receipt').self,
            helper.make_el('div').id('profile_receipt').html(settings.read_receipt == 1 ? 'Enabled' : 'Disabled').self,
            helper.make_el('div').class('text-muted').html(
                'This setting is not really useful, When you disable Read receipt, the partner won\'t know when you\'ve read their messages.' +
                ' Unlike the real WhatsApp, this setting is not mutual unless it is disabled for both chats.'
            ).self
        ]).self
    ]);

    let notiSound = helper.make_el('div').class('profile-values-container').addChild([
        helper.make_el('div').html('<span class="material-icons-outlined">notifications</span>').self,
        helper.make_el('div').attr({
            onclick: () => {
                edit_info('profile_sound');
            }
        }).class('profile-values').addChild([
            helper.make_el('span').class('text-muted').html('Notification sounds').self,
            helper.make_el('div').id('profile_sound').html(settings.notification_sound == 1 ? 'Enabled' : 'Disabled').self,
            helper.make_el('div').class('text-muted').html(
                'This includes only sounds from incoming calls and new messages outside the chat'
            ).self
        ]).self
    ]);

    let otherSound = helper.make_el('div').class('profile-values-container').addChild([
        helper.make_el('div').html('<span class="material-icons-outlined">notifications</span>').self,
        helper.make_el('div').attr({
            onclick: () => {
                edit_info('profile_othersound');
            }
        }).class('profile-values').addChild([
            helper.make_el('span').class('text-muted').html('Extra sounds').self,
            helper.make_el('div').id('profile_othersound').html(settings.other_sounds == 1 ? 'Enabled' : 'Disabled').self,
            helper.make_el('div').class('text-muted').html(
                'This includes sounds like message sent, caller tune, new message inside the chat...'
            ).self
        ]).self
    ]);

    let LastSeen = helper.make_el('div').class('profile-values-container').addChild([
        helper.make_el('div').html('<span class="material-icons-outlined">schedule</span>').self,
        helper.make_el('div').attr({
            onclick: () => {
                edit_info('profile_last_seen');
            }
        }).class('profile-values').addChild([
            helper.make_el('span').class('text-muted').html('Last seen').self,
            helper.make_el('div').id('profile_last_seen').html(settings.public_last_seen == 1 ? 'Public' : 'Private').self,
            helper.make_el('div').class('text-muted').html(
                'By setting last seen to private, your chats won\'t know when you are online or when last you visited.'
            ).self
        ]).self
    ]);

    let accountType = helper.make_el('div').class('profile-values-container').addChild([
        helper.make_el('div').html('<span class="material-icons-outlined">account_circle</span>').self,
        helper.make_el('div').attr({
            onclick: () => {
                edit_info('profile_acc_type');
            }
        }).class('profile-values').addChild([
            helper.make_el('span').class('text-muted').html('Account Type').self,
            helper.make_el('div').id('profile_acc_type').html(settings.account_type == 1 ? 'Public' : 'Private').self,
            helper.make_el('div').class('text-muted').html(
                'By setting your account type to private, no one can connect with you except you share invitation link, you won\'t appear on the list of public chats.'
            ).self
        ]).self
    ]);


    let invite = helper.make_el('div').attr({
        class: 'profile-values-container',
        style: { cursor: 'pointer' },
        onclick: () => {
            let body = helper.make_el('div').style({
                width: 'inherit',
                overflow: 'auto'
            }).addChild([
                helper.make_el('div').html('Share your link').self,
                helper.make_el('div').style({
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    overflowX: 'auto',
                    padding: '5px'
                }).addChild(this.shareActions(settings.invitation_key)).self,
            ])
            this.Alert({
                body: body.self,
                width: 90,
                direction: 'bottom'
            })
        }
    }).addChild([
        helper.make_el('div').html('<span class="material-icons-outlined">people</span>').self,
        helper.make_el('div').class('profile-values').html('Invite a friend').self
    ]);
    let _name = '<b>' + this.username(settings.id, settings.tel) + '</b>';
    let inviteFor = helper.make_el('div').attr({
        class: 'profile-values-container',
        style: { cursor: 'pointer' },
        onclick: () => {
            let body = helper.make_el('div').style({
                width: 'inherit',
                overflow: 'auto'
            }).addChild([
                helper.make_el('div').html('Share ' + _name +
                    '\'s link. The account is public so whoever login or join using the link, ' +
                    'becomes a friend to ' + _name).self,
                helper.make_el('div').style({
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    overflowX: 'auto',
                    padding: '5px'
                }).addChild(this.shareActions(settings.invitation_key)).self,
            ])
            this.Alert({
                body: body.self,
                width: 90,
                direction: 'bottom'
            })
        }
    }).addChild([
        helper.make_el('div').html('<span class="material-icons-outlined">share</span>').self,
        helper.make_el('div').class('profile-values').html('Share this Contact').self
    ]);

    let deactivate = helper.make_el('div').addChild(
        helper.make_el('button').attr({
            class: 'btn btn-danger',
            style: {
                margin: '10px'
            },
            onclick: () => {
                let cnf = new helper.Modal().Confirm({
                    acceptText: '<span class="text-danger">Delete account</span>',
                    title: '<span class="material-icons-outlined">warning</span> Please Confirm!<hr>',
                    content: 'Your account is going to be deleted completely from our Database, All files and ' +
                        'messages you have shared with people on this platform will be lost but your partner will ' +
                        'still have his copy of the chat. <div> If you have made up your mind, then we are truely not happy ' +
                        'that you are leaving. Just in case you love the project don\'t forget to: </div>' +
                        '<div> -- Rate my work</div>' +
                        '<div> -- Download source codes if you are a developer</div>' +
                        '<div> -- Like our page on Facbook </div>' +
                        '<div> -- Check out more projects </div><hr>'
                });
                cnf.then(() => {
                    sw.deleteAccout(settings.id).then(() => {
                        this.Alert('Your Account has been Deleted!');
                        setTimeout(() => {
                            window.location.reload();
                        }, 3000);
                    }).catch(d => {
                        console.log(d)
                    })
                }).catch(e => {})
            }
        }).html('Delete Account').self,
    );

    let company = helper.make_el('div').addChild([
        helper.make_el('div').class('h4').html('WhatApp Clone').self,
        helper.make_el('div').attr({
            class: 'text-muted',
            style: { marginTop: '10px' }
        }).html('BY').self,
        helper.make_el('div').class('h4').html(`${self.username('0001', 'Julius')}`).self,
        helper.make_el('div').class('text-muted').addChild([
            helper.make_el('a').style({ marginRight: '1.1em' }).attr({
                href: self.mainRoot
            }).html('<span class="material-icons-outlined" style="font-size: 2.5em;">home</span>').self,
            helper.make_el('a').style({ marginRight: '1.1em' }).attr({
                href: 'https://www.facebook.com/julius.ekane.946/'
            }).html('<span class="material-icons-outlined" style="font-size: 2.5em">facebook</span>').self,
            helper.make_el('a').style({ marginRight: '1.1em' }).attr({
                href: 'https://twitter.com/247developer'
            }).html('<i class="fa fa-twitter" style="font-size: 3em"></i>').self,
            helper.make_el('a').style({ marginRight: '1.1em' }).attr({
                href: 'https://www.youtube.com/channel/UCyfzaf7uohrk_a1NTdWzakg'
            }).html('<i class="fa fa-youtube-play" style="font-size: 2.7em;color:red"></i>').self,
            helper.make_el('a').style({ marginRight: '1.1em' }).attr({
                href: 'https://github.com/julius-ek-hub'
            }).html('<i class="fa fa-github" style="font-size: 2.7em;color:black;"></i>').self,
            helper.make_el('a').style({ marginRight: '1.1em' }).attr({
                href: 'https://stackoverflow.com/users/12869226/julius'
            }).html('<i class="fa fa-stack-overflow" style="font-size: 2.7em;color:#ffc209"></i>').self
        ]).self,
        helper.make_el('div').class('text-muted').html('&copy;' + new Date().format('Y') + ' All rights reserved.').self
    ]);
    let dateJoined = helper.make_el('div').addChild([
        helper.make_el('div').attr({
            class: 'text-muted',
            style: { marginTop: '10px' }
        }).html('Date Joined').self,
        helper.make_el('div').html(new Date(settings.date_joined).format('d/m/Y - h:ia', 'local')).self
    ]);

    let options = [
        dpDiv.self,
        nameDive.self,
        aboutDiv.self,
        telDiv.self,
        countryDiv.self
    ]

    if (!chat_id) {
        [
            blockedConts.self,
            mutedConts.self,
            wallPP.self,
            enterBtnEqualsSend.self,
            autoRefreshChat.self,
            readRec.self,
            notiSound.self,
            otherSound.self,
            LastSeen.self,
            accountType.self,
            invite.self,
            deactivate.self,
        ].forEach(item => options.push(item))
    } else {
        if (settings.account_type == 1)
            options.push(inviteFor.self)
    }
    options.push(dateJoined.self);
    options.push(company.self);
    if (settings.removed == 0) {
        subBody.addChild(options)
    } else
    if (settings.id != myId) {
        subBody.addClass('p-3').html('This account no longer exists!');
        w.touch_close = true;
    }
    let foot = helper.make_el('div');

    mainBody.addChild([
        head.self,
        subBody.self,
        foot.self
    ]);

    w.add_content(mainBody.self);

    let structurize = function() {
        subBody.style({ maxHeight: (innerHeight - 40) + 'px' })
        if (innerWidth < 700) {
            mainBody.style({
                width: innerWidth + 'px',
                marginLeft: '0px'
            })
        } else {
            mainBody.style({
                width: '700px',
                marginLeft: (innerWidth - 700) / 2 + 'px'
            })
        }
    }
    structurize();
    window.resize_callbacks.push(structurize)
    w.open()
}