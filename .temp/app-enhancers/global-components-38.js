import Vue from 'vue'
Vue.component("OtherComponent", () => import("/Users/dxy/Downloads/dxy-gzh/Front-end-Interview/docs/.vuepress/components/OtherComponent"))
Vue.component("demo-1", () => import("/Users/dxy/Downloads/dxy-gzh/Front-end-Interview/docs/.vuepress/components/demo-1"))
Vue.component("svg-container", () => import("/Users/dxy/Downloads/dxy-gzh/Front-end-Interview/docs/.vuepress/components/svg-container"))
Vue.component("UpgradePath", () => import("/Users/dxy/Downloads/dxy-gzh/Front-end-Interview/docs/.vuepress/components/UpgradePath"))
Vue.component("Foo-Bar", () => import("/Users/dxy/Downloads/dxy-gzh/Front-end-Interview/docs/.vuepress/components/Foo/Bar"))
Vue.component("Badge", () => import("/Users/dxy/Downloads/dxy-gzh/Front-end-Interview/node_modules/@vuepress/theme-default/global-components/Badge"))


export default {}