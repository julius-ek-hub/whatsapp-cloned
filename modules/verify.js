import * as helper from './helper.js';
import * as ac from './actions-proper.js';
import * as sw from './serviceWorker.js';

export let Verify = function() {
    let self = this;
    let lastZindex = 10;
    let dp_to_be_uploaded = null;
    let info = {
        username: 'Visitor',
        dp: '',
        telcode: '+971',
        tel: '',
        country: 'ae',
        pin: '',
        id: null,
        invitation_code: '',
        name_col: this.colors[helper.random(0, this.colors.length - 1)]
    }

    let auth_container = helper.make_el('div').style({ position: 'relative', background: 'white', overflow: 'hidden' });
    let common = helper.make_el('div').style({
        position: 'absolute',
        inset: '0px'
    }).class('disappear-left auth-body').addChild(helper.make_el('div').style({
        position: 'relative',
        background: 'white',
        height: '100%',
        width: '100%'
    }).self).self;
    let auth_number = helper._(common.cloneNode(true)).removeClass('disappear-left');
    let auth_confirm_tel = helper._(common.cloneNode(true));
    let auth_set_dp = helper._(common.cloneNode(true));
    let auth_login = helper._(common.cloneNode(true));

    let all = [auth_number, auth_confirm_tel, auth_set_dp, auth_login];
    all.forEach(auth => {
        auth.appendTo(auth_container.self)
    });

    let wn = new helper.Modal({ bg: '#eeeeee' });
    wn.add_content(auth_container.self)
    wn.open();
    let structurize = function() {
        let iw = innerWidth,
            w = iw + 'px',
            ml = '0px';

        if (iw > 700) {
            w = '700px';
            ml = (iw - 700) / 2 + 'px'
        }
        auth_container.style({ width: w, height: innerHeight + 'px', marginLeft: ml });
    }
    structurize();
    window.resize_callbacks.push(structurize);

    let requestNumber = function() {

        let request = () => {
            auth_number.style({zIndex: ++lastZindex});
            return new Promise((resolve, reject) => {
                auth_number.child(0).addChild([
                    helper.make_el('div').class('text-secondary top').addChild([
                        helper.make_el('span')
                        .html(
                            `<div class="position-relative" style="padding:10px">
                            <div style="margin-left:42px;" class="h6">To begin testing this project, Choose a phone number.</div>
                            <button class="btn btn-light position-absolute" data-toggle = "dropdown" style="left:0;top:4px">
                            <span class="material-icons-outlined">help_outline</span>
                            </button>
                            <div class = "dropdown-menu">
                            <a href="${self.mainRoot}" class = "dropdown-item">Return to main Home page</a>
                             <a href="https://www.247-dev.com/projects/whatsapp-clone" class = "dropdown-item">View Project features</a>
                            </div>
                            </div>`
                        ).self,
                        helper.make_el('div').class('text-danger').id('error-tel').self
                    ]).self,
                    helper.make_el('div').class('input-group mb-0').addChild([
                        helper.make_el('div').class('input-group-append')
                        .addChild(helper.make_el('button').attr({
                                class: 'btn btn-outline-light text-dark',
                                onclick: (e) => {
                                    let btn = e.target;
                                    btn = btn.tagName == 'SPAN' || btn.tagName == 'I' ? helper._(btn).parent() : helper._(btn);
                                    let s = new helper.Modal().RequestSelection();
                                    s.title = 'Choose your country';
                                    s.add_search = true;
                                    let countries = self.countries;
                                    for (let c in countries) {

                                        s.options.push({
                                            id: c,
                                            value: countries[c].nicename + '<span class="text-secondary font-weight-lighter" style="float:right">+' + countries[c].phonecode + '</span>'
                                        });
                                    }
                                    s.request().then(resp => {
                                        info.telcode = '+' + countries[resp].phonecode;
                                        info.country = resp;
                                        btn.child(0).html(resp)
                                        btn.parent().parent().child(1).child(0).html(info.telcode);
                                    }).catch(err => {})

                                }
                            })
                            .addChild([
                                helper.make_el('span').html('AE').self,
                                helper.make_el('i').class('fa fa-sort-desc text-muted')
                                .attr({ style: 'font-size: 1.7em;margin:-10px 0 0 5px' }).self
                            ]).self).self,
                        helper.make_el('div').class('input-group-append')
                        .addChild(helper.make_el('button').class('btn btn-outline-light text-dark').html('+971').self).self,
                        helper.make_el('input').attr({
                            id: 'tel',
                            type: 'text',
                            class: 'form-control btn-outline-light text-dark',
                            placeholder: 'Enter telephone number...'
                        }).self,
                        helper.make_el('div').class('input-group-append')
                        .addChild(helper.make_el('button').attr({
                            class: 'btn btn-primary',
                            style: { marginRight: '6px' },
                            onclick: (e) => {
                                let btn = e.target;
                                btn.disabled = true;
                                ac.validateNumber(btn).then(resp => {
                                    info.tel = resp;
                                    helper._(btn).html('... <span class="spinner-border spinner-border-sm"></span>');

                                    sw.checkIfUserExists(info.telcode + info.tel, btn).then(resp => {

                                        if (resp == 0) {

                                            previewNumber().then(() => {
                                                resolve(resp);

                                            }).catch(() => {
                                                helper._(btn).html('Verify')
                                                btn.disabled = false;
                                            })
                                        } else {
                                            if (resp.removed == '1') {
                                                self.Alert({
                                                    body: ('<div class="text-danger" style="background:rgba(255,0,0,0.08);padding:8px">' +
                                                        '<i class="fa fa-warning"></i> ACCESS FORBIDDEN</div>An account that was created using this number' +
                                                        ' has been deleted and there is no way we can be of help. If it\'s a coincidence then choose another number ' +
                                                        'or create a new account'),
                                                    width: 60,
                                                    direction: 'bottom',
                                                    cancelText: 'Got it'
                                                });
                                                helper._(btn).html('Verify').parent().previousSibling.self.value = '';
                                                btn.disabled = false;
                                                return;
                                            }
                                            resolve(resp);
                                        }

                                    })


                                })
                            }
                        }).html('Verify').self).self
                    ]).self

                ]);
            })
        }
        return {
            destroy: () => {
                auth_number.removeClass('appear-left').addClass('disappear-left').truncate();
            },
            request: request
        }
    }
    let show_pin = () => {
        setTimeout(() => {
            self.Alert({
                body: `Your PIN for this entire project is <b> 
                ${info.pin} </b>. You have to use it with your phone number when next you are asked to login.
                 Do not share it with anyone! Could be changed later if only you provide an email`,
                cancelText: 'Got it'
            })
        }, 2000);
    }
    let confirmOTP = function() {
        let request = () => {
            show_pin()
            auth_confirm_tel.style({zIndex: ++lastZindex});
            return new Promise((res, rej) => {
                auth_confirm_tel.removeClass('disappear-left').addClass('appear-left').child(0).addChild([
                    helper.make_el('div').class('text-secondary top').addChild([
                        helper.make_el('span').html('We just sent your PIN code to ' + info.telcode + info.tel +
                            ' please enter the code to continue.').addChild(helper.make_el('div').class('m-2').addChild(
                            helper.make_el('a').attr({
                                href: 'javascript:void(0)'
                            }).clicked(show_pin).html('Re-show PIN').self
                        ).self).self,
                        helper.make_el('div').class('text-danger').id('error-pin').self
                    ]).self,
                    helper.make_el('div').class('input-group mb-0').addChild([
                        helper.make_el('div').class('input-group-append')
                        .addChild(helper.make_el('button').class('btn btn-outline-light text-dark')
                            .addChild(helper.make_el('span').html('PIN').self).self).self,
                        helper.make_el('input').attr({
                            id: 'tel',
                            type: 'text',
                            class: 'form-control btn-outline-light text-dark',
                            placeholder: 'Enter PIN...',
                            onkeydown: (e) => {
                                if (!e.target.value.empty() && e.key == 'Enter') {
                                    ac.confirmOTP(e.target.nextSibling.childNodes[0], info.pin).then(() => {
                                        res()
                                    })
                                }
                            }
                        }).self,
                        helper.make_el('div').class('input-group-append')
                        .addChild(helper.make_el('button').attr({
                            class: 'btn btn-primary',
                            style: { marginRight: '5px' },
                            onclick: (e) => {
                                ac.confirmOTP(e.target, info.pin).then(() => {
                                    res()
                                })
                            }
                        }).html('Verify').self).self
                    ]).self
                ])
            })
        }

        return {
            destroy: () => {
                auth_confirm_tel.removeClass('appear-left').addClass('disappear-left').truncate()
            },
            request: request
        }
    }
    let setDp = function() {
        let request = () => {
            auth_set_dp.style({zIndex: ++lastZindex}); 
            return new Promise((res, rej) => {
                auth_set_dp.removeClass('disappear-left').addClass('appear-left').child(0).addChild([
                    helper.make_el('div').class('text-secondary top').addChild([
                        helper.make_el('span').html('So people will know you better, please give us a Username and/or profile photo').self,
                        helper.make_el('div').class('text-danger').id('error-name-or-dp').self
                    ]).self,
                    helper.make_el('div').class('input-group mb-0').addChild([
                        helper.make_el('div').class('input-group-append')
                        .addChild(helper.make_el('button').attr({
                                class: 'btn btn-outline-light text-dark',
                                style: { padding: '0px' },
                                onclick: (e) => {
                                    let tg = e.target;
                                    let img = tg.tagName == 'BUTTON' ? helper._(tg).child(0) : tg
                                    ac.choose_file({ accept: 'image/*' }).then(files => {
                                        dp_to_be_uploaded = files[0];
                                        img.src = new helper.File_(files[0]).URL;
                                    })
                                }
                            })
                            .addChild(
                                helper.make_el('img').attr({
                                    class: 'dp',
                                    src: self.dp('', 0),
                                    style: {
                                        height: '35px',
                                        width: '35px'
                                    }
                                }).self).self).self,
                        helper.make_el('input').attr({
                            type: 'text',
                            class: 'form-control btn-outline-light text-dark',
                            placeholder: 'Enter Username...'
                        }).self,
                        helper.make_el('div').class('input-group-append')
                        .addChild(helper.make_el('button').attr({
                            class: 'btn btn-primary',
                            style: { marginRight: '5px' },
                            onclick: (e) => {
                                let btn = e.target;
                                btn.disabled = true;
                                ac.finish_up(btn, dp_to_be_uploaded, info).then(resp => {
                                    res({ btn: btn, info: resp })
                                }).catch(() => {
                                    btn.disabled = false;
                                })
                            }
                        }).html('Finish').self).self
                    ]).self,
                    helper.make_el('button').attr({
                        onclick: (e) => {
                            let btn = e.target;
                            btn.disabled = true;
                            res({ btn: btn, info: info });
                        }
                    }).class('btn btn-outline-light skip text-dark').html('Skip').self
                ])
            })
        }

        return {
            destroy: () => {
                auth_set_dp.removeClass('appear-left').addClass('disappear-left').truncate()
            },
            request: request
        }
    }

    let requestLogin = function() {
        let request = () => {
            return new Promise((res, rej) => {
                auth_login.removeClass('disappear-left').addClass('appear-left').child(0).addChild([
                    helper.make_el('div').class('text-secondary top').addChild([
                        helper.make_el('span').html('The number ' + info.telcode + info.tel + ' you provided is already a member of this project. To prove ownership of it, ' +
                            'provide the 6 digits PIN that was used to register it.').self,
                        helper.make_el('div').class('text-danger').id('error-pin').self
                    ]).self,
                    helper.make_el('form').class('input-group mb-0').addChild([
                        helper.make_el('input').attr({
                            autocomplete: 'username',
                            type: 'text',
                        }).hide().self,
                        helper.make_el('div').class('input-group-append')
                        .addChild(helper.make_el('span').class('btn btn-outline-light text-dark').html('PIN').self).self,
                        helper.make_el('input').attr({
                            autocomplete: 'current-password',
                            id: 'pin',
                            type: 'password',
                            class: 'form-control btn-outline-light text-dark',
                            placeholder: 'Enter PIN for this number...',
                            onkeydown: (e) => {
                                if (!e.target.value.empty() && e.key == 'Enter') {
                                    ac.verifyUser(e.target.nextSibling.childNodes[0], info).then(() => {
                                        res()
                                    })
                                }
                            }
                        }).self,
                        helper.make_el('div').class('input-group-append')
                        .addChild(helper.make_el('button').attr({
                            class: 'btn btn-primary',
                            style: { marginRight: '5px' },
                            onclick: (e) => {
                                e.preventDefault();
                                ac.verifyUser(e.target, info).then(() => {
                                    res()
                                })
                            }
                        }).html('Login').self).self,
                    ]).self,
                    helper.make_el('button').attr({
                        onclick: (e) => {
                            let btn = e.target;
                            btn.disabled = true
                            res()
                        }
                    }).class('btn btn-outline-light skip text-danger').html('Exit').self
                ])
            })
        }

        return {
            destroy: () => {
                auth_login.removeClass('appear-left').addClass('disappear-left').truncate()
            },
            request: request
        }
    }

    let previewNumber = function() {
        return new Promise((res, rej) => {
            new helper.Modal().Confirm({
                title: 'Confirm!',
                content: 'We are about to send your login PIN to <b>' +
                    info.telcode + info.tel + '</b>. Is this is your number?',
                rejectText: 'No',
                acceptText: 'Yes'
            }).then(() => {
                info.pin = helper.random(100000, 900000);
                res()
            }).catch(() => {
                rej()
            })
        })
    }

    return {
        requestNumber: requestNumber,
        confirmOTP: confirmOTP,
        setDp: setDp,
        requestLogin: requestLogin,
        previewNumber: previewNumber
    };
}