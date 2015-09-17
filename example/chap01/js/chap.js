/**
 * Created by tlzhang on 2015/9/15.
 */
(function(window,document,$,Map){

    $(function () {
        chap.drawChap();
        $("[class^=photo] img").click(function(){
            if($(this).closest('div').prop('class') != 'centerPhoto'){
                $("div.centerPhoto").empty().append('<img src="image/big.jpg" width="100px" height="100px" style="display: none;">');
                chap.moveChap($(this).closest('div'));
            }
        });

        $(".centerPhoto").click(function(){
            if($(".centerPhoto").find("img").length > 1){
                var node = $(this).find("img:last");
                chap.moveChapToNormal(node);
            }
        });
    });

    var chap = (function(){
        function chap(){
            this.time = 3000;
        }

        chap.prototype.moveChap = function(obj){
            var centerPhoto = $(".centerPhoto");
            if(centerPhoto.length <=0) return;
            if(obj.length <=0) return;
            $("[class^=photo]").each(function(){
                if(obj.prop('class') != $(this).prop('class')){
                    $(this).find("img").hide();
                }
            });

            if(this.judgeIsIELower()){
                this.hideAllLines(true,2);
            }else{
                this.hideAllLines(false,2);
            }

            this.map = this.getAllPhotoPosition();

            //获取相对父元素的位置
            var _left = centerPhoto.position().left;
            var _top = centerPhoto.position().top;

            var self = this;
            var img = obj.find('img').clone();
            this.node = obj;
            obj.animate({left:_left,opacity:'0.4'},"slow");
            obj.animate({top:_top,opacity:'0.8'},"slow",function(){
                $("div.centerPhoto").append($(this).find("img"));
                obj.removeAttr("style");
                obj.prepend(img);
                obj.find('img').hide();
                //obj.css({'display':'none'});

                self.chapChange.call(self,_left,_top);
            });
        };

        chap.prototype.drawChap = function(){
            var _node ;
            if(this.judgeIsIELower()){
                $("#line").append('<div class="lineCls"/>');
                _node =  $("#line .lineCls");
            }else{
               _node =  $("#line");
            }

            var node1 = new draw(280,260,110,110);
            _node.append($(node1));
            var node2 = new draw(280,300,110,300);
            _node.append($(node2));
            var node3 = new draw(280,320,110,480);
            _node.append($(node3));

            var node4 = new draw(410,260,580,110);
            _node.append($(node4));
            var node5 = new draw(410,300,580,300);
            _node.append($(node5));
            var node6 = new draw(410,320,580,480);
            _node.append($(node6));
        };

        chap.prototype.judgeIsIELower = function(){
            if (navigator.userAgent.indexOf("MSIE 8.0")>0
                || navigator.userAgent.indexOf("MSIE 7.0")>0
                || navigator.userAgent.indexOf("MSIE 6.0")>0)
                return true;
            else
                return false;
        };

        chap.prototype.chapChange = function(_left,_top){
            $("[class^=photo]").each(function(){
                $(this).css({'left':_left,'top':_top});
            });

            if($("div.photo1 span").length == 0)
                $(".photo1").append("<span style='display: none'>健康管理</span>");

            if($("div.photo3 span").length == 0)
                $(".photo3").append("<span style='display: none'>预约挂号</span>");

            if($("div.photo4 span").length == 0)
                $(".photo4").append("<span style='display: none'>就医导航</span>");

            if($("div.photo5 span").length == 0)
                $(".photo5").append("<span style='display: none'>诊前咨询</span>");

            if($("div.photo6 span").length == 0)
                $(".photo6").append("<span style='display: none'>候诊提醒</span>");

            //移动div到原来位置
            this.move.call(this);
        };

        chap.prototype.move = function(){
            var self = this;
            var isDone = false;
            $("[class^=photo]").each(function(){
                var pop = self.map.get($(this).prop('class'));
                if(pop){
                    var left_ = pop.get("left");
                    var top_ = pop.get("top");
                    $(this).find("span").show();
                    $(this).animate({left:left_,opacity:'0.4'},"slow");
                    $(this).animate({top:top_,opacity:'0.8'},"slow",function(){
                        //显示箭头
                        if(self.judgeIsIELower())
                            $("#line").fadeIn(1000);
                        else
                            $("#line").fadeIn(self.time);
                    });
                }
            });
        };

        chap.prototype.getAllPhotoPosition = function(){
            var map = new Map();
            $("[class^=photo]").each(function(){
                var _class = $(this).prop('class');
                var _left = $(this).position().left;
                var _top = $(this).position().top;
                var _map = new Map();
                _map.put("left",_left);
                _map.put("top",_top);
                map.put(_class,_map);
            });

            var _centerCls = $(".centerPhoto").prop('class');
            var _centerLeft = $(".centerPhoto").position().left;
            var _centerTop = $(".centerPhoto").position().top;
            var _centerMap = new Map();
            _centerMap.put("left",_centerLeft);
            _centerMap.put("top",_centerTop);
            map.put(_centerCls,_centerMap);
            return map;
        };

        chap.prototype.hideAllLines = function(flag,x){
            var lineChild = $("#line").children();
            var i = 0;
            lineChild.children().each(function(){
                if(flag == true){
                    i++;
                    if(x && x == i)
                        $(this).hide();
                }else{
                    if($(this).attr('from') && $(this).attr('to')){
                        i++;
                        if(x && x == i)
                            $(this).hide();
                    }
                }

            });

            $('#line').hide();
        };

        chap.prototype.moveChapToNormal = function(obj){
            var node = this.node;

            this.showAllLines();
            this.hideAllSpans();
            //$('div.centerPhoto img').show();
            this.removeAnimation.call(this,obj.closest('div'),node);
        };

        chap.prototype.showAllLines = function(){
            var lineChild = $("#line").children();
            var i = 0;
            lineChild.children().each(function(){
                $(this).show();
            });

            $("#line").hide();
        };

        chap.prototype.removeAnimation = function(obj,node){
            var pop = this.map.get($(node).prop('class'));
            if(pop){
                var self = this;
                var left_ = pop.get("left");
                var top_ = pop.get("top");
                obj.animate({left:left_,opacity:'0.4'},"slow");
                obj.animate({top:top_,opacity:'1'},"slow",function(){
                    node.empty();
                    var _node = $(".centerPhoto").find('img:last').clone(true);
                    $(".centerPhoto").find('img:last').remove();
                    node.append(_node);

                    $("[class^=photo]").each(function(){
                        if($(this).prop('class') != obj.prop('class')){
                            $(this).find('img').fadeIn(self.time);
                        }

                    });

                    if(self.judgeIsIELower())
                        $("#line").fadeIn(1000);
                    else
                        $("#line").fadeIn(self.time);
                    //移动centerPhoto到原来位置
                    var pop = self.map.get($(".centerPhoto").prop('class'));
                    if(pop) {
                        var left_ = pop.get("left");
                        var top_ = pop.get("top");
                        $("div.centerPhoto").removeAttr("style");
                        $("div.centerPhoto").css({'left':left_,'top':top_});
                    }

                    $("div.centerPhoto img").fadeIn(self.time);
                });
            }
        };

        chap.prototype.hideAllSpans = function () {
            $("[class^=photo]").each(function(){
                if($(this).closest('div').prop('class') != 'centerPhoto'){
                    $(this).find('span').hide();
                }
            });
        };


        return new chap;
    })();

})(window,document,jQuery,Map);
