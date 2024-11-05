<template>
  <div class="Community_detail">
    <div class="Detail-title" id="Detail-title">
      <div class="title-text">
        <h1 class="Component_Name">Community detail</h1>
      </div>
    </div>
    <div class="Detail-container" id="Detail-container"></div>
  </div>
</template>

<script>
import { draw_detail} from './Community_detail';
export default {
  name: 'Test',
  props: {},
  data() {
    return {
      testData: null,
    }
  },
  mounted() {
    // 如果需要在单个组件中发起请求，可以在mount中获取
    const data = [
    { metric: "Metric", value: "Value" },
    { metric: "NMI of network", value: "0.86" },//当前时片相对于前一个时间片的NMI即变化程度
    { metric: "Number of nodes", value: "78" },
    { metric: "Number of edges", value: "1433" },
    { metric: "Number of timestamps", value: "8" }
    ];
    draw_detail('.Detail-container', data);
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
.Community_detail {
  width: 100%;
  height: 100%;
}

.Community_detail>.Detail-title {
  width: 100%;
  height: 10%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.title-text {
  margin-top: 20px;
  margin-bottom: 5px; /* 给标题和图例之间留出空间 */
}

.Community_detail>.Detail-container {
  width: 100%;  
  height: 90%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.Component_Name {
    color: rgba(70, 130, 180, 0.9);
    font-size: 18px; /* 根据需要调整字体大小 */
}

</style>