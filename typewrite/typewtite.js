(function(window,document,undefined){
   // 'use strict';

    var Util = {
        defaultProperties : {
            time :100,
            sounds:'http://10010.wxmain.sinaapp.com/sounds/renxi.mp3',
            isPlaySounds:true,

            flash:{
                flashvars:{},
                params:{
                    wmode: "transparent"
                },
                attributes:{},
                id:'sounds',
                width:'1',
                height:'1',
                version:'9.0.0',
                soundSwf:'sound.swf',
                expressInstall:'http://10010.wxmain.sinaapp.com/swf/expressInstall.swf',
                swfObject:'http://10010.wxmain.sinaapp.com/js/swfobject.js',
                variable:'f',
                gotoFrame:1
            }
        },

        validate : function(args){
            try{
                if(args.length == 0){
                    return;
                }

                var object = args[0];
                if(object.length)
                    object = object[0];

                var options = args[1];
                var option = Util.extend(Util.defaultProperties,options);
                return option;
            }catch(e){
                throw new Error(e.message);
            }
        },

        validateNotSupportArgs : function(option){
            try{
                var reg = /^[ ]+$/;
                if(option.isPlaySounds){
                    if(!option.flash.soundSwf || option.flash.soundSwf == '' || reg.test(option.flash.soundSwf)){
                        throw new Error("Please include sound.swf");
                    }else{
                        var prev = option.flash.soundSwf.substring(0,4);
                        if(prev === 'http'){
                            throw new Error("sound.swf can not be loaded from server.")
                        }
                    }
                }
            }catch(e){
                throw new Error(e.message);
            }
        },

        judgeSupportHTML5 : function(){
            try{
                if(typeof(Worker) !== "undefined") {
                    return true;
                }else{
                    return false;
                }
            }catch(e){
                return false;
            }
        },

        extend : function(target,source){
            if(!target && source)
                return source;

            if(target && !source){
                return target;
            }

            for(var src in source){
                if(source.hasOwnProperty(src)){
                    if(typeof source[src]==="object"){//target[src] = typeof source[src]==="object"? extend(source[src]): source[key];
                        extend(target[src],source[src])
                    }else{
                        target[src] = source[src];
                    }
                }

            }

            return target;
        },

        each : function(object,callback){
            var name,i=0,length = object.length;
            var isObj = this.isFunc(object);
            if ( isObj ) {
                for ( name in object ) {
                    if ( callback.call( object[ name ], name, object[ name ] ) === false ) {
                        break;
                    }
                }
            } else {
                for(; i<length;){
                    if(callback.call(object[i], i, object[i++]) === false)
                        break;
                }
            }
        },

        isFunc : function(fn){
            return typeof fn == 'function';
        },

        arrs:new Array(),
        html:'',
        head:document.head || document.getElementsByTagName('head')[0],
        names:{
            'swfobj':'swfobject.js'
        },
        isHtml5Support:false
    };

    function typeWrite(){
        typewrite.prototype.constructor(arguments);
    }

    function  typewrite(){}

    typewrite.prototype = function(){
        initTypeWrite = function(args){
            var options = Util.validate(args);
            var object = args[0];
            Util.html = object.innerHTML;
            object.innerHTML = '';
            if(Util.judgeSupportHTML5()){
                html5Handle.init(options);
                Util.isHtml5Support = true;
                return inputTypewrite(object,options);
            }else{
                Util.validateNotSupportArgs(options);
                soundsHandle.includeSwfObject(options.flash.id,options,object);
            }
        };

        inputTypewrite = function(obj,option){
            var $ele = obj,str = Util.html,progress = 0;
            $ele.innerHTML = '';
            if(str.length == 0)
                return;

            if(option.isPlaySounds && !Util.isHtml5Support)
                soundsHandle.playSounds(option);
            else if(option.isPlaySounds && Util.isHtml5Support)
                html5Handle.playSounds(option.flash.id);

            var timer = setInterval(function() {
                var current = str.substr(progress, 1);
                if (current == '<') {
                    progress = str.indexOf('>', progress) + 1;
                } else {
                    progress++;
                }

                $ele.innerHTML = str.substring(0, progress) + (progress & 1 ? '_' : '');
                if (progress >= str.length) {
                    var len = $ele.innerHTML.length;
                    if(len > str.length){
                        $ele.innerHTML = str.substring(0, str.length-1);
                    }

                    clearInterval(timer);

                    //if(option.isPlaySounds && !Util.isHtml5Support)
                       // soundsHandle.stopSounds(option.flash.id);
                   // else if(option.isPlaySounds && Util.isHtml5Support)
                        //html5Handle.stopSounds(option.flash.id);
                }
            }, option.time?option.time:Util.defaultProperties.time);

            return obj;
        };

        return {
            inputTypewrite:this.inputTypewrite
        };
    }();

   typewrite.prototype.constructor = this.initTypeWrite;

   var soundsHandle = {
       initSwf : function(options){
           try{
               this.isLoadSoundsDiv(options.flash.id);
               swfobject.embedSWF(options.flash.soundSwf, options.flash.id, options.flash.width, options.flash.height, options.flash.version,
                   options.flash.expressInstall, options.flash.flashvars, options.flash.params, options.flash.attributes);
           }catch(e){
               throw new Error(e.message);
           }
       },

       isIE : function(){
           return (document.all && window.ActiveXObject && !window.opera) ? true : false;
       },

       isLoadSoundsDiv : function(id){
            try{
                var div = document.getElementById(id);
                if(!div){
                    this.removeObjectTag();
                    div = document.createElement("div");
                    div.setAttribute("id",id);
                    div.setAttribute("style","display:none");
                    document.body.appendChild(div);
                }
            }catch(e){
                throw new Error(e.message);
            }
        },

        removeObjectTag : function(){
            try{
                var obj = document.getElementsByTagName("object");
                if(obj){
                    for(var i =0;i<obj.length;i++){
                        document.body.removeChild(obj[i]);
                    }
                }
            }catch(e){
                throw new Error(e.message);
            }
        },

        playSounds : function(options){
            try{
                var sound = swfobject.getObjectById(options.flash.id);
                if (sound) {
                    sound.SetVariable(options.flash.variable, options.sounds);
                    sound.GotoFrame(options.flash.gotoFrame);
                }
            }catch(e){
                throw new Error(e.message);
            }
        },

       includeSwfObject : function(id,options,object){
           try{
               if(!options.isPlaySounds){
                   return typewrite.prototype.inputTypewrite(object,options);
               }

               if(!this.isLoadFile(Util.names['swfobj'])){
                   var self = this;
                   var swfObj = document.createElement('script');
                   swfObj.setAttribute("type","text/javascript");
                   swfObj.setAttribute("src",options.flash.swfObject);
                   if(swfObj.readyState){//IE
                       swfObj.onreadystatechange = function () {
                           if (swfObj.readyState == "loaded" || swfObj.readyState == "complete"){
                               swfObj.onreadystatechange = null;
                               this.onload = this.onreadystatechange = null;
                               this.parentNode.removeChild(this);
                               self.initSwf(options);
                               self.startInterval(id,options,object);
                           }
                       }
                   }else{
                       swfObj.onload = function () {
                           this.onload = this.onreadystatechange = null;
                           this.parentNode.removeChild(this);
                           self.initSwf(options);
                           self.startInterval(id,options,object);
                       }
                   }
                   Util.head.appendChild(swfObj);
                   
               }else{
                   this.initSwf(options);
                   this.startInterval(id,options,object);
               }
           }catch(e){
               throw new Error(e.message);
           }
       },

        startInterval : function(id,options,object){
            var self = this;
            var sleeper=setInterval(function(){
                self.sleep(swfobject.getObjectById(options.flash.id),options,object)
            },1000);
            Util.arrs.push(sleeper);
        },

        sleep : function(swfObj,options,object){
            if(swfObj){
                for(var i=0;i<Util.arrs.length;i++){
                    if(Util.arrs[i]){
                        clearInterval(Util.arrs[i]);
                    }
                }

                return typewrite.prototype.inputTypewrite(object,options);
            }
        },

        stopSounds : function(id){
            swfobject.removeSWF(id);
        },

        isLoadFile :function(name){
            try{
                var js= /js$/i.test(name);
                var es=document.getElementsByTagName(js?'script':'link');
                for(var i=0;i<es.length;i++)
                    if(es[i][js?'src':'href'].indexOf(name)!=-1)return true;
                return false;
            }catch(e){
                throw new Error(e.message);
            }
        },

        loadSoundSwfFile:function(id,options,object){
            var reg = /^[ ]+$/;
            if(!options.flash.soundSwf || options.flash.soundSwf == '' || reg.test(options.flash.soundSwf)){
                var self = this;
                fileHandle.loadFile(options.flash.soundSwf,'GET',false,function(){
                    self.includeSwfObject(id,options,object);
                });
            }else{
                var prev = options.flash.soundSwf.substring(0,4);
                if(prev === 'http'){
                    var self = this;
                    fileHandle.loadFile(options.flash.soundSwf,'GET',false,function(){
                        self.includeSwfObject(id,options,object);
                    });
                }else
                    this.includeSwfObject(id,options,object);
            }

        }
   };

   var html5Handle = {
       init:function(options){
           if(options.isPlaySounds){
               this.removeHTML5Tag();
               this.createHtml5Play(options);
           }
       },

       createHtml5Play:function(options){
           var audioTag = document.createElement("audio");
           audioTag.setAttribute("id",options.flash.id);
           audioTag.setAttribute("src",options.sounds);
           audioTag.setAttribute("controls","controls");
           //audioTag.setAttribute("loop","loop");
           audioTag.setAttribute("hidden","true");
           document.body.appendChild(audioTag);
       },

       removeHTML5Tag : function(){
           try{
               var obj = document.getElementsByTagName("audio");
               if(obj){
                   for(var i =0;i<obj.length;i++){
                       document.body.removeChild(obj[i]);
                   }
               }
           }catch(e){
               throw new Error(e.message);
           }
       },

       playSounds:function(id){
           var auto = document.getElementById(id);
           if(auto){
               auto.play();
           }
       },

       stopSounds:function(id){
           var auto = document.getElementById(id);
           if(auto){
               auto.pause();
               this.removeHTML5Tag();
           }
       }
   };

   var fileHandle = {
       getBrowserRequest:function(){
           try{
               var xmlHttp;
               if (window.XMLHttpRequest){// code for IE7+, Firefox, Chrome, Opera, Safari
                   xmlHttp=new XMLHttpRequest();
                   //有些版本的Mozilla浏览器处理服务器返回的未包含XML mime-type头部信息的内容时会出错。
                   //因此，要确保返回的内容包含text/xml信息
                   if (xmlHttp.overrideMimeType) {
                       xmlHttp.overrideMimeType("text/xml");
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
           }catch(e){
               throw new Error(e.message);
           }
       },

       loadFile:function(url,type,asynchronous,callback){
           var xmlHttp = this.getBrowserRequest();
           xmlHttp.open(type, url,asynchronous);
           xmlHttp.onreadystatechange = function(){
               if(xmlHttp.readyState == 4){
                   if ( ( xmlHttp.status === 200 ) || ( ( xmlHttp.status === 0 ) && xmlHttp.responseText ) ) {
                       callback();
                   }else{
                       throw new Error(xmlHttp.statusText);
                   }
               }
           };

           xmlHttp.send(null);
       },

       setCache:function(key,value){
           try{
               return localStorage.setItem(key,value);
           }catch(e){
               throw new Error(e.message);
           }
       }

   };

    window.typewrite = typeWrite;
})(window,document,undefined);

