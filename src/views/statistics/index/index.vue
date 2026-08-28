<template>
  <div v-loading="loading" class="app-container statistics-page">
    <div class="page-header">
      <div class="page-header-main">
        <div class="page-header-icon">
          <i class="el-icon-data-analysis" />
        </div>
        <div>
          <h2 class="page-title">数据统计</h2>
          <p class="page-subtitle">企业知识库使用、Agent 检索效果与对话运行数据分析</p>
        </div>
      </div>
    </div>

    <el-tabs v-model="activeTab" type="border-card" class="statistics-tabs" @tab-click="handleTabClick">
      <!-- Tab 1: 数据概览 + 趋势分析 -->
      <el-tab-pane label="数据概览" name="overview">
        <div class="tab-section">
          <div class="section-header">
            <div class="section-title">
              <span class="section-dot" />
              核心指标
            </div>
            <span class="section-desc">系统整体运行数据一览</span>
          </div>

          <div class="stats-block">
            <div class="stats-group-label">基础统计</div>
            <div class="stats-grid">
              <div v-for="item in baseStats" :key="item.key" class="stat-card" :class="item.theme">
                <div class="stat-icon"><i :class="item.icon" /></div>
                <div class="stat-info">
                  <div class="stat-value">
                    {{ formatStatValue(item) }}<span v-if="item.unit" class="stat-unit">{{ item.unit }}</span>
                  </div>
                  <div class="stat-label">{{ item.label }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="stats-block">
            <div class="stats-group-label">运行指标</div>
            <div class="stats-grid">
              <div v-for="item in runtimeStats" :key="item.key" class="stat-card" :class="item.theme">
                <div class="stat-icon"><i :class="item.icon" /></div>
                <div class="stat-info">
                  <div class="stat-value">
                    {{ formatStatValue(item) }}<span v-if="item.unit" class="stat-unit">{{ item.unit }}</span>
                  </div>
                  <div class="stat-label">{{ item.label }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="tab-section trend-section">
          <div class="section-header">
            <div class="section-title">
              <span class="section-dot trend" />
              趋势分析
            </div>
            <span class="section-desc">最近 7 天数据变化趋势</span>
          </div>

          <div v-if="activeTab === 'overview'" class="trend-layout">
            <div class="trend-main">
              <basic-line-chart name="最近7天对话趋势" :data-list="charts.qaTrend7Days" />
            </div>
            <div class="trend-sub">
              <basic-bar-chart name="最近7天新增会话" :data-list="charts.sessionTrend7Days" />
              <basic-line-chart name="响应时间趋势" :data-list="charts.responseTimeTrend7Days" />
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- Tab 2: RAG 效果 -->
      <el-tab-pane label="RAG 效果" name="rag">
        <div class="tab-section">
          <div class="section-header">
            <div class="section-title">
              <span class="section-dot rag" />
              RAG 检索分析
            </div>
            <span class="section-desc">知识文档引用热度与 Chunk 命中分布</span>
          </div>
          <div v-if="activeTab === 'rag'" class="chart-grid">
            <basic-horizontal-bar-chart name="知识文档引用排行" :data-list="charts.documentRefRanking" />
            <basic-bar-chart name="Chunk 命中数量分布" :data-list="charts.chunkHitDistribution" />
          </div>
        </div>
      </el-tab-pane>

      <!-- Tab 3: 对话分析 -->
      <el-tab-pane label="对话分析" name="qa">
        <div class="tab-section">
          <div class="section-header">
            <div class="section-title">
              <span class="section-dot qa" />
              对话行为分析
            </div>
            <span class="section-desc">热门问题、用户反馈与模型使用情况</span>
          </div>
          <div v-if="activeTab === 'qa'" class="qa-layout">
            <div class="qa-main">
              <basic-horizontal-bar-chart name="热门问题 Top10" :data-list="charts.topQuestions" />
            </div>
            <div class="qa-side">
              <basic-pie-chart name="用户反馈统计" :data-list="charts.feedbackStats" />
              <basic-pie-chart
                v-if="showModelUsage"
                name="模型使用统计"
                :data-list="charts.modelUsage"
              />
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- Tab 4: 最近记录 -->
      <el-tab-pane label="最近记录" name="recent">
        <div class="tab-section">
          <div class="section-header">
            <div class="section-title">
              <span class="section-dot recent" />
              最近聊天记录
            </div>
            <el-button type="text" icon="el-icon-arrow-right" @click="goTo('/qaRecord/index')">查看全部</el-button>
          </div>
          <el-table :data="recentChats" stripe class="recent-table">
            <el-table-column label="用户" prop="userName" width="120" show-overflow-tooltip />
            <el-table-column label="会话标题" prop="sessionTitle" min-width="160" show-overflow-tooltip />
            <el-table-column label="用户问题" prop="question" min-width="240" show-overflow-tooltip />
            <el-table-column label="响应时间" width="110" align="center">
              <template slot-scope="scope">
                <span class="metric-tag">{{ formatResponseTime(scope.row.responseTime) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="提问时间" prop="createTime" width="170" align="center" />
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { getDashboardStatistics } from '@/api/dashboard'
import BasicLineChart from '@/components/BasicLineChart'
import BasicBarChart from '@/components/BasicBarChart'
import BasicPieChart from '@/components/BasicPieChart'
import BasicHorizontalBarChart from '@/components/BasicHorizontalBarChart'

export default {
  name: 'Statistics',
  components: {
    BasicLineChart,
    BasicBarChart,
    BasicPieChart,
    BasicHorizontalBarChart
  },
  data() {
    return {
      loading: false,
      activeTab: 'overview',
      stats: {
        documentCount: 0,
        chunkCount: 0,
        sessionCount: 0,
        qaCount: 0,
        todayQaCount: 0,
        activeUserCount: 0,
        avgResponseTime: 0,
        avgHitChunkCount: 0
      },
      charts: {
        qaTrend7Days: [],
        sessionTrend7Days: [],
        documentRefRanking: [],
        topQuestions: [],
        feedbackStats: [],
        chunkHitDistribution: [],
        modelUsage: [],
        responseTimeTrend7Days: []
      },
      recentChats: []
    }
  },
  computed: {
    showModelUsage() {
      return this.charts.modelUsage && this.charts.modelUsage.length > 1
    },
    baseStats() {
      return [
        { key: 'documentCount', label: '知识文档总数', icon: 'el-icon-folder-opened', theme: 'theme-knowledge' },
        { key: 'chunkCount', label: '文本切片总数', icon: 'el-icon-document-copy', theme: 'theme-chunk' },
        { key: 'sessionCount', label: '聊天会话总数', icon: 'el-icon-chat-line-square', theme: 'theme-session' },
        { key: 'qaCount', label: '对话总次数', icon: 'el-icon-chat-dot-round', theme: 'theme-qa' }
      ]
    },
    runtimeStats() {
      return [
        { key: 'todayQaCount', label: '今日对话次数', icon: 'el-icon-date', theme: 'theme-today' },
        { key: 'activeUserCount', label: '活跃用户数', icon: 'el-icon-user', theme: 'theme-active' },
        { key: 'avgResponseTime', label: '平均响应时间', icon: 'el-icon-timer', theme: 'theme-response', unit: 's', decimal: true },
        { key: 'avgHitChunkCount', label: '平均命中 Chunk 数', icon: 'el-icon-aim', theme: 'theme-hit', decimal: true }
      ]
    }
  },
  created() {
    this.loadStatistics()
  },
  methods: {
    loadStatistics() {
      this.loading = true
      getDashboardStatistics().then(res => {
        const data = res.data || {}
        this.stats = {
          documentCount: data.documentCount || 0,
          chunkCount: data.chunkCount || 0,
          sessionCount: data.sessionCount || 0,
          qaCount: data.qaCount || 0,
          todayQaCount: data.todayQaCount || 0,
          activeUserCount: data.activeUserCount || 0,
          avgResponseTime: data.avgResponseTime || 0,
          avgHitChunkCount: data.avgHitChunkCount || 0
        }
        this.charts = {
          qaTrend7Days: data.qaTrend7Days || [],
          sessionTrend7Days: data.sessionTrend7Days || [],
          documentRefRanking: data.documentRefRanking || [],
          topQuestions: data.topQuestions || [],
          feedbackStats: data.feedbackStats || [],
          chunkHitDistribution: data.chunkHitDistribution || [],
          modelUsage: data.modelUsage || [],
          responseTimeTrend7Days: data.responseTimeTrend7Days || []
        }
        this.recentChats = data.recentChats || []
      }).finally(() => {
        this.loading = false
      })
    },
    handleTabClick() {
      this.$nextTick(() => {
        window.dispatchEvent(new Event('resize'))
      })
    },
    formatStatValue(item) {
      const value = this.stats[item.key]
      if (item.decimal) {
        return this.formatNumber(value)
      }
      return value ?? 0
    },
    formatNumber(value) {
      if (value === null || value === undefined || value === '') {
        return '0'
      }
      const num = Number(value)
      if (Number.isNaN(num)) {
        return value
      }
      return Number.isInteger(num) ? String(num) : num.toFixed(2)
    },
    formatResponseTime(value) {
      if (value === null || value === undefined || value === '') {
        return '-'
      }
      return `${Number(value).toFixed(2)}s`
    },
    goTo(path) {
      this.$router.push(path)
    }
  }
}
</script>

<style lang="scss" scoped>
.statistics-page {
  padding: 24px;
  min-height: calc(100vh - 84px);
  background: #f0f2f5;
}

.page-header {
  margin-bottom: 20px;
}

.page-header-main {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-header-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, #003a8c, #1890ff);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  color: #fff;
  box-shadow: 0 4px 14px rgba(24, 144, 255, 0.35);
}

.page-title {
  margin: 0 0 6px;
  font-size: 22px;
  font-weight: 600;
  color: #303133;
}

.page-subtitle {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.statistics-tabs {
  border: none;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
  background: #fff;

  ::v-deep .el-tabs__header {
    background: #fafbfc;
    border-bottom: 1px solid #eef0f3;
    margin: 0;
  }

  ::v-deep .el-tabs__item {
    height: 48px;
    line-height: 48px;
    font-size: 14px;
    color: #606266;
    border: none !important;

    &.is-active {
      color: #1890ff;
      font-weight: 600;
      background: #fff;
    }
  }

  ::v-deep .el-tabs__content {
    padding: 0;
  }
}

.tab-section {
  padding: 24px 28px;

  & + & {
    border-top: 1px solid #f0f2f5;
  }
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.section-dot {
  width: 4px;
  height: 18px;
  border-radius: 2px;
  background: linear-gradient(180deg, #1890ff, #36cfc9);

  &.trend { background: linear-gradient(180deg, #667eea, #764ba2); }
  &.rag { background: linear-gradient(180deg, #11998e, #38ef7d); }
  &.qa { background: linear-gradient(180deg, #fa709a, #fee140); }
  &.recent { background: linear-gradient(180deg, #4facfe, #00f2fe); }
}

.section-desc {
  font-size: 13px;
  color: #909399;
}

.stats-block {
  & + & {
    margin-top: 24px;
  }
}

.stats-group-label {
  font-size: 12px;
  font-weight: 500;
  color: #909399;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  padding-left: 2px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 18px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #eef0f3;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  }
}

.stat-icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #fff;
  flex-shrink: 0;
}

.theme-knowledge .stat-icon { background: linear-gradient(135deg, #667eea, #764ba2); }
.theme-chunk .stat-icon { background: linear-gradient(135deg, #f093fb, #f5576c); }
.theme-session .stat-icon { background: linear-gradient(135deg, #4facfe, #00f2fe); }
.theme-qa .stat-icon { background: linear-gradient(135deg, #11998e, #38ef7d); }
.theme-today .stat-icon { background: linear-gradient(135deg, #fa709a, #fee140); }
.theme-active .stat-icon { background: linear-gradient(135deg, #a18cd1, #fbc2eb); }
.theme-response .stat-icon { background: linear-gradient(135deg, #ff9a9e, #fecfef); }
.theme-hit .stat-icon { background: linear-gradient(135deg, #ffecd2, #fcb69f); }

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.stat-unit {
  font-size: 13px;
  font-weight: 500;
  color: #909399;
  margin-left: 2px;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 6px;
}

.trend-section {
  background: linear-gradient(180deg, #fafbfc 0%, #fff 100%);
}

.trend-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.trend-main {
  width: 100%;
}

.trend-sub {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.qa-layout {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 16px;
  align-items: start;
}

.qa-side {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.recent-table {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;

  ::v-deep th {
    background: #fafbfc !important;
    color: #606266;
    font-weight: 600;
  }
}

.metric-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 10px;
  background: #ecf5ff;
  color: #1890ff;
  font-size: 12px;
  font-weight: 500;
}

@media (max-width: 1200px) {
  .stats-grid,
  .trend-sub,
  .chart-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .qa-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .statistics-page {
    padding: 16px;
  }

  .tab-section {
    padding: 16px;
  }

  .stats-grid,
  .trend-sub,
  .chart-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>
