<!doctype html>
<html>
<head>    
    <%@include file="/WEB-INF/pages/h5/common/meta.jsp"%>
    <title>用户充值</title>
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
                <label class="form_box--head">充值金额</label>
                <input class="form_box--input" type="text" placeholder="请输入充值金额" autocomplete="off" required/>
            </section>
            <section class="form_box--item">
                <label class="form_box--head" for="phoneInput">验证码</label>
                <input class="form_box--input form_box--code" id="phoneInput" name="phoneInput" type="tel" placeholder="请输入手机验证码" required/>
                <a class="form_box--code_btn" rel="获取验证码">获取验证码</a>
            </section>   
        	<span class="form_box-bottomTip left_position">充值手续费：免费</span>
        	<span class="form_box-bottomTip right_position">单笔限额50万，单日限额50万</span>
        </div>
        <input class="btn-primary" type="button" value="充值" disabled/>
	</div>
	<p class="bottom-tip">本服务由友金所提供功能支持</p>    
</body>
</html>