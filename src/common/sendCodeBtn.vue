<template>
    <div>
        <botton class="form_box--code_btn" rel="获取验证码" @click="getPhoneCode()" type="button">
            {{phoneCodeText}}
        </botton>
    </div>
</template>
<script>

    export default{
        data(){
            return {
                leaveTime:60,
                phoneCodeText:'获取验证码'
            }
        },
        props: {
            url: String,
            param:Object
        },
        methods: {
            getPhoneCode: function() {
                if (this.leaveTime === 60) {
                    this.$http.post(this.url, this.param).then(function(response) {
                        console.log(response.body)
                        if (1 == 1) {
                            clearInterval(this.codeInteval);
                            this.codeInteval = setInterval(function() {
                                if (this.leaveTime > 0) {
                                    this.phoneCodeText = this.leaveTime + 's';
                                    this.leaveTime--;
                                } else {
                                    clearInterval(this.codeInteval);
                                    countDown = 60;
                                    this.phoneCodeText = '获取验证码';
                                }
                            }, 1000);
                        } else {
                            alert('发送失败')
                        }
                    });
                }
            }
        }
    }
</script>
