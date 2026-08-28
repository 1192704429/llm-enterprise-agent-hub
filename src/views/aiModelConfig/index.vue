<template>
  <div class="app-container model-config-page">
    <div class="stats-row">
      <div class="stat-card stat-total">
        <div class="stat-icon"><i class="el-icon-s-grid" /></div>
        <div class="stat-body">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">配置总数</div>
        </div>
      </div>
      <div class="stat-card stat-active">
        <div class="stat-icon"><i class="el-icon-circle-check" /></div>
        <div class="stat-body">
          <div class="stat-value">{{ stats.active }}</div>
          <div class="stat-label">已启用</div>
        </div>
      </div>
      <div class="stat-card stat-current">
        <div class="stat-icon"><i class="el-icon-success" /></div>
        <div class="stat-body">
          <div class="stat-value">{{ stats.current }}</div>
          <div class="stat-label">当前使用</div>
        </div>
      </div>
      <div class="stat-card stat-disabled">
        <div class="stat-icon"><i class="el-icon-remove-outline" /></div>
        <div class="stat-body">
          <div class="stat-value">{{ stats.disabled }}</div>
          <div class="stat-label">已禁用</div>
        </div>
      </div>
    </div>

    <div class="action-buttons">
      <el-button type="primary" icon="el-icon-plus" @click="openCreate">新增配置</el-button>
    </div>

    <el-alert
      v-if="!loading && configs.length === 0"
      title="尚未配置大模型，新增第一套可用配置后会自动设为当前使用。"
      type="warning"
      show-icon
      :closable="false"
      class="empty-alert"
    />

    <div v-loading="loading" class="config-grid">
      <div
        v-for="item in configs"
        :key="item.id"
        class="config-card"
        :class="{ selected: item.selected === 1, disabled: item.enabled !== 1 }"
      >
        <div class="config-card-top">
          <div class="config-card-icon">
            <i class="el-icon-connection" />
          </div>
          <div class="config-card-meta">
            <div class="config-name-row">
              <span class="config-name">{{ item.configName }}</span>
              <el-tag v-if="item.selected === 1" size="mini" type="success" effect="dark">当前使用</el-tag>
              <el-tag v-else-if="item.enabled !== 1" size="mini" type="info">已禁用</el-tag>
            </div>
            <div class="config-model">{{ item.model }}</div>
          </div>
          <el-dropdown trigger="click" @command="command => handleCommand(command, item)">
            <span class="action-more"><i class="el-icon-more" /></span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="edit" icon="el-icon-edit">编辑</el-dropdown-item>
              <el-dropdown-item command="delete" icon="el-icon-delete" divided>删除</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>

        <div class="config-detail">
          <div class="detail-item">
            <span class="detail-label"><i class="el-icon-link" /> 接口地址</span>
            <span class="detail-value" :title="item.apiUrl">{{ item.apiUrl }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label"><i class="el-icon-key" /> API 密钥</span>
            <span class="detail-value">{{ item.apiKeyConfigured ? '••••••••（已配置）' : '未配置' }}</span>
          </div>
        </div>

        <div class="config-card-footer">
          <el-button
            v-if="item.selected === 1"
            type="success"
            size="small"
            plain
            disabled
            icon="el-icon-check"
          >正在使用</el-button>
          <el-button
            v-else
            type="primary"
            size="small"
            plain
            :disabled="item.enabled !== 1"
            icon="el-icon-switch-button"
            @click="handleSelect(item)"
          >设为当前使用</el-button>
        </div>
      </div>

      <div v-if="!loading && configs.length === 0" class="config-empty">
        <i class="el-icon-cpu config-empty-icon" />
        <p class="config-empty-title">暂无大模型配置</p>
        <p class="config-empty-desc">点击上方「新增配置」添加第一套模型接口</p>
      </div>
    </div>

    <el-dialog
      :title="form.id ? '编辑大模型配置' : '新增大模型配置'"
      :visible.sync="dialogVisible"
      width="560px"
      append-to-body
      class="model-config-dialog"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="配置名称" prop="configName">
          <el-input v-model="form.configName" placeholder="例如：DeepSeek 生产环境" />
        </el-form-item>
        <el-form-item label="API 地址" prop="apiUrl">
          <el-input v-model="form.apiUrl" placeholder="https://api.deepseek.com/chat/completions" />
        </el-form-item>
        <el-form-item label="API Key" :prop="form.id ? '' : 'apiKey'">
          <el-input
            v-model="form.apiKey"
            type="password"
            show-password
            :placeholder="form.id && form.apiKeyConfigured ? '已配置，留空表示不修改' : '请输入 API Key'"
          />
        </el-form-item>
        <el-form-item label="模型 ID" prop="model">
          <el-input v-model="form.model" placeholder="例如：deepseek-chat、gpt-4.1" />
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="form.enabled" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submit">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listAiModelConfigs,
  saveAiModelConfig,
  updateAiModelConfig,
  selectAiModelConfig,
  deleteAiModelConfig
} from '@/api/ai_model_config'

