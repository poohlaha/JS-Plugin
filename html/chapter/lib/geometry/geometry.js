/**
 * Created by tlzhang on 2015/6/4.
 */
var Geometry = (function(Util){
    function Geometry(){
        this.id = Util.getId("geomtry_");
    }

    /**
     * bounds属性定义了当前Geometry外接矩形范围。
     * @type {null}
     */
    Geometry.prototype.bounds = null;

    /**
     * 定义Geometry的id属性。
     * @type {null}
     */
    Geometry.prototype.id = null;

    /**
     * 定义对bounds基类克隆的方法
     * @returns {Geometry}
     */
    Geometry.prototype.clone = function () {
        return new Geometry();
    };

    /**
     * 销毁当前的Geometry
     */
    Geometry.prototype.destroy = function () {
        this.bounds = null;
        this.id = null;
    };

    return Geometry;
})(Util);
