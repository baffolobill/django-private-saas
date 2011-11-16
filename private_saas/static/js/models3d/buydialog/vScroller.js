(function($){
    $.fn.hScroller = function(settings){
        
        var defaultSettings = {
            zIndex: 9999,
            containerId: '',
            content: ''
        };
        
        settings = $.extend(defaultSettings, settings);
        
        var root = this;
        
        var hs = new HorizontalScroller(this, settings);
            
        return hs.init();
        /*return this.each(function(){
            var elem = $(this);
            var hs = new HorizontalScroller(this);
            
            return hs.init();
        });*/
    }
    
    /**
    ** HorizontalScroller Class Definition
    **/
    
    function HorizontalScroller(root, settings){
        this.root = root;
        this.settings = settings;
        
        this.scrollPane = null;
        this.scrollContent = null;
        this.scrollbar = null;
        this.handleHelper = null;
        
        this.debug_mode = true;
    }
    
    HorizontalScroller.prototype = {
        debug: function(msg){
            if (this.debug_mode){
                console.log('hScroller: '+msg);
            }
        },
        init: function(){
            var self = this;
            
            if (this.scrollPane == null){
                this.debug('scrollPane init');
                this.scrollPane = $('<div class="scroll-pane clearfix">'+
                                        '<div class="scroll-content clearfix"></div>'+
                                        '<div class="scroll-bar-wrap clearfix">'+
                                            '<div class="scroll-bar"></div>'+
                                        '</div>'+
                                    '</div>');
                                    
                this.scrollPane.css('overflow', 'hidden');
            }
            if (this.scrollContent == null){
                this.debug('scrollContent init');
                this.scrollContent = $('.scroll-content', this.scrollPane).html(this.root);
                var l = this.scrollContent.find('li').last();
                var w = l.offset().left + l.width();
                this.debug('scrollContent.width == '+l);
            }
            if (this.scrollbar == null){
                this.debug('scrollbar init');
                this.scrollbar = $('.scroll-bar', this.scrollPane).slider({
                    slide: function(event, ui){
                        var marginLeft = 0;
                        var scWidth = self.scrollContent.width();
                        var spWidth = self.scrollPane.width();
                        
                        if (scWidth > spWidth){
                            marginLeft = Math.round(ui.value/100*(spWidth-scWidth))+'px';
                        }
                        self.scrollContent.css('margin-left', marginLeft);
                    }
                });
            }
            if (this.handleHelper == null){
                this.debug('handleHelper init');
                this.handleHelper = this.scrollbar.find('.ui-slider-handle')
                .mousedown(function(){
                    self.scrollbar.width(self.handleHelper.width());
                })
                .mouseup(function(){
                    self.scrollbar.width("100%");
                }).wrap('<div class="ui-handle-helper-parent"></div>').parent();
            }
            
            this.bind();
            
            return this.scrollPane;
        },
        
        //size scrollbar and handle proportionally to scroll distance
        sizeScrollbar: function(self){
            if (typeof(self) == 'undefined')
                self = this;
        
            var scWidth = self.scrollContent.width();
            var spWidth = self.scrollPane.width();
            var remainder = scWidth - spWidth;
            var proportion = remainder / scWidth;
            var handleSize = spWidth - (proportion * spWidth);
            self.scrollbar.find('.ui-slider-handle').css({
                width: handleSize,
                'margin-left': -handleSize/2
            });
            self.handleHelper.width('').width(self.scrollbar.width() - handleSize);
        },
        
        //reset slider value based on scroll content position
        resetValue: function(self){
            if (typeof(self) == 'undefined'){
                self = this;
            }
            
            var remainder = self.scrollPane.width() - self.scrollContent.width();
            var leftVal = self.scrollContent.css('margin-left') === 'auto' ? 0 :
                parseInt(self.scrollContent.css('margin-left'));
            var percentage = Math.round(leftVal / remainder * 100);
            self.scrollbar.slider('value', percentage);
        },
        
        //if the slider is 100% and window gets larger, reveal content
        reflowContent: function(self){
            if (typeof(self) == 'undefined'){
                self = this;
            }
            var showing = self.scrollContent.width() + 
                    parseInt(self.scrollContent.css('margin-left'), 10);
            var gap = self.scrollPane.width() - showing;
            if (gap > 0){
                self.scrollContent.css('margin-left', 
                    parseInt(self.scrollContent.css('margin-left'), 10) + gap);
            }
        },
        
        bind: function(){
            var self = this;
            //change handle position on window resize
            $(window).resize(function(){
                self.resetValue(self);
                self.sizeScrollbar(self);
                self.reflowContent(self);
            });
            
            //init scrollbar size
            //safari wants a timeout
            setTimeout(function(){self.sizeScrollbar(self); self = null;}, 10);
        }

    }
})(jQuery);
