(function(window,undefined){

    var Normal = {
        guid : 1,
        strundefined:typeof undefined,
        isArray :function(obj){
            if(!obj.length)
                return false;

            var length = "length" in obj && obj.length;
            if(typeof obj === "function") return false;

            if(obj.nodeType === 1 && length)return true;

            return typeof obj === "array" || length === 0 || typeof length === "number" && length > 0 && (length - 1) in obj;
        },

        isWindow: function( obj ) {
            return obj != null && obj == obj.window;
        },

        indexOf:function(arr,elem){
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

        getWindow:function(elem){
            return normal.isWindow( elem ) ?
                elem :
                elem.nodeType === 9 ?
                elem.defaultView || elem.parentWindow :
                    false;
        },

        inArray: function( elem, arr, i ) {
            var len;

            if ( arr ) {
                if ( normal.indexOf ) {
                    return normal.indexOf.call( arr, elem, i );
                }

                len = arr.length;
                i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

                for ( ; i < len; i++ ) {
                    // Skip accessing in sparse arrays
                    if ( i in arr && arr[ i ] === elem ) {
                        return i;
                    }
                }
            }

            return -1;
        },

        parent: function( elem ) {
            var parent = elem.parentNode;
            return parent && parent.nodeType !== 11 ? parent : null;
        },

        setOffset:function( elem, options, i ) {
            var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
                position = elem.style['position'],
                curElem = elem,
                props = {};

            if ( position === "static" ) {
                elem.style.position = "relative";
            }

            curOffset = normal.offset(curElem);
            curCSSTop =  elem.style['top'];
            curCSSLeft = elem.style['left'];
            calculatePosition = ( position === "absolute" || position === "fixed" ) &&
            normal.inArray("auto", [ curCSSTop, curCSSLeft ] ) > -1;

            if ( calculatePosition ) {
                curPosition = normal.position(curElem);
                curTop = curPosition.top;
                curLeft = curPosition.left;
            } else {
                curTop = parseFloat( curCSSTop ) || 0;
                curLeft = parseFloat( curCSSLeft ) || 0;
            }

            if (typeof options === "function" ) {
                options = options.call( elem, i, curOffset );
            }

            if ( options.top != null ) {
                props.top = ( options.top - curOffset.top ) + curTop;
            }
            if ( options.left != null ) {
                props.left = ( options.left - curOffset.left ) + curLeft;
            }

            if ( "using" in options ) {
                options.using.call( elem, props );
            } else {
                curElem.style['top'] = props.top;
                curElem.style['left'] = props.left;
            }
        },

        offset:function(elem,options){
            if(!elem) return;

            if(options){
                return this.each(function (i) {
                    normal.setOffset(this, options, i);
                });
            }

            var docElem,win,box = {top:0,left:0},doc = elem && elem.ownerDocument;
            if(!doc) return;
            docElem = doc.documentElement;
            if (typeof elem.getBoundingClientRect !== normal.strundefined) {
                box = elem.getBoundingClientRect();
            }
            win = normal.getWindow( doc );
            return {
                top: box.top  + ( win.pageYOffset || docElem.scrollTop )  - ( docElem.clientTop  || 0 ),
                left: box.left + ( win.pageXOffset || docElem.scrollLeft ) - ( docElem.clientLeft || 0 )
            };
        },

        position:function(elem){
            if(!elem) return;
            var offsetParent, offset,parentOffset = { top: 0, left: 0 };
            if(elem.style['position'] === "fixed")
                offset = elem.getBoundingClientRect();
            else{
                offsetParent = normal.offsetParent(elem);
                offset = normal.offset(elem);
                if(offsetParent[ 0].nodeName !== "html")
                    parentOffset = offsetParent.offset();
                parentOffset.top += offsetParent[0].style['borderTopWidth'];
                parentOffset.left += offsetParent[0].style['borderLeftWidth'];
            }

            return{
                top:  offset.top  - parentOffset.top - elem.style['marginTop'],
                left: offset.left - parentOffset.left - elem.style['marginLeft']
            }
        },

        offsetParent: function(elem) {
            var offsetParent = elem.offsetParent || window.document.documentElement;

            while ( offsetParent && ( offsetParent.nodeName !== "html"&& offsetParent.style['position'] === "static" ) ) {
                offsetParent = offsetParent.offsetParent;
            }

            return offsetParent || window.document.documentElement;
        }

    };

    var extend = (function(){
        function extend(){
            var options,name,src,copy,copyIsArray,clone,target = arguments[0] || {},
                i = 1,length = arguments.length,deep = false;

            if(typeof target === "boolean"){
                deep = target;
                target = arguments[1] || {};
                i = 2;
            }

            if(typeof target !== "object" && typeof target !=="function") target = {};
            if(length === i){target = this;--i;}
            for(;i<length;i++){
                if((options = arguments[i])!=null ){
                    for(name in options){
                        src = target[name];
                        copy = options[name];
                        if ( target === copy ) continue;

                        if ( deep && copy && ( extend.isPlainObject(copy) || (copyIsArray = Normal.isArray(copy)) ) ) {
                            if ( copyIsArray ) {
                                copyIsArray = false;
                                clone = src && Normal.isArray(src) ? src : [];
                            }else{
                                clone = src && extend.isPlainObject(src) ? src : {};
                            }
                        }else if ( copy !== undefined ){
                            target[ name ] = copy;
                        }
                    }
                }
            }

            return target;
        }

        extend.fn = extend.prototype = {};
        extend({
            isPlainObject:function(obj){
                var key;
                if ( !obj || typeof obj !== "object" || obj.nodeType || normal.isWindow( obj ) ) {
                    return false;
                }

                try {
                    if ( obj.constructor && !obj.hasOwnProperty("constructor") && obj.constructor.prototype.hasOwnProperty("isPrototypeOf"))
                        return false;
                } catch ( e ) {return false;}

                for ( key in obj ) {
                    return obj.hasOwnProperty(key);
                }
                //for ( key in obj ) {}
                return key === undefined || obj.hasOwnProperty(key);
            }
        });

        return extend;
    })();


    var each = (function(){
        function eachData(obj,callback,args){
            if(!obj) return;
            var value, i = 0, length = obj.length;
            var _isArray = Normal.isArray(obj);
            if (args) {
                if (_isArray) {
                    for (; i < length; i++) {
                        value = callback.apply(obj[i], args);
                        if (value === false)  break;
                    }
                } else {
                    for (i in obj) {
                        value = callback.apply(obj[i], args);
                        if (value === false)  break;
                    }
                }
            } else {
                if (_isArray) {
                    for (; i < length; i++) {
                        value = callback.call(obj[i], i, obj[i]);
                        if (value === false)  break;
                    }
                } else {
                    for (i in obj) {
                        value = callback.call(obj[i], i, obj[i]);
                        if (value === false)  break;
                    }
                }
            }
            return obj;
        }

        return eachData;
    })();

    var data = (function(extend){
        var caches = {},key="data",elemKey="node";

        function data(elem,name,data){
            var ret,thisCache,isNode = elem.nodeType,cache = isNode?caches:elem;
            cache[name] = cache[name] || {};
            thisCache = cache[name];
            if(data!=undefined){
                thisCache[key] = data;
                thisCache[elemKey] = thisCache[elemKey] || [];
                if(Normal.indexOf(thisCache[elemKey],elem) == -1)
                    thisCache[elemKey].push(elem);
            }

            if(!thisCache[elemKey]) return ret;
            if(typeof name === "string" && Normal.indexOf(thisCache[elemKey],elem)!=-1) {
                ret = thisCache[key];
                if (ret == null) {
                    ret = thisCache[key];
                } else {
                    ret = thisCache;
                }
            }
            return ret;
        }

        function removeData(elem,name){
            var cache = cache || {},thisCache;
            cache[name] = cache[name] || {};
            thisCache = cache[name];
            thisCache[elemKey] = thisCache[elemKey] || [];

            if(thisCache[elemKey].length === 0) return;

            var ret = [];
            if(Normal.indexOf(thisCache[elemKey],elem) == -1) return;

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
        }

        var Data = {}
        Data.data = data;
        Data.removeData = removeData;
        return Data;
    })(extend);

    var proxy = (function(){
        var arr = [],slice = arr.slice;
        function Proxy(fn,context){
            if(typeof fn !== "function") return undefined;

            var args,proxy,tmp;
            if(typeof context === "string"){
                tmp = fn[context];
                context = fn;
                fn = tmp;
            }

            args = slice.call( arguments, 2 );
            proxy = function(){
                return fn.apply(context || this,args.concat(slice.call( arguments )));
            };

            proxy.guid = fn.guid = fn.guid || Normal.guid++;
            return proxy;
        }

        return Proxy;
    })();

    var event = (function(){
        var Event = {
            addEvent : function(elem,type,fn,useCapture){
                if (elem.addEventListener) {
                    useCapture = typeof useCapture == 'boolean' ? useCapture : false;
                    elem.addEventListener(type, fn, useCapture);//DOM2.0
                }else if(elem.attachEvent){
                    elem.attachEvent('on'+type, fn);
                }else{
                    elem['on'+type] = fn;
                }
            },

            removeEvent:function(elem,type,fn,useCapture){
                if (elem.removeEventListener) {
                    if(useCapture == undefined)
                        useCapture = false;
                    elem.removeEventListener(type, fn, useCapture);//DOM2.0
                    return;
                }else if(elem.detachEvent){
                    elem.detachEvent('on'+type, fn);
                    return;
                }else{
                    elem["on" + type] = null;
                    return;
                }
            },

            stopEvent:function(e){
                e = e || window.event;
                if(e.preventDefault) {
                    e.preventDefault();
                    e.stopPropagation();
                }else{
                    e.returnValue = false;
                    e.cancelBubble = true;
                }
            }
        };

        return Event;
    })();

    window.normal = Normal;
    window.normal.extend = extend;
    window.normal.each = each;
    window.normal.data = data;
    window.normal.proxy = proxy;
    window.normal.event = event;
})(window,undefined);
