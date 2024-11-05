const { ipcRenderer } = require("electron");
const Vue = require('vue')
const {defaultConfig, getConfig, applyConfig}  = require("../../utils/store")

applyConfig()
let biasX = 0
let biasY = 0
const moveS = [0, 0, 0, 0]
function calcS() {
  const res = Math.pow(moveS[0] - moveS[2], 2) + Math.pow(moveS[1] - moveS[3], 2)
  return res < 5
}
function handleMove(e) {
  ipcRenderer.send('ballWindowMove', { x: e.screenX - biasX, y: e.screenY - biasY })
}

const app = Vue.createApp({

  data: () => {
    return {
      isNotMore: true,
      count: [0, 0],
      opacity: 0.8,
      mainColor: '',
      subColor: '',
      pic: '',
      pointDisplay: '',
      pointColor: '',
    }
  },

  mounted() {
    const storage = getConfig()
    this.mainColor = storage.mainColor
    this.subColor = storage.subColor
    this.opacity = storage.opacity
    ipcRenderer.on("update", (e, data) => {
      console.log(data)
      this.count = data
      if (data[1] > 0) {
        this.pic = '../../assets/ddl.gif';
        this.pointDisplay = 'flex'
        this.pointColor = this.subColor
      } else if (data[0] > 0){
        this.pic = '../../assets/haveTask.gif';
        this.pointDisplay = 'flex'
        this.pointColor = 'yellow'
      } else {
        this.pointDisplay = 'none'
        this.pic = '../../assets/finish.gif';
      }
    })
    ipcRenderer.on("config", (e, data) => {
      this.opacity = data.opacity
      this.mainColor = data.mainColor
      this.subColor = data.subColor
      this.pointDisplay = data.pointDisplay
    })
    ipcRenderer.send("updateBall")
  },
  methods: {
    showMore() {
      // this.isNotMore = false
      // document.querySelector('.main-container').classList.remove("main-container-not-hover")
      // document.querySelector('.main-container').classList.add("main-container-hover")
      document.querySelector('.son-item:nth-child(3)').classList.add("rightRunAm")
      document.querySelector('.son-item:nth-child(3)').classList.remove("rightRunBackAm")
      // document.querySelector('.son-item:nth-child(2)').classList.add("midRunAm")
      // document.querySelector('.son-item:nth-child(2)').classList.remove("midBackRunAm")
      document.querySelector('.son-item:nth-child(1)').classList.add("leftRunAm")
      document.querySelector('.son-item:nth-child(1)').classList.remove("leftRunBackAm")
      // ipcRenderer.send('setFloatIgnoreMouse', false)
    },
    showEssay(e) {
      if (calcS())
        ipcRenderer.send("showEssay", "show")
    },
    showTodo() {
      if (calcS())
        ipcRenderer.send("showTodo", "show")
    },
    showSimTodo() {
      if (calcS())
        ipcRenderer.send("showSimTodo", "show")
    },
    hideMore() {
      // this.isNotMore = true
      // document.querySelector('.main-container').classList.add("main-container-not-hover")
      // document.querySelector('.main-container').classList.remove("main-container-hover")
      document.querySelector('.son-item:nth-child(3)').classList.remove("rightRunAm")
      document.querySelector('.son-item:nth-child(3)').classList.add("rightRunBackAm")
      // document.querySelector('.son-item:nth-child(2)').classList.remove("midRunAm")
      // document.querySelector('.son-item:nth-child(2)').classList.add("midBackRunAm")
      document.querySelector('.son-item:nth-child(1)').classList.remove("leftRunAm")
      document.querySelector('.son-item:nth-child(1)').classList.add("leftRunBackAm")
      // ipcRenderer.send('setFloatIgnoreMouse', true)
    },
    handleMouseDown(e) {
      if (e.button == 2) {
        this.isNotMore = true
        ipcRenderer.send('openMenu')
        return
      }
      biasX = e.x;
      biasY = e.y;
      moveS[0] = e.screenX - biasX
      moveS[1] = e.screenY - biasY
      document.addEventListener('mousemove', handleMove)
    },
    handleMouseUp(e) {
      moveS[2] = e.screenX - e.x
      moveS[3] = e.screenY - e.y
      biasX = 0
      biasY = 0
      document.removeEventListener('mousemove', handleMove)
    },
  },
  computed: {
    progress: function () {
      const totalCount = this.count[0] + this.count[1]
      console.log("aaa" + totalCount)
      if (totalCount == 0) {
        return "0%"
      } else {
        const percent = parseInt(this.count[1] * 100 / totalCount)
        return percent + "%"
      }
    }
  }
})
app.mount("#app")
