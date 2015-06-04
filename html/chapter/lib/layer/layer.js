/**
 * Created by tlzhang on 2015/6/4.
 */
(function(window,document,undefined,Util,Canvas){
    function Layer(elem){
        this._init.call(this,elem);
    }

    Layer.prototype._init = function(elem){
        var style = elem.style;
        var size = new Util.Size(parseInt(style.width), parseInt(style.height));
        this.size = size;
        this.elem = elem;
        this.scale = new Scale(this);
        this.drag = new Drag(this);
        this.maxBounds = new Util.Bounds(-size.w / 2, -size.h / 2, size.w / 2, size.h / 2);
        this.bounds = new Util.Bounds(-size.w / 2, -size.h / 2, size.w / 2, size.h / 2);
        this.center = this.bounds.getCenter();
        this.zoom = 100;
        this.getRes();
        this.vectors = {};
        this.vectorsCount = 0;//加入矢量图形的总个数。
        this.renderer = new Canvas(this);
    };

    /**
     * 当前zoom下每像素代表的单位长度
     */
    Layer.prototype.getRes = function(){
        this.res = 1 / (this.zoom / 100);
        return this.res;
    };

    Layer.prototype.getResFromZoom = function(zoom) {
        return res = 1 / (zoom / 100);
    };

    /**
     * add vectors
     * @param vectors
     */
    Layer.prototype.addVectors = function (vectors) {
        this.renderer.lock = true;
        for(var i = 0, len = vectors.length; i < len; i++) {
            if(i == len-1) {this.renderer.lock = false;}
            this.vectors[vectors[i].id] = vectors[i];
            this.drawVector(vectors[i]);
        }
        this.vectorsCount += vectors.length;
    };

    /**
     * draw vector
     * @param vector
     */
    Layer.prototype.drawVector = function (vector) {
        var style;
        if(!vector.style) {
            style = new Util.defaultStyle();
        } else {
            style = vector.style;
        }
        this.renderer.drawGeometry(vector.geometry, style);
    };

    /**
     * move
     * @param zoom
     * @param center
     */
    Layer.prototype.moveTo = function (zoom, center) {
        if(zoom <= 0) {
            return;
        }
        this.zoom = zoom;
        this.center = center;
        var res = this.getRes();
        var width = this.size.w * res;
        var height = this.size.h * res;
        //获取新的视图范围。
        var bounds = new Util.Bounds(center.x - width/2, center.y - height/2, center.x + width/2, center.y + height/2);
        this.bounds = bounds;
        //记录已经绘制vector的个数
        var index = 0;
        this.renderer.lock = true;
        for(var id in this.vectors){
            index++;
            if(index == this.vectorsCount) {
                this.renderer.lock = false;
            }
            this.drawVector(this.vectors[id]);
        }
    };

    /**
     * 通过屏幕坐标设定center
     * @param px
     * @returns {Util.Position}
     */
    Layer.prototype.getPositionFromPx = function (px) {
        return new Util.Position((px.x + this.bounds.left / this.res) * this.res,
            (this.bounds.top/this.res - px.y) * this.res);
    };

    window.Layer = Layer;

})(window,document,undefined,Util,Canvas);
