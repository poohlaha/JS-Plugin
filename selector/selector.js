(function(window,document,undefined){
    function addEvent(elem,type,fn,useCapture){
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

    var Pizzle = (function(window){
        var Express = {};

        var Support = {};

        function init(){
            Express.expr = getExpr();
            Express.matchExpr = getMatchExpr();
            Support.isQSA = Express.expr['rnative'].test(document.querySelectorAll);
        }

        function getExpr(){
            var whitespace = "[\\x20\\t\\r\\n\\f]";//空白字符正则字符串
            var operators = "([*^$|!~]?=)";//可用的属性操作符
            var rcomma = "^" + whitespace + "*," + whitespace + "*";//并联选择器的正则
            var rcombinators = "^" + whitespace + "*([\\x20\\t\\r\\n\\f>+~])" + whitespace + "*";//关系选择器正则
            var characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+";//字符编码正则字符串
            var identifier = characterEncoding.replace( "w", "w#" );
            var attributes = "\\[" + whitespace + "*(" + characterEncoding + ")" + whitespace +
                "*(?:" + operators + whitespace + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + identifier + ")|)|)" + whitespace + "*\\]";//属性选择器正则
            var pseudos = ":(" + characterEncoding + ")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|" + attributes.replace( 3, 8 ) + ")*)|.*)\\)|)";//伪类正则字符串
            var rtrim = "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$"; // 去掉两端空白和字符串中的反斜杠（如果连续两个去掉一个）
            //var rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/;//仅仅单个id或tag、class选择器正则（用来快速解析并获取元素）
            var rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/;
            var rnative = /^[^{]+\{\s*\[native code/;//原生函数正则
            var expando = "pizzle" + 1 * new Date();

            return {
                rcomma:new RegExp(rcomma),
                rcombinators:new RegExp(rcombinators),
                characterEncoding:characterEncoding,
                attributes:attributes,
                pseudos:pseudos,
                rtrim:new RegExp(rtrim,"g"),
                rquickExpr:new RegExp(rquickExpr),
                rnative:rnative,
                expando:expando
            };
        }

        function getMatchExpr(){
            var idExpr = "^#(" + Express.expr['characterEncoding'] + ")";
            var classExpr = "^\\.(" + Express.expr['characterEncoding'] + ")";
            var tagExpr =  "^(" + Express.expr['characterEncoding'].replace( "w", "w*" ) + ")";
            var attrExpr = "^" + Express.expr['attributes'];
            var pseudosExpr = "^" + Express.expr['pseudos'];
            var childEpr = "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + Express.expr['whitespace'] +
                "*(even|odd|(([+-]|)(\\d*)n|)" + Express.expr['whitespace'] + "*(?:([+-]|)" + Express.expr['whitespace'] +
                "*(\\d+)|))" + Express.expr['whitespace'] + "*\\)|)";

            return {
                "ID":new RegExp(idExpr),
                "CLASS":new RegExp(classExpr),
                "TAG":new RegExp(tagExpr),
                "ATTR":new RegExp(attrExpr),
                "PSEUDO":new RegExp(pseudosExpr),
                "CHILD":new RegExp(childEpr, "i" )
            };
        }


        function Pizzle(selector){
            if(!selector)
                return;

            init();
            return Pizzle.participle(selector);
        }

        /**
         * participle selector
         * @param selector
         */
        Pizzle.participle = function(selector){
            var match,matched,tokens = [],groups = [];

            //Handle HTML strings
            if(typeof selector === "string"){
                if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
                    // Assume that strings that start and end with <> are HTML and skip the regex check
                    var m = selector.substring(1,selector.length - 1);
                    match = [ null, null,m, null ];
                } else {
                    match = Express.expr.rquickExpr.exec(selector);
                }
            }

            if(match){
                matched = match[1] || match[2] || match[3] ||'';
                var type = (matched == match[1]) ? "ID" : ((matched == match[2]) ? "TAG" : (matched == match[3]) ? "CLASS" : "");
                var sep = undefined,newMatched = undefined,oldMatched = match[0];
                if(oldMatched.charAt(0) === "#" || oldMatched.charAt(0) === "." || oldMatched.charAt(0) === ":"){
                    sep = oldMatched.charAt(0);
                    newMatched = oldMatched.substring(1,oldMatched.length);
                }

                tokens.push({
                    value: newMatched ? newMatched : matched,
                    type: type,
                    sep: sep ? sep : "",
                    matches: selector
                });

                groups.push(tokens);
                return groups;
            }else{
                return Pizzle.tokenize(selector);
            }
        };

        /**
         * participle many selectors
         * @param selector
         * @returns {Array}
         */
        Pizzle.tokenize = function(selector){
            var matched,match,tokens,type,str = selector,groups = [];
            while(str){
                //,
                if(!matched || (match = Express.expr.rcomma.exec(str))){
                    if(match){
                        str = str.slice(match[0].length) || str;
                    }
                    groups.push(tokens = []);
                }

                matched = false;
                //+-~
                if((match = Express.expr.rcombinators.exec(str))!=null){
                    matched = match.shift();
                    tokens.push({
                        value:matched,
                        type:match[0].replace(Express.expr.rtrim," ")
                    });

                    str = str.slice(matched.length);
                }

                for(type in Express.matchExpr){
                    if((match = Express.matchExpr[ type ].exec( str ))!=null){
                        matched = match.shift();
                        var sep = undefined,newMatched = undefined;
                        if(matched.charAt(0) === "#" || matched.charAt(0) === "." || matched.charAt(0) === ":"){
                            sep = matched.charAt(0);
                            newMatched = matched.substring(1,matched.length);
                        }
                        tokens.push({
                            value: newMatched ? newMatched : matched,
                            type: type,
                            sep: sep ? sep : "",
                            matches: match
                        });

                        str = str.slice(matched.length);
                    }
                }

                if ( !matched ) {
                    break;
                }
            }

            return groups;
        };


        Pizzle.error = function(message){
            throw new Error( "Syntax error, unrecognized expression: " + message );
        };

        Pizzle.isXml = function(elem){
            var documentElement = elem && (elem.ownerDocument || elem).documentElement;
            return documentElement ? documentElement.nodeName !== "HTML" : false;
        };

        function assert(fn){
            var div = document.createElement("div");
            try{
                return !!fn(div);
            }catch(e){
                return false;
            }finally{
                if(div.parentNode){
                    div.parentNode.removeChild( div );
                }

                div = null;
            }
        }

        return Pizzle;
    })(window);


    var Selector = (function(Pizzle){

        /*function ready(callback){
            addEvent(window,'load',function(){
                callback();
            });
        }*/

        var hooks = {
            val : function(){
                if(this.context.length == 0)
                    return "";
                if(!this.groups || this.groups.length == 0)
                    return "";
                var result = analysisGroup(true)(this.groups);

                if(result.length == 0 || !result[0][0].context){
                    return "";
                }

                var elem = result[0][0].context;
                var ret = elem.value;
                return ret ? ((typeof ret === "string") ? ret : "") : "";
            }
        };

        function analysisGroup(parseOnly){
            return function(groups){
                var results = [];
                var i = 0,len = groups.length;
                for(;i<len;i++){
                    var obj = groups[i];
                    if(!obj || !obj[0])  break;

                    var _obj = obj[0];
                    var type = _obj.type;
                    var value = _obj.value;

                    var object = filter[type](value)() || [];

                    if(object.length == 0)
                        continue;

                    results.push(object);

                    if(parseOnly){
                        break;
                    }
                }

                return results;
            };
        }

        function Selector(selector){
            return (typeof selector === "function" ) ? Selector.ready(selector) : Selector.init.call(this,selector);
        }

        Selector.ready = function(callback){
            document.onreadystatechange = function(){
                if(document.readyState == "complete"){
                    callback();
                }
            }
        };

        Selector.init = function(selector){
            var groups = Pizzle(selector);
            this.groups = groups;
            this.context = [];

            if(!this.groups || this.groups.length == 0)
                return this;

            var result = analysisGroup()(this.groups);

            if(result.length == 0){
                return this;
            }

            this.context = result;
            return this;

        };

        Selector.prototype.val = hooks.val;

        var filter = {
            "ID":function(id){
                return function(elem){
                    elem = elem ? elem :((typeof document.getElementById(id) !== "undefined")?document.getElementById(id) : document.getAttributeNode(id));
                    if(elem){
                        var isAttr = (elem.getAttribute("id") === id) ? true : false;
                        if(isAttr){
                            return [{context:elem,type:"ID",value:id}];
                        }else{
                            return [];
                        }
                    }
                }
            },

            "CLASS":function(className){
                var pattern;
                return (pattern = new RegExp( "(^|" + Express.expr['whitespace'] + ")" + className + "(" + Express.expr['whitespace'] + "|$)" ))
                    && function(elem){
                        return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "" );
                    }
            },

            "TAG":function(nodeNameSelector){
                var nodeName = nodeNameSelector.toLowerCase();
                return nodeNameSelector === "*" ? function(){return true;} :function(elem){
                    return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
                }
            },

            "ATTR":function(name, operator, check){

            },

            "CHILD":function(type, what, argument, first, last){

            }
        };

        return Selector;
    })(Pizzle);

    function getSelector(selector){
        return new Selector(selector);
    }

    window._ = window.$ = getSelector;
    window.Selector = getSelector;
})(window,document,undefined);

/**
    节点类型	                      描述	                                                   子节点
1	Element	                      代表元素	                                                Element, Text, Comment, ProcessingInstruction, CDATASection, EntityReference
2	Attr	                      代表属性	                                                Text, EntityReference
3	Text	                      代表元素或属性中的文本内容。	                                None
4	CDATASection	              代表文档中的 CDATA 部分（不会由解析器解析的文本）。	            None
5	EntityReference	              代表实体引用。	                                            Element, ProcessingInstruction, Comment, Text, CDATASection, EntityReference
6	Entity	                      代表实体。	                                                Element, ProcessingInstruction, Comment, Text, CDATASection, EntityReference
7	ProcessingInstruction	      代表处理指令。	                                            None
8	Comment	                      代表注释。	                                                None
9	Document	                  代表整个文档（DOM 树的根节点）。	                            Element, ProcessingInstruction, Comment, DocumentType
10	DocumentType	              向为文档定义的实体提供接口	                                None
11	DocumentFragment	          代表轻量级的 Document 对象，能够容纳文档的某个部分	            Element, ProcessingInstruction, Comment, Text, CDATASection, EntityReference
12	Notation	                  代表 DTD 中声明的符号。	                                    None;
 **/
