(function($){
	$.fn.tip = function(settings){

		var defaultSettings = {
            content: '',
            tipContainerId: '#tipContainerId',
            zIndex: 100
		}
		
		/* Combining the default settings object with the supplied one */
		settings = $.extend(defaultSettings,settings);
        
        var tip = new Tip(this);

        if (!$(settings.tipContainerId).length) {
            $('body').append(tip.generate());
        }
        var _tip_container = $(settings.tipContainerId);
        
        var root = this;
		/*
		*	Looping through all the elements and returning them afterwards.
		*	This will add chainability to the plugin.
		*/
		return this.each(function(){
			var elem = $(this);
			
			// On click, show the tip
			elem.click(function(e){
                if ($(this).hasClass('active')) {
                    tip.hide();
                } else {
                    tip.setText($(settings.content, elem));
                
                    var _offset = $(this).offset();
                    var _pos = $(this).position();
                
                    var pointy = $('.pointyTip', _tip_container);
                    var left = _offset.left + ($(this).outerWidth()/2) - _tip_container.outerWidth() + 
                                parseInt(pointy.css('right'))+parseInt(pointy.css('width'))/2;
                    _tip_container.css({'left':left, 
                                        'top':_offset.top+$(this).outerHeight()});            
                    tip.show();
                    $(this).addClass('active');
                }
                
                return false;
			});
		});
		
	}


	/*
	/	Tip Class Definition
	*/

	function Tip(root){
        this.root = root;
		this.shown = false;
	}
	
	Tip.prototype = {
		generate: function(){
			
			// The generate method returns either a previously generated element
			// stored in the tip variable, or generates it and saves it in tip for
			// later use, after which returns it.
			if (!this.tip) {
                this.tip = $('<div id="tipContainerId" class="tipContainer">'+
                                '<i class="tip-tl"></i>'+
                                '<i class="tip-tr"></i>'+
                                '<i class="tip-t"></i>'+
                                '<i class="tip-l"></i>'+
                                '<div class="tip-content">'+
                                    '<div class="pointyTip"></div>'+
                                    '<div class="closeTip" title="Close (Esc)">'+
                                        '<i></i>'+
                                    '</div>'+
                                    '<div class="bodyTip">'+
                                        '<div class="bodyTip-inner"></div>'+
                                    '</div>'+
                                '</div>'+
                                '<i class="tip-r"></i>'+
                                '<i class="tip-b"></i>'+
                                '<i class="tip-bl"></i>'+
                                '<i class="tip-br"></i>'+
                            '</div>');
                this.bind();
            }
            return this.tip;
        },
        setText: function(el){
            $('.bodyTip>.bodyTip-inner', this.tip).html(el.html());
        },
        isShown: function(){
            return this.shown;
        },
		show: function(){
			if(this.isShown()) return;
			
            $(this.tip).show();
			this.shown = true;
		},
		hide: function(){
			$(this.tip).hide();
            $(this.root).removeClass('active');
            this.shown = false;
		},
        bind: function(){
            var _this = this;
            $("body").click(function(){
                if (!_this.isShown()) return;
                _this.hide();
            });

            $(_this.tip).click(function(e){
                e.stopPropagation();
            });
            
            $('.closeTip', _this.tip).click(function(){
                _this.hide();
            });
        }
	}
	
})(jQuery);
