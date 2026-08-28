<template>
  <div class="user-info-page">
    <header class="page-head">
      <h1>个人中心</h1>
      <p>管理账户信息与安全设置</p>
    </header>

    <section class="user-info-card">
      <el-tabs v-model="activeTab" class="profile-tabs">
        <el-tab-pane label="基本信息" name="profile">
          <transition name="tab-fade" mode="out-in">
            <div v-if="activeTab === 'profile'" class="profile-layout">
              <div class="avatar-area">
                <div class="avatar-box">
                  <img :src="avatarPreview" alt="avatar" class="avatar-img">
                  <div class="avatar-mask">
                    <div class="avatar-upload-inner">
                      <div class="avatar-mask-text">更换头像</div>
                      <img-upload
                        v-if="!isMobile"
                        :key="avatarUploadKey"
                        v-model="avatarUploadValue"
                        :limit="1"
                        :file-size="5"
                        :is-show-tip="false"
                        action="/upload/file/url"
                        @input="handleAvatarUploaded"
                      />
                    </div>
                  </div>
                </div>
                <p class="avatar-tip">{{ isMobile ? '点击下方按钮更换头像' : '支持 JPG / PNG，建议 1:1 比例' }}</p>
                <div v-if="isMobile" class="mobile-avatar-upload">
                  <img-upload
                    :key="'mobile-' + avatarUploadKey"
                    v-model="avatarUploadValue"
                    :limit="1"
                    :file-size="5"
                    :is-show-tip="false"
                    action="/upload/file/url"
                    @input="handleAvatarUploaded"
                  />
                </div>
              </div>

              <el-form
                ref="profileFormRef"
                :model="profileForm"
                :rules="profileRules"
                :label-position="isMobile ? 'top' : 'right'"
                :label-width="isMobile ? 'auto' : '95px'"
                class="profile-form"
              >
                <el-form-item label="用户ID">
                  <el-input :value="clientId" disabled />
                </el-form-item>
                <el-form-item label="用户名" prop="username">
                  <el-input v-model="profileForm.username" placeholder="请输入用户名" />
                </el-form-item>
                <el-form-item label="昵称" prop="name">
                  <el-input v-model="profileForm.name" placeholder="请输入昵称" />
                </el-form-item>
                <el-form-item label="手机号" prop="phone">
                  <el-input v-model="profileForm.phone" placeholder="请输入手机号" maxlength="11" />
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                  <el-input v-model="profileForm.email" placeholder="请输入邮箱" />
                </el-form-item>
                <el-form-item v-if="profileForm.lastLoginTime" label="最近登录">
                  <el-input :value="profileForm.lastLoginTime" disabled />
                </el-form-item>
                <el-form-item>
                  <el-button class="pink-btn" :loading="profileLoading" @click="handleUpdateProfile">保存信息</el-button>
                </el-form-item>
              </el-form>
            </div>
          </transition>
        </el-tab-pane>

        <el-tab-pane label="修改密码" name="password">
          <transition name="tab-fade" mode="out-in">
            <div v-if="activeTab === 'password'" class="profile-layout password-layout">
              <div class="avatar-area avatar-area--spacer desktop-only" aria-hidden="true" />
              <el-form
                ref="passwordFormRef"
                :model="passwordForm"
                :rules="passwordRules"
                :label-position="isMobile ? 'top' : 'right'"
                :label-width="isMobile ? 'auto' : '90px'"
                class="password-form"
              >
                <el-form-item label="原密码" prop="oldPassword">
                  <el-input v-model="passwordForm.oldPassword" type="password" show-password prefix-icon="el-icon-lock" placeholder="请输入原密码" />
                </el-form-item>
                <el-form-item label="新密码" prop="newPassword">
                  <el-input v-model="passwordForm.newPassword" type="password" show-password prefix-icon="el-icon-lock" placeholder="请输入新密码" />
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                  <el-input v-model="passwordForm.confirmPassword" type="password" show-password prefix-icon="el-icon-lock" placeholder="请确认新密码" />
                </el-form-item>
                <el-form-item>
                  <el-button class="pink-btn subtle" :loading="passwordLoading" @click="handleUpdatePassword">修改密码</el-button>
                </el-form-item>
              </el-form>
            </div>
          </transition>
        </el-tab-pane>
      </el-tabs>
    </section>
  </div>
</template>

<script>
import ImgUpload from '@/components/ImgUpload'

