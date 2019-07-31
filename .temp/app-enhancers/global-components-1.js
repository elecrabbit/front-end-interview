import Vue from 'vue'
Vue.component("OtherComponent", () => import("/Users/dxy/Documents/dxy-gzh/front-end-interview/docs/.vuepress/components/OtherComponent"))
Vue.component("UpgradePath", () => import("/Users/dxy/Documents/dxy-gzh/front-end-interview/docs/.vuepress/components/UpgradePath"))
Vue.component("svg-container", () => import("/Users/dxy/Documents/dxy-gzh/front-end-interview/docs/.vuepress/components/svg-container"))
Vue.component("demo-1", () => import("/Users/dxy/Documents/dxy-gzh/front-end-interview/docs/.vuepress/components/demo-1"))
Vue.component("Foo-Bar", () => import("/Users/dxy/Documents/dxy-gzh/front-end-interview/docs/.vuepress/components/Foo/Bar"))
Vue.component("Badge", () => import("/Users/dxy/Documents/dxy-gzh/front-end-interview/node_modules/@vuepress/theme-default/global-components/Badge"))


export default {}