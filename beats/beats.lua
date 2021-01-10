local image = require('image')
local json = require('json')

function extract(imageFilename, step)
   local tbl = {}
   local img = image.load(imageFilename)
   local size = image.getSize(imageFilename)
   local width = size[3]
   local height = size[2]

   print(imageFilename)
   print(size)
   
   for x = 1,width,step do
      for y = 1,height do
	 local alpha = img[4][y][x]
	 if alpha ~= 0 then
	    table.insert(tbl, {x=x/height, y=1-y/height})
	    break
	 end
      end
   end

   return tbl
end

local imageFilename = arg[1]
local dotIndex = string.find(arg[1], '.png')-1
local jsonFilename = string.sub(arg[1], 1, dotIndex)..'.json'

local tbl = extract(imageFilename, tonumber(arg[2]) or 1)
local jsonData = json.encode(tbl)

local file = io.open(jsonFilename, 'w')
file:write(jsonData)
file:close()
