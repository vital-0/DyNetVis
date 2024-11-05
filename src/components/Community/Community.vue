<template>
  <div class="Community">
    <div class="Community-title" id="Community-title">
      <div class="title-text">
        <h1 class="Component_Name">communities evolution</h1>
      </div>
      <div class="Community-legend" id="Community-legend"></div>
    </div>
    <div class="Community-container" id="Community-container"></div>
  </div>
</template>

<script>
import { drawC, drawT} from './Community';
export default {
  name: 'Community',
  props: {
    msg: String,
    netWorktData: {},
  },
  data() {
    return {
      testData: null,
    }
  },
  mounted() {
    // 如果需要在单个组件中发起请求，可以在mount中获取
    const data = {}
    drawC('.Community-container', data);
    drawT('.Community-title');
  },
  // methods: {
  //   function1() {

  //   },
  //   function2() {
  //   }

  // }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.Community {
  width: 100%;
  height: 100%;
}

.Community>.Community-title {
  width: 100%;
  height: 20%;
  display: flex;
  flex-direction: column; /* 使标题和图例垂直排列 */
  justify-content: center;
  align-items: center;
}

.title-text {
  margin-top: 10px;
  margin-bottom: 5px; /* 给标题和图例之间留出空间 */
}

.Community-legend {
  display: flex;
  justify-content: center;
  align-items: center;
}


.Community>.Community-container {
  width: 100%;  
  height: 80%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.Component_Name {
    color: rgba(70, 130, 180, 0.9);
    font-size: 18px; /* 根据需要调整字体大小 */
}

.circle {
  position: relative; /* 或absolute，‌取决于具体需求 */
  z-index: 1; /* 根据需要调整 */
}

.trapezoid {
  position: relative; /* 或absolute，‌取决于具体需求 */
  z-index: 2; /* 根据需要调整 */
}

/* 鼠标悬停在圆圈类上时将会改变鼠标外观 */
.Community >>> .circle {
  cursor: pointer; /* 鼠标悬停在圆圈上时显示手指箭头 */
}
</style>