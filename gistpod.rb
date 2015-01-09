

require 'rubygems'
require 'json'

json = File.read(ENV['HOME'] + '/.gistpod-cache')
pods = JSON.parse(json)

::Gistpods = Hash[ pods.map {|pod| [ pod['name'], pod['raw_url'] ]} ]
