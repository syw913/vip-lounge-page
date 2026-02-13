import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  // 全局状态
  state: {
    count: 0
  },
  // 修改状态的唯一方式
  mutations: {
    increment (state) {
      state.count++
    }
  },
  // 计算属性（简化状态获取）
  getters: {
    doubleCount: state => state.count * 2
  },
  actions: {},
  modules: {}
})
