(function (win) {

    var vTools = function () {

    };

    //过滤器
    vTools.Filter = function (data, filter) {

        var self = this;

        var _renData = [], _renIndex = [];

        //验证数据
        var _funCheck = function () {

            //filter 是否有效
            if (filter == null || filter == undefined)
                return false;

            //是否为数组
            if (!(data instanceof Array))
                return false;

            //判断过滤器是否为数组
            if (!(filter instanceof Array)) {
                filter = [filter];
            }

            return true;
        }

        //过滤
        var _funFilter = function (_data, _filter) {

            for (var i in _data) {

                //判断字段是否为数组
                if (_data[i] instanceof Array) {
                    continue;
                }

                //判断过滤器是否为数组
                for (var j in _filter) {
                    if (_funValidate(_data[i], _filter[j])) {
                        _renData.push(_data[i]);
                        _renIndex.push(i);
                    }
                }
            }
        }

        //验证值是否符合filter
        var _funValidate = function (itemData, itemFilter) {

            var _validate;

            for (var key in itemFilter) {

                _validate = false;

                if (key == 'equeal')
                    continue;

                //是否包含
                if (!(key in itemData))
                    return false;

                //是否所以的值都可以
                if (itemFilter[key] == undefined)
                    continue;

                //是否值必须相等
                if (itemFilter.equeal == undefined)
                    itemFilter.equeal = '=';

                //判断值
                switch (itemFilter.equeal) {
                    case "=": _validate = itemFilter[key] == itemData[key]; break;
                    case "!=": _validate = itemFilter[key] != itemData[key]; break;
                    case ">": _validate = itemFilter[key] > itemData[key]; break;
                    case "<": _validate = itemFilter[key] < itemData[key]; break;
                    case ">=": _validate = itemFilter[key] >= itemData[key]; break;
                    case "<=": _validate = itemFilter[key] <= itemData[key]; break;
                }

                if (!_validate)
                    return false;
            }

            return true;
        }

        //获取列表数据
        var _funList = function () {
            if (!_funCheck())
                return data;

            //执行过滤
            _funFilter(data, filter);

            //返回数据
            return _renData.length > 0 ? _renData : null;
        }

        //获取一条数据
        var _funFirst = function () {

            var vData = _funList();

            //第一条数据
            if (vData != null)
                return { data: vData[0], index: _renIndex[0] };

            return { data: null, index: -1 };
        }

        return {
            First: _funFirst,
            List: _funList
        };
    }

    //动画执行器
    vTools.Animals = function (voption) {

        var currentData = null, currentIndex = 0, currentDom = null, idPrefix = 'animal-id-', option = { filters: ["html"], dataArry: [] },filterModel, vself = this;

        option = $.extend(option, voption);

        //验证数据
        var _checkItem = function (item) {
            //获取数据
            currentData = item;
            //获取Dom
            currentDom = $("#" + currentData.id);

            //标签是否存在
            if (currentDom.length == 0)
                return false;

            return true;
        }

        //渲染css
        var _RenderCss = function () {

            //样式
            if (currentData.style != undefined)
                currentDom[0].style = currentData.style;

            //值
            switch (currentData.valAttr) {
                case "text": currentDom.text(currentData.val); break;
                case "src": currentDom.attr("src", currentData.val); break;
                case "backgroundImg": currentDom.css("backgroundImage", currentData.val); break;
                default: currentDom.text(currentData.val); break;
            }
        }

        //加载动画
        var _InitAnimal = function () {

            if (currentData.animal == undefined || currentData.animal.length == 0)
                return;


            //级联动画播放顺序
            var sumItemArry = [];

            //排序
            if (currentData.animalend && currentData.animalend.length > 0) {
                //排序
                var sumAnimal = vTools.Sort(currentData.animalend, "sort");

                for (var i in sumAnimal) {
                    var item = vTools.Filter(vData, { id: sumAnimal[i].id }).First();
                    //将动画数据添加到集合
                    if (item.data != null) {
                        //设置动画数据延迟加载
                        vData[item.index].animaldelay = true;
                        sumItemArry.push(item.data);
                    }
                }
            }

            //动画是否延迟加载
            if (currentData.animaldelay) {
                //隐藏dom
                currentDom.css("visibility", "hide");
                return;
            }

            //渲染Css
            _RenderCss();

            //显示dom
            currentDom.css("visibility", "visible");

            //当前动画播放结束后执行级联动画
            var animalEnd = function () {

                for (var i in sumItemArry) {
                    //取消动画延迟
                    sumItemArry[i].animaldelay = false;
                    //加载动画信息
                    _InitItem(sumItemArry[i]);
                }
            }

            //动画拍下
            currentData.animal = vTools.Sort(currentData.animal, "sort");

            //渲染动画
            var v = new _RenderAnimal(currentDom, currentData.animal, sumItemArry.length == 0 ? undefined : animalEnd);
            v._ShowAnimal(0);
        }

        //渲染动画
        var _RenderAnimal = function (dom, animatedArry, callback) {
            var _raself = this;
            //显示动画
            _raself._ShowAnimal = function (showIndex) {
                showIndex = showIndex || 0;
                if (showIndex == animatedArry.length) {
                    //情况数据 防止内存泄漏
                    animatedArry = null;
                    dom = null;
                    if (callback)
                        callback();
                    return;
                }

                //动画的运行时间
                if (animatedArry[showIndex].duration)
                    _raself.SetAnimalDuration(animatedArry[showIndex].duration, dom, false);

                //动画的运行时间
                if (animatedArry[showIndex].delay)
                    _raself.SetAnimalDelay(animatedArry[showIndex].delay, dom, false);

                //当个动画
                if (animatedArry[showIndex].name)
                    dom.addClass("animated " + animatedArry[showIndex].name);
                else if (animatedArry[showIndex].names) //多动画组合
                    dom.css("animation", animatedArry[showIndex].names);

                //渲染添加动画样式
                dom.one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function () {
                    if (animatedArry == null || animatedArry[showIndex] == null)
                        return;

                    console.log(dom.attr("id") + "_" + showIndex);

                    //动画不重复 则删除该动画
                    if (animatedArry[showIndex].infinite == undefined || animatedArry[showIndex].infinite == false) {
                        //判断是单个动画还是组合
                        if (animatedArry[showIndex].name)
                            dom.removeClass("animated " + animatedArry[showIndex].name);
                        else
                            dom.css("animation", "");
                    }

                    //动画的运行时间
                    if (animatedArry[showIndex].duration)
                        _raself.SetAnimalDuration(animatedArry[showIndex].duration, dom, true);

                    //动画的运行时间
                    if (animatedArry[showIndex].delay)
                        _raself.SetAnimalDelay(animatedArry[showIndex].delay, dom, true);

                    showIndex++;
                    //继续显示动画
                    _raself._ShowAnimal(showIndex);
                });

            }

            //设置动画运行的时间
            _raself.SetAnimalDuration = function (times, dom, del) {

                if (del == undefined || del == false) {
                    dom.css({
                        "-moz-animation-duration": times + "s",
                        "-webkit-animation-duration": times + "s",
                        "animation-duration": times + "s",
                    });
                } else {
                    dom.css({
                        "-moz-animation-duration": "",
                        "-webkit-animation-duration": "",
                        "animation-duration": "",
                    });
                }
            }

            //设置动画运行的时间
            _raself.SetAnimalDelay = function (times, dom, del) {

                if (del == undefined || del == false) {
                    dom.css({
                        "-moz-animation-delay": times + "s",
                        "-webkit-animation-delay": times + "s",
                        "animation-delay": times + "s",
                    });
                } else {
                    dom.css({
                        "-moz-animation-delay": "",
                        "-webkit-animation-delay": "",
                        "animation-delay": "",
                    });
                }
            }
        }

        //初始加载单条数据
        var _InitItem = function (item) {

            //验证数据
            if (!_checkItem(item))
                return;

            //加载动画
            _InitAnimal();
        }

        //加载过滤器
        var _InitFilter = function () {

            var filterIndex = 0, vDataArry = new Array(option.filters.length), fself = this;

            //设置需要运行的page数据
            fself.GetData = function (filter) {

                if (filter == undefined)
                    filterIndex = 0;
                else
                    filterIndex = option.filters.indexOf(filter);

                //返回已经加载的数据
                if (vDataArry[filterIndex] != undefined)
                    return vDataArry[filterIndex];

                //获取当前page的值
                if (option.dataArry != undefined && option.dataArry.length > 0)
                    vDataArry[filterIndex] = option.dataArry[filterIndex];
                else
                    vDataArry[filterIndex] = [];

                //初始加载数据
                vTools.GetDomData(vDataArry[filterIndex], $(option.filters[filterIndex] + ":first").find("*[data-animal]"), "data-animal", idPrefix);

                //排序
                vDataArry[filterIndex] = vTools.Sort(vDataArry[filterIndex], "animalsort");

                return vDataArry[filterIndex];
            }
        }

        //开始执行
        vself.Start = function (filter) {

            //初始加载数据
            //vTools.GetDomData(vData, $(option.filters[filterIndex]+":first").find("*[data-animal]"), "data-animal", idPrefix);

            //排序
            vData = filterModel.GetData(filter);
             
            //执行数据
            for (var i in vData) {
                _InitItem(vData[i]);
            }
        }

        //加载数据
        filterModel = new _InitFilter();

    };

    //获取数据
    vTools.GetDomData = function (vData, jQueryDom, attrName, idPrefix) {

        //将控件填充值数据集合
        if (jQueryDom.length > 0) {
            jQueryDom.each(function (i, dom) {

                if (dom.attributes["id"] != undefined && vTools.Filter(vData, { id: dom.attributes["id"].value }).First().data != null)
                    return true;

                //加载动画数据
                vData.push(eval("(" + dom.attributes[attrName].value + ")"));

                //数据中设置了ID
                if (vData[vData.length - 1].id != undefined) {
                    dom.setAttribute("id", vData[vData.length - 1].id);
                    return
                }

                //判断该数据是否设置ID
                if ((vData[vData.length - 1].id = dom.getAttribute("id")) == null) {
                    //设置数据ID
                    vData[vData.length - 1].id = vTools.UUID(idPrefix, vData);
                    //设置ID
                    dom.setAttribute("id", vData[vData.length - 1].id);
                }
            });
        }

        return vData;

    };

    //排序
    vTools.Sort = function (vData, sortName) {

        if (vData == undefined || sortName == undefined)
            return vData;

        //排序标识
        var sort = -1;

        //数据排序
        vData = vData.sort(function (a, b) {
            a[sortName] = (a[sortName] || sort++);
            b[sortName] = (b[sortName] || sort + 1);

            return a[sortName] - b[sortName];
        });

        return vData;
    }

    //获取ID
    vTools.UUID = function (vPrifix, vData) {

        var idPrefix = vPrifix || "id-uuid-";

        //水机生产ID
        var vId = idPrefix + parseInt(Math.random() * 10000);

        //判断ID是否存在
        if (document.getElementById(vId) != null)
            return vTools.UUID();



        //当前数据中是否有改标识ID
        if (vData != undefined && vTools.Filter(vData, { id: vId }).First().data != null)
            return vTools.UUID();

        return vId;
    }

    //编辑
    vTools.Editor = function (voption) {

        var currentData = null,
            currentDom = null,
            currentIndex = -1,
            option = { filter: "html", data: [] },
            idPrefix = 'edit-id-',
            vEditorText,
            vEditorImg,
            vEditorDel,
            vEditorFontColor,
            vEditorPrev,
            vEditorNext,
            vself = this;

        //初始加载
        vself.Init = function (vfilter) {
            //合并参数
            option = $.extend(option, voption);

            //过滤器
            option.filter = vfilter || 'html';

            //初始加载数据
            vTools.GetDomData(option.data, $(option.filter).find("*[data-edit]"), "data-edit", idPrefix);

            //执行一次
            //SetCurrent(0);

            //加载按钮
            vEditorText = $("#id-editor-text");
            vEditorImg = $("#id-editor-img");
            vEditorDel = $("#id-editor-del");
            vEditorFontColor = $("#id-editor-fontcolor");
            vEditorPrev = $("#id-editor-prve");
            vEditorNext = $("#id-editor-next");
        };

        //点击事件
        vself.EditorClick = function (type, dom) {

            if ($(dom).attr("class").indexOf("disabled") != -1)
                return;

            //处理方法 返回false 终止执行
            if ("prve,next".indexOf(type) == -1 && currentData.editStart && currentData.editStart(type) == false) {
                //执行编辑结束
                if (currentData.editEnd)
                    currentData.editEnd(type);
                return;
            }
            switch (type) {
                case "prve": SetCurrent(currentIndex - 1); break;
                case "next": SetCurrent(currentIndex + 1); break;
                case "text": EditorText(); break;
                case "img": EditorImg(); break;
                case "del": EditorDel(); break;
                case "color": EditorColor(); break;
            }
        }

        //设置当前编辑的数据
        var SetCurrent = function (vindex) {

            if (vindex >= option.data.length || vindex < 0)
                return;

            var vDom = $("#" + option.data[vindex].id);

            //标签不存在
            if (vDom.length == 0) {
                SetCurrent(vindex > currentIndex ? vindex++ : vindex--);
                return;
            }


            //清空边框
            ClearBorder();

            currentIndex = vindex;
            currentData = option.data[vindex];
            currentDom = vDom;

            //设置边框
            currentDom.width(currentDom.width() - 2);
            currentDom.height(currentDom.height() - 2);
            currentDom.css("border", "0.01rem dashed white");

            //设置显示那些编辑按钮
            SetEditorIcon();

        };

        //清空边框
        var ClearBorder = function () {
            //设置边框
            if (currentDom == null)
                return;

            currentDom.css("border", "initial");
            currentDom.width(currentDom.width() + 2);
            currentDom.height(currentDom.height() + 2);

        }

        //设置编辑按钮是否可编辑
        var SetEditorIcon = function () {

            vEditorText.addClass("disabled");
            vEditorImg.addClass("disabled");
            vEditorDel.addClass("disabled");
            vEditorFontColor.addClass("disabled");
            vEditorNext.addClass("disabled");
            vEditorPrev.addClass("disabled");

            if (currentData.edit == undefined)
                return;

            //下一页是否可以点击
            if (currentIndex < option.data.length - 1)
                vEditorNext.removeClass("disabled");

            //上一页是否可以点击
            if (currentIndex > 0)
                vEditorPrev.removeClass("disabled");

            //编辑按钮是否可以点击
            for (var key in currentData.edit) {
                switch (currentData.edit[key]) {
                    case "src":
                    case "background-image": vEditorImg.removeClass("disabled"); break;
                    case "color": vEditorFontColor.removeClass("disabled"); break;
                    case "text": vEditorText.removeClass("disabled"); break;
                    case "del": vEditorDel.removeClass("disabled"); break;
                }
            }
        }

        //执行修改文本
        var EditorText = function () {

            layer.open({
                content: "<textarea class='text-edit-modify'  rows='4' style='width:100%'>" + currentDom.text() + "</textarea>",
                btn: ['确定', '取消'],
                yes: function (index) {

                    var newVal = $("textarea[class='text-edit-modify']").val();

                    //验证
                    if (!EditorValidate(newVal))
                        return;

                    //赋值
                    currentDom.text(newVal);

                    //关闭
                    layer.close(index);

                    //触发删除事件
                    if (currentData.editEnd)
                        currentData.editEnd('text');
                }
            });

        };

        //修改图片
        var EditorImg = function () {

            //底部对话框
            var lindex = layer.open({
                content: '选择手机图片',
                btn: ['相册', '拍照'],//['本地上传', '网络图片'],
                skin: 'footer',
                yes: function () {
                    //onChooseImg(['-ufile-img-20170510-221251101.jpg']);
                    //选择
                    WXTools.ChoiseAndUpolad({ sourceType: ['album'] }, onChooseImg);
                },
                no: function () {
                    WXTools.ChoiseAndUpolad({ sourceType: ['camera'] }, onChooseImg);
                }
            });

            //选择图片
            var onChooseImg = function (imgSrc) {

                //配置裁剪图片参数
                var cutOption = { src: imgSrc.replace(/-/g, "/"), base64: true, end: onCutImg };

                //图片高宽
                if (currentData.validate) {
                    //截取图片的宽高
                    if (currentData.validate.width)
                        cutOption.width = currentData.validate.width;

                    if (currentData.validate.height)
                        cutOption.height = currentData.validate.height;
                } else {
                    cutOption.width = currentDom.width();
                    cutOption.height = currentDom.height();
                }

                //截取图片
                vTools.CutImg(cutOption)
            }

            //当截图完成
            var onCutImg = function (imgdata) {

                if (currentData.edit.indexOf('src') != -1) {
                    currentDom.attr("src", imgdata);
                } else {
                    currentDom.css("backgroundImage", imgdata);
                }

                //触发删除事件
                if (currentData.editEnd)
                    currentData.editEnd('img');

                layer.close(lindex);
            }
        }

        //删除
        var EditorDel = function () {
            //底部对话框
            layer.open({
                content: '确认删除吗？',
                btn: ['确定', '取消'],
                skin: 'footer',
                yes: function (index) {
                    currentDom.hide();
                    option.data.splice(currentIndex, 1);
                    layer.close(index);

                    //触发删除事件
                    if (currentData.editEnd)
                        currentData.editEnd('del');
                }
            });
        }

        //选择颜色
        var EditorColor = function () {
            $("#inp-edit-color").one("change", function () {
                currentDom.css("color", $(this).val());
                $(this).val("");
                //触发删除事件
                if (currentData.editEnd)
                    currentData.editEnd('color');
            });

            $("#inp-edit-color").click();
        }

        //验证输入
        var EditorValidate = function (val) {

            if (currentData.validate == undefined)
                return true;

            var validate = currentData.validate;

            //获取中文字符
            var cArr = val.match(/[^\x00-\xff]/ig);
            //长度
            var valLength = val.length + (cArr == null ? 0 : cArr.length);

            if (validate.checknull && $.trim(val) == "") {
                //提示
                layer.msg("不能设置空的字符");
                return false;
            }

            if (validate.minlen && validate.minlen > valLength) {
                //提示
                layer.msg("需大于" + validate.minlen + "个字符长度");
                return false;
            }

            if (validate.maxlen && validate.maxlen < valLength) {
                //提示
                layer.msg("需小于" + validate.minlen + "字符长度");
                return false;
            }

            return true;
        }
    }

    //裁剪图片
    vTools.CutImg = function (voption) {

        var option = { src: '', width: undefined, height: undefined, base64: false, loadimg: false, end: undefined }, self = this;

        //合并参数
        option = $.extend(option, voption);

        //验证数据
        var CheckOption = function (callback) {

            var image = new Image();
            image.src = option.src;

            //图片高度
            if (option.width == undefined)
                option.width = image.width;
            //图片宽度
            if (option.height == undefined)
                option.height == image.height;

            //图片加载完成
            if (image.complete) {
                option.loadimg = true;
                callback();
                return;
            }

            //图片加载失败
            image.onerror = function () {
                option.loadimg = false;
            };

            image.onload = function () {
                option.loadimg = true;
                callback();
            }


        }

        //显示界面
        var ShowView = function () {
            //弹出层
            var layindex = layer.open({
                type: 1,
                content: '<div style="padding: 0.2rem;background-color: #5e5e5e;overflow: hidden;"><i class="iconfont icon-xiugai" id="i-icon-back" style="font-size:1.0rem; margin:0.2rem;color:white;display:inline-block;"></i>' +
                         '<button class="btn btn-info pull-right" id="btn-id-cut">裁剪</button></div><div><img src="' + option.src + '" style="width:100%;" id="img-id-cut"></div>',
                style: 'position:fixed; left:0; top:0; width:100%; height:100%; border: none; -webkit-animation-duration: .5s; animation-duration: .5s;'
            });

            //关闭弹出层
            $("#i-icon-back").one("click", function () {
                layer.close(layindex);
            });

            //裁剪图片
            $("#btn-id-cut").one("click", function () {
                if (option.end) {
                    option.end(GetImg());
                }
                layer.close(layindex);
            });

            //加载Cropper对象
            LoadCropper();
        }

        //加载Cropper对象
        var LoadCropper = function () {
            //Cropper对象
            self.CroModel = $('#img-id-cut').cropper({
                viewMode: 1,
                dragMode: 'move',
                aspectRatio: option.width / option.height,
                restore: false,
                guides: false,
                highlight: false,
                cropBoxMovable: false,
                cropBoxResizable: false
            });
        }

        //执行裁剪图片 并返回数据
        var GetImg = function () {

            //获取截取数据
            var vCutData = self.CroModel.cropper("getCroppedCanvas", { width: option.cutwidth, height: option.cutheight });

            //返回图片数据
            if (option.base64) {
                return vCutData.toDataURL('image/jpeg');
            }
            return vCutData.toBlob();;
        }

        CheckOption(function () {
            ShowView();
        });
    }

    //播放音乐
    vTools.Audio = function (voption) {

        //播放音乐 是否播放  当前显示的颜色
        var vAudioDom = null, vplayed = false, option = { playend: null }, self = this;

        option = $.extend(option, voption);

        //加载播放器
        self.loadAudio = function (src) {
            if (src != '' && vAudioDom == null) {
                vAudioDom = document.createElement("audio");
                vAudioDom.src = src;
                //循环播放
                vAudioDom.loop = true;
            } else {
                vAudioDom.src = src;
            }
            self.palyAudio(true);
        }

        //播放或暂停
        self.palyAudio = function (play) {

            if (play != undefined)
                vplayed = play;
            else
                vplayed = !vplayed;

            //暂停
            if (!vplayed) {
                vAudioDom.pause();
            } else {
                //继续播放
                vAudioDom.play();
            }

            //播放后回调
            if (option.playend != null)
                option.playend(vplayed);
        }

        //编辑结束
        self.editEnd = function (etype) {
            if (etype == 'del') {
                self.palyAudio(false);
            }
        };

        //编辑歌曲
        self.changeSong = function (etype) {

            //不是编辑时
            if (etype != 'text')
                return true;

            self.palyAudio(false);

            //选择歌曲
            //弹出层
            var layindex = layer.open({
                type: 1,
                content: '<div class="div-layer-title">选择歌曲</div><i class="div-layer-close iconfont icon-close" onclick="layer.closeAll();"></i><iframe src="' + Host.WYJH5Size + '/Resource/Music" class="iframe-layer-music" />',
                style: 'position:fixed; left:0; top:0; width:100%; height:100%; border: none; -webkit-animation-duration: .5s; animation-duration: .5s;',
                className: "iframe-layer-music",
                end: function () {
                    self.palyAudio(true);
                }
            });

            return false;
        }

        //当选择歌曲后
        win.OnChoiseSong = function (song) {
            //更换歌曲
            if (song != undefined)
                self.loadAudio(Host.WYJH5Size + song.url.replace(/-/g, '/'));
            //关闭层
            layer.closeAll();
        }
    }

    win.Tools = vTools;
})(window);


