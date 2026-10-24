<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

import TodoItem from '@/components/TodoItem.vue'

interface Task {
  id: number
  title: string
  completed: boolean
  created_at: string
  completed_at: string | null
}

const todo = shallowRef('')
const queryClient = useQueryClient()
const tasksKey = ['tasks'] as const

// fetch 不会因为 HTTP 4xx/5xx 自动抛错，需要抛给 Query / Mutation 处理。
async function request(url: string, options?: RequestInit): Promise<Response> {
  const response = await fetch(url, options)
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? `请求失败（${response.status}）`)
  }
  return response
}

// data 就是查询缓存中的列表，不再另建 ref 保存一份任务数据。
const {
  data: tasks,
  isPending,
  isFetching,
  error,
  refetch,
} = useQuery({
  queryKey: tasksKey,
  queryFn: async ({ signal }): Promise<Task[]> => {
    const response = await request('/api/tasks', { signal })
    return response.json()
  },
  retry: false,
})

const {
  mutate: addTask,
  isPending: isAdding,
  error: addError,
} = useMutation({
  mutationFn: async (title: string): Promise<Task> => {
    const response = await request('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    return response.json()
  },
  onSuccess: async (task) => {
    // 取消旧查询，避免它稍后返回时覆盖刚写入的结果。
    await queryClient.cancelQueries({ queryKey: tasksKey })
    // 后端按 id 倒序返回列表，所以新增任务放在最前面。
    queryClient.setQueryData<Task[]>(tasksKey, (old = []) => [task, ...old])
    todo.value = ''
  },
})

const {
  mutate: completeTask,
  isPending: isCompleting,
  variables: completingId,
  error: completeError,
} = useMutation({
  mutationFn: async (id: number): Promise<Task> => {
    const response = await request(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: true }),
    })
    return response.json()
  },
  onSuccess: async () => {
    refetch()
  },
})

const {
  mutate: deleteTask,
  isPending: isDeleting,
  variables: deletingId,
  error: deleteError,
} = useMutation({
  mutationFn: async (id: number): Promise<void> => {
    // DELETE 返回 204，没有 JSON 正文。
    await request(`/api/tasks/${id}`, { method: 'DELETE' })
  },
  onSuccess: async () => {
    refetch()
  },
})

const isSaving = computed(() => isAdding.value || isCompleting.value || isDeleting.value)
const cannotAdd = computed(() => !todo.value.trim() || isSaving.value || !tasks.value)

function submit() {
  if (cannotAdd.value) return
  addTask(todo.value.trim())
}
</script>

<template>
  <section class="space-y-3" aria-label="TanStack Query 任务列表">
    <h1>Todos 2</h1>
    <div class="flex items-center gap-3">
      <button
        type="button"
        class="border px-2 cursor-pointer disabled:cursor-default disabled:opacity-50"
        :disabled="isFetching || isSaving"
        @click="refetch()"
      >
        刷新
      </button>
      <span v-if="isPending && isFetching" role="status">加载中…</span>
      <span v-else-if="isFetching" role="status">后台刷新中…</span>
    </div>
    <p v-if="error" role="alert" class="text-red-600">
      {{ tasks ? '刷新失败，当前仍显示已有任务' : '加载失败' }}：{{
        error.message
      }}，请点击刷新重试。
    </p>

    <!-- 只按是否已有数据决定渲染，后台刷新不会卸载表单和列表。 -->
    <div v-if="tasks" class="space-y-3">
      <form class="flex flex-wrap gap-2" @submit.prevent="submit">
        <input
          v-model="todo"
          aria-label="新任务"
          placeholder="请输入"
          class="border px-2"
          :disabled="isAdding"
        />
        <button
          type="submit"
          class="cursor-pointer disabled:cursor-default disabled:text-gray-400"
          :disabled="cannotAdd"
        >
          {{ isAdding ? '新增中…' : '新增' }}
        </button>
      </form>
      <p v-if="addError" role="alert" class="text-red-600">新增失败：{{ addError.message }}</p>
      <p v-if="completeError" role="alert" class="text-red-600">
        完成失败：{{ completeError.message }}
      </p>
      <p v-if="deleteError" role="alert" class="text-red-600">
        删除失败：{{ deleteError.message }}
      </p>
      <p v-if="tasks.length === 0">暂无任务，添加第一条吧。</p>
      <ul v-else class="space-y-2">
        <TodoItem
          class="flex flex-wrap items-center gap-2"
          v-for="task in tasks"
          :key="task.id"
          :id="task.id"
          :title="task.title"
          :completed="task.completed"
          :isSaving="isSaving"
          :isCompleting="isCompleting"
          :isDeleting="isDeleting"
          :completingId="completingId"
          :deletingId="deletingId"
          @complete="completeTask"
          @delete="deleteTask"
        />
      </ul>
    </div>
  </section>
</template>
