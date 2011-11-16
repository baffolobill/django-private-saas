var Model3d = Model3d || {};

Model3d.hint = function(event, el){
    if (event.stopPropagation){
	event.stopPropagation();
    } else if (window.event){
	window.event.cancelBubble = true;
    }
    M3dHint.toggle(el);

    return false;
};

Model3d.more = function(event, el, container_id){
    More.toggle(el);

    return false;
};

Model3d.buy__confirm = function(event, el){
    BuyDialog.toggle(el);

    return false;
};
Model3d.buy__cancel = function(el){
    BuyDialog.hide(el);

    return false;
};
Model3d.buy__checkout = function(el){
    var url = jQuery(el).attr('href').substr(1);

    BuyDialog.hide(el);
    
    window.location.href = url;

    return false;
};
Model3d.cart__add_from_hint = function(el, model3d_id){
    var url = jQuery(el).attr('href').substr(1);

    var _m3d = jQuery('div.model3d.active');
    el = _m3d.find('.model3d-buy-button__add');
    if (!_m3d.hasClass('in-cart')){
	this.cart__add(el, model3d_id);
    }

    M3dHint.hide(el);

    return false;
};
Model3d.cart__add = function(el, model3d_id){
    var url = jQuery(el).attr('href').substr(1);
    

    if (BuyDialog.isShown()){
	BuyDialog.hide(el);
    }
    if (M3dDropdown.isShown()){
	M3dDropdown.hide(el);
    }
    
    jQuery.post(url, {'ajax':1},
		function(data){
		    if (data.success == 1){
			Cart.update(data);

			jQuery(el).closest('div.model3d').addClass('in-cart');
			jQuery(el).parent().children('.dropdown-label-button.disabled').removeClass('disabled');
			jQuery(el).addClass('disabled');
		    } else {
			messenger.error(data.message);
		    }
		}, 'json');



    return false;
};
Model3d.cart__remove = function(el, cartitem_id){
    var url = jQuery(el).attr('href').substr(1);

    jQuery.post(url, {'ajax':1, 'cartitem':cartitem_id},
		function(data){
		    if (data.success){
			Cart.update(data);

			jQuery('#model3d_'+data.model3d.id).remove();
		    } else {
			messenger.error(data.message);
		    }
		}, 'json');

    return false;
};
Model3d.cart__in_cart = function(el, cartitem_id){
    var url = jQuery(el).attr('href').substr(1);

    jQuery.post(url, {'ajax':1},//, 'cartitem':cartitem_id},
		function(data){
		    if (data.success){
			Cart.update(data);

			jQuery(el).closest('div.model3d').removeClass('in-cart');
			jQuery(el).parent().children('.dropdown-label-button.disabled').removeClass('disabled');
			jQuery(el).addClass('disabled');
		    } else {
			messenger.error(data.message);
		    }
		}, 'json');

    return false;
};

Model3d.load = function(url){
    var self = this;

    jQuery.get(url, {ajax:1},
	       function(data){
		   Cart.update(data);
		   // Cart.show();
	       }, 'json');
	       
};

Model3d.dropdown = function(event, el, container_id){
    if (event.stopPropagation){
	event.stopPropagation();
    } else if (window.event){
	window.event.cancelBubble = true;
    }

    M3dDropdown.toggle(el, container_id);

    return false;
};

Model3d.wishlist__add = function(el, mi_id, remove_mi_id){
    var self = this;
    var url = jQuery(el).attr('href').substr(1);

    M3dDropdown.hide(el);

    jQuery.post(url, {ajax:1},
		function(data){
		    if (data.success == 1){
			jQuery(mi_id).closest('li').addClass('hidden');
			jQuery(remove_mi_id).closest('li').removeClass('hidden');
			jQuery(mi_id).closest('div.model3d>.main').prepend('<span class="badge badge_wish">&nbsp;</span>');
		    } else {
			messenger.error(data.message);
		    }
		}, 'json');

    return false;
};
Model3d.wishlist__remove = function(el, mi_id, add_mi_id){
    var self = this;
    var url = jQuery(el).attr('href').substr(1);

    M3dDropdown.hide(el);

    jQuery.post(url, {ajax:1},
		function(data){
		    if (data.success == 1){
			jQuery(mi_id).closest('li').addClass('hidden');
			jQuery(add_mi_id).closest('li').removeClass('hidden');
			jQuery(mi_id).closest('div.model3d>.main').children('span.badge.badge_wish').remove();
		    } else {
			messenger.error(data.message);
		    }
		}, 'json');

    return false;
};

