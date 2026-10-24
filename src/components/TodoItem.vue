<script lang="ts" setup>
import { defineProps, defineEmits } from 'vue'

const emit = defineEmits<{
  complete: [id: number]
  delete: [id: number]
}>()

defineProps<{
  completed: boolean
  title: string
  id: number
  isSaving: boolean
  isCompleting: boolean
  isDeleting: boolean
  completingId?: number
  deletingId?: number
}>()
</script>

<template>
  <div>
    <span :aria-label="completed ? '已完成' : '未完成'">
      {{ completed ? '✅' : '❎' }}
    </span>
    <span :class="{ 'line-through': completed }">{{ title }}</span>
    <button
      type="button"
      class="border px-2 cursor-pointer disabled:cursor-default disabled:opacity-50"
      :disabled="completed || isSaving"
      @click="emit('complete', id)"
    >
      {{ isCompleting && completingId === id ? '完成中…' : '完成' }}
    </button>
    <button
      type="button"
      class="border px-2 cursor-pointer disabled:cursor-default disabled:opacity-50"
      :disabled="isSaving"
      @click="emit('delete', id)"
    >
      {{ isDeleting && deletingId === id ? '删除中…' : '删除' }}
    </button>
  </div>
</template>
