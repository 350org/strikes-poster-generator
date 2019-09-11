# Reload the browser automatically whenever files change
activate :livereload
config[:livereload_css_target] = nil

###
# Helpers
###
helpers do
  def get_url
    absolute_prefix + url_prefix
  end
end

###
# Config
###
config[:css_dir] = 'stylesheets'
config[:js_dir] = 'javascripts'
config[:images_dir] = 'images'
config[:url_prefix] = '/'
config[:absolute_prefix] = 'http://localhost:4567'

# Build-specific configuration
configure :build do
  puts "local build"
  config[:url_prefix] = ''
  config[:absolute_prefix] = ''
  activate :asset_hash
  activate :minify_javascript
  activate :minify_css
end