Model3d.shareOnTwitter = function(el, id){
    if (M3dDropdown.isShown()){
	M3dDropdown.hide(el);
    }
    var url = jQuery(el).attr('href').substr(1);
    window.open(url, 'sharer', 'toolbar=0,status=0,width=650,height=520');

    return false;
};
Model3d.shareOnFacebook = function(el){
    if (M3dDropdown.isShown()){
	M3dDropdown.hide(el);
    }
    var url = jQuery(el).attr('href').substr(1);
    window.open(url, 'sharer', 'toolbar=0,status=0,width=785,height=489');

    return false;
};

Model3d.download = function(el){
    var url = jQuery(el).attr('href').substr(1);

    jQuery.post(url, {'ajax':1},
		function(data){
		    if (data.success == 1){
			messenger.notify(data.message, {sticky:true});
			Model3d.send_file(data.download_link);
		    }else{
			messenger.error(data.message);
		    }
		}, 'json');

    return false;
};
Model3d.send_file = function(url){
    var _iframe_id = 'model3d-download-iframe';
    var _iframe = jQuery('#'+_iframe_id);
    if (!_iframe.length){
	_iframe = jQuery('<iframe id="'+_iframe_id+'" style="display:none;"></iframe>');
	jQuery('body').append(_iframe);
    }

    _iframe.attr('src', url);

    return false;
};
Model3d.complaint = function(obj, model3d_id){
    Complaint.open(obj, model3d_id);

    return false;
};

function Model3dPage(){
    this.settings = {
        'blockId': '#mainbody',
        'contextLoader': '#content-context-loader',
        'itemIdPrefix': '#model3d-block-',
        'container': '#models3d-block',
        'cacheContainer': '#main>.main',
        'speed': 500
    };

    this.item_id = null;
    this.container = null;
    this.cache_container = null;
    this.item_page = null;
}

Model3dPage.prototype = {
    back: function(){
        //this.item_page.hide();
        //this.item_page = null;
        /*jQuery('.model3d-block', this.settings.cacheContainer).hide();
        this.container = jQuery(this.settings.container);
        this.animate(this.container, {'direction':'left'});*/
        window.history.back(1);

        return false;
    },
    
    get_model3d: function(obj, item_id){
        var self = this;
        var url = jQuery(obj).attr('href').substr(1);
        this.item_id = item_id;
        this.container = jQuery(this.settings.container);
        this.cache_container = jQuery(this.settings.cacheContainer);

        setURLHash(url);
        processLoadPage(url, null, function(){ jQuery('#model3d-block-'+item_id+' .model3d__back').show(); jQuery('.model3d-block a.image-gallery').slimbox(); });

/*
        if (!this.is_cached()){
            this.block();
            jQuery.ajax({
                url: url,
                data: {'ajax':1},
                dataType: 'json',
                success: function(response){
                    if (response.error){
                        messenger.error(response.error);
                    } else if (response.data){
                        self.cache_and_show(response.data);
                    }
                },
                complete: function(response){ self.unblock(); }
            });
        } else {
            this.item_page = this.get_cache(this.item_id);

            this.container.hide();
            this.animate(this.item_page, {'direction':'right'});
        }*/

        return false;
    },
    block: function(){
        jQuery(this.settings.blockId).block({
            message: null,
            fadeIn:0,
            fadeOut:0,
            overlayCSS:{backgroundColor:'#fff'}
        });
        jQuery(this.settings.contextLoader).show();
    },
    unblock: function(){
        jQuery(this.settings.contextLoader).hide();

        jQuery(this.settings.blockId).unblock();
    },
    cache_and_show: function(html){
        if (!this.is_cached()){
            this.cache(html);
        }

        this.item_page = this.get_cache(this.item_id);

        this.container.hide();
        this.animate(this.item_page, {'direction':'right'});
    },
    animate: function(obj, opts){
        var self = this;

        obj.show('slide', opts, self.settings.speed);
    },
    is_cached: function(){
        var _c = this.cache_container.children(this.settings.itemIdPrefix+this.item_id);
        if (_c.length)
            return true;
        else
            return false;
    },
    cache: function(html){
        this.cache_container.append(html);
    },
    get_cache: function(item_id){
        return this.cache_container.children(this.settings.itemIdPrefix + item_id);
    }
};
var m3dPage = new Model3dPage();