/**
 * Created by tlzhang on 2015/6/4.
 */
var Rectangle = (function(){
    function Rectangle(x1,y1,x2,y2){
        Geometry.apply(this, arguments);
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }

    Rectangle.prototype = new Geometry();
    Rectangle.prototype.x1 = null;
    Rectangle.prototype.y1 = null;
    Rectangle.prototype.x2 = null;
    Rectangle.prototype.y2 = null;

    Rectangle.prototype.getBounds = function () {
        if(!this.bounds) {
            var x1 = this.x1;
            var y1 = this.y1;
            var x2 = this.x2;
            var y2 = this.y2
            this.bounds = new Util.Bounds(x1, y1, x2, y2);
            return this.bounds;
        } else {
            return this.bounds;
        }
    };

    Rectangle.prototype.clone = function () {
        return new Rectangle(this.x, this.y,this.w,this.h);
    };

    Rectangle.prototype.geoType = "Rectangle";
    return Rectangle;
})();
