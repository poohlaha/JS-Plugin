/**
 * Created by tlzhang on 2015/6/4.
 */
(function(window,document){
    window.jMap = {
        version:'1.0.0',
        author:'tlzhang'
    };

    var util = {
        scriptName:'index.js',
        jsFile:[
            
        ],
        jsTags:'',
        host:function(){
            var r = new RegExp("(^|(.*?\\/))(" + util.scriptName + ")(\\?|$)"),
                s = document.getElementsByTagName('script'),
                src, m, l = "";
            for(var i=0, len=s.length; i<len; i++) {
                src = s[i].getAttribute('src');
                if(src) {
                    var m = src.match(r);
                    if(m) {
                        l = m[1];
                        break;
                    }
                }
            }
            return l;
        }
    };

    (function(){
        for(var i = 0, len = util.jsFile.length; i < len; i++) {
            util.jsTags += "<script src='"+ util.host() + util.jsFile[i] +"'></script>"
        }
        document.write(util.jsTags);
    })();


})(window,document);
