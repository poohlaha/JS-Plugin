(function(window,document,undefined){
    'use strict';

    var head = document.head || document.getElementsByTagName('head')[0];
    var defaultExpiration = 5000;
    var storagePrefix = 'cacheFilter-';

    var Expr = {};
    Expr.find = {
        'ID'    : document.getElementById,
        'CLASS' : document.getElementsByClassName,
        'TAG'   : document.getElementsByTagName
    };

    var Cache = {};
    Cache.request = ['GET','POST'];
    Cache.httpRequestCache = [];
    Cache.name = {
        "chunnelName":"default",
        "funName":"function",
        "cacheName":"cache"
    };

    Cache.cacheArray = [];
    Cache.thenCacheArray = [];

    Cache.properties = {
      "timeout":5000,
      "version":"1.0.0"
    };

    Cache.suffix = {
        "js":".js",
        "css":".css"
    };

    Cache.counter = 0;

    var head = document.head || document.getElementsByTagName('head')[0];

    /*
     * 用于存放通道名称及通信对象的类，这样可以通过不同通道名称来区分不同的通信对象
     */
    Cache.httpRequestObject = function () {
        this.chunnel = null;
        this.instance = null;
    };

    /*
     * 用于获取的脚本或css文件保存对象
     */
    Cache.httpObject = function(){
        this.url = null;        //要下载的文件路径
        this.cacheKey = null;  //缓存键
        this.chunnelName = null;    //通道名
        this.type = null;       //类型，js或css
        this.isFill = false;   //内容是否被填充
        this.isExec = false;   //内容是否已被执行，防止分几大块载入后重复执行
    };

    Cache.getBrowserRequest = function(){
        var xmlHttp;
        if (window.XMLHttpRequest){// code for IE7+, Firefox, Chrome, Opera, Safari
            xmlHttp=new XMLHttpRequest();
            //有些版本的Mozilla浏览器处理服务器返回的未包含XML mime-type头部信息的内容时会出错。
            //因此，要确保返回的内容包含text/xml信息
            if (xmlHttp.overrideMimeType) {
                xmlHttp.overrideMimeType('text/xml');
            }
        }else if (window.ActiveXObject) {//IE
            var MSXML = ['MSXML2.XMLHTTP.5.0', 'Microsoft.XMLHTTP', 'MSXML2.XMLHTTP.4.0', 'MSXML2.XMLHTTP.3.0', 'MSXML2.XMLHTTP'];
            for (var i = 0; i < MSXML.length; i++) {
                try {
                    xmlHttp = new ActiveXObject(MSXML[i]);
                    break;
                }
                catch (e) {
                    throw new Error(e.message);
                }
            }
        }

       return xmlHttp;
    };

    /**
     * 获取一个通信对象
     * 若没指定通道名称，则默认通道名为"default"
     * 若缓存中不存在需要的通信类，则创建一个，同时放入通信类缓存中
     * @param chunnelName：通道名称，若不存在此参数，则默认为"default"
     * @return 一个通信对象，其存放于通信类缓存中
     */
    Cache.getChunnelObject = function(chunnelName){
        var instance = null;
        var object = null;
        if(!chunnelName){
            chunnelName = Cache.name["chunnelName"];
        }

        var isGet = false;
        for(var i = 0,len = Cache.httpRequestCache;i<len;i++){
            object = Cache.httpRequestObject(Cache.httpRequestCache[i]);
            if(object.chunnelName == chunnelName){
                if(object.instance.readyState == 0 || object.instance.readyState == 4){
                    instance = object.instance;
                }

                isGet = true;
                break;
            }
        }

        if(!isGet){
            object = new Cache.httpRequestObject();
            object.chunnelName = chunnelName;
            object.instance = Cache.getBrowserRequest();
            Cache.httpRequestCache.push(object);
            instance = object.instance;
        }

        return instance;
    };

    /**
     * 客户端向服务端发送请求
     * @param url:请求目的
     * @param data:要发送的数据
     * @param processRequest:用于处理返回结果的函数，其定义可以在别的地方，需要有一个参数，即要处理的通信对象
     * @param chunnelName:通道名称，默认为"default"
     * @param asynchronous:是否异步处理，默认为true,即异步处理
     * @param paramObj:相关的参数对象
     */
    //Cache.send = function(url,data,processRequest,chunnalName,asynchronous,paramObj){
      Cache.send = function(array,data,processRequest,asynchronous){
        if(array.length == 0)
            return;

        for(var i= 0,len = array.length;i<len;i++){
            var item = array[i];
            var url = item.url;
            var chunnalName = item.chunnelName;

            if(item.isFill){
                Cache.executeFiles();
                return;
            }

            if(url.length == 0 || url.indexOf("?") == 0)
                throw new Error("Please input url");

            if(!chunnalName){
                chunnalName =  Cache.name["chunnelName"];
            }

            /*if(!asynchronous)
             asynchronous = true;*/

            var instance = Cache.getChunnelObject(chunnalName);
            if(instance == null)
                throw new Error("Your Browser Can Not Support Ajax.");

            //url加一个时刻改变的参数，防止由于被浏览器缓存后同样的请求不向服务器发送请求
            if (url.indexOf("?") != -1) {
                url += "&requestTime=" + (new Date()).getTime();
            }else {
                url += "?requestTime=" + (new Date()).getTime();
            }

            if (data.length == 0) {
                if(asynchronous)
                    instance.open("GET", url, asynchronous);
                else
                    instance.open("GET", url);
            }else {
                if(asynchronous)
                    instance.open("POST", url, asynchronous);
                else
                    instance.open("POST", url);
                instance.setRequestHeader("Content-Length", data.length);
                instance.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

            }

            if(typeof (processRequest) === Cache.name["funName"]){
                    Cache.serverCallback(instance,processRequest,item);
            }

            /*if (asynchronous === false && typeof (processRequest) === Cache.name["funName"]) {
             processRequest(instance, paramObj);
             }*/

            instance.send(data.length == 0 ?null : data);

            /*setTimeout( function () {
                if( instance.readyState < 4 ) {
                    instance.abort();
                }
            }, Cache.properties["timeout"]);*/


        }

    };

    Cache.getFileSuffix = function (url) {
        var suffix = /\.[^\.]+$/.exec(url);
        return suffix.toString().toLowerCase();
    };

    Cache.getCache = function(key){
        return localStorage.getItem(key);
    };

    Cache.setCache = function(key,value){
        return localStorage.setItem(key,value);
    };

    Cache.removeCache = function(key){
        return localStorage.removeItem(key);
    };

    Cache.removeAllCache = function(){
        for ( var key in localStorage ) {
            Cache.removeCache(key);
        }
    };

    Cache.executeCache = function(){
        //Cache.loadFiles();
        var processGet = Cache.processGet;
        var i = 0;
        Cache.send(Cache.cacheArray,"",Cache.processGet,false,i);//采用同步方式载入
    };

    Cache.processGet = function(instance,paramObj){
        Cache.setCache(paramObj.cacheKey,instance.responseText);
        paramObj.isFill = true;
    };

    Cache.loadFiles = function(){
        for(var i = 0,len = Cache.cacheArray.length;i<len;i++){
            var item = Cache.cacheArray[i];
            var processGet = function(instance,paramObj){
                Cache.setCache(paramObj.cacheKey,instance.responseText);
                paramObj.isFill = true;
            };

            if(!item.isFill){
                Cache.send(item.url,"",processGet,item.chunnelName,false,item);///采用同步方式载入
            }else{
                Cache.executeFiles();
            }
        }
    };

    Cache.executeFiles = function(){
        for(var i = 0,len = Cache.cacheArray.length;i<len;i++){
            var item = Cache.cacheArray[i];
            if(item.isExec == false){
                Cache.executeSingleFile(item);
            }
        }
    };

    Cache.executeSingleFile = function(item){
        if(item.isExec == false){
            if(item.type === Cache.suffix["js"]){
                Cache.execJS(Cache.getCache(item.cacheKey));
                item.isExec = true;
            }else if(item.type === Cache.suffix["css"]){
                Cache.execCSS(Cache.getCache(item.cacheKey));
                item.isExec = true;
            }
            Cache.injectScript(item.url);
        }
    };

    Cache.execCSS = function(css){
        return document.write('<style type="text/css">' + css + '</style>');
    };

    Cache.execJS = function(js){
        if(window.execScript)
            window.execScript(js);
        else
            window.eval(js);
    };

    Cache.injectScript = function( data ) {
        var script = document.createElement('script');
        script.defer = true;
        script.src = data;
        script.type = "text/javascript";
        head.appendChild(script);
    };

    Cache.serverCallback = function(instance,processRequest,paramObj){
        instance.onreadystatechange = function(){
            if(instance.readyState == 4){
                if ( ( instance.status === 200 ) || ( ( instance.status === 0 ) && instance.responseText ) ) {
                    if(Cache.counter != undefined)
                        Cache.counter++;
                    Cache.executeCallback(instance,processRequest,paramObj);
                    if(Cache.counter != undefined){
                        if(Cache.counter == Cache.cacheArray.length){
                            Cache.thenRequire();
                        }
                    }

                }else{
                    throw new Error(instance.statusText);
                }
            }
        };
    };

    Cache.thenRequire = function(){
        if(Cache.thenCacheArray.length > 0){
            var processGet = Cache.processGet;
            Cache.counter = undefined;
            Cache.send(Cache.thenCacheArray,"",Cache.processGet,false);//采用同步方式载入
        }
    };

    Cache.executeCallback = function(instance,processRequest,paramObj){
        processRequest(instance,paramObj);
       // Cache.executeFiles();
        Cache.executeSingleFile(paramObj);
    };

    /**
     * 串联加载指定的脚本
     * 串联加载[异步]逐个加载，每个加载完成后加载下一个
     * 全部加载完成后执行回调
     * @param array|string 指定的脚本们
     * @param function 成功后回调的函数
     * @return array 所有生成的脚本元素对象数组
     */
    Cache.seriesServerCallback = function(array){
        if(array.length == 0)
            return;

        var arr = new Array();
        var last = array.length - 1;
        var recursiveLoad = function(i){
           arr[i] = document.createElement("script");
           arr[i].setAttribute("type","text/javascript");
           arr[i].setAttribute("src",array[i].url);
           var url = array[i].url;
           var cacheKey = array[i].cacheKey;
           if(arr[i].readyState){//IE
               arr[i].onreadystatechange = function () {
                   if (arr[i].readyState == "loaded" || arr[i].readyState == "complete"){
                       arr[i].onreadystatechange = null;
                       this.onload = this.onreadystatechange = null;
                       this.parentNode.removeChild(this);
                       if(i == last){
                           Cache.setCache(cacheKey,url);
                          // Cache.executeFiles();
                       }else{
                           recursiveLoad(i+1);
                       }
                   }
               }
           }else{
               arr[i].onload = function () {
                   this.onload = this.onreadystatechange = null;
                   this.parentNode.removeChild(this);
                   if(i == last){
                       Cache.setCache(cacheKey,url);
                       //Cache.executeFiles();
                   }else{
                       recursiveLoad(i+1);
                   }
               }
           }

            head.appendChild(arr[i]);
       };

        recursiveLoad(0);
    };

    /**
     * 串联加载指定的脚本
     * 串联加载[异步]逐个加载，每个加载完成后加载下一个
     * 全部加载完成后执行回调
     * @param array|string 指定的脚本们
     * @param function 成功后回调的函数
     * @return array 所有生成的脚本元素对象数组
     */
    Cache.parallelServerCallback = function(array){
        if(array.length == 0)
            return;

        var loaded = 0;
        var arr = new Array();
        for(var i = 0,len = array.length;i<len;i++){
            arr[i] = document.createElement("script");
            arr[i].setAttribute("type","text/javascript");
            arr[i].setAttribute("src",array[i].url);
            var url = array[i].url;
            var cacheKey = array[i].cacheKey;
            if(arr[i].readyState){//IE
                arr[i].onreadystatechange = function () {
                    if (arr[i].readyState == "loaded" || arr[i].readyState == "complete"){
                        arr[i].onreadystatechange = null;
                        loaded++;
                        this.onload = this.onreadystatechange = null;
                        this.parentNode.removeChild(this);
                        if(loaded == array.length){
                            Cache.setCache(cacheKey,url);
                           // Cache.executeFiles();
                        }
                    }
                }
            }else{
                arr[i].onload = function () {
                    loaded++;
                    this.onload = this.onreadystatechange = null;
                    this.parentNode.removeChild(this);
                    if(loaded == array.length){
                        Cache.setCache(cacheKey,url);
                       // Cache.executeFiles();
                    }
                }
            }

            head.appendChild(arr[i]);
        }

    };

    Cache.validateArgs = function(args){
        if(args.length <= 0)
            throw new Error("Please Input Urls.");

        for(var i = 0,len = args.length;i <len;i++){
            args[i].execute = args[i].execute !== false;

            if(args[i].once && Cache.cacheArray.indexOf(args[i].url) >= 0  ){
                args[i].execute = false;
            }else {
                if(args[i].execute !== false && Cache.cacheArray.indexOf(args[i].url) < 0 ){
                    var object = Cache.createHttpObject(args[i].url);
                    object.chunnelName = Cache.name["cacheName"] + (Cache.cacheArray.length + 1);
                    if(Cache.isLoadFile(object.url)){
                        continue;
                    }

                    var cacheValue = Cache.getCache(object.cacheKey);
                    if(cacheValue){
                        Cache.executeSingleFile(object);
                        continue;
                    }

                    Cache.cacheArray.push(object);
                }
            }
        }
    };

    Cache.validateThenArgs = function(args){
        if(args.length <= 0)
            throw new Error("Please Input Urls.");

        for(var i = 0,len = args.length;i <len;i++){
            if(typeof (args[i]) == "object"){
                args[i].execute = args[i].execute !== false;
                if(args[i].execute !== false && Cache.thenCacheArray.indexOf(args[i].url) < 0 ){
                    var object = Cache.createHttpObject(args[i].url);
                    object.chunnelName = Cache.name["cacheName"] + (Cache.thenCacheArray.length + 1);
                    if(Cache.isLoadFile(object.url)){
                        continue;
                    }

                    var cacheValue = Cache.getCache(object.cacheKey);
                    if(cacheValue){
                        Cache.executeSingleFile(object);
                        continue;
                    }

                    Cache.thenCacheArray.push(object);
                }
            }else if(typeof (args[i]) == "function"){

            }
        }
    };

    Cache.createHttpObject = function(url){
        var object = new Cache.httpObject();
        object.url = url;
        object.cacheKey = Cache.properties["version"] + url;
        object.type = Cache.getFileSuffix(url);
        var cacheContent = Cache.getCache(object.cacheKey);
        if(cacheContent)
            object.isFill = true;
        return object;
    };

    Cache.isLoadFile = function (name) {
        try{
            var js= /js$/i.test(name);
            var find = Expr.find['TAG'];
            var es=find.call(document,js?'script':'link');
            for(var i=0;i<es.length;i++)
                if(es[i][js?'src':'href'].indexOf(name)!=-1)return true;
            return false;
        }catch(e){
            throw new Error("SCPUtil Error:"+e.message);
        }
    };

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

    window.cacheFilter = {
        require: function () {
            Cache.counter = 0;
            Cache.validateArgs(arguments);
            Cache.executeCache();
            //Cache.seriesServerCallback(Cache.cacheArray);
            return this;
        },
        remove: function( url ) {
            Cache.removeCache(Cache.name["cacheName"] + url);
            return this;
        },
        clear: function() {
            Cache.removeAllCache();
            return this;
        },
        then:function(){
            Cache.validateThenArgs(arguments);
        }
    };

})(this,document,undefined);
