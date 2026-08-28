<template>
  <div class="qa-page">
    <!-- 侧边栏：会话历史（PC 常驻，H5 抽屉） -->
    <aside class="qa-sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-head">
        <h3>对话历史</h3>
        <button class="icon-btn" title="新建对话" @click="handleNewSession">
          <i class="el-icon-plus" />
        </button>
      </div>
      <div v-if="isLoggedIn" v-loading="sessionsLoading" class="session-list">
        <div
          v-for="item in sessions"
          :key="item.id"
          class="session-item"
          :class="{ active: currentSessionId === item.id }"
          @click="selectSession(item.id)"
        >
          <i class="el-icon-chat-dot-round" />
          <span class="session-title">{{ item.sessionTitle || '新对话' }}</span>
          <button class="delete-btn" @click.stop="handleDeleteSession(item.id)">
            <i class="el-icon-delete" />
          </button>
        </div>
        <p v-if="!sessionsLoading && sessions.length === 0" class="empty-tip">暂无历史对话</p>
      </div>
      <div v-else class="guest-tip">
        <i class="el-icon-info" />
        <p>登录后可保存对话历史</p>
        <el-button type="primary" size="small" round @click="$router.push('/user/login')">去登录</el-button>
      </div>
    </aside>

    <div v-if="sidebarOpen" class="sidebar-mask" @click="sidebarOpen = false" />

    <!-- 主聊天区 -->
    <div class="qa-main">
      <div class="qa-toolbar">
        <button class="icon-btn mobile-only" @click="sidebarOpen = true">
          <i class="el-icon-s-operation" />
        </button>
        <div class="toolbar-info">
          <h2>智能办公 Agent</h2>
          <p>企业知识库问答 · OA 公告 · 请假审批 · 日程查询</p>
        </div>
        <button v-if="messages.length" class="icon-btn" title="清空当前对话" @click="handleClearMessages">
          <i class="el-icon-brush" />
        </button>
      </div>

      <!-- 系统公告 -->
      <div v-if="announcements.length" class="announcement-bar">
        <div class="announcement-bar-head">
          <i class="el-icon-bell" />
          <span>系统公告</span>
        </div>
        <div class="announcement-bar-list">
          <button
            v-for="item in announcements"
            :key="item.id"
            type="button"
            class="announcement-chip"
            @click="openAnnouncement(item)"
          >
            <span class="chip-dot" />
            {{ item.title }}
          </button>
        </div>
        <button type="button" class="announcement-more" @click="$router.push('/user/announcements')">
          查看全部
        </button>
      </div>

      <div ref="messagesRef" class="qa-messages">
        <!-- 欢迎页 -->
        <div v-if="!messages.length && !asking" class="welcome-panel">
          <div class="welcome-icon">
            <i class="el-icon-chat-dot-round" />
          </div>
          <h3>您好，有什么办公问题需要协助？</h3>
          <p>支持制度问答、公告查询、请假与日程等</p>
          <div class="suggest-list">
            <button
              v-for="(item, idx) in suggestQuestions"
              :key="idx"
              class="suggest-item"
              @click="handleSuggest(item)"
            >
              <i class="el-icon-search" />
              {{ item }}
            </button>
          </div>
        </div>

        <!-- 消息列表 -->
        <div v-for="(msg, idx) in messages" :key="idx" class="message-row" :class="msg.role">
          <div class="avatar">
            <i :class="msg.role === 'user' ? 'el-icon-user' : 'el-icon-cpu'" />
          </div>
          <div class="bubble">
            <markdown-content
              :content="msg.content"
              class="bubble-content"
              :variant="msg.role === 'user' ? 'user' : 'assistant'"
            />
            <div v-if="msg.role === 'assistant' && (msg.toolUsed || (msg.sources && msg.sources.length))" class="answer-meta">
              <span v-if="msg.toolUsed" class="meta-tag tool">
                <i class="el-icon-s-tools" />
                {{ getToolLabel(msg.toolName) }}
              </span>
              <span v-else-if="msg.answerType === 'knowledge'" class="meta-tag knowledge">
                <i class="el-icon-collection" />
                知识库
              </span>
              <span v-if="msg.sources && msg.sources.length" class="meta-tag source">
                <i class="el-icon-document" />
                参考：{{ msg.sources.join('、') }}
              </span>
            </div>
            <div v-if="msg.role === 'assistant' && msg.messageId" class="feedback-actions">
              <button
                type="button"
                class="feedback-btn like"
                :class="{ active: msg.feedback === 1 }"
                :disabled="msg.feedbackSubmitting"
                title="有帮助"
                @click="handleFeedback(msg, 1)"
              >
                <i class="el-icon-circle-check" />
                <span>有帮助</span>
              </button>
              <button
                type="button"
                class="feedback-btn dislike"
                :class="{ active: msg.feedback === 2 }"
                :disabled="msg.feedbackSubmitting"
                title="无帮助"
                @click="handleFeedback(msg, 2)"
              >
                <i class="el-icon-circle-close" />
                <span>无帮助</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 加载中 -->
        <div v-if="asking" class="message-row assistant">
          <div class="avatar">
            <i class="el-icon-cpu" />
          </div>
          <div class="bubble typing">
            <span class="dot" />
            <span class="dot" />
            <span class="dot" />
          </div>
        </div>
      </div>

      <!-- 输入区 -->
      <div class="qa-input-area">
        <div v-if="!isLoggedIn" class="login-hint">
          <i class="el-icon-warning-outline" />
          登录后即可提问，
          <a href="javascript:void(0)" @click="$router.push('/user/login')">立即登录</a>
        </div>
        <div class="input-row">
          <el-input
            v-model="inputText"
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 4 }"
            :placeholder="isLoggedIn ? '请输入办公问题…' : '请先登录后提问'"
            :disabled="!isLoggedIn || asking"
            resize="none"
            @keydown.enter.native="handleEnter"
          />
          <el-button
            type="primary"
            class="send-btn"
            :loading="asking"
            :disabled="!isLoggedIn || !inputText.trim()"
            @click="handleSend"
          >
            <i class="el-icon-s-promotion" />
          </el-button>
        </div>
        <p class="input-tip">Enter 发送，Shift + Enter 换行</p>
      </div>
    </div>

    <!-- 公告详情 -->
    <el-dialog
      :title="currentAnnouncement.title || '系统公告'"
      :visible.sync="announcementDialogVisible"
      width="520px"
      append-to-body
      class="announcement-dialog"
    >
      <div v-if="currentAnnouncement.publishTime" class="announcement-dialog-meta">
        发布时间：{{ currentAnnouncement.publishTime }}
      </div>
      <markdown-content :content="currentAnnouncement.content || ''" class="announcement-dialog-content" />
    </el-dialog>
  </div>
