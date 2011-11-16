function Pagination(){
	this.settings = {
		'current_page': 1,
		'per_page': 20,
		'url': '',
		'total': 1,
		'loading_text': 'Loading...',
		'button_label': 'Show more results',
		'container': '#models3d-block > .cache.current > .mid > .main',
		'pagination': '#pagination'
	};
	this.sender = null;
}

Pagination.prototype = {
	more: function(obj, url, total, loading_text){
		this.sender = jQuery(obj);
		this.settings.button_label = jQuery(obj).val();
		this.settings.loading_text = loading_text;
		this.settings.total = total;
		if (url != this.settings.url){
			this.settings.current_page = 1;
		}
		this.settings.url = url;

		this.load();

		return false;
	},
	getUrl: function(){
		var url = this.settings.url + (this.settings.current_page+1);
		
		return url;
	},
	load: function(){
		var self = this;

		this.block();

		jQuery.ajax({
			dataType: 'json',
			data: {'ajax':1},
			url: self.getUrl(),
			success: function(response){
				if (response.error){
					messenger.error(response.error);
				}
				if (response.data){
					jQuery(self.settings.container).append(response.data);
					self.settings.current_page += 1;
					if (self.settings.current_page >= self.settings.total){
						jQuery(self.settings.pagination).hide();
					}
				}
			},
			complete: function(response){ self.unblock(); }
		});
	},
	block: function(){
		this.sender.attr('value', this.settings.loading_text);
		this.sender.attr('disabled', 'disabled');
	},
	unblock: function(){
		this.sender.attr('value', this.settings.button_label);
		this.sender.removeAttr('disabled');
	}
};
var pagination = new Pagination();
