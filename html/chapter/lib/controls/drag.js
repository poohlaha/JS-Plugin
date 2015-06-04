/**
 * Created by tlzhang on 2015/6/4.
 */
var Drag = (function(){
    function Drag(layer) {
        this.layer = layer;
        this.elem = layer.elem;
        this.active();
        this.dragging = false;
    }

    Drag.prototype.startPan = function(e) {
        this.dragging = true;
        //在一开始保存点击的位置。
        this.lastX = (e.offsetX || e.layerX);
        this.lastY = (e.offsetY || e.layerY);
        //设置鼠标样式。
        this.layer.elem.style.cursor = "move";
        Util.stopEventBubble(e);
    };

    Drag.prototype.pan = function(e) {
        if(this.dragging) {
            var layer = this.layer;
            //计算改变的像素值
            var dx = (e.offsetX || e.layerX) - this.lastX;
            var dy = (e.offsetY || e.layerY) - this.lastY;
            this.lastX = (e.offsetX || e.layerX);
            this.lastY = (e.offsetY || e.layerY);
            layer.center.x -= dx * layer.res;
            layer.center.y += dy * layer.res;
            layer.moveTo(layer.zoom, layer.center);
        }
        Util.stopEventBubble(e);
    };

    Drag.prototype.endPan = function(e) {
        this.layer.elem.style.cursor = "default";
        this.dragging = false;
        Util.stopEventBubble(e);
    };

    Drag.prototype.Events = [["mousedown", Drag.prototype.startPan],
        ["mousemove", Drag.prototype.pan],
        ["mouseup", Drag.prototype.endPan]];


    Drag.prototype.active = function () {
        for(var i = 0, len = this.Events.length; i < len; i++) {
            var type = this.Events[i][0];
            var listener = this.Events[i][1];
            listener = Util.bindAsEventListener(listener, this);
            this.elem.addEventListener(type, listener, true);
        }
    };

    return Drag;
})(Util);
