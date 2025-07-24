

const isDev = import.meta.env.DEV;


export const getResourcePath = (resourcePath: string): string => {
  if (isDev) {
    return resourcePath;
  } else {
    const cleanPath = resourcePath.startsWith('/') ? resourcePath.slice(1) : resourcePath;
    return `./${cleanPath}`;
  }
};


export const getIconPath = (iconName: string): string => {
  return getResourcePath(`/icons/${iconName}`);
};
