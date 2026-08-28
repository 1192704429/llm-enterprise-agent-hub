<template>
  <header class="client-header">
    <div class="header-inner">
      <div class="brand" @click="goHome">
        <div class="logo-placeholder">
          <i class="el-icon-office-building" />
        </div>
        <span class="title">{{ clientHeaderTitle }}</span>
      </div>

      <el-menu
        mode="horizontal"
        :default-active="activeMenu"
        class="nav-menu desktop-nav"
        @select="handleMenuSelect"
      >
        <el-menu-item
          v-for="item in menuRoutes"
          :key="item.path"
          :index="item.path"
          class="nav-item"
        >
          {{ item.meta.navTitle || item.meta.title || item.name }}
        </el-menu-item>
      </el-menu>

      <div class="user-area">
        <button class="mobile-menu-btn" @click="mobileMenuOpen = !mobileMenuOpen">
          <i :class="mobileMenuOpen ? 'el-icon-close' : 'el-icon-s-operation'" />
        </button>

        <template v-if="isLoggedIn">
          <el-dropdown trigger="hover" @command="handleCommand">
            <div class="user-trigger">
              <img v-if="clientAvatar" :src="clientAvatar" alt="avatar" class="avatar-img">
              <div v-else class="avatar">{{ avatarText }}</div>
              <span class="username desktop-only">{{ clientName || '用户' }}</span>
              <i class="el-icon-arrow-down el-icon--right" />
            </div>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="/user/profile">个人中心</el-dropdown-item>
              <el-dropdown-item command="/user/profile?tab=password">修改密码</el-dropdown-item>
              <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
        <template v-else>
          <button class="entry-btn login-btn" @click="$router.push('/user/login')">登录</button>
        </template>
      </div>
    </div>

    <transition name="slide-down">
      <div v-if="mobileMenuOpen" class="mobile-nav">
        <button
          v-for="item in menuRoutes"
          :key="item.path"
          class="mobile-nav-item"
          :class="{ active: activeMenu === item.path }"
          @click="handleMobileNav(item.path)"
        >
          {{ item.meta.navTitle || item.meta.title || item.name }}
        </button>
      </div>
    </transition>
  </header>
</template>

<script>
import { clientAsyncRoutes } from '@/router'
import defaultSettings from '@/settings'

export default {
  name: 'ClientHeader',
  data() {
    return {
      mobileMenuOpen: false
    }
  },
  computed: {
    clientHeaderTitle() {
      return defaultSettings.clientTitle || defaultSettings.title
    },
    clientName() {
      return this.$store.getters.clientName
    },
    clientAvatar() {
      return this.$store.getters.clientAvatar
    },
    isLoggedIn() {
      return Boolean(this.$store.getters.clientToken)
    },
    activeMenu() {
      return this.$route.path
    },
    menuRoutes() {
      const staticUserRoot = clientAsyncRoutes.find(route => route.path === '/user')
      const optionsRoutes = this.$router.options.routes || []
      const runtimeUserRoot = optionsRoutes.find(route => route.path === '/user')
      const userRoot = staticUserRoot || runtimeUserRoot
      const children = (userRoot && userRoot.children) || []
      return children
        .map(route => ({
          ...route,
          path: route.path.startsWith('/user/') ? route.path : `/user/${route.path}`
        }))
        .filter(route => {
          const meta = route.meta || {}
          if (!meta.showInHeader) return false
          if (meta.requiresAuth && !this.isLoggedIn) return false
          return true
        })
    },
    avatarText() {
      if (!this.clientName) return 'U'
      return this.clientName.slice(0, 1).toUpperCase()
    }
  },
  watch: {
    $route() {
      this.mobileMenuOpen = false
    }
  },
  methods: {
    handleMenuSelect(path) {
      if (path !== this.$route.path) {
        this.$router.push(path)
      }
    },
    handleMobileNav(path) {
      this.mobileMenuOpen = false
      if (path !== this.$route.path) {
        this.$router.push(path)
      }
    },
    async handleCommand(command) {
      if (command === 'logout') {
        await this.$store.dispatch('clientUser/logout')
        this.$router.replace('/user/home')
        return
      }
      this.$router.push(command)
    },
    goHome() {
      this.$router.push('/user/home')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../client-theme.scss';

.client-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: linear-gradient(90deg, $client-header-bg-start 0%, $client-header-bg-end 100%);
  box-shadow: 0 2px 12px $client-header-shadow;
  border-bottom: 1px solid $client-color-border;
}

.header-inner {
  max-width: 1200px;
  height: 60px;
  margin: 0 auto;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  flex-shrink: 0;
}

.logo-placeholder {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, $client-color-primary 0%, $subMenuBg 100%);
  color: #fff;
  font-size: 18px;
  box-shadow: 0 4px 12px rgba(0, 58, 140, 0.2);
}

.title {
  font-size: 17px;
  font-weight: 700;
  color: $client-header-title;
  letter-spacing: 0.5px;
}

.nav-menu.el-menu--horizontal {
  border-bottom: none;
  background-color: transparent;
  flex: 1;
  justify-content: center;
}

.nav-menu ::v-deep .el-menu-item {
  position: relative;
  height: 60px;
  line-height: 60px;
  color: $client-header-menu;
  background-color: transparent;
  border-bottom: none !important;
  transition: color 0.25s ease;
}

.nav-menu ::v-deep .el-menu-item:hover {
  color: $client-header-menu-hover !important;
}

.nav-menu ::v-deep .el-menu-item::after {
  content: '';
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: 8px;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(90deg, $client-header-menu-line-start, $client-header-menu-line-end);
  transform: scaleX(0);
  transition: transform 0.25s ease;
}

.nav-menu ::v-deep .el-menu-item:hover::after,
.nav-menu ::v-deep .el-menu-item.is-active::after {
  transform: scaleX(1);
}

.nav-menu ::v-deep .el-menu-item.is-active {
  color: $client-header-menu-active !important;
  font-weight: 600;
}

.user-area {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 20px;
  transition: background-color 0.25s ease;
}

.user-trigger:hover {
  background-color: rgba(0, 58, 140, 0.06);
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, $client-color-primary 0%, $client-color-primary-light 100%);
  color: #fff;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 6px rgba(0, 58, 140, 0.15);
}

.username {
  color: $client-color-text-secondary;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
}

.entry-btn {
  border: none;
  outline: none;
  border-radius: 20px;
  padding: 8px 20px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.25s ease;
}

.login-btn {
  background: $client-color-primary;
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 58, 140, 0.25);
}

.login-btn:hover {
  background: $client-color-primary-light;
  transform: translateY(-1px);
}

.mobile-menu-btn {
  display: none;
  width: 36px;
  height: 36px;
  border: 1px solid $client-color-border;
  border-radius: 10px;
  background: #fff;
  color: $client-color-primary;
  cursor: pointer;
  font-size: 18px;
}

.mobile-nav {
  display: none;
  padding: 8px 16px 12px;
  border-top: 1px solid $client-color-border;
  background: #fff;
}

.mobile-nav-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 12px 14px;
  margin-bottom: 4px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: $client-header-menu;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s ease;

  &.active,
  &:hover {
    background: rgba(0, 58, 140, 0.06);
    color: $client-color-primary;
  }
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.25s ease;
}

.slide-down-enter,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 768px) {
  .desktop-nav {
    display: none !important;
  }

  .mobile-menu-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .mobile-nav {
    display: block;
  }

  .desktop-only {
    display: none;
  }

  .title {
    font-size: 15px;
    max-width: 140px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
