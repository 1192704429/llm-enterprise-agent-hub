<template>
  <div class="office-page">
    <header class="office-header">
      <div>
        <h1>我的日程</h1>
        <p>个人安排与团队可见日程，支持新建与编辑</p>
      </div>
      <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新建日程</el-button>
    </header>

    <div class="office-stats-row">
      <div class="office-stat-item">
        <div class="office-stat-item__num">{{ list.length }}</div>
        <div class="office-stat-item__text">日程总数</div>
      </div>
      <div class="office-stat-item">
        <div class="office-stat-item__num">{{ mineCount }}</div>
        <div class="office-stat-item__text">我创建的</div>
      </div>
      <div class="office-stat-item">
        <div class="office-stat-item__num">{{ groupedList.length }}</div>
        <div class="office-stat-item__text">涉及天数</div>
      </div>
    </div>

    <section class="office-content">
      <div class="office-toolbar">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          size="small"
          value-format="yyyy-MM-dd"
          range-separator="至"
          start-placeholder="开始"
          end-placeholder="结束"
          style="width: 260px"
          @change="loadList"
        />
        <span class="office-toolbar__hint">{{ dateRangeText }}</span>
      </div>

      <div v-loading="loading" class="office-panel__body">
        <div v-for="group in groupedList" :key="group.date" class="office-date-block">
          <div class="office-date-block__title">
            {{ group.date }}
            <span class="weekday">{{ group.weekday }}</span>
            <span class="count">{{ group.items.length }} 项</span>
          </div>

          <div class="office-list office-list--schedule">
            <div class="office-list__head desktop-only">
              <span>标题</span>
              <span>时间</span>
              <span>地点</span>
              <span>类型</span>
              <span>可见</span>
              <span>操作</span>
            </div>

            <div v-for="item in group.items" :key="item.id" class="office-list__row">
              <div class="col-main desktop-only">
                <div class="title">{{ item.title }}</div>
                <div v-if="isMine(item)" class="sub">我创建的</div>
              </div>
              <span class="col-muted desktop-only">{{ formatTimeRange(item.startTime, item.endTime) }}</span>
              <span class="col-muted desktop-only">{{ item.location || '—' }}</span>
              <span class="desktop-only"><span class="type-tag">{{ eventTypeLabel(item.eventType) }}</span></span>
              <span class="desktop-only"><span class="type-tag">{{ visibilityLabel(item.visibility) }}</span></span>
              <span class="col-actions desktop-only">
                <template v-if="isMine(item)">
                  <el-button type="text" size="small" @click="handleUpdate(item)">编辑</el-button>
                  <el-button type="text" size="small" style="color:#f56c6c" @click="handleDelete(item)">删除</el-button>
                </template>
                <span v-else class="col-muted">—</span>
              </span>

              <div class="mobile-only" style="width:100%">
                <div class="mobile-card__top">
                  <div>
                    <div class="mobile-card__title">{{ item.title }}</div>
                    <div class="mobile-card__sub">{{ formatTimeRange(item.startTime, item.endTime) }}</div>
                  </div>
                  <span class="type-tag">{{ eventTypeLabel(item.eventType) }}</span>
                </div>
                <div class="mobile-card__info">
                  <span><i class="el-icon-location-outline" /> {{ item.location || '未设置' }}</span>
                  <span><i class="el-icon-view" /> {{ visibilityLabel(item.visibility) }}</span>
                </div>
                <div v-if="item.description" class="mobile-card__reason">{{ item.description }}</div>
                <div v-if="isMine(item)" class="mobile-card__actions">
                  <el-button size="mini" plain @click="handleUpdate(item)">编辑</el-button>
                  <el-button size="mini" plain @click="handleDelete(item)">删除</el-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!loading && !groupedList.length" class="office-empty">
          <i class="el-icon-date" />
          <p>该时间范围内暂无日程</p>
        </div>
      </div>
    </section>

    <el-dialog :title="dialogTitle" :visible.sync="open" width="520px" append-to-body custom-class="office-dialog">
      <el-form ref="form" :model="form" :rules="rules" label-width="88px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="日程标题" />
        </el-form-item>
        <el-form-item label="类型" prop="eventType">
          <el-select v-model="form.eventType" style="width:100%">
            <el-option v-for="item in eventTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker v-model="form.startTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" style="width:100%" />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker v-model="form.endTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" style="width:100%" />
        </el-form-item>
        <el-form-item label="地点">
          <el-input v-model="form.location" placeholder="会议室 / 地址" />
        </el-form-item>
        <el-form-item label="可见范围">
          <el-select v-model="form.visibility" style="width:100%">
            <el-option v-for="item in visibilityOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="补充说明（可选）" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="open = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { listMySchedule, saveMySchedule, updateMySchedule, deleteMySchedule } from '@/api/client-office'

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

