# 页面映射索引

## 1. 定位

本索引用于把页面到接口映射从单个超长文件拆成按主题阅读的小文档。

根级 `HARNESS_PAGE_API_MAPPING.md` 继续保留为固定入口，但默认阅读顺序切到这里。

## 2. 阅读顺序

1. 身份、项目与全局设定：`page-mappings-auth-project.md`
2. 剧本、主体、分镜：`page-mappings-script-subject-storyboard.md`
3. 资产、创作、剪辑：`page-mappings-assets-creation-edit.md`

## 3. 使用原则

- 先按页面主题进入对应子文档
- 再对照前端页面、`src/api/` 与后端 router/service/model
- 完成任务后，优先回写对应子文档，再同步根级索引摘要