const emptyForm = () => ({
  id: null,
  configName: '',
  apiUrl: '',
  apiKey: '',
  model: '',
  enabled: 1,
  apiKeyConfigured: false
})

export default {
  name: 'AiModelConfig',
  data() {
    return {
      loading: false,
      saving: false,
      configs: [],
      dialogVisible: false,
      form: emptyForm(),
      rules: {
        configName: [{ required: true, message: '请输入配置名称', trigger: 'blur' }],
        apiUrl: [
          { required: true, message: '请输入 API 地址', trigger: 'blur' },
          { pattern: /^https?:\/\//, message: '地址必须以 http:// 或 https:// 开头', trigger: 'blur' }
        ],
        apiKey: [{ required: true, message: '请输入 API Key', trigger: 'blur' }],
        model: [{ required: true, message: '请输入模型 ID', trigger: 'blur' }]
      }
    }
  },
  computed: {
    stats() {
      return {
        total: this.configs.length,
        active: this.configs.filter(item => item.enabled === 1).length,
        current: this.configs.filter(item => item.selected === 1).length,
        disabled: this.configs.filter(item => item.enabled !== 1).length
      }
    }
  },
  created() {
    this.loadConfigs()
  },
  methods: {
    async loadConfigs() {
      this.loading = true
      try {
        const res = await listAiModelConfigs()
        this.configs = (res && res.data) || []
      } finally {
        this.loading = false
      }
    },
    openCreate() {
      this.form = emptyForm()
      this.dialogVisible = true
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    },
    handleCommand(command, item) {
      if (command === 'edit') {
        this.form = { ...item, apiKey: '' }
        this.dialogVisible = true
        this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      } else {
        this.handleDelete(item)
      }
    },
    submit() {
      this.$refs.form.validate(async valid => {
        if (!valid) return
        this.saving = true
        try {
          if (this.form.id) {
            await updateAiModelConfig(this.form)
          } else {
            await saveAiModelConfig(this.form)
          }
          this.$message.success('保存成功')
          this.dialogVisible = false
          await this.loadConfigs()
        } finally {
          this.saving = false
        }
      })
    },
    async handleSelect(item) {
      await selectAiModelConfig(item.id)
      this.$message.success(`已切换为 ${item.configName}`)
      await this.loadConfigs()
    },
    async handleDelete(item) {
      await this.$confirm(`确定删除「${item.configName}」吗？`, '提示', { type: 'warning' })
      await deleteAiModelConfig(item.id)
      this.$message.success('删除成功')
      await this.loadConfigs()
    }
  }
}
</script>

<style lang="scss" scoped>
.model-config-page {
  padding-bottom: 24px;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 22px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  }
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.stat-total .stat-icon {
  background: rgba(24, 144, 255, 0.12);
  color: #1890ff;
}

.stat-active .stat-icon {
  background: rgba(82, 196, 26, 0.12);
  color: #52c41a;
}

.stat-current .stat-icon {
  background: rgba(19, 194, 194, 0.12);
  color: #13c2c2;
}

.stat-disabled .stat-icon {
  background: rgba(140, 140, 140, 0.12);
  color: #8c8c8c;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.empty-alert {
  margin-bottom: 16px;
  border-radius: 8px;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
  min-height: 120px;
}

.config-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #ebeef5;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  padding: 20px;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  }

  &.selected {
    border-color: #52c41a;
    box-shadow: 0 4px 16px rgba(82, 196, 26, 0.15);

    .config-card-icon {
      background: linear-gradient(135deg, #52c41a, #73d13d);
      color: #fff;
    }
  }

  &.disabled:not(.selected) {
    opacity: 0.75;

    .config-card-icon {
      background: #f5f5f5;
      color: #bfbfbf;
    }
  }
}

.config-card-top {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 16px;
}

.config-card-icon {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #003a8c, #13c2c2);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.config-card-meta {
  flex: 1;
  min-width: 0;
}

.config-name-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 4px;
}

.config-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.config-model {
  font-size: 13px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-more {
  flex-shrink: 0;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 6px;
  color: #909399;
  transition: background 0.2s, color 0.2s;

  &:hover {
    background: #f5f7fa;
    color: #606266;
  }
}

.config-detail {
  padding: 14px 0;
  border-top: 1px solid #f0f2f5;
  border-bottom: 1px solid #f0f2f5;
  margin-bottom: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
}

.detail-label {
  font-size: 12px;
  color: #909399;

  i {
    margin-right: 4px;
  }
}

.detail-value {
  font-size: 13px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.config-card-footer {
  display: flex;
  justify-content: flex-end;
}

.config-empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: 48px 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.config-empty-icon {
  font-size: 56px;
  color: #dcdfe6;
}

.config-empty-title {
  margin: 16px 0 8px;
  font-size: 16px;
  color: #606266;
}

.config-empty-desc {
  margin: 0;
  font-size: 13px;
  color: #909399;
}

@media (max-width: 1200px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .stats-row {
    grid-template-columns: 1fr;
  }

  .config-grid {
    grid-template-columns: 1fr;
  }
}
</style>
