const path = require('path');

const { getDirpath } = require('@src/utils/electron');
const WORKSPACE_DIR = getDirpath(process.env.WORKSPACE_DIR || 'workspace');
const resolveWorkspaceDir = async () => {
  return WORKSPACE_DIR;
}

/**
 * restrict filepath to workspace dir
 * @param {string} filepath 
 * @returns {Promise<string>}
 */
const restrictFilepath = async (filepath) => {
  const workspace_dir = await resolveWorkspaceDir();

  const resolvedPath = path.resolve(filepath);
  const resolvedWorkspace = path.resolve(workspace_dir);
  if (resolvedPath.startsWith(resolvedWorkspace)) {
    filepath = resolvedPath;
  } else {
    filepath = path.resolve(workspace_dir, filepath);
  }
  return filepath;
}

module.exports = {
  resolveWorkspaceDir,
  restrictFilepath
}