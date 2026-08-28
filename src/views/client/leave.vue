<template>
  <div class="office-page">
    <header class="office-header">
      <div>
        <h1>我的请假</h1>
        <p>提交后自动进入审批，直属主管与 HR 依次处理</p>
      </div>
      <el-button type="primary" icon="el-icon-plus" @click="handleAdd">提交请假</el-button>
    </header>

    <div class="office-stats-row">
      <div class="office-stat-item">
        <div class="office-stat-item__num">{{ stats.total }}</div>
        <div class="office-stat-item__text">全部</div>
      </div>
      <div class="office-stat-item">
        <div class="office-stat-item__num">{{ stats.pending }}</div>
        <div class="office-stat-item__text">审批中</div>
      </div>
      <div class="office-stat-item">
        <div class="office-stat-item__num">{{ stats.approved }}</div>
        <div class="office-stat-item__text">已通过</div>
      </div>
    </div>

    <section class="office-content">
      <div class="office-toolbar">
        <div class="office-toolbar__left">
          <span class="office-toolbar__hint">共 {{ list.length }} 条记录</span>
        </div>
        <el-select v-model="queryStatus" clearable placeholder="状态筛选" size="small" style="width: 130px" @change="loadList">
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </div>

      <div v-loading="loading" class="office-list office-list--leave">
        <div class="office-list__head desktop-only">
          <span>类型</span>
          <span>单号</span>
          <span>时间范围</span>
          <span>天数</span>
          <span>状态</span>
          <span>事由</span>
        </div>

        <div v-for="item in list" :key="item.id" class="office-list__row">
          <!-- PC -->
          <span class="desktop-only"><span class="type-tag">{{ leaveTypeLabel(item.leaveType) }}</span></span>
          <span class="col-muted desktop-only">{{ item.requestNo }}</span>
          <span class="col-muted desktop-only">{{ formatTime(item.startTime) }} ~ {{ formatTime(item.endTime) }}</span>
          <span class="desktop-only">{{ item.durationDays }} 天</span>
          <span class="desktop-only"><span class="status-tag" :class="statusClass(item.status)">{{ statusLabel(item.status) }}</span></span>
          <span class="col-reason desktop-only" :title="item.reason">{{ item.reason || '—' }}</span>

          <!-- Mobile -->
          <div class="mobile-only mobile-card__wrap" style="width:100%">
            <div class="mobile-card__top">
              <div>
                <div class="mobile-card__title">{{ leaveTypeLabel(item.leaveType) }} · {{ item.durationDays }} 天</div>
                <div class="mobile-card__sub">{{ item.requestNo }}</div>
              </div>
              <span class="status-tag" :class="statusClass(item.status)">{{ statusLabel(item.status) }}</span>
            </div>
            <div class="mobile-card__info">
              <span><i class="el-icon-time" /> {{ formatTime(item.startTime) }} ~ {{ formatTime(item.endTime) }}</span>
            </div>
            <div v-if="item.reason" class="mobile-card__reason">{{ item.reason }}</div>
          </div>
        </div>

        <div v-if="!loading && !list.length" class="office-empty">
          <i class="el-icon-document" />
          <p>暂无请假记录</p>
        </div>
      </div>
    </section>

    <el-dialog title="提交请假" :visible.sync="open" width="520px" append-to-body custom-class="office-dialog">
      <el-form ref="form" :model="form" :rules="rules" label-width="88px">
        <el-form-item label="请假类型" prop="leaveType">
          <el-select v-model="form.leaveType" placeholder="请选择" style="width:100%">
            <el-option v-for="item in leaveTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker v-model="form.startTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" placeholder="选择开始时间" style="width:100%" />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker v-model="form.endTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" placeholder="选择结束时间" style="width:100%" />
        </el-form-item>
        <el-form-item label="请假事由" prop="reason">
          <el-input v-model="form.reason" type="textarea" :rows="4" placeholder="请简要说明原因" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="open = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listMyLeave, submitLeave } from '@/api/client-office'

export default {
  name: 'ClientLeave',
  data() {
    return {
      loading: false,
      submitting: false,
      open: false,
      queryStatus: null,
      list: [],
      allList: [],
      form: {},
      statusOptions: [
        { value: 0, label: '草稿' },
        { value: 1, label: '审批中' },
        { value: 2, label: '已通过' },
        { value: 3, label: '已驳回' },
        { value: 4, label: '已撤销' }
      ],
      leaveTypeOptions: [
        { value: 1, label: '事假' },
        { value: 2, label: '病假' },
        { value: 3, label: '年假' },
        { value: 4, label: '调休' },
        { value: 5, label: '婚假' },
        { value: 6, label: '产假' }
      ],
      rules: {
        leaveType: [{ required: true, message: '请选择请假类型', trigger: 'change' }],
        startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
        endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
        reason: [{ required: true, message: '请填写请假事由', trigger: 'blur' }]
      }
    }
  },
  computed: {
    stats() {
      return {
        total: this.allList.length,
        pending: this.allList.filter(i => i.status === 1).length,
        approved: this.allList.filter(i => i.status === 2).length
      }
    }
  },
  created() {
    this.loadStats()
    this.loadList()
  },
  methods: {
    loadStats() {
      listMyLeave(null).then(res => { this.allList = res.data || [] })
    },
    loadList() {
      this.loading = true
      listMyLeave(this.queryStatus).then(res => {
        this.list = res.data || []
      }).finally(() => { this.loading = false })
    },
    formatTime(v) {
      if (!v) return '-'
      return String(v).replace('T', ' ').slice(0, 16)
    },
    leaveTypeLabel(v) {
      const item = this.leaveTypeOptions.find(i => i.value === v)
      return item ? item.label : '-'
    },
    statusLabel(v) {
      const item = this.statusOptions.find(i => i.value === v)
      return item ? item.label : '-'
    },
    statusClass(v) {
      if (v === 2) return 'success'
      if (v === 3) return 'danger'
      if (v === 1) return 'pending'
      return 'neutral'
    },
    handleAdd() {
      this.form = { leaveType: 1 }
      this.open = true
      this.$nextTick(() => { if (this.$refs.form) this.$refs.form.clearValidate() })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.submitting = true
        submitLeave(this.form).then(() => {
          this.$message.success('提交成功')
          this.open = false
          this.loadStats()
          this.loadList()
        }).finally(() => { this.submitting = false })
      })
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
}
</style>