</template>

<script>
import {
  clientAsk,
  listClientSessions,
  listClientMessages,
  deleteClientSession,
  submitMessageFeedback
} from '@/api/client-chat'
import { listActiveAnnouncements } from '@/api/announcement'
import MarkdownContent from '@/components/MarkdownContent'
import { getToolLabel } from '@/utils/agent-tool-labels'

export default {
  name: 'ClientHome',
  components: {
    MarkdownContent
  },
  data() {
    return {
      sidebarOpen: false,
      sessionsLoading: false,
      sessions: [],
      currentSessionId: null,
      messages: [],
      inputText: '',
      asking: false,
      suggestQuestions: [
        '最近有哪些 OA 公告？',
        '帮我查一下本月的日程安排',
        '年假请假流程是什么？'
      ],
      announcements: [],
      announcementDialogVisible: false,
      currentAnnouncement: {}
    }
  },
  computed: {
    isLoggedIn() {
      return Boolean(this.$store.getters.clientToken)
    }
  },
  watch: {
    isLoggedIn: {
      immediate: true,
      handler(val) {
        if (val) {
          this.loadSessions()
        } else {
          this.sessions = []
          this.currentSessionId = null
        }
      }
    }
  },
  created() {
    this.loadAnnouncements()
  },
  methods: {
    getToolLabel,
    async loadAnnouncements() {
      try {
        const res = await listActiveAnnouncements()
        this.announcements = (res && res.data) || []
      } catch (e) {
        this.announcements = []
      }
    },
    openAnnouncement(item) {
      this.currentAnnouncement = { ...item }
      this.announcementDialogVisible = true
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.messagesRef
        if (el) el.scrollTop = el.scrollHeight
      })
    },
    async loadSessions() {
      if (!this.isLoggedIn) return
      this.sessionsLoading = true
      try {
        const res = await listClientSessions()
        this.sessions = (res && res.data) || []
      } catch (e) {
        this.sessions = []
      } finally {
        this.sessionsLoading = false
      }
    },
    async selectSession(sessionId) {
      this.currentSessionId = sessionId
      this.sidebarOpen = false
      try {
        const res = await listClientMessages(sessionId)
        const list = (res && res.data) || []
        this.messages = list.flatMap(item => ([
          { role: 'user', content: item.question },
          {
            role: 'assistant',
            content: item.answer || '暂无回答',
            sources: item.sources,
            toolUsed: Boolean(item.toolUsed),
            toolName: item.toolName,
            answerType: item.answerType || 'knowledge',
            messageId: item.id,
            feedback: item.feedback == null ? 0 : item.feedback,
            feedbackSubmitting: false
          }
        ]))
        this.scrollToBottom()
      } catch (e) {
        this.messages = []
      }
    },
    async handleNewSession() {
      if (!this.isLoggedIn) {
        this.$router.push('/user/login')
        return
      }
      this.currentSessionId = null
      this.messages = []
      this.sidebarOpen = false
    },
    async handleDeleteSession(sessionId) {
      try {
        await deleteClientSession(sessionId)
        if (this.currentSessionId === sessionId) {
          this.currentSessionId = null
          this.messages = []
        }
        await this.loadSessions()
      } catch (e) {
        // error handled by interceptor
      }
    },
    handleClearMessages() {
      this.messages = []
      this.currentSessionId = null
    },
    handleSuggest(text) {
      if (!this.isLoggedIn) {
        this.$router.push('/user/login')
        return
      }
      this.inputText = text
      this.handleSend()
    },
    handleEnter(e) {
      if (e.shiftKey) return
      e.preventDefault()
      this.handleSend()
    },
    async handleSend() {
      const question = this.inputText.trim()
      if (!question || this.asking) return

      if (!this.isLoggedIn) {
        this.$router.push('/user/login')
        return
      }

      this.messages.push({ role: 'user', content: question })
      this.inputText = ''
      this.asking = true
      this.scrollToBottom()

      try {
        const res = await clientAsk({
          sessionId: this.currentSessionId,
          question
        })
        const data = (res && res.data) || {}
        if (data.sessionId) {
          this.currentSessionId = data.sessionId
          await this.loadSessions()
        }
        this.messages.push({
          role: 'assistant',
          content: data.answer || '抱歉，暂时无法获取回答，请稍后重试。',
          sources: data.sources || [],
          toolUsed: Boolean(data.toolUsed),
          toolName: data.toolName || null,
          answerType: data.answerType || 'knowledge',
          messageId: data.messageId,
          feedback: 0,
          feedbackSubmitting: false
        })
      } catch (e) {
        this.messages.push({
          role: 'assistant',
          content: '抱歉，服务暂时不可用，请稍后重试。'
        })
      } finally {
        this.asking = false
        this.scrollToBottom()
      }
    },
    async handleFeedback(msg, value) {
      if (!msg.messageId || msg.feedbackSubmitting) return

      const nextFeedback = msg.feedback === value ? 0 : value
      msg.feedbackSubmitting = true
      try {
        await submitMessageFeedback(msg.messageId, nextFeedback)
        msg.feedback = nextFeedback
      } catch (e) {
        // error handled by interceptor
      } finally {
        msg.feedbackSubmitting = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/layout/client/client-theme.scss';

.qa-page {
  flex: 1;
  display: flex;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: $client-main-gap-top $client-main-gap-x $client-main-gap-bottom;
  box-sizing: border-box;
  min-height: 0;
  overflow: hidden;
  position: relative;
}

/* ---- 侧边栏 ---- */
.qa-sidebar {
  width: 260px;
  flex-shrink: 0;
  min-height: 0;
  overflow: hidden;
  background: $client-color-surface;
  border-right: 1px solid $client-color-border;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
}

.sidebar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid $client-color-border;

  h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: $client-color-text-main;
  }
}

