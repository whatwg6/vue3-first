<script setup lang="ts">
import { computed, ref } from 'vue'

import { useFetch } from '@vueuse/core'

const todo = ref('')

const { isFetching, error, data, execute } = useFetch<{ id: string; title: string }>(
  '/api/tasks',
).json()

const disabled = computed(() => todo.value.trim().length === 0)

const submit = async () => {
  await useFetch<{ title: string }>('/api/tasks', {
    immediate: false,
  })
    .post({
      title: todo.value,
    })
    .execute()

  todo.value = ''

  execute()
}

const del = async (id: string) => {
  await useFetch<{ title: string }>('/api/tasks/' + id, {
    immediate: false,
  })
    .delete()
    .execute()

  execute()
}

const complete = async (id: string) => {
  await useFetch<{ title: string }>('/api/tasks/' + id, {
    immediate: false,
  })
    .patch({
      completed: true,
    })
    .execute()

  execute()
}
</script>

<template>
  <p v-if="isFetching">加载中</p>
  <p v-else-if="error">加载失败</p>
  <div v-else class="space-y-2">
    <div class="space-x-2">
      <input placeholder="请输入" v-model="todo" class="border" />
      <button
        @click="submit"
        :class="{
          'text-gray-400': disabled,
          'cursor-pointer': !disabled,
        }"
      >
        新增
      </button>
    </div>
    <div v-for="task in data" :key="task.id" class="space-x-2">
      <span>{{ task.completed ? '✅' : '❎' }}</span>
      <span>
        {{ task.title }}
      </span>
      <button @click="complete(task.id)" class="border cursor-pointer">完成</button>
      <button @click="del(task.id)" class="border cursor-pointer">删除</button>
    </div>
  </div>
</template>
