
(function(window,document,undefined){
    var Express = {};

    function getExpr(){
        var whitespace = "[\\x20\\t\\r\\n\\f]";//空白字符正则字符串
        var operators = "([*^$|!~]?=)";//可用的属性操作符
        var rcomma = "^" + whitespace + "*," + whitespace + "*";//并联选择器的正则
        var rcombinators = "^" + whitespace + "*([\\x20\\t\\r\\n\\f>+~])" + whitespace + "*";//关系选择器正则
        var characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+";//字符编码正则字符串
        var identifier = characterEncoding.replace( "w", "w#" );
        var attributes = "\\[" + whitespace + "*(" + characterEncoding + ")" + whitespace +
            "*(?:" + operators + whitespace + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + identifier + ")|)|)" + whitespace + "*\\]";//属性选择器正则
        var pseudos = ":(" + characterEncoding + ")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|" + attributes.replace( 3, 8 ) + ")*)|.*)\\)|)";//伪类正则字符串
        var rtrim = "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$"; // 去掉两端空白和字符串中的反斜杠（如果连续两个去掉一个）
        //var rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/;//仅仅单个id或tag、class选择器正则（用来快速解析并获取元素）
        var rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/;
        var expando = "pizzle" + 1 * new Date();

        return {
            rcomma:new RegExp(rcomma),
            rcombinators:new RegExp(rcombinators),
            characterEncoding:characterEncoding,
            attributes:attributes,
            pseudos:pseudos,
            rtrim:new RegExp(rtrim,"g"),
            rquickExpr:new RegExp(rquickExpr),
            expando:expando
        };
    }

    function getMatchExpr(){
        var idExpr = "^#(" + Express.expr['characterEncoding'] + ")";
        var classExpr = "^\\.(" + Express.expr['characterEncoding'] + ")";
        var tagExpr =  "^(" + Express.expr['characterEncoding'].replace( "w", "w*" ) + ")";
        var attrExpr = "^" + Express.expr['attributes'];
        var pseudosExpr = "^" + Express.expr['pseudos'];
        var childEpr = "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + Express.expr['whitespace'] +
            "*(even|odd|(([+-]|)(\\d*)n|)" + Express.expr['whitespace'] + "*(?:([+-]|)" + Express.expr['whitespace'] +
            "*(\\d+)|))" + Express.expr['whitespace'] + "*\\)|)";

        return {
            "ID":new RegExp(idExpr),
            "CLASS":new RegExp(classExpr),
            "TAG":new RegExp(tagExpr),
            "ATTR":new RegExp(attrExpr),
            "PSEUDO":new RegExp(pseudosExpr),
            "CHILD":new RegExp(childEpr, "i" )
        };
    }

    function init(){
        Express.expr = getExpr();
        Express.matchExpr = getMatchExpr();
    }

    function Pizzle(selector){
        if(!selector)
            return;

        init();
        return Pizzle.participle(selector);
    }

    /**
     * participle selector
     * @param selector
     */
    Pizzle.participle = function(selector){
        var match,matched,tokens = [],groups = [];

        //Handle HTML strings
        if(typeof selector === "string"){
            if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
                // Assume that strings that start and end with <> are HTML and skip the regex check
                var m = selector.substring(1,selector.length - 1);
                match = [ null, null,m, null ];
            } else {
                match = Express.expr.rquickExpr.exec(selector);
            }
        }

        if(match){
            matched = match[1] || match[2] || match[3] ||'';
            var type = (matched == match[1]) ? "ID" : ((matched == match[2]) ? "TAG" : (matched == match[3]) ? "CLASS" : "");
            tokens.push({
                value: matched,
                type: type,
                matches: selector
            });
            return groups.push(tokens);
        }else{
            return Pizzle.tokenize(selector);
        }
    };

    /**
     * 解析多个选择器
     * @param selector
     * @returns {Array}
     */
    Pizzle.tokenize = function(selector){
        var matched,match,tokens,type,str = selector,groups = [];
        while(str){
            //,
            if(!matched || (match = Express.expr.rcomma.exec(str))){
                if(match){
                    str = str.slice(match[0].length) || str;
                }
                groups.push(tokens = []);
            }

            matched = false;
            //+-~
            if((match = Express.expr.rcombinators.exec(str))!=null){
                matched = match.shift();
                tokens.push({
                    value:matched,
                    type:match[0].replace(Express.expr.rtrim," ")
                });

                str = str.slice(matched.length);
            }

            for(type in Express.matchExpr){
                if((match = Express.matchExpr[ type ].exec( str ))!=null){
                    matched = match.shift();
                    tokens.push({
                        value: matched,
                        type: type,
                        matches: match
                    });

                    str = str.slice(matched.length);
                }
            }

            if ( !matched ) {
                break;
            }
        }

        return groups;
    };

   window._ = window.$ = Pizzle;
   window.Pizzle = Pizzle;
})(window,document,undefined);