.icon-btn {
  width: 32px;
  height: 32px;
  border: 1px solid $client-color-border;
  border-radius: 8px;
  background: #fff;
  color: $client-color-primary;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 58, 140, 0.06);
    border-color: $client-color-primary;
  }
}

.session-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 8px;
}

.session-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  color: $client-color-text-secondary;
  font-size: 13px;
  transition: all 0.2s ease;
  margin-bottom: 4px;

  i {
    flex-shrink: 0;
    color: $client-color-primary-light;
  }

  .session-title {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .delete-btn {
    opacity: 0;
    border: none;
    background: transparent;
    color: #f56c6c;
    cursor: pointer;
    padding: 2px;
    font-size: 14px;
    transition: opacity 0.2s;
  }

  &:hover,
  &.active {
    background: rgba(0, 58, 140, 0.06);
    color: $client-color-primary;
  }

  &:hover .delete-btn {
    opacity: 1;
  }
}

.empty-tip {
  text-align: center;
  color: #8cb3d9;
  font-size: 13px;
  padding: 24px 0;
}

.guest-tip {
  padding: 32px 20px;
  text-align: center;
  color: $client-color-text-secondary;

  i {
    font-size: 28px;
    color: $client-color-primary-light;
    margin-bottom: 12px;
  }

  p {
    margin: 0 0 16px;
    font-size: 13px;
  }
}

