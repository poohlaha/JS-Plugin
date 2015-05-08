(function(window,document,undefined){
    "use strict";
    var scroll = {};

    //滚动条在Y轴上的滚动距离
    scroll.getScrollTop = function () {
        var bodyScrollTop = 0, documentScrollTop = 0;
        if(document.body){
            bodyScrollTop = document.body.scrollTop;//滚动条离页面最上方的距离
        }

        if(document.documentElement){
            documentScrollTop = document.documentElement.scrollTop;//滚动条离页面最上方的距离
        }

        return (bodyScrollTop - documentScrollTop > 0)? bodyScrollTop : documentScrollTop;
    }

    //文档的总高度
    scroll.getScrollHeight  = function(){
        var bodyScrollHeight = 0, documentScrollHeight = 0;
        if(document.body)
            bodyScrollHeight = document.body.scrollHeight;

        if(document.documentElement)
            documentScrollHeight = document.documentElement.scrollHeight;

        return (bodyScrollHeight - documentScrollHeight > 0) ? bodyScrollHeight : documentScrollHeight;
    }

    //浏览器视口的高度
    scroll.getWindowHeight = function(){
        var windowHeight = 0;
        if(document.compatMode == "CSS1Compat")//BackCompat(Quirks Mode) and CSS1Compat(Standards Mode)
            windowHeight = document.documentElement.clientHeight;
        else
            windowHeight = document.body.clientHeight;

        return windowHeight;
    }

    scroll.windowScroll = function(callback){
        if(scroll.getScrollTop() + scroll.getWindowHeight() == scroll.getScrollHeight()){
            if(callback && typeof (callback) === 'function')
                callback();
        }
    }

    scroll.addEvent = function(elem,type,fn,useCapture){
        if (elem.addEventListener) {
            if(useCapture == undefined)
                useCapture = false;
            elem.addEventListener(type, fn, useCapture);//DOM2.0
            return;
        }else if(elem.attachEvent){
            elem.attachEvent('on'+type, fn);
            return;
        }else{
            elem['on'+type] = fn;
            return;
        }
    }

    scroll.scrollEvent = function (callback) {
        if(!callback && typeof (callback) !== 'function'){
            callback = function(){return false;};
        }
        scroll.addEvent(window,'scroll',function(e){scroll.windowScroll(callback)});
        scroll.addEvent(document.body,'onscroll',function(e){scroll.windowScroll(callback)});
        scroll.addEvent(document.documentElement,'onscroll',function(e){scroll.windowScroll(callback)});
    }

    window.scrollEvent = scroll.scrollEvent;

})(window,document,undefined);

/*$(window).scroll(function(){
    var scrollTop = $(this).scrollTop();
    var scrollHeight = $(document).height();
    var windowHeight = $(this).height();
    if(scrollTop + windowHeight == scrollHeight){
        alert("you are in the bottom");
    }
});*/
