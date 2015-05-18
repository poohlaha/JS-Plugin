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

    var Pizzle = (function(window){
        var Express = {};

        var Support = {};

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

            return Pizzle.participle(selector);
        }

        Pizzle.init = function(){
            Express.expr = getExpr();
            Express.matchExpr = getMatchExpr();
            Support.isQSA = Express.expr['rnative'].test(document.querySelectorAll);
        };

        /**
         * participle selector
         * @param selector
         */
        Pizzle.participle = function(selector){
            if(typeof selector !== "string"){
                return [];
            }

            Pizzle.init();
            var match,matched,tokens = [],groups = [];

            //Handle HTML strings
            if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
                // Assume that strings that start and end with <> are HTML and skip the regex check
                var m = selector.substring(1,selector.length - 1);
                match = [ m, null,m, null ];
            } else {
                match = Express.expr.rquickExpr.exec(selector);
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
                        value:matched == " " ? matched : matched.trim(),
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

        return Pizzle;
    })(window);


    var Selector = (function(Pizzle){

        var Normal = {
            isArray : function(obj){
                if(!obj.length)
                    return false;

                var length = "length" in obj && obj.length;

                if(typeof obj === "function"){
                    return false;
                }

                if(obj.nodeType === 1 && length)
                    return true;

                return typeof obj === "array" || length === 0 ||
                    typeof length === "number" && length > 0 && (length - 1) in obj;

            },

            isNative:function(fn){
                return Expr.rnative.test(fn + "");
            },

            indexOf : function(arr,elem){
                if(!Normal.isArray(arr))
                    return -1;

                var i = 0,len = arr.length;
                for(;i<len;i++){
                    if(arr[i] === elem){
                        return i;
                    }
                }
                return -1;
            },

            isObjExsist : function(arr,elem){
                if(arr.length === 0){
                    return false;
                }

                for(var i = 0;i<arr.length;i++){
                    var obj = arr[i][0].context;
                    if(obj === elem.context){
                        return true;
                    }
                }

                return false;
            }


        };

        var Expr = {
            whitespace : "[\\x20\\t\\r\\n\\f]",//空白字符正则字符串
            rnative : /^[^{]+\{\s*\[native code/,//原生函数正则
            rsibling : /[\x20\t\r\n\f]*[+~]/, //弟兄正则
            needsContext:function(){//开始为>+~或位置伪类，如果选择器中有位置伪类解析从左往右
                return new RegExp( "^" + Expr.whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
                Expr.whitespace + "*((?:-\\d)?\\d*)" + Expr.whitespace + "*\\)|)(?=[^-]|$)", "i" );
            },
            relative:{
                ">": { dir: "parentNode", first: true },
                " ": { dir: "parentNode" },
                "+": { dir: "previousSibling", first: true },
                "~": { dir: "previousSibling" }
            }
        };

        var Support = {
            getElementsByClassName : Normal.isNative(document.getElementsByClassName),
            isQSA : Normal.isNative(document.querySelectorAll)
        };

        var hooks = {
            val : function(value){

                if(!this.context || this.context.length == 0){
                    if(value != undefined ) return ;
                    else return "";
                }

                var elem = this.context;
                elem = (elem.type && elem.nodeType === 1)? elem : function(){
                    if(Normal.isArray(elem)){
                        var results = [];
                        for(var i = 0;i<elem.length;i++){
                            var obj = elem[i];
                            if(!obj[0] || !obj[0].context) continue;
                            var type = obj[0].type;
                            if(type in Expr.relative) continue;

                            if(Normal.indexOf(results,obj[0].context) == -1){
                                results.push(obj[0].context);
                            }
                        }

                        return results;
                    }else{
                        return elem[0] ? ( elem[0].context ? (elem[0].context) : null ) : null;
                    }

                }();

                if(!elem || elem.length === 0){
                    if(value != undefined ) return ;
                    else return "";
                }

                if(value!= undefined){
                    (Normal.isArray(elem) === true)?function(){
                        for(var j =0;j<elem.length;j++){
                            var obj = elem[j];
                            (typeof value == "string" && value.constructor== String) ? obj.value = value : ( Normal.isArray(value) === true ? function(){
                                var str = "";
                                for(var x = 0;x<value.length;x++){
                                    if(value[x]){
                                        (x != value.length - 1) ? str = str + value[x] + ",":str = str + value[x];
                                    }
                                }
                                obj.value = str;
                            }(): obj.value = value);
                        }
                    }():elem.value = value;
                }else{
                    var ret = (Normal.isArray(elem) === true)?function(){
                        for(var j =0;j<elem.length;j++){
                            var obj = elem[j];
                            ret = obj.value;
                            if(ret != undefined) return ret;
                        }
                    }():elem.value;

                    return ret ? ((typeof ret === "string") ? ret : "") : "";
                }

            },

            each:function(obj,callback,args){
                var value,i = 0,length = obj.length;
                var isArray = Normal.isArray(obj);
                if(args){
                    if(isArray){
                        for(;i < length ; i++){
                            value = callback.apply(obj[i][0],args);
                            if(value === false)  break;
                        }
                    }else{
                        for(i in obj){
                            value = callback.apply(obj[i][0],args);
                            if(value === false)  break;
                        }
                    }
                }else{
                    if(isArray){
                        for(;i<length;i++){
                            value = callback.call(obj[i][0], i, obj[i][0].context);
                            if (value === false)  break;
                        }
                    }else{
                        for(i in obj){
                            value = callback.call(obj[i][0], i, obj[i][0].context);
                            if (value === false)  break;
                        }
                    }
                }

                return obj;
            },

            next:function(value){
                if(!this.context || this.context.length == 0){
                    this.context = null;
                    return this;
                }

                var flag = value ? true : false;

                var x = 0,results = [],contexts = this.context,len = contexts.length;
                for(;x<len;x++){
                    var context = contexts[x];
                    if(!context[0]) continue;

                    context = context[0];
                    if(!context || !context.context) continue;

                    if(flag){
                        var groups = Pizzle(value);
                        if(!groups || groups.length === 0){
                            this.context = null;
                            return this;
                        }

                        var i = 0,length = groups.length,ret = [];
                        for(;i<length;i++){
                            var token = groups[i][0];
                            if(!token || !token.type || !token.value) continue;

                            var node = filter[token.type](token.value)();
                            if(!node) continue;

                            if(Normal.isArray(node)){
                                if(node.length === 0){
                                    continue;
                                }

                                for(var j = 0;j<node.length;j++){
                                    if(!node[j].context) continue;
                                    if(Normal.indexOf(ret,node[j].context) == -1)
                                        ret.push(node[j].context);
                                }
                            }else{
                                if(!node.context) continue;
                                if(Normal.indexOf(ret,node.context) == -1)
                                    ret.push(node.context);
                            }
                        }

                        if(ret.length === 0) continue;
                    }

                    var getNextNode = function(elem){
                        var nextNode = elem.nextSibling;
                        if(!nextNode){
                            return;
                        }

                        if(nextNode.nodeType && nextNode.nodeType === 1){
                            if(flag){
                                if(Normal.indexOf(ret,nextNode)!= -1){
                                    if(Normal.indexOf(results,nextNode.context) == -1) {
                                        results.push([{"context": nextNode}]);
                                        getNextNode(nextNode);
                                    }
                                }else{
                                    getNextNode(nextNode);
                                }
                            }else{
                                if(Normal.indexOf(results,nextNode.context) == -1) {
                                    results.push([{"context": nextNode}]);
                                }
                            }
                        }else{
                            getNextNode(nextNode);
                        }
                    };

                    getNextNode(context.context);

                   /* var getNextNode = function(elem){
                        var nextNode = elem.nextSibling;
                        if(value){
                            //filter[type](token.value)();
                            if(nextNode.nodeType && nextNode.nodeType === 1 ){
                                if(Normal.indexOf(results,nextNode.context) == -1) {
                                    results.push([{"context": nextNode}]);
                                }
                            }else{
                                getNextNode(nextNode);
                            }
                        }else{
                            if(nextNode.nodeType && nextNode.nodeType === 1){
                                if(Normal.indexOf(results,nextNode.context) == -1) {
                                    results.push([{"context": nextNode}]);
                                }
                            }else{
                                getNextNode(nextNode);
                            }
                        }

                    };

                    getNextNode(context.context);*/
                }

                this.context = results;
                return this;
            }
        };


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
            if(typeof selector === "string"){
                selector = selector.trim();
                if(!Support.isQSA){
                    var contexts = document.querySelectorAll(selector);
                    var len = contexts.length,i = 0;
                    var results = [];
                    if(!len || len == 0){
                        this.context = results;
                        return this;
                    }

                    for(; i < len; i++){
                        results.push([{
                            context:contexts[i]?contexts[i]:"",
                            type:"NODE"
                        }]);
                    }

                    this.context = results;
                }else{
                    groups = Pizzle(selector);
                    this.groups = groups;
                    if(!this.groups || this.groups.length == 0)
                        return this;

                    this.context = Selector.match()(this.groups,selector);
                }
                console.log(this);
                return this;
            }else if(selector.context && selector.context.nodeType && selector.context.nodeType === 1){//elem
                var groups = [];
                groups.push([{
                    sep:selector.sep?selector.sep:"",
                    type:selector.type?selector.type:"",
                    value:selector.value?selector.value:""
                }]);
                this.groups = groups;
                this.context = selector.context;
                return this;
            }

        };

        Selector.prototype.val = hooks.val;
        Selector.prototype.each = function(callback,args){
            return hooks.each(this.context,callback,args);
        };

        Selector.prototype.next = hooks.next;

        Selector.select = function(){
            return function(selector,tokens){
                if(tokens.length == 0){
                    return [];
                }

                var i,token,type,seed = [],flag="",pt="",value;
                i = Expr.needsContext().test( selector ) ? 0 : tokens.length;
                var count = 0;
                while(i--){
                    token = tokens[i];
                    type = token.type;
                    value = token.value;
                    if((!seed[0] || seed[0].length == 0) && count != 0){
                        count++;
                        continue;
                    }

                    if(type in filter){
                        var node = filter[type](token.value)();

                        if(flag === "parentNode" || flag === "previousSibling" ){
                            var s = [];
                            for(var j = 0;j<seed[0].length;j++){
                                var node_context = seed[0][j].context;
                                var pNode;

                                if(flag === "parentNode"){
                                    if(pt in Expr.relative){
                                        pNode = seed[0][j].pNode?seed[0][j].pNode.parentNode:node_context.parentNode;
                                    }else{
                                        pNode = seed[0][j].pNode;
                                    }

                                }else{
                                    pNode = node_context.previousSibling;
                                }

                                if(!pNode)
                                    continue;

                                flag === "parentNode" ? function(){
                                    for(var t = 0;t < node.length;t++){
                                        if(node[t].context === pNode){
                                            var sNode = null;
                                            sNode = pNode;
                                            seed[0][j].pNode = sNode ? sNode : null ;
                                            s.push(seed[0][j]);
                                            return;
                                        }
                                    }
                                }():function(){
                                    var getNode = function(elem){
                                        for(var t = 0;t < node.length;t++){
                                            if(node[t].context === elem){
                                                s.push(seed[0][j]);
                                                return;
                                            }
                                        }

                                        var nNode = elem.previousSibling;
                                        if(!nNode)
                                            return;

                                        return getNode(nNode);
                                    };

                                    getNode(pNode);
                                }();
                            }

                            seed.length = 0;
                            seed.push(s);
                            pt = type;
                        }else{
                            if(count === 0){
                                seed.push(node);
                                count++;
                                continue;
                            }

                            var s = []
                            for(var j = 0;j<seed[0].length;j++){
                                var node_context = seed[0][j].context;
                                if(node_context.nodeName === (value).toUpperCase()){
                                    s.push(seed[0][j]);
                                }
                            }

                            seed.length = 0;
                            seed.push(s);
                        }

                    }else if(type in Expr.relative){//关系符号
                        flag = Expr.relative[type].dir;
                        pt = type;
                    }

                    count++;
                }

                return seed;
            }
        };

        Selector.match = function(){
            return function(tokens,selector){
                var results = [];
                for(var i =0;i<tokens.length;i++){
                    var seed = Selector.select()(selector,tokens[i]);
                    if(seed.length > 0)
                        results.push(seed);
                }

                if(results.length != 0 )
                    results = Selector.analysisGroup()(results);

                return results;
            };

        };

        Selector.analysisGroup = function(){
            return function(groups){
                var results = [];
                var i = 0,len = groups.length;
                for(;i<len;i++){
                    var obj = groups[i][0];
                    if(obj.length == 0) continue;

                    if(!obj) continue;

                    for(var x =0;x<obj.length;x++){
                        var _obj = obj[x],type = _obj.type,value = _obj.value;

                        if(!value) continue;
                        if(type in Expr.relative) continue;

                        if(!Normal.isObjExsist(results,_obj)){
                            results.push([_obj]);
                        }
                    }
                }

                return results;
            }
        };

        var filter = {
            "ID":function(id){
                return function(elem){
                    elem = elem ? elem :((typeof document.getElementById(id) !== "undefined")?document.getElementById(id) : document.getAttributeNode(id));
                    var results = [];
                    if(!elem)
                        return results;

                    var isAttr = (elem.getAttribute("id") === id) ? true : false;
                    if(!isAttr)
                        return results;

                    results.push({
                        context:elem,
                        type:"ID",
                        value:id,
                        sep:"#"
                    });

                    return results;
                }
            },

            "CLASS":function(className){
                return function(elem){
                    if(Support.getElementsByClassName){
                        elem = elem ? elem : document;
                        var contexts = elem.getElementsByClassName(className);
                        var len = contexts.length,i = 0;
                        var results = [];
                        if(!contexts.length)
                            return results;

                        for(; i < len; i++){
                            results.push({
                                context:contexts[i]?contexts[i]:"",
                                type:"CLASS",
                                sep:".",
                                value:className
                            });
                        }

                        return results;
                    }else{
                        return [];
                    }
                }
            },

            "TAG":function(tagName){
                return function(elem){
                    elem = elem ? elem : document;
                    var _elem,tmp = [],i = 0;
                    var results = elem.getElementsByTagName(tagName);
                    if(tagName === "*"){
                        while ((_elem = results[i++])){
                            if(_elem.nodeType === 1){
                                tmp.push({
                                    context:_elem?_elem:"",
                                    type:"TAG",
                                    sep:"",
                                    value:tagName
                                });
                            }
                        }

                        return tmp;
                    }

                    if(results.length == 0)
                        return tmp;

                    for(;i<results.length;i++){
                        tmp.push({
                            context:results[i]?results[i]:"",
                            type:"TAG",
                            sep:"",
                            value:tagName
                        });
                    }

                    return tmp;
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