.sidebar-mask {
  display: none;
}

/* ---- 主区域 ---- */
.qa-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.qa-toolbar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid $client-color-border;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);

  .toolbar-info {
    flex: 1;

    h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
      color: $client-color-text-main;
    }

    p {
      margin: 2px 0 0;
      font-size: 12px;
      color: $client-color-text-secondary;
      opacity: 0.7;
    }
  }
}

.announcement-bar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  background: linear-gradient(90deg, rgba(255, 247, 230, 0.95), rgba(255, 251, 240, 0.95));
  border-bottom: 1px solid rgba(230, 162, 60, 0.2);
  overflow: hidden;
}

.announcement-bar-head {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 600;
  color: #e6a23c;

  i {
    font-size: 15px;
  }
}

.announcement-bar-list {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  flex: 1;
  min-width: 0;
  padding-bottom: 2px;

  &::-webkit-scrollbar {
    height: 4px;
  }
}

.announcement-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: 1px solid rgba(230, 162, 60, 0.35);
  border-radius: 999px;
  background: #fff;
  color: #606266;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;

  &:hover {
    border-color: #e6a23c;
    color: #e6a23c;
    background: #fffbf0;
  }
}

.chip-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #e6a23c;
  flex-shrink: 0;
}

.announcement-more {
  flex-shrink: 0;
  padding: 4px 12px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #e6a23c;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(230, 162, 60, 0.12);
  }
}

.announcement-dialog-meta {
  font-size: 13px;
  color: #909399;
  margin-bottom: 16px;
}

.announcement-dialog-content {
  line-height: 1.8;
  color: #606266;
  font-size: 14px;
}

.qa-messages {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 24px 20px;
  scroll-behavior: smooth;
}

/* ---- 欢迎页 ---- */
.welcome-panel {
  max-width: 560px;
  margin: 40px auto;
  text-align: center;

  .welcome-icon {
    width: 64px;
    height: 64px;
    margin: 0 auto 20px;
    border-radius: 20px;
    background: linear-gradient(135deg, $client-color-primary 0%, $client-color-primary-light 100%);
    color: #fff;
    font-size: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 24px rgba(0, 58, 140, 0.2);
  }

  h3 {
    margin: 0 0 8px;
    font-size: 22px;
    color: $client-color-text-main;
  }

  p {
    margin: 0 0 28px;
    font-size: 14px;
    color: $client-color-text-secondary;
    opacity: 0.75;
  }
}

.suggest-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.suggest-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border: 1px solid $client-color-border;
  border-radius: 12px;
  background: #fff;
  color: $client-color-text-secondary;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;

  i {
    color: $client-color-primary-light;
    flex-shrink: 0;
  }

  &:hover {
    border-color: $client-color-primary;
    background: rgba(0, 58, 140, 0.04);
    color: $client-color-primary;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 58, 140, 0.08);
  }
}

