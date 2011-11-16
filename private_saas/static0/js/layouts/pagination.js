jQuery(document).ready(function(){
  jQuery.noConflict();

  // paginator
  var paginator = new Paginator(
    "pagination", // id контейнера, куда ляжет пагинатор
    {{pages.count}}, // общее число страниц
    15, // число страниц, видимых одновременно
    {{pages.current}}, // номер текущей страницы
    "{{pages.url}}" // url страниц
  );
});