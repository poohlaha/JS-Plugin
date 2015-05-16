(function(window,document,undefined){
    var Express = {};

    var Support = {};

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
        var rnative = /^[^{]+\{\s*\[native code/;//原生函数正则
        var expando = "pizzle" + 1 * new Date();

        return {
            rcomma:new RegExp(rcomma),
            rcombinators:new RegExp(rcombinators),
            characterEncoding:characterEncoding,
            attributes:attributes,
            pseudos:pseudos,
            rtrim:new RegExp(rtrim,"g"),
            rquickExpr:new RegExp(rquickExpr),
            rnative:rnative,
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


    function Pizzle(selector){
        if(!selector)
            return;

        return Pizzle.participle(selector);
    }

    Pizzle.init = function(){
        Express.expr = getExpr();
        Express.matchExpr = getMatchExpr();
        Support.isQSA = Express.expr['rnative'].test(document.querySelectorAll);
    };

    /**
     * participle selector
     * @param selector
     */
    Pizzle.participle = function(selector){
        if(typeof selector !== "string"){
            return [];
        }

        Pizzle.init();
        var match,matched,tokens = [],groups = [];

        //Handle HTML strings
        if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
            // Assume that strings that start and end with <> are HTML and skip the regex check
            var m = selector.substring(1,selector.length - 1);
            match = [ null, null,m, null ];
        } else {
            match = Express.expr.rquickExpr.exec(selector);
        }

        if(match){
            matched = match[1] || match[2] || match[3] ||'';
            var type = (matched == match[1]) ? "ID" : ((matched == match[2]) ? "TAG" : (matched == match[3]) ? "CLASS" : "");
            var sep = undefined,newMatched = undefined,oldMatched = match[0];
            if(oldMatched.charAt(0) === "#" || oldMatched.charAt(0) === "." || oldMatched.charAt(0) === ":"){
                sep = oldMatched.charAt(0);
                newMatched = oldMatched.substring(1,oldMatched.length);
            }

            tokens.push({
                value: newMatched ? newMatched : matched,
                type: type,
                sep: sep ? sep : "",
                matches: selector
            });

            groups.push(tokens);
            return groups;
        }else{
            return Pizzle.tokenize(selector);
        }
    };

    /**
     * participle many selectors
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
                    value:matched == " " ? matched : matched.trim(),
                    type:match[0].replace(Express.expr.rtrim," ")
                });

                str = str.slice(matched.length);
            }

            for(type in Express.matchExpr){
                if((match = Express.matchExpr[ type ].exec( str ))!=null){
                    matched = match.shift();
                    var sep = undefined,newMatched = undefined;
                    if(matched.charAt(0) === "#" || matched.charAt(0) === "." || matched.charAt(0) === ":"){
                        sep = matched.charAt(0);
                        newMatched = matched.substring(1,matched.length);
                    }
                    tokens.push({
                        value: newMatched ? newMatched : matched,
                        type: type,
                        sep: sep ? sep : "",
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


    Pizzle.error = function(message){
        throw new Error( "Syntax error, unrecognized expression: " + message );
    };

    Pizzle.isXml = function(elem){
        var documentElement = elem && (elem.ownerDocument || elem).documentElement;
        return documentElement ? documentElement.nodeName !== "HTML" : false;
    };

    window.Pizzle = Pizzle;
})(window,document,undefined);
