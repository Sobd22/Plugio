import type { PluginDefinition } from './types';

export class DynamicPluginLoader {
  private static wasmInitialized = false;
  private static esbuildWasm: any = null;
  

  private static async initializeWasm() {
    if (this.wasmInitialized) return;
    
    try {
      const esbuildModule = await import('esbuild-wasm');
      this.esbuildWasm = esbuildModule;
      
      await this.esbuildWasm.initialize({
        wasmURL: 'https://unpkg.com/esbuild-wasm@0.20.2/esbuild.wasm',
        worker: true
      });
      this.wasmInitialized = true;
    } catch (error) {
      console.error('Failed to initialize esbuild WASM:', error);
      throw error;
    }
  }

  static async transpileCode(code: string, filename: string): Promise<string> {
    await this.initializeWasm();
    
    try {
      const result = await this.esbuildWasm.transform(code, {
        loader: filename.endsWith('.tsx') ? 'tsx' : 'ts',
        format: 'esm',
        target: 'es2020',
        jsx: 'transform',
        jsxFactory: 'React.createElement',
        jsxFragment: 'React.Fragment',
        sourcemap: false,
        minify: false
      });
      
      return result.code;
    } catch (error) {
      console.error('Transpilation error:', error);
      throw error;
    }
  }
  

  static async loadPluginFromFile(pluginPath: string): Promise<PluginDefinition | null> {
    try {
      if (!window.electronAPI?.readPluginFile) {
        console.error('Electron API not available for reading plugin files');
        return null;
      }
      
      const fileContent = await window.electronAPI.readPluginFile(pluginPath);
      if (!fileContent) {
        console.error('Failed to read plugin file:', pluginPath);
        return null;
      }
      
      const transpiledCode = await this.transpileCode(fileContent, pluginPath);
      
      const pluginName = this.extractPluginName(pluginPath);
      const moduleUrl = this.createModuleUrl(transpiledCode, pluginName);
      
      const module = await import(moduleUrl);
      
      URL.revokeObjectURL(moduleUrl);
      
      if (module.default && this.isValidPlugin(module.default)) {
        const plugin = module.default as PluginDefinition;
        plugin._pluginPath = pluginPath;
        plugin._pluginName = this.extractPluginName(pluginPath);
        return plugin;
      }
      
      console.error('Invalid plugin structure in:', pluginPath);
      return null;
      
    } catch (error) {
      console.error('Failed to load plugin from file:', pluginPath, error);
      return null;
    }
  }
  

  private static createModuleUrl(code: string, pluginName: string): string {
    const transformedCode = code
      .replace(/import\s+React(?:\s*,\s*{([^}]*)})?\s+from\s+['"]react['"];?/g, (_match, hooks) => {
        if (hooks) {
          return `const React = window.React;\nconst { ${hooks} } = React;`;
        }
        return `const React = window.React;`;
      })
      .replace(/import\s+{\s*([^}]+)\s*}\s+from\s+['"]react['"];?/g, 
        `const { $1 } = React;`)
      .replace(/import\s+{\s*([^}]+)\s*}\s+from\s+['"]@\/core\/definePlugin['"];?/g, 
        `const { $1 } = window.PluginAPI;`)
      .replace(/import\s+{\s*([^}]+)\s*}\s+from\s+['"]\.\/[^'"]+['"];?/g, 
        `const { $1 } = window.PluginAPI;`);
    
    const moduleCode = `
      // Plugin: ${pluginName}
      ${transformedCode}
    `;
    
    
    const blob = new Blob([moduleCode], { type: 'application/javascript' });
    return URL.createObjectURL(blob);
  }
  

  private static isValidPlugin(obj: any): boolean {
    return (
      obj &&
      typeof obj === 'object' &&
      typeof obj.name === 'string' &&
      typeof obj.description === 'string' &&
      Array.isArray(obj.authors)
    );
  }
  

  private static extractPluginName(path: string): string {
    const parts = path.split(/[\\/]/);
    const filename = parts[parts.length - 1];
    return filename.replace(/\.(tsx?|jsx?)$/, '');
  }
  

  static async scanPluginsDirectory(): Promise<string[]> {
    if (!window.electronAPI?.scanPluginsDirectory) {
      console.error('Electron API not available for scanning plugins');
      return [];
    }
    
    try {
      const plugins = await window.electronAPI.scanPluginsDirectory();
      console.log(`Found ${plugins.length} plugins in AppData`);
      return plugins;
    } catch (error) {
      console.error('Failed to scan plugins directory:', error);
      return [];
    }
  }
}
