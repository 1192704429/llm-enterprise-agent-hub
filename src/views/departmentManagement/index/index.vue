<template>
  <div class="app-container">
    <el-form :inline="true" :model="queryParams" size="small" class="search-form">
      <el-form-item label="部门编码">
        <el-input v-model="queryParams.deptCode" clearable placeholder="编码" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="部门名称">
        <el-input v-model="queryParams.deptName" clearable placeholder="名称" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <div class="mb8">
      <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新增部门</el-button>
    </div>
    <el-table v-loading="loading" :data="list" stripe>
      <el-table-column prop="deptCode" label="编码" width="120" align="center" />
      <el-table-column prop="deptName" label="部门名称" min-width="140" />
      <el-table-column prop="parentId" label="上级部门ID" width="110" align="center" />
      <el-table-column prop="leaderUserId" label="负责人ID" width="100" align="center" />
      <el-table-column prop="sort" label="排序" width="80" align="center" />
      <el-table-column label="状态" width="90" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'" size="mini">
            {{ scope.row.status === 1 ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="updateTime" label="更新时间" min-width="160" align="center" />
      <el-table-column label="操作" width="160" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button type="text" style="color:#f56c6c" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :total="total"
      :current-page.sync="queryParams.current"
      :page-size.sync="queryParams.size"
      @size-change="getList"
      @current-change="getList"
    />
    <el-dialog :title="dialogTitle" :visible.sync="open" width="520px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="部门编码" prop="deptCode">
          <el-input v-model="form.deptCode" placeholder="如 RD" />
        </el-form-item>
        <el-form-item label="部门名称" prop="deptName">
          <el-input v-model="form.deptName" />
        </el-form-item>
        <el-form-item label="上级部门ID">
          <el-input-number v-model="form.parentId" :min="0" controls-position="right" style="width:100%" />
        </el-form-item>
        <el-form-item label="负责人ID">
          <el-input-number v-model="form.leaderUserId" :min="1" controls-position="right" style="width:100%" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" controls-position="right" style="width:100%" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="open = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import { pageDepartment, saveDepartment, updateDepartment, deleteDepartment } from '@/api/department'

export default {
  name: 'DepartmentManagement',
  components: { Pagination },
  data() {
    return {
      loading: false,
      list: [],
      total: 0,
      open: false,
      dialogTitle: '',
      queryParams: { current: 1, size: 10, deptCode: null, deptName: null },
      form: {},
      rules: {
        deptCode: [{ required: true, message: '请输入部门编码', trigger: 'blur' }],
        deptName: [{ required: true, message: '请输入部门名称', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      const { current, size, ...rest } = this.queryParams
      pageDepartment(current, size, rest).then(res => {
        this.list = (res.data && res.data.records) || []
        this.total = Number((res.data && res.data.total) || 0)
      }).finally(() => { this.loading = false })
    },
    handleQuery() {
      this.queryParams.current = 1
      this.getList()
    },
    resetQuery() {
      this.queryParams = { current: 1, size: 10, deptCode: null, deptName: null }
      this.getList()
    },
    handleAdd() {
      this.form = { status: 1, sort: 0 }
      this.dialogTitle = '新增部门'
      this.open = true
    },
    handleUpdate(row) {
      this.form = { ...row }
      this.dialogTitle = '编辑部门'
      this.open = true
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        const req = this.form.id ? updateDepartment(this.form) : saveDepartment(this.form)
        req.then(() => {
          this.$message.success('保存成功')
          this.open = false
          this.getList()
        })
      })
    },
    handleDelete(row) {
      this.$confirm('确认删除该部门？', '提示', { type: 'warning' }).then(() => {
        deleteDepartment(row.id).then(() => {
          this.$message.success('删除成功')
          this.getList()
        })
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.mb8 { margin-bottom: 12px; }
</style>
