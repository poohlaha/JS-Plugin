(function(){

    function pagination(elem,maxCount,options){
        this.opts = {
            cssName:'pagination.css',
            perPage : 10,//每页显示的条目数
            numDisplayCount:10,//连续分页主体部分显示的分页条目数
            currentPage:0,//当前选中的页面
            numEdgeCount:0,//两侧显示的首尾分页的条目数
            linkTo:"#",//分页的链接
            prevText:"Prev",//“前一页”分页按钮上显示的文字
            nextText:"Next",//“下一页”分页按钮上显示的文字
            ellipseText: "...",//省略的页数用什么文字表示
            prevShowAlways:true,//是否显示“前一页”分页按钮
            nextShowAlways:true,//是否显示“下一页”分页按钮
            callback: function() { return false; }//回调函数
        };
        this.instance.call(this,elem,maxCount,options);
    }

    pagination.prototype = function(){
        isLoadCSSStyle = function(){
            try{
                var es = document.getElementsByTagName('link');
                for(var i=0;i<es.length;i++)
                    if(es[i]['href'].indexOf(this.opts.cssName)!=-1)
                        return true;
                return false;
            }catch(e){
                throw new Error("can not load " + this.opts.cssName);
            }
        };

        extend =  function(target,source){
            if(!target && source)
                return source;

            if(target && !source){
                return target;
            }

            for(var src in source){
                if(source.hasOwnProperty(src)){
                    if(typeof source[src]==="object"){//target[src] = typeof source[src]==="object"? extend(source[src]): source[key];
                        extend(target[src],source[src])
                    }else{
                        target[src] = source[src];
                    }
                }

            }

            return target;
        };

        numPages = function(){
            return Math.ceil(this.maxCount / this.opts.perPage);//执行向上舍入，即它总是将数值向上舍入为最接近的整数；
        };

        getInterval = function(){
            var neHalf = Math.ceil(this.opts.numDisplayCount / 2);
            var np = numPages.call(this);
            var upperLimit = np - this.opts.numDisplayCount;
            var start = this.currentPage > neHalf ? Math.max(Math.min(this.currentPage - neHalf, upperLimit), 0) : 0;
            var end = this.currentPage > neHalf ? Math.min(this.currentPage + neHalf, np) : Math.min(this.opts.numDisplayCount, np);
            return [start, end];
        };

       pageSelected = function(pageId,evt){
         this.currentPage = pageId;
         drawLinks.call(this);
         var continuePropagation =  this.opts.callback(pageId, this.panel);
         if (!continuePropagation) {
               if (evt.stopPropagation) {
                   evt.stopPropagation();
               }else {
                   evt.cancelBubble = true;
               }
         }
         return continuePropagation;
       };

       drawLinks = function(){
           this.panel.innerHTML = '';
           var interval = getInterval.call(this);
           var np =  numPages.call(this);
           var self = this;
           var getClickHandler = function(pageId) {
               return function(evt) {
                   return pageSelected.call(self,pageId, evt);
               }
           };

           var appendItem = function(pageId, appendopts) {
               pageId = pageId < 0 ? 0 : (pageId < np ? pageId : np - 1); // Normalize page id to sane value
               appendopts = extend.call(this,{ text: pageId + 1, classes: "current" }, appendopts || {});
               var lnk;
               if (pageId == this.currentPage) {
                   lnk = document.createElement("span");
                   lnk.className = 'current';
                   lnk.innerHTML = appendopts.text;
               }else {
                   lnk = document.createElement("a");
                   lnk.onclick = getClickHandler.call(this,pageId);
                   lnk.href = this.opts.linkTo.replace(/__id__/, pageId)
                   lnk.innerHTML = appendopts.text;
               }

               if (appendopts.classes) {
                   lnk.className = appendopts.classes;
               }

               self.panel.appendChild(lnk);
           };


           // Generate "Previous"-Link
           if (this.opts.prevText && (this.currentPage > 0 || this.opts.prevShowAlways)) {
               appendItem.call(this,this.currentPage - 1, { text: this.opts.prevText, classes: "disabled" });
           }

           // Generate starting points
           if (interval[0] > 0 && this.opts.numEdgeCount > 0) {
               var end = Math.min(this.opts.numEdgeCount, interval[0]);
               for (var i = 0; i < end; i++) {
                   appendItem.call(self,i);
               }
               if (this.opts.numEdgeCount < interval[0] && this.opts.ellipseText) {
                   var span = document.createElement("span");
                   span.innerHTML = this.opts.ellipseText
                   this.panel.appendChild(span);
               }
           }

           // Generate interval links
           for (var i = interval[0]; i < interval[1]; i++) {
               appendItem.call(self,i);
           }

           // Generate ending points
           if (interval[1] < np && this.opts.numEdgeCount > 0) {
               if (np - this.opts.numEdgeCount > interval[1] && this.opts.ellipseText) {
                   var span = document.createElement("span");
                   span.innerHTML = this.opts.ellipseText
                   this.panel.appendChild(span);
               }
               var begin = Math.max(np - this.opts.numEdgeCount, interval[1]);
               for (var i = begin; i < np; i++) {
                   appendItem.call(self,i);
               }

           }

           // Generate "Next"-Link
           if (this.opts.nextText && (this.currentPage < np - 1 || this.opts.nextShowAlways)) {
               appendItem.call(this,this.currentPage + 1, { text: this.opts.nextText, classes: "disabled" });
           }

       };

        init = function(elem,maxCount,options){
            this.opts = extend.call(this,this.opts,options);
            if(!isLoadCSSStyle.call(this)){
                return;
            }

            this.currentPage = this.opts.currentPage;
            this.panel = elem.length?elem[0]:elem;
            this.maxCount = (!maxCount || maxCount < 0) ? 1 :maxCount;
            this.opts.perPage = (!this.opts.perPage || this.opts.perPage < 0) ? 1 :this.opts.perPage;
            var self = this;
            this.selectPage = function(pageId){
                pageSelected.call(self,pageId);
            };

            this.prevPage = function(){
                if(self.currentPage > 0){
                    pageSelected.call(self,self.currentPage - 1)
                    return true;
                }else{
                    return false;
                }
            };

            this.nextPage = function(){
                if(self.currentPage < numPages.call(self) - 1){
                    pageSelected.call(self,self.currentPage+1);
                    return true;
                }else{
                    return false;
                }
            };

            drawLinks.call(this);
        };

        return {
            instance:this.init
        };
    }();

    function page(elem,maxCount,options){
        return new pagination(elem,maxCount,options);
    }

    window.pagination = page;

})(window,document,undefined);