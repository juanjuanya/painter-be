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

async function main() {
  // const pixelData = new Jimp(100,100,0xffff00ff)
  const pixelData = await Jimp.read('./pixelData.png')
  let onlineCount = 0

  let dotOperations = []
  setInterval(() => {
    io.emit('update-dots', dotOperations)
    dotOperations = []
  }, 100)

  io.on('connection',async (socket) => {
    onlineCount++
    //给所有客户端发东西
    io.emit('online-count', onlineCount)

    var pngBuffer = await pixelData.getBufferAsync(Jimp.MIME_PNG)  
    //前端io通过这句收到事件  
    var lastDrawTime = Date.now()
    socket.emit('initial-pixel-data',  pngBuffer) //二进制数据和字符串在ws中只能有一种，send函数(如果有的话)只能传一个

    //测试，socket io 是否既能发送字符串，又能二进制
    // setTimeout(() => {
    //   socket.emit('foo bar', {
    //     pngBuffer,
    //     foo: 1, bar: '1222',
    //     buffer: Buffer.alloc(100).fill(0xff)
    //   })
    // }, 5000);

    //异步一下，先广播给用户再写入
    socket.on('draw-dot', async ({row,col,color}) => {//前端drawDot发过来的时候是个字符串，转换成十六进制的颜色数据
      // var now = Date.now()
      // if(now - lastDrawTime < 3) {  //限制频繁点击
      //   return
      // }

      // lastDrawTime = now

      //socket io可以
      console.log('画点进来')
      var hexColor = Jimp.cssColorToHex(color)
      pixelData.setPixelColor(hexColor,col,row)

      dotOperations.push({row,col,color})  //保存

      // io.emit('update-dot', { row, col, color })//把这个点发给所有的连接上来的客户端，包括自己
     
      try{
        var buf = await pixelData.getBufferAsync(Jimp.MIMe_PNG)
        await fs.promises.writeFile('./pixelData.png', buf)
        console.log('save pixel data success!')
      } catch(err) {
        console.log(err)
      }
    })

    socket.on('chat-msg', msg => {
      io.emit('chat-msg', msg)
    })

    socket.on('disconnect', () => {
      onlineCount--
      // socket.broad
      console.log('someone  leave')
    })
  })
  
}
 
main()