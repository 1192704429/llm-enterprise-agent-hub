<template>
  <div class="admin-chat-page">
    <div class="chat-layout">
      <aside class="session-panel">
        <div class="sidebar-head">
          <h3>对话历史</h3>
          <button class="icon-btn" title="新建对话" @click="handleNewSession">
            <i class="el-icon-plus" />
          </button>
        </div>
        <div v-loading="sessionsLoading" class="session-list">
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
          <p v-if="!sessionsLoading && !sessions.length" class="empty-tip">暂无历史对话</p>
        </div>
      </aside>

      <section class="chat-panel">
        <div class="chat-toolbar">
          <div class="toolbar-info">
            <h2>智能办公 Agent</h2>
            <p>支持知识库问答、OA 业务查询与管理端 AI 公告生成</p>
          </div>
          <button v-if="messages.length" class="icon-btn" title="清空当前对话" @click="handleClearMessages">
            <i class="el-icon-brush" />
          </button>
        </div>

        <div ref="messagesRef" class="messages">
          <div v-if="!messages.length && !asking" class="welcome-panel">
            <div class="welcome-icon">
              <i class="el-icon-cpu" />
            </div>
            <h3>智能办公 Agent 助手</h3>
            <p>可查询企业知识库、OA 公告与员工信息，或通过 AI 生成公告预览并在确认后发布</p>
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
              <agent-announcement-preview
                v-if="msg.role === 'assistant' && msg.announcementData"
                :announcement-data="msg.announcementData"
                @saved="handleAnnouncementSaved(msg, $event)"
                @discarded="handleAnnouncementDiscarded(msg)"
              />
              <div v-if="msg.role === 'assistant' && showMeta(msg)" class="answer-meta">
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
            </div>
          </div>

          <div v-if="asking" class="message-row assistant">
            <div class="avatar"><i class="el-icon-cpu" /></div>
            <div class="bubble typing">
              <span class="dot" />
              <span class="dot" />
              <span class="dot" />
            </div>
          </div>
        </div>

        <div class="input-area">
          <div class="input-row">
            <el-input
              v-model="inputText"
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 4 }"
              placeholder="输入办公问题，或描述公告要点…"
              :disabled="asking"
              resize="none"
              @keydown.enter.native="handleEnter"
            />
            <el-button
              type="primary"
              class="send-btn"
              :loading="asking"
              :disabled="!inputText.trim()"
              @click="handleSend"
            >
              <i class="el-icon-s-promotion" />
            </el-button>
          </div>
          <p class="input-tip">Enter 发送，Shift + Enter 换行</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { adminAsk, listAdminSessions, listAdminMessages, deleteAdminSession } from '@/api/admin-chat'
import MarkdownContent from '@/components/MarkdownContent'
import AgentAnnouncementPreview from '@/components/AgentAnnouncementPreview'
import { getToolLabel } from '@/utils/agent-tool-labels'

