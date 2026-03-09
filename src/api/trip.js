import axios from 'axios'
// 在你的 axios 配置中添加
axios.defaults.headers.common['Cache-Control'] = 'no-cache, no-store, must-revalidate';
axios.defaults.headers.common['Pragma'] = 'no-cache';
// 后端接口地址（本地开发）
// const baseURL = 'http://localhost:3000/api/trip'
const baseURL = 'https://hymenopterous-nondispersive-lexi.ngrok-free.dev/api/trip'

// 新增行程
export function saveTrip (data) {
  return axios.post(`${baseURL}/save`, data)
}

// 查询单个行程
export function getTrip (id) {
  return axios.get(`${baseURL}/${id}`)
}

// 查询所有行程
export function getTripList () {
  return axios.get(`${baseURL}/list`)
}

// 更新行程状态
export function updateTripStatus (data) {
  return axios.put(`${baseURL}/status`, data)
}

// 删除行程
export function deleteTrip (id) {
  return axios.delete(`${baseURL}/del/${id}`)
}
