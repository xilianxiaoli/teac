<!doctype html>
<html>
<head>    
    <%@include file="/WEB-INF/pages/h5/common/meta.jsp"%>
    <title>用户提现</title>
    <link rel="stylesheet" type="text/css" href="/css/src/h5/upesn/upesn_public.css" />
</head>
<body>
	<div class="yy-container container"> 
		<div class="container_head">
			<p class="container_head--title">账户余额（元）</p>
			<p class="container_head--detail">200.00</p>
		</div>     
        <div class="form_box row">
            <section class="form_box--item">
                <label class="form_box--head">提现金额</label>
                <input class="form_box--input" type="text" placeholder="请输入提现金额" autocomplete="off" required/>
            </section>
            <section class="form_box--item">
                <label class="form_box--head">支付密码</label>
                <input class="form_box--input" type="text" placeholder="请输入支付密码" autocomplete="off" required/>
            </section>
            <section class="form_box--item">
                <label class="form_box--head" for="phoneInput">验证码</label>
                <input class="form_box--input form_box--code" id="phoneInput" name="phoneInput" type="tel" placeholder="请输入验证码" required/>
                <a class="form_box--code_btn" rel="获取验证码">获取验证码</a>
            </section>   
        	<span class="form_box-bottomTip left_position">提现手续费：免费</span>
        </div>
        <input class="btn-primary" type="button" value="提现" disabled/>
	</div>
	<p class="bottom-tip">本服务由友金所提供功能支持</p>    
</body>
</html>