var OpenedPopups = OpenedPopups || {};

function block (el_id) {
    jQuery(el_id).block({ css: { 
	border: 'none', 
	padding: '15px', 
	backgroundColor: '#000', 
	'-webkit-border-radius': '10px', 
	'-moz-border-radius': '10px', 
	opacity: .5, 
	color: '#fff' 
    }, centering: true }); 
}
function unblock (el_id) {
    jQuery(el_id).load(function(){
	jQuery(el_id).unblock();
    });
}

////// url process section
function getCurrentURL () {
    var _url = window.location;

    return _url.pathname+_url.search+_url.hash;
}
function getCurrentURLHash(){
    var _url = window.location;
    return _url.hash;
}

function addValueToCurrentURLSearch (key, value) {
    var _url = window.location;
    var _search = _url.search;
    if (_search.indexOf(key) == -1) {
	_search += (_search.substr(0,1)=='?') ? '&' : '?';
	_search += key+'='+value;
    }

    return _url.pathname + _search + _url.hash;
}

function setURLAsCurrent (url) {
    window.location.href = url;

    return true;
}

function setURLHashForURL(url, value) {
    var _url = url;
    var _url_wo_hash = _url.substr(0, _url.lastIndexOf('#'));
    
    if (value[0] != '/') value = '/'+value;

    if (value.search(/\/models3d\//) == 0){
        value = value.substr("/models3d".length);
    }
    //console.log('url value: '+value);
    
    dhtmlHistory.add(value, true);

    var new_url = _url_wo_hash + '#' + value;

    return new_url;
}

function setURLHash (value) {
    //return setURLAsCurrent(setURLHashForURL(getCurrentURL(),value));
    return setURLHashForURL(getCurrentURL(),value);
}

function writeURLToCookie(url) {
    try{
        jQuery.cookie('ACTUAL_URL_COOKIE', url, {expires:10, path:'/'});
    }catch(err){
        
    }
}

function writeCurrentURLToCookie () {
    writeURLToCookie(getCurrentURL());
}

function getURLFromCookie () {
    var _url_from_cookie = jQuery.cookie('ACTUAL_URL_COOKIE');
    var _url = (_url_from_cookie == null || _url_from_cookie.length == 0) ? getCurrentURL() : _url_from_cookie;

    return _url;
}

function loadMainbody(default_url){
    var url = default_url;

    var hash = decodeURIComponent(getCurrentURLHash());
    if (hash.length){
        hash = hash.substr(1);
        if (hash[0] == '/' && hash.length > 2){
            url = hash;
        }
    }

    processLoadPage(url, null, function(){ jQuery('.slider-block').contentSlider(); jQuery('.model3d-block a.image-gallery').slimbox(); });
}

function loadPage(obj){
    processLoadPage(jQuery(obj).attr('href').substr(1));
}

function close_all_opened_popups(){
    jQuery('body').trigger('click');

    for(win in OpenedPopups){
        try{
            OpenedPopups[win].close();
        }catch(err){
            //console.log(err);
        }
    }
}

function processLoadPage(base_url, before_ajax, success_callback){
    var _output = 'div#models3d-block';
    var _block = 'div#mainbody';
    var _parent = jQuery(_output).parent();
    var _in_cache = false;
    var _cache_item = null;
    var url = base_url;//decodeURIComponent(base_url);
    //console.log('base_url: '+base_url);
    //console.log('decoded_url: '+url);

    if (url.search(/\/models3d\//) == -1){
        if (url[0] == '/'){
            url = '/models3d' + url;
        }else{
            url = '/models3d/' + url;
        }
    }
    
    if (url.search(/\/models3d\//)){
        messenger.error("Please, don't touch url in address bar :)");
        return false;
    }

    jQuery('.current-mode').removeClass('current-mode');
    if (url.search("/models3d/category/") != -1){
        jQuery('#bodyMenu').addClass('current-mode');
    } else if (url.search("/models3d/search/") != -1){
        jQuery('#search-panel').addClass('current-mode');
    }

    if (jQuery('[data-url="'+jQuery.base64Encode(url)+'"]', _output).length){
        _in_cache = true;
        _cache_item = jQuery('[data-url="'+jQuery.base64Encode(url)+'"]', _output);
    }

    close_all_opened_popups();

    if (!_in_cache){
        jQuery(_block).block({
            message:null,
            fadeIn:0,
            fadeOut:0,
            overlayCSS:{backgroundColor:'#fff'}
        });
        jQuery('#content-context-loader').show();

        if (typeof(before_ajax) == 'function'){
            before_ajax();
        }

        jQuery.ajax({
            url: url,
            dataType: 'json',
            data: {'ajax':1},
            success: function(response){
                if (response.error){
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

                    if (response.search_query){
                        jQuery('#search-field').val(response.search_query);
                    }
                    //_parent.append(jQuery('<div classs="cache" data-url="'+url+'" style="display:none;"></div>').html(_data));
                    //jQuery(_output).html(_data);
                    jQuery(_output).children('.cache.current').removeClass('current');
                    jQuery(_output).append(jQuery('<div class="cache current" data-url="'+jQuery.base64Encode(url)+'"></div>').html(_data));

                    jQuery(window).scrollTop(0);
                    if (typeof(success_callback) == 'function'){
                        success_callback(response);
                    }
                    try{
                        _gaq.push(['_trackPageview', url]);
                    }catch(err){}
                }
            },
            complete: function(){
                jQuery(_block).unblock();
                jQuery('#content-context-loader').hide();
            }
        });
    } else {
        //jQuery(_output).html(_cache_item.html());
        jQuery(_output).children('.cache.current').removeClass('current');
        _cache_item.addClass('current');
        if (typeof(success_callback) == 'function'){
            success_callback();
        }
    }
}
