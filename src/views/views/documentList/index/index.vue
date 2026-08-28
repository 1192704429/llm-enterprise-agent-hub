<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <div class="search-wrapper">
      <el-form :inline="true" :model="queryParams" class="search-form" size="small">
        <el-form-item class="search-buttons">
          <el-button @click="resetQuery">重置</el-button>
          <el-button type="primary" @click="handleQuery">查询</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-button type="primary" @click="handleAdd">新建</el-button>
      <el-button :disabled="multiple" @click="handleDeleteBatch">批量删除</el-button>
    </div>

    <!-- 数据表格 -->
    <div class="table-wrapper">
      <el-table
        v-loading="loading"
        :data="knowledgeList"
        @selection-change="handleSelectionChange"
        class="modern-table"
      >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="知识分类id" prop="knowledgeTypeId"  align="center" :show-overflow-tooltip="true" />
      <el-table-column label="知识名称" prop="name"  align="center" :show-overflow-tooltip="true" />
      <el-table-column label="文件全名。包括后缀" prop="fullFileName"  align="center" :show-overflow-tooltip="true" />
      <el-table-column label="知识大小单位kb" prop="fileSizeKb"  align="center" :show-overflow-tooltip="true" />
      <el-table-column label="知识状态：0：解析中:1：解析成功:2:解析失败" prop="status"  align="center" :show-overflow-tooltip="true" />
      <el-table-column label="是否上线" prop="online"  align="center" :show-overflow-tooltip="true" />
      <el-table-column label="创建人userid" prop="createUserId"  align="center" :show-overflow-tooltip="true" />
      <el-table-column label="创建时间" prop="createTime"  align="center" :show-overflow-tooltip="true" />
      <el-table-column label="最后更新时间" prop="updateTime"  align="center" :show-overflow-tooltip="true" />
      <el-table-column label="解析失败原因" prop="parseFalseCause"  align="center" :show-overflow-tooltip="true" />
      <el-table-column label="文件路径:全路径" prop="fileUrl"  align="center" :show-overflow-tooltip="true" />
      <el-table-column label="预览图片集合" prop="previewImageMinioSet"  align="center" :show-overflow-tooltip="true" />
      <el-table-column label="文件名后缀" prop="fileNameSuffix"  align="center" :show-overflow-tooltip="true" />
      <el-table-column label="0: 文档格式 1.IMAGE 2:PDF 3:OFFICE" prop="fileFormatType"  align="center" :show-overflow-tooltip="true" />
      <el-table-column label="是否开启向量入库" prop="vectorization"  align="center" :show-overflow-tooltip="true" />
      <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            type="text"
            style="color: #f56c6c;"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <pagination
      :total="total"
      :current-page.sync="queryParams.current"
      :page-size.sync="queryParams.size"
      :page-sizes="[5, 10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!-- 添加或修改对话框（有富文本/MD 时宽度 50%，否则 600px） -->
    <el-dialog :title="title" :visible.sync="open"  width="600px"  append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="知识分类id" prop="knowledgeTypeId">
          <el-input v-model="form.knowledgeTypeId" placeholder="请输入知识分类id" />
        </el-form-item>
        <el-form-item label="知识名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入知识名称" />
        </el-form-item>
        <el-form-item label="文件全名。包括后缀" prop="fullFileName">
          <el-input v-model="form.fullFileName" placeholder="请输入文件全名。包括后缀" />
        </el-form-item>
        <el-form-item label="知识大小单位kb" prop="fileSizeKb">
          <el-input v-model="form.fileSizeKb" placeholder="请输入知识大小单位kb" />
        </el-form-item>
        <el-form-item label="知识状态：0：解析中:1：解析成功:2:解析失败" prop="status">
          <el-input v-model="form.status" placeholder="请输入知识状态：0：解析中:1：解析成功:2:解析失败" />
        </el-form-item>
        <el-form-item label="是否上线" prop="online">
          <el-input v-model="form.online" placeholder="请输入是否上线" />
        </el-form-item>
        <el-form-item label="创建人userid" prop="createUserId">
          <el-input v-model="form.createUserId" placeholder="请输入创建人userid" />
        </el-form-item>
        <el-form-item label="解析失败原因" prop="parseFalseCause">
          <el-input v-model="form.parseFalseCause" placeholder="请输入解析失败原因" />
        </el-form-item>
        <el-form-item label="文件路径:全路径" prop="fileUrl">
          <el-input v-model="form.fileUrl" placeholder="请输入文件路径:全路径" />
        </el-form-item>
        <el-form-item label="预览图片集合" prop="previewImageMinioSet">
          <el-input v-model="form.previewImageMinioSet" placeholder="请输入预览图片集合" />
        </el-form-item>
        <el-form-item label="文件名后缀" prop="fileNameSuffix">
          <el-input v-model="form.fileNameSuffix" placeholder="请输入文件名后缀" />
        </el-form-item>
        <el-form-item label="0: 文档格式 1.IMAGE 2:PDF 3:OFFICE" prop="fileFormatType">
          <el-input v-model="form.fileFormatType" placeholder="请输入0: 文档格式 1.IMAGE 2:PDF 3:OFFICE" />
        </el-form-item>
        <el-form-item label="是否开启向量入库" prop="vectorization">
          <el-input v-model="form.vectorization" placeholder="请输入是否开启向量入库" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import {
  pageKnowledge,
  getKnowledgeById,
  saveKnowledge,
  updateKnowledge,
  deleteKnowledge,
  deleteBatchKnowledge
} from '@/api/knowledge'
import ImgUpload from '@/components/ImgUpload'
import ImagePreview from '@/components/ImagePreview'
import Pagination from '@/components/Pagination'
import BasicEditor from '@/components/BasicEditor'

