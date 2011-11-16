import re


FIND_SCRIPT_TAGS = re.compile(r'(<script .*?>.*?</script>)', re.DOTALL)

class ScriptsAtBottomMiddleware(object):
    """Finds all tags <script> at the HTML response and move to the end of the document,
    before tag </html>.
    
    This makes the page load faster, because <script> blocks parallel loading.
    
    Read more about this at:
        - http://developer.yahoo.com/performance/rules.html#js_bottom
        - http://code.google.com/intl/pt-BR/speed/page-speed/docs/rtt.html#PutStylesBeforeScripts
    """

    def process_response(self, request, response):
        if 'content-type' in response:
            from cgi import parse_header
            try:
                content_type = parse_header(response['content-type'])[0] #response['content-type'][:9]
                if content_type == 'text/html':
                    # Find scripts tags with src
                    f = FIND_SCRIPT_TAGS.findall(response.content)
            
                    # Remove the tags found
                    for tag in f: response.content = response.content.replace(tag, '')

                    # Remove equivalent tags/scripts
                    sc = []
                    for t in f:
                        if t not in sc:
                            sc.append(t)
            
                    # Insert the tags found at the bottom
                    pos = response.content.find('</html>')
                    response.content = response.content[:pos] + '\n'.join(sc) + '\n' + response.content[pos:]
            except Exception, e:
                pass

        return response
