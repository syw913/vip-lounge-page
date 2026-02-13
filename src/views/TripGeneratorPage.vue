<template>
  <div class="trip-generator-page">
    <div class="page-header">
      <i class="el-icon-document" />
      <span>行程信息生成器</span>
    </div>

    <el-form
      :model="form"
      label-width="80px"
      class="form-left-align"
      label-position="left"
    >
      <!-- 隐藏：用户ID -->
      <el-form-item label="用户ID" style="display: none">
        <el-input
          v-model="form.userId"
          placeholder="生成信息后自动填充，删除时请输入要删除的ID"
          :readonly="false"
        />
      </el-form-item>

      <el-form-item label="姓名">
        <el-input v-model="form.name" placeholder="请输入姓名" />
      </el-form-item>

      <el-form-item label="同行人数">
        <el-input-number v-model="form.companionCount" :min="1" />
      </el-form-item>

      <el-form-item label="日期">
        <el-date-picker
          v-model="form.date"
          type="date"
          placeholder="选择日期"
          value-format="yyyy/MM/dd"
        />
      </el-form-item>

      <el-form-item label="原始图片（含二维码）">
        <div class="upload-area" @click="triggerUpload">
          <i class="el-icon-folder-add" />
          <p>点击选择包含二维码的图片 或 拖拽上传</p>
          <p class="sub-text">支持 JPG / PNG / GIF / WEBP 等格式</p>
          <p class="sub-text">预览将自动显示在下方</p>
        </div>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          style="display: none"
          @change="handleFileChange"
          @drop="handleFileDrop"
          @dragover="handleDragOver"
        />
        <!-- 原始图片预览（保留） -->
        <div v-if="previewUrl" class="preview-container">
          <div class="preview-item">
            <p class="preview-title">原始图片</p>
            <img :src="previewUrl" alt="原始图片预览" class="preview-img" />
          </div>
          <!-- 隐藏：提取并生成的纯二维码 -->
          <div v-if="generatedQrcodeUrl" class="preview-item" style="display: none">
            <p class="preview-title">提取并生成的纯二维码</p>
            <img :src="generatedQrcodeUrl" alt="生成的二维码" class="preview-img" />
          </div>
          <el-button
            size="mini"
            type="text"
            class="clear-img-btn"
            @click="clearPreview"
          >
            清空图片
          </el-button>
        </div>
      </el-form-item>

      <!-- 隐藏：二维码解析内容 -->
      <el-form-item label="二维码解析内容" style="display: none">
        <el-input
          v-model="qrcodeResult"
          placeholder="上传图片后自动解析二维码内容"
          readonly
          type="textarea"
          rows="3"
          class="qrcode-result-input"
        />
      </el-form-item>

      <!-- 按钮：生成链接 + 重置/返回报表页 -->
      <el-form-item>
        <el-button type="primary" @click="generateLink" :loading="generating" :disabled="!generatedQrcodeUrl">
          <i class="el-icon-link" /> 生成链接
        </el-button>
        <el-button type="default" @click="resetAll" style="margin-left: 10px">
          <i class="el-icon-refresh" /> 重置
        </el-button>
        <el-button type="default" @click="backToReport" style="margin-left: 10px">
          <i class="el-icon-arrow-left" /> 返回报表页
        </el-button>
      </el-form-item>

      <!-- 生成链接区域（保留） -->
      <el-form-item label="生成链接">
        <el-input
          v-model="generatedLink"
          placeholder="生成链接后自动显示"
          readonly
          class="link-input"
        />
        <el-button
          size="mini"
          type="success"
          class="copy-link-btn"
          @click="copyLink"
          :disabled="!generatedLink"
        >
          <i class="el-icon-document-copy" /> 复制链接
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
// 引入必要依赖
import jsQR from 'jsqr'
import QRCode from 'qrcode'
// 假设项目中已安装并配置axios（如未安装：npm install axios）
import axios from 'axios'

// 配置接口基础地址（请替换为你的实际接口域名）
// const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'https://your-api-domain.com/api'

// 修改为（本地开发）
const API_BASE_URL = 'http://localhost:3000' // 去掉/api，因为接口路径已经包含/api
// 或（生产环境，如部署到服务器）
// const API_BASE_URL = 'http://你的服务器IP:3000';

