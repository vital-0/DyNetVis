<template>
  <!-- 摆放各个组件以及布局 -->
  <div class="layout">
    <div class="top">
      <ProjectHeader />
    </div>
    <div class="middle">
      <div class="middle-left">
        <div class="middle-left-top">
          <Community_detail></Community_detail>
        </div>
        <div class="middle-left-bottom">
        </div>
      </div>
      <div class="middle-middle">
        <div class="middle-middle-top">
          <Community></Community>
        </div>
        <div class="middle-middle-bottom">
          <StaticNetwork></StaticNetwork>
        </div>
      </div>
      <div class="middle-right">
        <div class="middle-right-top">
          <NetWork></NetWork>
        </div>
        <div class="middle-right-bottom">
        </div>
      </div>
    </div>
    <div class="bottom">
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import connnect from '../lib/net';//导入前端链接后端的插件，无需使用此变量
import ProjectHeader from '@/components/ProjectHeader/projectHeader.vue';
import NetWork from "@/components/NetWork/netWork.vue";
import Community from "@/components/Community/Community.vue";
import Community_detail from "@/components/Community_detail/Community_detail.vue";
import StaticNetwork from "@/components/StaticNetwork/StaticNetwork.vue";
export default {
  name: 'Home',
  components: {
    ProjectHeader,
    NetWork,
    Community,
    Community_detail,
    StaticNetwork
  },
  mounted() {
    // console.log(this.count);
  },
  computed: {
    // 获取vuex中的数据，并且声明为组价的计算属性
    count() {
      return this.$store.state.count;
    },
  },
  methods: {
    add() {
      this.$store.commit('increment', {
        amount: 10,
      });
    },
  },
};
</script>
<style scoped>
@import './Home.css';
</style>