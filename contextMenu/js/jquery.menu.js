/**
 * Created by tlzhang on 2015/12/9.
 */
var Controller = (function($){
    var controller = function(){};
    controller.fn = controller.prototype;

    controller.fn.proxy = function(func,obj,args,funcBef){
        if(!func) return;
        var self = this;
        return (function(){
            if(typeof funcBef === "function")
                funcBef.call(obj || self);
            return func.call(obj || self,args);
        });
    };

    controller.fn.load = function(func){
        return $(this.proxy(func));
    };

    controller.fn.include = function(obj){
        return $.extend(this,obj);
    };

    return controller;
})(jQuery);

var Map = (function (document) {

    function Map(){
        if(!(this instanceof Map)){
            return new Map();
        }

        this.container = {};
    }

    Map.prototype = function(){

        /*
         * put the key and value into container
         */
        put = function(key,value){
            try{
                var reg = /^[ ]+$/;
                if(key!=null && key!="" && !reg.test(key)){
                    this.container[key] = value;
                }

            }catch(e){
                throw new Error("Map Error:"+e.message);
            }
        };

        /*
         * get the value from Map by key
         */
        get = function(key){
            try{
                var reg = /^[ ]+$/;
                if(key!=null && key!="" && !reg.test(key)){
                    return this.container[key] == undefined ? null : this.container[key];
                }
                return null;
            }catch(e){
                throw new Error("Map Error:"+e.message);
            }
        };

        /*
         * remove from Map
         */
        remove = function(key){
            try{
                if(this.containsKey(key))
                    delete this.container[key];
            }catch(e){
                throw new Error("Map Error:"+e.message);
            }
        };

        /*
         * return all keys
         */
        keyArray = function(){
            var keys = new Array();
            for(var p in this.container){
                keys.push(p);
            }
            return keys;
        };

        /*
         * return all values
         */
        valueArray = function(){
            var values = new Array();
            var keys=this.keyArray();
            for(var i=0;i<keys.length;i++){
                values.push(this.container[keys[i]]);
            }
            return values;
        };

        /*
         * clear Map
         */
        clear = function(){
            try{
                delete this.container;
                this.container = {};
            }catch(e){
                throw new Error("Map Error:"+e.message);
            }
        };

        /*
         * judge Map is empty
         */
        isEmpty = function(){
            if(this.keyArray().length == 0)
                return true;
            else
                return false;
        };

        /*
         * the size of Map
         */
        size = function(){
            return this.keyArray().length;
        };

        return{
            put:this.put,
            get:this.get,
            remove:this.remove,
            clear:this.clear,
            isEmpty:this.isEmpty,
            size:this.size,
            keyArray:this.keyArray,
            valueArray:this.valueArray
        }
    }();

    return Map;

})(document);

