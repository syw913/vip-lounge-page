<template>
  <div class="vip-page">
    <!-- 顶部服务提供方 -->
    <div class="header-provider">
      <div class="provider-left">
        <img src="./../assets/logo.jpg" alt="悦途出行" class="logo" />
        <div class="provider-left-text">{{ langText.providerLeftText }}</div>
      </div>
      <div class="lang-switch">
        <span class="lang-item" :class="{ active: activeLang === 'ENG' }" @click="switchLang('ENG')">
          ENG
        </span>
        <span class="lang-item" :class="{ active: activeLang === 'CN' }" @click="switchLang('CN')">
          中文
        </span>
      </div>
    </div>

    <!-- 多语言标题 -->
    <h1 class="page-title">{{ langText.pageTitle }}</h1>
    <p class="member-count">{{ langText.memberCount }}</p>

    <!-- 二维码展示区域（仅保留闪一下动画） -->
    <div class="qrcode-container">
      <div v-if="qrcodeUrl" class="qrcode-box">
        <!-- 核心：通过key强制刷新 + 闪烁动画 -->
        <img
          :src="qrcodeUrl"
          :key="refreshTimestamp"
          alt="贵宾室二维码"
          class="qrcode-img"
          :class="{ 'qr-flash': isRefreshing }"
        />
      </div>
      <div v-else class="loading-box">
        <span>{{ langText.loadingText }}</span>
      </div>
      <div class="lounge-key">
        <img src="./../assets/logo1.jpg" alt="Lounge Key" />
      </div>
    </div>

    <!-- 二维码倒计时刷新提示（移除按钮loading/动画） -->
    <div class="qrcode-refresh">
      <span>{{ langText.qrcodeRefreshTip }} {{ countdown }} {{ langText.secondText }}</span>
      <el-button
        size="mini"
        type="primary"
        plain
        @click="manualRefreshQrcode"
        style="
            background-color: #333 !important;
            color: #fff !important;
            border-color: #333 !important;
            border-radius: 20px !important;
            padding: 4px 12px !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
        "
        >
            {{ langText.refreshBtn }}
            <i class="el-icon-refresh" style="margin-left: 4px !important; margin-right: 0 !important;"></i>
        </el-button>
    </div>

    <div class="info-section">
      <div class="info-item">
        <span class="label">{{ langText.nameLabel }}</span>
        <span class="value">{{ info.name }}</span>
      </div>
      <div class="info-item">
        <span class="label">{{ langText.referenceCodeLabel }}</span>
        <span class="value code" :class="{ 'code-flash': isRefreshing }">{{ info.referenceCode }}</span>
      </div>
      <div class="info-item">
        <span class="label">{{ langText.startDateLabel }}</span>
        <span class="value">{{ info.startDate }}</span>
      </div>
      <div class="info-item">
        <span class="label">{{ langText.endDateLabel }}</span>
        <span class="value">{{ info.endDate }}</span>
      </div>
    </div>

    <div class="notice-section">
      <h2 class="notice-title">{{ langText.noticeTitle }}</h2>
      <ul class="notice-list">
        <li>1. {{ langText.notice1 }}</li>
        <li class="red">2. {{ langText.notice2 }}</li>
        <li>3. {{ langText.notice3 }}</li>
        <li>4. {{ langText.notice4 }}</li>
        <li>5. {{ langText.notice5 }}</li>
        <li>6. {{ langText.notice6 }}</li>
      </ul>
    </div>

    <div class="footer-tip">{{ langText.footerTip }} — 101.201.78.140</div>
  </div>
</template>

<script>
import QRCode from 'qrcode'

