import VAnnotator from "./components/VAnnotator.vue";

// 提供 install 函数以便全局注册
export default {
  install(app) {
    app.component("VAnnotator", VAnnotator);
  },
};

// 单独导出组件
export { VAnnotator };
