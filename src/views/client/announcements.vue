<template>
  <div class="announcements-page">
    <div class="page-head">
      <h2>系统公告</h2>
      <p>查看企业发布的最新通知与重要信息</p>
    </div>

    <div v-loading="loading" class="announcement-list">
      <div
        v-for="item in announcements"
        :key="item.id"
        class="announcement-card"
        @click="openDetail(item)"
      >
        <div class="card-head">
          <span class="card-title">{{ item.title }}</span>
          <el-tag v-if="item.priority >= 2" size="mini" type="danger" effect="plain">重要</el-tag>
          <el-tag v-else-if="item.priority >= 1" size="mini" type="warning" effect="plain">置顶</el-tag>
        </div>
        <p class="card-preview">{{ contentPreview(item.content) }}</p>
        <div class="card-meta">
          <span><i class="el-icon-time" /> {{ item.publishTime || '-' }}</span>
        </div>
      </div>

      <el-empty v-if="!loading && !announcements.length" description="暂无系统公告" />
    </div>

    <el-dialog
      :title="current.title || '公告详情'"
      :visible.sync="dialogVisible"
      width="640px"
      append-to-body
      class="announcement-detail-dialog"
    >
      <div v-if="current.publishTime" class="detail-meta">
        发布时间：{{ current.publishTime }}
      </div>
      <markdown-content :content="current.content || ''" class="detail-content" />
    </el-dialog>
  </div>
</template>

<script>
import { listActiveAnnouncements } from '@/api/announcement'
import MarkdownContent from '@/components/MarkdownContent'

export default {
  name: 'ClientAnnouncements',
  components: {
    MarkdownContent
  },
  data() {
    return {
      loading: false,
      announcements: [],
      dialogVisible: false,
      current: {}
    }
  },
  created() {
    this.loadAnnouncements()
  },
  methods: {
    async loadAnnouncements() {
      this.loading = true
      try {
        const res = await listActiveAnnouncements()
        this.announcements = (res && res.data) || []
      } catch (e) {
        this.announcements = []
      } finally {
        this.loading = false
      }
    },
    contentPreview(content) {
      if (!content) return ''
      const text = String(content).replace(/[#*`>\-\[\]()!]/g, '').replace(/\n+/g, ' ').trim()
      return text.length > 120 ? text.slice(0, 120) + '…' : text
    },
    openDetail(item) {
      this.current = { ...item }
      this.dialogVisible = true
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/layout/client/client-theme.scss';

.announcements-page {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 24px 20px;
  min-height: calc(100vh - 84px);
  box-sizing: border-box;
}

.page-head {
  margin-bottom: 24px;

  h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    color: $client-color-text-main;
  }

  p {
    margin: 8px 0 0;
    font-size: 14px;
    color: $client-color-text-secondary;
    opacity: 0.75;
  }
}

.announcement-list {
  min-height: 200px;
}

.announcement-card {
  padding: 18px 20px;
  margin-bottom: 12px;
  border: 1px solid $client-color-border;
  border-radius: 12px;
  background: $client-color-surface;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 58, 140, 0.04);

  &:hover {
    border-color: $client-color-primary-light;
    box-shadow: 0 6px 18px rgba(0, 58, 140, 0.1);
    transform: translateY(-1px);
  }
}

.card-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: $client-color-text-main;
}

.card-preview {
  margin: 0 0 10px;
  font-size: 14px;
  line-height: 1.6;
  color: #606266;
}

.card-meta {
  font-size: 12px;
  color: #909399;

  i {
    margin-right: 4px;
  }
}

.detail-meta {
  font-size: 13px;
  color: #909399;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid $client-color-border;
}

.detail-content {
  font-size: 14px;
  line-height: 1.8;
}
</style>
