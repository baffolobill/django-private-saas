function MessengerObject(opts){

};

MessengerObject.prototype = {
    error: function(msg, opts){
	this.send('error', msg, opts);

	return false;
    },
    notify: function(msg, opts){
	this.send('notify', msg, opts);

	return false;
    },
    send: function(msg_type, msg, opts){
	var settings = {
	    'header': msg_type,
	    'sticky': false
	};
	settings = jQuery.extend(settings, opts);
	jQuery.jGrowl(msg, settings);
    }
};

var messenger = new MessengerObject();

jQuery(document).ajaxError(function(e, jqxhr, settings, exception){
	eval("var response = "+ jqxhr.responseText);
	if (response.message){
	    messenger.error(response.message);
	}
    });