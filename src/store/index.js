import { createStore } from 'vuex';
import mutations from './mutations';
const state = {
  count: 1,
}
export default createStore({
  state,
  mutations,
});
