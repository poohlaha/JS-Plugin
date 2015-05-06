(function(window,document,undefined,jQuery){
    var PlaceHolderUtil = {};
    PlaceHolderUtil.isInputSupported = false;
    PlaceHolderUtil.isTextareaSupported = false;
    PlaceHolderUtil.placeHolderName = 'placeholder';
    PlaceHolderUtil.cssName = 'data_module';
    PlaceHolderUtil.cssValue = 'PlaceHolder_UI';
    PlaceHolderUtil.valHooks = $.valHooks;
    PlaceHolderUtil.propHooks = $.propHooks;

    var Scope = {
        0:document,
        1:window
    };

    var Expr = {};
    Expr.find = {
        'ID'    : Scope[0].getElementById,
        'CLASS' : Scope[0].getElementsByClassName,
        'TAG'   : Scope[0].getElementsByTagName,
        'CREATE': Scope[0].createElement,
        'CREATEATTR': Scope[0].createAttribute,
        'CREATETEXT': Scope[0].createTextNode
    };


    $.fn.placeholder = function () {
        PlaceHolderUtil.init();

        if(!PlaceHolderUtil.isLoadCSSStyle()){
            var cssStyleScript = PlaceHolderUtil.getCssScript();
            Expr.find['TAG'].call(Scope[0],"head")[0].appendChild(cssStyleScript);
        }

        if(PlaceHolderUtil.isInputSupported && PlaceHolderUtil.isTextareaSupported){
            return this;
        }

        if (!PlaceHolderUtil.isInputSupported) {
            PlaceHolderUtil.valHooks.input = PlaceHolderUtil.hooks;
            PlaceHolderUtil.propHooks.value = PlaceHolderUtil.hooks;
        }
        if (!PlaceHolderUtil.isTextareaSupported) {
            PlaceHolderUtil.valHooks.textarea = PlaceHolderUtil.hooks;
            PlaceHolderUtil.propHooks.value = PlaceHolderUtil.hooks;
        }

        return PlaceHolderUtil.filter(this);
    };

    /*
     * init properties
     */
    PlaceHolderUtil.init = function(){
        try{
            PlaceHolderUtil.isInputSupported = PlaceHolderUtil.placeHolderName in Expr.find['CREATE'].call(Scope[0],('input'));
            PlaceHolderUtil.isTextareaSupported = PlaceHolderUtil.placeHolderName in Expr.find['CREATE'].call(Scope[0],('textarea'));
        }catch(e) {
            throw new Error("PlaceHolder Plugin Error:" + e.message);
        }
    };

    /*
     * filter
     */
    PlaceHolderUtil.filter = function (obj) {
        try{
            return obj.filter((PlaceHolderUtil.isInputSupported ? 'textarea' : ':input') + '[placeholder]')
                .not('.placeholder')
                .bind({
                    'focus.placeholder': PlaceHolderUtil.clearPlaceholder,
                    'blur.placeholder': PlaceHolderUtil.setPlaceholder
                })
                .data('placeholder-enabled', true)
                .trigger('blur.placeholder');
        }catch(e) {
            throw new Error("PlaceHolder Plugin Error:" + e.message);
        }
    };

    /*
     * judge is or not load placeholder css style.
     */
    PlaceHolderUtil.isLoadCSSStyle = function(){
        try{
            var style= /style/i;
            var es=Expr.find['TAG'].call(Scope[0],(style?'style':''));
            if(!es)
                return false;

            for(var i=0;i<es.length;i++){
                for(var j = 0;j<es[i].attributes.length;j++){
                    if(es[i].attributes[j].name == PlaceHolderUtil.cssName && es[i].attributes[j].value == PlaceHolderUtil.cssValue){
                        return true;
                    }
                }
            }
            return false;
        }catch(e){
            throw new Error("PlaceHolder Plugin Error:" + e.message);
        }
    };

    /*
     * css style
     */
    PlaceHolderUtil.getCssScript = function(){
        try{
            var style = Expr.find['CREATE'].call(Scope[0],('style'));
            style.type = "text/css";
            var module= Expr.find['CREATEATTR'].call(Scope[0],(PlaceHolderUtil.cssName));
            module.value = this.cssValue;
            style.setAttributeNode(module);
            var text = this.getStyleText();
            if(style.styleSheet){ //IE
                var func = function(){
                    try{ //防止IE中stylesheet数量超过限制而发生错误
                        style.styleSheet.cssText = text;
                    }catch(e){

                    }
                };
                //如果当前styleSheet还不能用，则放到异步中则行
                if(style.styleSheet.disabled){
                    setTimeout(func,10);
                }else{
                    func();
                }
            }else{ //w3c
                //w3c浏览器中只要创建文本节点插入到style元素中就行了
                var textNode = Expr.find['CREATETEXT'].call(Scope[0],text);
                style.appendChild(textNode);
            }
            return style;
        }catch(e){
            throw new Error("PlaceHolder Plugin Error:" + e.message);
        }
    };

    /*
     * get style text
     */
    PlaceHolderUtil.getStyleText = function(){
        return  ['input, textarea { font-family: Helvetica, Arial; color: #000;font-size:12px;}',
            '.placeholder {color: #aaa;}'].join('');
    };

    /*
     * args
     */
    PlaceHolderUtil.args = function(elem){
        try{
            var attrs = {};
            var rinlinejQuery = /^jQuery\d+$/;
            $.each(elem.attributes, function(i, attr) {
                if (attr.specified && !rinlinejQuery.test(attr.name)) {
                    attrs[attr.name] = attr.value;
                }
            });
            return attrs;
        }catch(e){
            throw new Error("PlaceHolder Plugin Error:" + e.message);
        }

    };

    /*
     * clear placeholder
     */
    PlaceHolderUtil.clearPlaceholder = function(){
        try{
            var input = this;
            var $input = $(input);
            if (input.value == $input.attr('placeholder') && $input.hasClass('placeholder')) {
                if ($input.data('placeholder-password')) {
                    $input = $input.hide().next().show().attr('id', $input.removeAttr('id').data('placeholder-id'));
                    // If `clearPlaceholder` was called from `$.valHooks.input.set`
                    if (event === true) {
                        return $input[0].value = value;
                    }
                    $input.focus();
                } else {
                    input.value = '';
                    $input.removeClass('placeholder');
                    input == PlaceHolderUtil.safeActiveElement() && input.select();
                }
            }
        }catch(e){
            throw new Error("PlaceHolder Plugin Error:" + e.message);
        }
    };

    /*
     * set placeholder
     */
    PlaceHolderUtil.setPlaceholder = function(){
        try{
            var $replacement;
            var input = this;
            var $input = $(input);
            var id = this.id;
            if (input.value == '') {
                if (input.type == 'password') {
                    if (!$input.data('placeholder-textinput')) {
                        try {
                            $replacement = $input.clone().attr({ 'type': 'text' });
                        } catch(e) {
                            $replacement = $('<input>').attr($.extend(PlaceHolderUtil.args(this), { 'type': 'text' }));
                        }
                        $replacement
                            .removeAttr('name')
                            .data({
                                'placeholder-password': $input,
                                'placeholder-id': id
                            })
                            .bind('focus.placeholder', PlaceHolderUtil.clearPlaceholder);
                        $input
                            .data({
                                'placeholder-textinput': $replacement,
                                'placeholder-id': id
                            })
                            .before($replacement);
                    }
                    $input = $input.removeAttr('id').hide().prev().attr('id', id).show();
                }
                $input.addClass('placeholder');
                $input[0].value = $input.attr('placeholder');
            } else {
                $input.removeClass('placeholder');
            }
        }catch(e){
            throw new Error("PlaceHolder Plugin Error:" + e.message);
        }
    };

    PlaceHolderUtil.safeActiveElement = function(){
        try {
            return document.activeElement;
        } catch (exception) {
            throw new Error("PlaceHolder Plugin Error:" + e.message);
        }
    };

    PlaceHolderUtil.hooks = {
        'get': function(element) {
            try{
                var $element = $(element);

                var $passwordInput = $element.data('placeholder-password');
                if ($passwordInput) {
                    return $passwordInput[0].value;
                }

                return $element.data('placeholder-enabled') && $element.hasClass('placeholder') ? '' : element.value;
            }catch(e){
                throw new Error("PlaceHolder Plugin Error:" + e.message);
            }

        },
        'set': function(element, value) {
            try{
                var $element = $(element);

                var $passwordInput = $element.data('placeholder-password');
                if ($passwordInput) {
                    return $passwordInput[0].value = value;
                }

                if (!$element.data('placeholder-enabled')) {
                    return element.value = value;
                }

                if (value == '') {
                    element.value = value;
                    // Issue #56: Setting the placeholder causes problems if the element continues to have focus.
                    if (element != PlaceHolderUtil.safeActiveElement()) {
                        // We can't use `triggerHandler` here because of dummy text/password inputs :(
                        PlaceHolderUtil.setPlaceholder.call(element);
                    }
                } else if ($element.hasClass('placeholder')) {
                    PlaceHolderUtil.clearPlaceholder.call(element, true, value) || (element.value = value);
                } else {
                    element.value = value;
                }
                // `set` can not return `undefined`; see http://jsapi.info/jquery/1.7.1/val#L2363
                return $element;
            }catch(e){
                throw new Error("PlaceHolder Plugin Error:" + e.message);
            }
        }
    };

    /*
     * Clear the placeholder values so they don't get submitted
     */
    $(function() {
        $(document).delegate('form', 'submit.placeholder', function() {
            var $inputs = $('.placeholder', this).each(PlaceHolderUtil.clearPlaceholder);
            setTimeout(function() {
                $inputs.each(PlaceHolderUtil.setPlaceholder);
            }, 10);
        });
    });

    /*
     * Clear placeholder values upon page reload
     */
    $(window).bind('beforeunload.placeholder', function() {
        $('.placeholder').each(function() {
            this.value = '';
        });
    });

})(window,document,undefined,jQuery);
