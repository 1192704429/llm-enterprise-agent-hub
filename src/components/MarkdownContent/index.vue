<template>
  <div class="markdown-content" :class="variantClass" v-html="html" />
</template>

<script>
import { renderMarkdown } from '@/utils/markdown'

export default {
  name: 'MarkdownContent',
  props: {
    content: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    variant: {
      type: String,
      default: 'assistant',
      validator: value => ['assistant', 'user'].includes(value)
    }
  },
  computed: {
    html() {
      const text = this.content || this.placeholder
      return renderMarkdown(text)
    },
    variantClass() {
      return `variant-${this.variant}`
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/layout/client/client-theme.scss';

.markdown-content {
  font-size: 14px;
  line-height: 1.75;
  word-break: break-word;

  ::v-deep {
    p {
      margin: 0 0 10px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    ol,
    ul {
      margin: 8px 0 10px;
      padding-left: 22px;
    }

    li {
      margin-bottom: 8px;
      line-height: 1.75;

      &:last-child {
        margin-bottom: 0;
      }

      p {
        margin: 0;
      }
    }

    code {
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 13px;
    }

    pre {
      margin: 10px 0;
      padding: 12px;
      border-radius: 8px;
      overflow-x: auto;

      code {
        padding: 0;
        background: transparent;
      }
    }

    blockquote {
      margin: 10px 0;
      padding: 8px 12px;
      border-left: 3px solid $client-color-primary-light;
      border-radius: 0 8px 8px 0;
    }

    a {
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
      font-size: 13px;
    }

    th,
    td {
      border: 1px solid rgba(0, 0, 0, 0.08);
      padding: 6px 10px;
      text-align: left;
    }

    th {
      font-weight: 600;
    }
  }

  &.variant-assistant {
    color: #4b5563;

    ::v-deep {
      p,
      li {
        color: #4b5563;
      }

      strong {
        color: $client-color-primary;
        font-weight: 700;
      }

      h1, h2, h3, h4, h5, h6 {
        margin: 12px 0 8px;
        font-weight: 700;
        line-height: 1.4;
        color: $client-color-primary;
      }

      h1 { font-size: 18px; }
      h2 { font-size: 16px; }
      h3 { font-size: 15px; }

      ol > li::marker {
        color: $client-color-primary-light;
        font-weight: 700;
      }

      ul > li::marker {
        color: $client-color-primary-light;
      }

      code {
        background: rgba(0, 58, 140, 0.06);
        color: $client-color-primary;
      }

      pre {
        background: rgba(0, 58, 140, 0.04);

        code {
          color: #374151;
        }
      }

      blockquote {
        background: rgba(19, 194, 194, 0.08);
        color: #374151;
      }

      a {
        color: $client-color-primary-light;
      }

      th {
        background: rgba(0, 58, 140, 0.04);
        color: $client-color-primary;
      }
    }
  }

  &.variant-user {
    color: rgba(255, 255, 255, 0.96);

    ::v-deep {
      p,
      li {
        color: rgba(255, 255, 255, 0.96);
      }

      strong {
        color: #fff;
        font-weight: 700;
      }

      h1, h2, h3, h4, h5, h6 {
        color: #fff;
        font-weight: 700;
      }

      code {
        background: rgba(255, 255, 255, 0.16);
        color: #fff;
      }

      a {
        color: #fff;
        text-decoration: underline;
      }
    }
  }
}
</style>
