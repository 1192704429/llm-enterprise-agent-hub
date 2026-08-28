<template>
  <div class="dashboard-container">
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card" @click="goTo('/knowledgeManagement/index')">
        <div class="stat-icon knowledge"><i class="el-icon-folder-opened" /></div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.knowledgeCount }}</div>
          <div class="stat-label">知识文档</div>
        </div>
        <i class="el-icon-arrow-right stat-arrow" />
      </div>
      <div class="stat-card" @click="goTo('/officeData/employee')">
        <div class="stat-icon employee"><i class="el-icon-s-custom" /></div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.employeeCount }}</div>
          <div class="stat-label">员工总数</div>
          <div class="stat-sub">正常 {{ stats.employeeActiveCount }} 人</div>
        </div>
        <i class="el-icon-arrow-right stat-arrow" />
      </div>
      <div class="stat-card" @click="goTo('/qaRecord/index')">
        <div class="stat-icon qa"><i class="el-icon-chat-dot-round" /></div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.qaCount }}</div>
          <div class="stat-label">对话记录</div>
        </div>
        <i class="el-icon-arrow-right stat-arrow" />
      </div>
      <div v-if="isAdmin" class="stat-card" @click="goTo('/announcementManagement/index')">
        <div class="stat-icon announcement"><i class="el-icon-bell" /></div>
        <div class="stat-info">
          <div class="stat-value">{{ announcementStats.published }}</div>
          <div class="stat-label">已发布公告</div>
          <div class="stat-sub">草稿 {{ announcementStats.draft }} 条</div>
        </div>
        <i class="el-icon-arrow-right stat-arrow" />
      </div>
    </div>

    <div class="content-grid">
      <!-- 快捷入口 -->
      <div class="panel quick-panel">
        <div class="panel-header">
          <h3><i class="el-icon-s-grid" /> 快捷入口</h3>
        </div>
        <div class="quick-links">
          <div
            v-for="item in quickLinks"
            :key="item.path"
            class="quick-item"
            @click="goTo(item.path)"
          >
            <div class="quick-icon" :style="{ background: item.color }">
              <i :class="item.icon" />
            </div>
            <span>{{ item.title }}</span>
          </div>
        </div>
      </div>

      <!-- 最近公告 -->
      <div v-if="isAdmin" class="panel announcement-panel">
        <div class="panel-header">
          <h3><i class="el-icon-bell" /> 最近公告</h3>
          <el-button type="text" @click="goTo('/announcementManagement/index')">管理全部</el-button>
        </div>
        <div v-loading="announcementLoading" class="announcement-list">
          <div
            v-for="item in recentAnnouncements"
            :key="item.id"
            class="announcement-item"
          >
            <div class="announcement-main">
              <span class="announcement-title">{{ item.title }}</span>
              <el-tag
                size="mini"
                :type="item.status === 1 ? 'success' : item.status === 0 ? 'info' : 'warning'"
              >
                {{ statusLabel(item.status) }}
              </el-tag>
            </div>
            <div class="announcement-meta">
              {{ item.publishTime || item.updateTime || item.createTime }}
            </div>
          </div>
          <div v-if="!announcementLoading && !recentAnnouncements.length" class="empty-tip">
            <i class="el-icon-document" />
            <p>暂无公告，<a href="javascript:void(0)" @click="goTo('/announcementManagement/index')">去发布</a></p>
          </div>
        </div>
      </div>
    </div>

    <!-- 热门问题 & 资料命中 -->
    <div class="rank-grid">
      <div class="panel rank-panel">
        <div class="panel-header">
          <h3><i class="el-icon-chat-dot-round" /> 热门咨询 Top5</h3>
          <el-button type="text" @click="goTo('/statistics/index')">更多统计</el-button>
        </div>
        <div class="rank-list">
          <div
            v-for="(item, index) in topQuestions"
            :key="'q-' + index"
            class="rank-item"
          >
            <span class="rank-badge" :class="'rank-' + (index + 1)">{{ index + 1 }}</span>
            <span class="rank-name" :title="item.name">{{ item.name }}</span>
            <span class="rank-count">{{ item.value }} 次</span>
          </div>
          <div v-if="!topQuestions.length" class="empty-tip compact">
            <i class="el-icon-chat-line-round" />
            <p>暂无对话数据</p>
          </div>
        </div>
      </div>

      <div class="panel rank-panel">
        <div class="panel-header">
          <h3><i class="el-icon-aim" /> 知识文档命中 Top5</h3>
          <el-button type="text" @click="goTo('/statistics/index')">更多统计</el-button>
        </div>
        <div class="rank-list">
          <div
            v-for="(item, index) in hitDocumentTop"
            :key="'d-' + index"
            class="rank-item"
          >
            <span class="rank-badge" :class="'rank-' + (index + 1)">{{ index + 1 }}</span>
            <span class="rank-name" :title="item.name">{{ item.name }}</span>
            <span class="rank-count">{{ item.value }} 次</span>
          </div>
          <div v-if="!hitDocumentTop.length" class="empty-tip compact">
            <i class="el-icon-folder-opened" />
            <p>暂无引用数据</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getDashboardStats } from '@/api/dashboard'
import { pageAnnouncement } from '@/api/announcement'

