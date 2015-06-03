(function(window,undefined){
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

                    if ( deep && copy && ( extend.isPlainObject(copy) || (copyIsArray = isArray(copy)) ) ) {
                        if ( copyIsArray ) {
                            copyIsArray = false;
                            clone = src && isArray(src) ? src : [];
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
        isWindow: function( obj ) {
            return obj != null && obj == obj.window;
        },

        isArray:function(obj){
            if(!obj.length)
                return false;

            var length = "length" in obj && obj.length;
            if(typeof obj === "function") return false;

            if(obj.nodeType === 1 && length)return true;

            return typeof obj === "array" || length === 0 || typeof length === "number" && length > 0 && (length - 1) in obj;
        },

        isPlainObject:function(obj){
            var key;
            if ( !obj || typeof obj !== "object" || obj.nodeType || extend.isWindow( obj ) ) {
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

    window.extend = new extend;
})(window,undefined);
