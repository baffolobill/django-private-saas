;(function($){
	$.fn.simpleTree = function(opt){
    	return this.each(function(){
			var TREE = this;
			var ROOT = $('.root',this);
			var mousePressed = false;
			var mouseMoved = false;
			var dragMoveType = false;
			var dragNode_destination = false;
			var dragNode_source = false;
			var dragDropTimer = false;
			var ajaxCache = Array();

			TREE.option = {
		    	drag:	false,
		    	animate:	false,
		    	autoclose:	false,
		    	speed:	'fast',
		    	afterAjax:	false,
		    	afterMove:	false,
		    	afterClick:	false,
		    	afterDblClick: false,
		    	// added by Erik Dohmen (2BinBusiness.nl) to make context menu cliks available
		    	afterContextMenu:	false,
		    	docToFolderConvert: false,
				addNode: false,
		    	// added by Volkov Alexander (baffolobill@yandex.ru) to add 
		    	// auto save all opened nodes into cookie
		    	cookie: 'COOKIE_SIMPLE_TREE',
	        	spacer: '/static/images/spacer.gif'
			};
			TREE.option = $.extend(TREE.option,opt);
			$.extend(this, {
				getSelected: function(){
		    		return $('span.active', this).parent();
				}
			});
			TREE.closeNearby = function(obj){
		    	$(obj).siblings().filter('.folder-open, .folder-open-last').each(function(){
					var childUl = $('>ul',this);
					var className = this.className;
					this.className = className.replace('open','close');
					if(TREE.option.animate){
						childUl.animate({height:"toggle"},TREE.option.speed);
					}else{
						childUl.hide();
					}
		    	});
			};
			TREE.nodeToggle = function(obj){
		    	var childUl = $('>ul',obj);
		    	if (childUl.is(':visible')) {
					obj.className = obj.className.replace('open','close');
			
					if (TREE.option.animate){
						childUl.animate({height:"toggle"},TREE.option.speed);
					}else{
			    		childUl.hide();
					}
	                
	                // remove closed node from cookies
	                //$.cookie('simpleTree', '0', {path:'/',expires:1});
	                var remove_tree_id = Number($(obj).attr('id'));
	                var remove_tree_ids = [remove_tree_id];
	                var tree_ids = $.cookie(TREE.option.cookie);
	                tree_ids = (tree_ids == null && tree_ids.length==0 ? [] : tree_ids.split(',') );

	                // collect all ids of folders
	                $('li#'+remove_tree_id, TREE).children('ul').find('ul').each(function(){
	                    remove_tree_ids.push( Number($(this).parent().attr('id')) );
	                });
	                // collect all ids of files
	                $('li#'+remove_tree_id, TREE).children('ul').find('li').each(function(){
	                    if (Number($(this).attr('id')) > 0) 
	                        remove_tree_ids.push( Number($(this).attr('id')) );
	                });
	                
	                var new_tree_ids = [];
	                for (var i=0; i<tree_ids.length; i++) {
	                    var tree_id = Number( tree_ids[i] );
	                    if (tree_id>0 &&
	                        $.inArray(tree_id, remove_tree_ids)==-1 && 
	                        $.inArray(tree_id, new_tree_ids)==-1 ) {
	                        new_tree_ids.push(tree_id);
	                    }
	                }
	                $.cookie(TREE.option.cookie, new_tree_ids.join(','), {path:'/',expires:1});
	                //TREE.setCSSPosition();
		    	}else{
					obj.className = obj.className.replace('close','open');
			
	                // integrate save opened node
	                var tree_ids = $.cookie(TREE.option.cookie);
	                tree_ids = (tree_ids == null || tree_ids.length==0 ? [] : tree_ids.split(',') );
	                tree_ids.push($(obj).attr('id'));
	                $.cookie(TREE.option.cookie, tree_ids.join(','), {path:'/',expires:1});
	                // end hack

					if (TREE.option.animate){
			    		childUl.animate({height:"toggle"},TREE.option.speed, function(){
							if (TREE.option.autoclose) TREE.closeNearby(obj);
							if (childUl.is('.ajax'))TREE.setAjaxNodes(childUl, obj.id);
			    		});
					}else{
			    		childUl.show();
			    		if (TREE.option.autoclose) TREE.closeNearby(obj);
			    		if (childUl.is('.ajax')) TREE.setAjaxNodes(childUl, obj.id);
					}
		    	}
			};
			TREE.setAjaxNodes = function(node, parentId, callback){
		    	if ($.inArray(parentId,ajaxCache) == -1){
					ajaxCache[ajaxCache.length]=parentId;
					var url = $.trim($('>li', node).text());
					if (url && url.indexOf('url:')){
			    		url = $.trim(url.replace(/.*\{url:(.*)\}/i ,'$1'));
			    		$.ajax({
							type: "GET",
							url: url,
							contentType:'html',
							cache:false,
							success: function(responce){
				    			node.removeAttr('class');
				    			node.html(responce);
				    			$.extend(node,{url:url});
				    			TREE.setTreeNodes(node, true);
				    			if (typeof TREE.option.afterAjax == 'function'){
									TREE.option.afterAjax(node);
				    			}
				    			if (typeof callback == 'function'){
									callback(node);
				    			}
							}
			    		});
					}
			
				}
			};
			TREE.setTreeNodes = function(obj, useParent){
		    	obj = useParent ? obj.parent() : obj;
		    	$('li>span', obj).addClass('text')
				.bind('selectstart', function() {
			    	return false;
				}).click(function(){
			    	$('.active',TREE).attr('class','text');
			    
					// integrate save opened node
					var tree_ids = $.cookie(TREE.option.cookie);
					tree_ids = (tree_ids == null || tree_ids.length==0 ? [] : tree_ids.split(',') );
					tree_ids.push($(this).parent().attr('id'));
					$.cookie(TREE.option.cookie, tree_ids.join(','), {path:'/',expires:1});
					// end hack

					if(this.className=='text'){
						this.className='active';
			    	}
					if(typeof TREE.option.afterClick == 'function'){
						TREE.nodeToggle($(this).parent().get(0));
						TREE.option.afterClick($(this).parent());
					}
					//TREE.setCSSPosition();
			    	return false;
				}).dblclick(function(){
					mousePressed = false;
					TREE.nodeToggle($(this).parent().get(0)); // open node
					if (typeof TREE.option.afterDblClick == 'function'){
						TREE.option.afterDblClick($(this).parent());
					}
					//TREE.setCSSPosition();
					return false;
					// added by Erik Dohmen (2BinBusiness.nl) to make context menu actions
					// available
				}).bind("contextmenu",function(){
					$('.active',TREE).attr('class','text');
					if (this.className=='text'){
						this.className='active';
					}
					if (typeof TREE.option.afterContextMenu == 'function'){
						TREE.option.afterContextMenu($(this).parent());
					}
					return false;
				}).mousedown(function(event){
					if ((!$.browser.msie && event.button == 0) 
						|| ($.browser.msie && event.button == 1) ){ // apply only for left mouse button click 
						mousePressed = true;
						cloneNode = $(this).parent().clone();
						var LI = $(this).parent();
						if (TREE.option.drag){
							$('>ul', cloneNode).hide();
							$('body').append('<div id="drag_container"><ul></ul></div>');
							$('#drag_container').hide().css({opacity:'0.8'});
							$('#drag_container >ul').append(cloneNode);
							$("<img>").attr({id: "tree_plus",
											src: "/site_media/images/tree/plus.gif"}).css({
													width: "7px",
													display: "block",
													position: "absolute",
													left: "5px",
													top: "5px", 
													display:'none'}).appendTo("body");
							$(document).bind("mousemove", {LI:LI}, TREE.dragStart).bind("mouseup",TREE.dragEnd);
						}
						return false;
					}
				}).mouseup(function(){
					if (mousePressed && mouseMoved && dragNode_source){
						TREE.moveNodeToFolder($(this).parent());
					}
					TREE.eventDestroy();
				}).hover(function(){ 
					$(this).addClass('hover'); 
				}, function(){ 
					$(this).removeClass('hover');
				});
				$('li', obj).each(function(i){
					var className = this.className;
					var open = false;
					var cloneNode = false;
					var LI = this;
					var childNode = $('>ul',this);
					if (childNode.size()>0){
						var setClassName = 'folder-';
						if (className && className.indexOf('open')>=0){
							setClassName=setClassName+'open';
							open=true;
			    		}else{
							setClassName=setClassName+'close';
			    		}
			    		this.className = setClassName + ($(this).is(':last-child')? '-last':'');

						if (!open || className.indexOf('ajax')>=0) childNode.hide();
			    
						TREE.setTrigger(this);
					}else{
						var setClassName = 'doc';
						this.className = setClassName + ($(this).is(':last-child')? '-last':'');
					}
				}).before('<li class="line">&nbsp;</li>')
				.filter(':last-child').after('<li class="line-last"></li>');
				TREE.setEventLine($('.line, .line-last', obj));
			};
			TREE.setTrigger = function(node){
				$('>span',node).before('<img class="trigger" src="'+TREE.option.spacer+'" border=0>');
				var trigger = $('>.trigger', node);
				trigger.click(function(event){
					TREE.nodeToggle(node);
				});
	            
				if(!$.browser.msie){
					trigger.css('float','left');
				}
			};
			TREE.dragStart = function(event){
				var LI = $(event.data.LI);
				if(mousePressed){
					mouseMoved = true;
					if(dragDropTimer) clearTimeout(dragDropTimer);
					if($('#drag_container:not(:visible)')){
						$('#drag_container').show();
						LI.prev('.line').hide();
						dragNode_source = LI;
					}
					$('#drag_container').css({position:'absolute', 
													left: (event.pageX + 5), 
													top: (event.pageY + 15) });

					if (LI.is(':visible')) LI.hide();

					var temp_move = false;
					if (event.target.tagName.toLowerCase()=='span' 
						&& $.inArray(event.target.className, Array('text','active','trigger'))!= -1){
						var parent = event.target.parentNode;
						var offs = $(parent).offset({scroll:false});
						var screenScroll = {x: (offs.left - 3), y: (event.pageY - offs.top)};
						var isrc = $("#tree_plus").attr('src');
						var ajaxChildSize = $('>ul.ajax',parent).size();
						var ajaxChild = $('>ul.ajax',parent);
						screenScroll.x += 19;
						screenScroll.y = event.pageY - screenScroll.y + 5;

						if (parent.className.indexOf('folder-close')>=0 && ajaxChildSize==0){
							if (isrc.indexOf('minus')!=-1)
								$("#tree_plus").attr('src','/site_media/images/tree/plus.gif');

							$("#tree_plus").css({"left": screenScroll.x, "top": screenScroll.y}).show();
							dragDropTimer = setTimeout(function(){
								parent.className = parent.className.replace('close','open');
								$('>ul',parent).show();
							}, 700);
						} else if (parent.className.indexOf('folder')>=0 && ajaxChildSize==0){
							if (isrc.indexOf('minus')!=-1)
								$("#tree_plus").attr('src','/site_media/images/tree/plus.gif');

							$("#tree_plus").css({"left": screenScroll.x, "top": screenScroll.y}).show();
						}else if(parent.className.indexOf('folder-close')>=0 && ajaxChildSize>0) {
							mouseMoved = false;
							$("#tree_plus").attr('src','/site_media/images/tree/minus.gif');
							$("#tree_plus").css({"left": screenScroll.x, "top": screenScroll.y}).show();

							$('>ul',parent).show();
							/*
								Thanks for the idea of Erik Dohmen
							*/
							TREE.setAjaxNodes(ajaxChild,parent.id, function(){
								parent.className = parent.className.replace('close','open');
								mouseMoved = true;
								$("#tree_plus").attr('src','/site_media/images/tree/plus.gif');
								$("#tree_plus").css({"left": screenScroll.x, "top": screenScroll.y}).show();
							});
						}else{
							if (TREE.option.docToFolderConvert){
								$("#tree_plus").css({"left": screenScroll.x, "top": screenScroll.y}).show();
							}else{
								$("#tree_plus").hide();
							}
						}
					}else{
						$("#tree_plus").hide();
					}
					return false;
				}
				return true;
			};
			TREE.dragEnd = function(){
				if(dragDropTimer) clearTimeout(dragDropTimer);
				TREE.eventDestroy();
			};
			TREE.setEventLine = function(obj){
				obj.mouseover(function(){
					if(this.className.indexOf('over')<0 && mousePressed && mouseMoved){
						this.className = this.className.replace('line','line-over');
					}
				}).mouseout(function(){
					if(this.className.indexOf('over')>=0){
						this.className = this.className.replace('-over','');
					}
				}).mouseup(function(){
					if(mousePressed && dragNode_source && mouseMoved){
						dragNode_destination = $(this).parents('li:first');
						TREE.moveNodeToLine(this);
						TREE.eventDestroy();
					}
				});
			};
			TREE.checkNodeIsLast = function(node){
				if(node.className.indexOf('last')>=0){
					var prev_source = dragNode_source.prev().prev();
					if(prev_source.size()>0){
						prev_source[0].className+='-last';
					}
					node.className = node.className.replace('-last','');
				}
			};
			TREE.checkLineIsLast = function(line){
				if(line.className.indexOf('last')>=0){
					var prev = $(line).prev();
					if(prev.size()>0){
						prev[0].className = prev[0].className.replace('-last','');
					}
					dragNode_source[0].className+='-last';
				}
			};
			TREE.eventDestroy = function(){
			    // added by Erik Dohmen (2BinBusiness.nl), the unbind mousemove TREE.dragStart action
			    // like this other mousemove actions binded through other actions ain't removed (use it myself
			    // to determine location for context menu)
		    	$(document).unbind('mousemove',TREE.dragStart).unbind('mouseup').unbind('mousedown');
		    	$('#drag_container, #tree_plus').remove();
		    	if (dragNode_source){
					$(dragNode_source).show().prev('.line').show();
		    	}
		    	dragNode_destination = dragNode_source = mousePressed = mouseMoved = false;
		    	//ajaxCache = Array();
			};
			TREE.convertToFolder = function(node){
		    	node[0].className = node[0].className.replace('doc','folder-open');
		    	node.append('<ul><li class="line-last"></li></ul>');
		    	TREE.setTrigger(node[0]);
		    	TREE.setEventLine($('.line, .line-last', node));
			};
			TREE.convertToDoc = function(node){
		    	$('>ul', node).remove();
		    	$('img', node).remove();
		    	node[0].className = node[0].className.replace(/folder-(open|close)/gi , 'doc');
			};
			TREE.moveNodeToFolder = function(node){
		    	if(!TREE.option.docToFolderConvert && node[0].className.indexOf('doc')!=-1){
					return true;
		    	}else if(TREE.option.docToFolderConvert && node[0].className.indexOf('doc')!=-1){
					TREE.convertToFolder(node);
		    	}
		    	TREE.checkNodeIsLast(dragNode_source[0]);
		    	var lastLine = $('>ul >.line-last', node);
		    	if(lastLine.size()>0){
					TREE.moveNodeToLine(lastLine[0]);
		    	}
			};
			TREE.moveNodeToLine = function(node){
		    	TREE.checkNodeIsLast(dragNode_source[0]);
		    	TREE.checkLineIsLast(node);
		    	var parent = $(dragNode_source).parents('li:first');
		    	var line = $(dragNode_source).prev('.line');
		    	$(node).before(dragNode_source);
		    	$(dragNode_source).before(line);
		    	node.className = node.className.replace('-over','');
		    	var nodeSize = $('>ul >li', parent).not('.line, .line-last').filter(':visible').size();
		    	if(TREE.option.docToFolderConvert && nodeSize==0){
					TREE.convertToDoc(parent);
		    	}else if(nodeSize==0){
					parent[0].className=parent[0].className.replace('open','close');
					$('>ul',parent).hide();
		    	}

		    	// added by Erik Dohmen (2BinBusiness.nl) select node
		    	if($('span:first',dragNode_source).attr('class')=='text'){
					$('.active',TREE).attr('class','text');
					$('span:first',dragNode_source).attr('class','active');
		    	}

		    	if(typeof(TREE.option.afterMove) == 'function'){
					var pos = $(dragNode_source).prevAll(':not(.line)').size();
					TREE.option.afterMove($(node).parents('li:first'), $(dragNode_source), pos);
		    	}
			};
			TREE.addNode = function(id, text, callback){
		    	var temp_node = $('<li><ul><li id="'+id+'"><span>'+text+'</span></li></ul></li>');
		    	TREE.setTreeNodes(temp_node);
		    	dragNode_destination = TREE.getSelected();
		    	dragNode_source = $('.doc-last',temp_node);
		    	TREE.moveNodeToFolder(dragNode_destination);
		    	temp_node.remove();
		    	if(typeof(callback) == 'function'){
					callback(dragNode_destination, dragNode_source);
		    	}
			};
			TREE.delNode = function(callback){
		    	dragNode_source = TREE.getSelected();
		    	TREE.checkNodeIsLast(dragNode_source[0]);
		    	dragNode_source.prev().remove();
		    	dragNode_source.remove();
		    	if(typeof(callback) == 'function'){
					callback(dragNode_destination);
		    	}
			};
			/*TREE.setCSSPosition = function(){
				
	            var visible_window_height = $(window).height() - $('#mainnav').outerHeight() 
	            		- $('#bodyMenu').offset().top;
	            console.log(visible_window_height + ':' + $('#bodyMenu .catalog-menu').outerHeight());
	            var position = 'relative';
	            if ($('#bodyMenu .catalog-menu').outerHeight() < visible_window_height){
	            	position = 'fixed';
	            }
	            $('#bodyMenu').css('position', position);

			};*/


			
			TREE.init = function(obj){
	            // open nodes
	            var tree_ids = $.cookie(TREE.option.cookie);
	            tree_ids = (tree_ids == null ? [0] : tree_ids.split(','));
	            for (var i=0; i<tree_ids.length; i++) {
	                var tree_id = Number(tree_ids[i]);
	                if (tree_id > 0) {
	                    var base = $('li#'+tree_id, TREE);
	                    
	                    $(base).children('span').addClass('active');
	                    $(base).addClass('open');
	                    
	                    var max_depth = 10;
	                    var curr_depth = 0;
	                    
	                    // li#000 ul := .open
	                    while( true ){
	                        base = $(base).parent().parent();
	                        if( $(base).children('ul') != null ){
	                            $(base).addClass('open');
	                        }
	                        if( $(base).hasClass('root') || curr_depth > max_depth ){
	                            break;
	                        }
	                        ++curr_depth;
	                    }
	                }
	            }
	            ROOT.children('ul').find('li').tsort();
		    	TREE.setTreeNodes(obj, false);
			};
			
			TREE.init(ROOT);
	    });
	}
})(jQuery);