function M3dDropdownObject(opts){
    this.config = {
        content: '.download-content',
        containerId: 'm3dDropdownContainerId',
        zIndex: 2003,
	   mainbodyId: '#models3d-block'
    };
    jQuery.extend(this.config, opts);
    
    this.container = null;
    this.sender = null;
    this.model3d = null;
    this.shown = false;
}

M3dDropdownObject.prototype = {
    toggle: function(el, menu_id){
        if (jQuery(el).hasClass('opened')){
            this.hide(el);
        } else {
            this.show(el, menu_id);
        }

        return false;
    },
    show: function(el, menu_id){
        var self = this;
        if (this.container != null){
    	    this.container.remove();
    	    this.container = null;
    	}
    	this.init(menu_id);

    	if (this.isShown()){
    	    this.hide(this.sender);
    	}



        this.sender = jQuery(el);
    	this.sender.addClass('opened');

    	if (BuyDialog.isShown()){
    	    BuyDialog.hide(el);
    	}
    	if (M3dHint.isShown()){
    	    M3dHint.hide(el);
    	}

    	this.model3d = jQuery(this.sender).closest('.model3d');
    	jQuery('div.model3d.active').removeClass('active');
    	this.model3d.addClass('active');

        jQuery(this.config.mainbodyId).block({
                message: null,
                fadeIn:0,
                fadeOut:0,
                overlayCSS:{backgroundColor:'#fff'}
        });
            
    	this.move_to_position(this.sender);
    	this.open();

        return false;
    },
    hide: function(el){
	if (this.isShown()) {
	    this.sender.removeClass('opened');

	    jQuery('div.model3d.active').removeClass('active');
	    jQuery(this.config.mainbodyId).unblock();
        
	    this.close();
	}
    
        return false;
    },
    open: function(){
        if(this.isShown()) return;

        this.container.show();
        this.shown = true;
    },
    close: function(){
	if (this.container != null)
	    this.container.hide();

        this.shown = false;
    },
    setValue: function(val){
        jQuery(this.container).html(val);
    },
    init: function(menu_id){
        if (!jQuery('#'+this.config.containerId).length) {
            jQuery('body').append(this.generate(menu_id));
        }    
    },
    generate: function(menu_id){
        if (!this.container) {
            this.container = jQuery('<div id="'+this.config.containerId+'" class="dropdownContainer"></div');
            jQuery(menu_id).clone().appendTo(this.container);
            this.container.children('*').removeAttr('id');
            this.container.css('z-index', this.config.zIndex);
            this.bind();
        }
        return this.container;
    },
    move_to_position: function(el){
        var _m3d = jQuery(el).closest('.model3d');

        var left = jQuery(el).offset().left + jQuery(el).width() - this.container.width();
        var top = jQuery(el).offset().top + jQuery(el).height() +3;

    	var pointy = jQuery('.pointyTip', this.container);
    	var pointy_left = this.sender.offset().left - left;
    	pointy.css({'left':pointy_left});

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
    },
    isShown: function(){
        return this.shown;
    }
};
var M3dDropdown = new M3dDropdownObject();
