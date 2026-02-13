<template>
  <div class="report-page">
    <!-- 顶部操作栏 -->
    <div class="report-header">
      <h1>贵宾室数据报表</h1>
      <div class="report-actions">
        <!-- 新增按钮：跳转到TripGeneratorPage.vue -->
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="handleAdd"
          style="background-color: #333; border-color: #333; border-radius: 20px;"
        >
          新增数据
        </el-button>
        <!-- 删除按钮：删除选中行（禁用状态：无选中行时） -->
        <el-button
          type="danger"
          icon="el-icon-delete"
          @click="handleDelete"
          :disabled="!selectedRows.length"
          style="border-radius: 20px;"
        >
          删除选中
        </el-button>
      </div>
    </div>

    <!-- 报表表格 -->
    <el-table
      ref="reportTable"
      :data="reportData"
      :border="true"
      :header-cell-style="{background: '#f5f5f5'}"
      @selection-change="handleSelectionChange"
      style="width: 100%; margin-top: 20px;"
    >
      <!-- 多选列 -->
      <el-table-column type="selection" width="55"></el-table-column>
      <!-- 数据列（适配你的现有数据结构） -->
      <el-table-column prop="userId" label="用户ID" width="120"></el-table-column>
      <el-table-column prop="name" label="姓名" width="120"></el-table-column>
      <el-table-column prop="date" label="有效日期"></el-table-column>
      <el-table-column prop="referenceCode" label="参考代码" width="200"></el-table-column>
      <el-table-column prop="qrcodeContent" label="二维码内容" show-overflow-tooltip></el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'ReportPage',
  data () {
    return {
      // 报表数据（从localStorage读取，和现有项目数据互通）
      reportData: [],
      // 选中的行数据
      selectedRows: []
    }
  },
  mounted () {
    // 初始化：读取localStorage中的用户数据
    this.loadReportData()
  },
  methods: {
    // 加载报表数据
    loadReportData () {
      const userData = JSON.parse(localStorage.getItem('userTripData') || '[]')
      this.reportData = userData
    },

    // 新增按钮：跳转到TripGeneratorPage.vue
    handleAdd () {
      this.$router.push({ path: '/trip-generator' })
    },

    // 监听表格选中行变化
    handleSelectionChange (val) {
      this.selectedRows = val
    },

    // 删除选中行
    handleDelete () {
      this.$confirm('确定删除选中的行数据吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 1. 获取选中行的userId列表
        const deleteUserIds = this.selectedRows.map(item => item.userId)
        // 2. 过滤掉选中的行
        this.reportData = this.reportData.filter(item => !deleteUserIds.includes(item.userId))
        // 3. 更新localStorage
        localStorage.setItem('userTripData', JSON.stringify(this.reportData))
        // 4. 清空选中状态
        this.$refs.reportTable.clearSelection()
        // 5. 提示
        this.$message.success('删除成功！')
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    }
  }
}
</script>

<style scoped>
.report-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.report-header h1 {
  font-size: 24px;
  color: #333;
  margin: 0;
}

.report-actions {
  display: flex;
  gap: 10px;
}
</style>
