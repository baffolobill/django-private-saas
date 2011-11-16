/**
 * jqPageFlow v0.1b - jQuery plugin
 * Copyright (c) 2009 Barry Roodt (http://calisza.wordpress.com)
 *
 * Licensed under the New BSD license.
 *
 * This plugin makes scrolling pagination possible (such as that found on Google Reader and dzone.com).
 * An example can be found at http://flexidev.co.za/projects/jqpageflow
 * Please check http://code.google.com/p/flexidev/downloads/ for the latest version
 *
 * Special thanks to Christopher Mills (http://imod.co.za) for the help with naming and promoting this plugin
 *
 */

;(function($){
 	$.flexiPagination = {

		defaults: {
			url: "",
   			currentPage: 0,
   			totalResults: 100,
   			perPage: 25,
   			container: "body",
   			pagerVar : "p",
   			loaderImgPath: "images/loader.gif",
   			debug : 0
		}

	};

	$.fn.extend({
		flexiPagination:function(config) {
		
			// initialize our config object
			var config = $.extend({}, $.flexiPagination.defaults, config);
			var loading = false;
			
			// create and append our progress indicator div to the body content, then make sure our css is applied
   			$("body").append("<div id='jqpageflow-block'><img src='" + config.loaderImgPath + "' /><span id='jqpageflow-text'></span></div>");
			$("#jqpageflow-block").addClass("jqpageflow-loader");
			$("#jqpageflow-text").addClass("jqpageflow-loadertext");
   			 
   			// set default container element as body if config var is empty
   			config.container = (config.container != "") ? config.container : "body";
   			
   			
   			
   			//if (config.debug)
   			//console.log("Current Page : %s", config.currentPage);
   			
   			// bind the window's scroll event to a custom function
			$(window).scroll(function(){
				// work out whether we need to fire our ajax call or not
		       if ( config.currentPage >= 0 && (config.perPage * (config.currentPage + 1) < config.totalResults)  
		       && !loading && $(this).scrollTop() == $(document).height() - $(this).height() ) {
		           
		           // this automatically prevents any further attempts to execute another ajax call until the current ajax call has returned a result
		           loading = true;
		           
		           // set a default url if none specified. 
		           // Note: this needs to be calculated just before the ajax call since our currentPage counter is updated each time the event is executed 
		           if (config.url != "") {
						//config.url += (config.url.indexOf("?")!==-1 ? "&" : "?") + config.pagerVar + "=" + (config.currentPage + 1);
						config.url += (config.currentPage + 1);
					} else {
						// the default url is the current window location with the pageVar and currentPage values attached
						config.url = window.location + (window.location.search != '' ? "&" : "?") + config.pagerVar + "=" + ( config.currentPage + 1 );
					}
					
				   //if (config.debug)
				   //console.log("Generated Url : %s", config.url);
		           
					// update the loader text and display the loader.
					$("#jqpageflow-text").text('Loading results ' + (config.perPage * ((config.currentPage > 0) ? config.currentPage : 1)) + ' of ' + config.totalResults);
					$("#jqpageflow-block").show();
		           
		           // execute our ajax call and deal with the result.
		           $.ajax({
		               type: "GET",
		               data: {'ajax':1},
		               dataType: "json",
		               url: config.url,
		               success: function(data){
							if (data.data) {
		                       $(config.container).append(data.data);
		                       config.currentPage++;
							} else {
								// prevent any further attempts to execute the ajax call since the backend is not returning a useable result.
								config.currentPage = -1;
							}
							
							/* if (config.debug) {
								console.log("Current Page : %s", config.currentPage);
								console.log("Per Page : %s", config.perPage);
								console.log("Total Results : %s", config.totalResults);
							}
							*/
		               },
		               complete: function(){
		               		// allow ajax call to be executed again if necessary and hide the loader
		                   loading = false;
		                   $("#jqpageflow-block").hide();
		               }
		           });
		       }
			});
			
			return this;
		}
	});
	
})(jQuery);