export default {
  name: 'TripGeneratorPage',
  data () {
    return {
      form: {
        userId: '', // 保留字段，仅隐藏
        name: '',
        companionCount: 1,
        date: '2026/02/11'
      },
      previewUrl: '',
      generatedQrcodeUrl: '',
      qrcodeResult: '',
      generating: false, // 请求loading状态
      generatedLink: '',
      originalFileBase64: '',
      generatedQrcodeBase64: ''
    }
  },
  methods: {
    // ========== 基础方法（无修改） ==========
    triggerUpload () {
      this.$refs.fileInput.click()
    },
    handleFileChange (e) {
      const file = e.target.files[0]
      if (file) {
        this.handleFile(file)
        e.target.value = ''
      }
    },
    handleDragOver (e) {
      e.preventDefault()
      e.stopPropagation()
    },
    handleFileDrop (e) {
      e.preventDefault()
      e.stopPropagation()
      const file = e.dataTransfer.files[0]
      if (file) this.handleFile(file)
    },
    async handleFile (file) {
      if (!file.type.startsWith('image/')) {
        this.$message.error('请选择图片格式的文件！')
        return
      }
      this.previewUrl = URL.createObjectURL(file)
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const base64Str = e.target.result
          if (!base64Str || !base64Str.startsWith('data:image/')) throw new Error('图片转换失败')
          this.originalFileBase64 = base64Str
          const qrContent = await this.decodeQRCode(base64Str)
          if (!qrContent) {
            this.$message.warning('未从图片中识别到二维码，请上传包含有效二维码的图片！')
            this.qrcodeResult = ''
            this.generatedQrcodeUrl = ''
            this.generatedQrcodeBase64 = ''
            return
          }
          this.qrcodeResult = qrContent
          const qrBase64 = await this.generatePureQRCode(qrContent)
          this.generatedQrcodeUrl = qrBase64
          this.generatedQrcodeBase64 = qrBase64
          this.$message.success('二维码解析成功')
        } catch (err) {
          this.$message.error('图片处理失败：' + err.message)
          this.clearPreview()
        }
      }
      reader.onerror = () => {
        this.$message.error('图片读取失败，请重新上传！')
        this.clearPreview()
      }
      reader.readAsDataURL(file)
    },
    decodeQRCode (base64Str) {
      return new Promise((resolve) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const code = jsQR(imageData.data, canvas.width, canvas.height)
          resolve(code ? code.data : '')
        }
        img.onerror = () => resolve('')
        img.src = base64Str
      })
    },
    generatePureQRCode (content) {
      return new Promise((resolve, reject) => {
        QRCode.toDataURL(content, { width: 200, margin: 1 }, (err, url) => {
          if (err) reject(new Error('二维码生成失败：' + err.message))
          else resolve(url)
        })
      })
    },
    clearPreview () {
      this.previewUrl = ''
      this.generatedQrcodeUrl = ''
      this.qrcodeResult = ''
      this.originalFileBase64 = ''
      this.generatedQrcodeBase64 = ''
      this.$message.info('图片已清空！')
    },
    copyLink () {
      if (!this.generatedLink) return
      if (navigator.clipboard) {
        navigator.clipboard.writeText(this.generatedLink)
          .then(() => this.$message.success('链接已复制到剪贴板！'))
          .catch(() => this.fallbackCopyTextToClipboard())
      } else {
        this.fallbackCopyTextToClipboard()
      }
    },
    fallbackCopyTextToClipboard () {
      const textArea = document.createElement('textarea')
      textArea.value = this.generatedLink
      textArea.style.position = 'fixed'
      textArea.style.top = '0'
      textArea.style.left = '0'
      document.body.appendChild(textArea)
      textArea.select()
      try {
        const ok = document.execCommand('copy')
        this.$message.success(ok ? '链接已复制！' : '复制失败，请手动复制')
      } catch (err) {
        this.$message.error('复制失败，请手动复制链接！')
      } finally {
        document.body.removeChild(textArea)
      }
    },
    resetAll () {
      // 重置表单字段
      this.form = {
        userId: '',
        name: '',
        companionCount: 1,
        date: '2026/02/11'
      }
      // 重置图片和二维码相关数据
      this.previewUrl = ''
      this.generatedQrcodeUrl = ''
      this.qrcodeResult = ''
      this.originalFileBase64 = ''
      this.generatedQrcodeBase64 = ''
      // 重置生成的链接
      this.generatedLink = ''
      this.generating = false
      // 释放图片URL
      if (this.previewUrl) {
        URL.revokeObjectURL(this.previewUrl)
      }
      this.$message.success('已重置所有内容！')
    },
    backToReport () {
      this.$confirm('确定要返回报表页吗？未保存的内容将不会丢失', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        // 跳转到报表页（请根据实际路由路径修改）
        if (this.$router) {
          this.$router.push('/report') // 假设报表页路由为 /report
        } else {
          window.location.href = `${window.location.origin}/report.html`
        }
        this.$message.success('已返回报表页！')
      }).catch(() => {
        this.$message.info('已取消返回操作')
      })
    },

    // ========== 核心改造：接口调用替换localStorage ==========
    /**
     * 封装行程信息提交接口
     * @param {Object} tripData 行程数据
     * @returns {Promise} 请求Promise
     */
    async submitTripData (tripData) {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/trip/save`, // 请替换为你的实际接口路径
          tripData,
          {
            headers: {
              'Content-Type': 'application/json'
              // 如需token认证，添加token（根据你的项目认证方式调整）
              // 'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            timeout: 10000 // 10秒超时
          }
        )
        return response.data
      } catch (error) {
        // 统一的异常处理
        if (error.response) {
          // 服务器返回错误（4xx/5xx）
          throw new Error(`接口请求失败：${error.response.status} - ${error.response.data?.message || '未知错误'}`)
        } else if (error.request) {
          // 请求已发送但无响应
          throw new Error('网络异常，请检查网络连接后重试')
        } else {
          // 请求配置错误
          throw new Error(`请求配置错误：${error.message}`)
        }
      }
    },

    /**
     * 生成链接（替换localStorage为接口调用）
     */
    async generateLink () {
      // 基础校验
      if (!this.form.name || !this.form.date) {
        this.$message.warning('请完善姓名和日期信息！')
        return
      }
      if (!this.generatedQrcodeBase64) {
        this.$message.warning('请先上传包含二维码的图片并完成解析！')
        return
      }

      this.generating = true

      try {
        // 组装提交给接口的参数
        const tripData = {
          name: this.form.name,
          companionCount: this.form.companionCount,
          date: this.form.date,
          qrcodeContent: this.qrcodeResult,
          generatedQrcodeBase64: this.generatedQrcodeBase64,
          createTime: new Date().toLocaleString()
        }

        // 调用接口提交数据
        const response = await this.submitTripData(tripData)

        // 接口返回成功处理
        if (response.code === 200 && response.data?.tripId) {
          // 从接口返回结果中获取唯一ID（替代原本地生成的userId）
          const tripId = response.data.tripId
          this.form.userId = tripId // 保留隐藏的userId字段兼容原有逻辑

          // 生成最终链接（使用接口返回的tripId）
          const domain = window.location.origin
          this.generatedLink = `${domain}/#/vip-loungePage?tripId=${tripId}`

          this.$message.success('链接生成成功！可点击复制使用')
        } else {
          throw new Error(response.message || '接口返回数据异常')
        }
      } catch (err) {
        // 捕获所有异常并提示
        this.$message.error(err.message || '链接生成失败，请重试')
      } finally {
        // 无论成功失败，都关闭loading
        this.generating = false
      }
    }
  },
  beforeDestroy () {
    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl)
  }
}
</script>

