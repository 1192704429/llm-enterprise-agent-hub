<template>
  <div class="login-page">
    <div class="page-bg">
      <section class="bg-left">
        <div class="left-blob blob-1" />
        <div class="left-blob blob-2" />
        <div class="left-blob blob-3" />
        <div class="left-dots" />
        <div class="left-content">
          <div class="slogan-icon">
            <i class="el-icon-office-building" />
          </div>
          <p class="slogan-title">{{ systemTitle }}</p>
          <p class="slogan-desc">大语言模型驱动，助力企业智能办公与知识协同</p>
          <ul class="left-tags">
            <li><i class="el-icon-folder" /> 企业知识库</li>
            <li><i class="el-icon-cpu" /> 智能办公 Agent</li>
            <li><i class="el-icon-data-analysis" /> 办公数据分析</li>
          </ul>
        </div>
      </section>
      <section class="deco-side">
        <div class="deco-ring ring-lg" />
        <div class="deco-ring ring-md" />
        <div class="deco-ring ring-sm" />
        <div class="deco-content">
          <h2>企业办公，一站智能</h2>
          <p>整合企业知识库与大模型能力，覆盖公告、审批、请假与日程等场景</p>
          <ul class="feature-tags">
            <li>企业知识库</li>
            <li>Agent 助手</li>
            <li>数据洞察</li>
          </ul>
        </div>
      </section>
    </div>

    <div class="form-card">
      <p class="form-label">ADMIN LOGIN</p>
      <h1 class="form-title">管理员登录</h1>
      <p class="form-subtitle">登录管理后台，配置知识库与办公 Agent 能力</p>

      <el-form
        ref="loginForm"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @keyup.enter.native="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            prefix-icon="el-icon-user"
            placeholder="请输入用户名"
            size="medium"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            prefix-icon="el-icon-lock"
            type="password"
            placeholder="请输入密码"
            show-password
            size="medium"
          />
        </el-form-item>

        <el-form-item prop="captcha">
          <div class="captcha-row">
            <el-input
              v-model="loginForm.captcha"
              prefix-icon="el-icon-picture-outline"
              placeholder="验证码"
              size="medium"
              class="captcha-input"
            />
            <div class="captcha-box" @click="refreshCaptcha">
              <img v-if="captchaImageUrl" :src="captchaImageUrl" alt="验证码">
              <span v-else class="captcha-tip">点击获取</span>
            </div>
          </div>
        </el-form-item>

        <div class="form-extra">
          <el-checkbox v-model="rememberMe">记住我</el-checkbox>
          <a href="javascript:void(0)" class="link-muted">忘记密码？</a>
        </div>

        <el-button
          type="primary"
          class="submit-btn"
          :loading="loading"
          @click="handleLogin"
        >
          登 录
        </el-button>
      </el-form>

      <p class="foot-text">© {{ currentYear }} {{ systemTitle }} 管理系统</p>
    </div>
  </div>
</template>

<script>
import { getCaptcha } from '@/api/user'
import settings from '@/settings'

