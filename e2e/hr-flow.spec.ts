import { test, expect } from '@playwright/test'

const BASE = process.env.BASE_URL ?? 'http://localhost:3006'

test.describe('DAWN HR Flow', () => {
  test('should show login page for unauthenticated users', async ({ page }) => {
    await page.goto(BASE)
    await expect(page).toHaveURL(/\/login/)
    await expect(page.locator('text=DAWN HR')).toBeVisible()
  })

  test('login page has email and password fields', async ({ page }) => {
    await page.goto(`${BASE}/login`)
    await expect(page.locator('[data-karma-test-id="email-input"]')).toBeVisible()
    await expect(page.locator('[data-karma-test-id="password-input"]')).toBeVisible()
    await expect(page.locator('[data-karma-test-id="submit-btn"]')).toBeVisible()
  })

  test('login page toggles between sign up and sign in', async ({ page }) => {
    await page.goto(`${BASE}/login`)
    await expect(page.locator('text=アカウントをお持ちでない方')).toBeVisible()
    await page.click('text=アカウントをお持ちでない方')
    await expect(page.locator('text=すでにアカウントをお持ちの方')).toBeVisible()
  })
})
