/*
 * ImageView v1.0.0
 * --基于zepto.js的大图查看
 * --调用方法 ImageView(index,imgDada)
 * --index 图片默认值显示索引,Number  --imgData 图片url数组,Array
 * */
var ImageView = (function (window, $) {
        var _this = $("#slideView"), _ImgData = [], _index = 0, _length = 0,

            _start = [], _org = [], _orgTime = null,

            _lastTapDate = null,

            _zoom = 1, _zoomXY = [0, 0], _transX = null,

            _advancedSupport = false,

            _doubleDistOrg = 1, _doubleZoomOrg = 1, isDoubleZoom = false,

            isSlide = true, isDrag = false, timer = null,

            winW = window.innerWidth, winH = window.innerHeight;

        /**
    
         * 事件对象 event
    
         */

        var Event = {

            touchstart: function (e) {

                e.preventDefault();

                if (_advancedSupport && e.touches && e.touches.length >= 2) {

                    var img = getImg();

                    $(img).css({ "-webkit-transitionDuration": "0ms", "transitionDuration": "0ms" });

                    _doubleZoomOrg = _zoom;

                    _doubleDistOrg = getDist(e.touches[0].pageX, e.touches[0].pageY, e.touches[1].pageX, e.touches[1].pageY);

                    isDoubleZoom = true;

                    return

                }

                e = e.touches ? e.touches[0] : e;

                isDoubleZoom = false;

                _start = [e.pageX, e.pageY];

                _org = [e.pageX, e.pageY];

                _orgTime = Date.now();

                _transX = -_index * winW;

                if (_zoom != 1) {

                    _zoomXY = _zoomXY || [0, 0];

                    _orgZoomXY = [_zoomXY[0], _zoomXY[1]];

                    var img = getImg();

                    img && ($(img).css({ "-webkit-transitionDuration": "0ms", "transitionDuration": "0ms" }));

                    isDrag = true

                } else {

                    _this.find(".pv-inner").css({ "-webkit-transitionDuration": "0ms", "transitionDuration": "0ms" });

                    isSlide = true

                }

            },

            touchmove: function (e) {

                e.preventDefault();

                if (_advancedSupport && e.touches && e.touches.length >= 2) {

                    var newDist = getDist(e.touches[0].pageX, e.touches[0].pageY, e.touches[1].pageX, e.touches[1].pageY);

                    _zoom = (newDist / _doubleDistOrg) * _doubleZoomOrg

                    var img = getImg();

                    $(img).css({ "-webkit-transitionDuration": "0ms", "transitionDuration": "0ms" });

                    if (_zoom < 1) {

                        _zoom = 1;

                        _zoomXY = [0, 0];

                        $(img).css({ "-webkit-transitionDuration": "200ms", "transitionDuration": "200ms" })

                    } else if (_zoom > getScale(img) * 2) {

                        _zoom = getScale(img) * 2;

                    }

                    $(img).css({ "-webkit-transform": "scale(" + _zoom + ") translate(" + _zoomXY[0] + "px," + _zoomXY[1] + "px)", "transform": "scale(" + _zoom + ") translate(" + _zoomXY[0] + "px," + _zoomXY[1] + "px)" });

                    return

                }

                if (isDoubleZoom) {

                    return;

                }

                e = e.touches ? e.touches[0] : e;

                if (_zoom != 1) {

                    var deltaX = (e.pageX - _start[0]) / _zoom;

                    var deltaY = (e.pageY - _start[1]) / _zoom;

                    _start = [e.pageX, e.pageY];

                    var img = getImg();

                    var newWidth = img.clientWidth * _zoom,

                        newHeight = img.clientHeight * _zoom;

                    var borderX = (newWidth - winW) / 2 / _zoom,

                        borderY = (newHeight - winH) / 2 / _zoom;

                    (borderX >= 0) && (_zoomXY[0] < -borderX || _zoomXY[0] > borderX) && (deltaX /= 3);

                    (borderY > 0) && (_zoomXY[1] < -borderY || _zoomXY[1] > borderY) && (deltaY /= 3);

                    _zoomXY[0] += deltaX;

                    _zoomXY[1] += deltaY;

                    (_length == 1 && newWidth < winW || newWidth < winW) && (_zoomXY[0] = 0);

                    (_length == 1 && newHeight < winH || newHeight < winH) && (_zoomXY[1] = 0);

                    $(img).css({
                        "-webkit-transform": "scale(" + _zoom + ") translate(" + _zoomXY[0] +

                            "px," + _zoomXY[1] + "px)", "transform": "scale(" + _zoom + ") translate(" + _zoomXY[0] +

                            "px," + _zoomXY[1] + "px)"
                    })

                } else {

                    if (!isSlide) return;

                    var deltaX = e.pageX - _start[0];

                    (_transX > 0 || _transX < -winW * (_length - 1)) && (deltaX /= 4);

                    _transX = -_index * winW + deltaX;

                    _this.find(".pv-inner").css({ "-webkit-transform": "translate(" + _transX + "px,0px) translateZ(0)" });

                }

            },

            touchend: function (e) {

                if (isDoubleZoom) {

                    return;

                }

                if (_zoom != 1) {

                    if (!isDrag) { return; }

                    var img = getImg();

                    var newWidth = img.clientWidth * _zoom,

                        newHeight = img.clientHeight * _zoom;

                    var borderX = (newWidth - winW) / 2 / _zoom,

                        borderY = (newHeight - winH) / 2 / _zoom;

                    if (_length > 1 && borderX >= 0) {

                        var updateDelta = 0;

                        var switchDelta = winW / 6;

                        if (_zoomXY[0] < -borderX - switchDelta / _zoom && _index < _length - 1) {

                            updateDelta = 1;

                        } else if (_zoomXY[0] > borderX + switchDelta / _zoom && _index > 0) {

                            updateDelta = -1;

                        }

                        if (updateDelta != 0) {

                            scaleDown(img);

                            changeIndex(_index + updateDelta);

                            return

                        }

                    }

                    var delta = Date.now() - _orgTime;

                    if (delta < 300) {

                        (delta <= 10) && (delta = 10);

                        var deltaDis = Math.pow(180 / delta, 2);

                        _zoomXY[0] += (_zoomXY[0] - _orgZoomXY[0]) * deltaDis;

                        _zoomXY[1] += (_zoomXY[1] - _orgZoomXY[1]) * deltaDis;

                        $(img).css({ "-webkit-transition": "400ms cubic-bezier(0.08,0.65,0.79,1)", "transition": "400ms cubic-bezier(0.08,0.65,0.79,1)" })

                    } else {

                        $(img).css({ "-webkit-transition": "200ms linear", "transition": "200ms linear" });

                    }

                    if (borderX >= 0) {

                        if (_zoomXY[0] < -borderX) {

                            _zoomXY[0] = -borderX;

                        } else if (_zoomXY[0] > borderX) {

                            _zoomXY[0] = borderX;

                        }

                    }

                    if (borderY > 0) {

                        if (_zoomXY[1] < -borderY) {

                            _zoomXY[1] = -borderY;

                        } else if (_zoomXY[1] > borderY) {

                            _zoomXY[1] = borderY;

                        }

                    }

                    if (Math.abs(_zoomXY[0]) < 10) {

                        $(img).css({ "-webkit-transform": "scale(" + _zoom + ") translate(0px," + _zoomXY[1] + "px)", "transform": "scale(" + _zoom + ") translate(0px," + _zoomXY[1] + "px)" });

                        return

                    } else {

                        $(img).css({ "-webkit-transform": "scale(" + _zoom + ") translate(" + _zoomXY[0] + "px," + _zoomXY[1] + "px)", "transform": "scale(" + _zoom + ") translate(" + _zoomXY[0] + "px," + _zoomXY[1] + "px)" });

                    }

                    isDrag = false

                } else {

                    if (!isSlide) { return; }

                    var deltaX = _transX - -_index * winW;

                    var updateDelta = 0;

                    if (deltaX > 50) {

                        updateDelta = -1;

                    } else if (deltaX < -50) {
                        updateDelta = 1;
                    }
                    _index = _index + updateDelta;

                    changeIndex(_index);
                    isSlide = false;
                }

            },

            click: function (e) {
                _zoom = 1;
                _zoomXY = [0, 0];
                _this.css("opacity", "0");
                timer = setTimeout(function () {
                    _this.css({ "display": "" }).html('');
                    unbind();

                }, 150);
            },

            dobelTap: function (e) {

                clearTimeout(timer);

                var now = new Date;

                if (now - _lastTapDate < 500) {

                    return;

                }

                _lastTapDate = now;

                var img = getImg();

                if (!img) {

                    return;

                }

                if (_zoom != 1) {

                    scaleDown(img);

                } else {

                    scaleUp(img);

                }

            },

            setView: function (e) {

                winW = window.innerWidth;

                winH = window.innerHeight;

                _this.width(window.innerWidth).height(window.innerHeight);

                translate((-_index * window.innerWidth), 0, 0, $(".pv-inner")[0]);

                scaleDown(getImg())

            }

        };

        var handleEvent = function (e) {

            switch (e.type) {

                case "touchstart":

                    Event.touchstart(e);

                    break;

                case "touchmove":

                    Event.touchmove(e);

                    break;

                case "touchcancel":

                case "touchend":

                    Event.touchend(e);

                    break;

                case "orientationchange":

                case "resize":

                    Event.setView(e);

                    break

            }

        };

        /**
    
         * 绑定事件
    
         */

        var bind = function () {

            _this.on("singleTap", function (e) {

                e.preventDefault();

                var now = new Date;

                if (now - _lastTapDate < 500) {

                    return;

                }

                _lastTapDate = now;

                Event.click(e);

                return false;

            }).on("doubleTap", function (e) {

                e.preventDefault();

                Event.dobelTap(e);

                return false;

            });

            _this.on("touchstart touchmove touchend touchcancel", function (e) {

                handleEvent(e);

            });

            Event.setView();

            "onorientationchange" in window ? window.addEventListener("orientationchange", Event.setView, false) : window.addEventListener("resize", Event.setView, false);

        };

        /**
    
         * 解除事件
    
         */

        var unbind = function () {

            _this.off();

            "onorientationchange" in window ? window.removeEventListener("orientationchange", Event.setView, false) : window.removeEventListener("resize", Event.setView, false)

        };

        var getDist = function (x1, y1, x2, y2) {

            return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2), 2)

        }

        /**
    
         * 图片缩放
    
         */

        var getScale = function (img) {

            var h = img.naturalHeight, w = img.naturalWidth,

            Scale = w * h / (img.clientHeight * img.clientWidth);

            return Scale;

        };

        var scaleUp = function (img) {

            var scale = getScale(img);

            if (scale > 1)

                $(img).css({ "-webkit-transform": "scale(" + scale + ")", "transform": "scale(" + scale + ")", "-webkit-transition": "200ms", "transition": "200ms" });

            _zoom = scale;

        };

        var scaleDown = function (img) {

            _zoom = 1;

            _zoomXY = [0, 0];

            _doubleDistOrg = 1;

            _doubleZoomOrg = 1;

            $(img).css({ "-webkit-transform": "scale(1)", "transform": "scale(1)", "-webkit-transition": "200ms", "transition": "200ms" });

        };

        /**
    
         * 滑动效果
    
         * dist
    
         */

        var translate = function (distX, distY, speed, ele) {

            if (!!ele) { ele = ele.style; } else { return; }

            ele.webkitTransitionDuration = ele.MozTransitionDuration = ele.msTransitionDuration = ele.OTransitionDuration = ele.transitionDuration = speed + 'ms';

            ele.webkitTransform = 'translate(' + distX + 'px,' + distY + 'px)' + 'translateZ(0)';

            ele.msTransform = ele.MozTransform = ele.OTransform = 'translateX(' + distX + 'px) translateY(' + distY + 'px)';

        };

        /**
    
         * 更改索引值 _index
    
         */

        var changeIndex = function (index, force) {

            if (index < 0) {

                index = 0;

            } else if (index >= _length) {

                index = _length - 1;

            }

            _index = index;

            translate((-_index * window.innerWidth), 0, force ? "0" : "200", $(".pv-inner")[0]);

            $("#J_index").html(_index + 1 + "/" + _length);

            imgLoad();

        }

        /**
    
         * 图片获取
    
         */

        var getImg = function (index) {

            var img = _this.find("li").eq(index || _index).find("img");

            if (img.size() == 1) {

                return img[0];

            } else {

                return null

            }

        }

        /**
    
         * 图片加载
    
         */

        var imgLoad = function () {

            if ($(".pv-img").eq(_index).find("img")[0]) {

                $("#J_loading").css("display", "");

                return;

            } else {

                $("#J_loading").css("display", "block");

                var tempImg = new Image(), w, h, set;

                tempImg.src = _ImgData[_index];

                $(".pv-img").eq(_index)[0].appendChild(tempImg);

                tempImg.onload = function () {

                    $("#J_loading").css("display", "");

                }

            }

        };

        /**
    
         * 创建大图查看Dome结构
    
         */

        var Create = function () {
            console.log("dd");
            _this.append("<ul class='pv-inner'></ul>").append("<p class='counts'><span class='value' id='J_index'>" + (_index + 1) + "/" + _length + "</span></p>").append("<span class='imageview-ui-loading' id='J_loading' ><i class='t1'></i><i class='t2'></i><i class='t3'></i></span>")

            for (var i = 0; i < _length; i++) {

                $(".pv-inner").append("<li class='pv-img'></li>")

            }

            imgLoad();

        };

        /**
    
         * 大图查看初始化
    
         */

        var _init = function () {            
            !!_this[0] || $("body").append("<div class='slide-view' id='slideView'></div>");

            _this = $("#slideView");
            (navigator.userAgent.indexOf("iPhone") > -1 || navigator.userAgent.indexOf("Android") > -1 && parseFloat(navigator.appVersion) >= 4) && (_advancedSupport = true);
        }();

        /**
    
         * 大图查看返回接口函数
    
         * ImageView(index,data)
    
         * index 初始索引值 nubmer
    
         * data 图片数组 array
    
         */

        var ImageView = function (index, data) {

            _ImgData = data;

            _index = index;

            _length = data.length;

            //创建dom结构

            Create();

            //dom结构显示

            _this.css("display", "block");
            _this.css("opacity", "1");
            //绑定事件
            bind();

        }        
        $.fn.ImageViewInit = function () {       
            var aImg = $(this).find("img"), aImgSrc = [];            
            //为图片绑定单击事件
            for (var i = 0, l = aImg.length; i < l; i++) {
                aImg[i].index = i;
                if (aImg[i].className.indexOf("conPic") == -1) {
                    aImg[i].className += " conPic";
                }
                aImgSrc.push(aImg[i].src);
            }            
            for (var i = 0; i < $(".conPic").length; i++) {
                if ($(".conPic")[i].complete) {
                    addTap($(".conPic")[i])
                } else {
                    $(".conPic")[i].onload = function () {
                        addTap(this);
                    }
                }
            }
            function addTap(obj) {                
                $(obj).on("tap", function () {
                    //调用ImageView                                     
                    ImageView($(obj)[0].index, aImgSrc);
                })
            }
        }              
})(window, Zepto);