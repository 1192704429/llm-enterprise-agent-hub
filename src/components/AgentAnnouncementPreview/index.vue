<template>
  <div v-if="visible" class="agent-announcement-preview">
    <div class="preview-header">
      <i class="el-icon-bell" />
      <span>公告预览</span>
      <span v-if="localData.saved" class="saved-badge">已保存</span>
    </div>

    <div class="preview-body">
      <div class="field-row">
        <label>标题</label>
        <el-input
          v-model="localData.title"
          :disabled="localData.saved || saving"
          maxlength="200"
          show-word-limit
          placeholder="公告标题"
        />
      </div>
      <div class="field-row">
        <label>优先级</label>
        <el-input-number
          v-model="localData.priority"
          :disabled="localData.saved || saving"
          :min="0"
          :max="999"
          controls-position="right"
        />
      </div>
      <div class="field-row content-row">
        <label>正文</label>
        <el-input
          v-model="localData.content"
          type="textarea"
          :disabled="localData.saved || saving"
          :autosize="{ minRows: 4, maxRows: 10 }"
          placeholder="公告正文（支持 Markdown）"
        />
      </div>
      <div v-if="!localData.saved" class="content-preview">
        <div class="preview-label">预览</div>
        <markdown-content :content="localData.content" variant="assistant" />
      </div>
    </div>

    <div v-if="!localData.saved" class="preview-actions">
      <el-button size="small" :disabled="saving" @click="handleDiscard">放弃</el-button>
      <el-button size="small" type="primary" plain :loading="saving && saveMode === 'draft'" @click="handleSaveDraft">
        保存草稿
      </el-button>
      <el-button size="small" type="primary" :loading="saving && saveMode === 'publish'" @click="handleSaveAndPublish">
        保存并发布
      </el-button>
    </div>

    <div v-else class="preview-result">
      <i class="el-icon-circle-check" />
      <span>{{ resultText }}</span>
    </div>
  </div>
</template>

<script>
import { saveAnnouncement, publishAnnouncement } from '@/api/announcement'
import MarkdownContent from '@/components/MarkdownContent'

export default {
  name: 'AgentAnnouncementPreview',
  components: { MarkdownContent },
  props: {
    announcementData: {
      type: Object,
      default: () => null
    }
  },
  data() {
    return {
      localData: {
        title: '',
        content: '',
        priority: 0,
        saved: false,
        savedId: null,
        savedStatus: null
      },
      saving: false,
      saveMode: '',
      discarded: false
    }
  },
  computed: {
    visible() {
      return !this.discarded && this.announcementData && (this.localData.title || this.localData.content)
    },
    resultText() {
      if (this.localData.savedStatus === 1) {
        return '公告已保存并发布，用户端可见。'
      }
      return '公告已保存为草稿，可在公告管理中继续编辑或发布。'
    }
  },
  watch: {
    announcementData: {
      immediate: true,
      deep: true,
      handler(val) {
        if (!val) return
        this.localData = {
          title: val.title || '',
          content: val.content || '',
          priority: val.priority != null ? val.priority : 0,
          saved: Boolean(val.saved),
          savedId: val.savedId || null,
          savedStatus: val.savedStatus != null ? val.savedStatus : null
        }
        this.discarded = false
      }
    }
  },
  methods: {
    handleDiscard() {
      this.$confirm('确定放弃这条公告预览吗？内容将不会保存。', '提示', {
        type: 'warning',
        confirmButtonText: '确定放弃',
        cancelButtonText: '再看看'
      }).then(() => {
        this.discarded = true
        this.$emit('discarded')
      }).catch(() => {})
    },
    async handleSaveDraft() {
      await this.persist(false)
    },
    async handleSaveAndPublish() {
      await this.persist(true)
    },
    async persist(publish) {
      if (!this.localData.title || !this.localData.title.trim()) {
        this.$message.warning('请填写公告标题')
        return
      }
      if (!this.localData.content || !this.localData.content.trim()) {
        this.$message.warning('请填写公告正文')
        return
      }

      this.saving = true
      this.saveMode = publish ? 'publish' : 'draft'
      try {
        const res = await saveAnnouncement({
          title: this.localData.title.trim(),
          content: this.localData.content.trim(),
          priority: this.localData.priority || 0,
          status: 0
        })
        const saved = (res && res.data) || {}
        const id = saved.id
        if (publish && id) {
          await publishAnnouncement(id)
        }
        this.localData.saved = true
        this.localData.savedId = id
        this.localData.savedStatus = publish ? 1 : 0
        this.$message.success(publish ? '公告已发布' : '公告已保存为草稿')
        this.$emit('saved', {
          id,
          status: this.localData.savedStatus,
          title: this.localData.title,
          content: this.localData.content,
          priority: this.localData.priority
        })
      } catch (e) {
        // handled by interceptor
      } finally {
        this.saving = false
        this.saveMode = ''
      }
    }
  }
}
</script>

<style scoped>
.agent-announcement-preview {
  margin-top: 12px;
  border: 1px solid rgba(0, 58, 140, 0.15);
  border-radius: 12px;
  background: #fff;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 58, 140, 0.06);
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: linear-gradient(90deg, rgba(0, 58, 140, 0.08) 0%, rgba(54, 207, 201, 0.08) 100%);
  font-size: 14px;
  font-weight: 600;
  color: #003a8c;
}

.preview-header i {
  font-size: 16px;
}

.saved-badge {
  margin-left: auto;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(103, 194, 58, 0.15);
  color: #67c23a;
  font-size: 12px;
  font-weight: 500;
}

.preview-body {
  padding: 12px 14px;
}

.field-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
}

.field-row label {
  width: 52px;
  flex-shrink: 0;
  padding-top: 8px;
  font-size: 13px;
  color: #606266;
}

.field-row.content-row {
  align-items: stretch;
}

.content-preview {
  margin-top: 4px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #f5faff;
  border: 1px dashed rgba(0, 58, 140, 0.15);
}

.preview-label {
  margin-bottom: 6px;
  font-size: 12px;
  color: #909399;
}

.preview-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 10px 14px 12px;
  border-top: 1px solid #ebeef5;
}

.preview-result {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px 12px;
  border-top: 1px solid #ebeef5;
  color: #67c23a;
  font-size: 13px;
}

.preview-result i {
  font-size: 16px;
}
</style>
