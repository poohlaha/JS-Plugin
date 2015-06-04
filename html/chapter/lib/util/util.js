/**
 * Created by tlzhang on 2015/6/4.
 */
var Util = (function(window){
    var Util = {};

    Util.lastId = 0;

    /**
     * 获取Id
     * @param str
     * @returns {*}
     */
    Util.getId = function(str){
        Util.lastId += 1;
        return str + Util.lastId;
    };

    /**
     * 图形的范围
     * @param x1
     * @param y1
     * @param x2
     * @param y2
     * @constructor
     */
    Util.Bounds = function(x1,y1,x2,y2){
        this.leftBottom = new Util.Position(x1, y1);
        this.rigthTop = new Util.Position(x2, y2);
        this.leftTop = new Util.Position(x1, y2);
        this.rightBottom = new Util.Position(x2, y1);
        this.left = x1;
        this.right = x2;
        this.bottom = y1;
        this.top = y2;
    };

    /**
     * 获取图形中心点
     * @returns {Util.Position}
     */
    Util.Bounds.prototype.getCenter = function (){
        var w = this.right - this.left;
        var h = this.top - this.bottom;
        return new Util.Position(this.left + w/2, this.bottom + h/2);
    };

    /**
     * 位置
     * @param x
     * @param y
     * @constructor
     */
    Util.Position = function(x,y){
        this.x = x;
        this.y = y;
    };

    /**
     * 大小
     * @param w
     * @param h
     * @constructor
     */
    Util.Size = function(w,h){
        this.w = w;
        this.h = h;
    };

    Util.defaultStyle = function(){
        this.fill = true;
        this.stroke = true;
        this.pointRadius = 5;
        this.fillOpacity = 0.6;
        this.strokeOpacity = 1;
        this.fillColor = "red";
        this.strokeColor = "black";
    };

    /**
     * 保存时间的this
     * @param func
     * @param object
     * @returns {Function}
     */
    Util.bindAsEventListener = function(func, object) {
        return function(event) {
            return func.call(object, event || window.event);
        };
    };

    /**
     * 阻止事件冒泡
     * @param e
     */
    Util.stopEventBubble = function(e) {
        if (e.preventDefault) {
            e.preventDefault();
        } else {
            e.returnValue = false;
        }

        if (e && e.stopPropagation)
            e.stopPropagation();
        else
            window.event.cancelBubble=true;
    };

    Util.Vector = function(geometry, attributes) {
        this.id = Util.getId("vector");
        this.geometry = geometry;
        if(attributes) {
            this.attributes = attributes;
        }
    };

    return Util;
})(window);
