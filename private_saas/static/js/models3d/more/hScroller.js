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

        this.is_timer_active = false;
        this.timeout = null;
        this.button_pressed = false;
        
        this.debug_mode = false;
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
                                    
                
            }
            if (this.scrollContent == null){
                this.debug('scrollContent init');
                this.scrollContent = $('.scroll-content', this.scrollPane).html(this.root);

                //this.debug('scrollContent.width == '+w);
            }
            if (this.scrollbar == null){
                this.debug('scrollbar init');
                this.scrollbar = $('.scroll-bar', this.scrollPane).slider({
                    start: function(){ self.button_pressed = true; },
                    stop: function(){ 
                        self.button_pressed = false; 
                        if (!self.is_timer_active){
                            self.timeout = setTimeout(function(){ $('#moreContainerId .bodyMore').removeClass('active'); self.is_timer_active = false; }, 1000);
                            self.is_timer_active = true;
                        }
                    },
                    slide: function(event, ui){
                        var marginLeft = 0;
                        //var scWidth = self.scrollContent.width();

            			var scWidth = 3;
            			self.scrollContent.find('li').each(function(index){
            				scWidth += $(this).outerWidth(true);
            			 });

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
            this.scrollPane.css('overflow', 'hidden');
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

            $('#moreContainerId .bodyMore').hover(function(){
                if (self.is_timer_active){ 
                    clearTimeout(self.timeout);
                    self.is_timer_active = false;
                }
                $(this).addClass('active');
            },function(){
                if (!self.is_timer_active && !self.button_pressed){
                    self.timeout = setTimeout(function(){ $('#moreContainerId .bodyMore').removeClass('active'); self.is_timer_active = false; }, 1000);
                    self.is_timer_active = true;
                }
            });
            
            //init scrollbar size
            //safari wants a timeout
            setTimeout(function(){ self.sizeScrollbar(self); }, 10);
        }

    }
})(jQuery);