export default {
  name: 'Knowledge',
  components: {
    ImgUpload,
    ImagePreview,
    Pagination,
    BasicEditor
  },
  data() {
    return {
      loading: true,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      knowledgeList: [],
      title: '',
      open: false,
      queryParams: {
        current: 1,
        size: 5
      },
      form: {},
      rules: {
        knowledgeTypeId: [
          { required: true, message: '知识分类id不能为空', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '知识名称不能为空', trigger: 'blur' }
        ],
        fullFileName: [
          { required: true, message: '文件全名。包括后缀不能为空', trigger: 'blur' }
        ],
        fileSizeKb: [
          { required: true, message: '知识大小单位kb不能为空', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '知识状态：0：解析中:1：解析成功:2:解析失败不能为空', trigger: 'blur' }
        ],
        online: [
          { required: true, message: '是否上线不能为空', trigger: 'blur' }
        ],
        createUserId: [
          { required: true, message: '创建人userid不能为空', trigger: 'blur' }
        ],
        parseFalseCause: [
          { required: true, message: '解析失败原因不能为空', trigger: 'blur' }
        ],
        fileUrl: [
          { required: true, message: '文件路径:全路径不能为空', trigger: 'blur' }
        ],
        previewImageMinioSet: [
          { required: true, message: '预览图片集合不能为空', trigger: 'blur' }
        ],
        fileNameSuffix: [
          { required: true, message: '文件名后缀不能为空', trigger: 'blur' }
        ],
        fileFormatType: [
          { required: true, message: '0: 文档格式 1.IMAGE 2:PDF 3:OFFICE不能为空', trigger: 'blur' }
        ],
        vectorization: [
          { required: true, message: '是否开启向量入库不能为空', trigger: 'blur' }
        ]
      }


    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询知识详情列表（范围查询绑定 xxxRange，传参拆成 xxxStart/xxxEnd） */
    getList() {
      this.loading = true
      const { current, size, ...rest } = this.queryParams
      const entity = { ...rest }
      pageKnowledge(current, size, entity).then(response => {
        const pageData = response.data
        this.knowledgeList = pageData.records || []
        this.total = Number(pageData.total) || 0
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    /** 枚举列展示：根据 value 取 label，无则显示原值 */
    getEnumLabel(val, map) {
      if (map == null || map[val] === undefined) return val
      return map[val]
    },
    /** 取消按钮 */
    cancel() {
      this.open = false
      this.reset()
    },
    /** 表单重置 */
    reset() {
      this.form = {}
      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.current = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams.current = 1
      this.queryParams.size = this.queryParams.size || 5
      this.handleQuery()
    },
    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加知识详情'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids[0]
      getKnowledgeById(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改知识详情'
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateKnowledge(this.form).then(response => {
              this.$message.success('修改成功')
              this.open = false
              this.getList()
            })
          } else {
            saveKnowledge(this.form).then(response => {
              this.$message.success('新增成功')
              this.open = false
              this.getList()
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids
      this.$confirm('是否确认删除编号为"' + ids + '"的数据项？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return deleteKnowledge(ids)
      }).then(() => {
        this.getList()
        this.$message.success('删除成功')
      }).catch(() => {})
    },
    /** 批量删除按钮操作 */
    handleDeleteBatch() {
      const ids = this.ids
      this.$confirm('是否确认删除选中的' + ids.length + '条数据？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return deleteBatchKnowledge(ids)
      }).then(() => {
        this.getList()
        this.$message.success('删除成功')
      }).catch(() => {})
    },
    /** 分页大小改变 */
    handleSizeChange(val) {
      this.queryParams.size = val
      this.queryParams.current = 1
      this.getList()
    },
    /** 当前页改变 */
    handleCurrentChange(val) {
      this.queryParams.current = val
      this.getList()
    }
  }
}
</script>

<style scoped lang="scss">
</style>
