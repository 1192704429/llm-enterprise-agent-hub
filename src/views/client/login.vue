<template>
  <div class="client-login-page">
    <!-- 左侧：Agent 场景展示区 -->
    <section class="showcase-panel">
      <div class="showcase-inner">
        <div class="brand-badge">
          <i class="el-icon-office-building" />
          <span>员工端 · 智能办公 Agent</span>
        </div>
        <h1 class="showcase-title">企业办公，有问必答</h1>
        <p class="showcase-desc">登录后即可与 AI 办公助手对话，查询公告、制度、请假与日程</p>

        <div class="chat-demo">
          <div class="demo-bubble user">
            <span>最近有哪些公司公告？</span>
          </div>
          <div class="demo-bubble ai">
            <span>为您检索到 3 条有效 OA 公告：系统维护通知、季度总结大会、员工健康体检安排…</span>
          </div>
          <div class="demo-bubble user short">
            <span>帮我看下本周日程</span>
          </div>
        </div>

        <ul class="feature-list">
          <li><i class="el-icon-check" /> 基于企业知识库精准检索</li>
          <li><i class="el-icon-check" /> 多轮对话，理解业务上下文</li>
          <li><i class="el-icon-check" /> 公告、请假、审批、日程一站查询</li>
        </ul>
      </div>
      <div class="showcase-bg">
        <div class="bg-circle c1" />
        <div class="bg-circle c2" />
        <div class="bg-circle c3" />
      </div>
    </section>

    <!-- 右侧：登录表单区 -->
    <section class="form-panel">
      <div class="form-inner">
        <div class="form-header">
          <div class="form-icon">
            <i class="el-icon-user" />
          </div>
          <h2>欢迎回来</h2>
          <p>登录您的账号，开启智能办公之旅</p>
        </div>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          class="login-form"
          @keyup.enter.native="handleLogin"
        >
          <el-form-item prop="username">
            <label class="field-label">用户名</label>
            <el-input
              v-model="form.username"
              prefix-icon="el-icon-user"
              placeholder="请输入用户名"
              size="medium"
            />
          </el-form-item>
          <el-form-item prop="password">
            <label class="field-label">密码</label>
            <el-input
              v-model="form.password"
              prefix-icon="el-icon-lock"
              type="password"
              placeholder="请输入密码"
              show-password
              size="medium"
            />
          </el-form-item>

          <el-button
            type="primary"
            class="submit-btn"
            :loading="loading"
            @click="handleLogin"
          >
            登录并开始对话
          </el-button>
        </el-form>

        <div class="form-links">
          <p class="account-tip">
            <i class="el-icon-info" /> 员工账号由管理员在后台创建
          </p>
          <a href="javascript:void(0)" @click="$router.push('/user/home')">
            <i class="el-icon-right" /> 暂不登录，先去体验
          </a>
          <a href="javascript:void(0)" class="admin-link" @click="$router.push('/login')">
            <i class="el-icon-setting" /> 管理员入口
          </a>
        </div>

        <p class="foot-text">© {{ currentYear }} {{ systemTitle }}</p>
      </div>
    </section>
  </div>
</template>

<script>
import settings from '@/settings'

