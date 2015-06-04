/**
 * Created by tlzhang on 2015/6/4.
 */
var Scale = (function(){
    function Scale(layer) {
        this.layer = layer;
        this.elem = layer.elem;
        this.active();
    }

    Scale.prototype.wheelChange = function(e) {
        var layer = this.layer;
        var delta = (e.wheelDelta / 120) * 30;
        var deltalX = layer.size.w/2 - (e.offsetX || e.layerX);
        var deltalY = (e.offsetY || e.layerY) - layer.size.h/2;

        var px = {x: (e.offsetX || e.layerX), y:(e.offsetY || e.layerY)};
        var zoomPoint = this.layer.getPositionFromPx(px);
        var zoom = this.layer.zoom + delta;
        var newRes = this.layer.getResFromZoom(zoom);
        var center = new Util.Position(zoomPoint.x + deltalX * newRes, zoomPoint.y + deltalY * newRes);
        this.layer.moveTo(zoom, center);
        Util.stopEventBubble(e);
    };

    Scale.prototype.DOMScroll = function(e) {
        Util.stopEventBubble(e);
    };

    Scale.prototype.Events = [["mousewheel", Scale.prototype.wheelChange],["DOMMouseScroll", Scale.prototype.DOMScroll]];

    Scale.prototype.active = function () {
        for(var i = 0, len = this.Events.length; i < len; i++) {
            var type = this.Events[i][0];
            var listener = this.Events[i][1];
            listener = Util.bindAsEventListener(listener, this);
            this.elem.addEventListener(type, listener, true);
        }
    };

    return Scale;
})();
