(function(window,document,undefined,Pizzle){
    var Selector = (function(Pizzle){
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
                        if ( deep && copy && ( Selector.isPlainObject(copy) || (copyIsArray = Selector.isArray(copy)) ) ) {
                            if ( copyIsArray ) {
                                copyIsArray = false;// 将copyIsArray重新设置为false，为下次遍历做准备。
                                clone = src && Selector.isArray(src) ? src : [];// 判断被扩展的对象中src是不是数组
                            }else{
                                clone = src && Selector.isPlainObject(src) ? src : {};//// 判断被扩展的对象中src是不是纯对象
                            }
                        }else if ( copy !== undefined ){// 如果不需要深度复制，则直接把copy（第i个被扩展对象中被遍历的那个键的值）
                            target[ name ] = copy;
                        }
                    }
                }
            }

            return target;// 原对象被改变，因此如果不想改变原对象，target可传入{}
        };

        Selector.extend({
            cache:{},
            Expr :{
                whitespace : "[\\x20\\t\\r\\n\\f]",//空白字符正则字符串
                rnative : /^[^{]+\{\s*\[native code/,//原生函数正则
                rsibling : /[\x20\t\r\n\f]*[+~]/, //弟兄正则
                needsContext:function(){//开始为>+~或位置伪类，如果选择器中有位置伪类解析从左往右
                    return new RegExp( "^" + Selector.Expr.whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
                    Selector.Expr.whitespace + "*((?:-\\d)?\\d*)" + Selector.Expr.whitespace + "*\\)|)(?=[^-]|$)", "i" );
                },
                relative:{
                    ">": { dir: "parentNode", first: true },
                    " ": { dir: "parentNode" },
                    "+": { dir: "previousSibling", first: true },
                    "~": { dir: "previousSibling" }
                },
                rbrace:/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
                rvalidtokens:/(,)|(\[|{)|(}|])|"(?:[^"\\\r\n]|\\["\\\/bfnrt]|\\u[\da-fA-F]{4})*"\s*:?|true|false|null|-?(?!0\d)\d+(?:\.\d+|)(?:[eE][+-]?\d+|)/g,
                rtrim:function(){
                    return new RegExp( "^" + Selector.Expr.whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + Selector.Expr.whitespace + "+$", "g" );
                },
                childEpr : function(){
                    return new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + Selector.Expr.whitespace +
                    "*(even|odd|(([+-]|)(\\d*)n|)" + Selector.Expr.whitespace + "*(?:([+-]|)" + Selector.Expr.whitespace +
                    "*(\\d+)|))" + Selector.Expr.whitespace + "*\\)|)","i");
                }
            },

            filter:{
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

                },

                "PSEUDO":function(){
                    return function(elem,pToken,token){
                        if(!elem || !token || !pToken) return undefined;
                        var match = token.value;
                        var nodes = [];
                        var getNodes = function(result){
                            if(result){
                                var flag = false;
                                for(var i = 0;i<nodes.length;i++){
                                    var node = nodes[i];
                                    if(node.context === result){
                                        flag = true;
                                        break;
                                    }
                                }
                                if(!flag){
                                    nodes.push({
                                        context:result?result:"",
                                        type:"NODE"
                                    });
                                }
                            }
                        };

                        var getPlanObjectNode = function(){
                            elem = elem[0] || elem;
                            var node = elem.context;
                            var result = Selector.child(node,match);
                            getNodes(result);
                        };

                        Selector.isArray(elem) ? function(){
                            var i = 0,len = elem.length;
                            for(;i<len;i++){
                                var node = elem[i];
                                if(!node || !node.context) continue;
                                var result = Selector.child(node.context,match);
                                getNodes(result);
                            }
                        }():getPlanObjectNode();

                        return nodes;
                    };
                }
            }

        });

        Selector.extend({
            error:function(message){
                throw new Error(message);
            },

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
                return Selector.Expr.rnative.test(fn + "");
            },

            indexOf : function(arr,elem){
                if(!Selector.isArray(arr))
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

            isWindow: function( obj ) {
                return obj != null && obj == obj.window;
            },

            isPlainObject:function(obj){
                var key;
                if ( !obj || typeof obj !== "object" || obj.nodeType || Selector.isWindow( obj ) ) {
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
            },

            isSupportGetClsName:function(){
                return Selector.isNative(document.getElementsByClassName);
            },

            isQSA:function(){
                return Selector.isNative(document.querySelectorAll);
            },

            each:function(obj,callback,args){
                var value,i = 0,length = obj.length;
                var isArray = Selector.isArray(obj);
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

            data:function(elem,name,data){
                var ret,thisCache,isNode = elem.nodeType,cache = isNode?Selector.cache:elem,key = "data",elemKey = "node";

                cache[name] = Selector.cache[name] || {};
                thisCache = cache[name];
                if(data!=undefined){
                    thisCache[key] = data;
                    thisCache[elemKey] = thisCache[elemKey] || [];
                    if(Selector.indexOf(thisCache[elemKey],elem) == -1)
                        thisCache[elemKey].push(elem);
                }

                if(!thisCache[elemKey]) return ret;
                if(typeof name === "string" && Selector.indexOf(thisCache[elemKey],elem)!=-1) {
                    ret = thisCache[key];
                    if (ret == null) {
                        ret = thisCache[key];
                    } else {
                        ret = thisCache;
                    }
                }
                return ret;
            },

            removeData:function(elem,name){
                var cache = Selector.cache || {},key = "data",elemKey = "node",thisCache;
                cache[name] = Selector.cache[name] || {};
                thisCache = cache[name];
                thisCache[elemKey] = thisCache[elemKey] || [];

                if(thisCache[elemKey].length === 0) return;

                var ret = [];
                if(Selector.indexOf(thisCache[elemKey],elem) == -1) return;

                for(var i =0;i<thisCache[elemKey].length;i++){
                    var node = thisCache[elemKey][i];
                    if(node !== elem){
                        ret.push(node);
                    }
                }

                if(ret.length === 0){
                    delete cache[name];
                    return;
                }

                thisCache[elemKey].length = 0;
                thisCache[elemKey] = ret;
            },

            trim: function( text ) {
                return text == null ?
                    "" :
                    ( text + "" ).replace( Selector.Expr.rtrim(), "" );
            },

            parseJSON:function(data){
                if ( window.JSON && window.JSON.parse ) {
                    return window.JSON.parse( data + "" );
                }

                var requireNonComma,
                    depth = null,
                    str = Selector.trim( data + "" );

                return str && !Selector.trim( str.replace( Selector.Expr.rvalidtokens, function( token, comma, open, close ) {
                    if ( requireNonComma && comma ) {
                        depth = 0;
                    }

                    if ( depth === 0 ) {
                        return token;
                    }

                    // Commas must not follow "[", "{", or ","
                    requireNonComma = open || comma;

                    // Determine new depth
                    // array/object open ("[" or "{"): depth += true - false (increment)
                    // array/object close ("]" or "}"): depth += false - true (decrement)
                    // other cases ("," or primitive): depth += true - true (numeric cast)
                    depth += !close - !open;

                    // Remove this token
                    return "";
                }) ) ?
                    ( Function( "return " + str ) )() :
                    Selector.error( "Invalid JSON: " + data );
            },

            dataAttr:function(elem,key,data){
                if ( data === undefined && elem.nodeType === 1 ) {
                    var name = "data-"+key;
                    data = elem.getAttribute(name);

                    if(typeof data === "string"){
                        try{
                            data = data === "true" ? true :
                                data === "false" ? false :
                                    data === "null" ? null :
                                        // Only convert to a number if it doesn't change the string
                                        +data + "" === data ? +data :
                                            Selector.Expr.rbrace.test( data ) ? Selector.parseJSON( data ) :
                                                data;
                        }catch (e){}
                    }else{
                        data = undefined;
                    }
                }else{
                    data = data["data"];
                }
                return data;
            },

            child:function(elem,match){
                var first,last,type = match,node;
                switch (type){
                    case "only"://如果某个元素是父元素中唯一的子元素，那将会被匹配,如果父元素中含有其他元素，那将不会被匹配。
                        elem.hasChildNodes()?function(){
                            var nodes = elem.childNodes;
                            var onlyNode;
                            if(nodes.length === 0) return;
                            var count = 0;
                            for(var i = 0;i<nodes.length;i++){
                                var _node = nodes[i];
                                if(_node.nodeName == "#text" ||  _node.nodeName == "#BR") continue;
                                count++;
                                if(_node.nodeType === 1){
                                    onlyNode = _node;
                                }

                            }

                            if(count != 1)
                                return node = undefined;

                            return node = onlyNode;

                        }():node = undefined;
                        break;

                    case "first":

                    case "first-child":
                         elem.hasChildNodes()?function(){
                             var getFirstChildNode = function(nNode){
                                 var childNodes = nNode.childNodes;
                                 if(childNodes.length === 0)
                                    return;

                                 var i = 0,len = childNodes.length;
                                 for(;i<len;i++){
                                    var _node = childNodes[i];
                                    if(!_node) continue;

                                     if(_node.nodeType === 1 && _node.nodeName != "#text" &&  _node.nodeName != "#BR")
                                         return node = _node;
                                 }
                             };

                             getFirstChildNode(elem);
                         }():node = undefined;
                         break;

                    case "last":

                    case "last-child":
                        elem.hasChildNodes()?function(){
                            var getLastChildNode = function(nNode){
                                var childNodes = nNode.childNodes;
                                if(childNodes.length === 0)
                                    return;

                                var len = childNodes.length,i = len - 1;
                                for(i;i>0;i--){
                                    var _node = childNodes[i];
                                    if(!_node) continue;

                                    if(_node.nodeType === 1 && _node.nodeName != "#text" &&  _node.nodeName != "#BR")
                                        return node = _node;
                                }
                            };

                            getLastChildNode(elem);
                        }():node = undefined;
                        break;
                    case "nth":

                }

                return node;
            }
        });


        Selector.fn.extend({
            val : function(value){
                if(!this.context || this.context.length == 0){
                    if(value != undefined ) return ;
                    else return "";
                }

                var elem = this.context;
                elem = (elem.type && elem.nodeType === 1)? elem : function(){
                    if(Selector.isArray(elem)){
                        var results = [];
                        for(var i = 0;i<elem.length;i++){
                            var obj = elem[i];
                            if(!obj[0] || !obj[0].context) continue;
                            var type = obj[0].type;
                            if(type in Selector.Expr.relative) continue;

                            if(Selector.indexOf(results,obj[0].context) == -1){
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
                    (Selector.isArray(elem) === true)?function(){
                        for(var j =0;j<elem.length;j++){
                            var obj = elem[j];
                            (typeof value == "string" && value.constructor== String) ? obj.value = value : ( Selector.isArray(value) === true ? function(){
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
                    var ret = (Selector.isArray(elem) === true)?function(){
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
                return Selector.each(this.context,callback,args);
            },
            next:function(value){
                return Selector.getNextOrPrevNode.call(this,"next",value);
            },

            prev:function(value){
                return Selector.getNextOrPrevNode.call(this,"prev",value);
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
                    if(Selector.indexOf(s,ret[x][0].context) == -1)
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
                    if(Selector.indexOf(c,context.context) == -1)
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
                                if(!Selector.isObjExsist(results,{"context":elemNode}))
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
                if(!key || typeof key !== "string") return;

                var elem = this.context[0];
                if(value){
                    if(typeof value === "function")
                        return;
                }


                return arguments.length > 1?
                    this.each(function(){
                        Selector.data(this.context,key,value);
                    }) : (elem ? Selector.dataAttr(elem[0].context,key,Selector.data(elem[0].context,key)):undefined)
            },

            removeData:function(key){
                if(!key || typeof key !== "string") return;

                return this.each(function() {
                    Selector.removeData( this.context, key );
                });
            }
        });

        Selector.extend({
            init:function(selector){
                if(typeof selector === "string"){
                    selector = selector.trim();
                    if(!Selector.isQSA){
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

            getNodeFromRTOL : function(tokens){
                var i,token,type,seed = [],flag="",pt="",value;
                //i = Selector.Expr.needsContext().test( selector ) ? 0 : tokens.length;
                i = tokens.length;
                var count = 0;
                while(i--){
                    token = tokens[i];
                    type = token.type;
                    value = token.value;
                    if((!seed[0] || seed[0].length == 0) && count != 0){
                        count++;
                        continue;
                    }

                    if(type in Selector.filter){
                        var node = Selector.filter[type](value)();
                        if(flag === "parentNode" || flag === "previousSibling" ){
                            var s = [];
                            for(var j = 0;j<seed[0].length;j++){
                                var node_context = seed[0][j].context;
                                var pNode;

                                if(flag === "parentNode"){
                                    if(pt in Selector.Expr.relative){
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
                            if((count === 0 || count === 1) && node){
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

                    }else if(type in Selector.Expr.relative){//关系符号
                        flag = Selector.Expr.relative[type].dir;
                        pt = type;
                    }

                    count++;
                }

                return seed;
            },

            getNodeFromLTOR : function(tokens){
                var i,token,type,seed = [],flag="",pt="",value,parentToken,childType = "",ptNode;
                i = tokens.length;
                var x = 0,count = 0,f = 0;

                for(;x<i;x++){
                    token = tokens[x];
                    type = token.type;
                    value = token.value;

                    if(type in Selector.filter){
                        if(count === 0 && type === "PSEUDO") break;
                        var node;
                        if(type === "PSEUDO"){
                            count++;
                            f++;
                            childType = type;
                            if(f === 1){
                                node = Selector.filter[childType]()(ptNode[0],parentToken,token);
                            }else{
                                node = Selector.filter[childType]()(seed[0][0],parentToken,token);
                            }

                            ptNode = node;
                        }else{
                            node = Selector.filter[type](value)();
                            ptNode = node;
                            parentToken = token;
                        }

                        flag = flag ? (flag === "parentNode" ? (flag = "childNode"):(flag === "previousSibling" ? (flag = "nextSibling"):"")) : "";

                        (flag === "childNode" || flag === "nextSibling" ) ? function(){
                             var s = [];
                             flag === "childNode" ? function(){
                                var getParentNode = function(elem,isDeep){
                                    var pNode = elem.parentNode;
                                    if(!pNode) return;
                                    for(var j = 0;j<seed[0].length;j++){
                                        if(seed[0][j].context === pNode){
                                            elem.pNode = pNode ? pNode : null ;
                                            s.push({"context":elem,value:pt});
                                            return;
                                        }
                                    }

                                    if(isDeep){
                                        getParentNode(pNode);
                                    }
                                };

                                for(var l = 0;l<node.length;l++){
                                    var cNode = node[l];
                                    if(!cNode) continue;
                                    if(childType === "PSEUDO"){
                                        getParentNode(cNode.context,false);
                                    }else{
                                        getParentNode(cNode.context,true);
                                    }
                                }



                            }():function(){

                            }();

                            seed.length = 0;
                            seed.push(s);
                            pt = type;
                            childType = type;
                        }():function(){
                            if(count === 0 && node){
                                seed.push(node);
                                count++;
                                return;
                            }

                           /* var s = [];
                            for(var j = 0;j<seed[0].length;j++){
                                var node_context = seed[0][j].context;
                                (var k = 0;k<node.length;k++){
                                    if(node_context === node[k].context){
                                        s.push(seed[0][j]);
                                    }
                                }
                            }

                            seed.length = 0;
                            seed.push(s);*/
                            seed.length = 0;
                            seed.push(node);
                        }();








                    }else if(type in Selector.Expr.relative){//关系符号
                        flag = Selector.Expr.relative[type].dir;
                        pt = type;
                    }
                }

                return seed;
            },

            select:function(){
                return function(selector,tokens){
                    if(tokens.length == 0){
                        return [];
                    }

                    var hasPseduo = false;
                    for(var i = 0;i<tokens.length;i++){
                        var token = tokens[i];
                        var type = token.type;
                        if(type === "PSEUDO"){
                            hasPseduo = true;
                            break;
                        }
                    }

                    if(hasPseduo){
                        return Selector.getNodeFromLTOR(tokens);
                    }else{
                        return Selector.getNodeFromRTOL(tokens);
                    }
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
                            if(type in Selector.Expr.relative) continue;

                            if(!Selector.isObjExsist(results,_obj)){
                                results.push([_obj]);
                            }
                        }
                    }

                    return results;
                }
            },

            getNextOrPrevNode:function(cur,value){
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
                            if(Selector.indexOf(ret,ret[j][0].context) == -1)
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
                                        if(Selector.indexOf(ret,cNode)!= -1){
                                            if(Selector.indexOf(results,cNode.context) == -1 && cNode.nodeName != "#text" && cNode.nodeName != "BR") {
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
                                    Selector.indexOf(ret,nextPrevNode)!= -1 ? function(){
                                        if(Selector.indexOf(results,nextPrevNode.context) == -1 && nextPrevNode.nodeName != "#text" && nextPrevNode.nodeName != "BR") {
                                            results.push([{"context": nextPrevNode}]);
                                            getNextPrevNode(nextPrevNode);
                                        }
                                    }(): getNextPrevNode(nextPrevNode);
                                }():function(){
                                    if(Selector.indexOf(results,nextPrevNode.context) == -1 && nextPrevNode.nodeName != "#text" && nextPrevNode.nodeName != "BR") {
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
            }

        });

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
