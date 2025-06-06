# ================================================================
# 第一阶段：构建器 (builder)
# 这个阶段包含所有构建工具和中间文件，最终镜像不会包含这些。
# ================================================================
FROM node:22-slim as builder

# 共享环境变量
ENV MAMBA_ROOT_PREFIX=/chataa/micromamba \
    LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    EDITOR=code \
    VISUAL=code \
    GIT_EDITOR="code --wait" \
    OPENVSCODE_SERVER_ROOT=/chataa/.openvscode-server \
    NPM_CONFIG_PREFIX=/chataa/npm_global

# 安装基础系统依赖
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
        wget curl sudo apt-utils git jq tmux bash ca-certificates file lsof zip unzip \
        libgl1-mesa-glx \
        libasound2-plugins libatomic1 && \
    (apt-get remove -y libaom3 || true) && \
    (apt-get remove -y libjxl0.7 || true) && \
    (apt-get remove -y libopenexr-3-1-30 || true) && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 移除 UID 1000
RUN if getent passwd 1000 | grep -q pn; then userdel pn; fi

# 创建必要的目录
RUN mkdir -p /chataa \
    /chataa/logs \
    /chataa/code \
    /chataa/code/chataa \
    /chataa/micromamba/bin \
    /workspace/.vscode \
    ${NPM_CONFIG_PREFIX} # 确保 npm 全局目录存在

# 安装 micromamba
RUN /bin/bash -c "curl -L https://micro.mamba.pm/install.sh | PREFIX_LOCATION=/chataa/micromamba BIN_FOLDER=/chataa/micromamba/bin INIT_YES=no CONDA_FORGE_YES=yes bash" && \
    /chataa/micromamba/bin/micromamba config remove channels defaults && \
    /chataa/micromamba/bin/micromamba config list

# 创建 chataa 虚拟环境并安装 poetry 和 python
RUN /chataa/micromamba/bin/micromamba create -n chataa \
      -c conda-forge \
      python=3.12 \
      poetry \
      -y --override-channels

# 在 builder 阶段设置 PATH，以便可以执行 micromamba 和 poetry
ENV PATH=/chataa/micromamba/envs/chataa/bin:$PATH

# 复制 VSCode settings.json
COPY ./src/runtime/plugins/vscode/settings.json /workspace/.vscode/settings.json
RUN chmod a+rw /workspace/.vscode/settings.json

# 安装所有 npm 依赖
WORKDIR /chataa/code
COPY ./package.json ./package-lock.json /chataa/code/

# 添加额外的 COPY 操作，确保在 npm ci 之前文件存在
# 这主要是为了排除 Docker 构建缓存或 Buildx 行为可能导致的极其罕见的问题
COPY ./package.json ./package-lock.json /chataa/code/

# 调试行：现在这些行在 COPY 之后，所以没问题
RUN ls -la /chataa/code/
RUN cat /chataa/code/package-lock.json | head -n 20 # 只打印前20行，避免输出过多