export default {
  name: 'Dashboard',
  data() {
    return {
      loading: false,
      announcementLoading: false,
      stats: {
        knowledgeCount: 0,
        employeeCount: 0,
        employeeActiveCount: 0,
        qaCount: 0
      },
      announcementStats: {
        total: 0,
        published: 0,
        draft: 0,
        offline: 0
      },
      recentAnnouncements: [],
      topQuestions: [],
      hitDocumentTop: []
    }
  },
  computed: {
    ...mapGetters(['role']),
    isAdmin() {
      return this.role === 'admin'
    },
    quickLinks() {
      const links = [
        { title: '企业知识库', path: '/knowledgeManagement/index', icon: 'el-icon-folder-opened', color: 'linear-gradient(135deg, #667eea, #764ba2)' },
        { title: '智能办公 Agent', path: '/adminChat/index', icon: 'el-icon-chat-line-round', color: 'linear-gradient(135deg, #a18cd1, #fbc2eb)' },
        { title: '对话记录', path: '/qaRecord/index', icon: 'el-icon-chat-dot-round', color: 'linear-gradient(135deg, #11998e, #38ef7d)' },
        { title: '员工管理', path: '/officeData/employee', icon: 'el-icon-s-custom', color: 'linear-gradient(135deg, #f093fb, #f5576c)' },
        { title: '大模型配置', path: '/aiModelConfig/index', icon: 'el-icon-cpu', color: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
        { title: '数据统计', path: '/statistics/index', icon: 'el-icon-data-analysis', color: 'linear-gradient(135deg, #fa709a, #fee140)' }
      ]
      if (this.isAdmin) {
        links.push({ title: '公告管理', path: '/announcementManagement/index', icon: 'el-icon-bell', color: 'linear-gradient(135deg, #e0c3fc, #8ec5fc)' })
      }
      return links
    }
  },
  created() {
    this.loadDashboard()
    if (this.isAdmin) {
      this.loadRecentAnnouncements()
    }
  },
  methods: {
    loadDashboard() {
      this.loading = true
      getDashboardStats().then(res => {
        const data = res.data || {}
        this.stats = {
          knowledgeCount: data.knowledgeCount || 0,
          employeeCount: data.employeeCount || 0,
          employeeActiveCount: data.employeeActiveCount || 0,
          qaCount: data.qaCount || 0,
          adminName: data.adminName
        }
        if (data.announcementStats) {
          this.announcementStats = { ...this.announcementStats, ...data.announcementStats }
        }
        this.topQuestions = data.topQuestions || []
        this.hitDocumentTop = data.hitDocumentTop || []
      }).finally(() => {
        this.loading = false
      })
    },
    loadRecentAnnouncements() {
      this.announcementLoading = true
      pageAnnouncement(1, 5, {}).then(res => {
        this.recentAnnouncements = (res.data && res.data.records) || []
      }).finally(() => {
        this.announcementLoading = false
      })
    },
    statusLabel(status) {
      const map = { 0: '草稿', 1: '已发布', 2: '已下线' }
      return map[status] || '未知'
    },
    goTo(path) {
      this.$router.push(path)
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 24px;
  min-height: calc(100vh - 84px);
  background: #f0f2f5;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 22px 20px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  }
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
  flex-shrink: 0;

  &.knowledge { background: linear-gradient(135deg, #667eea, #764ba2); }
  &.employee { background: linear-gradient(135deg, #11998e, #38ef7d); }
  &.qa { background: linear-gradient(135deg, #4facfe, #00f2fe); }
  &.announcement { background: linear-gradient(135deg, #fa709a, #fee140); }
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin-top: 4px;
}

.stat-sub {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.stat-arrow {
  color: #c0c4cc;
  font-size: 16px;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.rank-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.panel {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  border-bottom: 1px solid #f0f0f0;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #303133;

    i {
      margin-right: 8px;
      color: #1890ff;
    }
  }
}

.quick-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 22px;
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px 12px;
  border-radius: 12px;
  background: #fafafa;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #f0f7ff;
  }

  span {
    font-size: 13px;
    color: #606266;
    text-align: center;
  }
}

.quick-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #fff;
}

.announcement-list {
  min-height: 200px;
  padding: 8px 0;
}

.announcement-item {
  padding: 14px 22px;
  border-bottom: 1px solid #f5f5f5;
  transition: background 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #fafafa;
  }
}

.announcement-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
}

.announcement-title {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.announcement-meta {
  font-size: 12px;
  color: #909399;
}

.empty-tip {
  text-align: center;
  padding: 48px 20px;
  color: #909399;

  &.compact {
    padding: 32px 20px;

    i {
      font-size: 32px;
      margin-bottom: 8px;
    }
  }

  i {
    font-size: 40px;
    margin-bottom: 12px;
    display: block;
    color: #dcdfe6;
  }

  p {
    margin: 0;
    font-size: 14px;
  }

  a {
    color: #1890ff;
    text-decoration: none;
  }
}

.rank-list {
  padding: 8px 0;
  min-height: 280px;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 22px;
  border-bottom: 1px solid #f5f5f5;
  transition: background 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #fafafa;
  }
}

.rank-badge {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #909399;
  background: #f0f2f5;
  flex-shrink: 0;

  &.rank-1 {
    color: #fff;
    background: linear-gradient(135deg, #ffd700, #ffb800);
  }

  &.rank-2 {
    color: #fff;
    background: linear-gradient(135deg, #c0c0c0, #a8a8a8);
  }

  &.rank-3 {
    color: #fff;
    background: linear-gradient(135deg, #cd7f32, #b87333);
  }
}

.rank-name {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rank-count {
  font-size: 13px;
  color: #1890ff;
  font-weight: 500;
  flex-shrink: 0;
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .content-grid,
  .rank-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  .quick-links {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
