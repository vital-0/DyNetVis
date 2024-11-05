<template>
  <div class="NetWork">
    <div class="NetWork-title" id="NetWork-title">
      <div class="Title-text" id="Title-text"> 
        <h1 class="Component_Name">{{ titleText }}</h1>
      </div>
      <div class="NetWork-legend" id="NetWork-legend"></div>
    </div>
    <div class="NetWork-container" id="NetWork-container"></div>
  </div>
</template>

<script>
import { drawNetWork, drawButton, drawLegend} from './netWorkHelp';

// 更改数据集需要换
const dataSet = "workplace_contacts"

// 社区演变数据
const graph = require('../../../server/data/realworlddata/' + dataSet + '/hypergraph_0.json');

export default {
  name: 'NetWork',
  props: {
    msg: String,
    netWorktData: {},
  },
  data() {
    return {
      titleText: '(super) Node-link Diagram' // 初始的文本内容
    };
  },
  mounted() {
    // 如果需要在单个组件中发起请求，可以在mount中获取
    drawNetWork('.NetWork-container', graph);
    drawButton('.NetWork-container', this.updateTitle, dataSet);
    drawLegend('.NetWork-legend', graph);
  },
  methods: {
    updateTitle(newTitle) {
      this.titleText = newTitle; // 通过 Vue 的方法更新标题内容
    },
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.NetWork {
  width: 100%;
  height: 100%;
}

.NetWork>.NetWork-title {
  width: 100%;
  height: 20%;
  display: flex;
  flex-direction: column; /* 将子元素垂直排列 */
  justify-content: center;
  align-items: center;
}

.NetWork>.NetWork-title>.Title-text {
  width: 100%;
  height: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.Component_Name {
  color: rgba(70, 130, 180, 0.9);
  font-size: 18px; /* 设置字体大小 */
}

.NetWork>.NetWork-title>.NetWork-legend {
  width: 100%;
  height: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.NetWork>.NetWork-container {
  width: 100%;
  height: 80%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

</style>