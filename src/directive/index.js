/**
 * Created by lizc on 2016/10/4.
 */
module.exports = {
    vue : undefined,
    init:function(v){
        this.vue = v;
        this.vue.directive('myDirective',{
            bind: function () {
                console.log('myDirective bind')
            },
            update: function (value) {
                this.el.innerHTML =
                    'directive name - '       + this.name + '<br>' +
                    'directive expression - ' + this.expression + '<br>' +
                    'directive argument - '   + this.arg + '<br>' +
                    'directive modifiers - '  + JSON.stringify(this.modifiers) + '<br>' +
                    'directive value - '      + value
            }
        })
    }
};