/* ---- 消息气泡 ---- */
.message-row {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  max-width: 800px;

  &.user {
    margin-left: auto;
    flex-direction: row-reverse;

    .avatar {
      background: linear-gradient(135deg, $client-color-primary 0%, $subMenuBg 100%);
    }

    .bubble {
      background: $client-color-primary;
      color: #fff;
      border-radius: 16px 16px 4px 16px;
    }
  }

  &.assistant {
    .avatar {
      background: linear-gradient(135deg, $client-color-primary-light 0%, #36cfc9 100%);
    }

    .bubble {
      background: linear-gradient(180deg, #ffffff 0%, #f5faff 100%);
      color: #4b5563;
      border: 1px solid rgba(0, 58, 140, 0.1);
      border-radius: 16px 16px 16px 4px;
      box-shadow: 0 2px 8px rgba(0, 58, 140, 0.06);
    }
  }
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
}

.bubble {
  padding: 12px 16px;
  font-size: 14px;
  line-height: 1.7;
  max-width: calc(100% - 48px);
  word-break: break-word;
}

.bubble-content {
  width: 100%;
}

.answer-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.meta-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  line-height: 1.4;

  i {
    font-size: 12px;
  }

  &.tool {
    background: rgba(230, 162, 60, 0.12);
    color: #e6a23c;
  }

  &.knowledge {
    background: rgba(0, 58, 140, 0.08);
    color: $client-color-primary;
  }

  &.source {
    background: rgba(103, 194, 58, 0.1);
    color: #67c23a;
    max-width: 100%;
    word-break: break-all;
  }
}

.feedback-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed rgba(0, 58, 140, 0.1);
}

.feedback-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border: 1px solid $client-color-border;
  border-radius: 16px;
  background: #fff;
  color: $client-color-text-secondary;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  i {
    font-size: 14px;
  }

  &:hover:not(:disabled) {
    border-color: $client-color-primary-light;
    color: $client-color-primary;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &.like.active {
    border-color: #67c23a;
    background: rgba(103, 194, 58, 0.1);
    color: #67c23a;
  }

  &.dislike.active {
    border-color: #f56c6c;
    background: rgba(245, 108, 108, 0.1);
    color: #f56c6c;
  }
}

.typing {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 16px 20px;

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: $client-color-primary-light;
    animation: bounce 1.4s infinite ease-in-out both;

    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
  }
}

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

/* ---- 输入区 ---- */
.qa-input-area {
  flex-shrink: 0;
  padding: 12px 20px 16px;
  border-top: 1px solid $client-color-border;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
}

.login-hint {
  text-align: center;
  font-size: 13px;
  color: $client-color-text-secondary;
  margin-bottom: 10px;

  a {
    color: $client-color-primary;
    font-weight: 500;
  }
}

.input-row {
  display: flex;
  align-items: flex-end;
  gap: 10px;

  ::v-deep .el-textarea__inner {
    border: 1px solid $client-color-border;
    border-radius: 14px;
    padding: 10px 16px;
    background: #f0f7ff;
    font-size: 14px;
    transition: all 0.2s ease;

    &:focus {
      border-color: $client-color-primary;
      background: #fff;
      box-shadow: 0 0 0 3px rgba(0, 58, 140, 0.1);
    }
  }
}

.send-btn {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  padding: 0;
  background: $client-color-primary;
  border: none;
  flex-shrink: 0;
  font-size: 18px;
  box-shadow: 0 4px 12px rgba(0, 58, 140, 0.25);

  &:hover,
  &:focus {
    background: $client-color-primary-light;
  }

  &.is-disabled {
    background: #c0c4cc;
    box-shadow: none;
  }
}

.input-tip {
  margin: 6px 0 0;
  font-size: 11px;
  color: #8cb3d9;
  text-align: right;
}

.mobile-only {
  display: none;
}

/* ---- 响应式 ---- */
@media (max-width: 768px) {
  .qa-page {
    padding: 12px 12px 16px;
  }

  .qa-sidebar {
    position: fixed;
    top: 60px;
    left: 0;
    bottom: 0;
    z-index: 900;
    transform: translateX(-100%);
    box-shadow: 4px 0 20px rgba(0, 58, 140, 0.12);

    &.open {
      transform: translateX(0);
    }
  }

  .sidebar-mask {
    display: block;
    position: fixed;
    inset: 60px 0 0 0;
    z-index: 899;
    background: rgba(0, 0, 0, 0.3);
  }

  .mobile-only {
    display: inline-flex;
  }

  .suggest-list {
    grid-template-columns: 1fr;
  }

  .welcome-panel {
    margin: 20px auto;
    padding: 0 8px;
  }

  .qa-messages {
    padding: 16px 12px;
  }

  .qa-input-area {
    padding: 10px 12px 12px;
  }

  .message-row {
    max-width: 100%;
  }
}
</style>
