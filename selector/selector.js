(function(window,document,undefined,Pizzle){
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
            },

            isPlainObject:function(obj){
                var key;
                if ( !obj || typeof obj !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
                    return false;
                }

                try {
                    if ( obj.constructor && !obj.hasOwnProperty("constructor") && obj.constructor.prototype.hasOwnProperty("isPrototypeOf")) {
                        return false;
                    }
                } catch ( e ) {
                    return false;
                }

                for ( key in obj ) {
                    return obj.hasOwnProperty(key);
                }
                //for ( key in obj ) {}
                return key === undefined || obj.hasOwnProperty(key);
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
            }
        };

        Normal.getNextOrPrevNode = function(cur,value){
            if(!this.context || this.context.length == 0){
                this.context = [];
                return this;
            }

            var flag = value ? true : false;

            var x = 0,results = [],contexts = this.context,len = contexts.length;
            for(;x<len;x++){
                var context = contexts[x];
                if(!context[0]) continue;

                context = context[0];
                if(!context || !context.context) continue;

                var ret = [];
                if(flag){
                    var groups = Pizzle(value);
                    ret = Selector.match()(groups,value);
                    if(ret.length === 0) continue;

                    var s = [];
                    for(var j = 0;j<ret.length;j++){
                        if(!ret[j][0].context) continue;
                        if(Normal.indexOf(ret,ret[j][0].context) == -1)
                            s.push(ret[j][0].context);
                    }

                    ret.length = 0;
                    ret = s;
                }

                var getNextPrevNode = function(elem){
                    var nextPrevNode = (cur === "next") ? elem.nextSibling : elem.previousSibling;
                    if(!nextPrevNode) return;

                    if(!nextPrevNode.nodeType || nextPrevNode.nodeType != 1) getNextPrevNode(nextPrevNode);

                    nextPrevNode.hasChildNodes()? function(){
                        var getChildNode = function (elem) {
                            var childNodes = elem.childNodes;
                            if(childNodes.length === 0) return;
                            var y = 0,cLen = childNodes.length;
                            for(;y < cLen; y++){
                                var cNode = childNodes[y];
                                if(cNode.hasChildNodes()){
                                    getChildNode(cNode);
                                }

                                if(cNode.nodeType && cNode.nodeType === 1){
                                    if(Normal.indexOf(ret,cNode)!= -1){
                                        if(Normal.indexOf(results,cNode.context) == -1 && cNode.nodeName != "#text" && cNode.nodeName != "BR") {
                                            results.push([{"context": cNode}]);
                                        }
                                    }
                                }
                            }
                        };

                        getChildNode(nextPrevNode);
                        getNextPrevNode(nextPrevNode);
                    }():function(){
                        if(nextPrevNode.nodeType && nextPrevNode.nodeType === 1){
                            flag === true ? function(){
                                Normal.indexOf(ret,nextPrevNode)!= -1 ? function(){
                                    if(Normal.indexOf(results,nextPrevNode.context) == -1 && nextPrevNode.nodeName != "#text" && nextPrevNode.nodeName != "BR") {
                                        results.push([{"context": nextPrevNode}]);
                                        getNextPrevNode(nextPrevNode);
                                    }
                                }(): getNextPrevNode(nextPrevNode);
                            }():function(){
                                if(Normal.indexOf(results,nextPrevNode.context) == -1 && nextPrevNode.nodeName != "#text" && nextPrevNode.nodeName != "BR") {
                                    results.push([{"context": nextPrevNode}]);
                                }
                            }();
                        }
                    }();
                };

                getNextPrevNode(context.context);
            }

            this.context = results;
            return this;
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

        Selector.fn = Selector.prototype = {

        };

        Selector.extend = Selector.fn.extend = function(){
            //target被扩展的对象,length参数的数量,deep是否深度操作
            var options,name,src,copy,copyIsArray,clone,target = arguments[0] || {},
                i = 1,length = arguments.length,deep = false;

            //target为第一个参数，如果第一个参数是Boolean类型的值，则把target赋值给deep
            //deep表示是否进行深层面的复制，当为true时，进行深度复制，否则只进行第一层扩展,然后把第二个参数赋值给target
            if(typeof target === "boolean"){
                deep = target;
                target = arguments[1] || {};
                i = 2;// 将i赋值为2，跳过前两个参数
            }

            // target既不是对象也不是函数则把target设置为空对象。
            if(typeof target !== "object" && typeof target !=="function"){
                target = {};
            }

            // 如果只有一个参数，则把对象赋值给target
            if(length === i){
                target = this;
                // i减1，指向被扩展对象
                --i;
            }

            // 开始遍历需要被扩展到target上的参数
            for(;i<length;i++){
                // 处理第i个被扩展的对象，即除去deep和target之外的对象
                if((options = arguments[i])!=null ){
                    // 遍历第i个对象的所有可遍历的属性
                    for(name in options){
                        src = target[name];// 根据被扩展对象的键获得目标对象相应值，并赋值给src
                        copy = options[name];// 得到被扩展对象的值
                        if ( target === copy ) continue;

                        // 当用户想要深度操作时，递归合并,copy是纯对象或者是数组
                        if ( deep && copy && ( Normal.isPlainObject(copy) || (copyIsArray = Normal.isArray(copy)) ) ) {
                            if ( copyIsArray ) {
                                copyIsArray = false;// 将copyIsArray重新设置为false，为下次遍历做准备。
                                clone = src && Normal.isArray(src) ? src : [];// 判断被扩展的对象中src是不是数组
                            }else{
                                clone = src && Normal.isPlainObject(src) ? src : {};//// 判断被扩展的对象中src是不是纯对象
                            }
                        }else if ( copy !== undefined ){// 如果不需要深度复制，则直接把copy（第i个被扩展对象中被遍历的那个键的值）
                            target[ name ] = copy;
                        }
                    }
                }
            }

            return target;// 原对象被改变，因此如果不想改变原对象，target可传入{}
        };

        Selector.fn.extend({
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

            each:function(callback,args){
                return hooks.each(this.context,callback,args);
            },
            next:function(value){
                return Normal.getNextOrPrevNode.call(this,"next",value);
            },

            prev:function(value){
                return Normal.getNextOrPrevNode.call(this,"prev",value);
            },

            find:function(value){
                if(!this.context || this.context.length == 0 || !value){
                    this.context = [];
                    return this;
                }

                var groups = Pizzle(value);
                var ret = Selector.match()(groups,value);

                if(ret.length === 0){
                    this.context = [];
                    return this;
                }

                var s = [];
                for(var x = 0;x < ret.length;x++){
                    if(!ret[x][0].context) continue;
                    if(Normal.indexOf(s,ret[x][0].context) == -1)
                        s.push(ret[x][0].context);
                }

                ret.length = 0;
                ret = s;

                if(ret.length === 0){
                    this.context = [];
                    return this;
                }

                var contexts = this.context,len = contexts.length,c = [];
                for(var y = 0;y < len;y++){
                    var context = contexts[y];
                    if(!context[0]) continue;
                    context = context[0];
                    if(!context || !context.context) continue;
                    if(Normal.indexOf(c,context.context) == -1)
                        c.push(context.context);
                }

                if(c.length === 0){
                    this.context = [];
                    return this;
                }

                var results = [],i = 0;
                for(;i<ret.length;i++){
                    var elemNode = ret[i];
                    var getParentNode = function(elem){
                        for(var x = 0;x<c.length;x++){
                            var node = c[x];
                            if(elem === node){
                                if(!Normal.isObjExsist(results,{"context":elemNode}))
                                    results.push([{"context": elemNode}]);
                            }
                        }

                        var _pNode = elem.parentNode;
                        if(!_pNode) return;
                        getParentNode(_pNode);
                    };

                    var pNode = elemNode.parentNode;
                    if(!pNode) continue;
                    getParentNode(pNode);
                }

                this.context = results;
                return this;
            },

            data:function(key,value){

            }
        });

        Selector.extend({
            init:function(selector){
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
            },
            
            select:function(){
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
                                                var sNode = pNode;
                                                seed[0][j].pNode = sNode ? sNode : null ;
                                                s.push(seed[0][j]);
                                                return;
                                            }
                                        }

                                        var _pNode = pNode.parentNode;
                                        if(!_pNode) return;

                                        var getParentNode  = function(elem){
                                            for(var x = 0;x<node.length;x++){
                                                if(node[x].context === elem){
                                                    seed[0][j].pNode = elem ? elem : null ;
                                                    s.push(seed[0][j]);
                                                    return;
                                                }
                                            }

                                            var _eNode = elem.parentNode;
                                            if(!_eNode) return;
                                            getParentNode(_eNode);
                                        };
                                        getParentNode(_pNode);

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
            },

            match:function(){
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
            },

            analysisGroup:function(){
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
            }
        });

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
})(window,document,undefined,Pizzle);

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