RUN npm i --production --prefix ${NPM_CONFIG_PREFIX} --loglevel verbose || \
    (echo "npm ci failed. Attempting to print log file..." && \
     cat /root/.npm/_logs/*-debug-0.log && exit 1)
# 复制 browser_server 代码和依赖
COPY ./browser_server /chataa/code/browser_server
# 安装 browser_server 依赖并安装 chromium
# 注意：patchright install chromium 可能需要一些系统库在运行时也存在。
# 确保最终镜像中包含了 chromium 运行所需的依赖。
RUN pip install -r /chataa/code/browser_server/requirements.txt && \
    patchright install chromium --with-deps --no-shell && \
    pip cache purge

# 设置 VSCode Server
ARG RELEASE_TAG="openvscode-server-v1.94.2"
ARG RELEASE_ORG="gitpod-io"

RUN if [ -z "${RELEASE_TAG}" ]; then \
        echo "The RELEASE_TAG build arg must be set." >&2 && \
        exit 1; \
    fi && \
    arch=$(uname -m) && \
    if [ "${arch}" = "x86_64" ]; then \
        arch="x64"; \
    elif [ "${arch}" = "aarch64" ]; then \
        arch="arm64"; \
    elif [ "${arch}" = "armv7l" ]; then \
        arch="armhf"; \
    fi && \
    wget -q https://github.com/${RELEASE_ORG}/openvscode-server/releases/download/${RELEASE_TAG}/${RELEASE_TAG}-linux-${arch}.tar.gz -O /tmp/openvscode-server.tar.gz && \
    tar -xzf /tmp/openvscode-server.tar.gz -C /tmp/ && \
    if [ -d "${OPENVSCODE_SERVER_ROOT}" ]; then rm -rf "${OPENVSCODE_SERVER_ROOT}"; fi && \
    mv /tmp/${RELEASE_TAG}-linux-${arch} ${OPENVSCODE_SERVER_ROOT} && \
    cp ${OPENVSCODE_SERVER_ROOT}/bin/remote-cli/openvscode-server ${OPENVSCODE_SERVER_ROOT}/bin/remote-cli/code && \
    rm -f /tmp/openvscode-server.tar.gz

# ================================================================
# 第二阶段：运行时 (runtime)
# 这个阶段基于一个更小的镜像，只复制必要的运行时文件。
# ================================================================
FROM node:22-slim

# 共享环境变量
ENV MAMBA_ROOT_PREFIX=/chataa/micromamba \
    LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    EDITOR=code \
    VISUAL=code \
    GIT_EDITOR="code --wait" \
    OPENVSCODE_SERVER_ROOT=/chataa/.openvscode-server \
    NPM_CONFIG_PREFIX=/chataa/npm_global \
    SKIP_LLM_API_KEY_VERIFICATION=true

# 设置运行时 PATH，确保 micromamba 环境和 npm 全局包可用
ENV PATH=/chataa/micromamba/envs/chataa/bin:/chataa/npm_global/bin:$PATH

# 安装运行时必需的系统依赖
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        libgl1-mesa-glx \
        libasound2-plugins libatomic1 \
        ca-certificates curl file lsof unzip \
        libnss3 libatk-bridge2.0-0 libgtk-3-0 libxkbcommon0 \
        fonts-liberation \
        xdg-utils && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 创建必要的目录
RUN mkdir -p /chataa \
    /chataa/logs \
    /chataa/code \
    /chataa/code/chataa \
    /workspace/.vscode

# 从 builder 阶段复制 micromamba 环境
COPY --from=builder /chataa/micromamba /chataa/micromamba

# 从 builder 阶段复制 VSCode Server
COPY --from=builder /chataa/.openvscode-server /chataa/.openvscode-server

# 从 builder 阶段复制 npm 全局包
COPY --from=builder /chataa/npm_global /chataa/npm_global

# 从 builder 阶段复制应用程序代码和 browser_server 相关文件
WORKDIR /chataa/code
COPY --from=builder /chataa/code/chataa /chataa/code/chataa
COPY --from=builder /chataa/code/browser_server /chataa/code/browser_server

# 复制 package.json 和 package-lock.json (可选，如果运行时需要)
# 通常运行时不需要，但如果你的应用有特殊需求，可以取消注释
# COPY --from=builder /chataa/code/package.json /chataa/code/package.json
# COPY --from=builder /chataa/code/package-lock.json /chataa/code/package-lock.json

# 调试行：这些行会在文件复制到 /chataa/code 后执行
RUN ls -la /chataa/code/
RUN cat /chataa/code/package-lock.json | head -n 20 # 只打印前20行，避免输出过多


# 复制 VSCode settings.json
COPY --from=builder /workspace/.vscode/settings.json /workspace/.vscode/settings.json
RUN chmod a+rw /workspace/.vscode/settings.json # 确保权限正确

# 设置 action_execution_server.js 的权限
RUN chmod a+rwx /chataa/code/chataa/action_execution_server.js

# 如果有任何需要执行的命令，可以在这里添加，例如启动命令
# CMD ["node", "/chataa/code/chataa/action_execution_server.js"]