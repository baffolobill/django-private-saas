function MoreObject(){
    this.config = {
        content: '',
        containerId: 'moreContainerId',
        zIndex: 2002,
        mainbodyId: '#mainbody'
    };
    
    this.container = null;
    this.sender = null;
    this.model3d = null;
    this.shown = false;
}

MoreObject.prototype = {
    toggle: function(el){
        var $_ = jQuery(el);
        var $m3d = jQuery(el).closest('.model3d');
        
        if ($_.hasClass('opened')){
            this.hide($_);
        } else {
            this.show($_);
        }
    },
    show: function(el){
        if(this.container == null) this.init();
        
        this.sender = el;
        
        this.model3d = jQuery(el).closest('.model3d');
        jQuery('div.model3d.active').removeClass('active');
        this.model3d.addClass('active');
        this.model3d.find('.model3d-buy-button').addClass('inactive');
        this.sender.addClass('opened');
            
        jQuery(this.config.mainbodyId).block({
            message:null,
            fadeIn:0,
            fadeOut:0,
            overlayCSS:{backgroundColor:'#fff'}
        });
        
        var _url = jQuery(el).attr('href').substr(1);
        this.load(_url);
        
        return false;
    },
    hide: function(el){
	if (this.isShown()){
	    this.sender.removeClass('opened');
	    this.model3d.find('.model3d-buy-button').removeClass('inactive');

	    jQuery('div.model3d.active').removeClass('active');
	    jQuery(this.config.mainbodyId).unblock();
        
	    this.close();
	}
    
        return false;
    },
    open: function(){
        if(this.isShown()) return;
        
        jQuery(this.container).show();
        this.shown = true;
    },
    close: function(){
	if (this.container != null)
	    jQuery(this.container).hide();

        this.shown = false;
    },
    setValue: function(val){
        jQuery('.bodyMore>.bodyMore-inner', this.container).html(jQuery(val).hScroller());
        
        jQuery('a.image-gallery', this.container).slimbox();
    },
    load: function(url){
        var self = this;

        this.model3d.append('<div class="loading"></div>');

        jQuery.ajax({
            url: url,
            data: {ajax:1, limit:15, is_it_loaded_into_content_slider:1},
            success: function(data){
                if (data.success == 1){
                    self.setValue(data.data);
                    self.move_to_position(self.sender);
                    self.open();
                } else if (data.message){
                    messenger.error(data.message);
                }
            },
            error: function(xhr, status, error){
                self.hide(self.sender);
            },
            complete: function(data){
                jQuery('div.loading', self.model3d).remove();
            },
            dataType: 'json'
        });

    },
    init: function(){
        if (!jQuery('#'+this.config.containerId).length) {
            jQuery('body').append(this.generate());
        }    
    },
    generate: function(){
        if (!this.container) {
            this.container = jQuery('<div id="'+this.config.containerId+'" class="moreContainer">'+
                                '<i class="tip-tl"></i>'+
                                '<i class="tip-tr"></i>'+
                                '<i class="tip-l"></i>'+
                                '<div class="more-content">'+
                                    '<div class="closeMore" title="Close (Esc)">'+
                                        '<i></i>'+
                                    '</div>'+
                                    '<div class="bodyMore">'+
                                        '<div class="bodyMore-inner clearfix"></div>'+
                                    '</div>'+
                                '</div>'+
                                '<i class="tip-r"></i>'+
                                '<i class="tip-b"></i>'+
                                '<i class="tip-bl"></i>'+
                                '<i class="tip-br"></i>'+
                            '</div>');
                            
            var mw = jQuery(this.config.mainbodyId).width();
            this.container.width(mw);
            
            this.bind();
        }
        return this.container;
    },
    move_to_position: function(el){        
        var _offset = jQuery(el).offset();
        var left = jQuery(this.config.mainbodyId).offset().left;
        var top = _offset.top + jQuery(this.sender).outerHeight() +3;

        jQuery(this.container).css({'left':left, 'top':top});
    },
    bind: function(){
        var self = this;
        jQuery("body").click(function(){
            if (self.isShown())
                self.hide(self.sender);
        });


        jQuery(self.container).click(function(e){
            e.stopPropagation();
        });
        
        jQuery('.closeMore', self.container).click(function(){
            self.hide(self.sender);
        });
    },
    isShown: function(){
        return this.shown;
    }
};
var More = new MoreObject();
