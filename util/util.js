(function(window,document,undefined){
    var SCP = {
        getInstance:function(){
            return plugin.prototype.constructor(arguments);
        }

    };

    var Util = {
        plugin:["map","list"],

        Expr :{
            find:{
                'ID'    : document.getElementById,
                'CLASS' : document.getElementsByClassName,
                'TAG'   : document.getElementsByTagName
            },
            relative:{
                ">": { dir: "parentNode", first: true },
                " ": { dir: "parentNode" },
                "+": { dir: "previousSibling", first: true },
                "~": { dir: "previousSibling" }
            },
            filter:{
                "whitespace":"[\x20\t\r\n\f]"//空白符正则
            }

        },

        Scope:{
            0:document,
            1:window
        },

        ErrorMsg:{
            0:"argument can not be null/blank.",
            1:"Please input correct plugin name.",
            2:"Please introduce the corresponding js file."
        }

    };

    function plugin(){

    }

    plugin.prototype = function(){
        plugin_name = undefined;
        instance = function(args){
            validateArgs(args);
            if(!plugin_name){
                throw new Error(Util.ErrorMsg[1]);
            }

            return callFunc();
        };

        validateArgs = function(args){
            if(args.length == 0){
                throw new Error(Util.ErrorMsg[1]);
            }

            var name = args[0].toLowerCase();

            if(Util.plugin.indexOf(name) == -1){
                throw new Error(Util.ErrorMsg[1]);
            }

            plugin_name = name;
        };

        callFunc = function(){
            try{
                var isIncludeFile = isLoadFile("scp."+plugin_name+".js");
                if(!isIncludeFile){
                    throw new Error(Util.ErrorMsg[2]);
                }

                var firstChar = plugin_name.substr(0,1);
                var otherChar = plugin_name.substr(1,plugin_name.length);
                firstChar = firstChar.toUpperCase();
                var funcName = firstChar+otherChar;

                return new Util.Scope[1].SCPUtil[funcName];
            }catch(e){
                throw new Error("SCPUtil Error:"+e.message);
            }
        };

        isLoadFile = function (name) {
            try{
                var js= /js$/i.test(name);
                var find = Util.Expr.find['TAG'];
                var es=find.call(Util.Scope[0],js?'script':'link');
                for(var i=0;i<es.length;i++)
                    if(es[i][js?'src':'href'].indexOf(name)!=-1) return true;
                return false;
            }catch(e){
                throw new Error("SCPUtil Error:"+e.message);
            }
        };


        return {

        }
    }();

    plugin.prototype.constructor = this.instance;

    Array.prototype.indexOf = function(e){
        for(var i=0,j; j=this[i]; i++){
            if(j==e){return i;}
        }
        return -1;
    };

    Array.prototype.lastIndexOf = function(e){
        for(var i=this.length-1,j; j=this[i]; i--){
            if(j==e){return i;}
        }
        return -1;
    };

    Object.preventExtensions(plugin);

    Util.Scope[1].SCPUtil = SCP;
    Util.Scope[1].SCPUtil.Scope = Util.Scope;
    Util.Scope[1].SCPUtil.Expr = Util.Expr;
})(window,document);