export default {
  name: 'AdminChat',
  components: {
    MarkdownContent,
    AgentAnnouncementPreview
  },
  data() {
    return {
      sessionsLoading: false,
      sessions: [],
      currentSessionId: null,
      messages: [],
      inputText: '',
      asking: false,
      suggestQuestions: [
        '帮我写一条公告：系统将于本周六 22:00 维护升级',
        '最近有哪些 OA 公告？',
        '查一下张三的员工信息'
      ]
    }
  },
  created() {
    this.loadSessions()
  },
  methods: {
    getToolLabel,
    showMeta(msg) {
      return msg.toolUsed || msg.answerType === 'knowledge' || (msg.sources && msg.sources.length)
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.messagesRef
        if (el) el.scrollTop = el.scrollHeight
      })
    },
    async loadSessions() {
      this.sessionsLoading = true
      try {
        const res = await listAdminSessions()
        this.sessions = (res && res.data) || []
      } catch (e) {
        this.sessions = []
      } finally {
        this.sessionsLoading = false
      }
    },
    async selectSession(sessionId) {
      this.currentSessionId = sessionId
      try {
        const res = await listAdminMessages(sessionId)
        const list = (res && res.data) || []
        this.messages = list.flatMap(item => ([
          { role: 'user', content: item.question },
          {
            role: 'assistant',
            content: item.answer || '暂无回答',
            sources: item.sources,
            toolUsed: Boolean(item.toolUsed),
            toolName: item.toolName,
            answerType: item.answerType,
            announcementData: item.announcementData || null
          }
        ]))
        this.scrollToBottom()
      } catch (e) {
        this.messages = []
      }
    },
    handleNewSession() {
      this.currentSessionId = null
      this.messages = []
    },
    handleClearMessages() {
      this.messages = []
      this.currentSessionId = null
    },
    async handleDeleteSession(sessionId) {
      try {
        await deleteAdminSession(sessionId)
        if (this.currentSessionId === sessionId) {
          this.currentSessionId = null
          this.messages = []
        }
        await this.loadSessions()
      } catch (e) {
        // handled by interceptor
      }
    },
    handleSuggest(text) {
      this.inputText = text
      this.handleSend()
    },
    handleEnter(e) {
      if (e.shiftKey) return
      e.preventDefault()
      this.handleSend()
    },
    handleAnnouncementSaved(msg, payload) {
      if (!msg.announcementData) return
      this.$set(msg.announcementData, 'saved', true)
      this.$set(msg.announcementData, 'savedId', payload.id)
      this.$set(msg.announcementData, 'savedStatus', payload.status)
      this.$set(msg.announcementData, 'title', payload.title)
      this.$set(msg.announcementData, 'content', payload.content)
      this.$set(msg.announcementData, 'priority', payload.priority)
    },
    handleAnnouncementDiscarded(msg) {
      if (msg) {
        this.$set(msg, 'announcementData', null)
      }
    },
    async handleSend() {
      const question = this.inputText.trim()
      if (!question || this.asking) return

      this.messages.push({ role: 'user', content: question })
      this.inputText = ''
      this.asking = true
      this.scrollToBottom()

      try {
        const res = await adminAsk({
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
          toolName: data.toolName,
          answerType: data.answerType || 'knowledge',
          announcementData: data.announcementData || null
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
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/layout/client/client-theme.scss';

.admin-chat-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 50px);
  max-width: 100%;
  padding: 16px;
  box-sizing: border-box;
  overflow: hidden;
}

.chat-layout {
  flex: 1;
  min-height: 0;
  min-width: 0;
  width: 100%;
  display: flex;
  overflow: hidden;
  background: $client-color-surface;
  border: 1px solid $client-color-border;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 58, 140, 0.06);
}

/* ---- 侧边栏 ---- */
.session-panel {
  width: 200px;
  flex-shrink: 0;
  min-height: 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid $client-color-border;
  background: $client-color-surface;
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

/* ---- 主聊天区 ---- */
.chat-panel {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: $client-color-bg;
}

.chat-toolbar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1px solid $client-color-border;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  min-width: 0;

  .toolbar-info {
    flex: 1;
    min-width: 0;

    h2 {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: $client-color-text-main;
    }

    p {
      margin: 2px 0 0;
      font-size: 12px;
      color: $client-color-text-secondary;
      opacity: 0.75;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.messages {
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 16px 24px;
  scroll-behavior: smooth;
}

/* ---- 欢迎页 ---- */
.welcome-panel {
  width: 100%;
  max-width: 480px;
  margin: 24px auto;
  padding: 0 8px;
  box-sizing: border-box;
  text-align: center;

  .welcome-icon {
    width: 56px;
    height: 56px;
    margin: 0 auto 16px;
    border-radius: 16px;
    background: linear-gradient(135deg, $client-color-primary 0%, $client-color-primary-light 100%);
    color: #fff;
    font-size: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 24px rgba(0, 58, 140, 0.2);
  }

  h3 {
    margin: 0 0 8px;
    font-size: 18px;
    color: $client-color-text-main;
  }

  p {
    margin: 0 0 20px;
    font-size: 13px;
    color: $client-color-text-secondary;
    opacity: 0.75;
  }
}

.suggest-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.suggest-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid $client-color-border;
  border-radius: 10px;
  background: #fff;
  color: $client-color-text-secondary;
  font-size: 13px;
  line-height: 1.5;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  box-sizing: border-box;

  i {
    color: $client-color-primary-light;
    flex-shrink: 0;
    margin-top: 2px;
  }

  &:hover {
    border-color: $client-color-primary;
    background: rgba(0, 58, 140, 0.04);
    color: $client-color-primary;
  }
}

/* ---- 消息气泡 ---- */
.message-row {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  width: 100%;
  max-width: 1100px;
  box-sizing: border-box;

  &.user {
    margin-left: auto;
    flex-direction: row-reverse;

    .avatar {
      background: linear-gradient(135deg, $client-color-primary 0%, $subMenuBg 100%);
    }

    .bubble {
      background: $client-color-primary;
      color: #fff;
      border-radius: 14px 14px 4px 14px;
    }
  }

  &.assistant {
    margin-right: auto;

    .avatar {
      background: linear-gradient(135deg, $client-color-primary-light 0%, #36cfc9 100%);
    }

    .bubble {
      background: linear-gradient(180deg, #ffffff 0%, #f5faff 100%);
      color: #4b5563;
      border: 1px solid rgba(0, 58, 140, 0.1);
      border-radius: 14px 14px 14px 4px;
      box-shadow: 0 2px 8px rgba(0, 58, 140, 0.06);
    }
  }
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
}

.bubble {
  padding: 10px 14px;
  font-size: 14px;
  line-height: 1.7;
  flex: 0 1 auto;
  min-width: 0;
  max-width: calc(100% - 42px);
  word-break: break-word;
  overflow-wrap: anywhere;
}

.bubble-content {
  width: 100%;
  min-width: 0;
  overflow-x: auto;
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
.input-area {
  flex-shrink: 0;
  padding: 10px 12px 12px;
  border-top: 1px solid $client-color-border;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  min-width: 0;
}

.input-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  width: 100%;
  min-width: 0;

  ::v-deep .el-textarea {
    flex: 1;
    min-width: 0;
  }

  ::v-deep .el-textarea__inner {
    border: 1px solid $client-color-border;
    border-radius: 12px;
    padding: 8px 12px;
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
  width: 40px;
  height: 40px;
  border-radius: 10px;
  padding: 0;
  background: $client-color-primary;
  border: none;
  flex-shrink: 0;
  font-size: 16px;
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
  margin: 4px 0 0;
  font-size: 11px;
  color: #8cb3d9;
  text-align: right;
}

@media (max-width: 1200px) {
  .session-panel {
    width: 168px;
  }

  .sidebar-head {
    padding: 12px;
  }

  .chat-toolbar {
    padding: 12px 14px;
  }
}

@media (max-width: 768px) {
  .admin-chat-page {
    height: calc(100vh - 50px);
    padding: 8px;
  }

  .session-panel {
    width: 148px;
  }

  .welcome-panel {
    margin: 12px auto;
  }

  .messages {
    padding: 12px 10px;
  }

  .input-area {
    padding: 8px 10px 10px;
  }

  .message-row.user,
  .message-row.assistant {
    max-width: 100%;
  }
}
</style>
