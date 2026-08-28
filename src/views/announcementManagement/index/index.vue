<template>
  <div class="app-container announcement-page">
    <div class="stats-row">
      <div class="stat-card stat-total">
        <div class="stat-icon"><i class="el-icon-document" /></div>
        <div class="stat-body">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">公告总数</div>
        </div>
      </div>
      <div class="stat-card stat-active">
        <div class="stat-icon"><i class="el-icon-circle-check" /></div>
        <div class="stat-body">
          <div class="stat-value">{{ stats.published }}</div>
          <div class="stat-label">已发布</div>
        </div>
      </div>
      <div class="stat-card stat-draft">
        <div class="stat-icon"><i class="el-icon-edit-outline" /></div>
        <div class="stat-body">
          <div class="stat-value">{{ stats.draft }}</div>
          <div class="stat-label">草稿</div>
        </div>
      </div>
      <div class="stat-card stat-disabled">
        <div class="stat-icon"><i class="el-icon-remove-outline" /></div>
        <div class="stat-body">
          <div class="stat-value">{{ stats.offline }}</div>
          <div class="stat-label">已下线</div>
        </div>
      </div>
    </div>

    <div class="search-wrapper">
      <el-form :inline="true" :model="queryParams" class="search-form" size="small">
        <el-form-item label="标题">
          <el-input
            v-model="queryParams.title"
            placeholder="请输入公告标题"
            clearable
            prefix-icon="el-icon-search"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable>
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item class="search-buttons">
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="action-buttons">
      <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新增公告</el-button>
    </div>

    <div class="table-wrapper">
      <el-table v-loading="loading" :data="announcementList" class="modern-table" stripe>
        <el-table-column label="标题" prop="title" min-width="220" header-align="center" :show-overflow-tooltip="true" />
        <el-table-column label="状态" align="center" width="100">
          <template slot-scope="scope">
            <enum-tag :value="scope.row.status" :label-map="statusEnumMap" :type-map="statusTypeMap" />
          </template>
        </el-table-column>
        <el-table-column label="优先级" prop="priority" align="center" width="90" />
        <el-table-column label="发布时间" prop="publishTime" align="center" min-width="160" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span class="time-text">{{ scope.row.publishTime || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="过期时间" prop="expireTime" align="center" min-width="160" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span class="time-text">{{ scope.row.expireTime || '长期有效' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="更新时间" prop="updateTime" align="center" min-width="160" :show-overflow-tooltip="true" />
        <el-table-column label="操作" align="center" width="220" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">编辑</el-button>
            <el-button
              v-if="scope.row.status !== 1"
              type="text"
              style="color: #67c23a;"
              icon="el-icon-upload2"
              @click="handlePublish(scope.row)"
            >发布</el-button>
            <el-button
              v-if="scope.row.status === 1"
              type="text"
              style="color: #e6a23c;"
              icon="el-icon-download"
              @click="handleOffline(scope.row)"
            >下线</el-button>
            <el-button type="text" style="color: #f56c6c;" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <pagination
      :total="total"
      :current-page.sync="queryParams.current"
      :page-size.sync="queryParams.size"
      :page-sizes="[10, 20, 50]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <el-dialog :title="title" :visible.sync="open" width="720px" append-to-body class="announcement-dialog">
      <el-form ref="form" :model="form" :rules="rules" label-width="96px">
        <el-form-item label="公告标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入公告标题" maxlength="200" show-word-limit />
        </el-form-item>
        <el-form-item label="公告内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="8"
            placeholder="请输入公告内容"
            maxlength="5000"
            show-word-limit
          />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-input-number v-model="form.priority" :min="0" :max="999" controls-position="right" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio v-for="item in statusOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="过期时间">
          <el-date-picker
            v-model="form.expireTime"
            type="datetime"
            placeholder="留空表示长期有效"
            value-format="yyyy-MM-dd HH:mm:ss"
            style="width: 100%;"
            clearable
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  pageAnnouncement,
  getAnnouncementStats,
  getAnnouncementById,
  saveAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  publishAnnouncement,
  offlineAnnouncement
} from '@/api/announcement'
import Pagination from '@/components/Pagination'
import EnumTag from '@/components/EnumTag'

export default {
  name: 'AnnouncementManagement',
  components: { Pagination, EnumTag },
  data() {
    return {
      loading: false,
      total: 0,
      announcementList: [],
      title: '',
      open: false,
      stats: { total: 0, published: 0, draft: 0, offline: 0 },
      queryParams: {
        current: 1,
        size: 10,
        title: null,
        status: null
      },
      form: {},
      statusOptions: [
        { value: 0, label: '草稿' },
        { value: 1, label: '已发布' },
        { value: 2, label: '已下线' }
      ],
      statusEnumMap: { 0: '草稿', 1: '已发布', 2: '已下线' },
      statusTypeMap: { 0: 'info', 1: 'success', 2: 'warning' },
      rules: {
        title: [{ required: true, message: '公告标题不能为空', trigger: 'blur' }],
        content: [{ required: true, message: '公告内容不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '请选择状态', trigger: 'change' }]
      }
    }
  },
  created() {
    this.getList()
    this.loadStats()
  },
  methods: {
    loadStats() {
      getAnnouncementStats().then(res => {
        this.stats = { ...this.stats, ...(res.data || {}) }
      }).catch(() => {})
    },
    getList() {
      this.loading = true
      const { current, size, ...params } = this.queryParams
      pageAnnouncement(current, size, params).then(res => {
        this.announcementList = (res.data && res.data.records) || []
        this.total = (res.data && res.data.total) || 0
      }).finally(() => {
        this.loading = false
      })
    },
    handleQuery() {
      this.queryParams.current = 1
      this.getList()
    },
    resetQuery() {
      this.queryParams = {
        current: 1,
        size: this.queryParams.size,
        title: null,
        status: null
      }
      this.getList()
    },
    reset() {
      this.form = {
        id: null,
        title: '',
        content: '',
        status: 0,
        priority: 0,
        expireTime: null
      }
      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }
    },
    cancel() {
      this.open = false
      this.reset()
    },
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '新增公告'
    },
    handleUpdate(row) {
      this.reset()
      getAnnouncementById(row.id).then(res => {
        this.form = { ...res.data }
        this.open = true
        this.title = '编辑公告'
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        const payload = { ...this.form }
        const request = payload.id ? updateAnnouncement(payload) : saveAnnouncement(payload)
        request.then(() => {
          this.$message.success(payload.id ? '修改成功' : '新增成功')
          this.open = false
          this.getList()
          this.loadStats()
        })
      })
    },
    handlePublish(row) {
      this.$confirm('确认发布该公告？发布后员工端可见。', '提示', { type: 'warning' })
        .then(() => publishAnnouncement(row.id))
        .then(() => {
          this.$message.success('发布成功')
          this.getList()
          this.loadStats()
        }).catch(() => {})
    },
    handleOffline(row) {
      this.$confirm('确认下线该公告？下线后员工端不可见。', '提示', { type: 'warning' })
        .then(() => offlineAnnouncement(row.id))
        .then(() => {
          this.$message.success('已下线')
          this.getList()
          this.loadStats()
        }).catch(() => {})
    },
    handleDelete(row) {
      this.$confirm('是否确认删除公告「' + row.title + '」？', '提示', { type: 'warning' })
        .then(() => deleteAnnouncement(row.id))
        .then(() => {
          this.$message.success('删除成功')
          this.getList()
          this.loadStats()
        }).catch(() => {})
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
.announcement-page {
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
  padding: 20px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #fff;
}

.stat-total .stat-icon { background: linear-gradient(135deg, #667eea, #764ba2); }
.stat-active .stat-icon { background: linear-gradient(135deg, #11998e, #38ef7d); }
.stat-draft .stat-icon { background: linear-gradient(135deg, #f093fb, #f5576c); }
.stat-disabled .stat-icon { background: linear-gradient(135deg, #868f96, #596164); }

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

.time-text {
  color: #606266;
  font-size: 13px;
}

@media (max-width: 1200px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
