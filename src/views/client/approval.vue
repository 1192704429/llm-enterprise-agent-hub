<template>
  <div class="office-page">
    <header class="office-header">
      <div>
        <h1>我的审批</h1>
        <p>处理待办事项，查看本人发起的审批进度</p>
      </div>
    </header>

    <div class="office-stats-row">
      <div class="office-stat-item">
        <div class="office-stat-item__num">{{ pendingList.length }}</div>
        <div class="office-stat-item__text">待我审批</div>
      </div>
      <div class="office-stat-item">
        <div class="office-stat-item__num">{{ submittedList.length }}</div>
        <div class="office-stat-item__text">我发起的</div>
      </div>
      <div class="office-stat-item">
        <div class="office-stat-item__num">{{ doneCount }}</div>
        <div class="office-stat-item__text">已完结</div>
      </div>
    </div>

    <section class="office-content">
      <div class="office-toolbar">
        <div class="office-tabs">
          <button type="button" class="office-tabs__item" :class="{ active: activeTab === 'pending' }" @click="switchTab('pending')">
            待我审批<span v-if="pendingList.length" class="badge">{{ pendingList.length }}</span>
          </button>
          <button type="button" class="office-tabs__item" :class="{ active: activeTab === 'submitted' }" @click="switchTab('submitted')">
            我发起的
          </button>
        </div>
        <el-select
          v-if="activeTab === 'submitted'"
          v-model="submittedStatus"
          clearable
          placeholder="状态筛选"
          size="small"
          style="width: 130px"
          @change="loadSubmitted"
        >
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </div>

      <div v-loading="loading" class="office-list office-list--approval">
        <!-- 待我审批 -->
        <template v-if="activeTab === 'pending'">
          <div class="office-list__head desktop-only">
            <span>标题</span>
            <span>单号</span>
            <span>类型</span>
            <span>当前节点</span>
            <span>提交时间</span>
            <span>操作</span>
          </div>
          <div
            v-for="item in pendingList"
            :key="item.taskId"
            class="office-list__row clickable"
            @click="openDetail(item.instanceId, item.taskId)"
          >
            <div class="col-main desktop-only">
              <div class="title">{{ item.title }}</div>
            </div>
            <span class="col-muted desktop-only">{{ item.instanceNo }}</span>
            <span class="desktop-only"><span class="type-tag">{{ bizTypeLabel(item.bizType) }}</span></span>
            <span class="desktop-only"><span class="status-tag pending">{{ item.nodeName }}</span></span>
            <span class="col-muted desktop-only">{{ formatTime(item.submitTime) }}</span>
            <span class="col-actions desktop-only">
              <el-button type="text" size="small">处理</el-button>
            </span>

            <div class="mobile-only" style="width:100%">
              <div class="mobile-card__top">
                <div>
                  <div class="mobile-card__title">{{ item.title }}</div>
                  <div class="mobile-card__sub">{{ item.instanceNo }}</div>
                </div>
                <span class="status-tag pending">{{ item.nodeName }}</span>
              </div>
              <div class="mobile-card__info">
                <span><i class="el-icon-collection-tag" /> {{ bizTypeLabel(item.bizType) }}</span>
                <span><i class="el-icon-time" /> {{ formatTime(item.submitTime) }}</span>
              </div>
            </div>
          </div>
          <div v-if="!loading && !pendingList.length" class="office-empty">
            <i class="el-icon-circle-check" />
            <p>暂无待办审批</p>
          </div>
        </template>

        <!-- 我发起的 -->
        <template v-else>
          <div class="office-list__head desktop-only">
            <span>标题</span>
            <span>单号</span>
            <span>类型</span>
            <span>当前节点</span>
            <span>提交时间</span>
            <span>状态</span>
          </div>
          <div
            v-for="item in submittedList"
            :key="item.id"
            class="office-list__row clickable"
            @click="openDetail(item.id)"
          >
            <div class="col-main desktop-only">
              <div class="title">{{ item.title }}</div>
            </div>
            <span class="col-muted desktop-only">{{ item.instanceNo }}</span>
            <span class="desktop-only"><span class="type-tag">请假</span></span>
            <span class="col-muted desktop-only">{{ item.currentNodeName || '—' }}</span>
            <span class="col-muted desktop-only">{{ formatTime(item.submitTime) }}</span>
            <span class="desktop-only"><span class="status-tag" :class="statusClass(item.status)">{{ statusLabel(item.status) }}</span></span>

            <div class="mobile-only" style="width:100%">
              <div class="mobile-card__top">
                <div>
                  <div class="mobile-card__title">{{ item.title }}</div>
                  <div class="mobile-card__sub">{{ item.instanceNo }}</div>
                </div>
                <span class="status-tag" :class="statusClass(item.status)">{{ statusLabel(item.status) }}</span>
              </div>
              <div class="mobile-card__info">
                <span><i class="el-icon-position" /> {{ item.currentNodeName || '—' }}</span>
                <span><i class="el-icon-time" /> {{ formatTime(item.submitTime) }}</span>
              </div>
            </div>
          </div>
          <div v-if="!loading && !submittedList.length" class="office-empty">
            <i class="el-icon-document" />
            <p>暂无审批记录</p>
          </div>
        </template>
      </div>
    </section>

    <el-dialog title="审批详情" :visible.sync="detailOpen" width="640px" append-to-body custom-class="office-dialog">
      <template v-if="detail.instance">
        <div class="detail-grid">
          <div class="detail-cell">
            <div class="detail-cell__label">审批单号</div>
            <div class="detail-cell__value">{{ detail.instance.instanceNo }}</div>
          </div>
          <div class="detail-cell">
            <div class="detail-cell__label">状态</div>
            <div class="detail-cell__value">
              <span class="status-tag" :class="statusClass(detail.instance.status)">{{ statusLabel(detail.instance.status) }}</span>
            </div>
          </div>
          <div class="detail-cell full">
            <div class="detail-cell__label">标题</div>
            <div class="detail-cell__value">{{ detail.instance.title }}</div>
          </div>
          <div class="detail-cell">
            <div class="detail-cell__label">当前节点</div>
            <div class="detail-cell__value">{{ detail.instance.currentNodeName || '—' }}</div>
          </div>
          <div class="detail-cell">
            <div class="detail-cell__label">提交时间</div>
            <div class="detail-cell__value">{{ formatTime(detail.instance.submitTime) }}</div>
          </div>
        </div>

        <h4 class="section-label">审批流程</h4>
        <div class="flow-steps">
          <div
            v-for="task in detail.tasks || []"
            :key="task.id"
            class="flow-step"
            :class="flowClass(task)"
          >
            <div class="flow-step__dot">{{ task.nodeOrder }}</div>
            <div class="flow-step__body">
              <div class="flow-step__name">{{ task.nodeName }}</div>
              <div class="flow-step__state">{{ actionLabel(task.action) }}</div>
              <div v-if="task.comment" class="flow-step__comment">{{ task.comment }}</div>
              <div v-if="task.action === 0 && task.id === currentTaskId" class="flow-step__btns">
                <el-button type="primary" size="small" @click="handleApprove(task, true)">同意</el-button>
                <el-button size="small" @click="handleApprove(task, false)">驳回</el-button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {
  listPendingApprovals,
  listSubmittedApprovals,
  getApprovalDetail,
  approveTask
} from '@/api/client-office'

