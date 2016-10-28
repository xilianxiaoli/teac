<!doctype html>
<html>
<head>    
    <%@include file="/WEB-INF/pages/h5/common/meta.jsp"%>
    <title>用户开户</title>
    <link rel="stylesheet" type="text/css" href="/css/src/h5/upesn/upesn_public.css" />
</head>
<body>
	<div class="yy-container container openAccount-step1">      
        <div class="form_box row">
            <section class="form_box--item form_box--bottom">
                <label class="form_box--head">真实姓名</label>
                <input class="form_box--input" placeholder="请输入姓名" type="text" autocomplete="off" required/>
            </section>
            <section class="form_box--item form_box--bottom">
                <label class="form_box--head">身份证号</label>
                <input class="form_box--input" placeholder="请输入本人身份证号码" required/>
            </section>  
            <section class="form_box--item form_box--bottom">
                <label class="form_box--head">银行卡号</label>
                <input class="form_box--input" placeholder="请输入本人名下的卡，勿使用信用卡" required/>
            </section>
            <section class="form_box--item">
                <label class="form_box--head">开户银行</label>
                <input class="form_box--input" placeholder="请输入开户行" required/>
            </section>
            <section class="form_box--item form_box--bottom">
                <label class="form_box--head">支付密码</label>
                <input class="form_box--input" placeholder="请输入支付密码" required/>
            </section> 
            <section class="form_box--item form_box--bottom">
                <label class="form_box--head">确认密码</label>
                <input class="form_box--input" placeholder="请再次输入支付密码" required/>
            </section> 
            <section class="form_box--item">
                <label class="form_box--head">手机号</label>
                <input class="form_box--input" placeholder="请输入银行预留手机号" required/>
            </section> 
        </div>
        <input class="btn-primary" value="获取验证码" disabled/>
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
	
	<div class="yy-container container openAccount-step2">   
        <p class="top-tip">请输入您<span class="phone-number">186*****051</span>手机号收到的验证码</p>   
        <div class="form_box row">
            <section class="form_box--item">
                <label class="form_box--head" for="phoneInput">验证码</label>
                <input class="form_box--input form_box--code" id="phoneInput" name="phoneInput" type="tel" placeholder="请输入验证码" required/>
                <a class="form_box--code_btn" rel="获取验证码">获取验证码</a>
            </section> 
        </div>
        <input class="btn-primary" type="button" value="确定" disabled/>
	</div>
	<p class="bottom-tip">本服务由友金所提供功能支持</p>    
</body>
</html>