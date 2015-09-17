/**
 * Created by tlzhang on 2015/9/15.
 */
(function(window,document){

    function drawPic(x1,y1,x2,y2){
        if(!x1 || !y1 || !x1 || !y2) return undefined;
        this.useSVG = this.judgeIsIE();
        this.x1 = x1;this.y1 = y1;this.x2 = x2;this.y2 = y2;
        return this.draw.call(this);
    }

    drawPic.prototype.judgeIsIE = function(){
        if (navigator.userAgent.indexOf("MSIE 8.0")>0
            || navigator.userAgent.indexOf("MSIE 7.0")>0
            || navigator.userAgent.indexOf("MSIE 6.0")>0)
           return false;
        else
           return true;
    };

    drawPic.prototype.draw = function(){
        if(this.useSVG){
            var _svg = new svg(this.x1,this.y1,this.x2,this.y2);
            return _svg.svgNode;
        }else{
            var _vml = new vml(this.x1,this.y1,this.x2,this.y2);
            return _vml.lineNode;
        }
    };

    var svg = (function(document){
        function draw(x1,y1,x2,y2){
            if(!x1 || !y1 || !x2 ||!y2) return;
            this.init.call(this,x1,y1,x2,y2);
            this.createSvg.call(this);
        }

        draw.prototype.init = function(x1,y1,x2,y2){
            this.fromPoint = x1 + "," + y1;
            this.toPoint = x2 + "," + y2;
            var width;
            var marginLeft;
            if(parseInt(x1) <  parseInt(x2)){
                width = x2 - x1;
            }else{
                width = x1 - x2;
            }

            /*var height;
            var marginTop;
            if(parseInt(y1) < parseInt(y2)){
                height = y2 - y1;
            }else{
                height = y1 - y2;
            }*/

            this.svgWidth = '100%';
            this.svgHeight = '600px';
            this.x1 = x1;this.y1 = y1;this.x2 = x2;this.y2 = y2;
        };

        /**
         * 创建svg
         */
        draw.prototype.createSvg = function(){
            this.createSvgAndDefs.call(this);
            this.drawLine.call(this,"arrow");
            if(!this.svgNode) return;
            if(this.gNode){
                this.svgNode.appendChild(this.gNode);
            }
        };

        /**
         * 画箭头
         * @param id
         * @param color
         * @returns {HTMLElement}
         */
        draw.prototype.createSvgMarker = function(id,color){
            var m = document.createElementNS("http://www.w3.org/2000/svg","marker");
            m.setAttribute("id",id);
            m.setAttribute("viewBox","0 0 6 6");
            m.setAttribute("refX","5");
            m.setAttribute("refY","3");
            m.setAttribute("markerUnits","strokeWidth");
            m.setAttribute("markerWidth","6");
            m.setAttribute("markerHeight","6");
            m.setAttribute("orient","auto");

            var path = document.createElementNS("http://www.w3.org/2000/svg","path");
            path.setAttribute("d","M 0 0 L 6 3 L 0 6 z");
            path.setAttribute("fill",color);
            path.setAttribute("stroke-width","0");
            m.appendChild(path);
            return m;
        };

        /**
         * 创建defs
         * @returns {HTMLElement}
         */
        draw.prototype.createSvgAndDefs = function(){
            var svgNode = document.getElementsByTagName('svg');
            if(!svgNode || svgNode.length <= 0){
                svgNode = document.createElementNS("http://www.w3.org/2000/svg","svg");//可创建带有指定命名空间的元素节点
                var defsNode = document.createElementNS("http://www.w3.org/2000/svg","defs");
                defsNode.appendChild(this.createSvgMarker("arrow","#15428B"));
                svgNode.appendChild(defsNode);
            }
            else
                svgNode = svgNode[0];
            var style = 'width:' + this.svgWidth + ';height:' + this.svgHeight;
            svgNode.setAttribute("style",style);
            this.svgNode = svgNode;
        };

        /**
         * 画线
         * @param arrowId
         * @param id
         * @returns {*}
         */
        draw.prototype.drawLine = function (arrowId,id) {
            if(!arrowId) return '';
            var gNode = document.createElementNS("http://www.w3.org/2000/svg","g");
            if(id)
                gNode.setAttribute("id",id);
            gNode.setAttribute("from",this.fromPoint);
            gNode.setAttribute("to",this.toPoint);
            gNode.setAttribute("style","cursor: pointer;");

            var path = document.createElementNS("http://www.w3.org/2000/svg","path");
            var d = 'M ' + this.x1 + ' ' + this.y1 + ' L ' + this.x2 + ' ' + this.y2 ;
            path.setAttribute("d",d);
            path.setAttribute("stroke-width","1.4");
            path.setAttribute("stroke-linecap","round");
            path.setAttribute("fill","none");
            path.setAttribute("stroke","#5068AE");
            path.setAttribute("marker-end","url(#"+arrowId+")");
            gNode.appendChild(path);
            this.gNode = gNode;
        };

        return draw;
    })(document);

    var vml = (function(document){
        function draw(x1,y1,x2,y2){
            if(!x1 || !y1 || !x2 ||!y2) return;
            this.fromPoint = x1 + "," + y1;
            this.toPoint = x2 + "," + y2;
            this.drawLine.call(this);
        }

        draw.prototype.drawLine = function(){
            var lineNode = document.createElement("v:line");
            lineNode.style['position'] = 'absolute';
            lineNode.setAttribute('from',this.fromPoint);
            lineNode.setAttribute('to',this.toPoint);
            lineNode.setAttribute('stroke','black');
            this.lineNode = lineNode;
        };

        return draw;
    })(document);

    window.draw = drawPic;
})(window,document);
