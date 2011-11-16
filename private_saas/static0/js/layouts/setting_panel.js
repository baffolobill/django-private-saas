jQuery(document).ready(function(){
  jQuery.noConflict();

  // settings panel
  jQuery('#settings-panel-close').click(function(){
    jQuery('#settings-panel').slideUp();
  });

  jQuery('#view-settings-button a').click(function(){
    jQuery('#settings-panel').slideDown();
  });

  // tabs
  jQuery('#tabs').tabs();
});