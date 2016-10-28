<style>
    
</style>
<template>
    <div class="yy-container container">
        <div class="form_box row">
            <section class="form_box--item form_box--bottom">
                <label class="form_box--head" for="accountName">手机号</label>
                <input class="form_box--input" id="accountName" name="accountName" type="text" placeholder="请输入您的手机号" autocomplete="off" required/>
            </section>
            <section class="form_box--item">
                <label class="form_box--head" for="phoneInput">验证码</label>
                <input class="form_box--input form_box--code" id="phoneInput" name="phoneInput" type="tel" placeholder="请输入验证码" required/>
                <a class="form_box--code_btn" rel="获取验证码">获取验证码</a>
            </section>
        </div>
        <input class="btn-primary" type="button" value="确定" disabled/>
        <!-- checkbox -->
        <section class="form_box--radio-regwrap">
            <div class="checkboxGroup">
                <input type="checkbox" value="1" id="checkboxGroupInput" class=""/>
                <label for="checkboxGroupInput" class="check-box"></label>
            </div>
            <label for="checkboxGroupInput">我已阅读并同意</label>
            <a href="/" id="checkbox" class="black" rel="友金所注册协议">《友金所注册协议》</a>
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
