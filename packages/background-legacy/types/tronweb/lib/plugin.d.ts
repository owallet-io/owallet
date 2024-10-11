export default class Plugin {
  constructor(tronWeb?: boolean, options?: {});
  tronWeb: true;
  pluginNoOverride: string[];
  disablePlugins: any;
  register(
    Plugin: any,
    options: any
  ): {
    libs: any[];
    plugged: any[];
    skipped: any[];
  };
}
