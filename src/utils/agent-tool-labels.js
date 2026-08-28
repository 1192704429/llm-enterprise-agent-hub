/** 工具名称 -> 前端展示标签 */
export const TOOL_LABEL_MAP = {
  generate_announcement: '公告生成',
  query_announcements: '公告查询',
  get_announcement_detail: '公告详情',
  query_my_profile: '我的档案',
  query_employee: '员工查询',
  query_my_leave_requests: '请假查询',
  submit_leave_request: '提交请假',
  query_my_pending_approvals: '待办审批',
  query_my_submitted_approvals: '我发起的审批',
  get_approval_detail: '审批详情',
  query_my_schedule: '日程查询',
  query_knowledge_files: '文件查询'
}

export function getToolLabel(toolName) {
  if (!toolName) return '工具调用'
  return TOOL_LABEL_MAP[toolName] || '工具调用'
}
