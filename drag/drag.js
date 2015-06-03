
/**
 * Created by tlzhang on 2015/6/3.
 */
(function(window,document,undefined,extend){
    var datakey = 'drag',
    defaults = {
        handle:null,
        drag:null,
        axis:'xy',//拖拽轴向，x：水平，y：垂直，xy：所有
        cursor:'move',
        min:null,// 拖拽对象的最小位置，格式为{left: 10, top: 10}
        max:null,// 拖拽对象的最大位置
        zIndex:9999,
        onDragBefore:function(){},// 拖拽开始前回调
        onDragStart:function(){},// 拖拽开始后回调
        onDrag:function(){},// 拖拽中回调
        onDragEnd:function(){}// 拖拽结束后回调
    };

    function Run(elem,options){
        if(!elem) return;
        if(elem.length) elem = elem[0];
        options = extend({},defaults,options);
        if(!options) return;
        var instance = normal.data.data(elem,datakey);
        if(!instance)
            normal.data.data(elem,datakey,instance = new Drag(elem, options)._init());
    }

    function Drag(element, options){
        this.element = element;
        this.options = options;
    }

    Drag.prototype = {

        /**
         * 初始化
         * @returns {Drag}
         * @private
         */
        _init:function(){
            var self = this,options = self.options,elem = self.element;
            normal.event.addEvent(elem,'mousedown',normal.proxy(self._start,self));
            normal.event.addEvent(elem,'taphold',normal.proxy(self._start,self));
            normal.event.addEvent(document,'mousemove',normal.proxy(self._move,self));
            normal.event.addEvent(document,'mouseup',normal.proxy(self._end,self));
            normal.event.addEvent(document,'touchmove',normal.proxy(self._move,self));
            normal.event.addEvent(document,'touchend',normal.proxy(self._end,self));
            normal.event.addEvent(document,'touchcancel',normal.proxy(self._end,self));
            return self;
        },

        /**
         * 拖拽开始回调
         * @param e
         * @private
         */
        _start:function(e){
            if(!this.is){
                e.preventDefault();

                var the = this,options = the.options,elem = the.element,drag = elem,cssPos,offset,te = e.touches ? e.touches[0] : e;
                the.drag = drag;
                options.onDragBefore.call(drag,e,the);
                the.zIndex = drag.style['zIndex'];
                the.cursor = drag.style['cursor'];
                the.drag.style['zIndex'] = (drag.style['zIndex'] = options.zIndex);
                cssPos = drag.style['position'];
                offset = normal.offset(drag);
                if (cssPos === 'static') {
                    drag.style['position'] = 'relative';
                }else if (cssPos === 'fixed' || cssPos === 'absolute') {
                    drag.style = normal.position(drag);
                }

                the.pos = {
                    x: te.pageX,
                    y: te.pageY,
                    l: offset.left,
                    t: offset.top
                };
                the.is = !0;

                if (the.options.cursor) document.body.style['cursor'] = options.cursor;
                options.onDragStart.call(drag, e, the);

            }
        },

        _move:function(e){
            if (this.is) {
                e.preventDefault();

                var the = this,
                    options = the.options,
                    min = options.min,
                    max = options.max,
                    pos = the.pos,
                    drag = the.drag,
                    offset = normal.offset(normal.parent(drag)),
                    minLeft, minTop, maxLeft, maxTop,
                    to = {},
                    te = e.touches ? e.touches[0] : e;


                // axis
                if (~options.axis.indexOf('x')) to.left = te.pageX - pos.x + pos.l;
                if (~options.axis.indexOf('y')) to.top = te.pageY - pos.y + pos.t;

                // min
                if (min && min.left !== undefined) {
                    if (to.left < (minLeft = min.left + offset.left)) to.left = minLeft;
                }
                if (min && min.top !== undefined) {
                    if (to.top < (minTop = min.top + offset.top)) to.top = minTop;
                }

                // max
                if (max && max.left !== undefined) {
                    if (to.left > (maxLeft = max.left + offset.left)) to.left = maxLeft;
                }
                if (max && max.top !== undefined && to.top > max.top) {
                    if (to.top > (maxTop = max.top + offset.top)) to.top = maxTop;
                }

                normal.offset(drag,to);
                options.onDrag.call(drag, e, the);
            }
        },

        _end:function(e){
            if (this.is) {
                var the = this,
                    drag = the.drag;

                e.preventDefault();
                the.is = !1;
                if (the.options.cursor) document.body.style['cursor'] = the.cursor;
                drag.style['zIndex'] = the.zIndex;
                the.options.onDragEnd.call(drag, e, the);
            }
        },

        /**
         * 设置或获取选项
         * @param  {String/Object} key 键或键值对
         * @param  {*}             val 值
         * @return 获取时返回键值，否则返回this
         */
        options: function(key, val) {
            if ($.type(key) === 'string' && val === undefined) return this.options[key];
            var map = {};
            if ($.type(key) === 'object') map = key;
            else map[key] = val;
            this.options = extend({},this.options, map);
        }
    };

    function getDrag(elem,options){
        return new Run(elem,options);
    }

    window.drag = getDrag;
})(window,document,undefined,normal.extend);
