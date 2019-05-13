const path = require('path')
const express = require('express')
const SocketIO = require('socket.io')
const Jimp = require('jimp')
const fs = require('fs')
  
const app = express()
const port = 3005
//主要需要创建websocket服务器，而不是一个正常服务器
//未来启动后，需要向客户端服务一个页面，需要一个静态文件，先不管
const server = app.listen(port, () => {
  console.log('server listening in port', port)
})

//拿到io
const io = SocketIO(server)

// app.use(express.static(path.join(__dirname,'./dist')))


const pixelData = new Jimp(20,20,0xffff00ff)

io.on('connection',async (socket) => {

  var pngBuffer = await pixelData.getBufferAsync(Jimp.MIME_PNG)  
  //前端io通过这句收到事件  
  socket.emit('initial-pixel-data',  pngBuffer) //二进制数据和字符串在ws中只能有一种，send函数(如果有的话)只能传一个


  //异步一下，先广播给用户再写入
  socket.on('draw-dot', async ({row,col,color}) => {//前端drawDot发过来的时候是个字符串，转换成十六进制的颜色数据
    //socket io可以
    console.log('画点进来')
    var hexColor = Jimp.cssColorToHex(color)
    pixelData.setPixelColor(hexColor,col,row)


    socket.broadcast.emit('update-dot', { row, col, color })//把这个点发给所有的连接上来的客户端
    console.log('广播结束')
    socket.emit('update-dot', { row, col, color })  //给别人发一份也给自己发一份

    var buf = await pixelData.getBufferAsync(Jimp.MIMe_PNG)
    fs.writeFile('./pixelData.png', buf, (err) => {//保存到硬盘上
      if(err) {
        console.log(err)
      } else {
        console.log('save pixel data success!')
      }
    })
  })


  socket.on('disconnect', () => {
    console.log('someone  leave')
  })
})
 
  