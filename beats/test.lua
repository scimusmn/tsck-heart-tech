local json = require('json')

local jsonFilename = arg[1]
local dotIndex = string.find(arg[1], '.json')-1
local dataFilename = string.sub(arg[1], 1, dotIndex)..'.dat'

local file = io.open(jsonFilename, 'r')
local jsonData = file:read('*all')
file:close()

local data = json.decode(jsonData)

file = io.open(dataFilename, 'w')
for _, point in ipairs(data) do
   file:write(tostring(point.x)..' '..tostring(point.y)..'\n')
end

file:close()
