import type { MockMethod } from 'vite-plugin-mock'
import { departments, success, fail, nextId } from './data'

function buildTree(list: any[], parentId: number | null = null): any[] {
  return list
    .filter(d => d.parentId === parentId)
    .map(d => ({
      id: d.id,
      name: d.name,
      dean: d.dean,
      children: buildTree(list, d.id),
    }))
}

export default [
  {
    url: '/api/v1/departments',
    method: 'get',
    response: () => success(buildTree(departments)),
  },
  {
    url: '/api/v1/departments/:id',
    method: 'get',
    response: ({ url }: any) => {
      const id = Number(url.split('/').pop())
      const dept = departments.find(d => d.id === id)
      return dept ? success(dept) : fail('院系不存在', 404)
    },
  },
  {
    url: '/api/v1/departments',
    method: 'post',
    response: ({ body }: any) => {
      const dept = { id: nextId(departments), ...body, createdAt: '2025-06-29T10:00:00', updatedAt: '2025-06-29T10:00:00' }
      departments.push(dept)
      return success(dept, '创建成功')
    },
  },
  {
    url: '/api/v1/departments/:id',
    method: 'put',
    response: ({ url, body }: any) => {
      const id = Number(url.split('/').pop())
      const idx = departments.findIndex(d => d.id === id)
      if (idx === -1) return fail('院系不存在', 404)
      departments[idx] = { ...departments[idx], ...body, updatedAt: '2025-06-29T10:00:00' }
      return success(departments[idx], '更新成功')
    },
  },
  {
    url: '/api/v1/departments/:id',
    method: 'delete',
    response: ({ url }: any) => {
      const id = Number(url.split('/').pop())
      const idx = departments.findIndex(d => d.id === id)
      if (idx === -1) return fail('院系不存在', 404)
      departments.splice(idx, 1)
      return success(null, '删除成功')
    },
  },
] as MockMethod[]
