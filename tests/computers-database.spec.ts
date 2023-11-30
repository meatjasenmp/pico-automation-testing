import {test, expect, Page} from '@playwright/test';

const url = 'https://computer-database.gatling.io/computers';

test.beforeEach(async ({ page }) => {
  await page.goto(url);
});

const filter = async (page: Page, name: string) => {
  await page.fill('input[name="f"]', name);
  await page.click('text=Filter by name');
};

const buttonClick = async (page: Page, label: string) => {
  await page.click(`text=${label}`);
};

const expectUrl = async (page: Page, expectedUrl: string) => {
  expect(page.url()).toBe(expectedUrl);
};

const getFilteredItems = async (page: Page, computerName: string) => {
  const computers = await page.$$('tbody tr td a');
  for (const computer of computers) {
    const text = await computer.innerText();
    expect(text).toContain(computerName);
  }
};

test('should navigate when there are next and previous pages', async ({ page }) => {
  await buttonClick(page, 'Next');
  expect(page.url()).toBe(`${url}?p=1`);
  
  await buttonClick(page, 'Next');
  await expectUrl(page, `${url}?p=2`);

  await buttonClick(page, 'Previous');
  expect(page.url()).toBe(`${url}?p=1`);
});

test('should filter correctly', async ({ page }) => {
  await filter(page, 'Apple');
  await expectUrl(page, `${url}?f=Apple`);
  await getFilteredItems(page, 'Apple');
});

test('should filter correctly and navigate when there are next and previous pages', async ({ page }) => {
  await filter(page, 'Apple');
  
  await expectUrl(page, `${url}?f=Apple`);
  await getFilteredItems(page, 'Apple');

  await buttonClick(page, 'Next');
  await expectUrl(page, `${url}?p=1&f=Apple`);
  await getFilteredItems(page, 'Apple');
  
  await buttonClick(page, 'Previous');
  await expectUrl(page, `${url}?p=0&f=Apple`);
  await getFilteredItems(page, 'Apple');
});

test('it should add a new computer', async ({ page }) => {
  await buttonClick(page, 'Add a new computer');
  
  await expectUrl(page, `${url}/new`);
  
  await page.fill('input[name="name"]', 'New Computer');
  
  await page.fill('input[name="introduced"]', '2021-01-01');
  
  await page.fill('input[name="discontinued"]', '2022-01-01');
  
  await page.selectOption('select[name="company"]', 'Apple Inc.');
  
  await page.click('input[type="submit"]');
  
  await expectUrl(page, `${url}`);

  const alertMessage =  page.locator('.alert-message.warning');
  await expect(alertMessage).toHaveText('Done ! Computer New Computer has been created');
});

test('it should return a user to the home page when adding a computer is canceled', async ({ page }) => {
  await buttonClick(page, 'Add a new computer');
  
  await expectUrl(page, `${url}/new`);
  
  await buttonClick(page, 'Cancel');
  
  await expectUrl(page, `${url}`);
});
