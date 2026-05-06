# @triviaiox-master 系统

> **版本:** 1.0.0
> **创建:** 2026-02-04
> **所有者:** @triviaiox-master (Orion)
> **状态:** 官方文档

---

## 概览

**@triviaiox-master** (Orion - 协调器) 是 TRIVIAIOX-FULLSTACK 框架的元代理。他充当通用协调器、框架开发者和 TRIVIAIOX 方法专家。主要职责包括:

- **通用协调**: 直接执行任何代理的任何任务
- **框架开发**: 创建和修改代理、任务、工作流和模板
- **组件管理**: 验证、弃用和分析系统组件
- **多代理协调**: 管理代理之间的复杂工作流
- **知识库**: 访问完整的 TRIVIAIOX 方法知识

### 何时使用

- 创建或修改框架组件(代理、任务、工作流)
- 协调复杂的多代理工作流
- 直接执行任何任务而不改变角色
- 元框架操作和跨代理协调
- 访问 TRIVIAIOX 知识库 (*kb)

---

## 完整文件列表

### @triviaiox-master 的核心任务文件

| 文件 | 命令 | 目的 |
|---------|---------|-----------|
| `.triviaiox-core/development/tasks/create-agent.md` | `*create agent` | 使用模板系统创建新代理定义 |
| `.triviaiox-core/development/tasks/create-task.md` | `*create task` | 用标准化结构创建新任务文件 |
| `.triviaiox-core/development/tasks/create-workflow.md` | `*create workflow` | 创建新的多代理工作流定义 |
| `.triviaiox-core/development/tasks/modify-agent.md` | `*modify agent` | 修改现有代理，支持备份和回滚 |
| `.triviaiox-core/development/tasks/modify-task.md` | `*modify task` | 修改现有任务，保持兼容性 |
| `.triviaiox-core/development/tasks/modify-workflow.md` | `*modify workflow` | 修改现有工作流，保持完整性 |
| `.triviaiox-core/development/tasks/analyze-framework.md` | `*analyze-framework` | 分析框架结构、冗余和性能 |
| `.triviaiox-core/development/tasks/deprecate-component.md` | `*deprecate-component` | 弃用组件并附带时间表和迁移 |
| `.triviaiox-core/development/tasks/propose-modification.md` | `*propose-modification` | 创建修改提案供协作审查 |
| `.triviaiox-core/development/tasks/execute-checklist.md` | `*execute-checklist` | 执行验证检查清单 |
| `.triviaiox-core/development/tasks/create-doc.md` | `*create-doc` | 从 YAML 模板创建文档 |
| `.triviaiox-core/development/tasks/advanced-elicitation.md` | `*advanced-elicitation` | 执行多方法高级启发 |
| `.triviaiox-core/development/tasks/kb-mode-interaction.md` | `*kb` | 启用交互式知识库模式 |
| `.triviaiox-core/development/tasks/correct-course.md` | `*correct-course` | 分析和纠正流程/质量偏差 |
| `.triviaiox-core/development/tasks/update-manifest.md` | `*update-manifest` | 用新代理更新团队清单 |
| `.triviaiox-core/development/tasks/create-next-story.md` | `*create-next-story` | 创建下一个用户故事 |
| `.triviaiox-core/development/tasks/create-deep-research-prompt.md` | - | 生成深度研究提示 |
| `.triviaiox-core/development/tasks/improve-self.md` | - | 代理自我改进 |
| `.triviaiox-core/development/tasks/shard-doc.md` | `*shard-doc` | 将文档分解为较小部分 |
| `.triviaiox-core/development/tasks/document-project.md` | `*document-project` | 生成项目文档 |
| `.triviaiox-core/development/tasks/index-docs.md` | `*index-docs` | 索引文档以供搜索 |

### 代理定义文件

| 文件 | 目的 |
|---------|-----------|
| `.triviaiox-core/development/agents/triviaiox-master.md` | 完整代理定义(角色、命令、依赖) |
| `.claude/commands/TRIVIAIOX/agents/triviaiox-master.md` | Claude Code 命令用于激活 @triviaiox-master |

---

## 总结

| 方面 | 详情 |
|---------|----------|
| **代理名称** | Orion (triviaiox-master) |
| **原型** | 协调器 |
| **直接任务总数** | 21 个任务 |
| **模板总数** | 14 个模板 |
| **工作流总数** | 6 个工作流 |
| **检查清单总数** | 6 个检查清单 |
| **委托的代理** | 4 个(@pm、@analyst、@architect、@qa) |

---

*-- Orion，协调系统*
