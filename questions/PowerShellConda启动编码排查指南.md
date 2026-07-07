# PowerShell Conda 启动编码排查指南

## 问题描述

在 Windows PowerShell 登录 shell 中执行 Git 命令时，Conda 自动激活 `base` 环境，因 PATH 中存在 GBK 无法编码的字符，触发 `UnicodeEncodeError` 和 `Invoke-Expression` 解析报错。

## 已尝试的修复方法及失败原因

- ❌ 直接使用默认登录 shell 执行命令：命令本身能继续执行，但前置 Conda 报错输出很长，影响判断真实命令结果。

## 深层问题分析

这是本机 shell 启动脚本/Conda 自动激活导致的环境问题，不是 2048 项目代码问题。后续不应反复用默认登录 shell 触发同一类噪音。

## 下一步排查策略

优先在 Codex 命令中使用非登录 shell 执行项目命令，避免加载 Conda 自动激活脚本。只有确实需要 Conda 环境时，再单独处理编码或激活策略。

## 调试工具

- `git status --short`
- PowerShell 非登录 shell 执行方式

## 注意事项

不要因为 Conda 启动报错误判 Git 命令失败；应看命令末尾真实退出码和 Git 输出。

## 更新记录

- ✅ 2026-07-07：确认使用非登录 shell 后，Git 状态命令不再输出 Conda 编码报错。
