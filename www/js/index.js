/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};




//dom ready
$(function(){
    var appDom = {
        pageIndex: 0,
        prePageIndex: -1,
        pagePlay: false,
        winW: $(window).width(),
        touchStart: null,
        touchDelta: null,
        isScrolling: false,
        isPullDown: false,
        pullOK: false,
        seckillOffset: null,
        searchBelowIndex: 0,
        init: function(){
            var me = this;
            //
            // app.initialize();
            me.bindHandler();
            me.initSize();
            me.initSeckill();
        },
        bindHandler: function(){
            var me = this;
            //pages
            $('#J_main').on('touchstart', function(e){
                me.cleanInit();
                if(me.pagePlay){
                    return;
                }
                var touches = e.touches[0];
                me.touchStart = {
                    x: touches.pageX,
                    y: touches.pageY
                };
                me.isScrolling = undefined;
                me.isPullDown = false;
                me.touchDelta = {};
            });
            $('#J_main').on('touchmove', function(e){
                if(me.pagePlay){
                    return;
                }
                var touches = e.touches[0];
                me.touchDelta = {
                    x: touches.pageX - me.touchStart.x,
                    y: touches.pageY - me.touchStart.y
                };
                //pull-down
                if(Math.abs(me.touchDelta.y)>Math.abs(me.touchDelta.x)){
                    var target = $(e.target);
                    //seckill
                    var seckill = target.parents('#J_seckill').length>0;
                    seckill = seckill && $('#J_seckill .bd-con').scrollTop()>1;
                    var pageSign = target.parents('.p5');
                    pageSign = pageSign && $('#J_main .p5').scrollTop()>1;
                    if(seckill || pageSign){
                        me.isPullDown = false;
                    }else{
                        me.isPullDown = true;
                        me.pullDownHandler(me.touchDelta);
                        return;
                    }
                }

                //swipe
                if(typeof me.isScrolling == 'undefined'){
                    me.isScrolling = !!(me.isScrolling || Math.abs(me.touchDelta.x)<Math.abs(me.touchDelta.y));
                }
            });
            $('#J_main').on('touchend', function(e){
                if(me.pagePlay){
                    return;
                }
                //clean
                $('#J_main .page-copy').css('display','block');
                //
                if(me.isPullDown || me.isScrolling){
                    if(me.isPullDown){
                        me.pullBackHandler();
                    }
                    return;
                }
                if(!me.touchDelta.x || Math.abs(me.touchDelta.x)<=50){
                    return;
                }
                var dir = me.touchDelta.x<0;    //left:false;   right:true;
                //swipe
                if(dir){//right
                    me.pageSwipeLeft()
                }else{//left
                    me.pageSwipeRight()
                }
            });
            //seckill
            $('#J_seckill .bd-con').on('scroll', function(e){
                var target = $('#J_seckill .bd-con');
                var left = target.scrollTop();
                var tmp = left + 10;
                var num = Math.floor(tmp/(me.seckillOffset.item+me.seckillOffset.margin));
                //move
                var moveItem;
                for(var i=0; i<=num; i++){
                    moveItem = $('#J_seckill .percent span').eq(i+3);
                    if(moveItem.length>0){
                        me.seckillMove(moveItem);    
                    }
                }
            });
            //search
            $('#J_searchHd').on('tap', function(e){
                me.searchBelowIndex = me.pageIndex;
                me.pullOK = true;
                me.pullBackHandler();
            });
            $('#J_main .search-page .cancel').on('tap', function(e){
                me.touchDelta = {x: 20};
                me.pageSwipeLeft();
            });
        },
        pullDownHandler: function(delta){
            var me = this;
            var maxH = 140;
            //pull-down 
            var posY = delta.y > maxH ? maxH : delta.y;
            posY = posY<0 ? 0 : posY;
            $('#J_wrapper').css({
                top: posY
            });
            $('#J_wrapper .header').css({
                'opacity': 1-posY/maxH,
                'z-index': 15
            });
            $('#J_topBar').css({
               '-webkit-transform': 'translateY('+(posY - maxH)+'px)'
            });
            $('#J_topBar .top-bar-con').css({
               '-webkit-transform': 'scale('+posY/maxH+') translateY(-50%)',
               'opacity': posY/maxH
            });
            me.pullOK = false;
            //move-left/right
            if(posY >= maxH){
                me.pullOK = true;
                var perOffset = 15;
                var perW = parseInt(me.winW/4)-perOffset;
                
                var index = 1;
                var preIndex = $('#J_topBar .cur').index()-1;
                var bgOffset = 0;
                if(Math.abs(delta.x)>=perW){
                    index = delta.x<0 ? 0 : 2;
                    bgOffset = delta.x<0 ? -103 : 103;
                }else if(Math.abs(delta.x)<=perOffset*4){
                    index = 1;
                }
                $('#J_topBar .moving-bg').css({
                    '-webkit-transform': 'translateX('+bgOffset+'px)'
                });
                $('#J_topBar span').removeClass('cur');
                $('#J_topBar span').eq(index).addClass('cur');
            }
        },
        pullBackHandler: function(){
            var me = this;
            // return;
            //select-cur
            if(me.pullOK){
                var index = $('#J_topBar .cur').index()-1;
                if(me.pageIndex != -1 && index == 1){//search
                    $('#J_main .page-copy').addClass('show');
                    $('#J_searchHd').addClass('moving');
                    $('#J_tag li').removeClass('cur');
                    //anim
                    setTimeout(function(){
                        me.pageIndex = -1;
                        //pos
                        var pos = me.pageIndex * me.winW;
                        pos = -pos;
                        pos += 0.001;
                        $('#J_main .page-con').css({
                            '-webkit-transform': 'translate3d('+pos+'px,0,0)',
                            'transform': 'translate3d('+pos+'px,0,0)'
                        });
                    },500);
                    setTimeout(function(){
                        $('#J_main .page-copy').removeClass('show');
                        $('#J_main .page-copy').addClass('hide');
                    },1100);
                    setTimeout(function(){
                        $('#J_main .page-copy').css('display','none');
                        $('#J_main .page-copy').removeClass('hide');
                    },1600);
                }
            }
            me.pullOK = false;
            //clean
            $('#J_wrapper').css({
                top: 0
            });
            $('#J_topBar').attr('style','');
            $('#J_wrapper .header').attr('style','');
            $('#J_topBar .top-bar-con').attr('style','');
            $('#J_topBar .moving-bg').attr('style','');
            $('#J_topBar span').removeClass('cur');
            $('#J_topBar span').eq(1).addClass('cur');
        },
        pageSwipeLeft: function(){
            var me = this;
            //
            me.pagePlay = true;
            me.cleanInit();
            var pageMax = $('#J_main .page').length -1;
            //
            var index = me.pageIndex + 1;
            if(index>=pageMax){
                index = pageMax-1;
                me.pagePlay = false;
                return;
            }
            me.pagePos(index);
        },
        pageSwipeRight: function(){
            var me = this;
            me.cleanInit();
            //
            var index = me.pageIndex - 1;
            if(index<-1){
                index = -1;
                me.pagePlay = false;
                return;
            }
            me.pagePos(index);
        },
        pagePos: function(index){
            var me = this;
            var pages = $('#J_main .page-con');
            //pos
            var pos = index * me.winW;
            pos = -pos;
            pos += 0.001;
            pages.css({
                '-webkit-transform': 'translate3d('+pos+'px,0,0)',
                'transform': 'translate3d('+pos+'px,0,0)'
            });
            me.prePageIndex = me.pageIndex;
            me.pageIndex = index;
            //clean
            setTimeout(function(e){
                $('#J_main .page').removeClass('moved');
                $('#J_main .page').eq(me.pageIndex+1).addClass('moving');
            },200);
            setTimeout(function(e){
                var me = appDom;
                $('#J_main .page').removeClass('moving');
                $('#J_main .page').eq(me.pageIndex+1).addClass('moving');
            },600);
            //search
            var isSearchDir = '';
            if(me.prePageIndex<0 || me.pageIndex){
                if(me.pageIndex<0){
                    $('#J_searchHd').addClass('moving');
                    isSearchDir = 'left';
                }
                if(me.prePageIndex<0){
                    $('#J_searchHd').removeClass('moving');
                    isSearchDir = 'right';
                }
            }
            //tag
            var dir = me.touchDelta.x<0;
            if(!dir){
                $('#J_tag li').eq(me.prePageIndex).addClass('moveleft');
            }
            $('#J_tag li').removeClass('movingsmall');
            $('#J_tag li').removeClass('movingbig');
            if(isSearchDir.length == 0){
                $('#J_tag li').eq(me.prePageIndex).addClass('movingsmall');
                $('#J_tag li').eq(me.pageIndex).addClass('movingbig');
            }else if(isSearchDir=="left"){
                $('#J_tag li').eq(me.prePageIndex).addClass('movingsmall');
            }else if(isSearchDir=="right"){
                $('#J_tag li').eq(me.pageIndex).addClass('movingbig');
            }
            //center
            var leftPos = 73;
            var offset = 41 + leftPos;
            var mainCls = 'moving';
            var nextBgCls = 'bg'+me.pageIndex+'-'+me.prePageIndex;
            var curBgCls = 'bg'+me.prePageIndex+'-'+me.pageIndex;
            if(!dir && isSearchDir.length==0){
                offset = -19 + leftPos;
                mainCls = 'moving-left';
                nextBgCls = 'bg'+me.prePageIndex+'-'+me.pageIndex;
                curBgCls = 'bg'+me.pageIndex+'-'+me.prePageIndex;
            }
            if(isSearchDir.length>0){
                mainCls = "moving-search";
            }
            var tmpIndex = me.prePageIndex;
            if(isSearchDir.length>0){
                tmpIndex = 0;
                offset = 50;
            }
            // offset -= 8;
            $('#J_moveCenter').css({
                left: tmpIndex*20 + offset
            });
            $('#J_moveCenter').addClass(mainCls)
                              .addClass(nextBgCls)
                              .find('.tobg').addClass(curBgCls);
            //clean
            setTimeout(function(){
                $('#J_tag li').removeClass('cur');
                $('#J_tag li').removeClass('movingbig');
                $('#J_tag li').removeClass('movingsmall');
                $('#J_tag li').removeClass('moveleft');
                me.pageIndex>=0 ? $('#J_tag li').eq(me.pageIndex).addClass('cur'): -1;
                me.pagePlay = false;
                isSearchDir = '';
            },700)
            setTimeout(function(){
                $('#J_moveCenter').attr('class','move-center')
                                  .find('.tobg').attr('class','tobg');
            },900);
        },
        initSize: function(){
            var me = this;
            var winH = $(window).height();
            var top = $('.header').height();
            var bottom = $('.footer').height()
            var maxHeight = winH - top - bottom;
            //
            $('#J_main .p5').css('height',maxHeight);
        },
        initSeckill: function(){
            var me = this;
            var seckillNode = $('#J_seckill');
            var num = seckillNode.find('.itepullms img').length;
            var offset = 20;
            var wholeHeight = (1113/601)*(me.winW-8)/2;
            wholeHeight = Math.ceil(wholeHeight);
            var hdHeight = (96/601)*(me.winW-8)/2;
            hdHeight = parseInt(hdHeight);
            /*seckillNode.css({
                height: wholeHeight
            }).find('.bd').css({
                height: wholeHeight - hdHeight
            });*/
            //percent
            me.seckillOffset = {
                item: (wholeHeight-hdHeight)*0.25,
                margin: 0
            }
            //play
            me.seckillPlay();
            setTimeout(function(){
                $('#J_main .page-con').addClass('init-moving');
            },400);
            setTimeout(function(){
                appDom.seckillPercent();
                // $('#J_main .page-con').removeClass('init-moving');
            },1000);
            setTimeout(function(){
                $('#J_main .page-con').removeClass('init-moving');
            },1500);
        },
        seckillPlay: function(){
            var me = this;
            var mNode = $('#J_seckill .m');
            var mValue = Number(mNode.text());
            var sNode = $('#J_seckill .s');
            var sValue = Number(sNode.text());
            var tmp;
            setInterval(function(){
                tmp = sValue - 1;
                if(tmp<0){
                    sValue = 59;
                    mValue -= 1;
                    mValue = mValue<0 ? 59 : mValue;
                }else{
                    sValue = tmp<=9 ? '0'+tmp : tmp;
                }
                mNode.text(mValue);
                sNode.text(sValue);
            }, 1000);
        },
        seckillPercent: function(){
            var me = this;
            var arr = $('#J_seckill .percent span');
            var item;
            for(var i=0; i<4; i++){
                item = $(arr[i]);
                me.seckillMove(item);
            }
        },
        seckillMove: function(item){
            var me = this;
            var val = item.find('em').text();
            item.find('i').css({
                width: val
            });
            item.find('em').css({
                left: val
            });
        },
        cleanInit: function(){
            $('#J_main .page-con').removeClass('init-moving');
        },
        //utils
        formatPx: function(num){
            num = num.replace('px','');
            num = parseInt(num);
            return num;
        },
        getScaleSize: function(cur, whole){
            var me = this;
            var offset = 20;
            var size = cur/whole*(me.winW - offset);
            size = parseInt(size);
            return size;
        },
    }

    //init
    appDom.init(); 
});
