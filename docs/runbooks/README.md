# 运行手册说明

本目录只写标准动作，不重复写背景故事。

- `local-dev.md`：本地环境与启动方式
- `production-deploy.md`：当前生产域名、前后端环境变量与上线核对清单
- `incremental-db-restore.md`：云端数据库只补字段和指定表数据时的增量恢复手册
- `runtime-loadtest.md`：真实环境热点链路的轻量压测基线脚本与执行方式
- `runtime-observability.md`：运行时指标清单、日志入口与初版告警阈值
- `runtime-result-templates.md`：迁移核验、`EXPLAIN/ANALYZE`、压测结果与阈值回写的落仓模板
- `runtime-verification.md`：迁移执行、`EXPLAIN/ANALYZE`、压测结果落仓与阈值回写的生产验证闭环
- `runtime-sse.md`：SSE 流式接口边界、代理层要求与回退策略
- `media-storage-migration.md`：历史外链回填为本站托管地址的迁移、验证与回退步骤
- `media-download-signing.md`：统一受控下载与签名 token 链路的巡检、排障、回退步骤
- `media-cdn-invalidation.md`：媒体预览、封面、HLS 等缓存失效与源站回退步骤
- `media-delivery-checks.md`：图片/视频/HLS/下载地址的统一连通性巡检入口
- `media-release-canary.md`：媒体链路灰度发布顺序、观察点与止损条件
- `media-release-rollback.md`：媒体链路专项回滚的配置、流量、代码与缓存步骤
- `task-workflow.md`：接任务到回写的标准流程
- `release-rollback.md`：发布、回滚、排障入口
- `media-acceptance-checklist.md`：媒体链路阶段验收模板与证据清单
- `media-handover-template.md`：媒体链路阶段交接模板
- `media-doc-writeback-checklist.md`：媒体链路文档回写动作清单与 API 文档判断规则
- `seedance-r2v-troubleshooting.md`：Seedance 全能参考视频（r2v）总时长超限排障与 PUBLIC_BASE_URL 配置
