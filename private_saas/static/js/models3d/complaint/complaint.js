function Model3dComplaint(){
	this.settings = {
		'windowId': '#model3d-complaint-window',
		'model3dIdPrefix': '#model3d_',
		'mainbodyId':'#mainbody'
	};
	this.form_action = '';
	this.sender = null;
	this.model3d = null;
	this.win = null;
}

Model3dComplaint.prototype = {
	close: function(obj){
		if (this.win != null){
			this.win.remove();
		} else {
			jQuery('body>.complaint-window').remove();
		}
		delete OpenedPopups['complaint'];
		jQuery('div.model3d.active').removeClass('active');
		jQuery(this.settings.mainbodyId).unblock();

		return false;
	},
	open: function(obj, model3d_id){
		this.sender = jQuery(obj);
		this.form_action = this.sender.attr('href').substr(1);
		this.model3d = jQuery(this.settings.model3dIdPrefix + model3d_id);

		if (M3dDropdown.isShown()){
			M3dDropdown.hide(obj);
		}

    	
    	jQuery('div.model3d.active').removeClass('active');
    	this.model3d.addClass('active');

        jQuery(this.settings.mainbodyId).block({
                message: null,
                fadeIn:0,
                fadeOut:0,
                overlayCSS:{backgroundColor:'#fff'}
        });

		this.win = jQuery(this.settings.windowId).clone().removeAttr('id').appendTo('body');
		OpenedPopups['complaint'] = this;

		if (this.model3d.length){
			this.set_position();
			this.clear();
			this.win.show();
		}
	},
	_check_email: function(v){
        var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
 
        if(v == ''){
            return false;
        }else if(!emailReg.test(v)){
            return false;
        }
        return true;
	},
	submit: function(obj){
		var _email = jQuery('[name=email]', this.win);
		var _reason = jQuery('[name=reason] option:selected', this.win);
		var _message = jQuery('[name=message]', this.win);

		var _found_err = false;

		if ( !this._check_email( jQuery.trim( _email.val() ) ) ){
			_email.addClass('error__fld-required');
			_found_err = true;
		} else if (_email.hasClass('error__fld-required')){
			_email.removeClass('error__fld-required');
		}

		if (jQuery.trim(_message.val()) == '' && (_reason.hasClass('reason__msg-required'))){
			_message.addClass('error__fld-required');
			_found_err = true;
		} else if (_message.hasClass('error__fld-required')){
			_message.removeClass('error__fld-required');
		}

		if (!_found_err){
			this.send();
		}

		return false;//(!_found_err);
	},
	send: function(){
		var self =  this;
		jQuery.ajax({
			url: self.form_action,
			dataType: 'json',
			type: 'POST',
			data: jQuery('form', self.win).serialize(),
			success: function(response){
				
				if (response.success == 1){
					self.close(self.sender);
					messenger.notify(response.message);
				} else {
					messenger.error(response.message);
				}
			}
		});
	},
	clear: function(){
		jQuery('input[type="text"]', this.win).val('');
		jQuery('textarea', this.win).val('');
	},
	set_position: function(){
		var _cw = this.win;
		var _m3d_off = this.model3d.offset();
		
		var _top = _m3d_off.top - 5;
		var _left = _m3d_off.left + this.model3d.outerWidth(true) + 5;
		
		if ((_left + _cw.width()) > (jQuery(window).width()-50)){
			_left = _m3d_off.left - _cw.width();
		}

		_cw.css({'top':_top,
				 'left':_left});
	}
};
var Complaint = new Model3dComplaint();