function UProfileObject(){
    this.settings = {};
}
UProfileObject.prototype = {
    change_password: function(sender){
        this.post_form(jQuery(sender).closest('form'));

        return false;
    },
    promocode: function(sender){
        this.post_form(jQuery(sender).closest('form'));

        return false;
    },
    show_notice: function(element, notice){
        var self = this;
        var nid = 'notice-' + element.id;

        if(!jQuery("#" + nid) || jQuery("#" + nid).length == 0) {
            jQuery("body").append("<div id='" + nid + "' class='vnotice'>" +
                notice + "</div>");
        }
        jQuery("#" + nid).fadeIn();

        var o = jQuery(element).offset();
        var w = jQuery(element).width();
        var h = jQuery(element).height();
        var b =  jQuery("#" + nid).height();

        var flip = !(w - 10 + o.left + b < w);
        jQuery("#" + nid).css('top', (o.top - 10 + h) + 'px');
        jQuery("#" + nid).css('left', (o.left + w - (flip ? b : 0) - 25) + 'px');

        jQuery("#" + nid).bind('click', function() { self.hide_notice(nid); });
        setTimeout(function() { self.hide_notice(nid); }, 5000);
        jQuery(element).bind('focus', function() { self.hide_notice(nid); });
    },
    hide_notice: function(nid){
        jQuery("#" + nid).fadeOut();
    },
    reset_fields_state: function(form_obj){
        jQuery(':input', form_obj).each(function(){
            jQuery(this).removeClass('vwrong');
            jQuery(this).removeClass('vright');
        });
    },
    clear_form: function(form_obj){
        var self = this;
        jQuery(':input', form_obj).each(function(){
            var type = this.type, tag = this.tagName.toLowerCase();

            if (type == 'text' || type == 'password' || tag == 'textarea') {
                this.value = '';
            } else if (type == 'checkbox' || type == 'radio') {
                this.checked = false;
            } else if (tag == 'select'){
                this.selectedIndex = -1;
            }

            jQuery(this).removeClass('vwrong');
            jQuery(this).removeClass('vright');
        });
    },
    post_form: function(form_obj){
        var self = this;

        self.block(form_obj.parent());
        jQuery('#content-context-loader').show();

        jQuery.ajax({
            url: form_obj.attr('action'),
            dataType: 'json',
            type: 'POST',
            data: form_obj.serializeArray(),
            success: function(response){
                self.reset_fields_state(form_obj);
                if (response.form_errors){
                    for (var i=0, k=response.form_errors.length; i<k; i++) {
                        var err = response.form_errors[i];
                        var el = jQuery('[name="'+err[0]+'"]', form_obj);
                        messenger.error(err[0]+'::::'+err[1]);
                        if (el.length){
                            el.addClass('vwrong');
                            self.show_notice(el, err[1]);
                        }
                    }

                } else if (response.error){
                    messenger.error(response.error);
                } else if (response.success == 0 && response.message){
                    messenger.error(response.message);
                } else if (response.success == 1 || response.html || response.data){
                    var _data = '';
                    if (response.data){
                        _data = response.data;
                    } else if (response.html){
                        _data = response.html;
                    }
                    if (response.message){
                        messenger.notify(response.message);
                    }
                    if (response.redirect_to){
                        window.location.href = response.redirect_to;
                    }
                }
            },
            complete: function(){
                self.unblock(form_obj.parent());
                jQuery('#content-context-loader').hide();
            }
        });
    },
    block: function(obj){
        jQuery(obj).block({
            css: {
                border: 'none',
                backgroundColor: 'transparent',
            },
            message: '<img src="/static/images/loading.bars.white.gif" />',
            fadeIn:0,
            fadeOut:0,
            overlayCSS:{backgroundColor:'#333'}
        });
    },
    unblock: function(obj){
        jQuery(obj).unblock();
    }
};
var UProfile = new UProfileObject();
