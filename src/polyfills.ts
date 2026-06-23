/**
 * 此文件包含 Angular 所需的 polyfills，在应用加载前执行。
 * 可在此文件中添加自定义的 polyfills。
 *
 * 文件分为两部分：
 *   1. 浏览器 polyfills：在 ZoneJS 加载前应用，按浏览器分类
 *   2. 应用导入：在 ZoneJS 之后加载的文件，应在主文件之前
 */

/***************************************************************************************************
 * 浏览器 POLYFILLS
 */

/**
 * 默认情况下，zone.js 会修补所有可能的 macroTask 和 DomEvents
 * 用户可以通过设置以下标志来禁用部分 macroTask/DomEvents 修补
 * 因为这些标志需要在 zone.js 加载之前设置，而 webpack
 * 会将 import 放在 bundle 顶部，所以用户需要创建一个单独的文件
 * （例如：zone-flags.ts），将以下标志放入该文件，
 * 然后在导入 zone.js 之前添加以下代码。
 * import './zone-flags';
 *
 * zone-flags.ts 中允许的标志如下。
 *
 * 以下标志适用于所有浏览器。
 *
 * (window as any).__Zone_disable_requestAnimationFrame = true; // 禁用修补 requestAnimationFrame
 * (window as any).__Zone_disable_on_property = true; // 禁用修补 onProperty 如 onclick
 * (window as any).__zone_symbol__UNPATCHED_EVENTS = ['scroll', 'mousemove']; // 禁用修补指定事件名
 *
 *  在 IE/Edge 开发者工具中，addEventListener 也会被 zone.js 包装
 *  使用以下标志，可以绕过 IE/Edge 的 zone.js 修补
 *
 *  (window as any).__Zone_enable_cross_context_check = true;
 *
 */

import './zone-flags';

/***************************************************************************************************
 * Zone JS 是 Angular 自身所需的默认依赖
 */
import 'zone.js';  // Angular CLI 自带


/***************************************************************************************************
 * 应用导入
 */
/**
 * This file includes polyfills needed by Angular and is loaded before the app.
 * You can add your own extra polyfills to this file.
 *
 * This file is divided into 2 sections:
 *   1. Browser polyfills. These are applied before loading ZoneJS and are sorted by browsers.
 *   2. Application imports. Files imported after ZoneJS that should be loaded before your main
 *      file.
 *
 * The current setup is for so-called "evergreen" browsers; the last versions of browsers that
 * automatically update themselves. This includes recent versions of Safari, Chrome (including
 * Opera), Edge on the desktop, and iOS and Chrome on mobile.
 *
 * Learn more in https://angular.io/guide/browser-support
 */

/***************************************************************************************************
 * BROWSER POLYFILLS
 */

/**
 * By default, zone.js will patch all possible macroTask and DomEvents
 * user can disable parts of macroTask/DomEvents patch by setting following flags
 * because those flags need to be set before `zone.js` being loaded, and webpack
 * will put import in the top of bundle, so user need to create a separate file
 * in this directory (for example: zone-flags.ts), and put the following flags
 * into that file, and then add the following code before importing zone.js.
 * import './zone-flags';
 *
 * The flags allowed in zone-flags.ts are listed here.
 *
 * The following flags will work for all browsers.
 *
 * (window as any).__Zone_disable_requestAnimationFrame = true; // disable patch requestAnimationFrame
 * (window as any).__Zone_disable_on_property = true; // disable patch onProperty such as onclick
 * (window as any).__zone_symbol__UNPATCHED_EVENTS = ['scroll', 'mousemove']; // disable patch specified eventNames
 *
 *  in IE/Edge developer tools, the addEventListener will also be wrapped by zone.js
 *  with the following flag, it will bypass `zone.js` patch for IE/Edge
 *
 *  (window as any).__Zone_enable_cross_context_check = true;
 *
 */

import './zone-flags';

/***************************************************************************************************
 * Zone JS is required by default for Angular itself.
 */
import 'zone.js';  // Included with Angular CLI.


/***************************************************************************************************
 * APPLICATION IMPORTS
 */
