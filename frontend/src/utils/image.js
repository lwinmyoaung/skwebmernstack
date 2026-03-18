export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  
  // Replace /adminimages/ with /uploads/
  let normalizedPath = path.replace(/^\/adminimages\//, '/uploads/');
  
  // Ensure path starts with a slash
  normalizedPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
  return normalizedPath;
};