export default {
  name: 'ClientLogin',
  data() {
    return {
      systemTitle: settings.title,
      currentYear: new Date().getFullYear(),
      loading: false,
      form: {
        username: '',
        password: ''
      },
      rules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      }
    }
  },
  methods: {
    handleLogin() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.loading = true
        try {
          await this.$store.dispatch('clientUser/login', this.form)
          const redirect = this.$route.query.redirect || '/user/home'
          this.$router.push(redirect)
        } finally {
          this.loading = false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.client-login-page {
  min-height: 100vh;
  display: flex;
}

/* ========== 左侧展示区 ========== */
.showcase-panel {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(160deg, #e6fffb 0%, #f0f7ff 40%, #d4e8f5 100%);
  padding: 48px 40px;
}

.showcase-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
}

.c1 {
  width: 360px;
  height: 360px;
  top: -100px;
  right: -80px;
  background: rgba(19, 194, 194, 0.12);
}

.c2 {
  width: 240px;
  height: 240px;
  bottom: -60px;
  left: -40px;
  background: rgba(0, 58, 140, 0.08);
}

.c3 {
  width: 120px;
  height: 120px;
  top: 40%;
  left: 20%;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(19, 194, 194, 0.2);
}

.showcase-inner {
  position: relative;
  z-index: 1;
  max-width: 460px;
}

.brand-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(19, 194, 194, 0.3);
  color: #08979c;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 24px;
  backdrop-filter: blur(8px);

  i {
    font-size: 16px;
  }
}

.showcase-title {
  margin: 0 0 12px;
  font-size: 36px;
  font-weight: 800;
  color: $menuBg;
  line-height: 1.25;
  letter-spacing: -0.5px;
}

.showcase-desc {
  margin: 0 0 32px;
  font-size: 15px;
  color: #0050b3;
  opacity: 0.8;
  line-height: 1.6;
}

.chat-demo {
  margin-bottom: 32px;
}

.demo-bubble {
  max-width: 88%;
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 12px;
  animation: fadeUp 0.6s ease both;

  &.user {
    margin-left: auto;
    background: linear-gradient(135deg, $menuHover 0%, #36cfc9 100%);
    color: #fff;
    border-radius: 16px 16px 4px 16px;
    animation-delay: 0.1s;
  }

  &.ai {
    background: rgba(255, 255, 255, 0.85);
    color: $subMenuBg;
    border: 1px solid rgba(19, 194, 194, 0.2);
    border-radius: 16px 16px 16px 4px;
    animation-delay: 0.3s;
  }

  &.short {
    max-width: 100px;
    animation-delay: 0.5s;
  }
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feature-list {
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
    font-size: 14px;
    color: $subMenuBg;

    i {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: rgba(19, 194, 194, 0.15);
      color: #08979c;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      flex-shrink: 0;
    }
  }
}

/* ========== 右侧表单区 ========== */
.form-panel {
  width: 480px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-left: 1px solid #e8f0f8;
  box-shadow: -8px 0 32px rgba(0, 58, 140, 0.06);
  padding: 48px 40px;
}

.form-inner {
  width: 100%;
  max-width: 360px;
}

.form-header {
  text-align: center;
  margin-bottom: 36px;

  .form-icon {
    width: 56px;
    height: 56px;
    margin: 0 auto 16px;
    border-radius: 16px;
    background: linear-gradient(135deg, $menuHover 0%, #36cfc9 100%);
    color: #fff;
    font-size: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 20px rgba(19, 194, 194, 0.35);
  }

  h2 {
    margin: 0 0 6px;
    font-size: 26px;
    font-weight: 700;
    color: $menuBg;
  }

  p {
    margin: 0;
    font-size: 14px;
    color: #8cb3d9;
  }
}

.field-label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #0050b3;
}

.login-form {
  ::v-deep .el-form-item {
    margin-bottom: 20px;
  }

  ::v-deep .el-input__inner {
    height: 44px;
    line-height: 44px;
    border: 1px solid #e0edf7;
    border-radius: 12px;
    background: #fafcff;
    color: $subMenuBg;
    transition: all 0.2s ease;

    &::placeholder {
      color: #b0c9e0;
    }

    &:focus {
      border-color: $menuHover;
      background: #fff;
      box-shadow: 0 0 0 3px rgba(19, 194, 194, 0.15);
    }
  }

  ::v-deep .el-input__prefix {
    color: $menuHover;
  }
}

.submit-btn {
  width: 100%;
  height: 48px;
  margin-top: 8px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 1px;
  background: linear-gradient(135deg, $menuHover 0%, #36cfc9 100%);
  box-shadow: 0 8px 20px rgba(19, 194, 194, 0.35);

  &:hover,
  &:focus {
    background: linear-gradient(135deg, #36cfc9 0%, $menuHover 100%);
    box-shadow: 0 10px 24px rgba(19, 194, 194, 0.45);
  }
}

.form-links {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;

  .account-tip {
    margin: 0;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #8cb3d9;
  }

  a {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #0050b3;
    text-decoration: none;
    opacity: 0.8;
    transition: all 0.2s ease;

    &:hover {
      opacity: 1;
      color: $menuHover;
    }

    &.admin-link {
      color: #8cb3d9;
      font-size: 12px;
    }
  }
}

.foot-text {
  margin: 32px 0 0;
  text-align: center;
  font-size: 12px;
  color: #c0d4e8;
}

/* ========== 响应式 ========== */
@media (max-width: 960px) {
  .client-login-page {
    flex-direction: column;
  }

  .showcase-panel {
    padding: 36px 24px 28px;
    min-height: auto;
  }

  .showcase-inner {
    max-width: 100%;
    text-align: center;
  }

  .brand-badge {
    margin-left: auto;
    margin-right: auto;
  }

  .showcase-title {
    font-size: 28px;
  }

  .chat-demo {
    display: none;
  }

  .feature-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;

    li {
      margin-bottom: 0;
      font-size: 12px;
    }
  }

  .form-panel {
    width: 100%;
    flex: 1;
    border-left: none;
    border-top: 1px solid #e8f0f8;
    box-shadow: 0 -4px 20px rgba(0, 58, 140, 0.04);
    padding: 32px 24px 40px;
  }
}

@media (max-width: 480px) {
  .showcase-title {
    font-size: 24px;
  }

  .form-header h2 {
    font-size: 22px;
  }

  .feature-list {
    flex-direction: column;
    align-items: center;
  }
}
</style>
