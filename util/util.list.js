(function(window,document,undefined){
    var SCPUtil = window.SCPUtil;
    var Util = {
        Scope:undefined,
        Expr:undefined,
        ErrorMsg:{
            0:"List Error:Please Load jquery.util.js first.",
            1:"Please input value.",
            2:"is not a list.",
            3:"Please input index or value."
        }
    };

   Util.List = function(){
        this.init.call(this,null);

        if(!(this instanceof Util.List)){
            return new Util.List();
            //return this;
        }

        this.container = new Array();
    };

    Util.List.prototype = function(){
        init = function(){
            if(!SCPUtil)
                throw new Error(Util.ErrorMsg[0]);

            Util.Scope = SCPUtil.Scope;
            if(!Util.Scope)
                throw new Error(Util.ErrorMsg[0]);

            Util.Expr = SCPUtil.Expr;
            if(!Util.Expr)
                throw new Error(Util.ErrorMsg[0]);
        };

        add = function(key){
            try{
                if(!isNotBlank(key)){
                    throw new Error("List Error:"+Util.ErrorMsg[1]);
                }

                this.container.push(key);
            }catch(e){
                throw new Error("List Error:"+e.message);
            }
        };

        addAll = function(obj){
            try{
                if(!obj){
                    throw new Error("List Error:"+Util.ErrorMsg[1]);
                }

                if(!obj.container){
                    throw new Error("List Error:"+obj+" "+Util.ErrorMsg[2]);
                }

                if(!isArray(obj.container)){
                    throw new Error("List Error:"+obj+" "+Util.ErrorMsg[2]);
                }

                Array.prototype.push.apply(this.container,obj.container);
            }catch(e){
                throw new Error("List Error:"+e.message);
            }
        };

        addByIndex = function(index,value){
            try{
                if(!isNotBlank(value) || !isNotBlank(index)){
                    throw new Error("List Error:"+Util.ErrorMsg[3]);
                }

                if(index <= 0){
                    this.container.unshift(value);
                }else if(index >= this.container.length){
                    this.container.push(value);
                }else{
                    if(isEmpty(this)){
                        this.container.push(value);
                    }else{
                        var valueArray = new Array();
                        valueArray.length = this.container.length + 1;
                        for(var i = 0;i <= this.container.length; i++){
                            if(i < index){
                                valueArray[i] = this.container[i];
                            }else if(i == index){
                                valueArray[i] = value;
                            }else{
                                valueArray[i] = this.container[i-1];
                            }
                        }
                        this.clear();
                        this.container = valueArray;
                    }
                }
            }catch(e){
                throw new Error("List Error:"+e.message);
            }
        };

        isListEmpty = function(obj){
            try{
                return obj.container.length > 0?false:true;
            }catch(e){
                throw new Error("List Error:"+e.message);
            }
        };

        contains = function(value){
            try{
                if(isListEmpty(this)){
                    return false;
                }

                if(this.container.indexOf(value) != -1){
                    return true;
                }

                return false;
            }catch(e){
                throw new Error("List Error:"+e.message);
            }
        };

        containsAll = function(obj){
            try{
                if(isListEmpty(this)){
                    return false;
                }

                var flag = false;
                if(!isList(obj)){
                    throw new Error("List Error:"+obj+" "+Util.ErrorMsg[2]);
                }

                if(obj.container.length == 0){
                    return true;
                }

                for(var i = 0; i < obj.container.length; i++){
                    if(this.container.indexOf(obj.container[i]) == -1){
                        return false;
                    }else{
                        flag = true;
                    }
                }

                return flag;
            }catch(e){
                throw new Error("List Error:"+e.message);
            }
        };

        get = function(index){
            try{
                if(isListEmpty(this)){
                    return null;
                }

                if(index < 0 || index > (this.container.length - 1)){
                    return null;
                }

                return this.container[index] == undefined ? null : this.container[index];
            }catch(e){
                throw new Error("List Error:"+e.message);
            }
        };

        remove = function (index) {
            try{
                if(isListEmpty(this)){
                    return;
                }

                if(index < 0 || index > (this.container.length - 1)){
                    return;
                }

                this.container.splice(index,1);
            }catch(e){
                throw new Error("List Error:"+e.message);
            }
        };

        removeAll = function(obj){
            try{
                if(isListEmpty(this)){
                    return;
                }

                if (!isList(obj)) {
                    throw new Error("List Error:"+obj+" "+Util.ErrorMsg[2]);
                }

                if (obj.container.length == 0) {
                    return;
                }

                for(var i = 0;i < obj.container.length; i++){
                    var index = this.container.indexOf(obj.container[i]);
                    if(index != -1){
                        remove(index);
                    }
                }
            }catch(e){
                throw new Error("List Error:"+e.message);
            }
        };

        size = function(){
            try{
                return this.container.length;
            }catch(e){
                throw new Error("List Error:"+e.message);
            }
        };

        isList = function(obj){
            if(!obj){
                return false;
            }

            if(!obj.container){
                return false;
            }

            if(!isArray(obj.container)){
                return false;
            }

            return true;
        };

        equals = function(obj){
            try{
                if(isListEmpty(this) && obj.isListEmpty()){
                    return true;
                }

                if(!isList(obj)){
                    return false;
                }

                if(isListEmpty(this) || obj.isListEmpty()){
                    return false;
                }

                var flag = false;
                if (obj.container.length == 0) {
                    return false;
                }

                for(var i = 0; i < obj.container.length; i++){
                    if(this.container.indexOf(obj.container[i]) == -1){
                        return false;
                    }else{
                        flag = true;
                    }
                }

                return flag;
            }catch (e){
                throw new Error("List Error:"+e.message);
            }
        };

        subList = function(indexFrom,indexTo){
            try{
                if(isListEmpty(this)){
                    return [];
                }

                if(indexFrom > indexTo){
                    return [];
                }

                if(indexFrom <= 0){
                    indexFrom = 0;
                }

                if(indexTo >= this.container.length - 1){
                    indexTo = this.container.length - 1;
                }

                var arr = new Array();
                for(var i = 0; i < this.container.length; i++){
                    if(i >= indexFrom && i <= indexTo){
                        arr.push(this.container[i]);
                    }
                }

                if(arr.length > 0){
                    this.clear();
                    this.container = arr;
                }

                return this;
            }catch(e){
                throw new Error("List Error:"+e.message);
            }
        };

        toArray = function () {
            try{
                return this.container;
            }catch(e){
                throw new Error("List Error:"+e.message);
            }
        };

        clone = function(obj){
            try{
                if(!obj.container)
                    return;

                var result=new Array();
                for (var key in obj.container) {
                    result[key] = obj.container[key];
                }

                this.container = result;
            }catch(e){
                throw new Error("Map Error:"+e.message);
            }
        };

        clear = function(){
            try{
                this.container.length = 0;
            }catch(e){
                throw new Error("List Error:"+e.message);
            }
        };

        isIntArray = function (obj) {
            try{
                if(!obj){
                    return false;
                }

                if(!obj.container){
                    return false;
                }

                if(!isList(obj)){
                    return false;
                }

                if(isListEmpty(obj)){
                    return false;
                }

                for(var i = 0;i < obj.container.length; i++){
                    if(!isNumber(obj.container[i])){
                        return false;
                    }
                }

                return true;
            }catch(e){
                throw new Error("List Error:"+e.message);
            }
        };

        isNumber = function(value){
            try{
                return (typeof value=='number') && value.constructor == Number;
            }catch(e){
                throw new Error("List Error:"+e.message);
            }
        };

        isArray = function (obj) {
            try{
                return Object.prototype.toString.call(obj) === '[object Array]';
            }catch(e){
                throw new Error("List Error:"+e.message);
            }

        };

        isNotBlank = function(value){
            var reg = /^[ ]+$/;
            if(value == undefined || value == "" || value == null || reg.test(value)){
                return false;
            }else{
                return true;
            }
        };

        sort = function(){
            if(isListEmpty(this)){
                return;
            }

            if(!isIntArray(this)){
                return;
            }

            quickSort(this.container,0,this.container.length - 1);
            //oddEvenSort(this.container,this.container.length);
        };

        /*
         * quick sort(直接插入排序)
         *   --通过一趟扫描将要排序的数据分割成独立的两部分,
         *     其中一部分的所有数据都比另外一部分的所有数据都要小,
         *     然后再按此方法对这两部分数据分别进行快速排序,
         *     整个排序过程可以递归进行,以此达到整个数据变成有序序列
         */
        quickSort = function(obj,low,high){
            if(low >= high)
                return;

            var i = low;
            var j = high;
            var key = obj[i];
            while(i < j){
                //从右向左搜索,直到搜索到的数大于等于开始记录的数,交换其位置
                while(i < j && obj[j] >= key)
                    j--;

                if(i < j){
                    obj[i] = obj[j];
                }

                //从左向右搜索,直到搜索到的数小于等于开始记录的数,交换其位置
                while(i < j && obj[i] <= key)
                    i++;
                if(i < j){
                    obj[j] = obj[i];
                }
            }

            obj[i] = key;
            quickSort(obj,low,i - 1);
            quickSort(obj,i + 1,high);
        };

        /*
         * oddEven sort(奇偶排序)
         * --奇数列排一趟序,偶数列排一趟序,再奇数排,再偶数排,直到全部有序
         */
        oddEvenSort = function(obj,n){
            var flag = 1;
            while(flag){
                flag = 0;
                //odd sort
                for(var i = 1;i < n-1;i += 2){
                    if(obj[i] > obj[i+1]){
                        var temp = obj[i];
                        obj[i] = obj[i+1];
                        obj[i+1] = temp;
                        flag = 1;
                    }
                }

                for(var j = 0;j < n-1;j += 2){
                    if(obj[j] > obj[j+1]){
                        var temp = obj[j];
                        obj[j] = obj[j+1];
                        obj[j+1] = temp;
                        flag = 1;
                    }
                }
            }
        };


        return {
            add:this.add,
            addAll:this.addAll,
            addByIndex:this.addByIndex,
            contains:this.contains,
            containsAll:this.containsAll,
            get:this.get,
            remove:this.remove,
            removeAll:this.removeAll,
            size:this.size,
            equals:this.equals,
            subList:this.subList,
            toArray:this.toArray,
            clear:this.clear,
            sort:this.sort,
            init:this.init,
            clone:this.clone
        };

    }();

    window.SCPUtil.List = Util.List;
})(window,document);





