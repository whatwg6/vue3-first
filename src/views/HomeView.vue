<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { onBeforeRouteLeave, RouterLink } from 'vue-router'

const STORAGE_KEY = 'vue-demo-feedback'
const feedbackTypes = [
  { value: 'suggestion', label: '功能建议' },
  { value: 'bug', label: '问题反馈' },
  { value: 'other', label: '其他' },
]
const message = ref('')

function loadFeedback() {
  const emptyFeedback = { title: '', category: 'suggestion', content: '' }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return emptyFeedback

    const feedback = JSON.parse(stored)
    if (
      typeof feedback?.title !== 'string' ||
      typeof feedback?.content !== 'string' ||
      !feedbackTypes.some((type) => type.value === feedback?.category)
    ) {
      throw new Error('Invalid feedback')
    }

    return { title: feedback.title, category: feedback.category, content: feedback.content }
  } catch {
    message.value = '无法读取已保存的反馈，你仍然可以填写新的内容。'
    return emptyFeedback
  }
}

const savedFeedback = ref(loadFeedback())
const form = reactive({ ...savedFeedback.value })
const isDirty = computed(() =>
  Object.keys(form).some((key) => form[key] !== savedFeedback.value[key]),
)

watch(form, () => (message.value = ''), { flush: 'sync' })

function saveFeedback() {
  if (!form.title.trim() || !form.content.trim()) {
    message.value = '请填写标题和详细内容，不能只输入空格。'
    return
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
    savedFeedback.value = { ...form }
    message.value = '反馈已保存到此浏览器，可以放心切换页面。'
  } catch {
    message.value = '保存失败，请稍后重试。当前内容仍未保存。'
  }
}

function resetFeedback() {
  Object.assign(form, savedFeedback.value)
  message.value = '已恢复到最近一次保存的内容。'
}

onBeforeRouteLeave(() => {
  if (!isDirty.value) return true
  return window.confirm('有未保存的草稿，是否放弃并离开？')
})
</script>

<template>
  <section class="content-card">
    <span class="eyebrow">HOME</span>
    <h1>欢迎来到首页</h1>
    <p class="description">有什么想法或遇到了问题？写下一份反馈，随时保存你的进展。</p>
    <form class="feedback-form" @submit.prevent="saveFeedback">
      <div class="form-heading">
        <h2>意见反馈</h2>
        <span class="draft-status" :class="{ unsaved: isDirty }" role="status">
          {{ isDirty ? '有未保存的修改' : '没有未保存的修改' }}
        </span>
      </div>
      <p id="feedback-hint" class="form-hint">
        保存的内容仅保存在此浏览器。切换页面前，未保存的修改会提醒你确认。
      </p>
      <div class="form-field">
        <label for="feedback-title">标题</label>
        <input
          id="feedback-title"
          v-model="form.title"
          type="text"
          placeholder="用一句话描述你的反馈"
          maxlength="100"
          required
        />
      </div>
      <div class="form-field">
        <label for="feedback-category">反馈类型</label>
        <select id="feedback-category" v-model="form.category">
          <option v-for="type in feedbackTypes" :key="type.value" :value="type.value">
            {{ type.label }}
          </option>
        </select>
      </div>
      <div class="form-field">
        <label for="feedback-content">详细内容</label>
        <textarea
          id="feedback-content"
          v-model="form.content"
          placeholder="描述你的建议、遇到的问题或期待的改进…"
          rows="6"
          maxlength="2000"
          aria-describedby="feedback-hint"
          required
        ></textarea>
        <span class="character-count">{{ form.content.length }} / 2000</span>
      </div>
      <div class="form-actions">
        <button class="auth-button" type="submit" :disabled="!isDirty">保存反馈</button>
        <button class="reset-button" type="button" :disabled="!isDirty" @click="resetFeedback">
          重置修改
        </button>
      </div>
      <p v-if="message" class="form-message" role="status">{{ message }}</p>
    </form>
    <RouterLink class="text-link" to="/about"
      >前往 About <span aria-hidden="true">→</span></RouterLink
    >
  </section>
</template>

<style scoped>
.feedback-form {
  margin: 30px 0;
  padding: 24px;
  border: 1px solid #e7eee9;
  border-radius: 12px;
  background: #f7faf8;
}
.form-heading,
.form-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
.form-heading {
  justify-content: space-between;
}
.form-heading h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}
.draft-status,
.form-hint,
.character-count,
.form-message {
  color: #687c74;
  font-size: 13px;
  line-height: 1.8;
}
.draft-status.unsaved {
  color: #976314;
}
.form-hint {
  margin: 10px 0 22px;
}
.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}
.form-field label {
  font-size: 14px;
  font-weight: 600;
}
.form-field input,
.form-field select,
.form-field textarea {
  width: 100%;
  min-width: 0;
  padding: 11px 12px;
  border: 1px solid #ceddd3;
  border-radius: 8px;
  background: #fff;
  color: inherit;
  font: inherit;
  font-size: 14px;
}
.form-field textarea {
  resize: vertical;
}
.form-field input:focus-visible,
.form-field select:focus-visible,
.form-field textarea:focus-visible,
.form-actions button:focus-visible {
  outline: 2px solid #247e5f;
  outline-offset: 3px;
}
.character-count {
  align-self: flex-end;
}
.reset-button {
  padding: 10px 18px;
  border: 1px solid #ceddd3;
  border-radius: 9px;
  background: #fff;
  color: #52695d;
  cursor: pointer;
  font-size: 14px;
}
.form-actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.form-message {
  margin: 16px 0 0;
}
@media (max-width: 600px) {
  .feedback-form {
    padding: 18px;
  }
}
</style>
