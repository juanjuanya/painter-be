const path = require('path')
const express = require('express')
const SocketIO = require('socket.io')

const app = express()
const port = 3005
//主要需要创建websocket服务器，而不是一个正常服务器
//未来启动后，需要向客户端服务一个页面，需要一个静态文件，先不管
const server = app.listen(port, () => {
  console.log('server listening in port', port)
})

const io = SocketIO

// app.use(express.static(path.join(__dirname,'./dist')))
const pixelData = [
  //每个颜色先保存成二位数组
  ['red', 'red', 'blue', 'black']
  ['red', 'red', 'blue', 'black']
  ['red', 'red', 'blue', 'black']
  ['red', 'red', 'blue', 'black']
]
io.on('connection',(ws) => {
  //前端io通过这句收到事件
  ws.emit('pixel-data', pixelData)
  ws.on('disconnect', () => {
    console.log('someone leave')
  })
})
 
