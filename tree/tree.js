/**
 * Created by tlzhang on 2015/5/11.
 */
(function(){

    var opts = {
        'folder-cls':'tree-icon folder',
        'file-cls':'tree-icon file',
        'root-id':'/_anchor',
        'elem-id':'/',
        'root-text':'root',
        'node-name':'新节点'
    };


    function tree(elem,options){
        if(typeof options != 'object')
            return;

        this.options = options;
        this.elem = elem;
        this.initTree.call(this);
    }

    tree.prototype = function(){

        /**
         * create root
         */
        createRoot = function(){
            var root = document.createElement("div");
            var i  = document.createElement("i");
            i.className = 'tree-icon tree-ocl';

            var a = document.createElement("a");
            a.className = 'tree-root tree-disabled';
            a.href = '#';
            a.id = this.options['id']?this.options['id']:opts['root-id'];

            var a_i = document.createElement("i");
            a_i.className = 'tree-icon folder';
            a.appendChild(a_i);

            var a_span = document.createElement("span");
            a_span.innerHTML = this.options['text']?this.options['text']:opts['root-text'];
            a.appendChild(a_span);

            root.appendChild(i);
            root.appendChild(a);
            return root;
        };

        createNode = function(option){
            var node = document.createElement("li");
            node.className = 'tree-node tree-closed';
            node.id = option['id']?option['id']:'';

            var node_i = document.createElement("i");
            node_i.className = 'tree-icon tree-ocl';

            var node_a = document.createElement("a");
            node_a.className = 'tree-anchor';
            node_a.href = '#';

            var node_a_i = document.createElement("i");
            node_a_i.className = 'tree-icon folder';

            var node_a_span = document.createElement("span");
            node_a_span.innerHTML = option['text']?option['text']:opts['node-name'];

            node_a.appendChild(node_a_i);
            node_a.appendChild(node_a_span);

            node.appendChild(node_i);
            node.appendChild(node_a);
            return node;
        };

        createGroup = function(){
            var group = document.createElement("ul");
            group.className = 'tree-children';
            return group;
        };

        /**
         * create container
         */
        createContainer = function(){
            var container = document.createElement("ul");
            container.className = 'tree-container-ul tree-children tree-striped';
            return container;
        };

        createContainerChildren = function(){
            var containerChildren = document.createElement("li");
            containerChildren.className = 'tree-node tree-open tree-last';
            containerChildren.id = opts['elem-id'];
            return containerChildren;
        };

        createTreeNode = function(children,group,node){
            var allNode;
            var self = this;
            var getNode = function(children,group,node){
                for(var i = 0;i<children.length;i++){
                    var node_ = createNode.call(self,children[i],children[i]['text']);
                    if(node){
                        node.appendChild(node_);
                    }

                    if(!node)
                        allNode = node_;

                    if(!group){
                        group = createGroup.call(self);
                    }

                    if(children[i]['children']){
                        getNode.call(self,children[i]['children'],group,node_);
                    }else{
                        group.appendChild(allNode);
                        self.containerChildren.appendChild(group);
                        group = undefined;
                    }
                }
            };

            getNode(children,group,node);
        };

        initTree = function(){
            this.elem = this.elem.length?this.elem[0]:this.elem;
            this.elem = initTreeProp.call(this,this.elem);
            this.container = createContainer.call(this);
            this.containerChildren = createContainerChildren.call(this);
            var root = createRoot.call(this);
            this.containerChildren.appendChild(root);

            createTreeNode.call(this,this.options['children']);

            this.container.appendChild(this.containerChildren);
            this.elem.appendChild(this.container);
        };

        initTreeProp = function(elem){
            elem.className = 'tree tree-default tree-default-small';
            return elem;
        };

        isLoadCSSStyle = function(){
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

        return{
            initTree:this.initTree
        };
    }();

    function createTree(elem,options){
        return new tree(elem,options);
    }

    window.tree = createTree;

})(window,document,undefined);