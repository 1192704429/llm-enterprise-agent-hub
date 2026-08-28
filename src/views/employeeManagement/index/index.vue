<template>
  <div class="app-container employee-page">
    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card stat-total">
        <div class="stat-icon"><i class="el-icon-s-custom" /></div>
        <div class="stat-body">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">员工总数</div>
        </div>
      </div>
      <div class="stat-card stat-active">
        <div class="stat-icon"><i class="el-icon-circle-check" /></div>
        <div class="stat-body">
          <div class="stat-value">{{ stats.active }}</div>
          <div class="stat-label">正常状态</div>
        </div>
      </div>
      <div class="stat-card stat-active">
        <div class="stat-icon"><i class="el-icon-s-check" /></div>
        <div class="stat-body">
          <div class="stat-value">{{ stats.formal }}</div>
          <div class="stat-label">正式员工</div>
        </div>
      </div>
    </div>

    <!-- 搜索 -->
    <div class="search-wrapper">
      <el-form :inline="true" :model="queryParams" class="search-form" size="small">
        <el-form-item label="工号">
          <el-input v-model="queryParams.employeeNo" placeholder="请输入工号" clearable @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item label="员工账号">
          <el-input
            v-model="queryParams.username"
            placeholder="请输入登录账号"
            clearable
            prefix-icon="el-icon-user"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input
            v-model="queryParams.nickname"
            placeholder="请输入昵称"
            clearable
            prefix-icon="el-icon-postcard"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input
            v-model="queryParams.phone"
            placeholder="请输入手机号"
            clearable
            prefix-icon="el-icon-phone"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="queryParams.gender" placeholder="全部" clearable>
            <el-option v-for="item in genderOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
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

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新增员工</el-button>
      <el-button :disabled="multiple" icon="el-icon-delete" @click="handleDeleteBatch">批量删除</el-button>
    </div>

    <!-- 表格 -->
    <div class="table-wrapper">
      <el-table
        v-loading="loading"
        :data="employeeList"
        class="modern-table employee-table"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="48" align="center" />
        <el-table-column label="员工" min-width="200" header-align="center">
          <template slot-scope="scope">
            <div class="employee-cell">
              <el-avatar
                :size="42"
                :src="scope.row.avatar"
                class="employee-avatar"
              >
                {{ getAvatarText(scope.row.nickname || scope.row.username) }}
              </el-avatar>
              <div class="employee-info">
                <div class="employee-name">{{ scope.row.nickname || '-' }}</div>
                <div class="employee-account">@{{ scope.row.username || '-' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="工号" prop="employeeNo" align="center" min-width="120" :show-overflow-tooltip="true" />
        <el-table-column label="岗位" prop="jobTitle" align="center" min-width="120" :show-overflow-tooltip="true" />
        <el-table-column label="手机号" prop="phone" align="center" min-width="130" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span class="contact-text">{{ scope.row.phone || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="邮箱" prop="email" align="center" min-width="160" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span class="contact-text">{{ scope.row.email || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="性别" align="center" width="88">
          <template slot-scope="scope">
            <enum-tag :value="scope.row.gender" :label-map="genderEnumMap" :type-map="genderTypeMap" />
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" width="96">
          <template slot-scope="scope">
            <enum-tag :value="scope.row.status" :label-map="statusEnumMap" :type-map="statusTypeMap" />
          </template>
        </el-table-column>
        <el-table-column label="登录次数" prop="loginCount" align="center" width="96">
          <template slot-scope="scope">
            <span class="count-badge">{{ scope.row.loginCount != null ? scope.row.loginCount : 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="最后登录" prop="lastLoginTime" align="center" min-width="158" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span class="time-text">{{ scope.row.lastLoginTime || '从未登录' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" align="center" min-width="158" :show-overflow-tooltip="true" />
        <el-table-column label="操作" align="center" width="160" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">编辑</el-button>
            <el-button type="text" style="color: #f56c6c;" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <pagination
      :total="total"
      :current-page.sync="queryParams.current"
      :page-size.sync="queryParams.size"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!-- 新增/编辑对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="640px" append-to-body class="employee-dialog">
      <el-form ref="form" :model="form" :rules="rules" label-width="96px" class="employee-form">
        <div class="form-section">
          <div class="form-section-title">基本信息</div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="员工账号" prop="username">
                <el-input v-model="form.username" placeholder="请输入登录账号" :disabled="!!form.id" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="工号" prop="employeeNo">
                <el-input v-model="form.employeeNo" placeholder="留空可自动生成" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="昵称" prop="nickname">
                <el-input v-model="form.nickname" placeholder="请输入昵称" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="真实姓名" prop="realName">
                <el-input v-model="form.realName" placeholder="请输入真实姓名" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item :label="form.id ? '新密码' : '登录密码'" :prop="form.id ? '' : 'password'">
                <el-input
                  v-model="form.password"
                  type="password"
                  show-password
                  :placeholder="form.id ? '不修改请留空' : '请输入登录密码'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="岗位" prop="jobTitle">
                <el-input v-model="form.jobTitle" placeholder="请输入岗位" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="部门" prop="departmentId">
                <el-select v-model="form.departmentId" clearable placeholder="请选择" style="width: 100%;">
                  <el-option v-for="d in departmentOptions" :key="d.id" :label="d.deptName" :value="d.id" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="头像" prop="avatar">
            <img-upload v-model="form.avatar" :limit="1" />
          </el-form-item>
        </div>
        <div class="form-section">
          <div class="form-section-title">联系方式</div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="手机号" prop="phone">
                <el-input v-model="form.phone" placeholder="请输入手机号" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="form.email" placeholder="请输入邮箱" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="办公地点" prop="officeLocation">
                <el-input v-model="form.officeLocation" placeholder="楼层/工位/分机" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="直属上级" prop="managerId">
                <el-select
                  v-model="form.managerId"
                  clearable
                  filterable
                  placeholder="请选择直属上级"
                  style="width: 100%;"
                >
                  <el-option
                    v-for="item in filteredManagerOptions"
                    :key="item.id"
                    :label="formatManagerLabel(item)"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <div class="form-section">
          <div class="form-section-title">其他设置</div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="性别" prop="gender">
                <el-radio-group v-model="form.gender">
                  <el-radio v-for="item in genderOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
                </el-radio-group>
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
          <el-form-item label="备注" prop="remark">
            <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注信息" />
          </el-form-item>
        </div>
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
  pageAppUser,
  getAppUserStats,
  getAppUserById,
  listAppUserOptions,
  saveAppUser,
  updateAppUser,
  deleteAppUser,
  deleteBatchAppUser
} from '@/api/app_user'
import { listDepartment } from '@/api/department'
import Pagination from '@/components/Pagination'
import ImgUpload from '@/components/ImgUpload'
import EnumTag from '@/components/EnumTag'

export default {
  name: 'CustomerManagement',
  components: {
    Pagination,
    ImgUpload,
    EnumTag
  },
  data() {
    return {
      loading: false,
      ids: [],
      multiple: true,
      total: 0,
      employeeList: [],
      title: '',
      open: false,
      stats: {
        total: 0,
        active: 0,
        disabled: 0,
        vip: 0,
        formal: 0
      },
      queryParams: {
        current: 1,
        size: 10,
        employeeNo: null,
        username: null,
        nickname: null,
        phone: null,
        gender: null,
        status: null
      },
      form: {},
      genderOptions: [
        { value: 0, label: '未知' },
        { value: 1, label: '男' },
        { value: 2, label: '女' }
      ],
      memberLevelOptions: [],
      statusOptions: [
        { value: 1, label: '正常' },
        { value: 0, label: '禁用' }
      ],
      genderEnumMap: { 0: '未知', 1: '男', 2: '女' },
      genderTypeMap: { 0: 'info', 1: '', 2: 'danger' },
      memberLevelEnumMap: {},
      memberLevelTypeMap: {},
      statusEnumMap: { 1: '正常', 0: '禁用' },
      statusTypeMap: { 1: 'success', 0: 'info' },
      departmentOptions: [],
      managerOptions: [],
      rules: {
        username: [
          { required: true, message: '登录账号不能为空', trigger: 'blur' },
          { min: 2, max: 32, message: '长度在 2 到 32 个字符', trigger: 'blur' }
        ],
        nickname: [
          { required: true, message: '昵称不能为空', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '登录密码不能为空', trigger: 'blur' },
          { min: 6, max: 32, message: '密码长度在 6 到 32 个字符', trigger: 'blur' }
        ],
        phone: [
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ],
        email: [
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        gender: [
          { required: false, trigger: 'change' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    filteredManagerOptions() {
      const selfId = this.form.id
      if (!selfId) {
        return this.managerOptions
      }
      return this.managerOptions.filter(item => item.id !== selfId)
    }
  },
  created() {
    this.getList()
    this.loadStats()
    this.loadDepartments()
    this.loadManagerOptions()
  },
  methods: {
    loadManagerOptions() {
      listAppUserOptions().then(res => {
        this.managerOptions = res.data || []
      }).catch(() => {})
    },
    formatManagerLabel(item) {
      const name = item.realName || item.nickname || item.username || '-'
      const parts = [name]
      if (item.jobTitle) {
        parts.push(item.jobTitle)
      }
      if (item.employeeNo) {
        parts.push(item.employeeNo)
      }
      return parts.join(' · ')
    },
    loadDepartments() {
      listDepartment({ status: 1 }).then(res => {
        this.departmentOptions = res.data || []
      }).catch(() => {})
    },
    getAvatarText(name) {
      if (!name) return '?'
      return name.charAt(0).toUpperCase()
    },
    loadStats() {
      getAppUserStats().then(response => {
        const data = response.data || {}
        this.stats.total = data.total || 0
        this.stats.active = data.active || 0
        this.stats.disabled = data.disabled || 0
        this.stats.formal = data.formal || 0
      }).catch(() => {})
    },
    getList() {
      this.loading = true
      const { current, size, ...rest } = this.queryParams
      pageAppUser(current, size, rest).then(response => {
        const pageData = response.data
        this.employeeList = pageData.records || []
        this.total = Number(pageData.total) || 0
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    cancel() {
      this.open = false
      this.reset()
    },
    reset() {
      this.form = {}
      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }
    },
    handleQuery() {
      this.queryParams.current = 1
      this.getList()
    },
    resetQuery() {
      this.queryParams = {
        current: 1,
        size: this.queryParams.size || 10,
        employeeNo: null,
        username: null,
        nickname: null,
        phone: null,
        gender: null,
        status: null
      }
      this.handleQuery()
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.multiple = !selection.length
    },
    handleAdd() {
      this.reset()
      this.form = {
        gender: 0,
        status: 1,
        employeeType: 0,
        ownerId: 1
      }
      this.open = true
      this.title = '新增员工'
    },
    handleUpdate(row) {
      this.reset()
      const id = row.id
      getAppUserById(id).then(response => {
        this.form = { ...response.data, password: '' }
        this.open = true
        this.title = '编辑员工'
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        const payload = { ...this.form }
        if (payload.id && !payload.password) {
          delete payload.password
        }
        const request = payload.id ? updateAppUser(payload) : saveAppUser(payload)
        request.then(() => {
          this.$message.success(payload.id ? '修改成功' : '新增成功')
          this.open = false
          this.getList()
          this.loadStats()
          this.loadManagerOptions()
        })
      })
    },
    handleDelete(row) {
      const id = row.id
      this.$confirm('是否确认删除员工「' + (row.nickname || row.username) + '」？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => deleteAppUser(id)).then(() => {
        this.getList()
        this.loadStats()
        this.$message.success('删除成功')
      }).catch(() => {})
    },
    handleDeleteBatch() {
      const ids = this.ids
      this.$confirm('是否确认删除选中的 ' + ids.length + ' 名员工？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => deleteBatchAppUser(ids)).then(() => {
        this.getList()
        this.loadStats()
        this.$message.success('删除成功')
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
.employee-page {
  padding-bottom: 24px;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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

.stat-vip .stat-icon {
  background: rgba(250, 173, 20, 0.12);
  color: #faad14;
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

.employee-cell {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 0;
}

.employee-avatar {
  flex-shrink: 0;
  background: linear-gradient(135deg, #003a8c, #13c2c2);
  color: #fff;
  font-weight: 600;
}

.employee-info {
  min-width: 0;
  text-align: left;
}

.employee-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
}

.employee-account {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.contact-text {
  color: #606266;
}

.count-badge {
  display: inline-block;
  min-width: 28px;
  padding: 2px 8px;
  border-radius: 10px;
  background: #f0f5ff;
  color: #1890ff;
  font-size: 13px;
  font-weight: 500;
}

.time-text {
  color: #909399;
  font-size: 13px;
}

.form-section {
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
}

.form-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-left: 10px;
  border-left: 3px solid #1890ff;
}

@media (max-width: 992px) {
  .stats-row {
    grid-template-columns: 1fr;
  }
}
</style>