<style scoped>
.trip-generator-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.page-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin-bottom: 24px;
}
.form-left-align {
  text-align: left;
}
.form-left-align .el-form-item__content {
  margin-left: 80px !important;
  display: inline-block;
  width: calc(100% - 80px);
}
.form-left-align .el-input,
.form-left-align .el-input-number,
.form-left-align .el-date-picker {
  width: 100%;
  max-width: 400px;
}
.upload-area {
  border: 2px dashed #409eff;
  border-radius: 8px;
  padding: 32px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
  text-align: left;
  margin: 0;
  width: 100%;
  max-width: 400px;
}
.upload-area:hover {
  border-color: #66b1ff;
  color: #409eff;
}
.upload-area .el-icon-folder-add {
  font-size: 32px;
  margin-bottom: 12px;
  display: block;
}
.sub-text {
  font-size: 12px;
  color: #999;
  margin: 4px 0;
}
.preview-container {
  margin-top: 16px;
  text-align: left;
  margin-left: 0;
  max-width: 400px;
  position: relative;
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}
.preview-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.preview-title {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}
.preview-img {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  display: block;
  border: 1px solid #eee;
}
.clear-img-btn {
  position: absolute;
  top: 0;
  right: 0;
  color: #999;
}
.clear-img-btn:hover {
  color: #d93025;
}
.qrcode-result-input {
  width: 100%;
  max-width: 400px;
  resize: none;
}
.link-input {
  margin-bottom: 8px;
  width: 100%;
  max-width: 400px;
}
.copy-link-btn {
  margin-top: 5px;
}
/* 按钮样式优化 */
.el-form-item .el-button {
  border-radius: 4px;
  padding: 8px 16px;
}
</style>
