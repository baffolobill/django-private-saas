function CartClass(opts){
    this.config = {
	'containerId': '#shopping-panel',
	'cartIdContainer': '',
	'cartLabelContainer': '#shopping-panel .cart-label'
    };
}
CartClass.prototype = {
    init: function(){},
    _ckeck_data: function(xhr){
	if (typeof(xhr) == 'undefined')
	    return false;

	if (typeof(xhr.cart) == 'undefined')
	    return false;

	return true;
    },
    setCartId: function(xhr){
	var value = 0;
	if (typeof(xhr.cart.id) == 'undefined')
	    value = -1;
	else
	    value = xhr.cart.id;

	jQuery(this.config.cartIdContainer).val(value);
    },
    setLabel: function(xhr){
	var value = 'Empty';
	if (typeof(xhr.cart.label) == 'undefined')
	    value = 'Error';
	else
	    value = xhr.cart.label;

	jQuery(this.config.cartLabelContainer).html(value);
    },
    setDescription: function(xhr){
	var value = '';
	if (typeof(xhr.cart.description) == 'undefined')
	    value = '';
	else
	    value = xhr.cart.description;

	if (value.length > 0)
	    jQuery(this.config.cartLabelContainer).attr('title', value);
    },    
    update: function(xhr){
	var self = this;
	//if (!self._check_data(xhr))
	//    return false;

	this.block();
	//this.setCartId(xhr);
	this.setLabel(xhr);
	this.setDescription(xhr);
	this.unblock();

	this.hide_if_empty(xhr);

	return false;
    },
    hide_if_empty: function(xhr){
	if (this.is_empty(xhr))
	    this.hide();
	else
	    this.show();
    },
    is_empty: function(xhr){
	if (typeof(xhr.cart.count) == 'undefined')
	    return true;

	if (parseInt(xhr.cart.count) == 0)
	    return true;

	return false;
    },
    block: function(){
	jQuery(this.config.containerId).block({message:null,
					       overlayCSS:{backgroundColor:'#fff',
							   opacity:0.6}});
    },
    unblock: function(){
	jQuery(this.config.containerId).unblock();
    },
    show: function(){
	jQuery(this.config.containerId).show();

	return false;
    },
    hide: function(){
	jQuery(this.config.containerId).hide();

	return false;
    }
};
var Cart = new CartClass();
