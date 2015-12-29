/**
 * created by tlzhang
 */
(function () {

    var _default = {
        _version :'1.0.0',
        _author : 'smile.love.tao@gmail.com',
        _defaultSuffix : '.js',
        _baseFileName : 'require.js',
        _moduleCache : {},
        _isOpera : typeof opera !== 'undefined' && opera.toString() === '[object Opera]',
        _isBrowser : !!(typeof window !== 'undefined' && typeof navigator !== 'undefined' && window.document),
        _isWebWorker : !this._isBrowser && typeof importScripts !== 'undefined',
        _readyRegExp : this._isBrowser && navigator.platform === 'PLAYSTATION 3' ? /^complete$/ : /^(complete|loaded)$/,
        _defaultCount :0
    };

    var Require = (function(){

        function require(deps,callback){
            if(!this._currentPath)
                this._getCurrentPath.call(this);//get current path
            this._getRootPath.call(this);//get root path

            if((!this._isArray(deps) || deps.length == 0) && !callback)
                return this;

            this._init.call(this,deps,callback);
            return this;
        }

        require.prototype._config = function(obj){
            if(!obj || !obj.baseUrl) return this;
            this._currentPath = obj.baseUrl;
            return this;
        };

        require.prototype.then = function(deps,callback){
            this._init.call(this,deps,callback);
            return this;
        };

        require.prototype._isArray = function(object){
            return  object && typeof object==='object' &&
                typeof object.length==='number' &&
                typeof object.splice==='function' &&
                    //判断length属性是否是可枚举的 对于数组 将得到false
                !(object.propertyIsEnumerable('length'));
        };

        require.prototype._init = function(deps,callback){
            this._deps = deps || [];
            this._defQueue = [];//queue
            this._NotDefQueue = [];
            this._callback = callback;
            this._allDefArr = [];
            if(this._deps.length == 0 && !this._callback)
                return this;

            if(this._deps.length == 0){
                var moduleName = document.currentScript && document.currentScript.id;
                if(moduleName){
                    this._deps.push(moduleName);
                }
            }

            var self = this;
            for(var i = 0;i<this._deps.length;i++){
                (function(i){
                    var _dep = self._deps[i];
                    if(!_dep) return;
                    if(_dep.indexOf(_default._defaultSuffix) === -1){
                        if(_dep.slice(-1) === "."){
                            _dep += _default._defaultSuffix.substring(1,_default._defaultSuffix.length);
                        }else
                            _dep += _default._defaultSuffix;
                    }

                    _default._defaultCount ++;
                    //var module = new Module("@r_"+ (_default._defaultCount),_dep,self._currentPath,self._rootPath);
                    var module = self._buildModule.call(self,_dep);

                    var moduleName = module._moduleName;
                    if(!_default._moduleCache[moduleName]) {//module have been loaded
                        _default._moduleCache[moduleName] = {
                            moduleUrl : module._modulePath + module._fileName,
                            modName : moduleName,
                            module : module
                        };
                        self._defQueue.push(module);
                    }else{
                        module = _default._moduleCache[moduleName].module;
                        if(module._loaded == false){
                            self._defQueue.push(module);
                        }else
                            self._NotDefQueue.push(module);
                    }
                })(i);
            }

            this._nextTick.call(this);
        };

        require.prototype._buildModule = function(dep){
            return new Module("@r_"+ (_default._defaultCount),dep,this._currentPath,this._rootPath);
        };

        require.prototype._nextTick = function(){
            if(this._defQueue.length > 0){
                for(var i = 0;i<this._defQueue.length;i++){
                    var module = this._defQueue[i];
                    if(!module) continue;
                    this._build.call(this,module);
                }

            }

            if(this._NotDefQueue.length > 0){
                for(var i = 0;i<this._NotDefQueue.length;i++){
                    var module = this._NotDefQueue[i];
                    if(!module) continue;
                    if(!module._export){
                        this._save.call(this,module._moduleName,null,this._callback);
                    }

                    this._allDefArr.push(module);
                }
            }

            //in cache,export them.
            if(this._NotDefQueue.length > 0 && this._NotDefQueue.length === this._deps.length){
                setTimeout(this._callback.apply(this,this._getAllParams.call(this)), 50);
                this._NotDefQueue.length = 0;
                this._allDefArr.length = 0;
                this._deps.length = 0;
            }else
                this._checkLoaded.call(this);
        };

        require.prototype._checkLoaded = function(){
            if(this._defQueue.length == 0) return;
            var self = this;
            var defQueueArr = self._defQueue;
            var checkOut = function(){
                if(defQueueArr.length == 0){
                    window.clearInterval(checkLoadedTimeId);
                    self._defQueue.length = 0;
                    self._callback.apply(self,self._getAllParams.call(self));
                    //setTimeout(self._callback.apply(self,self._getAllParams.call(self)), 50);
                    return;
                }
                for(var i = 0;i < self._defQueue.length;i++){
                    var module = self._defQueue[i];
                    if(module._loaded = true){
                        defQueueArr.splice(i,1);
                        self._allDefArr.push(module);
                    }
                }
            };

            require.prototype._getAllParams = function(){
                if(this._allDefArr.length == 0) return [];
                var arr = new Array();
                for(var i = 0;i < this._deps.length;i++){
                    var moduleName = this._deps[i];
                    for(var j = 0;j < this._allDefArr.length;j++){
                        var module = this._allDefArr[j];
                        if(!module) continue;
                        if((moduleName.indexOf(module._moduleName) != -1) && (this._indexOf(arr,module) == -1)){
                            arr.push(module._export);
                        }
                    }
                }

                return arr;
            };

            var checkLoadedTimeId = setInterval(checkOut, 50);
        };

        require.prototype._indexOf = function(arr,obj){
            if(!this._isArray(arr))
                return -1;

            var i = 0,len = arr.length;
            for(;i<len;i++){
                if(arr[i] === obj){
                    return i;
                }
            }
            return -1;
        };

        require.prototype._load = function(module,callback){
            var moduleUrl = module._modulePath + module._fileName,mod;
            if(_default._moduleCache[moduleUrl]){//module have been loaded
                mod = _default._moduleCache[moduleUrl];
                if(module._loaded == true){
                    setTimeout(callback(this._params), 0);
                }else{
                    mod.onload.push(callback);
                }
            }else{
                this._build.call(module,callback);
            }
        };

        require.prototype._build = function(module){
            var node = document.createElement('script');
            node.id = module._moduleName;
            node.type = 'text/javascript';
            node.charset = 'utf-8';
            node.async = true;

            var self = this;
            var _onScriptLoad = function(evt){
                if (evt.type === 'load' ||
                    (_default._readyRegExp.test((evt.currentTarget || evt.srcElement).readyState))) {
                    self._getScriptData.call(self,evt,_onScriptLoad);
                    module._loaded = true;
                }
            };

            if (node.attachEvent && !(node.attachEvent.toString &&
                node.attachEvent.toString().indexOf('[native code') < 0) && !_default._isOpera) {
                node.attachEvent('onreadystatechange', _onScriptLoad);
            }else{
                node.addEventListener('load', _onScriptLoad, false);
                //node.addEventListener('error', this._onScriptError, false);
            }

            node.src = module._modulePath + module._fileName;
            var head = document.getElementsByTagName('head')[0];
            //var script = document.getElementsByTagName('script')[0];
            var baseElement = document.getElementsByTagName('base')[0];
            if (baseElement) {
                head = baseElement.parentNode;
            }

            if(baseElement)
                head.insertBefore(node, baseElement);
            else
                head.appendChild(node);
        };


        require.prototype._getScriptData = function(evt,func) {
            var node = evt.currentTarget || evt.srcElement;

            //Remove the listeners once here.
            this._removeListener(node, func, 'load', 'onreadystatechange');
        };

        require.prototype._removeListener = function(node, func, name, ieName) {
            if (node.detachEvent && !this._isOpera) {
                if (ieName) {
                    node.detachEvent(ieName, func);
                }
            } else {
                node.removeEventListener(name, func, false);
            }
        };

        require.prototype._save = function(modName,params,callback){
            var mod;

            if(_default._moduleCache.hasOwnProperty(modName)){
                mod = _default._moduleCache[modName];
                var module = mod.module || null;
                if(module){
                    module._export = callback ? callback(params) : null;
                }

            }else
                callback && callback.apply(window, params);

        };

        require.prototype._getCurrentScriptSrc = function(){
            //取得正在解析的script节点
            if(document.currentScript) { //firefox 4+
                return document.currentScript.src;
            }
            // 参考 https://github.com/samyk/jiagra/blob/master/jiagra.js
            var stack;
            try {
                a.b.c(); //强制报错,以便捕获e.stack
            } catch(e) {//safari的错误对象只有line,sourceId,sourceURL
                stack = e.stack;
                if(!stack && window.opera){
                    //opera 9没有e.stack,但有e.Backtrace,但不能直接取得,需要对e对象转字符串进行抽取
                    stack = (String(e).match(/of linked script \S+/g) || []).join(" ");
                }
            }
            if(stack) {
                /**
                 * e.stack最后一行在所有支持的浏览器大致如下:
                 * chrome23,firefox17,opera12,IE10
                 */
                stack = stack.split( /[@ ]/g).pop();//取得最后一行,最后一个空格或@之后的部分
                stack = stack[0] == "(" ? stack.slice(1,-1) : stack;
                return stack.replace(/(:\d+)?:\d+$/i, "");//去掉行号与或许存在的出错字符起始位置
            }
            var nodes = document.getElementsByTagName("script"); //只在head标签中寻找
            for(var i = 0, node; node = nodes[i++];) {
                if(node.readyState === "interactive") {
                    return node.className = node.src;
                }
            }
        };

        require.prototype._getCurrentPath = function(){
            if(!document.scripts && !document.getElementsByTagName("script")) return;
            var scripts = document.scripts || document.getElementsByTagName("script");
            var fileReg = new RegExp("(^|(.*?\\/))(" + _default._baseFileName + ")(\\?|$)");
            var _path = "";
            var isLt8 = ('' + document.querySelector).indexOf('[native code]') === -1;
            for(var i = 0;i < scripts.length;i++){
                var src;
                isLt8 ? src = scripts[i].getAttribute('src', 4) : src = scripts[i].src;
                if(!src) continue;
                var match = src.match(fileReg);
                if(!match) continue;
                _path = match[1];
                break;
            }
            this._currentPath = _path || '';
        };


        require.prototype._getRootPath = function(){
            var getIndex = function(str,index){
                if(!index) index == -1;
                if(index !== -1){
                    if((index = str.indexOf("/",index + 1)) != -1)
                        return index;
                }else{
                    if((index = str.indexOf("/")) != -1)
                        return index;
                }
            };

            //start with http or https
            var len = 0;
            if(this._currentPath.indexOf("http") === 0 || this._currentPath.indexOf("https") === 0){
                len = 4;
            }else{
                len = 2;
            }

            var fileIndex = -1 ;
            for(var i = 0;i < len;i++){
                fileIndex = getIndex(this._currentPath,fileIndex);
                if(fileIndex == -1) break;
            }

            if(fileIndex !== -1){
                this._rootPath = this._currentPath.substring(0,fileIndex) + "/";
            }
        };


        return require;
    })();


    var Module = (function(){

        function Module(id,request,currentPath,rootPath){
            this._id = id;
            this._fileName = null;
            this._loaded = false;
            this._rootPath = rootPath;
            this._request = request;
            this._currentPath = currentPath;
            this._moduleName = '';
            //this._export = {};
            this.require.call(this);
            return this;
        }

        Module.prototype.require = function(path){
            this._load.call(this,path);
        };

        Module.prototype._load = function(){
            this._resolveFilePath.call(this);
        };


        Module.prototype._getFileName = function(){
            if(!this._request) return;

            var self = this;
            var getStart = function(startIndex,endIndex,str){
                var start = self._request.substring(startIndex,endIndex);
                if(start === str){
                    self._fileName = self._request.substring(endIndex,self._request.length);
                    return start;
                }

                return start;
            };

            var start = getStart(0,1,"/");
            if(this._fileName){
                this._getModuleName.call(this);
                return;
            }

            if(start === "."){
                start = getStart(0,2,"./");
                if(this._fileName){
                    this._getModuleName.call(this);
                    return;
                }

                if(start === ".."){
                    getStart(0,3,"../");
                    if(this._fileName){
                        this._getModuleName.call(this);
                        return;
                    }
                }
            }else{
                this._fileName = this._request;
                this._getModuleName.call(this);
            }

        };

        Module.prototype._getModuleName = function(){
            if(!this._fileName) return;
            this._moduleName = this._fileName;
            if(this._moduleName.indexOf(_default._defaultSuffix) != -1){
                this._moduleName = this._moduleName.slice(_default._defaultSuffix,_default._defaultSuffix.length - _default._defaultSuffix.length * 2);
            }

            if(this._moduleName.indexOf("/") != -1){
                var spts = this._moduleName.split("/");
                this._moduleName = spts[spts.length - 1];
            }
        };

        /**
         * ./ --- current dir
         * ../ --- parent dir
         * / --- root dir
         * @private
         */
        Module.prototype._resolveFilePath = function(){
            if(!this._request) return;

            //with http or https url
            if(this._request.indexOf("http:") == 0 || this._request.indexOf("https:") == 0){
                var moduleSrc = this._request;
                if(this._request.substring(this._request.length,this._request.length - 1) === "/"){
                    moduleSrc = this._request.substring(0,this._request.length - 1);
                }
                var _fileName = moduleSrc.substring(moduleSrc.lastIndexOf('/') + 1,moduleSrc.length);
                moduleSrc = moduleSrc.substring(0,moduleSrc.lastIndexOf('/') + 1);
                this._modulePath = moduleSrc;
                this._fileName = _fileName;
                this._getModuleName.call(this);
                return;
            }

            //other url
            var start = '';
            var sub = this._request.substring(0,1);
            if(sub === "/")
                start = "./";
            else
                start = this._request.substring(0,2);
            if(start === "./"){//current dir
                this._modulePath = this._currentPath || '';
            }else if(start === ".."){//parent dir
                start = this._request.substring(0,3);
                if(start === "../"){
                    var path = this._currentPath;
                    if(path.slice(-1) === "/"){
                        path = path.substring(0,path.length - 1);
                    }

                    path = path.substring(0,path.lastIndexOf("/"));
                    this._modulePath = path + '/' || '';
                }else
                    this._modulePath = this._rootPath;
            }else{//root dir
                this._modulePath = this._rootPath;
            }

            this._getFileName.call(this);
        };

        return Module;
    })();

    var Define = (function(){

        function define(dep,callback){
            this._dep = dep || [];
            this._require = new Require;
            this._getCurrentPath = this._require._getCurrentPath();//get current path
            this._getRootPath = this._require._getRootPath();//get root path
            this._callback = callback;
            this._init.call(this);
            return this;
        }

        define.prototype._init = function(){
            if(!this._dep[0]){
                var moduleName = document.currentScript && document.currentScript.id;
                if(!moduleName){
                    var moduleSrc = this._require._getCurrentScriptSrc();//get current src
                    if(moduleSrc){//reset path
                        if(moduleSrc.substring(moduleSrc.length,moduleSrc.length - 1) === "/"){
                            moduleSrc = moduleSrc.substring(0,moduleSrc.length - 1)
                        }

                        var _fileName = moduleSrc.substring(moduleSrc.lastIndexOf('/') + 1,moduleSrc.length);
                        if(_fileName.indexOf(".js")!= -1){
                            moduleName = _fileName.split(".js")[0];
                        }
                        this._getCurrentPath = moduleSrc.substring(0,moduleSrc.lastIndexOf('/') + 1);
                        this._getRootPath = this._require._getRootPath();
                        this._require._currentPath = this._getCurrentPath;
                        this._require._rootPath = this._getRootPath;
                    }
                }

                if(moduleName){
                    this._dep[0] = moduleName;
                }
            }

            this._getModule.call(this);
        };

        define.prototype._getModule = function(){
            //if module in cache,get it from cache
            var isModuleInCache = false;
            if(_default._moduleCache[this._dep[0]]){
                var _module = _default._moduleCache[this._dep[0]];
                if(_module._loaded == true){
                    if(!_module._export){
                        this._require._save.call(this._require,_module._moduleName,null,this._callback);
                    }

                    isModuleInCache = true;
                    //export cache
                    setTimeout(this._callback(this), 50);
                    return;
                }
            }

            //if not in cache,then load files.
            if(!isModuleInCache){
                var module = this._require._buildModule.call(this._require,this._dep[0]);
                var moduleName = module._moduleName;
                if(!_default._moduleCache[moduleName]) {//module have been loaded
                    _default._moduleCache[moduleName] = {
                        moduleUrl: module._modulePath + module._fileName,
                        modName: moduleName,
                        module: module
                    };
                }

                this._require._save.call(this._require,module._moduleName,null,this._callback);
            }
        };

        return define;
    })();

    window.define = function(dep,callback){
        return new Define(dep,callback);
    };

    window.require = function(deps,callback){
        return new Require(deps,callback);
    };

    require.config = function(obj){
        return require()._config(obj);
    }
})(window,document);
