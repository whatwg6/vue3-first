import { test, expect } from '@playwright/test'

async function respondToConfirmation(page, action, discard) {
  const dialogPromise = page.waitForEvent('dialog')
  const navigation = action()
  const dialog = await dialogPromise
  expect(dialog.type()).toBe('confirm')
  expect(dialog.message()).toBe('有未保存的草稿，是否放弃并离开？')
  if (discard) await dialog.accept()
  else await dialog.dismiss()
  await navigation
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: '登录', exact: true }).click()
  await expect(page).toHaveURL(/\/home$/)
})

test('没有修改时可以直接切换页面', async ({ page }) => {
  const dialogs = []
  page.on('dialog', async (dialog) => {
    dialogs.push(dialog.message())
    await dialog.dismiss()
  })
  await page.getByRole('link', { name: 'About', exact: true }).click()
  await expect(page).toHaveURL(/\/about$/)
  expect(dialogs).toEqual([])
})

test('取消离开保留草稿，确认离开放弃未保存的内容', async ({ page }) => {
  await page.getByLabel('标题', { exact: true }).fill('希望支持深色模式')
  await page.getByLabel('反馈类型').selectOption('other')
  await page.getByLabel('详细内容').fill('晚上使用时希望界面更加舒适。')
  const navigate = () => page.getByRole('link', { name: 'About', exact: true }).click()

  await respondToConfirmation(page, navigate, false)
  await expect(page).toHaveURL(/\/home$/)
  await expect(page.getByLabel('标题', { exact: true })).toHaveValue('希望支持深色模式')
  await expect(page.getByLabel('反馈类型')).toHaveValue('other')
  await expect(page.getByLabel('详细内容')).toHaveValue('晚上使用时希望界面更加舒适。')

  await respondToConfirmation(page, navigate, true)
  await expect(page).toHaveURL(/\/about$/)
  await page.getByRole('link', { name: 'Home', exact: true }).click()
  await expect(page.getByLabel('标题', { exact: true })).toHaveValue('')
  await expect(page.getByLabel('反馈类型')).toHaveValue('suggestion')
  await expect(page.getByLabel('详细内容')).toHaveValue('')
})

test('保存后直接离开，返回或刷新能恢复已保存的反馈', async ({ page }) => {
  const dialogs = []
  page.on('dialog', async (dialog) => {
    dialogs.push(dialog.message())
    await dialog.dismiss()
  })
  await page.getByLabel('标题', { exact: true }).fill('页面显示问题')
  await page.getByLabel('反馈类型').selectOption('bug')
  await page.getByLabel('详细内容').fill('希望优化手机上的显示。')
  await page.getByRole('button', { name: '保存反馈' }).click()
  await expect(page.getByText('反馈已保存到此浏览器，可以放心切换页面。')).toBeVisible()
  await page.getByRole('link', { name: 'About', exact: true }).click()
  await expect(page).toHaveURL(/\/about$/)
  await page.getByRole('link', { name: 'Home', exact: true }).click()
  await page.reload()
  await expect(page.getByLabel('标题', { exact: true })).toHaveValue('页面显示问题')
  await expect(page.getByLabel('反馈类型')).toHaveValue('bug')
  await expect(page.getByLabel('详细内容')).toHaveValue('希望优化手机上的显示。')
  await expect(page.getByRole('button', { name: '保存反馈' })).toBeDisabled()
  expect(dialogs).toEqual([])
  page.removeAllListeners('dialog')

  await page.getByLabel('详细内容').fill('另一份未保存的修改')
  await respondToConfirmation(
    page,
    () => page.getByRole('link', { name: 'About', exact: true }).click(),
    true,
  )
  await page.getByRole('link', { name: 'Home', exact: true }).click()
  await expect(page.getByLabel('详细内容')).toHaveValue('希望优化手机上的显示。')
})

test('恢复原值和重置后不再提示未保存的修改', async ({ page }) => {
  await page.getByLabel('标题', { exact: true }).fill('临时修改')
  await page.getByLabel('标题', { exact: true }).fill('')
  await expect(page.getByRole('button', { name: '保存反馈' })).toBeDisabled()
  await page.getByLabel('反馈类型').selectOption('bug')
  await expect(page.getByText('有未保存的修改', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: '重置修改' }).click()
  await expect(page.getByLabel('反馈类型')).toHaveValue('suggestion')
  await expect(page.getByRole('button', { name: '保存反馈' })).toBeDisabled()
  await page.getByRole('link', { name: 'About', exact: true }).click()
  await expect(page).toHaveURL(/\/about$/)
})

test('取消退出仍保持登录和草稿，确认后退出登录', async ({ page }) => {
  await page.getByLabel('标题', { exact: true }).fill('尚未写完')
  const logout = () => page.getByRole('button', { name: '退出登录' }).click()
  await respondToConfirmation(page, logout, false)
  await expect(page).toHaveURL(/\/home$/)
  await expect(page.getByRole('button', { name: '退出登录' })).toBeVisible()
  await expect(page.getByLabel('标题', { exact: true })).toHaveValue('尚未写完')
  expect(await page.evaluate(() => localStorage.getItem('vue-demo-logged-in'))).toBe('true')

  await respondToConfirmation(page, logout, true)
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('heading', { name: '请先登录' })).toBeVisible()
  expect(await page.evaluate(() => localStorage.getItem('vue-demo-logged-in'))).toBeNull()
  await page.getByRole('button', { name: '登录', exact: true }).click()
  await expect(page.getByLabel('标题', { exact: true })).toHaveValue('')
})

test('浏览器后退和前进都能取消或确认离开', async ({ page }) => {
  await page.getByRole('link', { name: 'About', exact: true }).click()
  await page.getByRole('link', { name: 'Home', exact: true }).click()
  await page.getByLabel('标题', { exact: true }).fill('历史导航中的草稿')

  await respondToConfirmation(page, () => page.goBack(), false)
  await expect(page).toHaveURL(/\/home$/)
  await expect(page.getByLabel('标题', { exact: true })).toHaveValue('历史导航中的草稿')
  await respondToConfirmation(page, () => page.goBack(), true)
  await expect(page).toHaveURL(/\/about$/)
  await page.goBack()
  await expect(page).toHaveURL(/\/home$/)
  await page.getByLabel('标题', { exact: true }).fill('前进前的草稿')
  await respondToConfirmation(page, () => page.goForward(), false)
  await expect(page).toHaveURL(/\/home$/)
  await expect(page.getByLabel('标题', { exact: true })).toHaveValue('前进前的草稿')
  await respondToConfirmation(page, () => page.goForward(), true)
  await expect(page).toHaveURL(/\/about$/)
})

test('保存失败时仍然保护草稿', async ({ page }) => {
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new Error('Storage unavailable')
    }
  })
  await page.getByLabel('标题', { exact: true }).fill('保存失败的反馈')
  await page.getByLabel('详细内容').fill('需要保留在当前页面。')
  await page.getByRole('button', { name: '保存反馈' }).click()
  await expect(page.getByText('保存失败，请稍后重试。当前内容仍未保存。')).toBeVisible()
  await respondToConfirmation(
    page,
    () => page.getByRole('link', { name: 'About', exact: true }).click(),
    false,
  )
  await expect(page.getByLabel('详细内容')).toHaveValue('需要保留在当前页面。')
})
