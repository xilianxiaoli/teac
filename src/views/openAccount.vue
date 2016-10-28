<style>

</style>
<template>
    <div class="yy-container container ">
        <div v-show="step ==='one'">
            <div class="form_box row">
                <section class="form_box--item form_box--bottom">
                    <label class="form_box--head" @click="doaaa()">真实姓名</label>
                    <input v-model="bindItem.name" class="form_box--input" placeholder="请输入姓名" type="text"
                           autocomplete="off" required/>
                </section>
                <section class="form_box--item form_box--bottom">
                    <label class="form_box--head">身份证号</label>
                    <input v-model="bindItem.pid" class="form_box--input" placeholder="请输入本人身份证号码" required/>
                </section>
                <section class="form_box--item form_box--bottom">
                    <label class="form_box--head">银行卡号</label>
                    <input v-model="bindItem.bankCard" @blur="checkBankType" class="form_box--input"
                           placeholder="请输入本人名下的卡，勿使用信用卡"
                           required/>
                </section>
                <section class="form_box--item">
                    <label class="form_box--head">开户银行</label>
                    <input v-model="bindItem.bankName" readonly class="form_box--input" placeholder="请输入开户行"
                           required/>
                </section>
                <section class="form_box--item form_box--bottom">
                    <label class="form_box--head">支付密码</label>
                    <input v-model="bindItem.password" class="form_box--input" placeholder="请输入支付密码" required/>
                </section>
                <section class="form_box--item form_box--bottom">
                    <label class="form_box--head">确认密码</label>
                    <input v-model="bindItem.passwordAgain" class="form_box--input" placeholder="请再次输入支付密码"
                           required/>
                </section>
                <section class="form_box--item">
                    <label class="form_box--head">手机号</label>
                    <input v-model="bindItem.phone" class="form_box--input" placeholder="请输入银行预留手机号" required/>
                </section>
            </div>
            <input class="btn-primary" @click="nextStep()" type="button" value="获取验证码" :disabled="sendCodeFlag"/>
            <section class="form_box--radio-regwrap">
                <div class="checkboxGroup">
                    <input type="checkbox" v-model="bindItem.checkDeal" id="checkboxGroupInput"/>
                    <label for="checkboxGroupInput" class="check-box"></label>
                </div>
                <label for="checkboxGroupInput">我已阅读并同意</label>
                <a href="/" id="checkbox" class="black" rel="友金所注册协议">《友金所注册协议》</a>
            </section>
        </div>

        <div v-show="step ==='two'">
            <p class="top-tip">请输入您<span class="phone-number">{{phoneMr}}</span>手机号收到的验证码</p>
            <div class="form_box row">
                <section class="form_box--item">
                    <label class="form_box--head" for="phoneInput">验证码</label>
                    <input v-model="phoneCode" class="form_box--input form_box--code" id="phoneInput"
                           name="phoneInput" type="text"
                           placeholder="请输入验证码" required/>
                    <!--<botton class="form_box&#45;&#45;code_btn" rel="获取验证码" @click="getPhoneCode()" type="button">-->
                        <!--{{phoneCodeText}}-->
                    <!--</botton>-->
                    <send-code-btn :url="postUrl" :param="sendCodeParam" ref="sendCode"></send-code-btn>
                </section>
            </div>
            <input class="btn-primary" type="button" value="完成绑定" :disabled="submitBind" @click="openAccount()"/>
        </div>
    </div>