(function($,document,Controller,Map){

    var Menu = (function($){
        function menu(options,obj){
            this.option = $.extend({},options || {},this._default());
            if(!this.option || !obj) return;
            this.defaultImageWidth = 25;
            this.defaultImageHeight = 25;
            this.defaultImageSrc = 'images/default.jpg';
            this._controller = new Controller();
            this._obj = obj;
            this.map = Map;
            this._getKey.call(this);//生成随机数
            this._onContextMenu(obj);
            return this;
        }

        menu.fn = menu.prototype;
        menu.extend = menu.fn.extend = $.extend;

        menu.fn.extend({

            _getKey : function(){
                var num = "";
                for(var i= 0;i < 15;i++){
                    num += Math.floor(Math.random()*10);
                }

                this._key = num;
            },

            /**
             * 获取默认属性
             * @private
             */
            _default : function(){
                return {
                    menu_box_cls:'menu_box',
                    menu_body_cls:'menu_body',
                    menu_ul_cls:'menu_ul',
                    menu_li_cls:'menu_li',
                    menu_li_a_cls:'menu_a',
                    menu_arrow_cls:'menu_triangle',
                    onContextMenu:null
                };
            },

            /**
             * 绑定对象右键菜单事件
             * @param obj
             * @private
             */
            _onContextMenu : function(obj){
                var self = this;
                $(obj).bind('contextmenu',function(e){
                    if ($(e.target).attr("data-key") == obj.attr("data-key")){
                        var _left = e.pageX;
                        var _top = e.pageY;

                        if(self._menu){
                            var _len = $("body").find('.menu_box').length;
                            if(_len > 0){
                                $("body").find('.menu_box').hide();
                            }
                            self._setMenuPosition.call(self,_left,_top);
                            self._menu.show();
                            return false;
                        }

                        var isShowContext = (!!self.option.onContextMenu) ? self.option.onContextMenu(e) : true;
                        if(isShowContext) self._showMenu.call(self,_left,_top);
                        return false;
                    }
                });

                /*$(document).bind('contextmenu',function(e){
                    if (!$(e.target).attr("data-key") || $(e.target).attr("data-key") != obj.attr("data-key")){
                        var _node = self._getMenu.call(self);
                        if(_node){
                            _node.hide();
                            return false;
                        }

                        return false;
                    }
                });*/

                $(document).on('click',function(){
                    if(self._menu)
                        self._menu.hide();
                });
            },

            _setMenuPosition : function(_left,_top){
                var _menu = this._menu;
                var top = _top,left = _left;
                if (_left + _menu.outerWidth() > $(document.body).width()) {//$(document).height() || $(window).height()
                    _left -= _menu.outerWidth();
                }

                if (_top + _menu.outerHeight() > $(document.body).height()) {
                    _top -= _menu.outerHeight();
                }

                if(_top > $(document.body).height() && $(document.body).height() > 0) _top =  $(document.body).height();
                if(_left > $(document.body).width() && $(document.body).width() > 0) _left =  $(document.body).width();

                if(_top < 0){
                    _top = top;
                }

                if(_left < 0){
                    _left = left;
                }

                this._menu.css({ 'left': _left, 'top': _top });
            },

            _getMenu : function(){
                var _node,self = this;
                var _menu_box = $("body").find(".menu_box");
                if(_menu_box.length > 0){
                    _menu_box.each(function(){
                        if($(this).attr("data-key") == self._key){
                            _node = $(this);
                            return false;
                        }
                    });
                }

                return _node;
            },

            _executeFun :function(func){
                if(typeof func !== "function") return;
                this._controller.proxy(func,this);
            },

            _createMenuLi : function(data,isChildren,i,key){
                var _menu_body_img = $('<img src="'+(data.img.src || this.defaultImageSrc)+'" width="'+(data.img.width || this.defaultImageWidth)+'" class="'+(data.img.cls || '')+'" height="'+(data.img.height || this.defaultImageHeight)+'" style="float: left">');
                var _menu_body_a = $('<a href="javascript:;" class="'+(this.option.menu_li_a_cls)+'">'+(data.text || '')+'</a>');
                var _menu_body_li = '';

                if(isChildren){
                    _menu_body_a.append($('<i class = "menu_triangle"></i>'));
                }
                if(key){
                    _menu_body_li = $('<li class="'+this.option.menu_li_cls+'" tab-index = "'+(key)+'"></li>');
                }else{
                    _menu_body_li = $('<li class="'+this.option.menu_li_cls+'" tab-index = "'+(i + 1 + "_" + this._key)+'"></li>');
                }

                var _menu_body_li_div = $('<div class="picDiv"></div>');
                _menu_body_li_div.append(_menu_body_img);
                _menu_body_li_div.append(_menu_body_a);

                _menu_body_li.append(_menu_body_li_div);
                return _menu_body_li;
            },

            _bindLiClick : function(obj,map){
                var self = this;
                obj.find('li').each(function(){
                    if($(this).hasClass(self.option.menu_li_cls)){
                        if($(this).attr('tab-index')){
                            var func = map.get($(this).attr('tab-index'));
                            if(func){
                                if(typeof func == "function"){
                                    $(this).click(self._controller.proxy(func,self,undefined,function(){
                                        obj.hide();
                                    }));
                                }
                            }
                        }
                    }
                });
            },

            _showMenu : function(_left,_top){
                if(this._getMenu.call(this)) return;

                var _menu_box = $('<div class="'+this.option.menu_box_cls+'" data-key="'+this._key+'"></div>');
                var _menu_body = $('<div class="'+this.option.menu_body_cls+'"></div>');
                var _menu_body_ul = $('<ul class="'+this.option.menu_ul_cls+'"></ul>');

                var _map = new Map();
                var _cMap = new Map();
                var _cLiHover = new Array();
                var _childrenBox = new Array();

                if(this.option.data && this.option.data.length > 0){
                    for(var i = 0,len = this.option.data.length;i < len;i++){
                        var _data = this.option.data[i];
                        if(!_data) continue;

                        if(!_data.img) _data.img = {};

                        //children
                        if(_data.children && _data.children.length > 0){
                            var _menu_box_c = $('<div class="'+this.option.menu_box_cls+'" data-key="'+(this._key + "_children_" + i)+'"></div>');
                            var _menu_body_c = $('<div class="'+this.option.menu_body_cls+'"></div>');
                            var _menu_body_ul_c = $('<ul class="'+this.option.menu_ul_cls+'"></ul>');

                            for(var j = 0,cLen = _data.children.length;j < cLen;j++){
                                var _cData = _data.children[j];
                                if(!_cData) continue;

                                if(!_cData.img) _cData.img = {};
                                var _cDataKey = this._key + "_children_" + i +"_"+ (j + 1) +"_" + this._key+"_children_" + j;
                                _menu_body_ul_c.append(this._createMenuLi.call(this,_cData,false,j,_cDataKey));

                                _cMap.put(_cDataKey,_cData.click);
                            }

                            _menu_body_c.append(_menu_body_ul_c);
                            _menu_box_c.append(_menu_body_c);
                            var _menu_body_li = this._createMenuLi.call(this,_data,true,i);
                            _menu_body_li.prepend(_menu_box_c);
                            _menu_box_c.hide();
                            _menu_body_ul.append(_menu_body_li);
                            _childrenBox.push(_menu_box_c);
                            _cLiHover.push(_menu_body_li);
                        }else{
                            _map.put( i + 1 +"_" + this._key,_data.click);
                            //_menu_body_a.click(this._executeFun.call(this,_func));
                            _menu_body_ul.append(this._createMenuLi.call(this,_data,false,i));
                        }


                    }
                }

                _menu_body.append(_menu_body_ul);
                _menu_box.append(_menu_body);

                if(!_map.isEmpty()){
                    this._bindLiClick.call(this,_menu_box,_map);
                }

                if(!_cMap.isEmpty()){
                    if(_childrenBox && _childrenBox.length > 0){
                        for(var i = 0,len = _childrenBox.length;i < len;i++){
                            this._bindLiClick.call(this,_childrenBox[i],_cMap);
                        }
                    }
                }

                //bind hover event
                if(_cLiHover && _cLiHover.length > 0){
                    for(var i = 0,len = _cLiHover.length;i < len;i++){
                        var _li = _cLiHover[i];
                        if(!_li) continue;
                        _li.hover(function(){
                            $(this).find('.menu_box').show();
                            $(this).addClass('menu_li_hover');
                        },function(){
                            $(this).find('.menu_box').hide();
                            $(this).removeClass('menu_li_hover');
                        });
                    }
                }

                var _len = $("body").find('.menu_box').length;
                if(_len > 0){
                    $("body").find('.menu_box').hide();
                }
                $("body").append(_menu_box);
                this._menu = _menu_box;
                this._setMenuPosition(_left,_top);
                /*this._menu.bind('click',function(e){
                    e.stopPropagation();
                });*/
            }

        });

        return menu;
    })($);


    $.fn.contextMenu = function(options){
        if(!options) return;
        return new Menu(options,this);
    };

})(jQuery,document,Controller,Map);
