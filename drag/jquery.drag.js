/**
 * Created by Administrator on 2015/6/3.
 */
(function(window,document,undefined,$){
    'use strict';

    var doc = $(document),datakey = 'js-drag',
        defaults = {
            drag: null,
            axis: 'xy',// 拖拽轴向，x：水平，y：垂直，xy：所有
            cursor: 'move',// 鼠标形状
            min: null,// 拖拽对象的最小位置，格式为{left: 10, top: 10}
            max: null,// 拖拽对象的最大位置，格式为{left: 1000, top: 1000}
            isOverWindowDrag:false,//是否超出window拖拽
            scroll:false,
            zIndex: 9999,
            onDragBefore: $.noop,// 拖拽开始前回调
            onDragStart: $.noop,// 拖拽开始后回调
            onDrag: $.noop,// 拖拽中回调
            onDragEnd: $.noop// 拖拽结束后回调
        };

    $.fn.drag = function(options){
        options = $.extend({},defaults,options);
        if(!options) return;
        if(options.scroll) $(document.body).css({"overflow":""});
        else $(document.body).css({"overflow":"hidden"});
        return this.each(function() {
            var element = this,instance = $(element).data(datakey);
            if (!instance) {
                $(element).data(datakey, instance = new Drag(element, options)._init());
            }
        });
    };

    function Drag(element, options){
        this.element = element;
        this.options = options;
    }

    Drag.prototype = {
        
        /**
         * 初始化
         * @return this
         * @version 1.0
         * 2014年7月3日18:29:40
         */
        _init: function() {
            var self = this,options = self.options,
                $element = $(self.element);
            self.$element = $element;
            $element.on('mousedown taphold', $.proxy(self._start, self));
            doc.mousemove($.proxy(self._move, self))
                .mouseup($.proxy(self._end, self))
                .bind('touchmove', $.proxy(self._move, self))
                .bind('touchend', $.proxy(self._end, self))
                .bind('touchcancel', $.proxy(self._end, self));

            return self;
        },



        /**
         * 拖拽开始回调
         * @param {Object} e event
         * @return undefined
         * @version 1.0
         * 2014年7月3日18:29:40
         */
        _start: function(e) {
            if (!this.is) {
                e = e.originalEvent;
                e.preventDefault();

                var self = this,
                    options = self.options,
                    element = self.$element,
                    handle = $(e.target),
                    drag = options.drag ? handle.closest(options.drag) : element,
                    cssPos,
                    offset,
                    te = e.touches ? e.touches[0] : e;

                if (!element.has(drag).length) drag = element;
                self.drag = drag;
                options.onDragBefore.call(drag[0], e, self);

                self.zIndex = drag.css('z-index');
                self.cursor = $(document.body).css('cursor');
                self.drag = drag.css('z-index', options.zIndex);
                cssPos = drag.css('position');
                offset = drag.offset();

                if (cssPos === 'static') {
                    drag.css('position', 'relative');
                }else if (cssPos === 'fixed' || cssPos === 'absolute') {
                    drag.css(drag.position());
                }

                self.pos = {
                    x: te.pageX,
                    y: te.pageY,
                    l: offset.left,
                    t: offset.top
                };
                self.is = !0;
                if (self.options.cursor) $(document.body).css('cursor', options.cursor);
                options.onDragStart.call(drag[0], e, self);
            }
        },

        /**
         * 拖拽移动回调
         * @param {Object} e event
         * @return undefined
         */
        _move: function(e) {
            if (this.is) {
                e = e.originalEvent;
                e.preventDefault();

                var self = this,
                    options = self.options,
                    min = options.min,
                    max = options.max,
                    pos = self.pos,
                    drag = self.drag,
                    offset = drag.parent(!0).offset(),
                    minLeft, minTop, maxLeft, maxTop,
                    to = {},
                    te = e.touches ? e.touches[0] : e;

                // axis
                if (~options.axis.indexOf('x')) to.left = te.pageX - pos.x + pos.l;
                if (~options.axis.indexOf('y')) to.top = te.pageY - pos.y + pos.t;

                //window over drag
                if(~options.isOverWindowDrag) {
                    var height = window.innerHeight || document.documentElement.clientHeight;
                    var width = window.innerWidth || document.documentElement.clientWidth;
                    var elemWidth = drag.outerWidth(true);
                    var elemHeight = drag.outerHeight(true);
                    if(to.left < 0) to.left = 0;
                    if(to.top < 0) to.top = 0;
                    if((to.left + elemWidth)  > width) to.left = width - elemWidth;
                    if((to.top + elemHeight) > height) to.top = height - elemHeight;
                }

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

                drag.offset(to);
                options.onDrag.call(drag[0], e, self);
            }
        },

        /**
         * 拖拽结束回调
         * @param {Object} e event
         * @return undefined
         */
        _end: function(e) {
            if (this.is) {
                var self = this,drag = self.drag;
                e.preventDefault();
                self.is = !1;
                if (self.options.cursor) $(document.body).css('cursor', self.cursor);
                drag.css('z-index', self.zIndex);
                self.options.onDragEnd.call(drag[0], e, self);
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

            this.options = $.extend(this.options, map);
        }
    };

})(window,document,undefined,jQuery);