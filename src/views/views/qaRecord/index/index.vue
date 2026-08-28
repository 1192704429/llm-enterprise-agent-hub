<template>
  <div class="app-container qa-record-page">
    <!-- 搜索表单 -->
    <div class="search-wrapper">
      <el-form :inline="true" :model="queryParams" class="search-form" size="small">
        <el-form-item label="用户反馈">
          <el-select
            v-model="queryParams.feedback"
            placeholder="请选择用户反馈"
            clearable
          >
            <el-option :key="0" label="未评价" :value="0" />
            <el-option :key="1" label="点赞" :value="1" />
            <el-option :key="2" label="点踩" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="queryParams.status"
            placeholder="请选择状态"
            clearable
          >
            <el-option :key="1" label="成功" :value="1" />
            <el-option :key="2" label="失败" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="会话标题">
          <el-input
            v-model="queryParams.sessionTitle"
            placeholder="请输入会话标题"
            clearable
            prefix-icon="el-icon-document"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item class="search-buttons">
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据表格 -->
    <div class="table-wrapper">
      <el-table
        v-loading="loading"
        :data="chatMessageList"
        class="modern-table qa-record-table"
        stripe
      >
        <el-table-column label="用户问题" prop="question" align="left" min-width="220" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span class="question-text">{{ scope.row.question || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="AI 回答" prop="answer" align="left" min-width="220" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span class="answer-text">{{ scope.row.answer || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="模型" prop="modelName" align="center" width="120" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span class="model-tag">{{ scope.row.modelName || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="用户反馈" align="center" width="100">
          <template slot-scope="scope">
            <enum-tag
              :value="scope.row.feedback"
              :label-map="feedbackEnumMap"
              :type-map="feedbackTypeMap"
            />
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" width="88">
          <template slot-scope="scope">
            <enum-tag
              :value="scope.row.status"
              :label-map="statusEnumMap"
              :type-map="statusTypeMap"
            />
          </template>
        </el-table-column>
        <el-table-column label="响应时间" align="center" width="100">
          <template slot-scope="scope">
            <span class="metric-text">{{ formatResponseTime(scope.row.responseTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" align="center" min-width="158" :show-overflow-tooltip="true" />
        <el-table-column label="会话标题" prop="sessionTitle" align="center" min-width="140" :show-overflow-tooltip="true" />
        <el-table-column label="操作" align="center" width="100" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" icon="el-icon-view" @click="handleDetail(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <pagination
      :total="total"
      :current-page.sync="queryParams.current"
      :page-size.sync="queryParams.size"
      :page-sizes="[5, 10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!-- 详情抽屉 -->
    <el-drawer
      :visible.sync="detailOpen"
      :with-header="false"
      size="560px"
      append-to-body
      class="qa-detail-drawer"
    >
      <div v-loading="detailLoading" class="detail-panel">
        <template v-if="detail">
          <!-- 抽屉头部 -->
          <div class="detail-header">
            <div class="detail-header-top">
              <div class="detail-icon">
                <i class="el-icon-chat-dot-round" />
              </div>
              <div class="detail-header-info">
                <h3 class="detail-title">{{ detail.sessionTitle || '对话详情' }}</h3>
                <p class="detail-time">
                  <i class="el-icon-time" />
                  {{ detail.createTime || '-' }}
                </p>
              </div>
              <button class="detail-close" @click="detailOpen = false">
                <i class="el-icon-close" />
              </button>
            </div>
            <div class="detail-tags">
              <enum-tag
                :value="detail.status"
                :label-map="statusEnumMap"
                :type-map="statusTypeMap"
              />
              <enum-tag
                :value="detail.feedback"
                :label-map="feedbackEnumMap"
                :type-map="feedbackTypeMap"
              />
              <span v-if="detail.modelName" class="model-badge">
                <i class="el-icon-cpu" />
                {{ detail.modelName }}
              </span>
            </div>
          </div>

          <!-- 对话内容 -->
          <div class="detail-chat">
            <div class="chat-block user">
              <div class="chat-avatar">
                <i class="el-icon-user" />
              </div>
              <div class="chat-body">
                <div class="chat-label">用户提问</div>
                <div class="chat-bubble user-bubble">{{ detail.question || '暂无内容' }}</div>
              </div>
            </div>
            <div class="chat-block assistant">
              <div class="chat-avatar">
                <i class="el-icon-cpu" />
              </div>
              <div class="chat-body">
                <div class="chat-label">AI 回答</div>
                <div class="chat-bubble assistant-bubble">
                  <markdown-content
                    :content="detail.answer"
                    placeholder="暂无内容"
                    variant="assistant"
                  />
                  <div v-if="detailSources.length" class="sources">
                    <span class="sources-label">参考来源：</span>
                    <span v-for="(src, idx) in detailSources" :key="idx" class="source-tag">{{ src }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 运行指标 -->
          <div class="detail-metrics">
            <div class="metrics-title">
              <i class="el-icon-data-analysis" />
              运行指标
            </div>
            <div class="metrics-grid">
              <div class="metric-card">
                <div class="metric-value">{{ formatResponseTime(detail.responseTime) }}</div>
                <div class="metric-label">响应时间</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">{{ detail.hitChunkCount != null ? detail.hitChunkCount : '-' }}</div>
                <div class="metric-label">命中文本块</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">{{ detail.score != null ? detail.score : '-' }}</div>
                <div class="metric-label">匹配分数</div>
              </div>
            </div>
          </div>

        </template>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { pageChatMessage, getChatMessageById } from '@/api/chat_message'
import Pagination from '@/components/Pagination'
import EnumTag from '@/components/EnumTag'
import MarkdownContent from '@/components/MarkdownContent'
import { parseSources } from '@/utils/markdown'

export default {
  name: 'ChatMessage',
  components: {
    Pagination,
    EnumTag,
    MarkdownContent
  },
  data() {
    return {
      loading: true,
      total: 0,
      chatMessageList: [],
      queryParams: {
        current: 1,
        size: 10,
        feedback: null,
        status: null,
        sessionTitle: null
      },
      detailOpen: false,
      detailLoading: false,
      detail: null,
      feedbackEnumMap: { 0: '未评价', 1: '点赞', 2: '点踩' },
      statusEnumMap: { 1: '成功', 2: '失败' },
      feedbackTypeMap: { 0: 'info', 1: 'success', 2: 'danger' },
      statusTypeMap: { 1: 'success', 2: 'danger' }
    }
  },
  computed: {
    detailSources() {
      return parseSources(this.detail && this.detail.remark)
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      const { current, size, ...rest } = this.queryParams
      pageChatMessage(current, size, { ...rest }).then(response => {
        const pageData = response.data
        this.chatMessageList = pageData.records || []
        this.total = Number(pageData.total) || 0
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    formatResponseTime(val) {
      if (val == null || val === '') return '-'
      return `${val}s`
    },
    handleQuery() {
      this.queryParams.current = 1
      this.getList()
    },
    resetQuery() {
      this.queryParams.current = 1
      this.queryParams.size = this.queryParams.size || 10
      this.queryParams.feedback = null
      this.queryParams.status = null
      this.queryParams.sessionTitle = null
      this.handleQuery()
    },
    handleDetail(row) {
      this.detailOpen = true
      this.detailLoading = true
      this.detail = { ...row }
      getChatMessageById(row.id).then(response => {
        this.detail = response.data || this.detail
      }).catch(() => {
        this.$message.warning('获取详情失败，已展示列表数据')
      }).finally(() => {
        this.detailLoading = false
      })
    },
    handleSizeChange(val) {
      this.queryParams.size = val
      this.queryParams.current = 1
      this.getList()
    },
    handleCurrentChange(val) {
      this.queryParams.current = val
      this.getList()
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/layout/client/client-theme.scss';

.qa-record-page {
  .question-text {
    color: $client-color-text-main;
    font-weight: 500;
  }

  .answer-text {
    color: #606266;
  }

  .model-tag {
    display: inline-block;
    padding: 2px 8px;
    background: rgba(0, 58, 140, 0.08);
    color: $client-color-primary;
    border-radius: 6px;
    font-size: 12px;
  }

  .metric-text {
    color: #606266;
    font-size: 13px;
  }
}

.detail-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: $client-color-bg;
  overflow-y: auto;
}

.detail-header {
  background: linear-gradient(135deg, $client-color-primary 0%, $client-color-primary-light 100%);
  padding: 24px 20px 20px;
  color: #fff;
  flex-shrink: 0;

  .detail-header-top {
    display: flex;
    align-items: flex-start;
    gap: 14px;
  }

  .detail-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
  }

  .detail-header-info {
    flex: 1;
    min-width: 0;
  }

  .detail-title {
    margin: 0 0 6px;
    font-size: 17px;
    font-weight: 600;
    line-height: 1.4;
    word-break: break-all;
  }

  .detail-time {
    margin: 0;
    font-size: 12px;
    opacity: 0.85;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .detail-close {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
    transition: background 0.2s;

    &:hover {
      background: rgba(255, 255, 255, 0.25);
    }
  }

  .detail-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 14px;
    align-items: center;

    .model-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 10px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      font-size: 12px;
    }
  }
}

.detail-chat {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex-shrink: 0;

  .chat-block {
    display: flex;
    gap: 12px;
    align-items: flex-start;

    &.user .chat-avatar {
      background: linear-gradient(135deg, $client-color-primary 0%, $subMenuBg 100%);
    }

    &.assistant .chat-avatar {
      background: linear-gradient(135deg, $client-color-primary-light 0%, #36cfc9 100%);
    }
  }

  .chat-avatar {
    width: 36px;
    height: 36px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 16px;
    flex-shrink: 0;
  }

  .chat-body {
    flex: 1;
    min-width: 0;
  }

  .chat-label {
    font-size: 12px;
    color: $client-color-text-secondary;
    margin-bottom: 6px;
    font-weight: 500;
  }

  .chat-bubble {
    padding: 14px 16px;
    font-size: 14px;
    line-height: 1.7;
    word-break: break-word;
  }

  .user-bubble {
    background: $client-color-primary;
    color: #fff;
    border-radius: 16px 16px 4px 16px;
    box-shadow: 0 4px 12px rgba(0, 58, 140, 0.15);
    white-space: pre-wrap;
  }

  .assistant-bubble {
    background: linear-gradient(180deg, #ffffff 0%, #f5faff 100%);
    color: #4b5563;
    border: 1px solid rgba(0, 58, 140, 0.1);
    border-radius: 16px 16px 16px 4px;
    box-shadow: 0 2px 8px rgba(0, 58, 140, 0.06);
  }

  .sources {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px dashed rgba(0, 58, 140, 0.12);
    font-size: 12px;
  }

  .sources-label {
    color: #909399;
  }

  .source-tag {
    display: inline-block;
    margin: 4px 4px 0 0;
    padding: 2px 8px;
    border-radius: 10px;
    background: rgba(103, 194, 58, 0.1);
    color: #67c23a;
    max-width: 100%;
    word-break: break-all;
  }
}

.detail-metrics {
  padding: 0 20px 20px;
  flex-shrink: 0;

  .metrics-title {
    font-size: 13px;
    font-weight: 600;
    color: $client-color-text-secondary;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  .metric-card {
    background: #fff;
    border-radius: 12px;
    padding: 14px 10px;
    text-align: center;
    border: 1px solid $client-color-border;
    box-shadow: 0 2px 8px rgba(0, 58, 140, 0.05);

    .metric-value {
      font-size: 18px;
      font-weight: 700;
      color: $client-color-primary;
      line-height: 1.2;
      margin-bottom: 4px;
    }

    .metric-label {
      font-size: 11px;
      color: #909399;
    }
  }
}

</style>

<style lang="scss">
.qa-detail-drawer {
  .el-drawer__body {
    padding: 0;
    overflow: hidden;
  }
}
</style>
