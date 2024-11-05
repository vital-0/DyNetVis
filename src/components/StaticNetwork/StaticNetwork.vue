<template>
  <div class="StaticNetwork">
    <div class="Detail-title" id="Detail-title">
      <div class="title-text">
        <h1 class="Component_Name">Dynamic attribute analysis</h1>
      </div>
    </div>
    <div class="Heatmap-container" id="Heatmap-container"></div>
  </div>
</template>

<script>
import { drawScatter} from './StaticNetwork';
export default {
  name: 'Test',
  props: {},
  data() {
    return {
      testData: null,
    }
  },
  mounted() {
    // drawScatter('.Heatmap-container');
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
.StaticNetwork {
  width: 100%;
  height: 100%;
}

.StaticNetwork>.Detail-title {
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

.StaticNetwork>.Heatmap-container {
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