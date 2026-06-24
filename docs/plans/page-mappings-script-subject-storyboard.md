# 页面映射：剧本、主体与分镜

## 1. 剧本与分集

| 项目 | 内容 |
|---|---|
| 页面/组件 | `ScriptPage.jsx` |
| 前端入口 | `src/api/episode.js` / `src/api/projectScript.js` |
| 当前判断 | `已存在` |
| 核心映射 | `episodeCount -> episode_count`；临时整稿走 `script-workspace/chat -> finalize`；开始提取主体当前走同步 `subjects/extract`，前端完成后再统一刷新主体列表 |
| 当前结果 | 分集 CRUD、流式生成、整稿拆分、上传导入、默认 chat 模型联动已接通；已新增 `backend/scripts/test_script_models.py`，可按当前项目上下文批量探测各 chat 模型在“整稿生成 + 拆分预览”链路下的可用性 |
| 当前遗留 | 待继续在真实 API Key 环境下完成整稿生成、自动拆分和主体后续承接的页面级手工联调 |

## 2. 主体

| 项目 | 内容 |
|---|---|
| 页面/组件 | `SubjectPage.jsx` |
| 前端入口 | `src/api/subject.js` |
| 当前判断 | `已存在` |
| 核心映射 | `char -> character`；集数标签 -> `episode_id`；图片模型查询 `type -> category` |
| 当前结果 | 主体 CRUD、参考图、主图/候选图、音色承接、单图/批量生成任务化已接通；`2026-06-11` 起角色绑定音色会真实保存 `voice_id`，并自动为关联分镜中的结构化旁白生成项目音频；同日已进一步确认当前后端 `subjects/extract` 仍为同步返回主体数组，前端现以同步提取口径消费 |
| 当前遗留 | 继续做真实环境下同步主体提取、批量生成、失败子项与任务终态回显验证；观察不同 voice 模型配置下的自动生成成功率；若后续要恢复主体提取任务制，需要后端与前端一起重新落库和轮询 |

## 3. 分镜

| 项目 | 内容 |
|---|---|
| 页面/组件 | `StoryboardPage.jsx` / `ShotViewerModal.jsx` |
| 前端入口 | `src/api/storyboard.js` |
| 当前判断 | `已存在` |
| 核心映射 | `shot -> storyboard`；`episodeId -> episode_id`；排序参数统一为 `ordered_ids` |
| 当前结果 | 分镜 CRUD、排序、图片上传、视频上传、图片生成、视频生成、批量下载与任务化已接通；`2026-06-11` 已把旁白配音接到真实项目音频链路；同日继续把“主体页绑定音色 -> 分镜视频参考音频”接通到 `StoryboardPage.jsx` 与 `src/api/storyboard.js`：当前在“全能参考”模式下，若当前视频模型支持参考音频，则会按分镜角色顺序自动带入主体页已绑定音色对应的 `previewUrl/sourceAudioUrl` 作为默认参考音频；管理员旁白音频结果区也已改为代码级开关，默认关闭但保留实现；同日分镜视频卡片预览也已补齐最小页面承接：默认优先展示缩略图或视频起始首帧，鼠标悬停时会直接静音播放，移出后暂停并回到开头，未改动现有卡片布局、查看弹窗和下载交互 |
| 当前遗留 | 继续验证不同视频模型的能力边界、参考素材模式与真实生成稳定性；继续在真实环境观察不同音色、不同角色绑定和结构化旁白组合下的视频参考音频实际效果；若后续要重新放开管理员旁白区，再按开关开启后做一次定向联调 |

## 4. 分镜提取迁移专项

| 项目 | 内容 |
|---|---|
| 专项阶段 | `SBX-03 ~ SBX-05` |
| 当前判断 | `进行中` |
| 任务 1 | 结构化抽取层：`description / framing / cameraMotion / angle / composition / duration / lightShadow / ambientSound / narration / characterIds / sceneId / propIds` |
| 任务 2 | 组合提示词层：`composedPromptAuto / composedPromptManual / composedPromptDirty / composedPromptSourceVersion` |
| 当前结果 | 后端已补第一版结构化字段；`gen_params.composed_prompt_*` 已启动；下游生成入口已优先消费 `manual > auto > image_prompt > content` |
| 当前遗留 | 分镜页任务2 展示、人工稿编辑状态承接、更多下游入口统一消费仍需继续收口 |

## 5. 剪辑成片增强迁移

| 项目 | 内容 |
|---|---|
| 页面/组件 | `EditPage.jsx` + `components/edit/*` |
| 前端入口 | `src/api/composition.js` + `src/lib/composition.js` |
| 当前判断 | `已存在，已增强` |
| 当前结果 | 四区结构、时间线顺序/时长/字幕编辑、素材池追加、保存导出与结果回显已落地 |
| 当前遗留 | 高级拖拽时间线、自动转写、AI Voice 等仍后置 |
