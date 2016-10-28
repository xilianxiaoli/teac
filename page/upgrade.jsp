<!doctype html>
<html>
<head>    
    <%@include file="/WEB-INF/pages/h5/common/meta.jsp"%>
    <title>用户升级</title>
    <link rel="stylesheet" type="text/css" href="/css/src/h5/upesn/upesn_public.css" />
</head>
<body>
	<div class="yy-container container">      
        <div class="form_box row">
            <section class="form_box--item form_box--bottom">
                <label class="form_box--head">真实姓名</label>
                <input class="form_box--input" type="text" autocomplete="off" required/>
            </section>
            <section class="form_box--item form_box--bottom">
                <label class="form_box--head">身份证号</label>
                <input class="form_box--input" placeholder="" required/>
            </section>  
            <section class="form_box--item form_box--bottom">
                <label class="form_box--head">银行卡号</label>
                <input class="form_box--input" placeholder="" required/>
            </section>
            <section class="form_box--item">
                <label class="form_box--head">开户银行</label>
                <input class="form_box--input" placeholder="" required/>
            </section>
            <section class="form_box--item form_box--bottom">
                <label class="form_box--head">手机号</label>
                <input class="form_box--input" placeholder="" required/>
            </section> 
            <section class="form_box--item">
                <label class="form_box--head">验证码</label>
                <input class="form_box--input" placeholder="" required/>
            </section> 
        </div>
        <input class="btn-primary" value="确定" disabled/>
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
	<p class="bottom-tip">本服务由友金所提供功能支持</p>    
</body>
</html>