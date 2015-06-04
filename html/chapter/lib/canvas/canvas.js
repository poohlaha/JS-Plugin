
/**
 * Created by tlzhang on 2015/6/4.
 */
var Canvas = (function(window,document,undefined){

    function Canvas(layer){
        try{
            this.canvas = document.createElement('canvas');
            this.context = this.canvas.getContext('2d');
        }catch(e){
            throw new Error('Your Browser Can Not Support Html5.');
        }

        this.lock = true;//只有当lock为false的时候才会执行绘制。
        this.layer = layer;
        this.setSize(layer.size);
        this.geometrys = {};
        layer.elem.appendChild(this.canvas);
    }

    /**
     * 设置
     * @param size
     */
    Canvas.prototype.setSize = function(size){
        this.canvas.width = size.w;
        this.canvas.height = size.h;
        this.canvas.style.width = size.w + "px";
        this.canvas.style.height = size.h + "px";
    };

    /**
     * 收集所有需要绘制的矢量元素
     * @param geometry
     * @param style
     */
    Canvas.prototype.drawGeometry = function(geometry, style){
        this.geometrys[geometry.id] = [geometry, style];
        //如果渲染器没有被锁定则可以进行重绘。
        if(!this.lock){
            this.reDraw();
        }
    };

    /**
     * 每次绘制都是全部清除，全部重绘
     * 加入快照后可以大大提高性能
     */
    Canvas.prototype.reDraw = function(){
        this.context.clearRect(0, 0, this.layer.size.w, this.layer.size.h);
        var geometry,style;
        if(!this.lock){
            for(var id in this.geometrys){
                if(this.geometrys.hasOwnProperty(id)){
                    geometry = this.geometrys[id][0];
                    style = this.geometrys[id][1];
                    this.draw(geometry, style, geometry.id);
                }
            }
        }
    };

    /**
     * 每一个矢量元素的绘制
     * @param geometry
     * @param style
     * @param id
     */
    Canvas.prototype.draw = function(geometry, style, id){
        if(geometry.geoType == "Circle") {
            this.drawCircle(geometry, style, id);
        }

        if(geometry.geoType == "Point") {
            this.drawPoint(geometry, style, id);
        }

        if(geometry.geoType == "Rectangle") {
            this.drawRectangle(geometry, style, id);
        }

    };

    Canvas.prototype.drawRectangle = function(geometry, style, id){
       // var pt = this.getLocalXY(geometry);
        //填充
        if(style.fill) {
            this.setCanvasStyle("fill", style);
            this.context.beginPath();
            this.context.linewidth=10;
            this.context.fillRect(geometry.x1,geometry.y1,geometry.x2,geometry.y2);
        }
        //描边
        if(style.stroke) {
            this.setCanvasStyle("stroke", style);
            this.context.beginPath();
            this.context.linewidth=10;
            this.context.strokeRect(geometry.x1,geometry.y1,geometry.x2,geometry.y2);
        }
        this.setCanvasStyle("reset");
    };

    /**
     * 针对点的绘制方法
     * @param geometry
     * @param style
     * @param id
     */
    Canvas.prototype.drawPoint = function(geometry, style, id){
        var radius = style.pointRadius;
        var twoPi = Math.PI*2;
        var pt = this.getLocalXY(geometry);
        //填充
        if(style.fill) {
            this.setCanvasStyle("fill", style);
            this.context.beginPath();
            this.context.arc(pt.x, pt.y, radius, 0, twoPi, true);
            this.context.fill();
        }
        //描边
        if(style.stroke) {
            this.setCanvasStyle("stroke", style);
            this.context.beginPath();
            this.context.arc(pt.x, pt.y, radius, 0, twoPi, true);
            this.context.stroke();
        }
        this.setCanvasStyle("reset");
    };

    /**
     * 针对圆的绘制方法。
     * @param geometry
     * @param style
     * @param id
     */
    Canvas.prototype.drawCircle = function(geometry, style, id){
        var radius = geometry.radius;
        var twoPi = Math.PI*2;
        var pt = this.getLocalXY(geometry);
        //填充
        if(style.fill) {
            this.setCanvasStyle("fill", style);
            this.context.beginPath();
            this.context.arc(pt.x, pt.y, radius / this.layer.res, 0, twoPi, true);
            this.context.fill();
        }
        //描边
        if(style.stroke) {
            this.setCanvasStyle("stroke", style);
            this.context.beginPath();
            this.context.arc(pt.x, pt.y, radius / this.layer.res, 0, twoPi, true);
            this.context.stroke();
        }
        this.setCanvasStyle("reset");
    };

    /**
     * 设置canvas的样式
     * @param type
     * @param style
     */
    Canvas.prototype.setCanvasStyle = function(type, style) {
        if (type === "fill") {
            this.context.globalAlpha = style['fillOpacity'];
            this.context.fillStyle = style['fillColor'];
        } else if (type === "stroke") {
            this.context.globalAlpha = style['strokeOpacity'];
            this.context.strokeStyle = style['strokeColor'];
            this.context.lineWidth = style['strokeWidth'];
        } else {
            this.context.globalAlpha = 0;
            this.context.lineWidth = 1;
        }
    };

    /**
     * 获得一个点的屏幕显示位置
     * @param point
     * @returns {{x: number, y: number}}
     */
    Canvas.prototype.getLocalXY = function(point) {
        var resolution = this.layer.getRes();
        var extent = this.layer.bounds;
        var x = (point.x / resolution + (-extent.left / resolution));
        var y = ((extent.top / resolution) - point.y / resolution);
        return {x: x, y: y};
    };


    /**
     * 获取鼠标在Canvas的坐标
     * @param canvas
     * @param x
     * @param y
     * @returns {{x: number, y: number}}
     */
    Canvas.prototype.getPointOnCanvas = function(x, y){
        var bbox = this.canvas.getBoundingClientRect();
        return {
            x: x - bbox.left * (this.canvas.width / bbox.width),
            y: y - bbox.top  * (this.canvas.height / bbox.height)
        };
    };

    return Canvas;
})(window,document,undefined);