export default {
  name: 'Login',
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!value) callback(new Error('请输入用户名'))
      else callback()
    }
    const validatePassword = (rule, value, callback) => {
      if (!value) callback(new Error('请输入密码'))
      else if (value.length < 6) callback(new Error('密码长度不能少于6位'))
      else callback()
    }
    const validateCaptcha = (rule, value, callback) => {
      if (!value) callback(new Error('请输入验证码'))
      else callback()
    }
    return {
      systemTitle: settings.title,
      currentYear: new Date().getFullYear(),
      loginForm: {
        username: '',
        password: '',
        captcha: '',
        captchaKey: ''
      },
      loginRules: {
        username: [{ validator: validateUsername, trigger: 'blur' }],
        password: [{ validator: validatePassword, trigger: 'blur' }],
        captcha: [{ validator: validateCaptcha, trigger: 'blur' }]
      },
      rememberMe: false,
      loading: false,
      captchaImageUrl: ''
    }
  },
  mounted() {
    this.refreshCaptcha()
  },
  beforeDestroy() {
    if (this.captchaImageUrl) {
      window.URL.revokeObjectURL(this.captchaImageUrl)
    }
  },
  methods: {
    refreshCaptcha() {
      const cacheKey = Date.now().toString()
      this.loginForm.captchaKey = cacheKey
      if (this.captchaImageUrl) {
        window.URL.revokeObjectURL(this.captchaImageUrl)
      }
      getCaptcha(cacheKey).then(blob => {
        this.captchaImageUrl = window.URL.createObjectURL(blob)
      }).catch(error => {
        console.error('获取验证码失败:', error)
        this.$message.error('获取验证码失败，请重试')
      })
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (!valid) return false
        this.loading = true
        this.$store.dispatch('user/login', this.loginForm).then(() => {
          this.$router.push('/index')
        }).catch(() => {
          this.refreshCaptcha()
          this.loginForm.captcha = ''
        }).finally(() => {
          this.loading = false
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 24px;
}

.page-bg {
  position: absolute;
  inset: 0;
  display: flex;
  z-index: 0;
}

.bg-left {
  flex: 0 0 50%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(145deg, #f0f7ff 0%, #e6f0fa 45%, #d4e8f5 100%);
}

.left-blob {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.blob-1 {
  width: 280px;
  height: 280px;
  top: -80px;
  left: -60px;
  background: rgba(0, 58, 140, 0.12);
}

.blob-2 {
  width: 200px;
  height: 200px;
  bottom: 10%;
  left: 15%;
  background: rgba(19, 194, 194, 0.15);
}

.blob-3 {
  width: 120px;
  height: 120px;
  top: 35%;
  right: 12%;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(0, 58, 140, 0.1);
}

.left-dots {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(0, 58, 140, 0.06) 1px, transparent 1px);
  background-size: 28px 28px;
  pointer-events: none;
}

.left-content {
  position: relative;
  z-index: 1;
  padding: 0 48px;
  max-width: 320px;
}

.slogan-icon {
  width: 52px;
  height: 52px;
  margin-bottom: 20px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.7);
  color: $menuBg;
  font-size: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(0, 58, 140, 0.12);
}

.slogan-title {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 700;
  color: $menuBg;
  line-height: 1.3;
}

.slogan-desc {
  margin: 0 0 28px;
  font-size: 14px;
  color: #0050b3;
  opacity: 0.75;
}

.left-tags {
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    font-size: 14px;
    color: $subMenuBg;

    i {
      color: $menuHover;
      font-size: 16px;
    }
  }
}

.form-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 400px;
  padding: 36px 32px 32px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 16px 48px rgba(0, 58, 140, 0.14);
  border: 1px solid #d4e8f5;
}

.form-label {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 3px;
  color: $menuHover;
}

.form-title {
  margin: 0 0 6px;
  font-size: 28px;
  font-weight: 700;
  color: $menuBg;
}

.form-subtitle {
  margin: 0 0 36px;
  font-size: 13px;
  color: #0050b3;
  opacity: 0.65;
}

.login-form {
  ::v-deep .el-input__inner {
    height: 42px;
    line-height: 42px;
    border: 1px solid #d4e8f5;
    border-radius: 10px;
    background: #f0f7ff;
    color: $subMenuBg;
    transition: all 0.2s ease;

    &::placeholder {
      color: #8cb3d9;
    }

    &:focus {
      border-color: $menuBg;
      background: #fff;
      box-shadow: 0 0 0 3px rgba(0, 58, 140, 0.12);
    }
  }

  ::v-deep .el-input__prefix {
    color: $menuHover;
  }

  ::v-deep .el-checkbox__label {
    color: #0050b3;
    font-size: 13px;
  }

  ::v-deep .el-checkbox__input.is-checked .el-checkbox__inner {
    background-color: $menuBg;
    border-color: $menuBg;
  }
}

.captcha-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.captcha-input {
  flex: 1;
}

.captcha-box {
  width: 108px;
  height: 42px;
  flex-shrink: 0;
  border: 1px solid #d4e8f5;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  background: #f0f7ff;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .captcha-tip {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: #8cb3d9;
  }

  &:hover {
    border-color: $menuBg;
  }
}

.form-extra {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 8px 0 24px;

  .link-muted {
    font-size: 13px;
    color: #0050b3;
    text-decoration: none;
    opacity: 0.75;

    &:hover {
      color: $menuBg;
      opacity: 1;
    }
  }
}

.submit-btn {
  width: 100%;
  height: 46px;
  border: none;
  border-radius: 23px;
  font-size: 15px;
  letter-spacing: 2px;
  background: $menuBg;
  box-shadow: 0 8px 20px rgba(0, 58, 140, 0.28);

  &:hover,
  &:focus {
    background: $menuHover;
  }
}

/* 右侧装饰 */
.deco-side {
  flex: 0 0 50%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(145deg, $menuBg 0%, $subMenuBg 50%, darken($menuBg, 5%) 100%);
}

.deco-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(19, 194, 194, 0.25);
  pointer-events: none;
}

.ring-lg {
  width: 420px;
  height: 420px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.ring-md {
  width: 300px;
  height: 300px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.06);
}

.ring-sm {
  width: 160px;
  height: 160px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.1);
}

.deco-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 0 40px;

  h2 {
    margin: 0 0 12px;
    font-size: 32px;
    line-height: 1.35;
    font-weight: 700;
    color: #ffffff;
  }

  p {
    margin: 0 0 28px;
    font-size: 15px;
    color: rgba(255, 255, 255, 0.85);
  }
}

.feature-tags {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;

  li {
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 13px;
    color: #ffffff;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(19, 194, 194, 0.35);
  }
}

.foot-text {
  margin: 24px 0 0;
  text-align: center;
  font-size: 12px;
  color: #8cb3d9;
}

@media (max-width: 900px) {
  .page-bg {
    flex-direction: column;
  }

  .bg-left,
  .deco-side {
    flex: none;
    width: 100%;
  }

  .bg-left {
    min-height: 32vh;
  }

  .left-content {
    padding: 0 24px;
    text-align: center;
    max-width: none;
  }

  .slogan-icon {
    margin-left: auto;
    margin-right: auto;
  }

  .left-tags li {
    justify-content: center;
  }

  .deco-side {
    min-height: 280px;
  }
}
</style>
