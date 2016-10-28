<style>
    
</style>
<template>
    <div class="yy-container container">
        <div class="form_box row">
            <section class="form_box--item">
                <label class="form_box--head" for="accountName">账号</label>
                <input class="form_box--input" id="accountName" name="accountName" type="text" placeholder="请输入您的友金所账号" autocomplete="off" required>
            </section>
            <section class="form_box--item">
                <label class="form_box--head" for="password">密码</label>
                <input class="form_box--input form_box--code" id="password" name="password" type="password" placeholder="请输入登录密码" autocomplete="off" required/>
                <span class="btn_password"></span>
            </section>
            <section class="form_box--item">
                <label class="form_box--head" for="verifyCode">验证码</label>
                <input class="form_box--input form_box--code" id="verifyCode" name="verifyCode" type="tel" placeholder="请输入验证码" maxlength="6" required/>
                <span class="form_box--aright">
                    <img class="form_box--verifycode" title="图片验证码" id="verify-img" src="" width="80" height="30">
                </span>
            </section>
        </div>
        <input class="btn-primary" type="button" value="确定" disabled/>
        <section class="form_box--radio-logwrap">
            <label style="float: right"><a href="/" rel="注册">注册</a></label>
            <label style="float: left"><a href="/" rel="找回密码">找回密码</a></label>
        </section>
    </div>

</template>
<script>

    export default{
        data(){
            return{
                msg:'hello vue'
            }
        }
    }
</script>