export default {
  name: 'ClientProfile',
  components: {
    ImgUpload
  },
  data() {
    const validateConfirm = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请确认新密码'))
        return
      }
      if (value.length < 6) {
        callback(new Error('密码至少 6 位'))
        return
      }
      if (value !== this.passwordForm.newPassword) {
        callback(new Error('两次输入的新密码不一致'))
        return
      }
      callback()
    }
    return {
      isMobile: false,
      activeTab: 'profile',
      profileLoading: false,
      passwordLoading: false,
      profileForm: {
        username: '',
        name: '',
        avatar: '',
        phone: '',
        email: '',
        lastLoginTime: ''
      },
      avatarUploadValue: '',
      avatarUploadKey: 0,
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      profileRules: {
        name: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
        phone: [{ pattern: /^$|^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }],
        email: [{ type: 'email', message: '邮箱格式不正确', trigger: 'blur' }]
      },
      passwordRules: {
        oldPassword: [
          { required: true, message: '请输入旧密码', trigger: 'blur' },
          { min: 6, message: '密码至少 6 位', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, message: '密码至少 6 位', trigger: 'blur' }
        ],
        confirmPassword: [{ validator: validateConfirm, trigger: 'blur' }]
      }
    }
  },
  computed: {
    clientId() {
      return this.$store.getters.clientId
    },
    avatarPreview() {
      return this.profileForm.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
    }
  },
  created() {
    if (this.$route.query.tab === 'password') {
      this.activeTab = 'password'
    }
    this.loadInfo()
  },
  mounted() {
    this.checkMobile()
    window.addEventListener('resize', this.checkMobile)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.checkMobile)
  },
  methods: {
    checkMobile() {
      this.isMobile = window.innerWidth <= 768
    },
    async loadInfo() {
      const data = await this.$store.dispatch('clientUser/getInfo')
      this.profileForm.username = data.username || ''
      this.profileForm.name = data.name || ''
      this.profileForm.avatar = data.avatar || ''
      this.profileForm.phone = data.phone || ''
      this.profileForm.email = data.email || ''
      this.profileForm.lastLoginTime = data.lastLoginTime || ''
      this.avatarUploadValue = ''
      this.avatarUploadKey += 1
    },
    handleAvatarUploaded(val) {
      if (!val) return
      const list = String(val).split(',').filter(Boolean)
      const latest = list[list.length - 1]
      if (latest) {
        this.profileForm.avatar = latest
        this.$message.success('头像已上传，请点击“保存信息”完成更新')
      }
      this.avatarUploadValue = ''
      this.avatarUploadKey += 1
    },
    handleUpdateProfile() {
      this.$refs.profileFormRef.validate(async valid => {
        if (!valid) return
        this.profileLoading = true
        try {
          await this.$store.dispatch('clientUser/updateInfo', this.profileForm)
          this.$message.success('基本信息更新成功')
          await this.loadInfo()
        } finally {
          this.profileLoading = false
        }
      })
    },
    handleUpdatePassword() {
      this.$refs.passwordFormRef.validate(async valid => {
        if (!valid) return
        this.passwordLoading = true
        try {
          await this.$store.dispatch('clientUser/updatePassword', this.passwordForm)
          this.$message.success('密码修改成功，请重新登录')
          await this.$store.dispatch('clientUser/logout')
          this.$router.push('/user/login')
        } finally {
          this.passwordLoading = false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../client-theme.scss";

.user-info-page {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 28px 32px 48px;
  min-height: calc(100vh - 84px);
  box-sizing: border-box;
}

.page-head {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid $client-color-border;

  h1 {
    margin: 0;
    font-size: 22px;
    font-weight: 600;
    color: $client-profile-title;
    line-height: 1.3;
  }

  p {
    margin: 6px 0 0;
    font-size: 14px;
    color: #909399;
    line-height: 1.5;
  }
}

.user-info-card {
  width: 100%;
  border-radius: 8px;
  border: 1px solid $client-profile-card-border;
  background: $client-profile-card-bg;
  box-shadow: 0 4px 16px rgba(0, 58, 140, 0.06);
  padding: 8px 24px 24px;
  box-sizing: border-box;
}

.profile-layout {
  display: flex;
  gap: 40px;
  align-items: flex-start;
  padding: 16px 0 8px;
  width: 100%;
}

.avatar-area {
  flex-shrink: 0;
  width: 220px;
  text-align: center;
}

.avatar-box {
  width: 160px;
  height: 160px;
  margin: 0 auto;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  border: 1px solid $client-color-border;
  box-shadow: 0 4px 12px rgba(0, 58, 140, 0.08);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 58, 140, 0.62);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.avatar-box:hover .avatar-mask {
  opacity: 1;
}

.avatar-tip {
  margin-top: 10px;
  color: #909399;
  font-size: 12px;
  line-height: 1.5;
}

.avatar-upload-inner {
  width: 100%;
  height: 100%;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.avatar-mask-text {
  color: #fff;
  font-size: 14px;
  margin-bottom: 10px;
}

.profile-form,
.password-form {
  flex: 1;
  min-width: 0;
  max-width: none;
}

.avatar-area--spacer {
  visibility: hidden;
  pointer-events: none;
}

::v-deep .avatar-upload-inner .component-upload-image .el-upload--picture-card {
  width: 66px;
  height: 66px;
  line-height: 66px;
  border-radius: 8px;
  border: 1px dashed rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.22);
  color: #fff;
}

::v-deep .avatar-upload-inner .component-upload-image .el-upload-list {
  display: none;
}

.pink-btn {
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 10px 24px;
  background: $client-color-primary;
  box-shadow: none;
  transition: background 0.2s ease;
}

.pink-btn:hover {
  transform: none;
  background: lighten($client-color-primary, 8%);
  box-shadow: none;
}

.pink-btn.subtle {
  background: $client-color-primary;
}

.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: opacity 0.2s ease;
}

.tab-fade-enter,
.tab-fade-leave-to {
  opacity: 0;
}

::v-deep .profile-tabs .el-tabs__header {
  margin-bottom: 0;
}

::v-deep .profile-tabs .el-tabs__nav-wrap::after {
  height: 1px;
  background-color: $client-color-border;
}

::v-deep .profile-tabs .el-tabs__item {
  height: 48px;
  line-height: 48px;
  font-size: 14px;
  color: #606266;
}

::v-deep .profile-tabs .el-tabs__item.is-active {
  color: $client-profile-tab-active;
  font-weight: 600;
}

::v-deep .profile-tabs .el-tabs__active-bar {
  background-color: $client-color-primary;
  height: 2px;
}

::v-deep .el-input__inner {
  border-radius: 6px;
  border-color: $client-profile-input-border;
  transition: border-color 0.2s ease;
}

::v-deep .el-input__inner:focus {
  border-color: $client-profile-input-focus;
  box-shadow: 0 0 0 2px rgba(0, 58, 140, 0.08);
}

::v-deep .el-form-item {
  margin-bottom: 20px;
}

::v-deep .el-form-item__label {
  color: $client-profile-label;
}

::v-deep .el-form-item__error {
  color: $client-profile-error;
}

.mobile-avatar-upload {
  margin-top: 12px;
  display: flex;
  justify-content: center;
}

::v-deep .mobile-avatar-upload .component-upload-image .el-upload--picture-card {
  width: 80px;
  height: 80px;
  line-height: 80px;
  border-radius: 8px;
  border-color: $client-color-border;
  background: #f0f7ff;
  color: $client-color-primary;
}

@media (max-width: 768px) {
  .user-info-page {
    padding: 16px 16px 32px;
    min-height: auto;
  }

  .page-head {
    margin-bottom: 16px;
    padding-bottom: 16px;

    h1 {
      font-size: 20px;
    }
  }

  .user-info-card {
    padding: 4px 14px 16px;
  }

  .profile-layout {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    padding: 8px 0;
  }

  .avatar-area {
    width: 100%;
  }

  .avatar-box {
    width: 112px;
    height: 112px;
    border-radius: 50%;
  }

  .avatar-mask {
    display: none;
  }

  .avatar-area--spacer {
    display: none;
  }

  .password-layout {
    flex-direction: column;
  }

  .pink-btn {
    width: 100%;
    padding: 12px 20px;
  }

  ::v-deep .profile-tabs .el-tabs__item {
    font-size: 13px;
    padding: 0 12px;
    height: 42px;
    line-height: 42px;
  }

  ::v-deep .el-form-item {
    margin-bottom: 16px;
  }

  ::v-deep .el-form-item__label {
    padding-bottom: 4px;
    line-height: 1.4;
  }

  ::v-deep .el-input__inner {
    height: 40px;
  }
}
</style>