export default {
  name: 'VipLoungePage',
  data () {
    return {
      activeLang: 'CN',
      info: {
        name: '',
        referenceCode: '',
        startDate: '',
        endDate: ''
      },
      qrcodeUrl: '',
      qrContent: '',
      countdown: 30,
      countdownTimer: null,
      isRefreshing: false, // 仅控制二维码/参考代码闪烁
      refreshTimestamp: Date.now(), // 强制刷新图片的key
      langMap: {
        CN: {
          providerLeftText: '为您提供',
          pageTitle: '机场贵宾室权益',
          memberCount: '1会员',
          loadingText: '加载中...',
          qrcodeRefreshTip: '二维码将在',
          secondText: '秒后刷新',
          refreshBtn: '刷新',
          nameLabel: '姓名',
          referenceCodeLabel: '参考代码',
          startDateLabel: '开始日期',
          endDateLabel: '截止日期',
          noticeTitle: '注意事项',
          notice1: '权益码未使用次日结束返回。',
          notice2: '二维码和二维码参考编号每30秒刷新一次。',
          notice3: '会员在机场贵宾厅权益上的姓名需与登机牌上的姓名一致。',
          notice4: '若您的服务权益支持携伴使用，所有随行宾客须与持卡人本人同步完成登记后方可进入贵宾室。特别提醒：贵宾室到访记录完成登记后，工作人员将无法进行修改或撤销操作，请登记时仔细核对信息，感谢您的理解与配合。',
          notice5: '将移动设备的屏幕亮度调整至最高以更好地扫描二维码。',
          notice6: '若二维码无法扫描，贵宾室员工可以手动输入上方16位二维码参考编号以进行验证。',
          footerTip: '不安全',
          refreshSuccess: '二维码已刷新',
          userNotFound: '未找到该用户信息'
        },
        ENG: {
          providerLeftText: 'Provided for you',
          pageTitle: 'Airport Lounge Benefits',
          memberCount: '1 Member',
          loadingText: 'Loading...',
          qrcodeRefreshTip: 'QR code will refresh in',
          secondText: 'seconds',
          refreshBtn: 'Refresh',
          nameLabel: 'Name',
          referenceCodeLabel: 'Reference Code',
          startDateLabel: 'Start Date',
          endDateLabel: 'Expiry Date',
          noticeTitle: 'Important Notes',
          notice1: 'Unused benefit codes will be returned the next day after expiration.',
          notice2: 'QR code and QR code reference number refresh every 30 seconds.',
          notice3: 'The name on the member\'s airport lounge benefit must match the name on the boarding pass.',
          notice4: 'If your service benefit supports accompanying guests, all accompanying guests must complete registration synchronously with the cardholder before entering the lounge. Important reminder: After the lounge visit record is registered, staff cannot modify or cancel it. Please check the information carefully during registration. Thank you for your understanding and cooperation.',
          notice5: 'Adjust the screen brightness of your mobile device to the highest for better QR code scanning.',
          notice6: 'If the QR code cannot be scanned, lounge staff can manually enter the 16-digit QR code reference number above for verification.',
          footerTip: 'Not secure',
          refreshSuccess: 'QR code refreshed successfully',
          userNotFound: 'User information not found'
        }
      }
    }
  },
  computed: {
    langText () {
      return this.langMap[this.activeLang]
    }
  },
  mounted () {
    const userId = this.$route.query.userId
    if (userId) {
      this.loadUserInfo(userId)
    } else {
      this.$message.warning(this.langText.userNotFound)
    }
    this.info.referenceCode = this.generateReferenceCode()
    this.startCountdown()
  },
  beforeDestroy () {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer)
    }
  },
  methods: {
    loadUserInfo (userId) {
      const userDataList = JSON.parse(localStorage.getItem('userTripData') || '[]')
      const targetUser = userDataList.find(item => item.userId === userId)
      if (targetUser) {
        this.info.name = targetUser.name || ''
        this.info.startDate = targetUser.date || ''
        this.info.endDate = targetUser.date || ''
        this.qrContent = targetUser.qrcodeContent || ''
        this.qrcodeUrl = targetUser.generatedQrcodeBase64 || ''
      } else {
        this.$message.error(this.langText.userNotFound)
      }
    },
    generateReferenceCode () {
      const prefix = '2880'
      let randomStr = ''
      for (let i = 0; i < 12; i++) {
        randomStr += Math.floor(Math.random() * 10)
      }
      return prefix + randomStr
    },
    switchLang (lang) {
      this.activeLang = lang
      document.title = this.langText.pageTitle
    },
    startCountdown () {
      if (this.countdownTimer) clearInterval(this.countdownTimer)
      this.countdown = 30
      this.countdownTimer = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) {
          this.autoRefreshQrcode()
        }
      }, 1000)
    },
    // 重新生成二维码（核心逻辑不变）
    regenerateQrcode () {
      return new Promise((resolve, reject) => {
        if (!this.qrContent) {
          reject(new Error('无二维码内容'))
          return
        }
        const qrOptions = {
          width: 200,
          margin: 1,
          color: { dark: '#000000', light: '#ffffff' }
        }
        QRCode.toDataURL(this.qrContent, qrOptions, (err, url) => {
          if (err) reject(err)
          else {
            this.qrcodeUrl = url
            resolve()
          }
        })
      })
    },
    // 自动刷新（仅保留二维码/参考代码闪烁，无按钮动画）
    async autoRefreshQrcode () {
      if (this.isRefreshing) return
      this.isRefreshing = true
      try {
        this.info.referenceCode = this.generateReferenceCode()
        if (this.qrContent) await this.regenerateQrcode()
        this.refreshTimestamp = Date.now() // 强制刷新图片
        this.startCountdown()
      } finally {
        // 仅闪300ms，快速结束
        setTimeout(() => { this.isRefreshing = false }, 300)
      }
    },
    // 手动刷新（移除按钮loading，仅保留核心逻辑）
    async manualRefreshQrcode () {
      if (this.isRefreshing) return
      this.isRefreshing = true
      try {
        this.info.referenceCode = this.generateReferenceCode()
        if (this.qrContent) await this.regenerateQrcode()
        this.refreshTimestamp = Date.now()
        this.$message.success(this.langText.refreshSuccess)
        this.startCountdown()
      } catch (err) {
        this.$message.error('刷新失败')
      } finally {
        setTimeout(() => { this.isRefreshing = false }, 300)
      }
    }
  }
}
</script>