</template>
<script>
    import {validate} from '../utils';
    import RSAUtils from 'src/common/rsa.helper';
    import sendCodeBtn from 'src/common/sendCodeBtn'
    var md5 = require('../../../lib/js-md5/md5.min.js');

    export default{
        data(){
            return {
                step: 'one',
                postUrl:'/pay/dahua/dahuaBankBinServlet.htm',
                sendCodeParam:null,
                sendCodeFlag: true,
                submitBind: true,
                phoneCodeText: '获取验证码',
                leaveTime: 60,
                codeInteval: null,
                phoneCode: '',
                phoneMr: '',
                bank_serial: '',
                rsaKey: null,
                bindItem: {
                    name: '',
                    pid: '',
                    bankCard: '',
                    bankName: '',
                    password: '',
                    passwordAgain: '',
                    phone: '',
                    checkDeal: false
                }
            }
        },
        watch: {
            bindItem: {
                handler: function(val, oldVal) {
//                    console.log(md5('sdfsdf'))
                    for (var key in val) {
                        if (key !== 'checkDeal' && validate.isEmpty(val[key])) {
                            this.sendCodeFlag = true;
                            return;
                        }
                        if (key === 'checkDeal') {
                            this.sendCodeFlag = !val[key]
                        }
                    }
                },
                deep: true
            },
            phoneCode: function(val, oldVal) {
                if (val.trim('').length != 0) {
                    this.submitBind = false
                } else {
                    this.submitBind = true
                }
            }
        },
        methods: {
            nextStep: function() {
                var msg
                var a = (
                        (!validate.certidValidata(this.bindItem.pid) && (msg = '身份证格式不正确')) ||
                        (!validate.bankCard(this.bindItem.bankCard) && (msg = '银行卡填写有误')) ||
                        (!validate.phoneNumber(this.bindItem.phone) && (msg = '手机号写有误')) ||
                        (!validate.checkPwd(this.bindItem.password) && (msg = '密码格式不正确')) ||
                        (validate.isEmpty(this.bindItem.name) && (msg = '姓名不能为空')) ||
                        (!validate.comparePwd(this.bindItem.password, this.bindItem.passwordAgain) && (msg = '两次密码不一致'))
                );
                if (!validate.isEmpty(msg)) {
                    alert(msg);
                } else {
                    this.step = 'two';
                    this.phoneMr = this.bindItem.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
                    this.getPhoneCode();
                }
            },
            checkBankType: function() {
                if (!validate.bankCard(this.bindItem.bankCard)) {
                    alert('银行卡校验失败，请重新输入');
                    return;
                }
                this.$http.post('/pay/dahua/dahuaBankBinServlet.htm', {bank_card: this.bindItem.bankCard}).then(function(response) {
                    var data = response.body
                    //todo
                    this.bindItem.bankName = '农业银行';
                    if (data.result === 'success') {
                        this.bindItem.bankName = data.bankName;
                        this.bank_serial = data.bankCode;
                    } else {
                        alert(data.message || '银行卡校验失败,请检查银行卡号是否正确');
//                        this.bindItem.bankName = '';
                    }
                });
            },
            getPhoneCode: function() {
                this.sendCodeParam = this.genSendCodeData();
                this.$refs.sendCode.getPhoneCode();

            },
            openAccount: function() {
                var opData = {
                    signMD5: this.genSendCodeData(true),
                    verifyCode: this.phoneCode
                };
                this.$http.post(this.postUrl, opData).then(function(response) {
                    console.log(response.body)
                    var data = response.body
                    if (data.status === 'success') {
                        //todo success
                    } else {
                        alert('升级error')
                    }
                });
            },
            genSendCodeData: function(genMD5) {
                getRsaParam(function() {
                    var codeData = {
                                type: 'new',
                                tradePassword_en: RSAUtils.encryptedString(this.rsaKey, this.bindItem.password),
                                tradePasswordRe_en: RSAUtils.encryptedString(this.rsaKey, this.bindItem.passwordAgain),
                                bankCard_en: RSAUtils.encryptedString(this.rsaKey, this.bindItem.bankCard),
                                bankSerial: this.bank_serial,
                                mobile: this.bindItem.phone,
                                custName: this.bindItem.name,
                                certifId_en: RSAUtils.encryptedString(this.rsaKey, this.bindItem.pid)
                            },
                            _token = '',
                            i;

                    if (genMD5) {
                        for (i in codeData) {
                            if (codeData.hasOwnProperty(i)) {
                                _token += codeData[i];
                            }
                        }
                        return md5(_token);
                    }
                    return codeData;
                })
                
                function getRsaParam() {
                    if (this.rsaKey) {
                        //todo
                        this.rsaKey = RSAUtils.getKeyPair('1001', '', '3454');
                        callback();
                        return;
//                    this.$http.post('').then(function(response) {
//                        var data = response.body
//                        if (data.status === 'success') {
//                            this.rsaKey = RSAUtils.getKeyPair(data.exponent, '', data.modulus);
//                            callback();
//                        } else {
//                            alert('error')
//                            return;
//                        }
//                    },function() {
//                        alert('net error')
//                    });
                    } else {
                        callback();
                        return;
                    }
                }

            },
            getRsaParam: function(callback) {
                if (validate.isEmpty(this.rsaKey)) {
                    //todo
                    this.rsaKey = RSAUtils.getKeyPair('1001', '', '3454');
                    callback();
                    return;
//                    this.$http.post('').then(function(response) {
//                        var data = response.body
//                        if (data.status === 'success') {
//                            this.rsaKey = RSAUtils.getKeyPair(data.exponent, '', data.modulus);
//                            callback();
//                        } else {
//                            alert('error')
//                            return;
//                        }
//                    },function() {
//                        alert('net error')
//                    });
                } else {
                    callback();
                    return;
                }
            },
            doaaa:function() {
//                this.genSendCodeData();
                this.getRsaParam(function() {
                    alert('ddddd')
                });
            }
        },
        components: {
            sendCodeBtn
        }
    }
</script>
