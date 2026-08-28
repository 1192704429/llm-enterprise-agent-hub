<template>
  <div class="app-container knowledge-page">
    <div class="stats-row">
      <div class="stat-card stat-total">
        <div class="stat-icon"><i class="el-icon-collection-tag" /></div>
        <div class="stat-body">
          <div class="stat-value">{{ typeList.length }}</div>
          <div class="stat-label">知识分类</div>
        </div>
      </div>
      <div class="stat-card stat-active">
        <div class="stat-icon"><i class="el-icon-document" /></div>
        <div class="stat-body">
          <div class="stat-value">{{ allKnowledgeTotal }}</div>
          <div class="stat-label">知识总数</div>
        </div>
      </div>
      <div class="stat-card stat-online">
        <div class="stat-icon"><i class="el-icon-upload2" /></div>
        <div class="stat-body">
          <div class="stat-value">{{ onlineCount }}</div>
          <div class="stat-label">已上线</div>
        </div>
      </div>
      <div class="stat-card stat-parsing">
        <div class="stat-icon"><i class="el-icon-loading" /></div>
        <div class="stat-body">
          <div class="stat-value">{{ parsingCount }}</div>
          <div class="stat-label">解析中</div>
        </div>
      </div>
    </div>

    <div class="knowledge-layout">
      <!-- 左侧分类 -->
      <aside class="type-panel">
        <div class="type-panel-header">
          <div class="type-panel-header-main">
            <span class="type-panel-icon"><i class="el-icon-folder-opened" /></span>
            <div>
              <div class="type-panel-title">知识分类</div>
              <div class="type-panel-subtitle">共 {{ typeList.length }} 个分类</div>
            </div>
          </div>
          <el-button type="text" class="type-add-btn" icon="el-icon-plus" @click="handleAddType">新建</el-button>
        </div>
        <div class="type-search-wrap">
          <el-input
            v-model="typeKeyword"
            placeholder="搜索分类名称"
            clearable
            size="small"
            prefix-icon="el-icon-search"
            class="type-search"
          />
        </div>
        <div v-loading="typeLoading" class="type-list-wrap">
          <div
            v-for="item in filteredTypeList"
            :key="item.isDefault ? 'default-all' : item.id"
            :class="['type-item', { active: selectedType && selectedType.id === item.id && !!selectedType.isDefault === !!item.isDefault }]"
            @click="selectType(item)"
          >
            <span class="type-item-icon">
              <i :class="item.isDefault ? 'el-icon-menu' : 'el-icon-collection-tag'" />
            </span>
            <span class="type-name" :title="item.typeName">{{ item.typeName }}</span>
            <div v-if="!item.isDefault" class="type-item-actions" @click.stop>
              <el-button type="text" icon="el-icon-edit" @click="handleEditType(item)" />
              <el-button type="text" icon="el-icon-delete" style="color: #f56c6c;" @click="handleDeleteType(item)" />
            </div>
          </div>
          <el-empty v-if="!typeLoading && !filteredTypeList.length" description="暂无匹配分类" :image-size="72" />
        </div>
      </aside>

      <!-- 右侧知识 -->
      <section class="knowledge-panel">
        <template v-if="selectedType">
          <div class="knowledge-panel-header">
            <div class="knowledge-panel-info">
              <div class="knowledge-type-badge">{{ selectedType.isDefault ? '全部知识' : '当前分类' }}</div>
              <h3 class="knowledge-panel-title">{{ selectedType.typeName }}</h3>
              <p class="knowledge-panel-desc">
                {{ selectedType.isDefault ? '展示所有分类下的知识，共' : '共' }}
                <strong>{{ total }}</strong> 条知识
              </p>
            </div>
          </div>

          <div class="knowledge-panel-body">
            <div class="search-wrapper">
              <el-form :inline="true" :model="queryParams" class="search-form" size="small">
                <el-form-item label="知识名称">
                  <el-input
                    v-model="queryParams.name"
                    placeholder="搜索知识名称"
                    clearable
                    prefix-icon="el-icon-search"
                    @keyup.enter.native="handleQuery"
                    @clear="handleQuery"
                  />
                </el-form-item>
                <el-form-item label="解析状态">
                  <el-select
                    v-model="queryParams.status"
                    placeholder="全部"
                    clearable
                    @change="handleQuery"
                  >
                    <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </el-form-item>
                <el-form-item label="上线状态">
                  <el-select
                    v-model="queryParams.online"
                    placeholder="全部"
                    clearable
                    @change="handleQuery"
                  >
                    <el-option :value="true" label="已上线" />
                    <el-option :value="false" label="未上线" />
                  </el-select>
                </el-form-item>
                <el-form-item class="search-buttons">
                  <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
                  <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
                </el-form-item>
              </el-form>
            </div>

            <div class="action-buttons">
              <el-button
                type="primary"
                icon="el-icon-plus"
                :disabled="isDefaultType(selectedType)"
                @click="handleAdd"
              >新增知识</el-button>
            </div>

            <div class="table-wrapper">
              <el-table
                ref="knowledgeTable"
                v-loading="loading"
                :data="knowledgeList"
                class="modern-table knowledge-table"
                stripe
                :row-class-name="tableRowClassName"
                style="width: 100%"
              >
              <el-table-column label="知识名称" min-width="180" header-align="center" :show-overflow-tooltip="true">
                <template slot-scope="scope">
                  <div class="knowledge-name-cell">
                    <span class="knowledge-file-icon"><i :class="getFileIcon(scope.row.fileFormatType)" /></span>
                    <span class="knowledge-name-text">{{ scope.row.name }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="文件名" prop="fullFileName" min-width="150" header-align="center" :show-overflow-tooltip="true" />
              <el-table-column label="格式" align="center" header-align="center" width="88">
                <template slot-scope="scope">
                  <enum-tag :value="scope.row.fileFormatType" :label-map="fileFormatTypeMap" :type-map="fileFormatTypeColorMap" />
                </template>
              </el-table-column>
              <el-table-column label="大小" prop="fileSizeKb" align="center" header-align="center" width="100" class-name="size-column">
                <template slot-scope="scope">
                  <span class="file-size-text">{{ formatFileSize(scope.row.fileSizeKb) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="解析状态" align="center" header-align="center" width="108">
                <template slot-scope="scope">
                  <enum-tag :value="scope.row.status" :label-map="statusEnumMap" :type-map="statusTypeMap" />
                </template>
              </el-table-column>
              <el-table-column label="上线" align="center" header-align="center" width="88">
                <template slot-scope="scope">
                  <enum-tag :value="scope.row.online" :label-map="onlineEnumMap" :type-map="onlineTypeMap" />
                </template>
              </el-table-column>
              <el-table-column label="向量入库" align="center" header-align="center" width="96">
                <template slot-scope="scope">
                  <enum-tag :value="scope.row.vectorization" :label-map="vectorizationEnumMap" :type-map="vectorizationTypeMap" />
                </template>
              </el-table-column>
              <el-table-column label="创建时间" prop="createTime" align="center" header-align="center" min-width="158" :show-overflow-tooltip="true" />
              <el-table-column label="操作" align="center" header-align="center" width="280" class-name="action-column">
                <template slot-scope="scope">
                  <div class="action-cell">
                    <el-button
                      v-if="scope.row.status === 1"
                      type="text"
                      size="small"
                      icon="el-icon-tickets"
                      class="action-btn action-chunk"
                      @click="handleOpenChunks(scope.row)"
                    >切片</el-button>
                    <el-button
                      v-if="canPublishOnline(scope.row)"
                      type="text"
                      size="small"
                      icon="el-icon-upload2"
                      class="action-btn action-publish publish-btn"
                      :loading="scope.row._publishing"
                      @click="handlePublishOnline(scope.row)"
                    >上线</el-button>
                    <el-button
                      v-if="canOffline(scope.row)"
                      type="text"
                      size="small"
                      icon="el-icon-download"
                      class="action-btn action-offline offline-btn"
                      :loading="scope.row._offlining"
                      @click="handleOffline(scope.row)"
                    >下线</el-button>
                    <el-button
                      type="text"
                      size="small"
                      icon="el-icon-delete"
                      class="action-btn action-delete danger-btn"
                      @click="handleDeleteKnowledge(scope.row)"
                    >删除</el-button>
                  </div>
                </template>
              </el-table-column>
              </el-table>
            </div>

            <pagination
              :total="total"
              :current-page.sync="queryParams.current"
              :page-size.sync="queryParams.size"
              :page-sizes="[5, 10, 20, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </template>

        <div v-else class="knowledge-empty">
          <div class="knowledge-empty-inner">
            <i class="el-icon-folder-opened knowledge-empty-icon" />
            <p class="knowledge-empty-title">请选择分类</p>
            <p class="knowledge-empty-desc">从左侧选择或新建知识分类，即可管理该分类下的知识</p>
          </div>
        </div>
      </section>
    </div>

    <!-- 分类对话框 -->
    <el-dialog
      :title="typeDialogTitle"
      :visible.sync="typeDialogOpen"
      width="480px"
      append-to-body
      destroy-on-close
    >
      <el-form ref="typeFormRef" :model="typeForm" :rules="typeRules" label-width="90px">
        <el-form-item label="分类名称" prop="typeName">
          <el-input v-model="typeForm.typeName" placeholder="请输入分类名称" maxlength="255" show-word-limit />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="typeDialogOpen = false">取消</el-button>
        <el-button type="primary" :loading="typeSubmitting" @click="submitTypeForm">确定</el-button>
      </div>
    </el-dialog>

    <!-- 新增知识对话框 -->
    <el-dialog
      title="新增知识"
      :visible.sync="knowledgeDialogOpen"
      width="640px"
      append-to-body
      destroy-on-close
      @close="resetKnowledgeForm"
    >
      <el-form ref="knowledgeFormRef" :model="knowledgeForm" :rules="knowledgeRules" label-width="100px">
        <el-form-item label="所属分类">
          <el-input :value="selectedType ? selectedType.typeName : ''" disabled />
        </el-form-item>
        <el-form-item label="上传文件" prop="fileUrl">
          <el-upload
            :action="uploadAction"
            :headers="uploadHeaders"
            :limit="1"
            :file-list="uploadFileList"
            :before-upload="handleBeforeUpload"
            :on-success="handleUploadSuccess"
            :on-remove="handleUploadRemove"
            :on-exceed="handleUploadExceed"
          >
            <el-button size="small" type="primary" icon="el-icon-upload2">选择文件</el-button>
            <div slot="tip" class="el-upload__tip">上传后将自动解析，知识名称取文件名（不含后缀）</div>
          </el-upload>
        </el-form-item>
        <el-form-item v-if="knowledgeForm.name" label="知识名称">
          <el-input :value="knowledgeForm.name" disabled />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="knowledgeDialogOpen = false">取消</el-button>
        <el-button type="primary" :loading="knowledgeSubmitting" @click="submitKnowledgeForm">确定</el-button>
      </div>
    </el-dialog>

    <!-- 切片管理对话框 -->
    <el-dialog
      :title="chunkDialogTitle"
      :visible.sync="chunkDialogOpen"
      width="920px"
      append-to-body
      destroy-on-close
      class="chunk-dialog"
      @close="resetChunkDialog"
    >
      <div class="chunk-dialog-toolbar">
        <div class="chunk-dialog-info">
          <span>共 <strong>{{ chunkTotal }}</strong> 个切片</span>
          <enum-tag
            :value="currentKnowledge && currentKnowledge.vectorization"
            :label-map="vectorizationEnumMap"
            :type-map="vectorizationTypeMap"
          />
        </div>
        <div class="chunk-dialog-actions">
          <el-input
            v-model="chunkQuery.keyword"
            placeholder="搜索切片内容"
            clearable
            size="small"
            prefix-icon="el-icon-search"
            class="chunk-search-input"
            @keyup.enter.native="handleChunkSearch"
            @clear="handleChunkSearch"
          />
          <el-button size="small" plain icon="el-icon-refresh" @click="loadChunkList">刷新</el-button>
          <el-button
            v-if="currentKnowledge && currentKnowledge.vectorization"
            size="small"
            type="primary"
            plain
            icon="el-icon-refresh-right"
            :loading="chunkReindexing"
            @click="handleReindexChunks"
          >重建向量</el-button>
        </div>
      </div>

      <el-table
        v-loading="chunkLoading"
        :data="chunkList"
        class="chunk-table"
        max-height="460"
      >
        <el-table-column label="序号" prop="orderNum" align="center" width="72" />
        <el-table-column label="切片内容" prop="chunkText" min-width="420" :show-overflow-tooltip="true" />
        <el-table-column label="更新时间" prop="updateTime" align="center" width="168" />
        <el-table-column label="操作" align="center" width="88">
          <template slot-scope="scope">
            <el-button type="text" size="small" icon="el-icon-edit" @click="handleEditChunk(scope.row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="chunk-pagination">
        <pagination
          :total="chunkTotal"
          :current-page.sync="chunkQuery.current"
          :page-size.sync="chunkQuery.size"
          :page-sizes="[5, 10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="loadChunkList"
          @current-change="loadChunkList"
        />
      </div>

      <div slot="footer">
        <el-button @click="chunkDialogOpen = false">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 编辑切片对话框 -->
    <el-dialog
      title="编辑切片"
      :visible.sync="chunkEditDialogOpen"
      width="680px"
      append-to-body
      destroy-on-close
      @close="resetChunkEdit"
    >
      <el-form ref="chunkEditFormRef" :model="chunkEditForm" :rules="chunkEditRules" label-width="88px">
        <el-form-item label="切片序号">
          <el-input :value="chunkEditForm.orderNum" disabled />
        </el-form-item>
        <el-form-item label="切片内容" prop="chunkText">
          <el-input
            v-model="chunkEditForm.chunkText"
            type="textarea"
            :rows="12"
            placeholder="请输入切片内容"
            maxlength="10000"
            show-word-limit
          />
        </el-form-item>
        <div v-if="currentKnowledge && currentKnowledge.vectorization" class="chunk-edit-tip">
          保存后将自动更新该切片对应的向量数据
        </div>
      </el-form>
      <div slot="footer">
        <el-button @click="chunkEditDialogOpen = false">取消</el-button>
        <el-button type="primary" :loading="chunkSaving" @click="submitChunkEdit">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  pageKnowledge,
  listKnowledge,
  saveKnowledge,
  deleteKnowledge,
  publishKnowledgeOnline,
  offlineKnowledge
} from '../api/knowledge'
import {
  pageKnowledgeChunks,
  updateKnowledgeChunk,
  reindexKnowledgeChunks
} from '../api/knowledge_chunk'
import {
  listKnowledgeType,
  saveKnowledgeType,
  updateKnowledgeType,
  deleteKnowledgeType
} from '../api/knowledge_type'
import Pagination from '@/components/Pagination'
import EnumTag from '@/components/EnumTag'
import { getToken } from '@/utils/auth'

const DEFAULT_TYPE = {
  id: 'all',
  typeName: '全部分类',
  isDefault: true
}

export default {
  name: 'KnowledgeManagement',
  components: {
    Pagination,
    EnumTag
  },
  data() {
    return {
      typeLoading: false,
      typeList: [],
      typeKeyword: '',
      allKnowledgeTotal: 0,
      onlineCount: 0,
      parsingCount: 0,
      selectedType: null,
      typeDialogOpen: false,
      typeDialogTitle: '',
      typeSubmitting: false,
      typeForm: {},
      typeRules: {
        typeName: [{ required: true, message: '分类名称不能为空', trigger: 'blur' }]
      },
      loading: false,
      knowledgeList: [],
      total: 0,
      queryParams: {
        current: 1,
        size: 10,
        knowledgeTypeId: null,
        name: '',
        status: null,
        online: null
      },
      knowledgeDialogOpen: false,
      knowledgeSubmitting: false,
      knowledgeForm: {},
      uploadFileList: [],
      knowledgeRules: {
        fileUrl: [{ required: true, message: '请上传文件', trigger: 'change' }]
      },
      statusOptions: [
        { value: 0, label: '解析中' },
        { value: 1, label: '解析成功' },
        { value: 2, label: '解析失败' }
      ],
      statusEnumMap: {
        0: '解析中',
        1: '解析成功',
        2: '解析失败'
      },
      statusTypeMap: {
        0: 'warning',
        1: 'success',
        2: 'danger'
      },
      onlineEnumMap: {
        true: '已上线',
        false: '未上线'
      },
      onlineTypeMap: {
        true: 'success',
        false: 'info'
      },
      vectorizationEnumMap: {
        true: '已开启',
        false: '未开启'
      },
      vectorizationTypeMap: {
        true: 'success',
        false: 'info'
      },
      fileFormatTypeMap: {
        0: '文档',
        1: '图片',
        2: 'PDF',
        3: 'Office'
      },
      fileFormatTypeColorMap: {
        0: 'info',
        1: 'success',
        2: 'danger',
        3: 'warning'
      },
      pollTimer: null,
      chunkDialogOpen: false,
      chunkDialogTitle: '切片管理',
      chunkLoading: false,
      chunkReindexing: false,
      chunkSaving: false,
      currentKnowledge: null,
      chunkList: [],
      chunkTotal: 0,
      chunkQuery: {
        current: 1,
        size: 10,
        keyword: ''
      },
      chunkEditDialogOpen: false,
      chunkEditForm: {},
      chunkEditRules: {
        chunkText: [{ required: true, message: '切片内容不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    filteredTypeList() {
      const keyword = (this.typeKeyword || '').trim().toLowerCase()
      if (!keyword) {
        return [DEFAULT_TYPE, ...this.typeList]
      }
      const result = []
      if ('全部分类'.includes(keyword)) {
        result.push(DEFAULT_TYPE)
      }
      this.typeList.forEach(item => {
        if ((item.typeName || '').toLowerCase().includes(keyword)) {
          result.push(item)
        }
      })
      return result
    },
    uploadAction() {
      return process.env.VUE_APP_BASE_API + '/upload/file/url'
    },
    uploadHeaders() {
      return {
        Authorization: getToken()
      }
    }
  },
  created() {
    this.loadTypeList()
    this.loadStats()
  },
  beforeDestroy() {
    this.stopPolling()
  },
  methods: {
    isDefaultType(type) {
      return !!(type && type.isDefault)
    },
    buildKnowledgeQuery() {
      const { current, size, name, status, online } = this.queryParams
      const payload = { name, status, online }
      if (!this.isDefaultType(this.selectedType)) {
        payload.knowledgeTypeId = this.selectedType.id
      }
      return { current, size, payload }
    },
    loadStats() {
      listKnowledge({}).then(response => {
        const list = response.data || []
        this.allKnowledgeTotal = list.length
        this.onlineCount = list.filter(item => item.online === true).length
        this.parsingCount = list.filter(item => item.status === 0).length
      }).catch(() => {})
    },
    loadTypeList() {
      this.typeLoading = true
      listKnowledgeType({}).then(response => {
        this.typeList = response.data || []
        this.typeLoading = false
        const current = this.selectedType
        if (current && this.isDefaultType(current)) {
          this.selectType(DEFAULT_TYPE)
          return
        }
        if (current && current.id) {
          const matched = this.typeList.find(item => item.id === current.id)
          if (matched) {
            this.selectType(matched)
            return
          }
        }
        this.selectType(DEFAULT_TYPE)
      }).catch(() => {
        this.typeLoading = false
      })
    },
    selectType(item) {
      this.selectedType = item
      this.queryParams.current = 1
      this.queryParams.knowledgeTypeId = this.isDefaultType(item) ? null : item.id
      this.getList()
    },
    handleAddType() {
      this.typeForm = {}
      this.typeDialogTitle = '新建分类'
      this.typeDialogOpen = true
    },
    handleEditType(item) {
      this.typeForm = { ...item }
      this.typeDialogTitle = '修改分类'
      this.typeDialogOpen = true
    },
    submitTypeForm() {
      this.$refs.typeFormRef.validate(valid => {
        if (!valid) {
          return
        }
        this.typeSubmitting = true
        const request = this.typeForm.id ? updateKnowledgeType(this.typeForm) : saveKnowledgeType(this.typeForm)
        request.then(() => {
          this.$message.success(this.typeForm.id ? '修改成功' : '新增成功')
          this.typeDialogOpen = false
          this.loadTypeList()
        }).finally(() => {
          this.typeSubmitting = false
        })
      })
    },
    handleDeleteType(item) {
      if (this.isDefaultType(item)) {
        return
      }
      this.$confirm(`确认删除分类「${item.typeName}」吗？`, '提示', {
        type: 'warning'
      }).then(() => {
        deleteKnowledgeType(item.id).then(() => {
          this.$message.success('删除成功')
          if (this.selectedType && this.selectedType.id === item.id) {
            this.selectedType = DEFAULT_TYPE
          }
          this.loadTypeList()
        })
      }).catch(() => {})
    },
    getList() {
      if (!this.selectedType) {
        this.knowledgeList = []
        this.total = 0
        return
      }
      this.loading = true
      const { current, size, payload } = this.buildKnowledgeQuery()
      pageKnowledge(current, size, payload).then(response => {
        const pageData = response.data || {}
        this.knowledgeList = pageData.records || []
        this.total = Number(pageData.total) || 0
        this.syncPolling()
        this.layoutTable()
      }).finally(() => {
        this.loading = false
      })
    },
    syncPolling() {
      const hasParsing = this.knowledgeList.some(item => item.status === 0)
      if (hasParsing) {
        this.startPolling()
      } else {
        this.stopPolling()
      }
    },
    startPolling() {
      if (this.pollTimer) {
        return
      }
      this.pollTimer = setInterval(() => {
        if (!this.selectedType || this.loading) {
          return
        }
        const { current, size, payload } = this.buildKnowledgeQuery()
        pageKnowledge(current, size, payload).then(response => {
          const pageData = response.data || {}
          this.knowledgeList = pageData.records || []
          this.total = Number(pageData.total) || 0
          if (!this.knowledgeList.some(item => item.status === 0)) {
            this.stopPolling()
            this.loadStats()
          }
          this.layoutTable()
        })
      }, 5000)
    },
    stopPolling() {
      if (this.pollTimer) {
        clearInterval(this.pollTimer)
        this.pollTimer = null
      }
    },
    handleQuery() {
      this.queryParams.current = 1
      this.getList()
    },
    resetQuery() {
      this.queryParams.name = ''
      this.queryParams.status = null
      this.queryParams.online = null
      this.handleQuery()
    },
    handleSizeChange() {
      this.getList()
    },
    handleCurrentChange() {
      this.getList()
    },
    resetKnowledgeForm() {
      this.knowledgeForm = {}
      this.uploadFileList = []
    },
    handleAdd() {
      if (this.isDefaultType(this.selectedType)) {
        this.$message.warning('请先选择具体分类后再新增知识')
        return
      }
      this.knowledgeForm = {
        knowledgeTypeId: this.selectedType.id,
        vectorization: true,
        status: 0
      }
      this.uploadFileList = []
      this.knowledgeDialogOpen = true
    },
    handleBeforeUpload(file) {
      const ext = this.getFileSuffix(file.name)
      const allowed = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp']
      if (!allowed.includes(ext)) {
        this.$message.error('不支持的文件格式')
        return false
      }
      this.$set(this.knowledgeForm, 'name', this.getNameWithoutSuffix(file.name))
      this.$set(this.knowledgeForm, 'fullFileName', file.name)
      this.$set(this.knowledgeForm, 'fileNameSuffix', ext)
      this.$set(this.knowledgeForm, 'fileSizeKb', Number((file.size / 1024).toFixed(2)))
      this.$set(this.knowledgeForm, 'fileFormatType', this.detectFileFormatType(ext))
      return true
    },
    handleUploadSuccess(response, file) {
      if (response.code !== 200) {
        this.$message.error(response.msg || '上传失败')
        this.uploadFileList = []
        return
      }
      this.$set(this.knowledgeForm, 'fileUrl', response.data)
      this.uploadFileList = [{ name: file.name, url: response.data }]
      this.$refs.knowledgeFormRef && this.$refs.knowledgeFormRef.validateField('fileUrl')
    },
    handleUploadRemove() {
      this.$set(this.knowledgeForm, 'fileUrl', '')
      this.$set(this.knowledgeForm, 'fullFileName', '')
      this.$set(this.knowledgeForm, 'fileNameSuffix', '')
      this.$set(this.knowledgeForm, 'fileSizeKb', null)
      this.$set(this.knowledgeForm, 'name', '')
      this.uploadFileList = []
    },
    handleUploadExceed() {
      this.$message.warning('只能上传一个文件，请先删除已上传文件')
    },
    submitKnowledgeForm() {
      this.$refs.knowledgeFormRef.validate(valid => {
        if (!valid) {
          return
        }
        this.knowledgeSubmitting = true
        const payload = {
          ...this.knowledgeForm,
          knowledgeTypeId: this.selectedType.id
        }
        saveKnowledge(payload).then(() => {
          this.$message.success('新增成功，正在解析')
          this.knowledgeDialogOpen = false
          this.getList()
          this.loadStats()
        }).finally(() => {
          this.knowledgeSubmitting = false
        })
      })
    },
    getFileSuffix(fileName) {
      if (!fileName || fileName.indexOf('.') === -1) {
        return ''
      }
      return fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase()
    },
    getNameWithoutSuffix(fileName) {
      if (!fileName) {
        return ''
      }
      const dotIndex = fileName.lastIndexOf('.')
      return dotIndex > 0 ? fileName.substring(0, dotIndex) : fileName
    },
    detectFileFormatType(suffix) {
      const imageTypes = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp']
      const officeTypes = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx']
      if (suffix === 'pdf') {
        return 2
      }
      if (imageTypes.includes(suffix)) {
        return 1
      }
      if (officeTypes.includes(suffix)) {
        return 3
      }
      return 0
    },
    formatFileSize(size) {
      if (size == null || size === '') {
        return '-'
      }
      return Number(size).toFixed(2) + ' KB'
    },
    tableRowClassName({ row }) {
      if (row.status === 2) {
        return 'row-failed'
      }
      if (row.status === 0) {
        return 'row-parsing'
      }
      return ''
    },
    layoutTable() {
      this.$nextTick(() => {
        this.$refs.knowledgeTable && this.$refs.knowledgeTable.doLayout()
      })
    },
    getFileIcon(fileFormatType) {
      const iconMap = {
        0: 'el-icon-document',
        1: 'el-icon-picture-outline',
        2: 'el-icon-reading',
        3: 'el-icon-folder-opened'
      }
      return iconMap[fileFormatType] || 'el-icon-document'
    },
    canPublishOnline(row) {
      return row.status === 1 && !row.online
    },
    canOffline(row) {
      return row.status === 1 && row.online === true
    },
    handlePublishOnline(row) {
      this.$confirm(`确认将「${row.name}」上线吗？`, '提示', {
        type: 'warning'
      }).then(() => {
        this.$set(row, '_publishing', true)
        publishKnowledgeOnline(row.id).then(() => {
          this.$message.success('上线成功')
          this.getList()
          this.loadStats()
        }).finally(() => {
          this.$set(row, '_publishing', false)
        })
      }).catch(() => {})
    },
    handleOffline(row) {
      this.$confirm(`确认将「${row.name}」下线吗？下线后智能办公 Agent 将不再检索该资料。`, '提示', {
        type: 'warning'
      }).then(() => {
        this.$set(row, '_offlining', true)
        offlineKnowledge(row.id).then(() => {
          this.$message.success('下线成功')
          this.getList()
          this.loadStats()
        }).finally(() => {
          this.$set(row, '_offlining', false)
        })
      }).catch(() => {})
    },
    handleDeleteKnowledge(row) {
      this.$confirm(`确认删除知识「${row.name}」吗？删除后不可恢复。`, '提示', {
        type: 'warning'
      }).then(() => {
        deleteKnowledge(row.id).then(() => {
          this.$message.success('删除成功')
          this.getList()
          this.loadStats()
        })
      }).catch(() => {})
    },
    handleOpenChunks(row) {
      this.currentKnowledge = { ...row }
      this.chunkDialogTitle = `切片管理 - ${row.name}`
      this.chunkQuery = {
        current: 1,
        size: 10,
        keyword: ''
      }
      this.chunkDialogOpen = true
      this.loadChunkList()
    },
    loadChunkList() {
      if (!this.currentKnowledge || !this.currentKnowledge.id) {
        return
      }
      this.chunkLoading = true
      pageKnowledgeChunks(
        this.currentKnowledge.id,
        this.chunkQuery.current,
        this.chunkQuery.size,
        this.chunkQuery.keyword
      ).then(response => {
        const pageData = response.data || {}
        this.chunkList = pageData.records || []
        this.chunkTotal = Number(pageData.total) || 0
      }).finally(() => {
        this.chunkLoading = false
      })
    },
    handleChunkSearch() {
      this.chunkQuery.current = 1
      this.loadChunkList()
    },
    handleEditChunk(row) {
      this.chunkEditForm = {
        id: row.id,
        orderNum: row.orderNum,
        chunkText: row.chunkText
      }
      this.chunkEditDialogOpen = true
    },
    submitChunkEdit() {
      this.$refs.chunkEditFormRef.validate(valid => {
        if (!valid || !this.currentKnowledge) {
          return
        }
        this.chunkSaving = true
        updateKnowledgeChunk(this.currentKnowledge.id, this.chunkEditForm.id, {
          chunkText: this.chunkEditForm.chunkText
        }).then(() => {
          this.$message.success('切片更新成功')
          this.chunkEditDialogOpen = false
          this.loadChunkList()
        }).finally(() => {
          this.chunkSaving = false
        })
      })
    },
    handleReindexChunks() {
      if (!this.currentKnowledge) {
        return
      }
      this.$confirm('确认重建该知识的全部分片向量吗？', '提示', {
        type: 'warning'
      }).then(() => {
        this.chunkReindexing = true
        reindexKnowledgeChunks(this.currentKnowledge.id).then(response => {
          this.$message.success(response.msg || '向量重建成功')
        }).finally(() => {
          this.chunkReindexing = false
        })
      }).catch(() => {})
    },
    resetChunkDialog() {
      this.currentKnowledge = null
      this.chunkList = []
      this.chunkTotal = 0
      this.chunkQuery = {
        current: 1,
        size: 10,
        keyword: ''
      }
      this.chunkDialogTitle = '切片管理'
    },
    resetChunkEdit() {
      this.chunkEditForm = {}
    }
  }
}
</script>

<style scoped lang="scss">
$primary: #1890ff;
$primary-light: #e6f7ff;
$border: #e4e7ed;
$text-main: #303133;

.knowledge-page {
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
  background: rgba(24, 144, 255, 0.12);
  color: #1890ff;
}

.stat-online .stat-icon {
  background: rgba(82, 196, 26, 0.12);
  color: #52c41a;
}

.stat-parsing .stat-icon {
  background: rgba(250, 173, 20, 0.12);
  color: #faad14;
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

.knowledge-layout {
  display: flex;
  gap: 20px;
  align-items: stretch;
}

.type-panel {
  width: 280px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.type-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 16px;
  background: linear-gradient(135deg, #003a8c 0%, #1890ff 55%, #13c2c2 100%);
  color: #fff;
}

.type-panel-header-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.type-panel-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.type-panel-title {
  font-size: 16px;
  font-weight: 600;
}

.type-panel-subtitle {
  margin-top: 4px;
  font-size: 12px;
  opacity: 0.85;
}

.type-add-btn {
  color: #fff !important;
  padding: 0 8px;
}

.type-search-wrap {
  padding: 14px 14px 0;
}

.type-search {
  ::v-deep .el-input__inner {
    border-radius: 8px;
    border-color: $border;
    background: #fafbfc;
  }
}

.type-list-wrap {
  flex: 1;
  overflow-y: auto;
  padding: 10px 10px 14px;
  min-height: 240px;
}

.type-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
  padding: 11px 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.22s ease;
  border: 1px solid transparent;

  &:hover {
    background: #f5f9ff;
    border-color: rgba($primary, 0.15);

    .type-item-actions {
      opacity: 1;
    }
  }

  &.active {
    background: $primary-light;
    border-color: rgba($primary, 0.35);

    .type-item-icon {
      background: $primary;
      color: #fff;
    }

    .type-name {
      color: $primary;
      font-weight: 600;
    }
  }
}

.type-item-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #f0f2f5;
  color: #606266;
  display: flex;
  align-items: center;
  justify-content: center;
}

.type-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: $text-main;
  font-size: 14px;
}

.type-item-actions {
  opacity: 0;
  transition: opacity 0.2s;

  .el-button {
    padding: 0 4px;
  }
}

.knowledge-panel {
  flex: 1;
  min-width: 0;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  overflow: visible;
}

.knowledge-panel-header {
  padding: 20px 24px 0;
}

.knowledge-panel-body {
  padding: 16px 24px 20px;
}

.knowledge-type-badge {
  display: inline-block;
  padding: 2px 10px;
  margin-bottom: 8px;
  font-size: 12px;
  color: $primary;
  background: $primary-light;
  border-radius: 20px;
}

.knowledge-panel-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: $text-main;
}

.knowledge-panel-desc {
  margin: 8px 0 0;
  color: #909399;
  font-size: 13px;
}

.knowledge-name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.knowledge-file-icon {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: #f0f7ff;
  color: $primary;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.knowledge-name-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
  color: $text-main;
}

.file-size-text {
  color: #606266;
  font-size: 13px;
}

.publish-btn {
  color: #67c23a !important;

  &:hover {
    color: #85ce61 !important;
  }
}

.offline-btn {
  color: #e6a23c !important;

  &:hover {
    color: #ebb563 !important;
  }
}

.danger-btn {
  color: #f56c6c !important;

  &:hover {
    color: #f78989 !important;
  }
}

.action-cell {
  display: grid;
  grid-template-columns: repeat(3, 68px);
  align-items: center;
  justify-content: center;
  width: 204px;
  margin: 0 auto;
}

::v-deep .action-btn {
  padding: 0 !important;
  margin: 0 !important;
  font-size: 13px;
  line-height: 28px;
  height: 28px;
  border-radius: 4px;
  background: transparent !important;
  justify-self: center;

  &::after {
    display: none !important;
  }

  &.action-chunk {
    grid-column: 1;
  }

  &.action-publish,
  &.action-offline {
    grid-column: 2;
  }

  &.action-delete {
    grid-column: 3;
  }
}

::v-deep .knowledge-table {
  .row-parsing {
    td {
      background-color: #fffbf0 !important;
    }

    &:hover > td {
      background-color: #fff8e6 !important;
    }
  }

  .row-failed {
    td {
      background-color: #fef5f5 !important;
    }

    &:hover > td {
      background-color: #fdeeee !important;
    }
  }

  .action-column .cell {
    padding: 0 12px !important;
    overflow: visible;
    text-align: center;
  }

  .size-column .cell {
    white-space: nowrap;
  }
}

.knowledge-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 420px;
}

.knowledge-empty-inner {
  text-align: center;
  color: #909399;
}

.knowledge-empty-icon {
  font-size: 64px;
  color: #dcdfe6;
}

.knowledge-empty-title {
  margin: 16px 0 8px;
  font-size: 18px;
  color: #606266;
}

.knowledge-empty-desc {
  margin: 0;
  font-size: 14px;
}

.chunk-dialog-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.chunk-dialog-info {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #606266;
  font-size: 14px;
}

.chunk-dialog-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.chunk-search-input {
  width: 220px;
}

.chunk-table {
  width: 100%;
}

.chunk-pagination {
  margin-top: 16px;
}

.chunk-edit-tip {
  margin: -8px 0 0 88px;
  font-size: 12px;
  color: #909399;
}

@media (max-width: 1200px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 992px) {
  .knowledge-layout {
    flex-direction: column;
  }

  .type-panel {
    width: 100%;
  }

  .stats-row {
    grid-template-columns: 1fr;
  }
}
</style>
