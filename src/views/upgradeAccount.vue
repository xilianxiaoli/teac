<style>

</style>
<template>
    <div class="yy-container container">
        <div class="form_box row">
            <section class="form_box--item form_box--bottom">
                <label class="form_box--head">真实姓名</label>
                <input v-model="upgradeItem.name" class="form_box--input" type="text" readonly />
            </section>
            <section class="form_box--item form_box--bottom">
                <label class="form_box--head">身份证号</label>
                <input v-model="upgradeItem.pid" class="form_box--input"  readonly />
            </section>
            <section class="form_box--item form_box--bottom">
                <label class="form_box--head">银行卡号</label>
                <input v-model="upgradeItem.cardNo" class="form_box--input"  readonly />
            </section>
            <section class="form_box--item">
                <label class="form_box--head">开户银行</label>
                <input v-model="upgradeItem.bankName" class="form_box--input"  readonly />
            </section>
            <section class="form_box--item form_box--bottom">
                <label class="form_box--head">手机号</label>
                <input v-model="upgradeItem.phone" class="form_box--input" placeholder="" required/>
            </section>
            <section class="form_box--item">
                <label class="form_box--head">验证码</label>
                <input v-model="upgradeItem.phoneCode" class="form_box--input" placeholder="" required/>
            </section>
        </div>
        <input class="btn-primary" value="确定" disabled/>
        <!-- checkbox -->
        <!--<section class="form_box&#45;&#45;radio-regwrap">-->
            <!--<div class="checkboxGroup">-->
                <!--<input type="checkbox" value="1" id="checkboxGroupInput" class=""/>-->
                <!--<label for="checkboxGroupInput" class="check-box"></label>-->
            <!--</div>-->
            <!--<label for="checkboxGroupInput">我已阅读并同意</label>-->
            <!--<a href="/" id="checkbox" class="black" rel="友金所注册协议">《友金所注册协议》</a>-->
        <!--</section>-->
    </div>
</template>
<script>

    export default{
        data(){
            return {
                upgradeItem:{
                    name:'',
                    pid:'',
                    cardNo:'',
                    bankName:'',
                    phone:'',
                    phoneCode:''
                }
            }
        },
        methods: {
            sendPhoneCode:function () {
                var param = {
                    type:'send',
                    mobile:this.upgradeItem.phone
                }
                this.$http.post('/pay/dahua/v2/upgradeAccount.htm', param).then(function(response) {
                    var data = response.body;

                })
            },
            upgradeSubmit:function() {

            }
        }
    }
</script>
