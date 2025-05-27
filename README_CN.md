---
icon: record-vinyl
---

# README\_CN

Lemon

<figure><img src="./public/img/Lemon_logo.png" alt="" width="375"><figcaption></figcaption></figure>

&#x20;                                                                               [文档](https://lemon-11.gitbook.io/lemon-docs/)

![README in English](https://img.shields.io/badge/English-d9d9d9)![简体中文版自述文件](https://img.shields.io/badge/%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87-d9d9d9)\


Lemon 是一款开源的General AI Agent通用智能体，能够从需求计划到成果交付全流程自动化，它通过独立思考和系统规划，在虚拟环境中灵活调用各类工具，如编写并执行代码、智能浏览网页、操作网页应用、命令执行等。Lemon 擅长将复杂任务系统化分解并有序执行，自动分析任务、安排步骤优先级、动态调整计划，并实时跟踪进度。旨在助力用户高效完成各类任务。

### 功能与特点

* **复杂任务解决**：Lemon能够解决各类复杂多变的任务，包括但不限于市场调研、文件处理、旅行规划和数据分析。它通过独立思考和系统规划，在虚拟环境中灵活调用各类工具，如编写并执行代码、智能浏览网页、操作网页应用等。
* **自主性和目标导向**：Lemon 具备高度的自主性，能够在无需人类干预的情况下独立完成任务。它能够根据预设目标进行感知、推理、决策和行动。
* **实时任务监控**：用户可以通过页面端实时查看任务的执行状态
* **多场景覆盖**：市场调研、金融分析、数据分析、代码编程、生活规划等领域的复杂任务处理。
* **自订阅模式**：**除默认模型外**，支持自定义模型接入和在线模型接入，通过配置模型API进行使用。

### 使用 Lemon

* 使用这个入门指南快速在您的环境中运行 Lemon。 使用我们的文档进行进一步的参考和更深入的说明。

### 运行 Lemon

#### 系统要求 <a href="#system-requirements" id="system-requirements"></a>

* [支持 Docker Desktop](https://docs.docker.com/desktop/setup/install/mac-install/#system-requirements)的 MacOS
* Linux
* [支持WSL](https://learn.microsoft.com/en-us/windows/wsl/install)和[Docker Desktop 的](https://docs.docker.com/desktop/setup/install/windows-install/#system-requirements)Windows

建议使用具有现代处理器和至少**4GB RAM的系统来运行 Lemon。**

#### **MacOS**

**Docker 桌面**

1. [在 Mac 上安装 Docker Desktop](https://docs.docker.com/desktop/setup/install/mac-install)。
2. 打开 Docker Desktop，转到`Settings > Advanced`并确保`Allow the default Docker socket to be used`已启用。

#### **Linux**

使用 Ubuntu 22.04 测试。

**Docker 桌面**

1. [在 Linux 上安装 Docker Desktop](https://docs.docker.com/desktop/setup/install/linux/)。

#### **Windows**

**WSL**

1. [安装 WSL](https://learn.microsoft.com/en-us/windows/wsl/install)。
2. `wsl --version`在 powershell 中运行并确认`Default Version: 2`。

**Docker 桌面**

1. [在 Windows 上安装 Docker Desktop](https://docs.docker.com/desktop/setup/install/windows-install)。
2. 打开Docker Desktop，前往`Settings`并确认以下内容：

* 常规：`Use the WSL 2 based engine`已启用。
* 资源 > WSL 集成：`Enable integration with my default WSL distro`已启用。

必须在 WSL 终端内运行以下用于启动应用程序的 docker 命令。

### 启动应用程序 <a href="#start-the-app" id="start-the-app"></a>

运行Lemon最简单的方法是使用 Docker。

<details>

<summary>docker pull hexdolemonai/lemon-runtime-sandbox:latest<br>docker run -it --rm --pull=always<br>--name lemon-app<br>--env DOCKER_HOST_ADDR=host.docker.internal<br>--publish 5005:5005<br>--add-host host.docker.internal:host-gateway<br>--volume /var/run/docker.sock:/var/run/docker.sock<br>--volume ~/.cache:/.cache<br>--volume ${WORKSPACE_BASE:-$PWD/workspace}:/app/workspace<br>--interactive<br>--tty<br>hexdolemonai/lemon:latest make run</summary>



</details>

#### 贡献

对于那些想要贡献代码的人，请参阅我们的[贡献指南](https://github.com/hexdocom/lemon/blob/main/CONTRIBUTING.md)。同时，请考虑通过社交媒体、活动和会议来支持 Lemon 的分享。

### 社区与支持

我们欢迎您为 Lemon 作出贡献，以帮助改善 Lemon。包括：提交代码、问题、新想法，或分享您基于 Lemon 创建的有趣且有用的 AI 应用程序。同时，我们也欢迎您在不同的活动、会议和社交媒体上分享 Lemon。

* [GitHub Issues](https://github.com/hexdocom/lemon/issues)。👉：使用 Lemon 时遇到的错误和问题，请参阅贡献指南
* 电子邮件支持👉：关于使用 Lemon的问题。
* [X(Twitter)](https://x.com/LemonAI_cc)。👉：分享您的应用程序并与社区交流。
* 商业许可。👉：有关商业用途许可 Lemon的商业咨询。

### 安全问题

为了保护您的隐私，请避免在 GitHub 上发布安全问题。发送问题至service@hexdo.com我们将为您做更进一步的解答。

### 执照

本仓库遵循Lemon Open Source License 协议开源，该许可证本质上是Apache 2.0，但有一些额外的限制。