<style scoped>
.vip-page {
  max-width: 400px;
  margin: 0 auto;
  padding: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.header-provider {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.provider-left {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 50%;
  flex-wrap: wrap;
}
.provider-left-text {
  font-size: 12px;
  color: #999;
  width: 100%;
  transform: translateY(-15px);
}
.logo { width: 100%; }
.lang-switch { display: flex; gap: 16px; }
.lang-item { font-size: 14px; color: #666; cursor: pointer; }
.lang-item.active { color: #333; font-weight: 500; }
.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin-bottom: 12px;
}
.member-count {
  text-align: center;
  color: #666;
  margin-bottom: 24px;
}
.qrcode-container { margin-bottom: 24px; }
.qrcode-box {
  width: 200px;
  height: 200px;
  border: 1px solid #eee;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}
/* 核心：二维码极简闪烁动画（仅透明度变化） */
.qrcode-img {
  max-width: 190px;
  max-height: 190px;
  border-radius: 4px;
}
.qr-flash {
  animation: qrFlash 0.3s ease-in-out;
}
@keyframes qrFlash {
  0% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 1; }
}
.loading-box {
  width: 200px;
  height: 200px;
  border: 1px solid #eee;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  margin: 0 auto 16px;
}
.lounge-key {
  text-align: center;
  width: 100%;
}
.lounge-key img { width: 200px; }
.qrcode-refresh {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 24px;
  color: #666;
}
.info-section { margin-bottom: 32px; }
.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 12px;
}
.label { font-size: 14px; color: #999; margin-bottom: 4px; }
.value { font-size: 16px; color: #333; }
.value.code {
  font-family: monospace;
  font-weight: 500;
}
/* 参考代码同步极简闪烁 */
.code-flash {
  animation: codeFlash 0.3s ease-in-out;
}
@keyframes codeFlash {
  0% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 1; }
}
.notice-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin-bottom: 16px;
}
.notice-list {
  padding-left: 20px;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
}
.notice-list .red { color: #d93025; }
.footer-tip {
  text-align: center;
  font-size: 12px;
  color: #999;
  margin-top: 32px;
}
</style>
