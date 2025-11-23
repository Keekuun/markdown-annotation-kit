import { h } from "vue";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import InteractiveDemo from "../components/InteractiveDemo.vue";

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/reference/default-theme-layout
    });
  },
  enhanceApp({ app, router, siteData }) {
    // 注册全局组件
    app.component("InteractiveDemo", InteractiveDemo);
  },
} satisfies Theme;

