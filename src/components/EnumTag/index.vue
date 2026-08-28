<template>
  <el-tag v-if="label != null && label !== ''" :type="tagType" size="small">
    {{ label }}
  </el-tag>
  <span v-else>-</span>
</template>

<script>
export default {
  name: 'EnumTag',
  props: {
    value: {
      type: [String, Number, Boolean],
      default: null
    },
    labelMap: {
      type: Object,
      default: () => ({})
    },
    typeMap: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    label() {
      return this.labelMap[this.value]
    },
    tagType() {
      return this.typeMap[this.value] || 'info'
    }
  }
}
</script>