export default {
  name: 'ClientSchedule',
  data() {
    const today = new Date()
    const end = new Date(today)
    end.setDate(end.getDate() + 30)
    const fmt = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    return {
      loading: false,
      submitting: false,
      open: false,
      dialogTitle: '',
      dateRange: [fmt(today), fmt(end)],
      list: [],
      form: {},
      eventTypeOptions: [
        { value: 1, label: '会议' },
        { value: 2, label: '提醒' },
        { value: 3, label: '出差' },
        { value: 4, label: '培训' },
        { value: 5, label: '其他' }
      ],
      visibilityOptions: [
        { value: 0, label: '仅本人' },
        { value: 1, label: '部门' },
        { value: 2, label: '全员' }
      ],
      rules: {
        title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
        eventType: [{ required: true, message: '请选择类型', trigger: 'change' }],
        startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
        endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
      }
    }
  },
  computed: {
    ...mapGetters(['clientId']),
    mineCount() {
      return this.list.filter(i => this.isMine(i)).length
    },
    dateRangeText() {
      if (!this.dateRange || this.dateRange.length !== 2) return ''
      return `${this.dateRange[0]} 至 ${this.dateRange[1]}`
    },
    groupedList() {
      const map = new Map()
      this.list.forEach(item => {
        const dateKey = String(item.startTime || '').slice(0, 10)
        if (!dateKey) return
        if (!map.has(dateKey)) {
          const d = new Date(dateKey.replace(/-/g, '/'))
          map.set(dateKey, { date: dateKey, weekday: WEEKDAYS[d.getDay()], items: [] })
        }
        map.get(dateKey).items.push(item)
      })
      return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date))
    }
  },
  created() {
    this.loadList()
  },
  methods: {
    loadList() {
      if (!this.dateRange || this.dateRange.length !== 2) return
      this.loading = true
      listMySchedule({ startDate: this.dateRange[0], endDate: this.dateRange[1] })
        .then(res => { this.list = res.data || [] })
        .finally(() => { this.loading = false })
    },
    isMine(item) {
      return this.clientId && Number(item.organizerUserId) === Number(this.clientId)
    },
    formatTimeRange(start, end) {
      const s = String(start || '').replace('T', ' ').slice(11, 16)
      const e = String(end || '').replace('T', ' ').slice(11, 16)
      return s && e ? `${s} - ${e}` : '-'
    },
    eventTypeLabel(v) {
      const item = this.eventTypeOptions.find(i => i.value === v)
      return item ? item.label : '-'
    },
    visibilityLabel(v) {
      const item = this.visibilityOptions.find(i => i.value === v)
      return item ? item.label : '-'
    },
    handleAdd() {
      this.form = { eventType: 1, visibility: 0, status: 0, allDay: false }
      this.dialogTitle = '新建日程'
      this.open = true
    },
    handleUpdate(row) {
      this.form = { ...row }
      this.dialogTitle = '编辑日程'
      this.open = true
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.submitting = true
        const req = this.form.id ? updateMySchedule(this.form) : saveMySchedule(this.form)
        req.then(() => {
          this.$message.success('保存成功')
          this.open = false
          this.loadList()
        }).finally(() => { this.submitting = false })
      })
    },
    handleDelete(row) {
      this.$confirm('确认删除该日程？', '提示', { type: 'warning' }).then(() => {
        deleteMySchedule(row.id).then(() => {
          this.$message.success('删除成功')
          this.loadList()
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

  .office-toolbar__hint {
    display: none;
  }
}
</style>
