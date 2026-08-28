<template>
  <footer class="client-footer">
    <div class="footer-inner">
      <p class="footer-text">
        © {{ currentYear }} {{ systemTitle }} · 大模型驱动，智能办公
      </p>
    </div>
  </footer>
</template>

<script>
import defaultSettings from '@/settings'

export default {
  name: 'ClientFooter',
  computed: {
    systemTitle() {
      return defaultSettings.title
    },
    currentYear() {
      return new Date().getFullYear()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../client-theme.scss';

.client-footer {
  border-top: 1px solid $client-footer-border;
  background: linear-gradient(180deg, $client-footer-bg-start 0%, $client-footer-bg-end 100%);
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 20px;
  text-align: center;
}

.footer-text {
  margin: 0;
  font-size: 12px;
  color: $client-footer-bottom-text;
}
</style>
