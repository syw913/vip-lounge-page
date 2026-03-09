<template>
  <div class="report-page">
    <!-- 顶部操作栏 -->
    <div class="report-header">
      <h1>贵宾室数据报表</h1>
      <div class="report-actions">
        <!-- 新增按钮：跳转到TripGeneratorPage.vue -->
        <el-button
          type="primary"
          size="small"
          icon="el-icon-plus"
          @click="handleAdd"
          style="background-color: #333; border-color: #333; border-radius: 20px;"
        >
          新增数据
        </el-button>
        <!-- 删除按钮：删除选中行（禁用状态：无选中行时） -->
        <el-button
          type="danger"
          size="small"
          icon="el-icon-delete"
          @click="delTrip"
          :disabled="!selectedRows.length"
          style="border-radius: 20px;"
        >
          删除选中
        </el-button>
        <el-button
          type="danger"
          size="small"
          icon="el-icon-delete"
          @click="changeStatus"
          :disabled="!selectedRows.length"
          style="border-radius: 20px;"
        >
          启用/禁用行程
        </el-button>
        <el-button
          type="danger"
          size="small"
          icon="el-icon-delete"
          @click="getTripList"
          :disabled="!selectedRows.length"
          style="border-radius: 20px;"
        >
          刷新页面
        </el-button>
      </div>
    </div>

    <!-- 报表表格 -->
    <el-table
      ref="reportTable"
      :data="tripList"
      :border="true"
      :header-cell-style="{background: '#f5f5f5'}"
      @selection-change="handleSelectionChange"
      style="width: 100%; margin-top: 20px;"
    >
      <!-- 多选列 -->
      <el-table-column type="selection" width="55"></el-table-column>
      <!-- 数据列（适配你的现有数据结构） -->
      <el-table-column prop="id" label="用户ID" width="120"></el-table-column>
      <el-table-column prop="name" label="姓名" width="120"></el-table-column>
      <el-table-column prop="date" label="有效日期"></el-table-column>
      <el-table-column prop="status" label="启用状态（1是启用）"></el-table-column>
      <!-- <el-table-column prop="referenceCode" label="参考代码" width="200"></el-table-column>
      <el-table-column prop="qrcodeContent" label="二维码内容" show-overflow-tooltip></el-table-column> -->
    </el-table>
  </div>
</template>

<script>
import { getTripList, updateTripStatus, deleteTrip } from '@/api/trip';
export default {
  name: 'ReportPage',
  data () {
    return {
      // 报表数据（所有行程列表）
      tripList: [],
      // 选中的行数据
      selectedRows: [],
    }
  },
  mounted () {
    this.getTripList();
  },
  methods: {
    // 获取所有行程
    async getTripList() {
      try {
        const res = await getTripList();
        if (res.data.code === 200) {
          this.tripList = res.data.data;
        }
      } catch (err) {
        console.error('查询列表失败：', err);
      }
    },
    // 启用/禁用行程
    async changeStatus() {
      try {
        this.selectedRows.map(async ele=>{
          const res = await updateTripStatus({
            tripId: ele.id,
            status: ele.status ? 0 : 1 // 切换状态：1→0，0→1
          });
          if (res.data.code === 200) {
            this.$message.success(res.data.msg);
            this.getTripList(); // 刷新列表
          }
        })
      } catch (err) {
        console.error('更新状态失败：', err);
        this.$message.error('操作失败！');
      }
    },
    // 删除行程
    async delTrip() {
      if (confirm('确定删除该行程吗？')) {
        try {
          this.selectedRows.map(async ele=>{
            const res = await deleteTrip(ele.id);
            if (res.data.code === 200) {
              this.$message.success('删除成功！');
              this.getTripList();
            }
          })
        } catch (err) {
          console.error('删除失败：', err);
          this.$message.error('删除失败！');
        }
      }
    },

    // 新增按钮：跳转到TripGeneratorPage.vue
    handleAdd () {
      this.$router.push({ path: '/trip-generator' })
    },

    // 监听表格选中行变化
    handleSelectionChange (val) {
      this.selectedRows = val
    }
  }
}
</script>

<style scoped>
.report-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 10px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.report-header h1 {
  font-size: 24px;
  color: #333;
  margin: 0;
  margin-bottom: 10px;
}

.report-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
</style>