export default {
  name: 'ClientApproval',
  data() {
    return {
      loading: false,
      activeTab: 'pending',
      submittedStatus: null,
      pendingList: [],
      submittedList: [],
      detailOpen: false,
      detail: { instance: null, tasks: [] },
      currentTaskId: null,
      statusOptions: [
        { value: 0, label: '进行中' },
        { value: 1, label: '已通过' },
        { value: 2, label: '已驳回' },
        { value: 3, label: '已撤销' }
      ]
    }
  },
  computed: {
    doneCount() {
      return this.submittedList.filter(i => i.status === 1 || i.status === 2).length
    }
  },
  created() {
    this.loadPending()
    this.loadSubmitted()
  },
  methods: {
    switchTab(tab) {
      this.activeTab = tab
      tab === 'pending' ? this.loadPending() : this.loadSubmitted()
    },
    loadPending() {
      this.loading = true
      listPendingApprovals().then(res => {
        this.pendingList = res.data || []
      }).finally(() => { this.loading = false })
    },
    loadSubmitted() {
      listSubmittedApprovals(this.submittedStatus).then(res => {
        this.submittedList = res.data || []
      })
    },
    formatTime(v) {
      if (!v) return '-'
      return String(v).replace('T', ' ').slice(0, 16)
    },
    bizTypeLabel(v) {
      return v === 'leave' ? '请假' : (v || '其他')
    },
    statusLabel(v) {
      const item = this.statusOptions.find(i => i.value === v)
      return item ? item.label : '-'
    },
    statusClass(v) {
      if (v === 1) return 'success'
      if (v === 2) return 'danger'
      if (v === 0) return 'pending'
      return 'neutral'
    },
    actionLabel(v) {
      if (v === 0) return '等待处理'
      if (v === 1) return '已同意'
      if (v === 2) return '已驳回'
      return '-'
    },
    flowClass(task) {
      if (task.action === 1) return 'done'
      if (task.action === 2) return 'reject'
      if (task.id === this.currentTaskId) return 'active'
      return ''
    },
    openDetail(instanceId, taskId) {
      this.currentTaskId = taskId || null
      getApprovalDetail(instanceId).then(res => {
        this.detail = res.data || { instance: null, tasks: [] }
        this.detailOpen = true
      })
    },
    handleApprove(task, approved) {
      this.$prompt('审批意见（可选）', approved ? '同意' : '驳回', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: '请输入意见'
      }).then(({ value }) => {
        approveTask(task.id, { approved, comment: value }).then(() => {
          this.$message.success('处理成功')
          this.openDetail(this.detail.instance.id, null)
          this.loadPending()
          this.loadSubmitted()
        })
      }).catch(() => {})
    }
  }
}
</script>

<style lang="scss" scoped>
@import './styles/client-office.scss';

@media (max-width: 768px) {
  .office-list__row {
    display: block;
  }

  .office-toolbar {
    flex-direction: column;
    align-items: stretch;
    padding: 12px 14px;

    .office-tabs {
      width: 100%;
      border-bottom: 1px solid #e4e7ed;
    }

    .el-select {
      width: 100% !important;
    }
  }
}
</style>
