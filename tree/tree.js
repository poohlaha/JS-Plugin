/**
 * Created by tlzhang on 2015/5/11.
 */
(function(){

    var opts = {

    };

    var root = {
      "root":{
          'url':'',
          'icon':'',
          'cls':'',
          'children':[
              {

              },
              {

              }
          ]
      }
    };

    function tree(elem){
        this.initTree.call(this,elem);
    }

    tree.prototype = function(){

        /**
         * create root
         */
        createRoot = function(rootName){
            var root = document.createElement("div");
            var i  = document.createElement("i");
            i.className = 'tree-icon tree-ocl';

            var a = document.createElement("a");
            a.className = 'tree-root  tree-disabled';
            a.href = '#';
            a.id = '/_anchor';

            var a_i = document.createElement("i");
            a_i.className = 'tree-icon folder';
            a.appendChild(a_i);

            var a_span = document.createElement("span");
            a_span.innerHTML = rootName?rootName:'root';
            a.appendChild(a_span);

            root.appendChild(i);
            root.appendChild(a);
            return root;
        };

        createNode = function(nodeName){
            var node = document.createElement("li");
            node.className = 'tree-node tree-closed';
            node.id = '';

            var node_i = document.createElement("i");
            node_i.className = 'tree-icon tree-ocl';

            var node_a = document.createElement("a");
            node_a.className = 'tree-anchor';
            node_a.href = '#';

            var node_a_i = document.createElement("i");
            node_a_i.className = 'tree-icon folder';

            var node_a_span = document.createElement("span");
            node_a_span.innerHTML = nodeName;

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
            containerChildren.className = 'tree-node  tree-open tree-last';
            containerChildren.id = '/';
            return containerChildren;
        };

        initTree = function(elem){
            elem = elem.length?elem[0]:elem;
            elem = initTreeProp(elem);
            var container = createContainer();
            var containerChildren = createContainerChildren();
            var root = createRoot();
            var node1 = createNode("Node1");

            containerChildren.appendChild(root);
            containerChildren.appendChild(node1);


            container.appendChild(containerChildren);
            elem.appendChild(container);
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

    function createTree(elem){
        return new tree(elem);
    }

    window.tree = createTree;

})(window,document,undefined);