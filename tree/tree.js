/**
 * Created by tlzhang on 2015/5/11.
 */
(function(document,undefined,$){
    var Controller = (function(){
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
    })();

    var Tree = (function(){

        var opts = {
            'folder-cls':'tree-icon folder',
            'file-cls':'tree-icon file',
            'root-id':'/_anchor',
            'elem-id':'/',
            'root-text':'root',
            'node-name':'新节点',
            'folder':'folder',
            'file':'file',
            'isExpandAll':false
        };


        var defaultMenuOptions = {
            menu_box_cls:'',
            menu_body_cls:'',
            menu_ul_cls:'',
            menu_li_cls:'',
            menu_li_a_cls:'',
            menu_arrow_cls:'',
            onContextMenu:function(){
                return true;
            },
            data:[{
                text: '新建',
                children: [{
                    text:'文件夹',

                    click:function(){
                        if(!this._obj) return;
                    }
                },{
                    text:'文件',

                    click:function(){
                        if(!this._obj) return;
                    }
                }]
            },{
                text:'重命名',

                click:function(){
                    if(!this) return;
                }
            },{
                text:'删除',

                click:function(){
                    if(!this) return;
                }
            }]
        };

        function tree(elem,options){
            if(typeof options != 'object')
                return;

            this._options = options;
            this._elem = elem;
            this._isExpandAll = this._options.isExpandAll || opts['isExpandAll'];
            this._controller = new Controller;
            this._initTree.call(this);
        }

        tree.prototype = function(){

            /**
             * create root
             */
            _createRoot = function(){
                var root = document.createElement("div");
                root.className = 'root';
                var i  = document.createElement("i");
                i.className = 'tree-icon tree-ocl';

                var a = document.createElement("a");
                a.className = 'tree-root tree-disabled';
                a.href = 'javascript:;';
                a.id = this._options['id']?this._options['id']:opts['root-id'];

                var a_i = document.createElement("i");
                a_i.className = 'tree-icon folder';
                a.appendChild(a_i);

                var a_span = document.createElement("span");
                a_span.innerHTML = this._options['text']?this._options['text']:opts['root-text'];
                a.appendChild(a_span);

                root.appendChild(i);
                root.appendChild(a);
                return root;
            };

            _createNode = function(option){
                var node = document.createElement("li");

                node.id = option['id']?option['id']:'';

                var node_i = document.createElement("i");
                node_i.className = 'tree-icon tree-ocl';

                var node_a = document.createElement("a");
                node_a.className = 'tree-anchor';
                node_a.href = 'javascript:;';

                var node_a_i = document.createElement("i");
                var clsName = option['status']?option['status']:opts['folder'];
                node_a_i.className = 'tree-icon ' + clsName;

                if(clsName === "file"){
                    if(this._isExpandAll)
                        node.className = 'tree-node tree-open tree-leaf';
                    else
                        node.className = 'tree-node tree-closed tree-leaf';
                }else{
                    if(this._isExpandAll)
                        node.className = 'tree-node tree-open';
                    else
                        node.className = 'tree-node tree-closed';
                }

                var node_a_span = document.createElement("span");
                node_a_span.innerHTML = option['text']?option['text']:opts['node-name'];

                node_a.appendChild(node_a_i);
                node_a.appendChild(node_a_span);

                node.appendChild(node_i);
                node.appendChild(node_a);
                return node;
            };

            _createGroup = function(){
                var group = document.createElement("ul");
                group.className = 'tree-children';
                if(!this._isExpandAll){
                    group.style['display'] = "none";
                }
                return group;
            };

            /**
             * create container
             */
            _createContainer = function(){
                var container = document.createElement("ul");
                container.className = 'tree-container-ul tree-children tree-striped';
                return container;
            };

            _createContainerChildren = function(){
                var containerChildren = document.createElement("li");
                if(this._isExpandAll)
                    containerChildren.className = 'tree-node tree-open tree-last';
                else
                    containerChildren.className = 'tree-node tree-closed tree-last';
                containerChildren.id = opts['elem-id'];
                return containerChildren;
            };

            _createTreeNode = function(children,group,node){
                var allNode;
                var self = this;
                var vGroup;
                var getNode = function(children,group,node){
                    for(var i = 0;i<children.length;i++){
                        if(!_isPropNull(children[i])){
                            continue;
                        }
                        var node_ = _createNode.call(self,children[i],children[i]['text']);
                        if(node){
                            if(!vGroup) vGroup = _createGroup.call(self);
                            vGroup.appendChild(node_);
                            node.appendChild(vGroup);
                            if(i === (children.length - 1)){
                                vGroup = null;
                                group = null;
                            }
                        }

                        if(!node)
                            allNode = node_;

                        if(!group){
                            group = _createGroup.call(self);
                        }

                        if(children[i]['children']){
                            getNode.call(self,children[i]['children'],group,node_);
                        }else{
                            var clsName = node_.className;
                            if(i === (children.length - 1)){
                                if(clsName.indexOf('tree-last') == -1)
                                    clsName  += " tree-last";
                            }

                            node_.className = clsName;
                            group.appendChild(allNode);
                            self.containerChildren.appendChild(group);
                            group = null;
                        }
                    }
                };

                getNode(children,group,node);
            };

            _initTree = function(){
                this._elem = this._elem.length?this._elem[0]:this._elem;
                this._elem = _initTreeProp.call(this,this._elem);
                this.container = _createContainer.call(this);
                this.containerChildren = _createContainerChildren.call(this);
                var root = _createRoot.call(this);
                this.containerChildren.appendChild(root);

                _createTreeNode.call(this,this._options['children']);

                this.container.appendChild(this.containerChildren);
                this._elem.appendChild(this.container);
                _addContextMenu.call(this);

                //set last one tree-last
                var _node = $(this._elem).find('.root').siblings("ul:last");
                if(_node){
                    var _li = _node.children("li:last").get(0);
                    if(_li){
                        if(!$(_li).hasClass('tree-last')){
                            $(_li).addClass('tree-last');
                        }
                    }
                }

                //set no children class tree-closed
                var _node = $(this._elem).find('.root').siblings("ul");
                if(_node && _node.length > 0){
                    _node.each(function(){
                        var _li = $(this).children("li:last").get(0);
                        var _ul = $(_li).children('ul');
                        var isHaveChildren = false;
                        if(_ul && _ul.length > 0){
                            if($(_ul.get(0)).find('li').length > 0){
                                isHaveChildren = true;
                            }
                        }

                        if(_li){
                            if(!isHaveChildren){
                                if($(_li).hasClass('tree-open')){
                                    $(_li).removeClass('tree-open');
                                }

                                if(!$(_li).hasClass('tree-closed')){
                                    $(_li).addClass('tree-closed');
                                }
                            }
                        }
                    });
                }

                _bindIClick.call(this);
            };

            /**
             * bind contextMenu event
             */
            _addContextMenu = function(){

                $(this._elem).bind('contextmenu',function(e){
                    e.stopPropagation();
                    return false;
                });

                $(this._elem).find('.root').siblings("ul").each(function(){
                    var a = $(this).find("a");
                    if(a.find("i").length > 0){
                        var i = a.find("i");
                        if(i.hasClass('folder')){
                            a.contextMenu(defaultMenuOptions);
                        }
                    }
                });
            };

            _bindIClick = function(){
                var self = this;
                $(this._elem).find(".tree-node").each(function(){
                    if($(this).hasClass("tree-leaf")) return true;
                    var i = $(this).children('i.tree-ocl').get(0);
                    if(!i) return true;
                    //var i = $(this).find("i.tree-ocl");
                    console.log(111);
                    $(i).bind('click',self._controller.proxy(_iClick,$(i)));
                });

                $(self._elem).find("div.root i.tree-ocl").bind('click',self._controller.proxy(_rootClick,$(self._elem).find("div.root")));
            };

            _iClick = function(){
                if($(this).siblings("ul.tree-children").is(":hidden")){
                    if($(this).closest("li.tree-node").hasClass('tree-closed')){
                        $(this).closest("li.tree-node").removeClass('tree-closed');
                        $(this).closest("li.tree-node").addClass('tree-open');
                    }
                    $(this).siblings("ul.tree-children").show();
                }else{
                    if($(this).closest("li.tree-node").hasClass('tree-open')){
                        $(this).closest("li.tree-node").removeClass('tree-open');
                        $(this).closest("li.tree-node").addClass('tree-closed');
                    }
                    $(this).siblings("ul.tree-children").hide();
                }
            };

            _rootClick = function(){
                if($(this).closest("li.tree-node").hasClass('tree-open')){
                    if($(this).closest("li.tree-node").hasClass('tree-open')){
                        $(this).closest("li.tree-node").removeClass('tree-open');
                        $(this).closest("li.tree-node").addClass('tree-closed');
                    }
                    $(this).siblings("ul.tree-children").hide();
                }else if($(this).closest("li.tree-node").hasClass('tree-closed')){
                    if($(this).closest("li.tree-node").hasClass('tree-closed')){
                        $(this).closest("li.tree-node").removeClass('tree-closed');
                        $(this).closest("li.tree-node").addClass('tree-open');
                    }
                    $(this).siblings("ul.tree-children").show();
                }

                $(this).siblings("ul.tree-children").each(function(){
                    $(this).find("li").each(function(){
                       if($(this).hasClass("tree-open")){
                           $(this).removeClass("tree-open")
                       }

                       if(!$(this).hasClass("tree-closed")){
                           $(this).addClass("tree-closed")
                       }

                        $(this).find("ul.tree-children").hide();
                    });
                });
            };

            _initTreeProp = function(elem){
                elem.className = 'tree tree-default tree-default-small';
                return elem;
            };

            _isLoadCSSStyle = function(){
                try{
                    var es = document.getElementsByTagName('link');
                    for(var i=0;i<es.length;i++)
                        if(es[i]['href'].indexOf('style.css')!=-1)
                            return true;
                    return false;
                }catch(e){
                    throw new Error("can not load " + 'style.css');
                }
            };

            /**
             * judge object is or not null.
             * @param object
             */
            _isPropNull = function(object){
                if(typeof object === "object" && !(object instanceof Array)){
                    var hasProp = false;
                    for(var prop in object){
                        hasProp = true;
                        break;
                    }

                    if(hasProp){
                        return true;
                    }else{
                        return false;
                    }
                }

                return false;
            };

            return{
                _initTree:this._initTree
            };
        }();

        return tree;

    })(window,document,undefined,jQuery);

    $.fn.tree = function(options){
        if(!options) return;
        return new Tree(this,options);
    }

})(document,undefined,jQuery);

